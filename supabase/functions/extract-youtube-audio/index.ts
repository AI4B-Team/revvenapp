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

    // Use cobalt.tools API to extract audio
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: "audio",
        audioFormat: "mp3",
      }),
    });

    if (!cobaltResponse.ok) {
      const errorText = await cobaltResponse.text();
      console.error("Cobalt API error:", cobaltResponse.status, errorText);
      throw new Error(`Audio extraction service error: ${cobaltResponse.status}`);
    }

    const cobaltData = await cobaltResponse.json();
    console.log("Cobalt response status:", cobaltData.status);

    if (cobaltData.status === "error") {
      throw new Error(cobaltData.error?.code || "Failed to extract audio");
    }

    // Get the audio URL
    const audioUrl = cobaltData.url || cobaltData.audio;
    if (!audioUrl) {
      console.log("Cobalt response:", JSON.stringify(cobaltData));
      throw new Error("No audio URL returned from extraction service");
    }

    console.log("Downloading audio from extracted URL...");

    // Download the audio file
    const audioResponse = await fetch(audioUrl);
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

    // Get filename from response headers or use video ID
    const contentDisposition = audioResponse.headers.get('content-disposition');
    let filename = `youtube_${videoId}.mp3`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioBase64,
        filename,
        contentType: audioResponse.headers.get('content-type') || 'audio/mpeg',
        title: cobaltData.filename || filename,
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
