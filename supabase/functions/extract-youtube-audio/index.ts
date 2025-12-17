import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("No YouTube URL provided");
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL - could not extract video ID");
    }

    console.log("Extracting audio for video:", videoId);

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY") || "95ca0bc5aemsh3c366a842c91a7ep1fd154jsn605142776c85";

    // Use snap-video3 API to get download URL
    const downloadResponse = await fetch("https://snap-video3.p.rapidapi.com/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "snap-video3.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: `url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error("Snap Video API error:", downloadResponse.status, errorText);
      throw new Error(`Download API error: ${downloadResponse.status}`);
    }

    const downloadData = await downloadResponse.json();
    console.log("Snap Video API response received, title:", downloadData.title);

    let downloadUrl: string | null = null;
    let title = downloadData.title || `youtube_${videoId}`;
    let extension = "mp4";

    // Extract download URL from medias array (primary source)
    if (downloadData.medias && Array.isArray(downloadData.medias) && downloadData.medias.length > 0) {
      // Prefer smallest file (usually 360p) for faster processing
      const media = downloadData.medias[0];
      downloadUrl = media.url;
      extension = media.extension || "mp4";
      console.log("Found media URL, quality:", media.quality);
    }

    if (!downloadUrl) {
      console.log("No media URL found in response");
      throw new Error("No download URL found in API response");
    }

    // Clean filename
    const safeTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50);
    const filename = `${safeTitle || videoId}.${extension}`;

    // Return the URL directly - let client/Cloudinary handle the download
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl,
        filename,
        contentType: extension === "mp3" ? "audio/mpeg" : "video/mp4",
        title: title,
        duration: downloadData.duration || "0:00",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error extracting YouTube audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
