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
  'seedream-4.5': {
    model: 'seedream/4.5-edit',
    name: 'Seedream 4.5',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'seedream-4.5'
  },
  'seedream-4': {
    model: 'bytedance/seedream-v4-text-to-image',
    name: 'Seedream 4.0',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'seedream'
  },
  'seedream': {
    model: 'bytedance/seedream',
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
    model: 'google/nano-banana-edit',
    name: 'Nano Banana Edit',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'nano-banana-edit'
  },
  'nano-banana-pro': {
    model: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'nano-banana-pro'
  },
  'ideogram': {
    model: 'ideogram/v3-edit',
    name: 'Ideogram V3 Edit',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'ideogram-edit'
  },
  'ideogram-character': {
    model: 'ideogram/character',
    name: 'Ideogram Character',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'ideogram-character'
  },
  'z-image': {
    model: 'z-image',
    name: 'Z-Image',
    endpoint: '/api/v1/jobs/createTask',
    apiType: 'z-image'
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = "1:1", model = "auto", numberOfImages = 1, referenceImage, referenceImages, characterImage, maskImage } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Use characterImage as the effective reference if provided, otherwise use referenceImage
    const effectiveReferenceImage = characterImage || referenceImage;
    
    // Build array of reference images for models that support multiple inputs
    // Priority: referenceImages array > single effectiveReferenceImage
    const effectiveReferenceImages: string[] = referenceImages && referenceImages.length > 0 
      ? referenceImages 
      : (effectiveReferenceImage ? [effectiveReferenceImage] : []);

    console.log("Generating images with KIE.AI:", { prompt, model, aspectRatio, numberOfImages, hasCharacter: !!characterImage, hasReference: !!referenceImage, referenceImagesCount: effectiveReferenceImages.length });

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

    // Generate multiple images
    const generatedImages = [];
    
    for (let i = 0; i < numberOfImages; i++) {
      console.log(`Generating image ${i + 1} of ${numberOfImages}`);
      
      // Create database record first with pending status
      const { data: dbData, error: dbError } = await supabaseClient
        .from("generated_images")
        .insert({
          user_id: user.id,
          prompt: prompt,
          model: modelConfig.name,
          aspect_ratio: aspectRatio,
          status: "pending",
          reference_image_url: effectiveReferenceImage || null,
          reference_image_urls: effectiveReferenceImages.length > 0 ? effectiveReferenceImages : null,
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
        // Flux Kontext API format - supports img-to-img
        requestBody = {
          prompt: prompt,
          aspectRatio: aspectRatio,
          model: modelConfig.model,
          outputFormat: "png",
          enableTranslation: true,
          promptUpsampling: false,
          callBackUrl: callbackUrl,
        };
        
        // Add reference image if provided (img-to-img)
        if (effectiveReferenceImage) {
          requestBody.imageUrl = effectiveReferenceImage;
          requestBody.strength = 0.8; // Control how much to transform (0-1, lower = closer to original)
        }
      } else if (modelConfig.apiType === 'gpt4o') {
        // GPT-4o Image API format - size must be "1:1", "3:2", or "2:3"
        const sizeMapping: Record<string, string> = {
          "1:1": "1:1",
          "3:2": "3:2",
          "2:3": "2:3",
          "16:9": "3:2",  // fallback to closest supported ratio
          "9:16": "2:3",  // fallback to closest supported ratio
          "4:3": "3:2",   // fallback to closest supported ratio
          "3:4": "2:3"    // fallback to closest supported ratio
        };
        
        requestBody = {
          prompt: prompt,
          size: sizeMapping[aspectRatio] || "1:1",
          callBackUrl: callbackUrl,
          isEnhance: false,
          uploadCn: false,
          nVariants: 1,
          enableFallback: false
        };
        
        // Add reference image if provided (img-to-img)
        if (effectiveReferenceImage) {
          requestBody.filesUrl = [effectiveReferenceImage]; // Array of up to 5 images
        }
      } else if (modelConfig.apiType === 'seedream') {
        // Seedream 3.0/4.0 API format - supports img-to-img with image_urls (up to 14 images)
        const maxImages = 14;
        const limitedImages = effectiveReferenceImages.slice(0, maxImages);
        
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
            image_resolution: "1K",
            max_images: 1,
            guidance_scale: 2.5,
            enable_safety_checker: true
          }
        };
        
        // Add reference images if provided (img-to-img) - uses image_urls array (max 14 images)
        if (limitedImages.length > 0) {
          requestBody.input.image_urls = limitedImages;
          console.log(`Seedream: Using ${limitedImages.length} reference images (max ${maxImages})`);
        }
      } else if (modelConfig.apiType === 'qwen') {
        // Qwen API format - supports img-to-img
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
        
        // Add reference image if provided (img-to-img)
        if (effectiveReferenceImage) {
          requestBody.input.image_url = effectiveReferenceImage;
          requestBody.input.strength = 0.8; // 0.0-1.0 transformation strength
        }
      } else if (modelConfig.apiType === 'imagen') {
        // Google Imagen 4 Ultra / Grok Imagine API format - supports img-to-img
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
        
        // Add reference image if provided (img-to-img)
        if (effectiveReferenceImage) {
          requestBody.input.image = effectiveReferenceImage;
        }
      } else if (modelConfig.apiType === 'nano-banana-edit') {
        // Nano Banana Edit API format - requires image_urls array (max 10 images)
        if (effectiveReferenceImages.length === 0) {
          throw new Error("Nano Banana Edit requires at least one reference image");
        }
        
        const maxImages = 10;
        const limitedImages = effectiveReferenceImages.slice(0, maxImages);
        console.log(`Nano Banana Edit: Using ${limitedImages.length} reference images (max ${maxImages})`);
        
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            image_urls: limitedImages, // Array of up to 10 images
            output_format: "png",
            image_size: aspectRatio || "1:1"
          }
        };
      } else if (modelConfig.apiType === 'ideogram-edit') {
        // Ideogram V3 Edit API format - inpainting with mask
        if (!effectiveReferenceImage) {
          throw new Error("Ideogram Edit requires a reference image");
        }
        if (!maskImage) {
          throw new Error("Ideogram Edit requires a mask image");
        }
        
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            image_url: effectiveReferenceImage,
            mask_url: maskImage,
            rendering_speed: "BALANCED",
            expand_prompt: true,
            num_images: "1"
          }
        };
      } else if (modelConfig.apiType === 'ideogram-character') {
        // Ideogram Character API format - character-consistent generation
        if (!effectiveReferenceImage) {
          throw new Error("Ideogram Character requires a reference image");
        }
        
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            reference_image_urls: [effectiveReferenceImage],
            rendering_speed: "BALANCED",
            style: "AUTO",
            expand_prompt: true,
            num_images: "1",
            image_size: aspectRatio === "1:1" ? "square_hd" : 
                       aspectRatio === "16:9" ? "landscape_16_9" : 
                       aspectRatio === "9:16" ? "portrait_16_9" : 
                       aspectRatio === "4:3" ? "landscape_4_3" : "square_hd",
            negative_prompt: ""
          }
        };
      } else if (modelConfig.apiType === 'nano-banana-pro') {
        // Nano Banana Pro API format - supports optional img-to-img with image_input array (max 8 images)
        const maxImages = 8;
        const limitedImages = effectiveReferenceImages.slice(0, maxImages);
        
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            aspect_ratio: aspectRatio || "1:1",
            resolution: "1K",
            output_format: "png"
          }
        };
        
        // Add reference images if provided (img-to-img) - uses image_input array (max 8 images)
        if (limitedImages.length > 0) {
          requestBody.input.image_input = limitedImages;
          console.log(`Nano Banana Pro: Using ${limitedImages.length} reference images (max ${maxImages})`);
        }
      } else if (modelConfig.apiType === 'seedream-4.5') {
        // Seedream 4.5 Edit API format - supports image_urls array (max 12 images)
        const maxImages = 12;
        const limitedImages = effectiveReferenceImages.slice(0, maxImages);
        
        if (effectiveReferenceImages.length === 0) {
          throw new Error("Seedream 4.5 requires at least one reference image");
        }
        
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            image_urls: limitedImages,
            aspect_ratio: aspectRatio || "1:1",
            quality: "basic"
          }
        };
        
        console.log(`Seedream 4.5: Using ${limitedImages.length} reference images (max ${maxImages})`);
      } else if (modelConfig.apiType === 'z-image') {
        // Z-Image API format - text-to-image only
        requestBody = {
          model: modelConfig.model,
          callBackUrl: callbackUrl,
          input: {
            prompt: prompt,
            aspect_ratio: aspectRatio || "1:1"
          }
        };
      }

      // Add DB record ID to callback payload so webhook can identify which record to update
      requestBody.metadata = { db_id: dbData.id };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

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

      generatedImages.push(dbData);
    }

    console.log(`All ${numberOfImages} image generations started, callbacks will update when ready`);

    // Return immediately - callbacks will complete the process
    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages,
        count: numberOfImages
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
