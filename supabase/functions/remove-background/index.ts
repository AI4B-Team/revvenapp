import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const kieApiKey = Deno.env.get('KIE_AI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log('Starting background removal for:', imageUrl);

    // Create the task using BRIA RMBG model
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kieApiKey}`,
      },
      body: JSON.stringify({
        model: 'bria/rmbg-2.0',
        input: {
          image_url: imageUrl,
        },
      }),
    });

    const createData = await createResponse.json();
    console.log('Create task response:', createData);

    if (createData.code !== 200 || !createData.data?.taskId) {
      throw new Error(createData.message || 'Failed to create background removal task');
    }

    const taskId = createData.data.taskId;
    console.log('Task ID:', taskId);

    // Poll for result (max 60 seconds)
    const maxAttempts = 30;
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`,
        },
      });

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempt + 1}:`, statusData.data?.state);

      if (statusData.code !== 200) {
        continue;
      }

      const state = statusData.data?.state;

      if (state === 'success') {
        const resultJson = JSON.parse(statusData.data.resultJson || '{}');
        const resultUrl = resultJson.resultUrls?.[0];

        if (!resultUrl) {
          throw new Error('No result URL in response');
        }

        console.log('Background removal successful:', resultUrl);

        return new Response(JSON.stringify({ 
          success: true,
          imageUrl: resultUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (state === 'fail') {
        throw new Error(statusData.data?.failMsg || 'Background removal failed');
      }

      // Continue polling for waiting, queuing, generating states
    }

    throw new Error('Background removal timed out');

  } catch (error) {
    console.error('Error in remove-background function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
