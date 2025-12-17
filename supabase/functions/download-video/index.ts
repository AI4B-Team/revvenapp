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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[VIDEO-DOWNLOADER] Processing URL:", url.substring(0, 100));

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      console.error("[VIDEO-DOWNLOADER] RAPIDAPI_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and normalize URL
    let cleanUrl = url.trim();
    
    // Handle YouTube shorts
    if (cleanUrl.includes('youtube.com/shorts/')) {
      const videoId = cleanUrl.match(/shorts\/([a-zA-Z0-9_-]+)/)?.[1];
      if (videoId) {
        cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Remove tracking parameters
    cleanUrl = cleanUrl.split('?si=')[0];
    
    // Add www if missing for youtube.com
    if (cleanUrl.includes('youtube.com') && !cleanUrl.includes('www.youtube.com')) {
      cleanUrl = cleanUrl.replace('youtube.com', 'www.youtube.com');
    }

    console.log("[VIDEO-DOWNLOADER] Cleaned URL:", cleanUrl);

    // Call snap-video3 API
    const response = await fetch("https://snap-video3.p.rapidapi.com/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "snap-video3.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: `url=${encodeURIComponent(cleanUrl)}`,
    });

    const responseText = await response.text();
    console.log("[VIDEO-DOWNLOADER] API raw response:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("[VIDEO-DOWNLOADER] API error:", response.status, responseText);
      return new Response(
        JSON.stringify({ success: false, error: `API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[VIDEO-DOWNLOADER] Failed to parse response:", responseText.substring(0, 200));
      return new Response(
        JSON.stringify({ success: false, error: "Invalid response from video service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[VIDEO-DOWNLOADER] Parsed response:", JSON.stringify(data).substring(0, 500));

    // Extract video info
    const title = data.title || data.meta?.title || "Video";
    const thumbnail = data.thumbnail || data.meta?.thumbnail || "";
    const duration = data.duration || data.meta?.duration || null;
    const source = data.source || "unknown";

    // Extract media URLs with quality info
    const medias: Array<{ url: string; quality: string; extension: string; size?: number }> = [];

    // Strategy 1: medias array
    if (data.medias && Array.isArray(data.medias)) {
      for (const media of data.medias) {
        if (media.url) {
          medias.push({
            url: media.url,
            quality: media.quality || media.resolution || "Standard",
            extension: media.extension || media.type || "mp4",
            size: media.size || media.filesize,
          });
        }
      }
    }

    // Strategy 2: url array
    if (medias.length === 0 && data.url && Array.isArray(data.url)) {
      for (const item of data.url) {
        if (typeof item === "string") {
          medias.push({ url: item, quality: "Standard", extension: "mp4" });
        } else if (item.url) {
          medias.push({
            url: item.url,
            quality: item.quality || "Standard",
            extension: item.ext || "mp4",
            size: item.size,
          });
        }
      }
    }

    // Strategy 3: single url
    if (medias.length === 0 && data.url && typeof data.url === "string") {
      medias.push({ url: data.url, quality: "Standard", extension: "mp4" });
    }

    // Strategy 4: downloadUrl
    if (medias.length === 0 && data.downloadUrl) {
      medias.push({ url: data.downloadUrl, quality: "Standard", extension: "mp4" });
    }

    // Strategy 5: video_url
    if (medias.length === 0 && data.video_url) {
      medias.push({ url: data.video_url, quality: "Standard", extension: "mp4" });
    }

    if (medias.length === 0) {
      console.error("[VIDEO-DOWNLOADER] No media URLs found in response");
      return new Response(
        JSON.stringify({ success: false, error: "No downloadable media found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[VIDEO-DOWNLOADER] Found", medias.length, "media options");

    return new Response(
      JSON.stringify({
        success: true,
        videoInfo: {
          title,
          thumbnail,
          duration,
          source,
          medias,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[VIDEO-DOWNLOADER] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
