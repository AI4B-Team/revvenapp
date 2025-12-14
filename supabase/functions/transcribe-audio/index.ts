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
    const { audioBase64, filename, contentType } = await req.json();
    
    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    const KIE_AI_API_KEY = Deno.env.get("KIE_AI_API_KEY");
    if (!KIE_AI_API_KEY) {
      throw new Error("KIE_AI_API_KEY is not configured");
    }

    console.log("Transcribing audio:", filename, contentType);

    // Convert base64 to blob for multipart upload
    const base64Data = audioBase64.split(',')[1] || audioBase64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: contentType || 'audio/webm' });

    // Prepare form data for KIE.AI ElevenLabs Speech-to-Text API (batch mode)
    // This mirrors ElevenLabs' /v1/speech-to-text multipart format
    const formData = new FormData();
    formData.append("file", audioBlob, filename || "audio.webm");
    formData.append("model_id", "scribe_v1");
    formData.append("tag_audio_events", "false");
    formData.append("diarize", "false");
    formData.append("language_code", "eng");

    console.log("Calling KIE.AI Speech-to-Text API (multipart)...");
    const sttResponse = await fetch("https://api.kie.ai/api/v1/elevenlabs/speech-to-text", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
      },
      body: formData,
    });

    if (!sttResponse.ok) {
      const errorText = await sttResponse.text();
      console.error("KIE.AI STT error:", sttResponse.status, errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const sttResult = await sttResponse.json();
    console.log("KIE.AI STT response:", JSON.stringify(sttResult).substring(0, 200));

    // Extract text from response - KIE.AI/ElevenLabs may return text in different formats
    let transcribedText = "";
    if (sttResult.text) {
      transcribedText = sttResult.text;
    } else if (sttResult.data?.text) {
      transcribedText = sttResult.data.text;
    } else if (sttResult.transcript) {
      transcribedText = sttResult.transcript;
    } else if (typeof sttResult === "string") {
      transcribedText = sttResult;
    }

    console.log("Transcription success:", transcribedText.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({
        success: true,
        text: transcribedText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
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
