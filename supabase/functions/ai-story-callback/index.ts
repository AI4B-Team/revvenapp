import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received callback:', JSON.stringify(body, null, 2));

    // Extract job_id and video_url from n8n response
    // Handle various response formats
    const jobId = body.job_id || body.jobId;
    const videoUrl = body.video_url || body.videoUrl || body.link || body.url;
    const error = body.error || body.error_message;

    if (!jobId) {
      throw new Error('job_id is required in callback');
    }

    // Create Supabase client with service role for updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Updating job:', jobId, 'with video URL:', videoUrl);

    // Update job with result
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (error) {
      updateData.status = 'failed';
      updateData.error_message = error;
    } else if (videoUrl) {
      updateData.status = 'completed';
      updateData.video_url = videoUrl;
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.status = 'failed';
      updateData.error_message = 'No video URL returned from generation service';
    }

    const { error: updateError } = await supabase
      .from('ai_story_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update job:', updateError);
      throw new Error('Failed to update job status');
    }

    console.log('Job updated successfully:', jobId, updateData.status);

    return new Response(
      JSON.stringify({ success: true, jobId, status: updateData.status }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in ai-story-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
