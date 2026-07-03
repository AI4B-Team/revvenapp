import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatCaptionTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function buildCloudinaryAudioSegmentUrl(audioUrl: string, startSeconds: number, endSeconds: number): string {
  const transform = `so_${Math.max(0, Math.floor(startSeconds))},eo_${Math.max(1, Math.ceil(endSeconds))},f_mp3,q_auto`;
  const [baseUrl, queryString] = audioUrl.split("?");
  const transformedBase = baseUrl
    .replace("/upload/", `/upload/${transform}/`)
    .replace(/\.(mp3|mp4|mov|webm|m4a|wav|aac|ogg)$/i, ".mp3");

  return queryString ? `${transformedBase}?${queryString}` : transformedBase;
}

async function fetchAudioBlob(audioUrl: string, contentType?: string): Promise<Blob> {
  console.log("Fetching audio from URL:", audioUrl.substring(0, 100));
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`);
  }

  const audioArrayBuffer = await audioResponse.arrayBuffer();
  const mimeType = audioResponse.headers.get("content-type") || contentType || "audio/mpeg";
  const audioBlob = new Blob([audioArrayBuffer], { type: mimeType });
  console.log("Fetched audio, size:", audioBlob.size, "type:", mimeType);
  return audioBlob;
}

function base64ToAudioBlob(audioBase64: string, contentType?: string): Blob {
  const base64Data = audioBase64.split(",")[1] || audioBase64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: contentType || "audio/mpeg" });
}

async function transcribeAudioBlob(audioBlob: Blob, filename: string): Promise<{ text: string; words: unknown[] }> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, filename || "audio.mp3");
  formData.append("model_id", "scribe_v2");
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
  console.log("Transcription chunk complete:", result.text?.substring(0, 100));
  return {
    text: result.text || "",
    words: result.words || [],
  };
}

async function processTranscriptionSegment(params: {
  recordId: string;
  audioUrl: string;
  title: string;
  duration: number;
  filename?: string;
  contentType?: string;
  segmentStart?: number;
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Backend credentials are not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const chunkSeconds = 300;
  const segmentStart = Math.max(0, Math.floor(params.segmentStart || 0));
  const safeDuration = Number.isFinite(params.duration) && params.duration > 0
    ? Math.ceil(params.duration)
    : segmentStart + chunkSeconds;
  const segmentEnd = Math.min(safeDuration, segmentStart + chunkSeconds);
  const isCloudinaryUrl = params.audioUrl.includes("res.cloudinary.com") && params.audioUrl.includes("/upload/");
  const segmentUrl = isCloudinaryUrl
    ? buildCloudinaryAudioSegmentUrl(params.audioUrl, segmentStart, segmentEnd)
    : params.audioUrl;

  try {
    console.log(`Transcribing segment ${formatCaptionTime(segmentStart)}-${formatCaptionTime(segmentEnd)}...`);
    const segmentBlob = await fetchAudioBlob(segmentUrl, params.contentType);
    const { text } = await transcribeAudioBlob(segmentBlob, `segment-${segmentStart}-${segmentEnd}.mp3`);
    const segmentTranscript = text.trim() ? `[${formatCaptionTime(segmentStart)}] ${text.trim()}` : "";

    const { data: currentRecord } = await supabase
      .from("user_voices")
      .select("prompt")
      .eq("id", params.recordId)
      .single();

    const existingText = typeof currentRecord?.prompt === "string" && currentRecord.prompt !== "Transcribing..."
      ? currentRecord.prompt
      : "";
    const combinedText = [existingText, segmentTranscript].filter(Boolean).join("\n\n");
    const isComplete = !isCloudinaryUrl || segmentEnd >= safeDuration;

    await supabase.from("user_voices").update({
      status: isComplete ? "completed" : "processing",
      prompt: combinedText || (isComplete ? "Transcription completed" : "Transcribing..."),
      url: params.audioUrl,
      duration: params.duration || safeDuration,
      name: params.title,
      type: "transcription",
      source: "upload",
    }).eq("id", params.recordId);

    if (!isComplete) {
      console.log(`Segment complete; queueing next segment at ${formatCaptionTime(segmentEnd)}.`);
      await fetch(`${supabaseUrl}/functions/v1/transcribe-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
        body: JSON.stringify({
          mode: "transcribe-segment",
          recordId: params.recordId,
          audioUrl: params.audioUrl,
          title: params.title,
          duration: params.duration,
          filename: params.filename,
          contentType: params.contentType,
          segmentStart: segmentEnd,
        }),
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error transcribing segment:", errorMessage);
    await supabase.from("user_voices").update({
      status: "error",
      prompt: `Error: ${errorMessage}`,
    }).eq("id", params.recordId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioBase64, audioUrl, filename, contentType, recordId, title, duration, mode, segmentStart } = await req.json();

    if (mode === "transcribe-segment") {
      if (!recordId || !audioUrl || !title) {
        throw new Error("Missing required segment transcription parameters");
      }

      EdgeRuntime.waitUntil(processTranscriptionSegment({
        recordId,
        audioUrl,
        title,
        duration: Number(duration) || 0,
        filename,
        contentType,
        segmentStart: Number(segmentStart) || 0,
      }));

      return new Response(
        JSON.stringify({ success: true, processing: true, recordId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!audioBase64 && !audioUrl) {
      throw new Error("No audio data provided - need audioBase64 or audioUrl");
    }

    if (recordId && audioUrl) {
      EdgeRuntime.waitUntil(processTranscriptionSegment({
        recordId,
        audioUrl,
        title: title || filename || "Uploaded Audio",
        duration: Number(duration) || 0,
        filename,
        contentType,
        segmentStart: 0,
      }));

      return new Response(
        JSON.stringify({ success: true, processing: true, recordId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Transcribing audio:", filename || "audio file", audioUrl ? "(from URL)" : "(from base64)");

    const audioBlob = audioUrl
      ? await fetchAudioBlob(audioUrl, contentType)
      : base64ToAudioBlob(audioBase64, contentType);
    const result = await transcribeAudioBlob(audioBlob, filename || "audio.mp3");
    console.log("Transcription complete:", result.text?.substring(0, 100));

    return new Response(
      JSON.stringify({
        success: true,
        text: result.text,
        words: result.words,
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