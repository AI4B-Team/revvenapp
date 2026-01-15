import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Section {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'footer' | 'about' | 'pricing' | 'gallery' | 'contact' | 'team' | 'faq' | 'services' | 'stats' | 'newsletter';
  content: Record<string, string>;
}

interface WebsiteData {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  sections: Section[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating website for prompt:", prompt);

    const systemPrompt = `You are a professional website designer and copywriter. Generate complete website content based on user prompts.

Your task is to generate a complete website structure with sections and content. Return ONLY valid JSON matching this exact structure:

{
  "name": "Website Name",
  "description": "Brief website description",
  "primaryColor": "#HEX_COLOR",
  "secondaryColor": "#HEX_COLOR", 
  "fontFamily": "Font Name",
  "sections": [
    {
      "id": "section-unique-id",
      "type": "section_type",
      "content": { field content as key-value pairs }
    }
  ]
}

Available section types and their required content fields:
- hero: headline, subheadline, buttonText, buttonLink
- features: title, feature1Title, feature1Desc, feature2Title, feature2Desc, feature3Title, feature3Desc
- about: title, description, mission
- testimonials: title, quote1, author1, quote2, author2
- pricing: title, plan1Name, plan1Price, plan1Features, plan2Name, plan2Price, plan2Features, plan3Name, plan3Price, plan3Features
- cta: headline, description, buttonText
- gallery: title, description
- contact: title, description, email, phone, address
- team: title, member1Name, member1Role, member2Name, member2Role, member3Name, member3Role
- faq: title, q1, a1, q2, a2, q3, a3
- services: title, service1Title, service1Desc, service2Title, service2Desc, service3Title, service3Desc
- stats: title, stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, stat4Value, stat4Label
- newsletter: title, description, buttonText
- footer: companyName, tagline, copyright

Available fonts: Inter, Poppins, Roboto, Montserrat, Playfair Display, Lato, Nunito, Lora, Open Sans, Raleway

Guidelines:
1. Choose colors that match the business type and mood
2. Select appropriate fonts (modern sans-serif for tech, elegant serif for luxury, etc.)
3. Include relevant sections based on the website purpose
4. Write compelling, professional copy
5. Always include hero and footer sections
6. Generate 5-8 sections for a complete website
7. Make content specific to the business, not generic
8. Use realistic pricing if applicable
9. Create unique IDs for each section

Return ONLY the JSON object, no explanations or markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a professional website for: ${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON from the response
    let websiteData: WebsiteData;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        websiteData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse website data from AI response");
    }

    // Validate the structure
    if (!websiteData.name || !websiteData.sections || !Array.isArray(websiteData.sections)) {
      throw new Error("Invalid website data structure");
    }

    // Ensure all sections have unique IDs
    websiteData.sections = websiteData.sections.map((section, index) => ({
      ...section,
      id: section.id || `${section.type}-${Date.now()}-${index}`
    }));

    console.log("Generated website:", websiteData.name, "with", websiteData.sections.length, "sections");

    return new Response(
      JSON.stringify({ website: websiteData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating website:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate website" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
