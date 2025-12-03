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
    console.log("check-video-status invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const kieApiKey = Deno.env.get("KIE_AI_API_KEY");
    const cloudinaryApiKey = Deno.env.get("CLOUDINARY_API_KEY") || "357119741731559";
    const cloudinaryApiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    const cloudinaryCloudName = "dszt275xv";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!kieApiKey) {
      throw new Error("Missing KIE_AI_API_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { videoId } = await req.json();

    // Find the video record
    let query = supabase.from('ai_videos').select('*');
    
    if (videoId) {
      query = query.eq('id', videoId);
    } else {
      // Check all processing videos older than 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      query = query.eq('status', 'processing').lt('created_at', twoMinutesAgo);
    }

    const { data: videos, error: findError } = await query;

    if (findError) {
      throw new Error(`Error finding videos: ${findError.message}`);
    }

    if (!videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No processing videos to check", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${videos.length} videos to check`);

    let updated = 0;
    const results = [];

    for (const video of videos) {
      const taskId = video.webhook_response?.taskId || video.webhook_response?.apiResult?.data?.taskId;
      
      if (!taskId) {
        console.log(`Video ${video.id} has no taskId, skipping`);
        continue;
      }

      console.log(`Checking status for video ${video.id}, taskId: ${taskId}`);

      // Query KIE.AI for task status
      const statusResponse = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${kieApiKey}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error(`Failed to get status for task ${taskId}: ${statusResponse.status}`);
        results.push({ videoId: video.id, error: `API error: ${statusResponse.status}` });
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Status response for ${taskId}:`, JSON.stringify(statusData, null, 2));

      const taskState = statusData.data?.state;
      const resultJson = statusData.data?.resultJson;
      const failMsg = statusData.data?.failMsg;

      if (taskState === 'success' && resultJson) {
        // Parse resultJson to get video URL
        let videoUrl = null;
        try {
          const result = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
          videoUrl = result?.resultUrls?.[0];
        } catch (e) {
          console.error("Failed to parse resultJson:", e);
        }

        if (videoUrl) {
          console.log(`Video completed! URL: ${videoUrl}`);

          // Use Cloudinary's URL-based upload to avoid memory issues
          let finalUrl = videoUrl;
          if (cloudinaryApiSecret) {
            try {
              console.log("Uploading video to Cloudinary via URL fetch...");
              
              const timestamp = Math.floor(Date.now() / 1000);
              const signatureString = `folder=ai_videos&timestamp=${timestamp}${cloudinaryApiSecret}`;
              const encoder = new TextEncoder();
              const data = encoder.encode(signatureString);
              const hashBuffer = await crypto.subtle.digest("SHA-1", data);
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

              // Use Cloudinary's URL-based upload (no download needed)
              const formData = new FormData();
              formData.append("file", videoUrl); // Pass URL directly
              formData.append("api_key", cloudinaryApiKey);
              formData.append("timestamp", timestamp.toString());
              formData.append("signature", signature);
              formData.append("folder", "ai_videos");
              formData.append("resource_type", "video");

              const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`,
                { method: "POST", body: formData }
              );

              if (cloudinaryResponse.ok) {
                const cloudinaryData = await cloudinaryResponse.json();
                finalUrl = cloudinaryData.secure_url;
                console.log("Uploaded to Cloudinary:", finalUrl);
              } else {
                const errText = await cloudinaryResponse.text();
                console.error("Cloudinary upload error:", errText);
              }
            } catch (uploadError) {
              console.error("Cloudinary upload error:", uploadError);
            }
          }

          // Update database
          const { error: updateError } = await supabase
            .from('ai_videos')
            .update({
              video_url: finalUrl,
              status: 'completed',
              completed_at: new Date().toISOString(),
              webhook_response: { ...video.webhook_response, polledResult: statusData }
            })
            .eq('id', video.id);

          if (!updateError) {
            updated++;
            results.push({ videoId: video.id, status: 'completed', videoUrl: finalUrl });
          }
        }
      } else if (taskState === 'fail') {
        console.log(`Video failed: ${failMsg}`);
        
        await supabase
          .from('ai_videos')
          .update({
            status: 'error',
            error_message: failMsg || 'Video generation failed',
            webhook_response: { ...video.webhook_response, polledResult: statusData }
          })
          .eq('id', video.id);

        updated++;
        results.push({ videoId: video.id, status: 'error', error: failMsg });
      } else {
        // Still processing
        results.push({ videoId: video.id, status: taskState || 'unknown' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in check-video-status:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
