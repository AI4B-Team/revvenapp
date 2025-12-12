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
    const isVideo = contentType?.toLowerCase() === 'video';
    const isUGC = contentType?.toLowerCase() === 'ugc';

    // UGC-specific system prompt for voice scripts (Avatar Video - 180 chars max)
    const ugcPromptGuidance = `Create SHORT scripts for Avatar Video TALKING HEAD videos.
CRITICAL: Output MUST be 180 characters or less (including spaces and punctuation).
The script should:
- Be concise and punchy (max 180 characters total)
- Sound natural and conversational
- Have one clear hook or message
- Avoid filler words

Example (under 180 chars):
"I tried this product for 2 weeks and honestly? It changed everything. You need to see this for yourself."`;

    // Different system prompts for video vs image
    const videoPromptGuidance = `Create prompts for VIDEO generation that describe:
- Camera movements (pan, zoom, tracking shot, crane shot)
- Action and motion (what moves, how it moves, speed)
- Scene transitions or progression over time
- Lighting changes or time of day shifts
- Character actions and expressions
Example style: "Slow zoom into a woman's face as she turns to look at the camera, golden hour sunlight streaming through her hair, soft wind blowing"`;

    const imagePromptGuidance = `Create prompts for IMAGE/PHOTO generation that describe:
- Composition and framing (close-up, wide shot, portrait)
- Lighting and mood (dramatic, soft, cinematic)
- Style and aesthetic (photorealistic, artistic, vintage)
- Details and textures
- Color palette and atmosphere
Example style: "A stunning portrait of a woman in golden hour light, soft bokeh background, cinematic color grading, 85mm lens"`;

    let messages: any[] = [];

    if (isUGC) {
      // UGC mode - generate short voice scripts for avatar video (180 chars max)
      const systemPrompt = `You are a creative scriptwriter for Avatar Video talking head content.
${ugcPromptGuidance}

Generate a single engaging script that is UNDER 180 CHARACTERS TOTAL.
Return only the script text, nothing else. No stage directions, no quotation marks.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a short, punchy Avatar Video script. MUST be under 180 characters including spaces and punctuation." }
      ];
    } else if (hasImages) {
      // Build a message with images for vision analysis
      const systemPrompt = isVideo
        ? `You are a creative AI assistant that generates inspiring and detailed prompts for VIDEO generation.
${videoPromptGuidance}

Based on the provided character and reference images, create a completely NEW creative VIDEO scenario that FEATURES these characters/elements in motion.
Focus on what ACTIONS occur, how the camera MOVES, and how the scene PROGRESSES over time.
Return only the creative video prompt text, nothing else.`
        : `You are a creative AI assistant that generates inspiring and detailed prompts for IMAGE/PHOTO generation.
${imagePromptGuidance}

Based on the provided character and reference images, create a completely NEW creative scenario that FEATURES these characters/elements.
DO NOT describe what you see in the images. Instead, imagine these characters in a new setting or artistic composition.
Return only the creative image prompt text, nothing else.`;

      const content: any[] = [
        { type: "text", text: isVideo 
          ? "Look at these character/reference images and create a NEW creative VIDEO prompt that features them in motion with camera movements:" 
          : "Look at these character/reference images and create a NEW creative IMAGE prompt featuring them in an interesting composition:" 
        }
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
      const systemPrompt = isVideo
        ? `You are a creative AI assistant that generates inspiring and detailed prompts for VIDEO generation.
${videoPromptGuidance}

Generate a single creative, detailed VIDEO prompt with camera movements, action, and scene progression.
Return only the prompt text, nothing else.`
        : `You are a creative AI assistant that generates inspiring and detailed prompts for IMAGE/PHOTO generation.
${imagePromptGuidance}

Generate a single creative, detailed IMAGE prompt that would create a visually stunning result.
Return only the prompt text, nothing else.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: isVideo 
          ? "Generate a creative VIDEO prompt idea with camera movements and action" 
          : "Generate a creative IMAGE prompt idea" 
        }
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
