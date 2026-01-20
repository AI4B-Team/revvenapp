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
    const { topic, proposalType, clientName } = await req.json();

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

    console.log('Generating proposal with GPT-4.1...');
    console.log('Topic:', topic);
    console.log('Proposal Type:', proposalType);
    console.log('Client Name:', clientName);

    // Generate comprehensive proposal text using GPT-4.1 via OpenRouter
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    const systemPrompt = `You are an expert proposal writer with decades of experience creating winning proposals for businesses, freelancers, and agencies. Generate professional, compelling proposals that are persuasive and well-structured.

Your proposals should include:
1. Executive Summary - A compelling overview that captures the essence of the proposal and value proposition
2. Understanding of Needs - Demonstrate understanding of the client's challenges and goals
3. Proposed Solution - Detailed description of what you're proposing to deliver
4. Scope of Work - Clear breakdown of deliverables, milestones, and timeline
5. Methodology/Approach - How you will execute the project
6. Team/Qualifications - Why you're the right choice for this project
7. Investment/Pricing - Clear pricing structure with options if applicable
8. Terms & Conditions - Key terms, payment schedule, and next steps
9. Call to Action - Clear next steps for the client

Format the output as clean markdown with proper headers, bullet points, and sections.
Include specific timelines, pricing examples, and deliverables to make it realistic and professional.
Make it persuasive, professional, and ready to send to clients.

IMPORTANT: At the end of the proposal, include a footer that says:
"Prepared by: Revven Team | ${formattedDate}"

Do NOT use any other team name or date.`;

    const userPrompt = `Create a comprehensive professional proposal for: "${topic}"
${proposalType ? `Proposal Type: ${proposalType}` : ''}
${clientName ? `Client/Recipient: ${clientName}` : ''}

Please generate a detailed, professional proposal with all standard sections. Include realistic pricing options, timelines, and deliverables. Make it persuasive and ready to present to potential clients.`;

    console.log('Calling OpenRouter API for proposal text...');
    
    const textResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://revvenapp.lovable.app',
        'X-Title': 'Revven Proposal Generator',
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
    const proposalContent = textData.choices?.[0]?.message?.content || '';

    if (!proposalContent) {
      throw new Error('No proposal content generated');
    }

    console.log('Proposal text generated successfully. Length:', proposalContent.length);

    return new Response(JSON.stringify({ 
      content: proposalContent,
      title: `Proposal: ${topic}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating proposal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
