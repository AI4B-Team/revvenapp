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
    const voiceId = formData.get('voice_id') as string;
    const sourceLang = formData.get('source_language') as string || 'auto';
    const name = formData.get('name') as string || 'Revoiced Audio';

    if (!audioFile) {
      throw new Error('Audio file is required');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    console.log('Starting revoice/dubbing process:', {
      targetLanguage,
      voiceId,
      sourceLang,
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type,
    });

    // Convert audio to a supported format (MP3) using Cloudinary
    // First upload to Cloudinary which will handle format conversion
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    const cloudinaryUploadFormData = new FormData();
    cloudinaryUploadFormData.append('file', `data:${audioFile.type};base64,${audioBase64}`);
    cloudinaryUploadFormData.append('upload_preset', 'revven');
    cloudinaryUploadFormData.append('resource_type', 'video');
    cloudinaryUploadFormData.append('folder', 'temp-audio');
    cloudinaryUploadFormData.append('format', 'mp3'); // Convert to MP3
    
    const cloudinaryUploadResponse = await fetch('https://api.cloudinary.com/v1_1/dszt275xv/video/upload', {
      method: 'POST',
      body: cloudinaryUploadFormData,
    });

    if (!cloudinaryUploadResponse.ok) {
      const errorText = await cloudinaryUploadResponse.text();
      console.error('Cloudinary temp upload error:', cloudinaryUploadResponse.status, errorText);
      throw new Error(`Failed to convert audio format: ${cloudinaryUploadResponse.status}`);
    }

    const cloudinaryUploadResult = await cloudinaryUploadResponse.json();
    console.log('Audio converted to MP3:', cloudinaryUploadResult.secure_url);

    // Download the converted MP3 from Cloudinary
    const mp3Response = await fetch(cloudinaryUploadResult.secure_url);
    if (!mp3Response.ok) {
      throw new Error('Failed to download converted audio');
    }
    const mp3Buffer = await mp3Response.arrayBuffer();
    const mp3Blob = new Blob([mp3Buffer], { type: 'audio/mpeg' });

    // Create dubbing project using ElevenLabs Dubbing API with converted MP3
    const dubbingFormData = new FormData();
    dubbingFormData.append('file', mp3Blob, 'audio.mp3');
    dubbingFormData.append('target_lang', targetLanguage);
    dubbingFormData.append('name', name);
    
    if (sourceLang !== 'auto') {
      dubbingFormData.append('source_lang', sourceLang);
    }
    
    // Use highest quality mode
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

    // Poll for completion (dubbing can take time)
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let dubbingStatus = 'dubbing';

    while (dubbingStatus === 'dubbing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Status check error:', statusResponse.status, errorText);
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
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('Audio download error:', audioResponse.status, errorText);
      throw new Error(`Failed to download dubbed audio: ${audioResponse.status}`);
    }

    const dubbedAudioBuffer = await audioResponse.arrayBuffer();

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    const dubbedAudioBlob = new Blob([dubbedAudioBuffer], { type: 'audio/mpeg' });
    cloudinaryFormData.append('file', dubbedAudioBlob, `revoiced-${targetLanguage}.mp3`);
    cloudinaryFormData.append('upload_preset', 'revven');
    cloudinaryFormData.append('resource_type', 'video'); // Cloudinary uses 'video' for audio
    cloudinaryFormData.append('folder', 'revoiced-audio');

    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dszt275xv/video/upload', {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary upload error:', cloudinaryResponse.status, errorText);
      throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status}`);
    }

    const cloudinaryResult = await cloudinaryResponse.json();
    console.log('Audio uploaded to Cloudinary:', cloudinaryResult.secure_url);

    // Get user and save to database
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('user_voices').insert({
          user_id: user.id,
          name: `${name} (${targetLanguage})`,
          url: cloudinaryResult.secure_url,
          duration: cloudinaryResult.duration || 0,
          type: 'revoice',
          status: 'completed',
          prompt: `Translated to ${targetLanguage}`,
          cloudinary_public_id: cloudinaryResult.public_id,
        });
      }
    }

    // Delete the dubbing project to free resources
    try {
      await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });
      console.log('Dubbing project deleted');
    } catch (deleteError) {
      console.warn('Failed to delete dubbing project:', deleteError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
        publicId: cloudinaryResult.public_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Revoice error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
