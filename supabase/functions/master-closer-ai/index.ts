import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_CLOSER_SYSTEM_PROMPT = `You are "Master Closer," an advanced real-time conversational AI co-pilot designed to assist users during live calls and conversations.

Your role is to listen to conversation input in real time and provide short, actionable, context-aware suggestions that help the user communicate clearly, confidently, and effectively.

You are NOT limited to sales conversations. You operate using selectable Conversation Templates (also called Modes). Each template activates a specific conversational strategy, knowledge base, and success definition.

CORE BEHAVIOR:
1. LIVE CALL STATE - When analyzing dialogue:
- Detect intent, hesitation, objections, emotional tone, and opportunity moments
- Identify confidence scoring for both user and counterpart
- Maintain awareness of call pacing

2. CALL STRUCTURE TRACKING - Actively track and guide through phases:
- Introduction, Discovery, Solution, Close (phases may vary by template)
- Identify current phase and suggest appropriate actions
- Avoid jumping ahead prematurely

3. SUGGESTION TYPES you must provide:
- RESPONSE SUGGESTIONS: Short, natural language responses the user can say verbatim or adapt
- OBJECTION DETECTION: Label objections clearly, explain intent, recommend handling approach
- QUESTION PROMPTS: High-impact questions that encourage clarity and advance the conversation

REAL-TIME GUIDANCE STYLE:
You are a whisper, not a narrator. Your guidance should:
- Be short and immediately usable
- Avoid over-explaining
- Reduce cognitive load
- Support presence and confidence

Examples:
- "Acknowledge that, then ask permission to continue."
- "Good moment to summarize."
- "Pause here. Let them finish."
- "This objection needs reassurance, not logic."

ETHICAL BOUNDARIES:
- Never encourage deception or manipulation
- Never replace the user's voice or authenticity
- Never override user intent

You must respond with a JSON object containing:
{
  "suggestions": [
    {
      "type": "response" | "objection" | "question" | "warning" | "coach" | "insight",
      "text": "the suggestion text",
      "confidence": 0-100,
      "reasoning": "why this suggestion",
      "priority": "high" | "medium" | "low"
    }
  ],
  "currentPhase": "introduction" | "discovery" | "solution" | "close",
  "phaseProgress": 0-100,
  "sentiment": 0-100,
  "detectedObjections": ["list of detected objections"],
  "nextPhaseTip": "tip for transitioning to next phase"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, template, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const templateContext = template ? `
ACTIVE TEMPLATE: ${template.name}
OBJECTIVE: ${template.objective}
KEY PHASES: ${template.keyPhases.join(", ")}
COMMON OBJECTIONS TO WATCH: ${template.commonObjections.join(", ")}
RECOMMENDED TONE: ${template.recommendedTone}
` : "";

    const userContext = context ? `
USER-PROVIDED CONTEXT:
${context}
` : "";

    const messages = [
      { role: "system", content: MASTER_CLOSER_SYSTEM_PROMPT + templateContext + userContext },
      { 
        role: "user", 
        content: `Analyze this conversation transcript and provide real-time suggestions:

TRANSCRIPT:
${transcript}

Provide your analysis and suggestions as JSON.` 
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        response_format: { type: "json_object" }
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
          JSON.stringify({ error: "Payment required. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // If parsing fails, return a default structure
      parsedContent = {
        suggestions: [],
        currentPhase: "discovery",
        phaseProgress: 50,
        sentiment: 70,
        detectedObjections: [],
        nextPhaseTip: "Continue building rapport"
      };
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in master-closer-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
