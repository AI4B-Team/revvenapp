import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, stability = 0.5, similarity_boost = 0.75, style = 0, speed: rawSpeed = 1, use_speaker_boost = true } = await req.json();

    // Clamp speed to valid range (0.5 to 2.0) and round to 1 decimal place
    const speed = Math.round(Math.max(0.5, Math.min(2.0, rawSpeed)) * 10) / 10;

    if (!text || !voice) {
      return new Response(
        JSON.stringify({ error: 'Text and voice are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    if (!KIE_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    console.log(`Generating voice preview for voice: ${voice}, text length: ${text.length}, speed: ${speed}`);

    // Call KIE.AI TTS API
    const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'elevenlabs/text-to-speech-multilingual-v2',
        input: {
          text,
          voice,
          stability,
          similarity_boost,
          style,
          speed,
          use_speaker_boost,
          timestamps: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('KIE API error:', errorText);
      throw new Error(`KIE API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Task created:', result);

    if (result.code !== 200) {
      throw new Error(result.message || 'Failed to create TTS task');
    }

    const taskId = result.data.taskId;

    // Poll for completion (TTS is usually fast)
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
          },
        }
      );

      const statusResult = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}, state: ${statusResult.data?.state}`);

      if (statusResult.data?.state === 'success') {
        const resultJson = JSON.parse(statusResult.data.resultJson);
        const audioUrl = resultJson.resultUrls?.[0];
        
        if (audioUrl) {
          return new Response(
            JSON.stringify({ audioUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (statusResult.data?.state === 'fail') {
        throw new Error(statusResult.data.failMsg || 'TTS generation failed');
      }

      attempts++;
    }

    throw new Error('TTS generation timed out');

  } catch (error) {
    console.error('Error in generate-voice-preview:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
