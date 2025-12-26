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
    const { transcript, action, text, targetLanguage, question, chatHistory, transformType } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    let messages: { role: string; content: string }[] = [];

    if (action === "transform") {
      // Transform text (rephrase, shorten, elaborate, etc.)
      if (!text || !transformType) {
        throw new Error("Text and transformType required for transform action");
      }
      console.log("Transforming text with action:", transformType);
      const instructions: Record<string, string> = {
        rephrase: "Rephrase the following text while preserving its meaning. Only return the rephrased text, nothing else.",
        shorten: "Make the following text shorter while preserving the key message. Only return the shortened text, nothing else.",
        elaborate: "Expand on the following text with more detail and make it longer. Only return the elaborated text, nothing else.",
        expand: "Expand on the following text with more detail and make it longer. Only return the expanded text, nothing else.",
        formal: "Rewrite the following text in a more formal, professional tone. Only return the rewritten text, nothing else.",
        "more formal": "Rewrite the following text in a more formal, professional tone. Only return the rewritten text, nothing else.",
        casual: "Rewrite the following text in a more casual, conversational tone. Only return the rewritten text, nothing else.",
        "more casual": "Rewrite the following text in a more casual, conversational tone. Only return the rewritten text, nothing else.",
        simplify: "Simplify the following text to make it easier to understand. Only return the simplified text, nothing else.",
        bulletize: "Convert the following text into bullet points. Only return the bullet points, nothing else.",
        summarize: "Summarize the following text concisely. Only return the summary, nothing else.",
      };
      const instruction = instructions[transformType] || instructions.rephrase;
      messages = [
        { role: "system", content: instruction },
        { role: "user", content: text }
      ];
    } else if (action === "chat") {
      // Chat mode - answer questions about the transcript
      if (!question || !transcript) {
        throw new Error("Question and transcript required for chat");
      }
      console.log("Chat about transcript:", question);
      
      messages = [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions about a transcript. Be concise and accurate. Here is the transcript:\n\n${transcript}`
        },
        ...(chatHistory || []),
        { role: "user", content: question }
      ];
    } else if (action === "translate") {
      // Translation mode
      if (!text || !targetLanguage) {
        throw new Error("Text and target language required for translation");
      }
      console.log("Translating text to:", targetLanguage, "Input:", text.substring(0, 50));
      messages = [
        { 
          role: "system", 
          content: `You are a professional translator. Your task is to translate the following text into ${targetLanguage}. 
IMPORTANT RULES:
- Return ONLY the translated text, nothing else
- Do NOT include any explanations, notes, or comments
- Do NOT repeat the original text
- Preserve the original formatting
- If the text is already in ${targetLanguage}, still return it as-is` 
        },
        { role: "user", content: `Translate this to ${targetLanguage}: ${text}` }
      ];
    } else {
      // Summary mode (default)
      if (!transcript) {
        throw new Error("No transcript provided");
      }
      console.log("Generating summary for transcript:", transcript.substring(0, 100));
      messages = [
        { role: "system", content: "You are an expert at summarizing transcripts. Create a concise, informative summary that captures the key points, main topics discussed, and any action items or conclusions. Keep the summary clear and professional, around 2-4 sentences." },
        { role: "user", content: `Please summarize the following transcript:\n\n${transcript}` }
      ];
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
        messages,
        max_tokens: 1000,
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
        summary: (!action || action === 'summary') ? result : undefined,
        translatedText: action === "translate" ? result : undefined,
        answer: action === "chat" ? result : undefined,
        result: action === "transform" ? result : undefined
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
