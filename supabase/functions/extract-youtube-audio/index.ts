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

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    console.log("Fetching YouTube video details for:", videoId);

    // Get video details with audios
    const detailsResponse = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&audios=auto`,
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
      console.error("RapidAPI details error:", detailsResponse.status, errorText);
      throw new Error(`Failed to fetch video details: ${detailsResponse.status}`);
    }

    const videoDetails = await detailsResponse.json();
    console.log("Video title:", videoDetails.title);

    // Log the full audios structure to understand it
    const audios = videoDetails.audios?.items || [];
    console.log("Audio streams found:", audios.length);
    
    if (audios.length > 0) {
      console.log("First audio item keys:", Object.keys(audios[0]));
      console.log("First audio item:", JSON.stringify(audios[0]).substring(0, 500));
    }
    
    if (audios.length === 0) {
      throw new Error("No audio streams found for this video");
    }

    // Find an audio with a working URL - check all fields
    let workingAudio = null;
    let audioUrl = null;

    for (const audio of audios) {
      // Try different possible URL fields
      const possibleUrl = audio.url || audio.downloadUrl || audio.directUrl || audio.streamUrl;
      if (possibleUrl) {
        console.log("Trying audio URL from field, extension:", audio.extension);
        
        // Test if URL is accessible
        try {
          const testResponse = await fetch(possibleUrl, {
            method: 'HEAD',
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Referer": "https://www.youtube.com/",
            },
          });
          
          if (testResponse.ok || testResponse.status === 200 || testResponse.status === 206) {
            workingAudio = audio;
            audioUrl = possibleUrl;
            console.log("Found working URL for:", audio.extension);
            break;
          }
        } catch (e) {
          console.log("URL test failed:", e);
        }
      }
    }

    if (!workingAudio || !audioUrl) {
      // If no direct URL works, return info for manual download
      console.log("No working audio URL found, returning video info only");
      return new Response(
        JSON.stringify({
          success: false,
          error: "YouTube audio URLs are protected and cannot be downloaded directly. Please download the video manually and upload the audio file.",
          videoTitle: videoDetails.title,
          videoDuration: videoDetails.lengthInSeconds,
        }),
        { 
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Downloading audio...");

    // Download the audio
    const audioResponse = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
        "Referer": "https://www.youtube.com/",
        "Range": "bytes=0-",
      },
    });

    if (!audioResponse.ok && audioResponse.status !== 206) {
      throw new Error(`Audio download failed: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log("Audio downloaded, size:", audioBuffer.byteLength, "bytes");

    // Convert to base64
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 32768;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    const audioBase64 = btoa(binaryString);

    return new Response(
      JSON.stringify({
        success: true,
        audioBase64,
        filename: `${videoDetails.title || videoId}.${workingAudio.extension || 'm4a'}`,
        contentType: `audio/${workingAudio.extension || 'mp4'}`,
        title: videoDetails.title,
        duration: videoDetails.lengthInSeconds,
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
