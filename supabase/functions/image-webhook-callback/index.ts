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
    console.log("Image webhook callback received");
    
    const payload = await req.json();
    console.log("Callback payload:", JSON.stringify(payload, null, 2));

    // KIE.AI callback format (current): { code, msg, data: { taskId, info: { resultImageUrl } } }
    const { code, msg, data } = payload;
    
    if (!data?.taskId) {
      throw new Error("Missing taskId in callback payload");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (code === 200) {
      // Success case - download and upload to Cloudinary
      // Different KIE.AI models return the result URL in different places
      //  - Flux: data.info.resultImageUrl or data.response.resultImageUrl
      //  - GPT-4o: data.info.result_urls[0] (array format)
      //  - Seedream: data.resultJson = '{"resultUrls":["https://..."]}'
      let imageUrl = data.info?.resultImageUrl || data.response?.resultImageUrl;

      // GPT-4o format: result_urls array
      if (!imageUrl && data.info?.result_urls && Array.isArray(data.info.result_urls)) {
        imageUrl = data.info.result_urls[0];
      }

      // Fallback for Seedream-style payloads
      if (!imageUrl && data.resultJson) {
        try {
          const parsed = typeof data.resultJson === "string" ? JSON.parse(data.resultJson) : data.resultJson;
          const firstUrl = parsed?.resultUrls?.[0];
          if (firstUrl && typeof firstUrl === "string") {
            imageUrl = firstUrl;
          }
        } catch (e) {
          console.error("Failed to parse resultJson:", e);
        }
      }

      if (!imageUrl) {
        throw new Error("Missing resultImageUrl in callback payload");
      }

      console.log("Image ready, passing URL directly to Cloudinary:", imageUrl);

      // Upload original URL directly to Cloudinary (no base64 conversion to avoid large in-memory buffers)
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
          file: imageUrl,
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
      console.log("Cloudinary upload successful:", uploadData.secure_url);

      // Update database with completed image
      const { error: updateError } = await supabaseClient
        .from("generated_images")
        .update({
          image_url: uploadData.secure_url,
          cloudinary_public_id: uploadData.public_id,
          status: "completed",
        })
        .eq("kie_task_id", data.taskId);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log("Image generation completed successfully");
    } else {
      // Error case
      const errorMessage = data.errorMessage || msg || "Image generation failed";
      console.error("Image generation failed:", errorMessage);

      const { error: updateError } = await supabaseClient
        .from("generated_images")
        .update({
          status: "error",
          error_message: errorMessage,
        })
        .eq("kie_task_id", data.taskId);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Callback processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in image-webhook-callback:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Callback processing failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
