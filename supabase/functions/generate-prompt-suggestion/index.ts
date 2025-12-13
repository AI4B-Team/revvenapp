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
    const { contentType, specificMode, characterImages, referenceImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating prompt for contentType:", contentType, "specificMode:", specificMode);

    const hasImages = (characterImages && characterImages.length > 0) || (referenceImages && referenceImages.length > 0);
    const isVideo = contentType?.toLowerCase() === 'video';
    const isUGC = contentType?.toLowerCase() === 'ugc';
    const isImage = contentType?.toLowerCase() === 'image';
    const isAudio = contentType?.toLowerCase() === 'audio';
    const isDesign = contentType?.toLowerCase() === 'design';
    const isContent = contentType?.toLowerCase() === 'content';

    // Mode-specific prompt guidance
    const getModeGuidance = () => {
      const mode = specificMode?.toLowerCase() || '';

      // VIDEO MODES
      if (isVideo || isUGC) {
        switch (mode) {
          case 'avatar video':
            return `Create SHORT scripts for Avatar Video TALKING HEAD videos.
CRITICAL: Output MUST be 180 characters or less (including spaces and punctuation).
The script should:
- Be concise and punchy (max 180 characters total)
- Sound natural and conversational
- Have one clear hook or message
- Avoid filler words
Example: "I tried this product for 2 weeks and honestly? It changed everything. You need to see this for yourself."`;

          case 'ugc':
            return `Create prompts for UGC product showcase videos.
Focus on:
- Product presentation and features
- Natural, authentic feel
- Clear product benefits
- Engaging call-to-action
Example: "Showcase this skincare product with smooth camera movement, highlighting the sleek packaging and creamy texture"`;

          case 'podcast':
            return `Create prompts for PODCAST style videos with talking heads.
Focus on:
- Conversational atmosphere
- Professional but relaxed setting
- Natural gestures and expressions
- Engaging discussion topics
Example: "Two hosts in a modern studio setting discussing the latest trends, animated hand gestures, warm studio lighting"`;

          case 'vsl':
            return `Create prompts for Video Sales Letter (VSL) content.
Focus on:
- Compelling hook in first 3 seconds
- Problem-solution narrative
- Emotional connection
- Strong call-to-action
Example: "Dynamic text overlays revealing shocking statistics, followed by testimonial-style talking head with confident expression"`;

          case 'story':
            return `Create prompts for STORY-based videos with multiple scenes.
Focus on:
- Scene-by-scene narrative
- Character development
- Visual storytelling
- Emotional arc
Example: "Opening shot of sunrise over city, character wakes up determined, montage of preparation, triumphant finale"`;

          case 'recast':
            return `Create prompts for character RECAST videos where a character is applied to existing footage.
Focus on:
- Character consistency
- Natural movements
- Facial expressions
- Scene integration
Example: "Apply character seamlessly to the walking sequence, maintaining natural gait and expression changes"`;

          case 'draw':
            return `Create prompts for ANIMATED/DRAWN style videos.
Focus on:
- Art style (cartoon, anime, sketch)
- Animation fluidity
- Creative visual effects
- Stylized movements
Example: "Watercolor animation of flowers blooming, soft brush strokes transitioning between frames, dreamy atmosphere"`;

          case 'presentation':
            return `Create prompts for PRESENTATION style videos.
Focus on:
- Clear information hierarchy
- Professional visuals
- Smooth transitions
- Data visualization
Example: "Corporate presentation with sleek animations, key points appearing with subtle motion graphics, clean modern design"`;

          default: // Animate and general video
            return `Create prompts for VIDEO generation that describe:
- Camera movements (pan, zoom, tracking shot, crane shot)
- Action and motion (what moves, how it moves, speed)
- Scene transitions or progression over time
- Lighting changes or time of day shifts
- Character actions and expressions
Example: "Slow zoom into a woman's face as she turns to look at the camera, golden hour sunlight streaming through her hair, soft wind blowing"`;
        }
      }

      // IMAGE MODES
      if (isImage) {
        switch (mode) {
          case 'photoshoot':
            return `Create prompts for professional PHOTOSHOOT images.
Focus on:
- Professional studio/location setting
- Model poses and expressions
- Fashion and styling details
- High-end photography techniques
Example: "Fashion editorial shot of model in designer outfit, dramatic side lighting, minimalist white studio, confident pose with hand on hip"`;

          case 'swap':
            return `Create prompts for FACE/OUTFIT SWAP images.
Focus on:
- Seamless integration
- Matching lighting and style
- Natural appearance
- Specific swap details
Example: "Swap the subject's outfit to a elegant red evening gown, maintaining the same pose and lighting conditions"`;

          case 'draw':
            return `Create prompts for ARTISTIC/DRAWN images.
Focus on:
- Art style (watercolor, oil painting, digital art, sketch)
- Artistic techniques
- Color palettes
- Creative interpretations
Example: "Impressionist oil painting style portrait with visible brush strokes, soft pastel colors, dreamy atmospheric quality"`;

          default: // Create and general image
            return `Create prompts for IMAGE/PHOTO generation that describe:
- Composition and framing (close-up, wide shot, portrait)
- Lighting and mood (dramatic, soft, cinematic)
- Style and aesthetic (photorealistic, artistic, vintage)
- Details and textures
- Color palette and atmosphere
Example: "A stunning portrait of a woman in golden hour light, soft bokeh background, cinematic color grading, 85mm lens"`;
        }
      }

      // AUDIO MODES
      if (isAudio) {
        switch (mode) {
          case 'voiceover':
            return `Create scripts for professional VOICEOVER narration.
Focus on:
- Clear, engaging narration
- Appropriate pacing
- Emotional tone matching content
- Professional delivery style
Example: "Warm, conversational tone introducing a new product feature, building excitement with each benefit revealed"`;

          case 'clone':
            return `Create text for VOICE CLONING that will sound natural.
Focus on:
- Natural speech patterns
- Appropriate pauses
- Conversational flow
- Clear pronunciation
Example: "Hey everyone, I wanted to share something really exciting with you today. You're going to love this."`;

          case 'revoice':
            return `Create text for REVOICING existing audio content.
Focus on:
- Matching original pacing
- Maintaining emotional intent
- Clear articulation
- Synced delivery
Example: "Reimagine this dialogue with more energy and enthusiasm, keeping the same timing as the original"`;

          case 'music':
            return `Create prompts for AI MUSIC generation.
Focus on:
- Genre and style
- Mood and tempo
- Instrumentation
- Song structure
Example: "Upbeat indie pop track with acoustic guitar, light percussion, and cheerful synth pads, 120 BPM, verse-chorus structure"`;

          default:
            return `Create prompts for AUDIO content generation.
Focus on:
- Tone and delivery style
- Pacing and rhythm
- Emotional resonance
- Clear messaging`;
        }
      }

      // DESIGN MODE
      if (isDesign) {
        return `Create prompts for DESIGN projects.
Focus on:
- Visual hierarchy
- Brand consistency
- Color schemes
- Typography choices
- Layout composition
Example: "Modern minimalist logo design with geometric shapes, bold sans-serif typography, gradient blue-purple color scheme"`;
      }

      // CONTENT MODE
      if (isContent) {
        return `Create prompts for SOCIAL MEDIA content.
Focus on:
- Platform-specific formatting
- Engaging hooks
- Call-to-action
- Hashtag strategy
- Visual content ideas
Example: "Carousel post about productivity tips, each slide with bold headline, supporting visual, and actionable takeaway"`;
      }

      // Default fallback
      return `Create inspiring and detailed creative prompts.
Focus on:
- Clear subject and concept
- Visual details and style
- Mood and atmosphere
- Technical specifications
Return only the prompt text, nothing else.`;
    };

    let messages: any[] = [];
    const modeGuidance = getModeGuidance();

    if (isUGC || specificMode?.toLowerCase() === 'avatar video') {
      // UGC/Avatar Video mode - generate short voice scripts (180 chars max)
      const systemPrompt = `You are a creative scriptwriter for Avatar Video talking head content.
${modeGuidance}

Generate a single engaging script that is UNDER 180 CHARACTERS TOTAL.
Return only the script text, nothing else. No stage directions, no quotation marks.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a short, punchy Avatar Video script. MUST be under 180 characters including spaces and punctuation." }
      ];
    } else if (hasImages) {
      // Build a message with images for vision analysis
      const contextType = isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : isDesign ? 'DESIGN' : isContent ? 'CONTENT' : 'IMAGE';
      
      const systemPrompt = `You are a creative AI assistant that generates inspiring and detailed prompts for ${contextType} generation.
${modeGuidance}

Based on the provided character and reference images, create a completely NEW creative scenario that FEATURES these characters/elements.
${isVideo ? 'Focus on what ACTIONS occur, how the camera MOVES, and how the scene PROGRESSES over time.' : ''}
DO NOT describe what you see in the images. Instead, imagine these characters in a new creative setting.
Return only the creative prompt text, nothing else.`;

      const content: any[] = [
        { type: "text", text: `Look at these character/reference images and create a NEW creative ${contextType} prompt${specificMode ? ` for ${specificMode} mode` : ''} featuring them:` }
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
      const contextType = isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : isDesign ? 'DESIGN' : isContent ? 'CONTENT' : 'IMAGE';
      
      const systemPrompt = `You are a creative AI assistant that generates inspiring and detailed prompts for ${contextType} generation.
${modeGuidance}

Generate a single creative, detailed prompt that would create a stunning result.
Return only the prompt text, nothing else.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a creative ${contextType} prompt idea${specificMode ? ` for ${specificMode} mode` : ''}` }
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

    console.log("Generated suggestion for", contentType, specificMode, ":", suggestion.substring(0, 100));

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
