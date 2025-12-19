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
    const { image_url, scale_factor = 2 } = await req.json();

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'image_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    console.log('Creating upscale task for:', image_url);

    // Create the task using recraft/crisp-upscale model
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'recraft/crisp-upscale',
        input: {
          image: image_url,
        },
      }),
    });

    const createData = await createResponse.json();
    console.log('Create task response:', createData);

    if (createData.code !== 200 || !createData.data?.taskId) {
      throw new Error(createData.message || 'Failed to create upscale task');
    }

    const taskId = createData.data.taskId;
    console.log('Task created with ID:', taskId);

    // Poll for completion
    const maxAttempts = 60;
    const pollInterval = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempt + 1}:`, statusData.data?.state);

      if (statusData.code !== 200) {
        throw new Error(statusData.message || 'Failed to query task status');
      }

      const state = statusData.data?.state;

      if (state === 'success') {
        const resultJson = statusData.data?.resultJson;
        if (resultJson) {
          const result = JSON.parse(resultJson);
          const imageUrl = result.resultUrls?.[0] || result.image?.url;
          
          if (imageUrl) {
            console.log('Upscale completed:', imageUrl);
            return new Response(
              JSON.stringify({ 
                success: true, 
                image_url: imageUrl,
                taskId: taskId 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        throw new Error('No image URL in result');
      }

      if (state === 'fail') {
        throw new Error(statusData.data?.failMsg || 'Upscale failed');
      }
    }

    throw new Error('Task timed out after 3 minutes');

  } catch (error: unknown) {
    console.error('Error in upscale-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
