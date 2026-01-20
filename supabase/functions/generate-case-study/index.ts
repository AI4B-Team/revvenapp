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
    const { topic, caseStudyType, clientName } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('Generating case study with GPT-4.1...');
    console.log('Topic:', topic);
    console.log('Case Study Type:', caseStudyType);
    console.log('Client Name:', clientName);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    const systemPrompt = `You are an expert case study writer with extensive experience documenting successful projects, implementations, and business outcomes. Generate compelling, professional case studies that showcase achievements and demonstrate value.

Your case studies should include:
1. Executive Summary - Brief overview of the project and key outcomes
2. Client/Company Background - Context about the organization and their situation
3. The Challenge - Clear description of the problem or opportunity that needed to be addressed
4. The Solution - Detailed explanation of how the challenge was addressed
5. Implementation Process - Step-by-step breakdown of how the solution was deployed
6. Results & Metrics - Quantifiable outcomes with specific data points and KPIs
7. Key Learnings - Important insights and takeaways from the project
8. Client Testimonial - A quote or feedback from the client (can be a realistic placeholder)
9. Conclusion - Summary of the success and future outlook

Format the output as clean markdown with proper headers, bullet points, and sections.
Include specific metrics, timelines, and data points to make it realistic and compelling.
Use professional language while keeping it engaging and easy to read.

IMPORTANT: At the end of the case study, include a footer that says:
"Prepared by: Revven Team | ${formattedDate}"

Do NOT use any other team name or date.`;

    const userPrompt = `Create a comprehensive professional case study for: "${topic}"
${caseStudyType ? `Case Study Type: ${caseStudyType}` : ''}
${clientName ? `Client/Company: ${clientName}` : ''}

Please generate a detailed, professional case study with all standard sections. Include realistic metrics, specific outcomes, and compelling storytelling. Make it suitable for marketing materials and business development.`;

    console.log('Calling OpenRouter API for case study text...');
    
    const textResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://revvenapp.lovable.app',
        'X-Title': 'Revven Case Study Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('OpenRouter API error:', textResponse.status, errorText);
      
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`OpenRouter API error: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const caseStudyContent = textData.choices?.[0]?.message?.content || '';

    if (!caseStudyContent) {
      throw new Error('No case study content generated');
    }

    console.log('Case study text generated successfully. Length:', caseStudyContent.length);

    return new Response(JSON.stringify({ 
      content: caseStudyContent,
      title: `Case Study: ${topic}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating case study:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
