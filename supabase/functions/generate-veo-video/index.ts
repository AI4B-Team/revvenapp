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

    // Create the video record with status 'pending'
    const { data: videoRecord, error: insertError } = await supabase
      .from('ai_videos')
      .insert({
        user_id: userId,
        character_id: characterId || '',
        character_name: characterName || 'Unknown',
        character_bio: characterBio || '',
        character_image_url: characterImageUrl || '',
        video_topic: prompt,
        video_script: prompt,
        video_style: 'veo',
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

    // Call KIE.AI Veo 3.1 API
    const callbackUrl = `${supabaseUrl}/functions/v1/veo-webhook-callback`;
    console.log("Calling KIE.AI Veo API with callback:", callbackUrl);

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
      
      // Determine generation type based on number of images
      if (imageUrls.length === 1) {
        veoPayload.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      } else if (imageUrls.length === 2) {
        veoPayload.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      } else if (imageUrls.length >= 3) {
        veoPayload.generationType = 'REFERENCE_2_VIDEO';
      }
    } else {
      veoPayload.generationType = 'TEXT_2_VIDEO';
    }

    console.log("Veo API payload:", JSON.stringify(veoPayload, null, 2));

    const veoResponse = await fetch("https://api.kie.ai/api/v1/veo/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${kieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(veoPayload),
    });

    if (!veoResponse.ok) {
      const errorText = await veoResponse.text();
      console.error("KIE.AI API error:", veoResponse.status, errorText);
      
      // Update video record with error status
      await supabase
        .from('ai_videos')
        .update({
          status: 'error',
          webhook_response: { error: errorText }
        })
        .eq('id', videoRecord.id);
      
      throw new Error(`KIE.AI API failed: ${veoResponse.status} ${errorText}`);
    }

    const veoResult = await veoResponse.json();
    console.log("KIE.AI API response:", JSON.stringify(veoResult, null, 2));

    // Store the task ID for tracking
    const taskId = veoResult.data?.taskId || veoResult.data?.id;
    
    if (taskId) {
      await supabase
        .from('ai_videos')
        .update({
          status: 'processing',
          webhook_response: { taskId, veoResult }
        })
        .eq('id', videoRecord.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video generation started",
        video_id: videoRecord.id,
        task_id: taskId,
        data: veoResult
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
