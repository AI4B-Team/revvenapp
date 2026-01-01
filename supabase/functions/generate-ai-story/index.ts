import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL for AI Story generation (test webhook - waits for completion)
const N8N_WEBHOOK_URL = 'https://realcreator.app.n8n.cloud/webhook-test/b17737cb-65d3-474e-9263-76e21684e9a4';

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

    // Call n8n webhook with the required parameters
    // Using production webhook which processes async
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

    // For production webhook, it may return a job ID or acknowledgment
    const result = await response.json();
    console.log('Story generation started:', result);

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: result.link || result.videoUrl,
        message: result.message || 'Video generation started',
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