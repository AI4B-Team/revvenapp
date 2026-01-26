import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, appName, appDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert landing page copywriter. Generate compelling, conversion-focused content for a custom landing page section.

The app being promoted is: ${appName}
App description: ${appDescription}

Based on the user's description, determine the best section type and generate appropriate content.

Available section types:
- features: For highlighting product features (generates 3-4 feature cards with title, description, and emoji icon)
- capabilities: For showcasing what the product can do (generates 3-4 capability cards with title, description, and emoji icon)
- testimonials: For social proof (generates 2-3 testimonials with name, role, company, quote)
- faq: For frequently asked questions (generates 3-5 Q&A pairs)
- cta: For call-to-action sections (generates headline, subheadline, button text)

Respond with a JSON object containing:
- type: the section type (features, capabilities, testimonials, faq, or cta)
- title: a short title for this section (2-4 words)
- content: the content object matching the section type structure

For features/capabilities, use relevant emoji icons.
Make the copy compelling, benefit-focused, and conversion-oriented.`;

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
          { role: "user", content: description }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_section",
              description: "Generate a landing page section based on user description",
              parameters: {
                type: "object",
                properties: {
                  type: { 
                    type: "string", 
                    enum: ["features", "capabilities", "testimonials", "faq", "cta"],
                    description: "The type of section to generate"
                  },
                  title: { 
                    type: "string",
                    description: "A short 2-4 word title for the section"
                  },
                  content: {
                    type: "object",
                    description: "The content for the section, structure depends on type"
                  }
                },
                required: ["type", "title", "content"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_section" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate section content");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No section content generated");
    }

    const sectionData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(sectionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-section error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate section" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
