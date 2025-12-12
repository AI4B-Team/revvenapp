import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("generate-video function invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const kieApiKey = Deno.env.get("KIE_AI_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));

    // Check if this is a Story mode request (KIE.AI sora-2-pro-storyboard)
    if (requestData.isStory) {
      const { shots, nFrames, aspectRatio, imageUrls, userId } = requestData;
      
      console.log("Story mode detected - using KIE.AI sora-2-pro-storyboard");
      console.log("Shots:", JSON.stringify(shots));
      console.log("nFrames:", nFrames);
      console.log("aspectRatio:", aspectRatio);
      console.log("imageUrls:", JSON.stringify(imageUrls));

      if (!kieApiKey) {
        throw new Error("KIE_AI_API_KEY is not configured");
      }

      if (!shots || shots.length === 0) {
        throw new Error("At least one scene/shot is required for Story mode");
      }

      // Validate each shot has meaningful content (minimum 10 characters)
      const validShots = shots.filter((s: any) => s.Scene && s.Scene.trim().length >= 10);
      if (validShots.length === 0) {
        throw new Error("Each scene description must be at least 10 characters long");
      }

      // Log validation results
      console.log(`Validated shots: ${validShots.length} of ${shots.length} passed (min 10 chars)`);
      
      // Use only valid shots
      const shotsToProcess = validShots;

      // Create a record in ai_videos table for tracking
      const { data: videoRecord, error: insertError } = await supabase
        .from('ai_videos')
        .insert({
          user_id: userId,
          video_topic: 'Story Video',
          video_style: 'storyboard',
          video_generation_model: 'sora-2-pro-storyboard',
          character_name: 'Story',
          character_bio: shotsToProcess.map((s: any, i: number) => `Scene ${i + 1}: ${s.Scene}`).join(' | '),
          character_image_url: imageUrls?.[0] || '',
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating video record:", insertError);
        throw insertError;
      }

      console.log("Created Story video record:", videoRecord.id);
      console.log("Image URLs to use:", JSON.stringify(imageUrls));

      // Build callback URL for KIE.AI
      const callbackUrl = `${supabaseUrl}/functions/v1/video-webhook-callback?videoId=${videoRecord.id}&source=kie`;

      // Normalize shot durations to sum exactly to nFrames (required by KIE.AI)
      const targetDuration = parseInt(nFrames || "15");
      const totalShotDuration = shotsToProcess.reduce((sum: number, s: any) => sum + (s.duration || 5), 0);
      
      // Scale shot durations proportionally if they don't match target
      const normalizedShots = shotsToProcess.map((s: any) => ({
        Scene: s.Scene.trim(),
        duration: Math.round((s.duration / totalShotDuration) * targetDuration * 10) / 10
      }));
      
      // Adjust last shot to ensure exact total (handle rounding errors)
      const normalizedTotal = normalizedShots.reduce((sum: number, s: any) => sum + s.duration, 0);
      if (normalizedTotal !== targetDuration && normalizedShots.length > 0) {
        normalizedShots[normalizedShots.length - 1].duration += (targetDuration - normalizedTotal);
        normalizedShots[normalizedShots.length - 1].duration = Math.round(normalizedShots[normalizedShots.length - 1].duration * 10) / 10;
      }
      
      console.log("Normalized shots:", JSON.stringify(normalizedShots), "Target:", targetDuration);

      // Call KIE.AI API for Story/Storyboard
      const kieRequestBody: any = {
        model: "sora-2-pro-storyboard",
        callBackUrl: callbackUrl,
        input: {
          n_frames: nFrames || "15",
          aspect_ratio: aspectRatio || "landscape",
          shots: normalizedShots
        }
      };

      // Add reference image if provided
      if (imageUrls && imageUrls.length > 0) {
        kieRequestBody.input.image_urls = imageUrls;
      }

      console.log("Calling KIE.AI with body:", JSON.stringify(kieRequestBody));

      const kieResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieApiKey}`
        },
        body: JSON.stringify(kieRequestBody)
      });

      const kieResult = await kieResponse.json();
      console.log("KIE.AI response:", JSON.stringify(kieResult));

      if (kieResult.code !== 200) {
        // Update status to error
        await supabase
          .from('ai_videos')
          .update({ 
            status: 'error', 
            error_message: kieResult.message || 'KIE.AI API error' 
          })
          .eq('id', videoRecord.id);
        
        throw new Error(kieResult.message || 'KIE.AI API error');
      }

      // Update record with task ID
      await supabase
        .from('ai_videos')
        .update({ 
          webhook_response: { taskId: kieResult.data?.taskId }
        })
        .eq('id', videoRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Story video generation started. You will be notified when it completes.",
          videoId: videoRecord.id,
          taskId: kieResult.data?.taskId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if this is a Recast mode request (KIE.AI wan/2-2-animate-move or wan/2-2-animate-replace)
    if (requestData.isRecast) {
      const { videoUrl, imageUrl, resolution, userId, recastModel } = requestData;
      
      // Determine which model to use - default to animate-replace
      const modelName = recastModel === 'animate-move' ? 'wan/2-2-animate-move' : 'wan/2-2-animate-replace';
      console.log(`Recast mode detected - using KIE.AI ${modelName}`);

      if (!kieApiKey) {
        throw new Error("KIE_AI_API_KEY is not configured");
      }

      if (!videoUrl || !imageUrl) {
        throw new Error("Both videoUrl and imageUrl are required for Recast mode");
      }

      // Create a record in ai_videos table for tracking
      const { data: videoRecord, error: insertError } = await supabase
        .from('ai_videos')
        .insert({
          user_id: userId,
          video_topic: 'Recast Animation',
          video_style: recastModel || 'animate-replace',
          video_generation_model: modelName,
          character_name: 'Recast',
          character_bio: '',
          character_image_url: imageUrl,
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating video record:", insertError);
        throw insertError;
      }

      console.log("Created video record:", videoRecord.id);

      // Build callback URL for KIE.AI
      const callbackUrl = `${supabaseUrl}/functions/v1/video-webhook-callback?videoId=${videoRecord.id}&source=kie`;

      // Call KIE.AI API for Recast
      const kieRequestBody = {
        model: modelName,
        callBackUrl: callbackUrl,
        input: {
          video_url: videoUrl,
          image_url: imageUrl,
          resolution: resolution || '480p'
        }
      };

      console.log("Calling KIE.AI with body:", JSON.stringify(kieRequestBody));

      const kieResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieApiKey}`
        },
        body: JSON.stringify(kieRequestBody)
      });

      const kieResult = await kieResponse.json();
      console.log("KIE.AI response:", JSON.stringify(kieResult));

      if (kieResult.code !== 200) {
        // Update status to error
        await supabase
          .from('ai_videos')
          .update({ 
            status: 'error', 
            error_message: kieResult.message || 'KIE.AI API error' 
          })
          .eq('id', videoRecord.id);
        
        throw new Error(kieResult.message || 'KIE.AI API error');
      }

      // Update record with task ID
      await supabase
        .from('ai_videos')
        .update({ 
          webhook_response: { taskId: kieResult.data?.taskId }
        })
        .eq('id', videoRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Recast video generation started. You will be notified when it completes.",
          videoId: videoRecord.id,
          taskId: kieResult.data?.taskId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Original n8n-based video generation flow
    const { video_id, character, video } = requestData;

    if (!video_id) {
      throw new Error("video_id is required");
    }

    console.log("Starting async n8n webhook call for video:", video_id);

    // Get the callback URL for n8n to call when video is ready
    const callbackUrl = `${supabaseUrl}/functions/v1/video-webhook-callback`;
    
    console.log("Callback URL for n8n:", callbackUrl);

    // Call n8n webhook to START video generation (should return immediately)
    // n8n will generate the video and POST it back to our callback webhook
    const webhookResponse = await fetch(
      "https://realcreator.app.n8n.cloud/webhook/36a23325-e14a-46bb-be52-c37e66ae88d6",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          video_id, 
          character, 
          video,
          callback_url: callbackUrl
        }),
      }
    );

    if (!webhookResponse.ok) {
      console.error("n8n webhook failed:", webhookResponse.status, webhookResponse.statusText);
      throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    console.log("n8n webhook accepted video generation request successfully");
    
    // n8n should have returned immediately after queuing the job
    // The actual video will be sent to our callback webhook when ready

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video generation started. You will be notified when it completes.",
        video_id: video_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);

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
