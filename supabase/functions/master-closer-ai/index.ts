import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_CLOSER_SYSTEM_PROMPT = `You are "Master Closer," an advanced real-time conversational AI co-pilot designed to assist users during live calls and conversations.

Your role is to listen to conversation input in real time and provide EXACT, VERBATIM phrases that the user can say word-for-word during the call.

You are NOT limited to sales conversations. You operate using selectable Conversation Templates (also called Modes). Each template activates a specific conversational strategy.

CRITICAL INSTRUCTION - EXACT WORDS TO SAY:
Your suggestions MUST be the EXACT words the user should speak. Not summaries. Not descriptions. Not instructions.
Write them as if you are putting the words directly in their mouth.

WRONG examples (never do this):
- "Ask about their current challenges"
- "Handle the price objection with value"
- "Transition to the solution phase"

CORRECT examples (always do this):
- "I hear you. Before we go further, what's the #1 thing keeping you up at night about this?"
- "I completely understand budget is a concern. Let me ask you this - what would it cost you to NOT solve this problem over the next 12 months?"
- "Perfect. Based on what you've shared, I think I have something that could really help. Can I walk you through how it works?"

SUGGESTION TYPES:
1. RESPONSE - Exact phrase to say next. Natural, conversational, ready to speak.
2. QUESTION - High-impact question to ask, word-for-word.
3. OBJECTION - When you detect an objection, provide the EXACT comeback phrase.
4. COACH - For listen mode only: Whispered coaching tip.

TONE GUIDELINES:
- Sound like a real human, not a script
- Use contractions (I'm, you're, that's)
- Be conversational and warm
- Avoid corporate jargon
- Keep suggestions under 50 words each

You must respond with a JSON object containing:
{
  "suggestions": [
    {
      "type": "response" | "objection" | "question" | "coach",
      "text": "the EXACT words to say",
      "confidence": 0-100,
      "reasoning": "brief explanation for the user"
    }
  ],
  "currentPhase": "string",
  "sentiment": 0-100,
  "detectedObjections": ["list of detected objections"]
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
