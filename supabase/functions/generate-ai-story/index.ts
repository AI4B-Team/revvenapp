import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL for AI Story generation
const N8N_WEBHOOK_URL = 'https://realcreator.app.n8n.cloud/webhook/b17737cb-65d3-474e-9263-76e21684e9a4';

// Supabase callback URL for n8n to call when video is ready
const CALLBACK_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-story-callback`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, voiceId, speed } = await req.json();

    if (!prompt) {
      throw new Error('Story prompt is required');
    }

    // Get authorization header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating AI story job for user:', user.id);

    // Create job record in database
    const { data: job, error: insertError } = await supabase
      .from('ai_story_jobs')
      .insert({
        user_id: user.id,
        prompt,
        voice_id: voiceId || 'af_heart',
        voice_speed: speed || 1.0,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create job:', insertError);
      throw new Error('Failed to create generation job');
    }

    console.log('Job created:', job.id);

    // Call n8n webhook with job ID for callback
    const requestBody = [{
      tts_engine: 'kokoro',
      kokoro_voice: voiceId || 'af_heart',
      kokoro_speed: String(speed || 1.0),
      Story: prompt,
      job_id: job.id,
      callback_url: CALLBACK_URL,
    }];

    console.log('Sending to n8n:', JSON.stringify(requestBody, null, 2));

    // Fire and forget - don't wait for n8n response
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }).then(res => {
      console.log('n8n webhook response status:', res.status);
    }).catch(err => {
      console.error('n8n webhook error:', err);
    });

    // Update job status to processing
    await supabase
      .from('ai_story_jobs')
      .update({ status: 'processing' })
      .eq('id', job.id);

    // Return job ID immediately
    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        status: 'processing',
        message: 'Video generation started. This may take up to 10 minutes.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in generate-ai-story:', error);
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
