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

    // Get video details including audio URLs with original access
    const detailsResponse = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=original&videos=auto&audios=auto`,
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
    console.log("Audio streams found:", audios.length);
    
    if (audios.length === 0) {
      throw new Error("No audio streams found for this video");
    }

    // Log audio options for debugging
    audios.forEach((a: any, i: number) => {
      console.log(`Audio ${i}: extension=${a.extension}, quality=${a.quality}, hasUrl=${!!a.url}`);
    });

    // Try to get a working audio URL - prefer mp4/m4a formats
    let bestAudio = audios.find((a: any) => a.extension === 'm4a' && a.url) ||
                    audios.find((a: any) => a.extension === 'mp4' && a.url) ||
                    audios.find((a: any) => a.url);

    if (!bestAudio || !bestAudio.url) {
      throw new Error("No downloadable audio URL found");
    }

    const audioUrl = bestAudio.url;
    console.log("Selected audio format:", bestAudio.extension, "quality:", bestAudio.quality);
    console.log("Downloading audio from URL...");

    // Download the audio file with proper headers
    const audioResponse = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com",
      },
    });

    if (!audioResponse.ok) {
      console.error("Audio download failed:", audioResponse.status);
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Convert to base64 in chunks to avoid memory issues
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 32768;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    const audioBase64 = btoa(binaryString);

    console.log("Audio downloaded, size:", audioBuffer.byteLength, "bytes");

    return new Response(
      JSON.stringify({
        success: true,
        audioBase64,
        filename: `${videoDetails.title || videoId}.${bestAudio.extension || 'mp3'}`,
        contentType: bestAudio.mimeType || `audio/${bestAudio.extension || 'mpeg'}`,
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
