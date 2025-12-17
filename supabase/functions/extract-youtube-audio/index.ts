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

    // Get video details
    const detailsResponse = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
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
    console.log("Video duration:", videoDetails.lengthInSeconds, "seconds");

    // Now use the download endpoint to get actual downloadable content
    const audios = videoDetails.audios?.items || [];
    console.log("Audio streams found:", audios.length);
    
    if (audios.length === 0) {
      throw new Error("No audio streams found for this video");
    }

    // Find best audio - prefer m4a
    let bestAudio = audios.find((a: any) => a.extension === 'm4a') ||
                    audios.find((a: any) => a.extension === 'webm') ||
                    audios[0];

    console.log("Selected audio:", bestAudio.extension, bestAudio.quality, "itag:", bestAudio.itag);

    // Use the download endpoint with itag
    const downloadResponse = await fetch(
      `https://youtube-media-downloader.p.rapidapi.com/v2/video/file/audio?videoId=${videoId}&itag=${bestAudio.itag}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "youtube-media-downloader.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error("Download error:", downloadResponse.status, errorText);
      
      // If file endpoint fails, try using the direct URL with headers
      console.log("Trying direct URL download...");
      if (bestAudio.url) {
        const directResponse = await fetch(bestAudio.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "*/*",
            "Referer": "https://www.youtube.com/",
          },
        });
        
        if (!directResponse.ok) {
          throw new Error(`Both download methods failed. Direct: ${directResponse.status}`);
        }
        
        const audioBuffer = await directResponse.arrayBuffer();
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
            filename: `${videoDetails.title || videoId}.${bestAudio.extension || 'm4a'}`,
            contentType: `audio/${bestAudio.extension || 'mp4'}`,
            title: videoDetails.title,
            duration: videoDetails.lengthInSeconds,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Download failed: ${downloadResponse.status}`);
    }

    // Get the audio content
    const audioBuffer = await downloadResponse.arrayBuffer();
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
        filename: `${videoDetails.title || videoId}.${bestAudio.extension || 'm4a'}`,
        contentType: downloadResponse.headers.get('content-type') || `audio/${bestAudio.extension || 'mp4'}`,
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
