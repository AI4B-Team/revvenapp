import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, projectName } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate AI-themed stock image
    const prompts = [
      "Abstract digital art with glowing neural network connections, blue and purple gradient, futuristic AI technology concept, minimalist",
      "Geometric abstract pattern with flowing data streams, neon blue and cyan colors, modern tech aesthetic, clean design",
      "Digital brain visualization with circuit patterns, soft purple and blue lighting, AI concept art, professional",
      "Abstract waves of light representing artificial intelligence, gradient from deep blue to electric purple, sleek modern design",
      "Minimalist tech landscape with floating geometric shapes, holographic effects, cool blue tones, futuristic",
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    console.log("Generating thumbnail with prompt:", randomPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: randomPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `${projectId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("project-thumbnails")
      .upload(fileName, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("project-thumbnails")
      .getPublicUrl(fileName);

    const thumbnailUrl = urlData.publicUrl;

    // Update project with thumbnail URL
    const { error: updateError } = await supabase
      .from("projects")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", projectId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    console.log("Thumbnail generated and saved:", thumbnailUrl);

    return new Response(
      JSON.stringify({ success: true, thumbnailUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating thumbnail:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
