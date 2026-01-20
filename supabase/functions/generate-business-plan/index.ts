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
    const { topic, businessType, industry } = await req.json();

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating business plan with GPT-4.1...');
    console.log('Topic:', topic);
    console.log('Business Type:', businessType);
    console.log('Industry:', industry);

    // Step 1: Generate comprehensive business plan text using GPT-4.1 via OpenRouter
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    const systemPrompt = `You are an expert business consultant and plan writer with decades of experience creating successful business plans for startups and established companies. Generate professional, comprehensive business plans that are ready for investors and stakeholders.

Your business plans should include:
1. Executive Summary - A compelling overview that captures the essence of the business
2. Company Description - Mission, vision, and core values
3. Market Analysis - Industry overview, target market, and competitive analysis
4. Organization & Management - Team structure and key personnel
5. Products/Services - Detailed description of offerings
6. Marketing & Sales Strategy - Go-to-market approach
7. Financial Projections - Revenue forecasts, costs, and key metrics (provide sample numbers)
8. Funding Requirements - If applicable, investment needs and use of funds

Format the output as clean markdown with proper headers, bullet points, and sections.
Include specific numbers, percentages, and data points to make it realistic.
Make it professional, detailed, and suitable for investor presentations.

IMPORTANT: At the end of the business plan, include a footer that says:
"Prepared by: Revven Team | ${formattedDate}"

Do NOT use any other team name or date.`;

    const userPrompt = `Create a comprehensive business plan for: "${topic}"
${businessType ? `Business Type: ${businessType}` : ''}
${industry ? `Industry: ${industry}` : ''}

Please generate a detailed, professional business plan with all standard sections. Include realistic financial projections, market data, and actionable strategies.`;

    console.log('Calling OpenRouter API for business plan text...');
    
    const textResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://revvenapp.lovable.app',
        'X-Title': 'AIVA Business Plan Generator',
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
    const businessPlanContent = textData.choices?.[0]?.message?.content || '';

    if (!businessPlanContent) {
      throw new Error('No business plan content generated');
    }

    console.log('Business plan text generated successfully. Length:', businessPlanContent.length);

    // Step 2: Generate a professional infographic/cover image using Lovable AI
    const imagePrompt = `Create a professional, modern business plan cover page infographic for: "${topic}"

Design Requirements:
- Style: Clean, corporate, executive presentation quality
- Color scheme: Professional blues, dark grays, and accent colors
- Layout: Business document cover page with key highlights
- Must include:
  * A prominent title/header area for the business name
  * Professional icons representing key business metrics (growth charts, money, team, market)
  * A modern geometric or abstract background pattern
  * Space for key highlights or stats
  * Clean section dividers
  * Professional typography style

Make it look like a premium business plan cover that would impress investors. High quality, sharp graphics, executive-level design.`;

    console.log('Generating business plan cover image...');

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    let imageUrl = null;
    let publicId = null;

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const base64ImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (base64ImageUrl) {
        console.log('Base64 image received, uploading to Cloudinary...');

        // Upload to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', base64ImageUrl);
        cloudinaryFormData.append('upload_preset', 'revven');
        cloudinaryFormData.append('folder', 'business_plans');

        const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/dszt275xv/image/upload',
          {
            method: 'POST',
            body: cloudinaryFormData,
          }
        );

        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();
          imageUrl = cloudinaryData.secure_url;
          publicId = cloudinaryData.public_id;
          console.log('Business plan cover uploaded to Cloudinary:', imageUrl);
        } else {
          console.error('Cloudinary upload failed:', await cloudinaryResponse.text());
        }
      }
    } else {
      console.error('Image generation failed:', await imageResponse.text());
    }

    return new Response(JSON.stringify({ 
      content: businessPlanContent,
      imageUrl,
      publicId,
      title: `Business Plan: ${topic}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating business plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
