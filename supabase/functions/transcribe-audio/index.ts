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

    // Step 1: Upload audio to Cloudinary to get a URL
    const cloudName = "dszt275xv";
    const uploadPreset = "revven";
    
    // Convert base64 to blob
    const base64Data = audioBase64.split(',')[1] || audioBase64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: contentType || 'audio/webm' });
    
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", audioBlob, filename || "audio.webm");
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("resource_type", "video"); // Cloudinary uses 'video' for audio
    cloudinaryFormData.append("folder", "transcribe-audio");

    console.log("Uploading audio to Cloudinary...");
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error("Cloudinary upload error:", errorText);
      throw new Error(`Failed to upload audio: ${errorText}`);
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const audioUrl = cloudinaryData.secure_url;
    console.log("Audio uploaded to Cloudinary:", audioUrl);

    // Step 2: Call KIE.AI ElevenLabs Speech-to-Text API
    console.log("Calling KIE.AI Speech-to-Text API...");
    const sttResponse = await fetch("https://api.kie.ai/api/v1/elevenlabs/speech-to-text", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: "en",
      }),
    });

    if (!sttResponse.ok) {
      const errorText = await sttResponse.text();
      console.error("KIE.AI STT error:", sttResponse.status, errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const sttResult = await sttResponse.json();
    console.log("KIE.AI STT response:", JSON.stringify(sttResult).substring(0, 200));

    // Extract text from response - KIE.AI may return text in different formats
    let transcribedText = "";
    if (sttResult.text) {
      transcribedText = sttResult.text;
    } else if (sttResult.data?.text) {
      transcribedText = sttResult.data.text;
    } else if (sttResult.transcript) {
      transcribedText = sttResult.transcript;
    } else if (typeof sttResult === 'string') {
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
