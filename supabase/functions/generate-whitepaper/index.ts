import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, industry, targetAudience } = await req.json();

    if (!topic) {
      throw new Error('Topic is required');
    }

    console.log('Generating whitepaper for topic:', topic);

    const systemPrompt = `You are an expert technical writer and industry analyst specializing in creating comprehensive, authoritative whitepapers. Your whitepapers are known for:
- Deep technical insights backed by research
- Clear, professional writing style
- Logical structure with executive summary
- Data-driven arguments and industry statistics
- Actionable recommendations

Create whitepapers that establish thought leadership and provide genuine value to readers.`;

    const userPrompt = `Create a comprehensive, professional whitepaper on the following topic:

**Topic:** ${topic}
${industry ? `**Industry:** ${industry}` : ''}
${targetAudience ? `**Target Audience:** ${targetAudience}` : ''}

Structure the whitepaper with the following sections:

1. **Executive Summary** - A concise overview of key findings and recommendations (200-300 words)

2. **Introduction** - Context, problem statement, and whitepaper objectives

3. **Background & Market Analysis** - Current state of the industry, key trends, and challenges

4. **Key Findings** - In-depth analysis with supporting data points and insights (this should be the longest section)

5. **Solutions & Recommendations** - Practical strategies and actionable recommendations

6. **Implementation Roadmap** - Step-by-step guide for implementation

7. **Conclusion** - Summary of key takeaways and call to action

8. **References** - List of sources (you can use placeholder citations)

Requirements:
- Write in a professional, authoritative tone
- Include relevant statistics and data points (use realistic but placeholder data if needed)
- Make it comprehensive (aim for 3000-4000 words)
- Use clear headings and subheadings
- Include bullet points and numbered lists where appropriate
- Add callout boxes for key insights (use > blockquote format)

Format the whitepaper using Markdown with proper headings (##, ###), lists, and emphasis.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
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
      throw new Error(`Whitepaper generation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Whitepaper generation completed. Content length:', content.length);

    return new Response(JSON.stringify({ 
      content: content.trim(),
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-whitepaper function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
