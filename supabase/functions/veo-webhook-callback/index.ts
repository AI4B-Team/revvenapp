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

    const { taskId, status, videoUrl, data } = payload;

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

    // Handle successful completion
    if (status === 'success' || videoUrl) {
      const finalVideoUrl = videoUrl || data?.videoUrl || data?.url;
      
      if (!finalVideoUrl) {
        throw new Error("No video URL found in callback");
      }

      // Upload to Cloudinary for permanent storage
      let cloudinaryUrl = finalVideoUrl;
      
      if (cloudinaryApiSecret) {
        try {
          console.log("Uploading video to Cloudinary...");
          
          // Download the video
          const videoResponse = await fetch(finalVideoUrl);
          if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.status}`);
          }
          
          const videoBlob = await videoResponse.blob();
          const videoBuffer = await videoBlob.arrayBuffer();
          const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBuffer)));
          
          // Upload to Cloudinary
          const timestamp = Math.floor(Date.now() / 1000);
          const signatureString = `timestamp=${timestamp}${cloudinaryApiSecret}`;
          const signature = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(signatureString)
          );
          const signatureHex = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

          const formData = new FormData();
          formData.append("file", `data:video/mp4;base64,${videoBase64}`);
          formData.append("api_key", cloudinaryApiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signatureHex);
          formData.append("folder", "veo_videos");

          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            cloudinaryUrl = cloudinaryData.secure_url;
            console.log("Video uploaded to Cloudinary:", cloudinaryUrl);
          } else {
            console.error("Cloudinary upload failed, using original URL");
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
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Handle error status
      const { error: updateError } = await supabase
        .from('ai_videos')
        .update({
          status: 'error',
          webhook_response: { ...videoRecord.webhook_response, callback: payload }
        })
        .eq('id', videoRecord.id);

      if (updateError) {
        console.error("Error updating video record:", updateError);
      }

      return new Response(
        JSON.stringify({ success: false, message: "Video generation failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in veo-webhook-callback:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
