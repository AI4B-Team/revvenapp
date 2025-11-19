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

    console.log("Starting async n8n webhook call for video:", video_id);

    // Get the callback URL for n8n to call when video is ready
    const callbackUrl = `${supabaseUrl}/functions/v1/video-webhook-callback`;
    
    console.log("Callback URL for n8n:", callbackUrl);

    // Call n8n webhook to START video generation (should return immediately)
    // n8n will generate the video and POST it back to our callback webhook
    const webhookResponse = await fetch(
      "https://realcreator.app.n8n.cloud/webhook-test/36a23325-e14a-46bb-be52-c37e66ae88d6",
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
