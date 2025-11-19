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
    console.log('Received webhook callback');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const contentType = req.headers.get('content-type') || '';
    
    let video_id: string;
    let videoBlob: Blob | null = null;

    // Check if we received binary video data or JSON
    if (contentType.includes('multipart/form-data') || contentType.includes('video/')) {
      console.log('Received binary video data');
      
      // Extract video_id from URL query params
      const url = new URL(req.url);
      video_id = url.searchParams.get('video_id') || '';
      
      if (!video_id) {
        throw new Error('video_id is required in query params when sending binary data');
      }

      // Get the binary video
      videoBlob = await req.blob();
      console.log('Video blob size:', videoBlob.size);

    } else {
      console.log('Received JSON payload');
      const payload = await req.json();
      console.log('Webhook payload:', JSON.stringify(payload, null, 2));

      video_id = payload.video_id;
      
      if (!video_id) {
        throw new Error('video_id is required in webhook payload');
      }

      // If JSON contains a video_url, we can use it directly
      if (payload.video_url) {
        const { error: updateError } = await supabase
          .from('ai_videos')
          .update({
            video_url: payload.video_url,
            status: payload.status || 'completed',
            completed_at: new Date().toISOString(),
            webhook_response: payload,
          })
          .eq('id', video_id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        console.log('Video status updated successfully from JSON:', video_id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Video URL updated successfully',
            video_id 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // If no video data in JSON, mark as failed
      throw new Error('No video data received in webhook callback');
    }

    // Upload binary video to Cloudinary
    const formData = new FormData();
    formData.append('file', videoBlob, `video_${video_id}.mp4`);
    formData.append('upload_preset', 'revven');

    console.log('Uploading video to Cloudinary...');

    const cloudinaryResponse = await fetch(
      'https://api.cloudinary.com/v1_1/dszt275xv/video/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary upload failed:', cloudinaryResponse.status, cloudinaryResponse.statusText);
      throw new Error('Failed to upload video to Cloudinary');
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log('Video uploaded to Cloudinary:', cloudinaryData.secure_url);

    // Update database with Cloudinary URL
    const updateData: any = {
      video_url: cloudinaryData.secure_url,
      status: 'completed',
      completed_at: new Date().toISOString(),
      webhook_response: {
        source: 'video-webhook-callback',
        cloudinary_public_id: cloudinaryData.public_id,
      },
    };

    const { error: updateError } = await supabase
      .from('ai_videos')
      .update(updateData)
      .eq('id', video_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Video status updated successfully:', video_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video status updated successfully',
        video_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in webhook callback:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
