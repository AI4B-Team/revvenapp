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
    const { prompt, aspectRatio = "1:1" } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Generating image with prompt:", prompt);

    // Get Lovable AI API key from environment
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI Gateway for image generation
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Credits exhausted. Please add credits to continue.");
      }
      
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract base64 image from response
    const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageBase64) {
      throw new Error("No image generated");
    }

    // Upload to Cloudinary
    const cloudinaryApiKey = Deno.env.get("CLOUDINARY_API_KEY") || "357119741731559";
    const cloudinaryUploadPreset = "revven";
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dszt275xv/upload";

    console.log("Uploading to Cloudinary...");
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: imageBase64,
        upload_preset: cloudinaryUploadPreset,
        folder: "generated_images",
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const uploadData = await uploadResponse.json();
    console.log("Cloudinary upload successful");

    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabaseClient
      .from("generated_images")
      .insert({
        user_id: user.id,
        prompt: prompt,
        model: "google/gemini-2.5-flash-image-preview",
        image_url: uploadData.secure_url,
        cloudinary_public_id: uploadData.public_id,
        aspect_ratio: aspectRatio,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save to database");
    }

    console.log("Image saved to database");

    return new Response(
      JSON.stringify({
        success: true,
        image: dbData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-image function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
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
