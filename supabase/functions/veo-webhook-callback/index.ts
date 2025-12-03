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
    console.log("veo-webhook-callback invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const cloudinaryApiKey = Deno.env.get("CLOUDINARY_API_KEY") || "357119741731559";
    const cloudinaryApiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    const cloudinaryCloudName = "dszt275xv";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the callback payload from KIE.AI
    const payload = await req.json();
    console.log("Received callback payload:", JSON.stringify(payload, null, 2));

    const { status, videoUrl, data, code, msg } = payload;
    const taskId = payload.taskId || data?.taskId;

    if (!taskId) {
      throw new Error("taskId is required in callback");
    }

    // Find the video record by taskId stored in webhook_response
    const { data: videos, error: findError } = await supabase
      .from('ai_videos')
      .select('*')
      .contains('webhook_response', { taskId });

    if (findError || !videos || videos.length === 0) {
      console.error("Could not find video with taskId:", taskId);
      throw new Error("Video record not found");
    }

    const videoRecord = videos[0];
    console.log("Found video record:", videoRecord.id);

    // Extract video URL from various possible locations in the payload
    let finalVideoUrl = videoUrl || 
      data?.videoUrl || 
      data?.url ||
      data?.info?.resultUrls?.[0] ||
      data?.info?.result_urls?.[0];

    // Check for Sora/Kling-style response with resultJson
    if (!finalVideoUrl && data?.resultJson) {
      try {
        const resultData = typeof data.resultJson === 'string' 
          ? JSON.parse(data.resultJson) 
          : data.resultJson;
        finalVideoUrl = resultData?.resultUrls?.[0];
        console.log("Extracted URL from resultJson:", finalVideoUrl);
      } catch (parseError) {
        console.error("Failed to parse resultJson:", parseError);
      }
    }

    // Check if this is a success response
    const isSuccess = code === 200 || status === 'success' || data?.state === 'success' || !!finalVideoUrl;

    if (isSuccess && finalVideoUrl) {
      console.log("Video generation successful, URL:", finalVideoUrl);

      // Use Cloudinary's URL-based upload to avoid memory issues
      let cloudinaryUrl = finalVideoUrl;
      
      if (cloudinaryApiSecret) {
        try {
          console.log("Uploading video to Cloudinary via URL fetch...");
          
          const timestamp = Math.floor(Date.now() / 1000);
          const signatureString = `folder=veo_videos&timestamp=${timestamp}${cloudinaryApiSecret}`;
          const encoder = new TextEncoder();
          const hashData = encoder.encode(signatureString);
          const hashBuffer = await crypto.subtle.digest("SHA-1", hashData);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          // Use Cloudinary's URL-based upload (pass URL directly, no download)
          const formData = new FormData();
          formData.append("file", finalVideoUrl); // Pass URL directly
          formData.append("api_key", cloudinaryApiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signature);
          formData.append("folder", "veo_videos");
          formData.append("resource_type", "video");

          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`,
            { method: "POST", body: formData }
          );

          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            cloudinaryUrl = cloudinaryData.secure_url;
            console.log("Video uploaded to Cloudinary:", cloudinaryUrl);
          } else {
            const errorText = await cloudinaryResponse.text();
            console.error("Cloudinary upload failed:", errorText);
            // Continue with original URL
          }
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          // Continue with original URL
        }
      }

      // Update the video record
      const { error: updateError } = await supabase
        .from('ai_videos')
        .update({
          video_url: cloudinaryUrl,
          status: 'completed',
          completed_at: new Date().toISOString(),
          webhook_response: { ...videoRecord.webhook_response, callback: payload }
        })
        .eq('id', videoRecord.id);

      if (updateError) {
        console.error("Error updating video record:", updateError);
        throw updateError;
      }

      console.log("Video record updated successfully");

      return new Response(
        JSON.stringify({ success: true, message: "Video processed successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // Handle error status
      const errorMessage = data?.failMsg || msg || 'Video generation failed';
      console.log("Video generation failed:", errorMessage);
      
      const { error: updateError } = await supabase
        .from('ai_videos')
        .update({
          status: 'error',
          error_message: errorMessage,
          webhook_response: { 
            ...videoRecord.webhook_response, 
            callback: payload,
            error: errorMessage,
            errorCode: code,
            failCode: data?.failCode
          }
        })
        .eq('id', videoRecord.id);

      if (updateError) {
        console.error("Error updating video record:", updateError);
      }

      return new Response(
        JSON.stringify({ success: false, message: "Video generation failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in veo-webhook-callback:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
