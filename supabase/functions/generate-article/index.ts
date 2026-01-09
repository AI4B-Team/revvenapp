import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      articleType, 
      topic, 
      tones, 
      styles, 
      length, 
      language,
      seoMode,
      includeMeta,
      noDirectAddress
    } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the system prompt based on article type
    const systemPrompts: Record<string, string> = {
      'Blog Post': `You are an expert blog writer who creates engaging, well-structured blog posts. You write content that connects with readers through stories, insights, and practical tips. Your writing is SEO-optimized with proper headings, meta descriptions, and keyword integration.`,
      'Ultimate Guide': `You are an expert content writer specializing in comprehensive guides. You create in-depth, authoritative content that covers topics from basics to advanced techniques. Your guides are well-organized, practical, and accessible to readers of all knowledge levels.`,
      'Listicle': `You are a viral content specialist who creates compelling listicles that hook readers instantly. Each item provides unique value, actionable insights, and memorable takeaways. Your content is optimized for scanning and social sharing.`,
      'Thought Leadership': `You are a thought leadership content strategist. You craft opinion pieces that establish authority, spark discussion, and position brands as industry leaders. Your writing presents clear theses supported by evidence and compelling arguments.`,
      'Case Study': `You are a business case study writer. You create compelling narratives that showcase real results, challenges overcome, and lessons learned. Your case studies follow a problem-solution-results framework with concrete data and outcomes.`,
      'Press Article': `You are a professional journalist who writes timely, objective news articles. You follow journalistic standards, leading with the most important information, including relevant quotes and data, and providing context and background.`,
    };

    const toneStr = tones?.length ? tones.join(', ') : 'Neutral';
    const styleStr = styles?.length ? styles.join(', ') : 'Professional';
    
    // Extract word count from length preset
    const wordCountMap: Record<string, string> = {
      'Short (400-700)': '400-700 words',
      'Medium (1000-1500)': '1000-1500 words',
      'Long (2000-3000)': '2000-3000 words',
    };
    const targetWords = wordCountMap[length] || '1000-1500 words';

    // Build constraints
    const constraints: string[] = [];
    if (seoMode) {
      constraints.push('Optimize for SEO: use keyword-rich headings, internal structure with H2/H3 tags, and natural keyword placement throughout.');
    }
    if (includeMeta) {
      constraints.push('Include at the top: SEO title (under 60 chars), meta description (under 160 chars), and 5-8 suggested keywords.');
    }
    if (noDirectAddress) {
      constraints.push('Avoid phrases like "welcome" or "get ready" and minimize direct audience address like "you" where possible.');
    }

    const systemPrompt = systemPrompts[articleType] || systemPrompts['Blog Post'];

    const userPrompt = `Write a ${articleType.toLowerCase()} about: "${topic}"

**Tone:** ${toneStr}
**Style:** ${styleStr}
**Target Length:** ${targetWords}
**Language:** ${language}

**Requirements:**
- Start with a compelling hook that grabs attention immediately
- Use clear sections with descriptive headings (use markdown ## for H2, ### for H3)
- Include concrete examples, data points, and actionable insights
- Add bullet points and numbered lists for scanability
- Include at least one framework, checklist, or step-by-step process
- End with a strong summary and clear next steps or call-to-action
- Use short paragraphs (2-3 sentences max) for readability

**Constraints:**
${constraints.length > 0 ? constraints.map(c => `- ${c}`).join('\n') : '- None specified'}

Write the complete article now in markdown format:`;

    console.log('Generating article for topic:', topic);

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
        stream: true,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate-article function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
