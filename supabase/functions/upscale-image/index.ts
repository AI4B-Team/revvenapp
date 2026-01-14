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
    const { image_url, scale_factor = "2" } = await req.json();

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

    // Validate scale factor - topaz supports 2 and 4
    const validScales = ['2', '4'];
    const upscaleFactor = validScales.includes(scale_factor) ? scale_factor : '2';

    console.log('Creating upscale task for:', image_url, 'scale:', upscaleFactor);

    // Create the task using topaz/image-upscale model
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'topaz/image-upscale',
        input: {
          image_url: image_url,
          upscale_factor: upscaleFactor,
        },
      }),
    });

    const createData = await createResponse.json();
    console.log('Create task response:', JSON.stringify(createData));

    if (createData.code !== 200 || !createData.data?.taskId) {
      throw new Error(createData.msg || createData.message || 'Failed to create upscale task');
    }

    const taskId = createData.data.taskId;
    console.log('Task created with ID:', taskId);

    // Poll for completion
    const maxAttempts = 60;
    const pollInterval = 2000;

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
        throw new Error(statusData.msg || statusData.message || 'Failed to query task status');
      }

      const state = statusData.data?.state;

      if (state === 'success') {
        const resultJson = statusData.data?.resultJson;
        console.log('Result JSON:', resultJson);
        
        if (resultJson) {
          try {
            const result = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
            // KIE API returns resultUrls array
            const imageUrl = result.resultUrls?.[0] || result.image?.url || result.url;
            
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
          } catch (parseError) {
            console.error('Failed to parse resultJson:', parseError);
          }
        }
        throw new Error('No image URL in result');
      }

      if (state === 'fail' || state === 'failed') {
        throw new Error(statusData.data?.failMsg || 'Upscale failed');
      }
      
      // Continue polling for pending/processing states
    }

    throw new Error('Task timed out after 2 minutes');

  } catch (error: unknown) {
    console.error('Error in upscale-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
