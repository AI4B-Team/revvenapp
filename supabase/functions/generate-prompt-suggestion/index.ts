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
    const { contentType, characterImages, referenceImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasImages = (characterImages && characterImages.length > 0) || (referenceImages && referenceImages.length > 0);

    let messages: any[] = [];

    if (hasImages) {
      // Build a message with images for vision analysis
      const systemPrompt = `You are a creative AI assistant that generates inspiring and detailed prompts for ${contentType || 'image'} generation. 
Based on the provided character and reference images, create a completely NEW creative scenario or scene that FEATURES these characters/elements in an interesting situation.
DO NOT describe what you see in the images. Instead, imagine these characters in a new setting, action, or scenario.
The prompt should be specific, vivid, and imaginative - like "character from image 1 doing X in Y setting" or "character in Z dramatic scene".
Return only the creative prompt text for generating a NEW image, nothing else.`;

      const content: any[] = [
        { type: "text", text: "Look at these character/reference images and create a NEW creative prompt that features them in an interesting scenario:" }
      ];

      // Add character images
      if (characterImages && characterImages.length > 0) {
        characterImages.forEach((url: string) => {
          content.push({
            type: "image_url",
            image_url: { url }
          });
        });
      }

      // Add reference images
      if (referenceImages && referenceImages.length > 0) {
        referenceImages.forEach((url: string) => {
          content.push({
            type: "image_url",
            image_url: { url }
          });
        });
      }

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content }
      ];
    } else {
      // No images, generate a random creative prompt
      const systemPrompt = `You are a creative AI assistant that generates inspiring and detailed prompts for ${contentType || 'image'} generation. 
Generate a single creative, detailed prompt that would create an interesting and visually appealing result.
The prompt should be specific, vivid, and imaginative.
Return only the prompt text, nothing else.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a creative prompt idea" }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error("Failed to generate prompt suggestion");
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-prompt-suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
