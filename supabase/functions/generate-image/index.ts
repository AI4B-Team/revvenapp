import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model mapping: Only KIE.AI models with working API endpoints
const MODEL_CONFIGS: Record<string, { model: string; name: string; endpoint: string; apiType: string }> = {
  'auto': {
    model: 'flux-kontext-pro',
    name: 'Auto (Flux Pro)',
    endpoint: '/api/v1/flux/kontext/generate',
    apiType: 'flux'
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
