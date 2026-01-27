import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secrets = {
      INSTAGRAM_CLIENT_SECRET: Deno.env.get("INSTAGRAM_CLIENT_SECRET") || null,
      INSTAGRAM_CLIENT_ID: Deno.env.get("INSTAGRAM_CLIENT_ID") || null,
      INSTAGRAM_VERIFY_TOKEN: Deno.env.get("INSTAGRAM_VERIFY_TOKEN") || null,
      RAPIDAPI_INSTAGRAM_KEY: Deno.env.get("RAPIDAPI_INSTAGRAM_KEY") || null,
      FACEBOOK_APP_ID: Deno.env.get("FACEBOOK_APP_ID") || null,
      FACEBOOK_APP_SECRET: Deno.env.get("FACEBOOK_APP_SECRET") || null,
      YOUTUBE_CLIENT_ID: Deno.env.get("YOUTUBE_CLIENT_ID") || null,
      YOUTUBE_CLIENT_SECRET: Deno.env.get("YOUTUBE_CLIENT_SECRET") || null,
      CLOUDINARY_API_KEY: Deno.env.get("CLOUDINARY_API_KEY") || null,
      CLOUDINARY_CLOUD_NAME: Deno.env.get("CLOUDINARY_CLOUD_NAME") || null,
      PEXELS_API_KEY: Deno.env.get("PEXELS_API_KEY") || null,
      SUBMAGIC_API_KEY: Deno.env.get("SUBMAGIC_API_KEY") || null,
      JSON2VIDEO_API_KEY: Deno.env.get("JSON2VIDEO_API_KEY") || null,
      SHOTSTACK_API_KEY: Deno.env.get("SHOTSTACK_API_KEY") || null,
      SHOTSTACK_OWNER_ID: Deno.env.get("SHOTSTACK_OWNER_ID") || null,
      ELEVENLABS_API_KEY_1: Deno.env.get("ELEVENLABS_API_KEY_1") || null,
      RAPIDAPI_KEY: Deno.env.get("RAPIDAPI_KEY") || null,
      ELEVENLABS_API_KEY: Deno.env.get("ELEVENLABS_API_KEY") || null,
      OPENROUTER_API_KEY: Deno.env.get("OPENROUTER_API_KEY") || null,
      KIE_AI_API_KEY: Deno.env.get("KIE_AI_API_KEY") || null,
      LOVABLE_API_KEY: Deno.env.get("LOVABLE_API_KEY") || null,
      CLOUDINARY_API_SECRET: Deno.env.get("CLOUDINARY_API_SECRET") || null,
    };

    return new Response(JSON.stringify(secrets), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching secrets:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch secrets" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
