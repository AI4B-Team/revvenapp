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
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Enhancing prompt:", prompt);

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    console.log("Calling OpenRouter API with model: openai/gpt-5");

    const requestBody = {
      model: "openai/gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a creative AI prompt enhancer. Your job is to take simple prompts and make them more detailed, vivid, and effective for image generation. Add specific details about style, lighting, composition, colors, mood, and artistic techniques while keeping the core concept intact. Keep it concise but highly descriptive. Return ONLY the enhanced prompt without any explanation or extra text."
        },
        {
          role: "user",
          content: `Enhance this image generation prompt: "${prompt}"`
        }
      ],
      max_completion_tokens: 200,
      temperature: 0.8
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://revven.app",
        "X-Title": "Revven AI"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Credits exhausted. Please add credits to continue.");
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));
    
    // Handle both OpenAI and OpenRouter response formats
    let enhancedPrompt = data.choices?.[0]?.message?.content?.trim();
    
    // Some models might return text directly
    if (!enhancedPrompt && data.choices?.[0]?.text) {
      enhancedPrompt = data.choices[0].text.trim();
    }
    
    if (!enhancedPrompt) {
      console.error("Unexpected response structure:", data);
      throw new Error("No enhanced prompt generated. Response: " + JSON.stringify(data).substring(0, 200));
    }

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
