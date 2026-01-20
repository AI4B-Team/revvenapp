import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { topic, handbookType, targetAudience } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating handbook for topic:', topic);

    // Get current date for footer
    const currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = 2026; // As per project context

    const systemPrompt = `You are a professional handbook writer and organizational documentation expert. Create comprehensive, well-structured handbooks that serve as authoritative reference guides.

Your handbooks should:
- Be professionally formatted with clear hierarchy and organization
- Include practical, actionable guidance with specific examples
- Use consistent terminology and formatting throughout
- Include tables, checklists, and visual aids where appropriate
- Be comprehensive yet accessible to the target audience
- Include relevant policies, procedures, and best practices

STRUCTURE REQUIREMENTS:
1. Title Page with handbook name and version
2. Table of Contents
3. Introduction/Purpose section
4. Core content sections with clear headings
5. Appendices with forms, templates, or references
6. Glossary of terms (if applicable)
7. Version history/changelog placeholder

FORMAT: Use professional Markdown with proper heading hierarchy (##, ###, ####).

FOOTER: Always end with this exact footer:
---
**Prepared by: Revven Team | ${currentMonth} ${currentYear}**`;

    const handbookContext = handbookType ? `Handbook Type: ${handbookType}` : '';
    const audienceContext = targetAudience ? `Target Audience: ${targetAudience}` : '';
    
    const userPrompt = `Create a comprehensive professional handbook on the following topic:

Topic: ${topic}
${handbookContext}
${audienceContext}

Please generate a complete, well-organized handbook with all necessary sections, policies, procedures, and practical guidance. Make it thorough and ready for organizational use.`;

    console.log('Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Revven Handbook Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate handbook content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenRouter response received');

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in response:', data);
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a title from the topic
    const title = `${topic} Handbook`;

    console.log('Handbook generated successfully');

    return new Response(
      JSON.stringify({ 
        content,
        title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-handbook function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
