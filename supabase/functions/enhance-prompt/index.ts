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
    const { prompt, fast = false, mode = 'image', specificMode = '', musicWithVocals = false } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Enhancing prompt:", prompt, "Fast mode:", fast, "Mode:", mode, "Specific mode:", specificMode);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI gateway with model: google/gemini-2.5-flash");

    let systemPrompt: string;
    
    if (mode === 'lyrics') {
      systemPrompt = `You are a professional songwriter. Generate song lyrics with EXACT formatting shown below.

COPY THIS EXACT FORMAT (including all blank lines):

🎵 Song Title: "Your Title Here"



Verse 1

First lyric line here

Second lyric line here

Third lyric line here

Fourth lyric line here



Pre-Chorus

First line here

Second line here



Chorus

First chorus line

Second chorus line

Third chorus line

Fourth chorus line

Verse 2

First lyric line here

Second lyric line here

Third lyric line here

Fourth lyric line here



Pre-Chorus

First line here

Second line here



Chorus

First chorus line

Second chorus line

Third chorus line

Fourth chorus line

Bridge

First bridge line

Second bridge line

Third bridge line

Fourth bridge line



Final Chorus

First final chorus line

Second final chorus line

Third final chorus line

Fourth final chorus line



Outro

First outro line…

Second outro line…

Fading… so fast…

CRITICAL RULES:
1. TWO blank lines after Song Title before Verse 1
2. ONE blank line between section header and first lyric
3. EACH lyric line must be on its OWN line (not grouped together)
4. TWO blank lines AFTER most sections (before next section header)
5. Use vivid imagery and consistent rhyme schemes
6. Return ONLY the formatted lyrics`;
    } else if (mode === 'lyrics-enhance') {
      systemPrompt = `You are a professional songwriter. Improve the given lyrics with EXACT formatting shown below.

COPY THIS EXACT FORMAT (including all blank lines):

🎵 Song Title: "Your Title Here"



Verse 1

First lyric line here

Second lyric line here

Third lyric line here

Fourth lyric line here



Pre-Chorus

First line here

Second line here



Chorus

First chorus line

Second chorus line

Third chorus line

Fourth chorus line

Verse 2

First lyric line here

Second lyric line here

Third lyric line here

Fourth lyric line here



Pre-Chorus

First line here

Second line here



Chorus

First chorus line

Second chorus line

Third chorus line

Fourth chorus line

Bridge

First bridge line

Second bridge line

Third bridge line

Fourth bridge line



Final Chorus

First final chorus line

Second final chorus line

Third final chorus line

Fourth final chorus line



Outro

First outro line…

Second outro line…

Fading… so fast…

CRITICAL RULES:
1. Keep the SAME theme and core message from original
2. TWO blank lines after Song Title before Verse 1
3. ONE blank line between section header and first lyric
4. EACH lyric line must be on its OWN line (not grouped together)
5. TWO blank lines AFTER most sections (before next section header)
6. Improve word choices and rhyme schemes
7. Return ONLY the formatted lyrics`;
    } else if (mode === 'music') {
      // Generate prose-style music description for BOTH instrumental and vocal modes
      const vocalDescription = musicWithVocals 
        ? 'Include vocalist description (male/female), vocal style (melodic, raspy, smooth, powerful), and what emotions the lyrics evoke.'
        : 'This is for instrumental music - do NOT mention vocals, singers, or lyrics.';
      
      systemPrompt = `You are a music prompt enhancer. Transform the user's music idea into a flowing, descriptive prose paragraph.

OUTPUT FORMAT (write as a single cohesive paragraph, like this example):
"This song blends EDM, Pop-Dance, and Progressive House styles, creating an uplifting, anthemic, and emotionally charged track perfect for a night out, a music festival, or even a high-energy workout. The lyrics are designed to evoke feelings of hope, yearning, and strength, with a male vocalist delivering a melodic, smooth, and emotionally rich performance."

MUST INCLUDE in your prose description:
- Genre blend (2-3 specific genres)
- Mood/atmosphere descriptors (uplifting, melancholic, energetic, etc.)
- Ideal use cases or settings (workout, relaxation, party, etc.)
- Instrumentation hints woven naturally into the description
${musicWithVocals ? '- Vocalist gender and vocal style\n- Emotional themes the lyrics convey' : ''}

${vocalDescription}

RULES:
1. Write as ONE flowing paragraph, NOT a list or structured format
2. Keep the user's core theme/mood - enhance, don't change
3. Be vivid and evocative in your descriptions
4. Return ONLY the prose description, no explanations`;
    } else if (mode === 'video') {
      // Video mode enhancement based on specific animate mode
      const modeSpecific = specificMode?.toLowerCase() || 'animate';
      
      if (modeSpecific === 'avatar video' || modeSpecific === 'lip-sync') {
        systemPrompt = `You are a script enhancer for talking head videos. Enhance the user's script for a ${modeSpecific} video.

RULES:
1. Keep it under 180 characters (CRITICAL - this is for Avatar Video with strict limits)
2. Make it punchy, conversational, and engaging
3. Add natural pauses and emphasis markers
4. Keep the same core message - just make it more compelling
5. Return ONLY the enhanced script, no explanations`;
      } else if (modeSpecific === 'podcast') {
        systemPrompt = `You are a prompt enhancer for podcast-style videos. Enhance the description for better video generation.

MUST INCLUDE:
- Two or more speakers in conversation
- Studio/office setting details
- Natural dialogue and gestures
- Professional podcast atmosphere

RULES:
1. Keep the user's core topic/theme
2. Add specific visual details: camera angles, lighting, expressions
3. Keep it concise (under 300 words)
4. Return ONLY the enhanced prompt`;
      } else if (modeSpecific === 'story') {
        systemPrompt = `You are a prompt enhancer for narrative story videos. Enhance the story description for cinematic video generation.

MUST INCLUDE:
- Clear scene progression (beginning, middle, end)
- Character actions and emotions
- Visual storytelling elements
- Mood and atmosphere details

RULES:
1. Maintain the user's story concept
2. Add cinematic details: camera movements, lighting, transitions
3. Break into clear scenes if appropriate
4. Return ONLY the enhanced prompt`;
      } else if (modeSpecific === 'vsl') {
        systemPrompt = `You are a prompt enhancer for Video Sales Letters (VSL). Enhance the prompt for compelling sales video generation.

MUST INCLUDE:
- Attention-grabbing hook
- Problem-solution narrative flow
- Emotional connection points
- Urgency and call-to-action hints

RULES:
1. Keep the user's product/service focus
2. Add persuasive visual elements
3. Include text overlay suggestions
4. Return ONLY the enhanced prompt`;
      } else if (modeSpecific === 'draw') {
        systemPrompt = `You are a prompt enhancer for animated/artistic style videos. Enhance the prompt for stylized video generation.

MUST INCLUDE:
- Specific art style (watercolor, anime, sketch, 3D, etc.)
- Animation technique descriptions
- Color palette and visual effects
- Movement and transition styles

RULES:
1. Keep the user's creative vision
2. Add rich artistic details
3. Include animation technique specifics
4. Return ONLY the enhanced prompt`;
      } else {
        // Default video/animate mode
        systemPrompt = `You are a prompt enhancer for cinematic video generation. Enhance the video prompt for stunning visuals.

MUST INCLUDE:
- Camera movements (pan, zoom, tracking, crane, etc.)
- Lighting and atmosphere details
- Action and motion descriptions
- Scene composition and framing

RULES:
1. Keep the user's core concept
2. Add professional cinematography details
3. Include dynamic movement descriptions
4. Keep it under 300 words
5. Return ONLY the enhanced prompt`;
      }
    } else if (mode === 'design') {
      // Design mode enhancement
      const designType = specificMode || 'design';
      
      systemPrompt = `You are a prompt enhancer for professional ${designType} generation. Enhance the design prompt for stunning, ultra-high quality output.

MUST INCLUDE:
- Specific design style (minimalist, modern, elegant, bold, etc.)
- Color scheme suggestions
- Typography style hints
- Visual hierarchy and composition
- Professional finish details (textures, shadows, effects)

RULES:
1. Keep the user's brand/concept focus - use their text as the main content
2. Add premium design elements: gradients, depth, professional aesthetics
3. Include specific style directions for 16:9 widescreen format
4. Do NOT write the design type name (like "logo" or "brochure") in the design
5. Return ONLY the enhanced prompt`;
    } else if (mode === 'content') {
      systemPrompt = `You are a social media content strategist. Enhance the user's content idea into a clear, compelling 30-day content theme.

MUST INCLUDE:
- Specific niche/topic focus
- Target audience hints
- Content style direction
- Engagement strategy elements

RULES:
1. Keep the user's core topic
2. Make it specific and actionable
3. Add viral potential elements
4. Keep it to 1-2 compelling sentences
5. Return ONLY the enhanced topic description`;
    } else if (mode === 'voiceover') {
      systemPrompt = `You are a voiceover script enhancer. Improve the script for professional narration.

MUST INCLUDE:
- Natural pacing with pause markers [pause]
- Emotional tone indicators
- Clear articulation-friendly phrasing
- Engaging delivery cues

RULES:
1. Keep the user's message intact
2. Add natural speech patterns
3. Include emphasis markers where needed
4. Return ONLY the enhanced script`;
    } else if (mode === 'sound_effects') {
      systemPrompt = `You are a sound design prompt enhancer. Improve the description for precise sound effect generation.

MUST INCLUDE:
- Specific sound characteristics (pitch, intensity, duration)
- Environmental context
- Texture and quality descriptors
- Layering suggestions if applicable

RULES:
1. Keep the user's core sound concept
2. Add technical audio details
3. Be specific about timing and intensity
4. Return ONLY the enhanced prompt`;
    } else if (fast) {
      systemPrompt = "You are a prompt refiner. Improve clarity and fix grammar of the user's prompt. Do NOT add new concepts, objects, or ideas that weren't mentioned. Keep the exact same subject matter. Return ONLY the refined prompt.";
    } else {
      // Default image mode
      const imageMode = specificMode?.toLowerCase() || 'create';
      
      if (imageMode === 'photoshoot') {
        systemPrompt = `You are a prompt enhancer for professional photoshoot images. Enhance for editorial-quality results.

MUST INCLUDE:
- Specific pose and body language
- Lighting setup (studio, natural, dramatic, etc.)
- Fashion/styling details
- Camera angle and lens suggestions

RULES:
1. Keep the user's subject/concept
2. Add professional photography techniques
3. Include high-fashion details
4. Return ONLY the enhanced prompt`;
      } else if (imageMode === 'draw') {
        systemPrompt = `You are a prompt enhancer for artistic/illustrated images. Enhance for stunning artistic results.

MUST INCLUDE:
- Specific art style (watercolor, oil painting, digital art, anime, etc.)
- Color palette and mood
- Technique details
- Artistic interpretation direction

RULES:
1. Keep the user's subject/concept
2. Add rich artistic details
3. Include style-specific techniques
4. Return ONLY the enhanced prompt`;
      } else {
        systemPrompt = `You are a prompt enhancer for image generation. Your rules:
1. ONLY enhance what the user wrote - do NOT add new subjects, objects, or concepts they didn't mention
2. Improve descriptive quality: add lighting, mood, composition, camera angle, artistic style
3. Fix grammar and make it clearer
4. Keep the EXACT same core subject - if they said "a cat", don't add dogs, people, or other things
5. Keep it concise (under 200 words)
6. Return ONLY the enhanced prompt, no explanations

Example:
Input: "a sunset on beach"
Good: "A vibrant sunset on a sandy beach, golden and orange hues reflecting on calm waves, warm summer evening atmosphere, wide-angle composition, soft natural lighting"
Bad: "A sunset on beach with people walking, seagulls flying, boats in distance" (adds things not mentioned)`;
      }
    }

    // Determine the user message based on mode
    let userMessage = '';
    if (mode === 'lyrics') {
      userMessage = `Write complete song lyrics about: "${prompt}"`;
    } else if (mode === 'lyrics-enhance') {
      userMessage = `Improve these lyrics while keeping the same structure and theme:\n\n${prompt}`;
    } else if (mode === 'music') {
      userMessage = `Transform this into a structured music prompt: "${prompt}"`;
    } else if (mode === 'video') {
      userMessage = `Enhance this video generation prompt: "${prompt}"`;
    } else if (mode === 'design') {
      userMessage = `Enhance this ${specificMode || 'design'} generation prompt: "${prompt}"`;
    } else if (mode === 'content') {
      userMessage = `Enhance this social media content theme: "${prompt}"`;
    } else if (mode === 'voiceover') {
      userMessage = `Enhance this voiceover script: "${prompt}"`;
    } else if (mode === 'sound_effects') {
      userMessage = `Enhance this sound effect description: "${prompt}"`;
    } else {
      userMessage = `Enhance this image generation prompt: "${prompt}"`;
    }

    const requestBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Lovable AI response status:", response.status);

    const responseText = await response.text();
    console.log("Lovable AI raw response (first 500 chars):", responseText.substring(0, 500));

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }

      throw new Error(`AI gateway error: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response successfully. Choices count:", data.choices?.length);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(`Failed to parse AI response: ${responseText.substring(0, 200)}`);
    }

    // Standard OpenAI-compatible format from Lovable AI
    let enhancedPrompt: string | null = data.choices?.[0]?.message?.content?.trim() || null;
    console.log("Extracted content:", enhancedPrompt ? enhancedPrompt.substring(0, 100) : "null");

    // Some models might return text directly
    if (!enhancedPrompt && data.choices?.[0]?.text) {
      enhancedPrompt = String(data.choices[0].text).trim();
      console.log("Found text field instead:", enhancedPrompt.substring(0, 100));
    }

    if (!enhancedPrompt) {
      console.error("No content found. Full response structure:", JSON.stringify(data, null, 2));
      throw new Error("No enhanced prompt generated. Please try again.");
    }

    // Strip markdown formatting (bold, italic, headers, etc.)
    enhancedPrompt = enhancedPrompt
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') // Remove underline _text_ or __text__
      .replace(/^#+\s+/gm, '')           // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple newlines
      .trim();

    console.log("Final cleaned enhanced prompt:", enhancedPrompt);

    console.log("Enhanced prompt:", enhancedPrompt);
    // Strip markdown formatting (bold, italic, headers, etc.)
    enhancedPrompt = enhancedPrompt
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') // Remove underline _text_ or __text__
      .replace(/^#+\s+/gm, '')           // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple newlines
      .trim();

    console.log("Final cleaned enhanced prompt:", enhancedPrompt);

    console.log("Enhanced prompt:", enhancedPrompt);

    return new Response(
      JSON.stringify({
        success: true,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in enhance-prompt function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to enhance prompt";
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
