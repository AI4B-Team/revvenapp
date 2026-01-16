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
    const { prompt, type = 'content', stream = true } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('Generating content with Claude Sonnet 4, type:', type, 'prompt:', prompt.substring(0, 100));

    // System prompts based on content type
    const systemPrompts: Record<string, string> = {
      content: `You are an expert creative writer and content creator. Generate high-quality, engaging content based on user requests.
      
Your writing should be:
- Compelling and well-structured
- Appropriate for the requested format (story, article, post, etc.)
- Creative and original
- Free of errors

Format your response with proper paragraphs and structure. Use markdown formatting where appropriate.`,

      document: `You are a professional document writer. Generate well-structured, formal documents based on user requests.

Your documents should be:
- Professional and well-organized
- Clear and concise
- Properly formatted with headings and sections
- Appropriate for business or official use

Use markdown formatting for structure (headings, lists, etc.).`,

      story: `You are a master storyteller. Create engaging, immersive stories with vivid descriptions and compelling narratives.

Your stories should have:
- Engaging plots and characters
- Rich, descriptive language
- Proper story structure (beginning, middle, end)
- Emotional depth and creativity

Format with proper paragraphs for readability.`,

      article: `You are an expert journalist and article writer. Create informative, well-researched articles.

Your articles should:
- Have a compelling headline and introduction
- Present information clearly and logically
- Include relevant details and examples
- Conclude with key takeaways

Use markdown formatting for structure.`,

      blog: `You are a popular blog writer. Create engaging, conversational blog posts that connect with readers.

Your blog posts should:
- Have a catchy title and hook
- Be conversational yet informative
- Include personal insights and examples
- End with a call to action or thought-provoking conclusion

Format with proper headings and paragraphs.`
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.content;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://revvenapp.lovable.app',
        'X-Title': 'AIVA Content Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.8,
        stream: stream
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    if (stream) {
      // Stream the response directly
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    } else {
      // Non-streaming response
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
