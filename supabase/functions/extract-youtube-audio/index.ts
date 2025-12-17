import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
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

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    console.log("Fetching YouTube video details for:", videoId);

    // Get video details including audio URLs
    const detailsResponse = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "youtube-media-downloader.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error("RapidAPI error:", detailsResponse.status, errorText);
      throw new Error(`Failed to fetch video details: ${detailsResponse.status}`);
    }

    const videoDetails = await detailsResponse.json();
    console.log("Video title:", videoDetails.title);

    // Find the best audio URL
    const audios = videoDetails.audios?.items || [];
    if (audios.length === 0) {
      throw new Error("No audio streams found for this video");
    }

    // Sort by quality and get the best one
    const bestAudio = audios.sort((a: any, b: any) => (b.sizeInBytes || 0) - (a.sizeInBytes || 0))[0];
    const audioUrl = bestAudio.url;

    if (!audioUrl) {
      throw new Error("Could not get audio download URL");
    }

    console.log("Downloading audio from URL...");

    // Download the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log("Audio downloaded, size:", audioBuffer.byteLength, "bytes");

    return new Response(
      JSON.stringify({
        success: true,
        audioBase64,
        filename: `${videoDetails.title || videoId}.mp3`,
        contentType: bestAudio.mimeType || "audio/mp4",
        title: videoDetails.title,
        duration: videoDetails.lengthInSeconds,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
