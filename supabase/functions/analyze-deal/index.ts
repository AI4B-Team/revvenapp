import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DealData {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  address?: string;
  strategy?: string;
}

interface AnalysisResult {
  dealScore: number;
  verdict: string;
  riskFlags: Array<{
    type: 'warning' | 'danger' | 'info';
    message: string;
    field?: string;
  }>;
  aiAnalysis: string;
  recommendations: string[];
  offerSuggestions?: {
    cashOffer?: number;
    wholesaleMAO?: number;
    creativeTerms?: string;
    sellerFinancePitch?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealData, action } = await req.json() as { dealData: DealData; action: string };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing deal - Calculator: ${dealData.calculatorType}, Action: ${action}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze") {
      systemPrompt = `You are an expert real estate investment analyst. Analyze deals and provide:
1. A deal score from 0-100 (where 70+ is green/good, 40-69 is yellow/caution, below 40 is red/pass)
2. A short verdict (max 10 words) like "Wholesale Safe", "Flip Is Tight", "Rental Only Works with Seller Finance"
3. Risk flags - specific concerns about the numbers or assumptions
4. Brief analysis (2-3 sentences) explaining the key factors
5. 3-5 specific recommendations

Be direct and honest. Focus on the numbers provided.`;

      userPrompt = `Analyze this ${dealData.calculatorType} deal:

${dealData.address ? `Address: ${dealData.address}` : ''}
Strategy: ${dealData.strategy || dealData.calculatorType}

INPUTS:
${JSON.stringify(dealData.inputs, null, 2)}

CALCULATED RESULTS:
${JSON.stringify(dealData.results, null, 2)}

Provide your analysis.`;
    } else if (action === "generate_offers") {
      systemPrompt = `You are an expert real estate investor who crafts compelling offers. Based on the deal analysis, generate:
1. A cash offer amount and brief justification
2. A wholesale MAO (Maximum Allowable Offer) with breakdown
3. Creative financing terms (seller financing structure)
4. A seller finance pitch - a short, persuasive message to send to the seller

Be specific with numbers. Format the seller pitch as a ready-to-send message.`;

      userPrompt = `Generate offer options for this deal:

Calculator Type: ${dealData.calculatorType}
${dealData.address ? `Property: ${dealData.address}` : ''}

DEAL DATA:
${JSON.stringify(dealData.inputs, null, 2)}

RESULTS:
${JSON.stringify(dealData.results, null, 2)}

Generate specific offers with numbers.`;
    } else if (action === "quick_triage") {
      systemPrompt = `You are a seasoned real estate investor doing rapid deal triage. Within 2 sentences, tell the user:
1. Whether this deal is worth pursuing (and which strategy)
2. The single biggest concern or opportunity

Be brutally honest and direct. Example: "This is likely a wholesale or pass. The ARV seems aggressive for the area and rehab costs are tight."`;

      userPrompt = `Quick triage for:
${dealData.address ? `Address: ${dealData.address}` : 'Property'}
Asking: ${dealData.inputs.purchasePrice || dealData.inputs.askingPrice || 'Not specified'}
ARV: ${dealData.inputs.arv || 'Not specified'}
Rehab Est: ${dealData.inputs.rehabCosts || dealData.inputs.rehab || 'Not specified'}

What's your take? Should they look at this?`;
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
          { role: "user", content: userPrompt }
        ],
        tools: action === "analyze" ? [
          {
            type: "function",
            function: {
              name: "deal_analysis",
              description: "Structured deal analysis output",
              parameters: {
                type: "object",
                properties: {
                  dealScore: { 
                    type: "number", 
                    description: "Score from 0-100. 70+ is good, 40-69 is caution, below 40 is pass" 
                  },
                  verdict: { 
                    type: "string", 
                    description: "Short verdict max 10 words like 'Wholesale Safe' or 'Flip Is Tight'" 
                  },
                  riskFlags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["warning", "danger", "info"] },
                        message: { type: "string" },
                        field: { type: "string" }
                      },
                      required: ["type", "message"]
                    }
                  },
                  aiAnalysis: { 
                    type: "string", 
                    description: "2-3 sentence analysis of key factors" 
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific actionable recommendations"
                  }
                },
                required: ["dealScore", "verdict", "riskFlags", "aiAnalysis", "recommendations"]
              }
            }
          }
        ] : undefined,
        tool_choice: action === "analyze" ? { type: "function", function: { name: "deal_analysis" } } : undefined,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    console.log("AI response received successfully");

    let result;
    if (action === "analyze") {
      // Extract structured output from tool call
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        throw new Error("Failed to parse analysis result");
      }
    } else {
      // For other actions, return the text content
      result = {
        content: data.choices?.[0]?.message?.content || "Analysis complete."
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error analyzing deal:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to analyze deal" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
