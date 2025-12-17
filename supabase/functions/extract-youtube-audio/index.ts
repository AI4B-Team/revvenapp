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

    // Use snap-video3 API to download
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
    console.log("Snap Video API response:", JSON.stringify(downloadData, null, 2));

    // Find audio URL from the response
    let audioUrl: string | null = null;
    let title = downloadData.title || `youtube_${videoId}`;

    // Check for audio in various response formats
    if (downloadData.audio && Array.isArray(downloadData.audio) && downloadData.audio.length > 0) {
      audioUrl = downloadData.audio[0].url || downloadData.audio[0].downloadUrl;
    } else if (downloadData.audioFormats && Array.isArray(downloadData.audioFormats)) {
      const audioFormat = downloadData.audioFormats[0];
      audioUrl = audioFormat.url || audioFormat.downloadUrl;
    } else if (downloadData.url) {
      audioUrl = downloadData.url;
    } else if (downloadData.downloadUrl) {
      audioUrl = downloadData.downloadUrl;
    } else if (downloadData.medias && Array.isArray(downloadData.medias)) {
      // Look for audio media
      const audioMedia = downloadData.medias.find((m: any) => 
        m.type === 'audio' || m.extension === 'mp3' || m.quality?.includes('audio')
      );
      if (audioMedia) {
        audioUrl = audioMedia.url || audioMedia.downloadUrl;
      } else if (downloadData.medias.length > 0) {
        // Use first available media as fallback
        audioUrl = downloadData.medias[0].url || downloadData.medias[0].downloadUrl;
      }
    }

    if (!audioUrl) {
      console.log("Full response structure:", JSON.stringify(downloadData, null, 2));
      throw new Error("No audio URL found in API response");
    }

    console.log("Downloading audio from:", audioUrl);

    // Download the audio file
    const audioResponse = await fetch(audioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
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

    // Clean filename
    const safeTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50);
    const filename = `${safeTitle || videoId}.mp3`;

    return new Response(
      JSON.stringify({
        success: true,
        audioBase64,
        filename,
        contentType: "audio/mpeg",
        title: title,
        duration: 0,
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
