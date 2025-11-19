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
      model: "openai/gpt-5-mini",
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
      max_completion_tokens: 400,
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

    console.log("OpenRouter response status:", response.status);

    // Read response as text first to ensure we can log it
    const responseText = await response.text();
    console.log("OpenRouter raw response (first 500 chars):", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("OpenRouter error - Status:", response.status);
      console.error("OpenRouter error - Body:", responseText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Credits exhausted. Please add credits to continue.");
      }
      
      throw new Error(`OpenRouter API error: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response successfully. Choices count:", data.choices?.length);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(`Failed to parse OpenRouter response: ${responseText.substring(0, 200)}`);
    }
    
    // Handle both OpenAI and OpenRouter response formats
    let enhancedPrompt = data.choices?.[0]?.message?.content?.trim();
    const message = data.choices?.[0]?.message || {};
    
    console.log("Extracted content:", enhancedPrompt ? enhancedPrompt.substring(0, 100) : "null");
    
    // Some models might return text directly
    if (!enhancedPrompt && data.choices?.[0]?.text) {
      enhancedPrompt = data.choices[0].text.trim();
      console.log("Found text field instead:", enhancedPrompt.substring(0, 100));
    }

    // New: reasoning-based models often put natural language in reasoning / reasoning_details
    if (!enhancedPrompt && message.reasoning) {
      try {
        const reasoningText = typeof message.reasoning === 'string'
          ? message.reasoning
          : JSON.stringify(message.reasoning);
        enhancedPrompt = reasoningText.trim().substring(0, 400);
        console.log("Using reasoning field as enhanced prompt:", enhancedPrompt.substring(0, 100));
      } catch (_e) {
        // ignore
      }
    }

    if (!enhancedPrompt && Array.isArray(message.reasoning_details) && message.reasoning_details.length > 0) {
      const summaryDetail = message.reasoning_details.find((d: any) => d.type === 'reasoning.summary') || message.reasoning_details[0];
      if (summaryDetail?.summary) {
        enhancedPrompt = String(summaryDetail.summary).trim().substring(0, 400);
        console.log("Using reasoning summary as enhanced prompt:", enhancedPrompt.substring(0, 100));
      }
    }

    // Check for errors in response
    if (data.error) {
      console.error("OpenRouter error in response:", data.error);
      throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    if (!enhancedPrompt) {
      console.error("No content found. Full response structure:", JSON.stringify(data, null, 2));
      throw new Error("No enhanced prompt generated. Check logs for full response.");
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
