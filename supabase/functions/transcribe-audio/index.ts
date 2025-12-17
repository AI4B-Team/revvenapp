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
    const { audioBase64, audioUrl, filename, contentType } = await req.json();
    
    if (!audioBase64 && !audioUrl) {
      throw new Error("No audio data provided - need audioBase64 or audioUrl");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    console.log("Transcribing audio:", filename || "audio file", audioUrl ? "(from URL)" : "(from base64)");

    let audioBlob: Blob;

    if (audioUrl) {
      // Fetch audio from URL
      console.log("Fetching audio from URL:", audioUrl.substring(0, 100));
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
      }
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const mimeType = audioResponse.headers.get('content-type') || contentType || 'audio/mpeg';
      audioBlob = new Blob([audioArrayBuffer], { type: mimeType });
      console.log("Fetched audio, size:", audioBlob.size, "type:", mimeType);
    } else {
      // Convert base64 to binary
      const base64Data = audioBase64.split(',')[1] || audioBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const mimeType = contentType || 'audio/mpeg';
      audioBlob = new Blob([bytes], { type: mimeType });
    }
    
    // Prepare form data for ElevenLabs
    const formData = new FormData();
    formData.append("file", audioBlob, filename || "audio.mp3");
    formData.append("model_id", "scribe_v1");
    formData.append("tag_audio_events", "false");
    formData.append("diarize", "false");

    console.log("Sending to ElevenLabs Speech-to-Text API...");
    
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription complete:", result.text?.substring(0, 100));

    return new Response(
      JSON.stringify({
        success: true,
        text: result.text || "",
        words: result.words || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error transcribing audio:", error);
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