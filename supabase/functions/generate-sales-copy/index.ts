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
    const { appName, appDescription, appFeatures, appCategory, sectionType, regenerate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating sales copy for:", appName);

    const systemPrompt = `You are an expert copywriter specializing in SaaS and software product marketing. Generate compelling, conversion-focused copy for sales landing pages.

Your copy should be:
- Benefit-focused, not feature-focused
- Clear and concise
- Action-oriented
- Emotionally resonant
- Professional yet approachable

Return ONLY valid JSON matching the requested format. No markdown, no explanations.`;

    let userPrompt: string;

    if (regenerate && sectionType) {
      // Regenerate specific section
      userPrompt = `Generate fresh marketing copy for a ${sectionType} section for this product:

Product: ${appName}
Description: ${appDescription}
Features: ${appFeatures?.join(', ') || 'Various features'}
Category: ${appCategory}

Return JSON with a "content" object containing the section fields.

For ${sectionType} section, return:
${getSectionFormat(sectionType)}`;
    } else {
      // Generate all sections
      userPrompt = `Generate complete marketing copy for a sales landing page for this product:

Product: ${appName}
Description: ${appDescription}
Features: ${appFeatures?.join(', ') || 'Various features'}
Category: ${appCategory}

Return JSON with a "sections" array containing objects with "type" and "content" for each section.

Generate content for these sections:

1. hero:
   - headline: compelling main headline (max 10 words)
   - subheadline: supporting text explaining the value (max 25 words)
   
2. features:
   - feature1Title, feature1Desc: first key feature
   - feature2Title, feature2Desc: second key feature  
   - feature3Title, feature3Desc: third key feature
   
3. testimonials:
   - quote1, author1, role1: first testimonial
   - quote2, author2, role2: second testimonial
   
4. faq:
   - q1, a1: first FAQ
   - q2, a2: second FAQ
   - q3, a3: third FAQ
   
5. cta:
   - description: compelling call to action text (max 20 words)

Make all copy specific to ${appName} and its capabilities. Create believable testimonials with realistic names and roles.`;
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
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

    // Parse JSON from response
    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse sales copy from AI response");
    }

    console.log("Generated sales copy successfully");

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating sales copy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate sales copy" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSectionFormat(type: string): string {
  switch (type) {
    case 'hero':
      return `{
  "headline": "string",
  "subheadline": "string"
}`;
    case 'features':
      return `{
  "feature1Title": "string",
  "feature1Desc": "string",
  "feature2Title": "string", 
  "feature2Desc": "string",
  "feature3Title": "string",
  "feature3Desc": "string"
}`;
    case 'testimonials':
      return `{
  "quote1": "string",
  "author1": "string",
  "role1": "string",
  "quote2": "string",
  "author2": "string",
  "role2": "string"
}`;
    case 'faq':
      return `{
  "q1": "string",
  "a1": "string",
  "q2": "string",
  "a2": "string",
  "q3": "string",
  "a3": "string"
}`;
    case 'cta':
      return `{
  "description": "string"
}`;
    default:
      return '{}';
  }
}
