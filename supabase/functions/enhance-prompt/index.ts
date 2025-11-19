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
    const { prompt, fast = false } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Enhancing prompt:", prompt, "Fast mode:", fast);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI gateway with model: google/gemini-2.5-flash");

    const systemPrompt = fast
      ? "You are a quick AI prompt enhancer. Take the user's prompt and add a few key details about style and mood. Keep it brief and clear. Return ONLY the enhanced prompt."
      : "You are a creative AI prompt enhancer. Your job is to take simple prompts and make them more detailed, vivid, and effective for image generation. Add specific details about style, lighting, composition, colors, mood, and artistic techniques while keeping the core concept intact. Keep it concise but highly descriptive. Return ONLY the enhanced prompt without any explanation or extra text.";

    const requestBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Enhance this image generation prompt: "${prompt}"`,
        },
      ],
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Lovable AI response status:", response.status);

    const responseText = await response.text();
    console.log("Lovable AI raw response (first 500 chars):", responseText.substring(0, 500));

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }

      throw new Error(`AI gateway error: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    // Standard OpenAI-compatible format from Lovable AI
    let enhancedPrompt: string | null = data.choices?.[0]?.message?.content?.trim() || null;
    console.log("Extracted content:", enhancedPrompt ? enhancedPrompt.substring(0, 100) : "null");

    // Some models might return text directly
    if (!enhancedPrompt && data.choices?.[0]?.text) {
      enhancedPrompt = String(data.choices[0].text).trim();
      console.log("Found text field instead:", enhancedPrompt.substring(0, 100));
    }

    if (!enhancedPrompt) {
      console.error("No content found. Full response structure:", JSON.stringify(data, null, 2));
      throw new Error("No enhanced prompt generated. Please try again.");
    }

    // Strip markdown formatting (bold, italic, headers, etc.)
    enhancedPrompt = enhancedPrompt
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') // Remove underline _text_ or __text__
      .replace(/^#+\s+/gm, '')           // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple newlines
      .trim();

    console.log("Final cleaned enhanced prompt:", enhancedPrompt);

    console.log("Enhanced prompt:", enhancedPrompt);
    // Strip markdown formatting (bold, italic, headers, etc.)
    enhancedPrompt = enhancedPrompt
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') // Remove underline _text_ or __text__
      .replace(/^#+\s+/gm, '')           // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple newlines
      .trim();

    console.log("Final cleaned enhanced prompt:", enhancedPrompt);

    console.log("Enhanced prompt:", enhancedPrompt);

    return new Response(
      JSON.stringify({
        success: true,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in enhance-prompt function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to enhance prompt";
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
