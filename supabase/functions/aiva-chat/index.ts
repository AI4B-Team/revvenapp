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
    const { messages, context, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AIVA chat request with', messages.length, 'messages, context:', context);

    // Context-aware system prompts based on the current app
    const contextPrompts: Record<string, string> = {
      '/create': `You are AIVA, an expert AI assistant for the Create Studio. You help users with:
- Generating images, videos, and audio content
- Writing prompts for AI generation
- Choosing the right models and settings
- Creative suggestions and ideas
- Content optimization tips
Be concise, creative, and helpful. Suggest specific prompts when relevant.`,
      '/edit': `You are AIVA, an expert AI assistant for video editing. You help users with:
- Video editing techniques and tips
- Adding effects, transitions, and captions
- Audio synchronization and music selection
- Export settings and formats
Be technical but accessible, provide step-by-step guidance.`,
      '/transcribe': `You are AIVA, an expert AI assistant for transcription. You help users with:
- Transcription accuracy and speaker identification
- Editing and formatting transcripts
- Generating summaries and highlights
- Export options and integrations
Be precise and helpful with text-related tasks.`,
      '/blog-writer': `You are AIVA, an expert AI assistant for blog writing. You help users with:
- Blog post structure and outlines
- SEO optimization and keywords
- Engaging titles and introductions
- Content ideas and research
Be creative and SEO-aware in your suggestions.`,
      '/ai-responder': `You are an AI auto-responder assistant. Your role is to:
- Respond naturally and conversationally to messages
- Be helpful, friendly, and professional
- Keep responses concise and to the point
- Use the knowledge base information provided to give accurate answers
Answer as if you're texting - keep it natural and brief.`,
      default: `You are AIVA, a versatile AI assistant for the Revven creative platform. You help users with:
- Content creation across all media types
- Creative ideas and inspiration
- Technical guidance and best practices
- Workflow optimization
Be friendly, helpful, and creative in all responses.`
    };

    // Check if a custom system prompt is already provided in messages
    const hasCustomSystemPrompt = messages.some((msg: { role: string }) => msg.role === 'system');
    
    const systemPrompt = contextPrompts[context] || contextPrompts.default;

    const aiMessages = hasCustomSystemPrompt 
      ? messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content
        }))
      : [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          }))
        ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: stream
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
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
      const assistantMessage = data.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({ 
        message: assistantMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in aiva-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
