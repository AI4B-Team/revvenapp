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
    const { prompt, fast = false, mode = 'image' } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Enhancing prompt:", prompt, "Fast mode:", fast, "Mode:", mode);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI gateway with model: google/gemini-2.5-flash");

    let systemPrompt: string;
    
    if (mode === 'lyrics') {
      systemPrompt = `You are a professional songwriter and lyricist. Generate complete, emotionally resonant song lyrics in a structured format.

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
1. Create lyrics that match the user's theme/mood exactly
2. Use vivid imagery, metaphors, and emotional language
3. Maintain consistent rhyme scheme where appropriate
4. Balance between vulnerability and strength in the message
5. Return ONLY the lyrics in the format above, no explanations`;
    } else if (mode === 'lyrics-enhance') {
      systemPrompt = `You are a professional songwriter. Improve the given lyrics while keeping the same theme and structure.

RULES:
1. Keep the SAME structure (verses, chorus, bridge, etc.)
2. Improve word choices for more vivid imagery
3. Enhance rhyme schemes where possible
4. Make emotional moments more impactful
5. Fix any awkward phrasing
6. Do NOT change the core theme or message
7. Return ONLY the improved lyrics, no explanations`;
    } else if (mode === 'music') {
      systemPrompt = `You are a music prompt enhancer. Transform the user's music idea into a STRUCTURED format.

OUTPUT FORMAT (use EXACTLY this structure):
Genre: [specific genre]
Mood: [2-3 emotional descriptors]
Tempo: [Slow/Medium/Fast]
Instruments: [list 3-5 instruments]
Vocals: [Male/Female/None]
Language: [English or language, skip if instrumental]
Theme: [main theme based on user input]
Style: [production style]

Lyrics (if vocals included):
[Verse]
[2-4 lines]

[Chorus]
[2-4 lines]

RULES:
1. ONLY enhance what the user mentioned - don't change the core theme/subject
2. If user mentions specific genre/mood/instruments, keep them
3. Create lyrics that match the user's theme exactly
4. Keep lyrics emotionally resonant and concise
5. Return ONLY the structured format, no explanations`;
    } else if (fast) {
      systemPrompt = "You are a prompt refiner. Improve clarity and fix grammar of the user's prompt. Do NOT add new concepts, objects, or ideas that weren't mentioned. Keep the exact same subject matter. Return ONLY the refined prompt.";
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

    const requestBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: mode === 'lyrics' 
            ? `Write complete song lyrics about: "${prompt}"`
            : mode === 'lyrics-enhance'
            ? `Improve these lyrics while keeping the same structure and theme:\n\n${prompt}`
            : mode === 'music' 
            ? `Transform this into a structured music prompt: "${prompt}"`
            : `Enhance this image generation prompt: "${prompt}"`,
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
