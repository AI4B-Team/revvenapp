import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { messages, conversationId, imageUrl, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    const { data: { user } } = await supabase.auth.getUser();

    console.log('Processing chat request with', messages.length, 'messages, streaming:', stream);

    // Build messages for AI
    const systemPrompt = `You are Cora, a professional AI design assistant specializing in image editing and enhancement. You help users edit their photos with suggestions and creative ideas. Be concise, friendly, and helpful. When users ask to edit images, describe what changes you would make. If they share an image, analyze it and suggest improvements.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => {
        if (msg.image) {
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content || 'Please analyze this image' },
              { type: 'image_url', image_url: { url: msg.image } }
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      })
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_tokens: 1000,
        stream: stream
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
      throw new Error(`AI request failed: ${response.status}`);
    }

    if (stream) {
      // Return streaming response
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
      const assistantMessage = data.choices[0].message.content;

      // Save messages to database if user is authenticated
      if (user && conversationId) {
        const userMessage = messages[messages.length - 1];
        
        await supabase.from('editor_chat_messages').insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content,
          image_url: userMessage.image || null
        });

        await supabase.from('editor_chat_messages').insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantMessage
        });
      }

      return new Response(JSON.stringify({ 
        message: assistantMessage,
        conversationId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in editor-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
