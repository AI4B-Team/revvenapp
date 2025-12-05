import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, sourceImage, editInstruction } = await req.json();

    if (!prompt && !editInstruction) {
      throw new Error('Prompt or edit instruction is required');
    }

    console.log('Processing image generation/edit request');

    // Build the message content
    const messageContent: any[] = [];
    
    if (sourceImage) {
      // Image editing mode
      messageContent.push({
        type: 'text',
        text: editInstruction || prompt || 'Edit this image'
      });
      messageContent.push({
        type: 'image_url',
        image_url: { url: sourceImage }
      });
    } else {
      // Image generation mode
      messageContent.push({
        type: 'text',
        text: prompt
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text and image from response
    const textContent = data.choices?.[0]?.message?.content || '';
    const images = data.choices?.[0]?.message?.images || [];
    const generatedImageUrl = images[0]?.image_url?.url || null;

    console.log('Image generation completed:', generatedImageUrl ? 'Image generated' : 'No image');

    return new Response(JSON.stringify({ 
      message: textContent,
      imageUrl: generatedImageUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in editor-generate-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
