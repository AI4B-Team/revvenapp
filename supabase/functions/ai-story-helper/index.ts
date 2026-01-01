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
    const { action, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'auto-prompt') {
      systemPrompt = 'You are a creative story idea generator. Generate a unique, engaging story concept for a short video narration. The story should be emotionally compelling and suitable for a 30-60 second narration.';
      userPrompt = 'Generate a creative and engaging story idea. Return only the story concept in 2-3 sentences, no explanations or formatting.';
    } else if (action === 'enhance') {
      if (!prompt) {
        throw new Error('Prompt is required for enhancement');
      }
      systemPrompt = 'You are an expert story writer. Enhance the given story prompt to make it more vivid, emotional, and engaging for a video narration. Keep it concise but impactful.';
      userPrompt = `Enhance this story prompt to make it more compelling and detailed for a video narration. Keep it under 100 words:\n\n"${prompt}"\n\nReturn only the enhanced prompt, no explanations.`;
    } else {
      throw new Error('Invalid action. Use "auto-prompt" or "enhance"');
    }

    console.log(`Processing ${action} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    console.log(`${action} completed successfully`);

    return new Response(
      JSON.stringify({ result: result.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in ai-story-helper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
