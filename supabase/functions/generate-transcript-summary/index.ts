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
    const { transcript, action, text, targetLanguage } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "translate") {
      // Translation mode
      if (!text || !targetLanguage) {
        throw new Error("Text and target language required for translation");
      }
      console.log("Translating text to:", targetLanguage);
      systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, nothing else.`;
      userPrompt = text;
    } else {
      // Summary mode (default)
      if (!transcript) {
        throw new Error("No transcript provided");
      }
      console.log("Generating summary for transcript:", transcript.substring(0, 100));
      systemPrompt = "You are an expert at summarizing transcripts. Create a concise, informative summary that captures the key points, main topics discussed, and any action items or conclusions. Keep the summary clear and professional, around 2-4 sentences.";
      userPrompt = `Please summarize the following transcript:\n\n${transcript}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Lovable Transcribe"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    console.log("Result:", result.substring(0, 100));

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: action !== "translate" ? result : undefined,
        translatedText: action === "translate" ? result : undefined 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
