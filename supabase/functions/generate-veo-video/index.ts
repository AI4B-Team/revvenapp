import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log("generate-veo-video function invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const kieApiKey = Deno.env.get("KIE_AI_API_KEY");

    if (!supabaseUrl || !supabaseKey || !kieApiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { 
      prompt, 
      imageUrls, 
      model = 'veo3_fast',
      aspectRatio = '16:9',
      duration = '10',
      userId,
      characterId,
      characterName,
      characterBio,
      characterImageUrl
    } = await req.json();

    if (!prompt || !userId) {
      throw new Error("prompt and userId are required");
    }

    console.log("Creating ai_videos record...");

    // Ensure character_id is either a valid UUID or null
    const safeCharacterId =
      characterId && /^[0-9a-fA-F-]{36}$/.test(characterId)
        ? characterId
        : null;

    // Create the video record with status 'pending'
    const { data: videoRecord, error: insertError } = await supabase
      .from('ai_videos')
      .insert({
        user_id: userId,
        character_id: safeCharacterId,
        character_name: characterName || 'Unknown',
        character_bio: characterBio || '',
        character_image_url: characterImageUrl || '',
        video_topic: prompt,
        video_script: prompt,
        video_style: model.startsWith('sora') ? 'sora' : model.startsWith('kling') ? 'kling' : 'veo',
        video_generation_model: model,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError || !videoRecord) {
      console.error("Failed to create video record:", insertError);
      throw new Error("Failed to create video record");
    }

    console.log("Video record created with ID:", videoRecord.id);

    const callbackUrl = `${supabaseUrl}/functions/v1/veo-webhook-callback`;
    console.log("Using callback URL:", callbackUrl);

    let apiResponse;
    let taskId;

    // Check if this is a Sora model
    if (model === 'sora-2-pro' || model === 'sora-2-pro-storyboard') {
      // Use the /api/v1/jobs/createTask endpoint for Sora 2 Pro
      console.log("Using Sora 2 Pro API");

      // Convert aspect ratio to Sora format
      let soraAspectRatio = 'landscape';
      if (aspectRatio === '9:16') {
        soraAspectRatio = 'portrait';
      } else if (aspectRatio === '16:9') {
        soraAspectRatio = 'landscape';
      }

      // Parse duration to valid n_frames value (10, 15, or 25)
      let nFrames = '10';
      const durationNum = parseInt(duration) || 10;
      if (durationNum <= 10) {
        nFrames = '10';
      } else if (durationNum <= 15) {
        nFrames = '15';
      } else {
        nFrames = '25';
      }

      // Create shots array from the prompt
      // For single prompt, create one shot with full duration
      const durationSeconds = parseInt(nFrames);
      const shots = [
        {
          Scene: prompt,
          duration: durationSeconds
        }
      ];

      const soraPayload: any = {
        model: 'sora-2-pro-storyboard',
        callBackUrl: callbackUrl,
        input: {
          n_frames: nFrames,
          aspect_ratio: soraAspectRatio,
          shots: shots
        }
      };

      // Add reference images if provided
      if (imageUrls && imageUrls.length > 0) {
        soraPayload.input.image_urls = imageUrls;
        console.log("Using reference images for Sora:", imageUrls);
      }

      console.log("Sora API payload:", JSON.stringify(soraPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(soraPayload),
      });

    } else if (model === 'kling-2.5') {
      // Use the /api/v1/jobs/createTask endpoint for Kling 2.5
      console.log("Using Kling 2.5 API");

      // Kling 2.5 uses 5 or 10 second durations
      let klingDuration = '5';
      const durationNum = parseInt(duration) || 10;
      if (durationNum > 5) {
        klingDuration = '10';
      }

      // Convert aspect ratio to Kling format (16:9, 9:16, 1:1)
      let klingAspectRatio = '16:9';
      if (aspectRatio === '9:16') {
        klingAspectRatio = '9:16';
      } else if (aspectRatio === '1:1') {
        klingAspectRatio = '1:1';
      }

      const klingPayload: any = {
        model: 'kling/v2-5-turbo-text-to-video-pro',
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt,
          duration: klingDuration,
          aspect_ratio: klingAspectRatio,
          negative_prompt: 'blur, distort, and low quality',
          cfg_scale: 0.5
        }
      };

      console.log("Kling 2.5 API payload:", JSON.stringify(klingPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(klingPayload),
      });

    } else if (model === 'kling-2.1') {
      // Use the /api/v1/jobs/createTask endpoint for Kling 2.1 (image-to-video)
      console.log("Using Kling 2.1 API");

      // Kling 2.1 uses 5 or 10 second durations
      let klingDuration = '5';
      const durationNum = parseInt(duration) || 10;
      if (durationNum > 5) {
        klingDuration = '10';
      }

      const klingPayload: any = {
        model: 'kling/v2-1-master-image-to-video',
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt,
          duration: klingDuration,
          negative_prompt: 'blur, distort, low quality, pixelated',
          cfg_scale: 0.5
        }
      };

      // Kling 2.1 requires a single image_url for image-to-video
      if (imageUrls && imageUrls.length > 0) {
        klingPayload.input.image_url = imageUrls[0];
        console.log("Using reference image for Kling 2.1:", imageUrls[0]);
      }

      console.log("Kling 2.1 API payload:", JSON.stringify(klingPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(klingPayload),
      });

    } else if (model === 'wan-2.5') {
      // Use the /api/v1/jobs/createTask endpoint for Wan 2.5 (image-to-video)
      console.log("Using Wan 2.5 API");

      // Wan 2.5 uses 5 or 10 second durations
      let wanDuration = '5';
      const durationNum = parseInt(duration) || 10;
      if (durationNum > 5) {
        wanDuration = '10';
      }

      const wanPayload: any = {
        model: 'wan/2-5-image-to-video',
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt.substring(0, 800), // Wan 2.5 has 800 char limit
          duration: wanDuration,
          resolution: '1080p',
          negative_prompt: 'blur, distort, low quality, pixelated',
          enable_prompt_expansion: true
        }
      };

      // Wan 2.5 requires a single image_url for image-to-video
      if (imageUrls && imageUrls.length > 0) {
        wanPayload.input.image_url = imageUrls[0];
        console.log("Using reference image for Wan 2.5:", imageUrls[0]);
      }

      console.log("Wan 2.5 API payload:", JSON.stringify(wanPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wanPayload),
      });

    } else if (model === 'wan-2.2') {
      // Wan 2.2 supports both text-to-video and image-to-video
      const hasReferenceImage = imageUrls && imageUrls.length > 0;
      const wanModel = hasReferenceImage 
        ? 'wan/2-2-a14b-image-to-video-turbo' 
        : 'wan/2-2-a14b-text-to-video-turbo';
      
      console.log(`Using Wan 2.2 API (${hasReferenceImage ? 'image-to-video' : 'text-to-video'})`);

      // Map aspect ratio to Wan 2.2 format
      let wanAspectRatio = hasReferenceImage ? 'auto' : '16:9';
      if (aspectRatio === '9:16') {
        wanAspectRatio = '9:16';
      } else if (aspectRatio === '1:1') {
        wanAspectRatio = '1:1';
      } else if (aspectRatio === '16:9') {
        wanAspectRatio = '16:9';
      }

      const wanPayload: any = {
        model: wanModel,
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt, // Wan 2.2 supports up to 5000 chars
          resolution: '720p',
          aspect_ratio: wanAspectRatio,
          enable_prompt_expansion: true,
          acceleration: 'none'
        }
      };

      // Add image_url for image-to-video mode
      if (hasReferenceImage) {
        wanPayload.input.image_url = imageUrls[0];
        console.log("Using reference image for Wan 2.2:", imageUrls[0]);
      }

      console.log("Wan 2.2 API payload:", JSON.stringify(wanPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wanPayload),
      });

    } else {
      // Use the Veo API for veo3 and veo3_fast models
      console.log("Using Veo API");

      const veoPayload: any = {
        prompt,
        model,
        aspectRatio,
        callBackUrl: callbackUrl,
        enableTranslation: true
      };

      // Add imageUrls if provided (for image-to-video)
      if (imageUrls && imageUrls.length > 0) {
        veoPayload.imageUrls = imageUrls;
        console.log("Using reference images for video generation:", imageUrls);
        
        // Determine generation type based on number of images
        if (imageUrls.length === 1) {
          veoPayload.generationType = 'IMAGE_2_VIDEO';
        } else if (imageUrls.length === 2) {
          veoPayload.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
        } else if (imageUrls.length >= 3) {
          veoPayload.generationType = 'REFERENCE_2_VIDEO';
        }
      } else {
        veoPayload.generationType = 'TEXT_2_VIDEO';
        console.log("No reference images, using TEXT_2_VIDEO mode");
      }

      console.log("Veo API payload:", JSON.stringify(veoPayload, null, 2));

      apiResponse = await fetch("https://api.kie.ai/api/v1/veo/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(veoPayload),
      });
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("KIE.AI API error:", apiResponse.status, errorText);
      
      // Update video record with error status
      await supabase
        .from('ai_videos')
        .update({
          status: 'error',
          error_message: errorText,
          webhook_response: { error: errorText }
        })
        .eq('id', videoRecord.id);
      
      throw new Error(`KIE.AI API failed: ${apiResponse.status} ${errorText}`);
    }

    const apiResult = await apiResponse.json();
    console.log("KIE.AI API response:", JSON.stringify(apiResult, null, 2));

    // Check for KIE.AI error response (code !== 200 in body even if HTTP 200)
    if (apiResult.code && apiResult.code !== 200) {
      const errorMsg = apiResult.msg || apiResult.message || 'Unknown KIE.AI error';
      console.error("KIE.AI API error in response body:", apiResult.code, errorMsg);
      
      await supabase
        .from('ai_videos')
        .update({
          status: 'error',
          error_message: errorMsg,
          webhook_response: apiResult
        })
        .eq('id', videoRecord.id);
      
      throw new Error(`KIE.AI API error: ${errorMsg}`);
    }

    // Store the task ID for tracking
    taskId = apiResult.data?.taskId || apiResult.data?.id;
    
    if (taskId) {
      await supabase
        .from('ai_videos')
        .update({
          status: 'processing',
          webhook_response: { taskId, apiResult }
        })
        .eq('id', videoRecord.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video generation started",
        video_id: videoRecord.id,
        task_id: taskId,
        data: apiResult
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-veo-video function:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
