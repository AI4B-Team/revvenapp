import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL for AI video generation
const N8N_WEBHOOK_URL = 'https://realcreator.app.n8n.cloud/webhook/b17737cb-65d3-474e-9263-76e21684e9a4';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      voiceId, 
      speed,
      model,
      character,
      videoStyle,
      videoTopic
    } = await req.json();

    if (!prompt) {
      throw new Error('Story prompt is required');
    }

    console.log('Generating AI video with:', { 
      prompt, 
      model: model || 'Seedance 1.0',
      character,
      videoStyle,
      videoTopic 
    });

    // Build request body matching n8n webhook expected format
    const requestBody = {
      body: {
        character: {
          name: character?.name || 'AI Character',
          image_url: character?.image_url || '',
          bio: character?.bio || 'An AI-generated character'
        },
        video: {
          model: model || 'Seedance 1.0',
          script: prompt,
          topic: videoTopic || prompt.substring(0, 100),
          style: videoStyle || 'Cinematic'
        }
      }
    };

    console.log('Sending to n8n:', JSON.stringify(requestBody, null, 2));

    // Call n8n production webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`Webhook error: ${response.status}`);
    }

    // Production webhook returns immediately
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

    // Check for video URL in various possible response formats
    let videoUrl = result.video_url || result.videoUrl || result.link || result.url;
    
    // Check nested data object
    if (!videoUrl && result.data) {
      const data = result.data as Record<string, unknown>;
      videoUrl = data.video_url || data.videoUrl;
      
      // Check for resultUrls array
      if (!videoUrl && Array.isArray(data.resultUrls) && data.resultUrls.length > 0) {
        videoUrl = data.resultUrls[0];
      }
    }
    
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
