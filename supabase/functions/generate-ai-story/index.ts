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
    // Using test webhook which waits for completion
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 540000); // 9 minute timeout

    try {
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n webhook error:', errorText);
        throw new Error(`Webhook error: ${response.status}`);
      }

      // Handle potentially empty response
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from video generation service. Please try again.');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format from video generation service');
      }

      console.log('Story generated successfully:', result);

      const videoUrl = result.link || result.videoUrl || result.video_url || result.url;
      
      if (!videoUrl) {
        console.error('No video URL in response:', result);
        throw new Error('Video generation completed but no URL was returned');
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          videoUrl: videoUrl,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Video generation timed out. The process may still be running - please check back later.');
      }
      throw fetchError;
    }
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