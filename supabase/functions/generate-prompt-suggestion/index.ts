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
    const { contentType, specificMode, characterImages, referenceImages, musicWithVocals } = await req.json();
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

    // Mode-specific prompt guidance with examples
    const getModeConfig = () => {
      const mode = specificMode?.toLowerCase() || '';

      // VIDEO MODES
      if (isVideo || isUGC) {
        switch (mode) {
          case 'avatar video':
          case 'lip-sync':
            return {
              guidance: `Create SHORT scripts for ${mode === 'lip-sync' ? 'Lip-Sync' : 'Avatar Video'} TALKING HEAD videos.
CRITICAL: Output MUST be 180 characters or less (including spaces and punctuation).
The script should be concise, punchy, natural and conversational with one clear hook.`,
              example: "I tried this product for 2 weeks and honestly? It changed everything. You need to see this for yourself.",
              type: "avatar_script"
            };

          case 'ugc':
            return {
              guidance: `Create prompts for UGC (User Generated Content) product showcase videos.
Focus on: authentic product presentation, natural lighting, lifestyle context, real-world usage scenarios.
The video should feel organic and relatable, not overly polished or commercial.`,
              example: "Close-up of hands unboxing a new skincare product on a bathroom counter, morning light streaming through window, genuine reaction to first application",
              type: "ugc_video"
            };

          case 'podcast':
            return {
              guidance: `Create prompts for PODCAST-STYLE talking head videos.
MUST include: Two or more people in conversation, studio/home office setting, microphones visible, engaged discussion.
Focus on: natural dialogue, hand gestures, nodding, eye contact between speakers, casual professional atmosphere.`,
              example: "Two hosts seated at a modern podcast desk with microphones, animated discussion about tech trends, one gestures enthusiastically while the other nods in agreement, warm studio lighting",
              type: "podcast_video"
            };

          case 'vsl':
            return {
              guidance: `Create prompts for Video Sales Letter (VSL) content.
MUST include: compelling hook, problem-solution narrative, emotional connection, urgency.
Focus on: direct camera address, text overlays, before/after visuals, testimonial-style delivery.`,
              example: "Speaker looks directly at camera with concerned expression, text overlay appears 'Are you struggling with...', scene transitions to relieved smile showing solution",
              type: "vsl_video"
            };

          case 'story':
            return {
              guidance: `Create prompts for STORY-based narrative videos with scene progression.
MUST include: clear beginning-middle-end, character journey, emotional arc.
Focus on: establishing shots, character actions, mood transitions, visual storytelling without dialogue.`,
              example: "Scene 1: Woman wakes up stressed, checks phone anxiously. Scene 2: Takes a deep breath, begins morning routine. Scene 3: Leaves house with confident smile, city awaits",
              type: "story_video"
            };

          case 'recast':
            return {
              guidance: `Create prompts for character RECAST videos where a new character is applied to existing footage.
Focus on: how the character should move, facial expressions to maintain, scene integration, natural blending.`,
              example: "Character walks confidently through busy street, maintaining natural gait, occasional glances at surroundings, seamless integration with crowd",
              type: "recast_video"
            };

          case 'draw':
            return {
              guidance: `Create prompts for ANIMATED/ARTISTIC style videos.
MUST include: specific art style (watercolor, anime, sketch, 3D), animation technique, visual effects.
Focus on: stylized movements, creative transitions, artistic interpretation.`,
              example: "Watercolor animation of cherry blossoms falling, soft brush strokes animate petals drifting, ink wash background gradually reveals mountain landscape",
              type: "draw_video"
            };

          case 'presentation':
            return {
              guidance: `Create prompts for PRESENTATION/EXPLAINER style videos.
MUST include: information hierarchy, motion graphics, data visualization, clean transitions.
Focus on: professional aesthetics, clear messaging, branded elements.`,
              example: "Sleek animated infographic showing statistics appearing one by one, smooth transitions between data points, minimalist design with accent colors",
              type: "presentation_video"
            };

          default: // Animate and general video
            return {
              guidance: `Create prompts for cinematic VIDEO generation.
MUST include: specific camera movements (pan, zoom, tracking, crane), action/motion description, lighting.
Focus on: dynamic movement, scene progression, atmospheric details.`,
              example: "Slow motion tracking shot following a runner through misty forest at dawn, camera rises above treeline revealing mountain vista, golden hour light breaks through clouds",
              type: "animate_video"
            };
        }
      }

      // IMAGE MODES
      if (isImage) {
        switch (mode) {
          case 'photoshoot':
            return {
              guidance: `Create prompts for professional PHOTOSHOOT images.
MUST include: specific pose, lighting setup (studio/natural), fashion/styling details, camera angle.
Focus on: high-end photography techniques, editorial quality, model direction.`,
              example: "Fashion editorial: model in tailored blazer, dramatic side lighting with soft fill, minimalist white cyc wall, three-quarter turn with direct eye contact, 85mm lens",
              type: "photoshoot_image"
            };

          case 'swap':
            return {
              guidance: `Create prompts for FACE or OUTFIT SWAP images.
MUST include: specific swap details (what to change), matching instructions for lighting/style.
Focus on: seamless integration, consistent quality, natural appearance.`,
              example: "Swap outfit to elegant burgundy evening gown with subtle sequin details, maintain current lighting and pose, ensure fabric drapes naturally",
              type: "swap_image"
            };

          case 'draw':
            return {
              guidance: `Create prompts for ARTISTIC/ILLUSTRATED images.
MUST include: specific art style (watercolor, oil painting, digital art, anime, sketch), technique details.
Focus on: artistic interpretation, color palette, unique visual style.`,
              example: "Studio Ghibli-inspired illustration of cozy coffee shop interior, warm color palette, soft hand-painted textures, magical afternoon light through windows",
              type: "draw_image"
            };

          default: // Create and general image
            return {
              guidance: `Create prompts for stunning PHOTOREALISTIC images.
MUST include: subject description, composition (close-up, wide, portrait), lighting mood, style/aesthetic.
Focus on: visual impact, technical quality, artistic direction.`,
              example: "Cinematic portrait of woman in golden hour light, shallow depth of field, soft bokeh background of autumn leaves, warm color grading, contemplative expression",
              type: "create_image"
            };
        }
      }

      // AUDIO MODES
      if (isAudio) {
        switch (mode) {
          case 'voiceover':
            return {
              guidance: `Create scripts for professional VOICEOVER narration.
MUST include: clear pacing markers, emotional tone, natural pauses.
Focus on: engaging delivery, appropriate energy level, clear articulation.`,
              example: "Welcome to the future of productivity. [pause] What if I told you... that everything you thought you knew about time management was wrong?",
              type: "voiceover_audio"
            };

          case 'clone':
            return {
              guidance: `Create natural-sounding text for VOICE CLONING.
MUST include: conversational flow, natural contractions, realistic speech patterns.
Focus on: authenticity, natural pacing, avoiding robotic phrasing.`,
              example: "Hey, so I've been meaning to tell you about this thing I discovered last week. You're gonna love it, seriously.",
              type: "clone_audio"
            };

          case 'revoice':
            return {
              guidance: `Create text for REVOICING/DUBBING existing content.
MUST include: matching original pacing, emotional intent, sync points.
Focus on: lip-sync friendly phrasing, maintaining original meaning.`,
              example: "The moment has arrived. Everything we've worked for comes down to this single decision.",
              type: "revoice_audio"
            };

          case 'music':
            // If vocals are enabled, generate proper song lyrics
            if (musicWithVocals) {
              return {
                guidance: `You are a professional songwriter. Generate complete song lyrics in the EXACT format below.

OUTPUT FORMAT (use EXACTLY this structure):
🎵 Song Title: "[Creative title based on theme]"

Verse 1
[4 lines of lyrics setting up the story/theme]

Pre-Chorus
[2-4 lines building emotional tension]

Chorus
[4 lines - the emotional/melodic hook of the song]

Verse 2
[4 lines developing the story/theme further]

Pre-Chorus
[2-4 lines building emotional tension]

Chorus
[4 lines - repeat or variation of the hook]

Bridge
[4 lines - emotional peak, different perspective]

Final Chorus
[4 lines - powerful conclusion, may vary from main chorus]

Outro
[2-3 short lines fading out]

RULES:
1. Create original, emotionally resonant lyrics
2. Use vivid imagery, metaphors, and emotional language
3. Maintain consistent rhyme scheme where appropriate
4. Balance between vulnerability and strength in the message
5. Return ONLY the lyrics in the format above, no explanations`,
                example: `🎵 Song Title: "Rising Above"

Verse 1
In the shadows where I used to hide
Finding courage that was locked inside
Every setback was a stepping stone
Now I'm stronger than I've ever known

Pre-Chorus
The fire burns within my soul
Taking back what fear once stole

Chorus
I'm rising above, reaching for the sky
Nothing gonna stop me now, gonna learn to fly
Every scar I wear, every tear I've cried
Made me who I am, standing tall with pride`,
                type: "music_vocals_audio"
              };
            }
            // Instrumental mode - generate style description
            return {
              guidance: `Create STRUCTURED music prompts following this EXACT format:

Genre: [specific genre like Pop, Rock, Jazz, EDM, Classical, etc.]
Mood: [2-3 emotional descriptors]
Tempo: [Slow/Medium/Fast or specific BPM]
Instruments: [list of 3-5 instruments]
Style: [production style descriptors]

Be creative with genre combinations. Focus on instrumental composition and arrangement.`,
              example: `Genre: Indie Folk
Mood: Reflective, wistful
Tempo: Medium
Instruments: Acoustic guitar, cello, light percussion, ambient pads
Style: Minimalist, cinematic, emotional`,
              type: "music_audio"
            };

          default:
            return {
              guidance: `Create prompts for AUDIO content.
Include: tone, style, pacing, emotional quality.`,
              example: "Warm, friendly narration with gentle pacing and natural pauses for emphasis",
              type: "general_audio"
            };
        }
      }

      // DESIGN MODE
      if (isDesign) {
        return {
          guidance: `Create prompts for GRAPHIC DESIGN projects.
MUST include: design type (logo, banner, card), style direction, color scheme, typography hints.
Focus on: visual hierarchy, brand personality, modern aesthetics.`,
          example: "Minimalist tech startup logo, geometric sans-serif wordmark, gradient from electric blue to teal, clean negative space, scalable for app icon",
          type: "design"
        };
      }

      // CONTENT MODE (Social Media)
      if (isContent) {
        return {
          guidance: `Create prompts for SOCIAL MEDIA content.
MUST include: platform context, content format (carousel, reel, story), hook, call-to-action.
Focus on: engagement, shareability, trend awareness.`,
          example: "Instagram carousel: 5 productivity hacks for remote workers, bold text overlays, minimalist illustrations, swipe prompt on each slide, save-worthy value",
          type: "social_content"
        };
      }

      // Default fallback
      return {
        guidance: `Create inspiring and detailed creative prompts.
Focus on: clear subject, visual style, mood, technical details.`,
        example: "A stunning visual composition with dramatic lighting and professional quality",
        type: "general"
      };
    };

    let messages: any[] = [];
    const modeConfig = getModeConfig();

    console.log("Mode config type:", modeConfig.type);

    if (isUGC || specificMode?.toLowerCase() === 'avatar video') {
      // UGC/Avatar Video mode - generate short voice scripts (180 chars max)
      messages = [
        { 
          role: "system", 
          content: `You are a creative scriptwriter for Avatar Video talking head content.
${modeConfig.guidance}

EXAMPLE OUTPUT: "${modeConfig.example}"

Generate a single engaging script that is UNDER 180 CHARACTERS TOTAL.
Return ONLY the script text. No quotes, no stage directions, no explanations.`
        },
        { 
          role: "user", 
          content: "Generate a short, punchy Avatar Video script. MUST be under 180 characters." 
        }
      ];
    } else if (hasImages) {
      // With images - vision analysis
      const content: any[] = [
        { 
          type: "text", 
          text: `Create a NEW creative prompt for ${modeConfig.type.replace('_', ' ')} featuring these images.

REQUIREMENTS:
${modeConfig.guidance}

EXAMPLE FORMAT: "${modeConfig.example}"

Look at the images and create ONE detailed prompt following the requirements above. Return ONLY the prompt.`
        }
      ];

      // Add character images
      if (characterImages && characterImages.length > 0) {
        characterImages.forEach((url: string) => {
          content.push({ type: "image_url", image_url: { url } });
        });
      }

      // Add reference images
      if (referenceImages && referenceImages.length > 0) {
        referenceImages.forEach((url: string) => {
          content.push({ type: "image_url", image_url: { url } });
        });
      }

      messages = [
        { 
          role: "system", 
          content: `You are a creative prompt generator. Generate prompts that EXACTLY match the specified mode requirements. Do not deviate from the format.`
        },
        { role: "user", content }
      ];
    } else {
      // No images - random creative prompt
      messages = [
        { 
          role: "system", 
          content: `You are a creative prompt generator for ${modeConfig.type.replace('_', ' ')}.

STRICT REQUIREMENTS - Your prompt MUST follow this guidance:
${modeConfig.guidance}

EXAMPLE OUTPUT FORMAT: "${modeConfig.example}"

Generate ONE creative prompt that follows the exact same style and structure as the example.
Return ONLY the prompt text. No explanations, no alternatives.`
        },
        { 
          role: "user", 
          content: `Generate a creative ${modeConfig.type.replace('_', ' ')} prompt. Follow the requirements exactly.`
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
    const suggestion = data.choices[0]?.message?.content?.trim() || "";

    console.log("Generated", modeConfig.type, "suggestion:", suggestion.substring(0, 100));

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
