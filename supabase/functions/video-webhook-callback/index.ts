import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWebhookUrl, logWebhookCallback, getClientIp } from "../_shared/webhook-security.ts";

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
    const url = new URL(req.url);
    
    // Audit logging
    const clientIp = getClientIp(req);
    
    // Check if this is a KIE.AI callback (source=kie in query params)
    const source = url.searchParams.get('source');
    const videoIdFromQuery = url.searchParams.get('videoId') || url.searchParams.get('video_id');
    
    if (source === 'kie') {
      console.log('KIE.AI callback detected');
      
      const rawBody = await req.text();
      const payload = JSON.parse(rawBody);
      
      // Audit logging
      logWebhookCallback('video-webhook-callback/kie', payload, clientIp);
      
      const videoId = videoIdFromQuery;
      if (!videoId) {
        throw new Error('videoId is required in query params for KIE.AI callbacks');
      }

      // Verify the video exists and is in pending/processing state
      const { data: existingVideo, error: findError } = await supabase
        .from('ai_videos')
        .select('id, status, user_id')
        .eq('id', videoId)
        .single();

      if (findError || !existingVideo) {
        console.error('Video not found:', videoId);
        throw new Error('Video not found - invalid callback');
      }

      if (existingVideo.status !== 'pending' && existingVideo.status !== 'processing' && existingVideo.status !== 'generating') {
        console.log('Video already processed:', existingVideo.status);
        return new Response(
          JSON.stringify({ success: true, message: 'Video already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // KIE.AI success callback format
      if (payload.code === 200 && payload.data?.state === 'success') {
        // Parse resultJson to get the video URL
        let videoUrl = null;
        try {
          const resultJson = JSON.parse(payload.data.resultJson || '{}');
          videoUrl = resultJson.resultUrls?.[0];
        } catch (e) {
          console.error('Error parsing resultJson:', e);
        }

        if (!videoUrl) {
          throw new Error('No video URL found in KIE.AI callback');
        }

        console.log('KIE.AI video URL:', videoUrl);

        // Validate the URL before uploading
        const validation = await validateWebhookUrl(videoUrl, 'video');
        if (!validation.valid) {
          console.error('URL validation failed:', validation.error);
          throw new Error(`URL validation failed: ${validation.error}`);
        }

        // Upload video to Cloudinary using URL-based upload (avoids memory issues)
        const formData = new FormData();
        formData.append('file', videoUrl);
        formData.append('upload_preset', 'revven');
        formData.append('resource_type', 'video');

        console.log('Uploading video to Cloudinary from URL...');

        const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/dszt275xv/video/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        let finalVideoUrl = videoUrl;
        let cloudinaryPublicId = null;

        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();
          console.log('Video uploaded to Cloudinary:', cloudinaryData.secure_url);
          finalVideoUrl = cloudinaryData.secure_url;
          cloudinaryPublicId = cloudinaryData.public_id;
        } else {
          console.warn('Cloudinary upload failed, using original KIE.AI URL');
        }

        // Update database with video URL
        const { error: updateError } = await supabase
          .from('ai_videos')
          .update({
            video_url: finalVideoUrl,
            status: 'completed',
            completed_at: new Date().toISOString(),
            webhook_response: {
              ...payload.data,
              cloudinary_public_id: cloudinaryPublicId,
              source: 'kie'
            },
          })
          .eq('id', videoId);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        console.log('KIE.AI video status updated successfully:', videoId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'KIE.AI video processed successfully',
            videoId 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // KIE.AI failure callback
      if (payload.code !== 200 || payload.data?.state === 'fail') {
        const errorMessage = payload.data?.failMsg || payload.msg || 'KIE.AI generation failed';
        console.error('KIE.AI generation failed:', errorMessage);

        await supabase
          .from('ai_videos')
          .update({
            status: 'error',
            error_message: errorMessage,
            webhook_response: payload.data || payload,
          })
          .eq('id', videoId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage,
            videoId 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 // Return 200 to acknowledge receipt
          }
        );
      }
    }

    // Original n8n webhook flow for AI Story jobs
    let job_id: string;
    let videoBlob: Blob | null = null;

    // Check if we received binary video data or JSON
    if (contentType.includes('multipart/form-data') || contentType.includes('video/')) {
      console.log('Received binary video data');
      
      // Extract job_id from URL query params
      job_id = url.searchParams.get('job_id') || videoIdFromQuery || '';
      
      if (!job_id) {
        throw new Error('job_id is required in query params when sending binary data');
      }

      // Verify the job exists and is in pending state
      const { data: existingJob, error: findError } = await supabase
        .from('ai_story_jobs')
        .select('id, status, user_id')
        .eq('id', job_id)
        .single();

      if (findError || !existingJob) {
        console.error('Job not found:', job_id);
        throw new Error('Job not found - invalid callback');
      }

      if (existingJob.status !== 'pending' && existingJob.status !== 'processing') {
        console.log('Job already processed:', existingJob.status);
        return new Response(
          JSON.stringify({ success: true, message: 'Job already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Get the binary video
      videoBlob = await req.blob();
      console.log('Video blob size:', videoBlob.size);
      
      // Audit log for binary upload
      logWebhookCallback('video-webhook-callback/binary', { job_id, size: videoBlob.size }, clientIp);

    } else {
      console.log('Received JSON payload');
      const rawBody = await req.text();
      const payload = JSON.parse(rawBody);
      
      // Audit logging
      logWebhookCallback('video-webhook-callback/json', payload, clientIp);

      job_id = payload.job_id || payload.video_id;
      
      if (!job_id) {
        throw new Error('job_id is required in webhook payload');
      }

      // Verify the job exists and is in pending state
      const { data: existingJob, error: findError } = await supabase
        .from('ai_story_jobs')
        .select('id, status, user_id')
        .eq('id', job_id)
        .single();

      if (findError || !existingJob) {
        console.error('Job not found:', job_id);
        throw new Error('Job not found - invalid callback');
      }

      if (existingJob.status !== 'pending' && existingJob.status !== 'processing') {
        console.log('Job already processed:', existingJob.status);
        return new Response(
          JSON.stringify({ success: true, message: 'Job already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // If JSON contains a video_url, validate and use it directly
      if (payload.video_url) {
        // Validate the URL before using
        const validation = await validateWebhookUrl(payload.video_url, 'video');
        if (!validation.valid) {
          console.error('URL validation failed:', validation.error);
          throw new Error(`URL validation failed: ${validation.error}`);
        }

        const { error: updateError } = await supabase
          .from('ai_story_jobs')
          .update({
            video_url: payload.video_url,
            status: payload.status || 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job_id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        console.log('Story job status updated successfully from JSON:', job_id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Video URL updated successfully',
            job_id 
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
    formData.append('file', videoBlob, `story_${job_id}.mp4`);
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

    // Update ai_story_jobs table with Cloudinary URL
    const { error: updateError } = await supabase
      .from('ai_story_jobs')
      .update({
        video_url: cloudinaryData.secure_url,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', job_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Story job status updated successfully:', job_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video status updated successfully',
        job_id 
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
