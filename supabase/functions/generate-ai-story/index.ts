import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL for AI Story generation
const N8N_WEBHOOK_URL = 'https://realcreator.app.n8n.cloud/webhook/b17737cb-65d3-474e-9263-76e21684e9a4';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, voiceId, speed, characterName, characterBio, characterImageUrl } = await req.json();

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

    console.log('Creating AI story video for user:', user.id);

    // Create video record in ai_videos table
    const { data: video, error: insertError } = await supabase
      .from('ai_videos')
      .insert({
        user_id: user.id,
        video_topic: prompt,
        video_script: prompt,
        video_style: 'ai-story',
        character_name: characterName || 'AI Character',
        character_bio: characterBio || 'AI-generated character',
        character_image_url: characterImageUrl || '',
        video_generation_model: 'kokoro-tts',
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create video record:', insertError);
      throw new Error('Failed to create video record');
    }

    console.log('Video record created:', video.id);

    // Call n8n webhook with video_id
    const requestBody = [{
      tts_engine: 'kokoro',
      kokoro_voice: voiceId || 'af_heart',
      kokoro_speed: String(speed || 1.0),
      Story: prompt,
      video_id: video.id,
    }];

    console.log('Sending to n8n:', JSON.stringify(requestBody, null, 2));

    // Fire and forget - n8n will call video-webhook-callback when done
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }).then(res => {
      console.log('n8n webhook response status:', res.status);
    }).catch(err => {
      console.error('n8n webhook error:', err);
    });

    // Return video_id immediately (matches n8n response format)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Video generation started',
        video_id: video.id,
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
