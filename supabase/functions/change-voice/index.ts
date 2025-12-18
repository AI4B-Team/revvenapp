import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ElevenLabs voice IDs for different voice styles
const VOICE_STYLES: Record<string, { voiceId: string; settings: { stability: number; similarity_boost: number; style: number } }> = {
  deep: {
    voiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel - deep male voice
    settings: { stability: 0.7, similarity_boost: 0.5, style: 0.3 }
  },
  high: {
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - higher female voice
    settings: { stability: 0.6, similarity_boost: 0.6, style: 0.4 }
  },
  robotic: {
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam - can sound robotic with settings
    settings: { stability: 1.0, similarity_boost: 0.2, style: 0.0 }
  },
  whisper: {
    voiceId: "FGY2WhTYpPnrIDTdsKH5", // Laura - soft female voice
    settings: { stability: 0.9, similarity_boost: 0.5, style: 0.2 }
  },
  echo: {
    voiceId: "SAz9YHcvj6GT2YYXdXww", // River - neutral
    settings: { stability: 0.3, similarity_boost: 0.8, style: 0.7 }
  },
  chipmunk: {
    voiceId: "Xb7hH8MSUJpSbSDYk0k2", // Alice - can sound chipmunk-like
    settings: { stability: 0.4, similarity_boost: 0.3, style: 0.9 }
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const style = formData.get("style") as string || "deep";

    if (!audioFile) {
      throw new Error("Audio file is required");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    const voiceConfig = VOICE_STYLES[style] || VOICE_STYLES.deep;
    
    // Convert audio file to array buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type || "audio/mpeg" });

    // Use ElevenLabs Speech-to-Speech API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("audio", audioBlob, "audio.mp3");
    elevenLabsFormData.append("model_id", "eleven_english_sts_v2");
    elevenLabsFormData.append("voice_settings", JSON.stringify({
      stability: voiceConfig.settings.stability,
      similarity_boost: voiceConfig.settings.similarity_boost,
      style: voiceConfig.settings.style,
      use_speaker_boost: true
    }));

    console.log(`Processing voice change with style: ${style}, voice: ${voiceConfig.voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${voiceConfig.voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: elevenLabsFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get the transformed audio
    const transformedAudio = await response.arrayBuffer();

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", new Blob([transformedAudio], { type: "audio/mpeg" }), "transformed.mp3");
    cloudinaryFormData.append("upload_preset", "revven");
    cloudinaryFormData.append("resource_type", "video"); // Cloudinary uses 'video' for audio

    const cloudinaryResponse = await fetch(
      "https://api.cloudinary.com/v1_1/dszt275xv/video/upload",
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const cloudinaryData = await cloudinaryResponse.json();
    
    if (!cloudinaryData.secure_url) {
      console.error("Cloudinary upload failed:", cloudinaryData);
      throw new Error("Failed to upload transformed audio");
    }

    console.log("Voice transformation complete:", cloudinaryData.secure_url);

    return new Response(
      JSON.stringify({ 
        success: true,
        outputUrl: cloudinaryData.secure_url,
        duration: cloudinaryData.duration
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice change error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to change voice";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
