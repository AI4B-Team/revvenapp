import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model mapping: All real KIE.AI models
const MODEL_CONFIGS: Record<string, { model: string; name: string; endpoint: string; apiType: string; owner?: string }> = {
  'auto': {
    model: 'flux-kontext-pro',
    name: 'Auto (Flux Pro)',
    endpoint: '/api/v1/flux/kontext/generate',
    apiType: 'flux'
  },
  'grok': {
    model: 'grok-imagine/text-to-image',
    name: 'Grok Imagine',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'imagen'
  },
  'gpt-4o-image': {
    model: 'gpt-image-1',
    name: 'GPT-4o Image',
    endpoint: '/api/v1/gpt4o-image/generate',
    apiType: 'gpt4o'
  },
  'flux-pro': {
    model: 'flux-kontext-pro',
    name: 'Flux Pro',
    endpoint: '/api/v1/flux/kontext/generate',
    apiType: 'flux'
  },
  'flux-max': {
    model: 'flux-kontext-max',
    name: 'Flux Max',
    endpoint: '/api/v1/flux/kontext/generate',
    apiType: 'flux'
  },
  'imagen-ultra': {
    model: 'google/imagen4-ultra',
    name: 'Imagen 4 Ultra',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'imagen'
  },
  'seedream-4': {
    model: 'bytedance/seedream-v4-text-to-image',
    name: 'Seedream 4.0',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'seedream'
  },
  'seedream': {
    model: 'bytedance/seedream-v3-text-to-image',
    name: 'Seedream 3.0',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'seedream'
  },
  'qwen': {
    model: 'qwen/text-to-image',
    name: 'Qwen Image',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'qwen'
  },
  'nano-banana': {
    model: 'google/nano-banana',
    name: 'Nano Banana (Gemini 2.5)',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'imagen'
  },
  'ideogram': {
    model: 'ideogram-v3',
    name: 'Ideogram V3',
    endpoint: '/v1/models/ideogram/ideogram-v3/predictions',
    apiType: 'replicate',
    owner: 'ideogram'
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = "1:1", model = "auto" } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Generating image with KIE.AI:", { prompt, model, aspectRatio });

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

    // Admin client using service role key for backend-only updates (bypasses RLS)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get KIE.AI API key
    const KIE_AI_API_KEY = Deno.env.get("KIE_AI_API_KEY");
    if (!KIE_AI_API_KEY) {
      throw new Error("KIE_AI_API_KEY not configured");
    }

    // Get model configuration
    const modelConfig = MODEL_CONFIGS[model] || MODEL_CONFIGS['auto'];
    console.log("Using KIE.AI model:", modelConfig);

    // Create database record first with pending status
    const { data: dbData, error: dbError } = await supabaseClient
      .from("generated_images")
      .insert({
        user_id: user.id,
        prompt: prompt,
        model: modelConfig.name,
        aspect_ratio: aspectRatio,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save to database");
    }

    console.log("Database record created with ID:", dbData.id);

    // Build callback URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const callbackUrl = `${supabaseUrl}/functions/v1/image-webhook-callback`;
    console.log("Callback URL:", callbackUrl);

    // Call KIE.AI to start generation with callback
    console.log(`Calling KIE.AI API: ${modelConfig.endpoint} with model: ${modelConfig.model}`);
    
    // Prepare request body based on API type
    let requestBody: any;
    
    if (modelConfig.apiType === 'flux') {
      // Flux Kontext API format
      requestBody = {
        prompt: prompt,
        aspectRatio: aspectRatio,
        model: modelConfig.model,
        outputFormat: "png",
        enableTranslation: true,
        promptUpsampling: false,
        callBackUrl: callbackUrl,
      };
    } else if (modelConfig.apiType === 'gpt4o') {
      // GPT-4o Image API format (uses 'size' instead of 'aspectRatio')
      requestBody = {
        prompt: prompt,
        size: aspectRatio,
        callBackUrl: callbackUrl,
        isEnhance: false,
        uploadCn: false,
        nVariants: 1,
        enableFallback: true,
        fallbackModel: "FLUX_MAX"
      };
    } else if (modelConfig.apiType === 'seedream') {
      // Seedream API format (text-to-image)
      requestBody = {
        model: modelConfig.model,
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt,
          image_size: aspectRatio === "1:1" ? "square_hd" : 
                     aspectRatio === "16:9" ? "landscape_16_9" : 
                     aspectRatio === "9:16" ? "portrait_16_9" : 
                     aspectRatio === "4:3" ? "landscape_4_3" : 
                     aspectRatio === "3:2" ? "landscape_3_2" : 
                     aspectRatio === "21:9" ? "landscape_21_9" : "square_hd",
          image_resolution: "2K",
          max_images: 1
        }
      };
    } else if (modelConfig.apiType === 'qwen') {
      // Qwen API format
      requestBody = {
        model: modelConfig.model,
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt,
          image_size: aspectRatio === "1:1" ? "square_hd" : 
                     aspectRatio === "16:9" ? "landscape_16_9" : 
                     aspectRatio === "9:16" ? "portrait_16_9" : 
                     aspectRatio === "4:3" ? "landscape_4_3" : 
                     aspectRatio === "3:4" ? "portrait_4_3" : "square_hd",
          output_format: "png"
        }
      };
    } else if (modelConfig.apiType === 'imagen') {
      // Google Imagen 4 Ultra API format
      requestBody = {
        model: modelConfig.model,
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio || "1:1",
          negative_prompt: "",
          seed: ""
        }
      };
    } else if (modelConfig.apiType === 'replicate') {
      // Replicate-style API format
      requestBody = {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          output_format: "png"
        },
        webhook: callbackUrl,
        webhook_events_filter: ["completed"]
      };
    }
    
    const kieResponse = await fetch(`https://api.kie.ai${modelConfig.endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    if (!kieResponse.ok) {
      const errorText = await kieResponse.text();
      console.error("KIE.AI error:", kieResponse.status, errorText);
      
      // Update database with error
      await supabaseClient
        .from("generated_images")
        .update({ status: "error", error_message: `KIE.AI API error: ${kieResponse.status}` })
        .eq("id", dbData.id);
      
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
      
      // Update database with error
      await supabaseClient
        .from("generated_images")
        .update({ status: "error", error_message: kieData.msg })
        .eq("id", dbData.id);
      
      throw new Error(kieData.msg || "KIE.AI generation failed");
    }

    const taskId = kieData.data.taskId;
    console.log("KIE.AI taskId:", taskId);

    // Update database with taskId so callback can find it (use admin client to bypass RLS)
    const { error: taskUpdateError } = await adminClient
      .from("generated_images")
      .update({ kie_task_id: taskId })
      .eq("id", dbData.id);

    if (taskUpdateError) {
      console.error("Failed to update kie_task_id:", taskUpdateError);
    }

    console.log("Image generation started, callback will update when ready");

    // Return immediately - callback will complete the process
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
