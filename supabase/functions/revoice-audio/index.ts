import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const targetLanguage = formData.get('target_language') as string;
    const sourceLang = formData.get('source_language') as string || 'auto';
    const name = formData.get('name') as string || 'Revoiced Audio';

    if (!audioFile) {
      throw new Error('Audio file is required');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    console.log('Starting revoice process:', {
      targetLanguage,
      sourceLang,
      fileName: audioFile.name,
      fileSize: audioFile.size,
    });

    // Get user and create processing record immediately
    const authHeader = req.headers.get('Authorization');
    let supabaseClient: any = null;
    let processingRecordId: string | null = null;
    let userId: string | null = null;
    
    if (authHeader) {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: userData } = await supabaseClient.auth.getUser();
      
      if (userData?.user) {
        userId = userData.user.id;
        // Insert processing record immediately so it shows in gallery
        const { data: insertedRecord, error: insertError } = await supabaseClient.from('user_voices').insert({
          user_id: userData.user.id,
          name: `${name} (${targetLanguage})`,
          url: 'processing',
          duration: 0,
          type: 'revoice',
          status: 'processing',
          prompt: `Translating to ${targetLanguage}...`,
        }).select().single();
        
        if (insertError) {
          console.error('Failed to create processing record:', JSON.stringify(insertError));
        } else if (insertedRecord) {
          processingRecordId = insertedRecord.id;
          console.log('Created processing record:', processingRecordId);
        }
      }
    }

    // Return immediately with processing started response
    // The actual dubbing will happen in background
    const responseData = {
      success: true,
      message: 'Translation started! Check Creations for progress.',
      processingRecordId,
    };

    // Start the background processing using EdgeRuntime.waitUntil
    const backgroundTask = async () => {
      try {
        console.log('Background task started for revoice...');
        
        // Upload audio to Cloudinary first for conversion
        const cloudinaryUploadFormData = new FormData();
        cloudinaryUploadFormData.append('file', audioFile, 'audio.mp4');
        cloudinaryUploadFormData.append('upload_preset', 'revven');
        cloudinaryUploadFormData.append('resource_type', 'video');
        cloudinaryUploadFormData.append('folder', 'temp-audio');
        
        const cloudinaryUploadResponse = await fetch('https://api.cloudinary.com/v1_1/dszt275xv/video/upload', {
          method: 'POST',
          body: cloudinaryUploadFormData,
        });

        if (!cloudinaryUploadResponse.ok) {
          throw new Error(`Failed to upload audio: ${cloudinaryUploadResponse.status}`);
        }

        const cloudinaryUploadResult = await cloudinaryUploadResponse.json();
        console.log('Audio uploaded to Cloudinary:', cloudinaryUploadResult.secure_url);

        // Convert to MP3 via Cloudinary URL transformation
        const originalUrl = cloudinaryUploadResult.secure_url as string;
        const mp3Url = originalUrl.replace(/\.[^/.]+$/, '.mp3');
        
        // Download the converted MP3
        const mp3Response = await fetch(mp3Url);
        let mp3Blob: Blob;
        if (!mp3Response.ok) {
          const originalResponse = await fetch(originalUrl);
          if (!originalResponse.ok) {
            throw new Error('Failed to download audio');
          }
          const originalBuffer = await originalResponse.arrayBuffer();
          mp3Blob = new Blob([originalBuffer], { type: 'audio/mpeg' });
        } else {
          const mp3Buffer = await mp3Response.arrayBuffer();
          mp3Blob = new Blob([mp3Buffer], { type: 'audio/mpeg' });
        }

        // Use Dubbing API for translation
        console.log('Using Dubbing API for translation to:', targetLanguage);
        
        const dubbingFormData = new FormData();
        dubbingFormData.append('file', mp3Blob, 'audio.mp3');
        dubbingFormData.append('target_lang', targetLanguage);
        dubbingFormData.append('name', name);
        
        if (sourceLang !== 'auto') {
          dubbingFormData.append('source_lang', sourceLang);
        }
        
        dubbingFormData.append('highest_resolution', 'true');
        dubbingFormData.append('drop_background_audio', 'false');

        const dubbingResponse = await fetch('https://api.elevenlabs.io/v1/dubbing', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: dubbingFormData,
        });

        if (!dubbingResponse.ok) {
          const errorText = await dubbingResponse.text();
          console.error('ElevenLabs dubbing API error:', dubbingResponse.status, errorText);
          throw new Error(`Dubbing API error: ${dubbingResponse.status} - ${errorText}`);
        }

        const dubbingResult = await dubbingResponse.json();
        console.log('Dubbing project created:', dubbingResult);

        const dubbingId = dubbingResult.dubbing_id;
        if (!dubbingId) {
          throw new Error('No dubbing_id received from ElevenLabs');
        }

        // Poll for completion
        let attempts = 0;
        const maxAttempts = 60;
        let dubbingStatus = 'dubbing';

        while (dubbingStatus === 'dubbing' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const statusResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
            headers: { 'xi-api-key': ELEVENLABS_API_KEY },
          });

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          const statusResult = await statusResponse.json();
          dubbingStatus = statusResult.status;
          console.log(`Dubbing status (attempt ${attempts + 1}):`, dubbingStatus);
          
          if (statusResult.error) {
            throw new Error(`Dubbing failed: ${statusResult.error}`);
          }
          
          attempts++;
        }

        if (dubbingStatus !== 'dubbed') {
          throw new Error(`Dubbing did not complete in time. Status: ${dubbingStatus}`);
        }

        // Get the dubbed audio
        const audioResponse = await fetch(
          `https://api.elevenlabs.io/v1/dubbing/${dubbingId}/audio/${targetLanguage}`,
          { headers: { 'xi-api-key': ELEVENLABS_API_KEY } }
        );

        if (!audioResponse.ok) {
          throw new Error(`Failed to download dubbed audio: ${audioResponse.status}`);
        }

        const finalAudioBuffer = await audioResponse.arrayBuffer();

        // Delete the dubbing project
        try {
          await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
            method: 'DELETE',
            headers: { 'xi-api-key': ELEVENLABS_API_KEY },
          });
          console.log('Dubbing project deleted');
        } catch (deleteError) {
          console.warn('Failed to delete dubbing project:', deleteError);
        }

        // Upload final audio to Cloudinary
        const cloudinaryFormData = new FormData();
        const finalAudioBlob = new Blob([finalAudioBuffer], { type: 'audio/mpeg' });
        cloudinaryFormData.append('file', finalAudioBlob, `revoiced-${targetLanguage}.mp3`);
        cloudinaryFormData.append('upload_preset', 'revven');
        cloudinaryFormData.append('resource_type', 'video');
        cloudinaryFormData.append('folder', 'revoiced-audio');

        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dszt275xv/video/upload', {
          method: 'POST',
          body: cloudinaryFormData,
        });

        if (!cloudinaryResponse.ok) {
          throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status}`);
        }

        const cloudinaryResult = await cloudinaryResponse.json();
        console.log('Audio uploaded to Cloudinary:', cloudinaryResult.secure_url);

        // Update the processing record with completed status
        if (supabaseClient && processingRecordId) {
          await supabaseClient.from('user_voices').update({
            url: cloudinaryResult.secure_url,
            duration: cloudinaryResult.duration || 0,
            status: 'completed',
            prompt: `Translated to ${targetLanguage}`,
            cloudinary_public_id: cloudinaryResult.public_id,
          }).eq('id', processingRecordId);
          console.log('Updated processing record to completed:', processingRecordId);
        }

        console.log('Background revoice task completed successfully');
      } catch (error) {
        console.error('Background revoice error:', error);
        
        // Update the processing record to error status
        if (supabaseClient && processingRecordId) {
          await supabaseClient.from('user_voices').update({
            status: 'error',
            prompt: error instanceof Error ? error.message : 'Unknown error',
          }).eq('id', processingRecordId);
          console.log('Updated processing record to error:', processingRecordId);
        }
      }
    };

    // Use EdgeRuntime.waitUntil to run the background task
    // @ts-ignore - EdgeRuntime is available in Deno Deploy
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(backgroundTask());
    } else {
      // Fallback for local development - run in background without awaiting
      backgroundTask().catch(console.error);
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Revoice error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
