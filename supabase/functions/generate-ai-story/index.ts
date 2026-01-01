import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL for AI Story generation (production webhook - returns immediately)
const N8N_WEBHOOK_URL = 'https://realcreator.app.n8n.cloud/webhook/b17737cb-65d3-474e-9263-76e21684e9a4';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, voiceId, speed } = await req.json();

    if (!prompt) {
      throw new Error('Story prompt is required');
    }

    console.log('Generating AI story with:', { prompt, voiceId, speed });

    // Call n8n production webhook which returns immediately
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        tts_engine: 'kokoro',
        kokoro_voice: voiceId || 'af_heart',
        kokoro_speed: String(speed || 1.0),
        Story: prompt,
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`Webhook error: ${response.status}`);
    }

    // Production webhook returns immediately - may or may not have video URL yet
    const responseText = await response.text();
    console.log('Webhook response:', responseText);

    let result: Record<string, unknown> = {};
    if (responseText && responseText.trim()) {
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.log('Response is not JSON:', responseText);
      }
    }

    const videoUrl = result.link || result.videoUrl || result.video_url || result.url;
    console.log('Video URL from response:', videoUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: videoUrl || null,
        status: videoUrl ? 'complete' : 'processing',
        message: videoUrl ? 'Video ready!' : 'Video generation started. This may take up to 10 minutes.',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
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