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

    // UGC-specific system prompt for voice scripts
    const ugcPromptGuidance = `Create scripts for UGC (User-Generated Content) TALKING HEAD videos where a person speaks directly to camera.
Generate natural, conversational scripts that sound authentic and engaging. The script should:
- Be 30-60 seconds when spoken (approximately 75-150 words)
- Sound natural and conversational, like someone genuinely sharing their experience
- Include emotional hooks and relatable moments
- Have a clear structure: hook, story/message, call-to-action
- Avoid overly salesy or robotic language

Example formats:
- Product testimonial: "Okay so I've been using [product] for about 2 weeks now and I have to tell you..."
- Life hack/tip: "So here's something nobody told me about [topic] that completely changed..."
- Story time: "You guys won't believe what happened when I tried..."
- Review/unboxing: "Alright let's see what all the hype is about with this..."`;

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
      // UGC mode - generate voice scripts
      const systemPrompt = `You are a creative scriptwriter specializing in authentic UGC (User-Generated Content) videos.
${ugcPromptGuidance}

Generate a single engaging UGC script that sounds natural and conversational.
Return only the script text that the person will speak, nothing else. No stage directions, no quotation marks.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a creative, authentic UGC video script for a talking head video. Make it sound natural and engaging, like a real person sharing their genuine thoughts or experience." }
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
