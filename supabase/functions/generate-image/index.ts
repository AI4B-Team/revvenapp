import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model mapping: UI model name -> KIE.AI configuration
const MODEL_CONFIGS: Record<string, { model: string; name: string }> = {
  'nano-banana': {
    model: 'flux-kontext-pro',
    name: 'Nano Banana (Flux Pro)'
  },
  'seedream': {
    model: 'flux-kontext-pro',
    name: 'Seedream (Flux Pro)'
  },
  'seedream-4k': {
    model: 'flux-kontext-max',
    name: 'Seedream 4K (Flux Max)'
  },
  'grok': {
    model: 'flux-kontext-max',
    name: 'Grok (Flux Max)'
  },
  'flux': {
    model: 'flux-kontext-pro',
    name: 'Flux Pro'
  },
  'mystic': {
    model: 'flux-kontext-pro',
    name: 'Mystic (Flux Pro)'
  },
  'ideogram': {
    model: 'flux-kontext-pro',
    name: 'Ideogram 3 (Flux Pro)'
  },
  'auto': {
    model: 'flux-kontext-pro',
    name: 'Auto (Flux Pro)'
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = "1:1", model = "nano-banana" } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Generating image with KIE.AI:", { prompt, model, aspectRatio });

    // Get KIE.AI API key
    const KIE_AI_API_KEY = Deno.env.get("KIE_AI_API_KEY");
    if (!KIE_AI_API_KEY) {
      throw new Error("KIE_AI_API_KEY not configured");
    }

    // Get model configuration
    const modelConfig = MODEL_CONFIGS[model] || MODEL_CONFIGS['nano-banana'];
    console.log("Using KIE.AI model:", modelConfig);

    // Step 1: Call KIE.AI to start generation
    const kieResponse = await fetch("https://api.kie.ai/api/v1/flux/kontext/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        aspectRatio: aspectRatio,
        model: modelConfig.model,
        outputFormat: "png",
        enableTranslation: true,
        promptUpsampling: false
      })
    });

    if (!kieResponse.ok) {
      const errorText = await kieResponse.text();
      console.error("KIE.AI error:", kieResponse.status, errorText);
      
      if (kieResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (kieResponse.status === 402) {
        throw new Error("Credits exhausted. Please add credits to continue.");
      }
      
      throw new Error(`KIE.AI API error: ${kieResponse.status}`);
    }

    const kieData = await kieResponse.json();
    
    if (kieData.code !== 200) {
      console.error("KIE.AI failed:", kieData.msg);
      throw new Error(kieData.msg || "KIE.AI generation failed");
    }

    const taskId = kieData.data.taskId;
    console.log("KIE.AI taskId:", taskId);

    // Step 2: Poll for completion (every 2s, max 15 attempts = 30s)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      attempts++;
      
      console.log(`Polling attempt ${attempts}/${maxAttempts}`);
      
      const statusResponse = await fetch(
        `https://api.kie.ai/api/v1/flux/kontext/task/${taskId}`,
        {
          headers: {
            "Authorization": `Bearer ${KIE_AI_API_KEY}`,
          }
        }
      );
      
      if (!statusResponse.ok) {
        console.error("Status check failed:", statusResponse.status);
        continue;
      }

      const statusData = await statusResponse.json();
      console.log("Status response:", statusData);
      
      if (statusData.code === 200 && statusData.data.successFlag === 1) {
        imageUrl = statusData.data.response.resultImageUrl;
        console.log("Image ready:", imageUrl);
        break;
      } else if (statusData.data.errorCode) {
        throw new Error(statusData.data.errorMessage || "Generation failed");
      }
    }

    if (!imageUrl) {
      throw new Error("Image generation timeout after 30 seconds");
    }

    // Step 3: Download image from KIE.AI
    console.log("Downloading image from KIE.AI...");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from KIE.AI");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const dataUrl = `data:image/png;base64,${base64Image}`;

    // Step 4: Upload to Cloudinary
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
        file: dataUrl,
        upload_preset: cloudinaryUploadPreset,
        folder: "generated_images",
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Cloudinary error:", errorText);
      throw new Error("Failed to upload to Cloudinary");
    }

    const uploadData = await uploadResponse.json();
    console.log("Cloudinary upload successful");

    // Step 5: Get user from authorization header
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

    // Step 6: Save to database
    const { data: dbData, error: dbError } = await supabaseClient
      .from("generated_images")
      .insert({
        user_id: user.id,
        prompt: prompt,
        model: modelConfig.name,
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
