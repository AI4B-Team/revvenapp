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

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { video_id, character, video } = await req.json();

    if (!video_id) {
      throw new Error("video_id is required");
    }

    console.log("Starting n8n webhook call for video:", video_id);

    // Call n8n webhook from the backend (no browser CORS here)
    const webhookResponse = await fetch(
      "https://realcreator.app.n8n.cloud/webhook-test/36a23325-e14a-46bb-be52-c37e66ae88d6",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_id, character, video }),
      }
    );

    if (!webhookResponse.ok) {
      console.error("n8n webhook failed:", webhookResponse.status, webhookResponse.statusText);
      throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    console.log("n8n webhook succeeded, reading video binary...");

    const videoArrayBuffer = await webhookResponse.arrayBuffer();
    const videoBlob = new Blob([videoArrayBuffer], { type: "video/mp4" });

    // Upload video to Cloudinary using unsigned preset
    const formData = new FormData();
    formData.append("file", videoBlob, `video_${video_id}.mp4`);
    formData.append("upload_preset", "revven");

    console.log("Uploading video to Cloudinary...");

    const cloudinaryResponse = await fetch(
      "https://api.cloudinary.com/v1_1/dszt275xv/video/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      console.error("Cloudinary upload failed:", cloudinaryResponse.status, cloudinaryResponse.statusText);
      throw new Error("Failed to upload video to Cloudinary");
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log("Video uploaded to Cloudinary:", cloudinaryData.secure_url);

    // Update database with video URL and status
    const { error: updateError } = await supabase
      .from("ai_videos")
      .update({
        video_url: cloudinaryData.secure_url,
        status: "completed",
        completed_at: new Date().toISOString(),
        webhook_response: {
          source: "generate-video-edge-function",
          cloudinary_public_id: cloudinaryData.public_id ?? null,
        },
      })
      .eq("id", video_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Video status updated successfully for:", video_id);

    return new Response(
      JSON.stringify({
        success: true,
        video_url: cloudinaryData.secure_url,
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
