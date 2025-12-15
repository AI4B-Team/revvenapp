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
    const { text, duration_seconds, loop, prompt_influence, output_format } = await req.json();
    
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text description is required');
    }

    console.log('Creating sound effect task with text:', text.substring(0, 100));

    // Create task
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'elevenlabs/sound-effect-v2',
        input: {
          text: text.substring(0, 5000),
          loop: loop ?? false,
          duration_seconds: duration_seconds ?? undefined,
          prompt_influence: prompt_influence ?? 0.3,
          output_format: output_format ?? 'mp3_44100_128',
        },
      }),
    });

    const createResult = await createResponse.json();
    console.log('Create task response:', JSON.stringify(createResult));

    if (createResult.code !== 200 || !createResult.data?.taskId) {
      throw new Error(`Failed to create task: ${createResult.message || 'Unknown error'}`);
    }

    const taskId = createResult.data.taskId;
    console.log('Task created with ID:', taskId);

    // Poll for completion
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      });

      const statusResult = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}, state:`, statusResult.data?.state);

      if (statusResult.code !== 200) {
        console.error('Status check failed:', statusResult);
        attempts++;
        continue;
      }

      const state = statusResult.data?.state;

      if (state === 'success') {
        const resultJson = statusResult.data?.resultJson;
        if (resultJson) {
          try {
            const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
            const audioUrl = parsed.resultUrls?.[0];
            
            if (audioUrl) {
              console.log('Sound effect generated successfully:', audioUrl);
              return new Response(JSON.stringify({ 
                success: true, 
                audioUrl,
                taskId 
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (parseError) {
            console.error('Error parsing resultJson:', parseError);
          }
        }
        throw new Error('No audio URL in result');
      }

      if (state === 'fail') {
        throw new Error(`Generation failed: ${statusResult.data?.failMsg || 'Unknown error'}`);
      }

      attempts++;
    }

    throw new Error('Generation timed out after 60 seconds');

  } catch (error) {
    console.error('Sound effect generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
