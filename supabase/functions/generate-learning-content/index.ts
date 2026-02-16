import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, bookTitle, chapterTitles, chapterContents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const hasContent = chapterContents && chapterContents.trim().length > 0;
    const truncatedContent = hasContent ? chapterContents.substring(0, 3000) : '';
    const context = hasContent
      ? `Book: "${bookTitle}". Chapters: ${(chapterTitles || []).join(", ")}.\n\nActual book content:\n${truncatedContent}`
      : `Book: "${bookTitle}". Chapters: ${(chapterTitles || []).join(", ")}`;

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "flashcards") {
      systemPrompt = "You are an educational content creator. Generate flashcards from ebook content. Return ONLY a valid JSON array of objects with 'front', 'back', and 'difficulty' (easy/medium/hard) fields. No markdown, no explanation.";
      userPrompt = hasContent
        ? `Create 6 high-quality flashcards based on the following actual text content from the ebook. Focus on the key facts, terms, and concepts found in the text. ${context}`
        : `Create 6 high-quality flashcards covering key concepts from this ebook. ${context}`;
    } else if (type === "quiz") {
      systemPrompt = "You are a quiz creator. Generate quiz questions from ebook content. Return ONLY a valid JSON array of objects with: 'type' (multiple-choice or true-false), 'question', 'options' (array of {text, isCorrect}), 'explanation', 'points' (1). No markdown.";
      userPrompt = hasContent
        ? `Create 5 quiz questions (mix of multiple-choice and true-false) based on the following actual text content. Questions should test comprehension of specific facts and concepts from the text. ${context}`
        : `Create 5 quiz questions (mix of multiple-choice and true-false) testing understanding of this ebook. ${context}`;
    } else if (type === "knowledge-check") {
      systemPrompt = "You are an educational content creator. Generate a quick knowledge check. Return ONLY a valid JSON object with: 'title', 'questions' (array of {question, options: string[], correctIndex: number, explanation: string}). No markdown.";
      userPrompt = `Create a quick 3-question knowledge check for this ebook. ${context}`;
    } else if (type === "interactive-exercise") {
      systemPrompt = "You are an educational content creator. Generate an interactive exercise. Return ONLY a valid JSON object with: 'title', 'description', 'steps' (array of {instruction: string, hint: string, expectedOutcome: string}). No markdown.";
      userPrompt = `Create a hands-on exercise with 3-4 steps that helps readers practice concepts from this ebook. ${context}`;
    } else if (type === "progress-tracker") {
      systemPrompt = "You are an educational content creator. Generate learning milestones. Return ONLY a valid JSON object with: 'title', 'milestones' (array of {label: string, description: string, chapter: string}). No markdown.";
      userPrompt = `Create 5-6 learning milestones/checkpoints for readers of this ebook. ${context}`;
    } else {
      throw new Error("Invalid type: " + type);
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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse JSON from response (strip markdown fences if present)
    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-learning-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
