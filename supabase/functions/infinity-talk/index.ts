import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('KIE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    const { action, taskId, imageUrl, audioUrl, prompt, resolution = '480p', seed } = await req.json();

    // Create task
    if (action === 'create') {
      if (!imageUrl || !audioUrl || !prompt) {
        throw new Error('Missing required parameters: imageUrl, audioUrl, and prompt are required');
      }

      const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'infinitalk/from-audio',
          input: {
            image_url: imageUrl,
            audio_url: audioUrl,
            prompt: prompt,
            resolution: resolution,
            ...(seed && { seed: seed }),
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.code !== 200) {
        throw new Error(data.message || 'Failed to create Infinity Talk task');
      }

      return new Response(JSON.stringify({
        success: true,
        taskId: data.data.taskId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query task status
    if (action === 'query') {
      if (!taskId) {
        throw new Error('taskId is required for query action');
      }

      const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok || data.code !== 200) {
        throw new Error(data.message || 'Failed to query task status');
      }

      const taskData = data.data;
      let resultUrls: string[] = [];
      
      if (taskData.resultJson) {
        try {
          const result = JSON.parse(taskData.resultJson);
          resultUrls = result.resultUrls || [];
        } catch (e) {
          console.error('Failed to parse resultJson:', e);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        taskId: taskData.taskId,
        state: taskData.state,
        resultUrls: resultUrls,
        failCode: taskData.failCode,
        failMsg: taskData.failMsg,
        costTime: taskData.costTime,
        createTime: taskData.createTime,
        completeTime: taskData.completeTime,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action. Use "create" or "query"');
  } catch (error: unknown) {
    console.error('Error in infinity-talk function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
