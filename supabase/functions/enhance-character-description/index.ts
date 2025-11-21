import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { description, mode } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'random') {
      systemPrompt = `You are a creative character description generator for AI image generation. Generate ONLY the character description with NO explanations, options, or additional text. Return a single vivid paragraph describing a unique character.`;
      userPrompt = `Generate a random, creative character description for AI image generation. Include physical traits (age, height, build, features), outfit/style, accessories, and unique characteristics. Write it as a single detailed paragraph with vivid imagery and specific details. Return ONLY the description with no preamble, explanation, or extra text.`;
    } else if (mode === 'enhance') {
      systemPrompt = `You are an expert at enhancing character descriptions for AI image generation. Return ONLY the enhanced description with NO explanations, options, or additional text. Transform the input into a vivid, detailed single paragraph.`;
      userPrompt = `Enhance this character description for AI image generation. Transform it into a vivid, detailed paragraph with specific physical attributes, outfit details, and unique characteristics. Return ONLY the enhanced description with no preamble, explanation, or options:\n\n"${description}"`;
    }

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate description');
    }

    const data = await response.json();
    const generatedDescription = data.choices?.[0]?.message?.content;

    if (!generatedDescription) {
      throw new Error('No description generated');
    }

    return new Response(
      JSON.stringify({ description: generatedDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-character-description:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
