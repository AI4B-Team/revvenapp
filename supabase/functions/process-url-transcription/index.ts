import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { url, recordId, userId } = await req.json();
    
    if (!url || !recordId || !userId) {
      throw new Error("Missing required parameters: url, recordId, userId");
    }

    console.log(`[BG-TRANSCRIBE] Starting background processing for record ${recordId}`);
    console.log(`[BG-TRANSCRIBE] URL: ${url.substring(0, 100)}`);

    // Use EdgeRuntime.waitUntil for background processing
    const backgroundTask = async () => {
      try {
        // Step 1: Extract audio from URL using snap-video3
        console.log(`[BG-TRANSCRIBE] Step 1: Extracting audio from URL...`);
        
        const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
        if (!RAPIDAPI_KEY) {
          throw new Error("RAPIDAPI_KEY not configured");
        }

        const cleanUrl = url.trim();
        const downloadResponse = await fetch("https://snap-video3.p.rapidapi.com/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "snap-video3.p.rapidapi.com"
          },
          body: JSON.stringify({ url: cleanUrl })
        });

        if (!downloadResponse.ok) {
          const errorText = await downloadResponse.text();
          console.error("[BG-TRANSCRIBE] Snap Video API error:", downloadResponse.status, errorText);
          throw new Error(`Failed to extract from URL: ${downloadResponse.status}`);
        }

        const downloadData = await downloadResponse.json();
        console.log("[BG-TRANSCRIBE] Snap Video API response received, title:", downloadData.title);

        let downloadUrl: string | null = null;
        const title = downloadData.title || "media_audio";

        // Extract download URL from medias array
        if (downloadData.medias && Array.isArray(downloadData.medias) && downloadData.medias.length > 0) {
          const media = downloadData.medias.find((m: any) => m.url) || downloadData.medias[0];
          if (media?.url) {
            downloadUrl = media.url;
          }
        }

        if (!downloadUrl && downloadData.url) {
          downloadUrl = downloadData.url;
        }

        if (!downloadUrl) {
          throw new Error("No download URL found in API response");
        }

        console.log(`[BG-TRANSCRIBE] Download URL obtained: ${downloadUrl.substring(0, 100)}...`);

        // Step 2: Upload to Cloudinary
        console.log(`[BG-TRANSCRIBE] Step 2: Uploading to Cloudinary...`);
        
        const CLOUDINARY_CLOUD_NAME = "dszt275xv";
        const CLOUDINARY_UPLOAD_PRESET = "revven";

        const formData = new FormData();
        formData.append("file", downloadUrl);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("resource_type", "video");
        formData.append("folder", "ugc-audio");

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error("[BG-TRANSCRIBE] Cloudinary upload error:", errorText);
          throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const audioUrl = cloudinaryData.secure_url;
        const duration = cloudinaryData.duration || 0;

        console.log(`[BG-TRANSCRIBE] Cloudinary upload complete: ${audioUrl}`);
        console.log(`[BG-TRANSCRIBE] Duration: ${duration}s`);

        // Update record with URL and duration
        await supabase.from('user_voices').update({
          url: audioUrl,
          duration: duration,
          name: title,
        }).eq('id', recordId);

        // Step 3: Transcribe using ElevenLabs
        console.log(`[BG-TRANSCRIBE] Step 3: Transcribing audio...`);
        
        const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
        if (!ELEVENLABS_API_KEY) {
          throw new Error("ELEVENLABS_API_KEY not configured");
        }

        // Fetch audio from Cloudinary
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
        }
        const audioArrayBuffer = await audioResponse.arrayBuffer();
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });

        // Send to ElevenLabs
        const transcribeFormData = new FormData();
        transcribeFormData.append("file", audioBlob, "audio.mp3");
        transcribeFormData.append("model_id", "scribe_v1");
        transcribeFormData.append("tag_audio_events", "false");
        transcribeFormData.append("diarize", "false");

        const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: transcribeFormData,
        });

        if (!transcribeResponse.ok) {
          const errorText = await transcribeResponse.text();
          console.error("[BG-TRANSCRIBE] ElevenLabs error:", transcribeResponse.status, errorText);
          throw new Error(`Transcription failed: ${transcribeResponse.status}`);
        }

        const transcribeResult = await transcribeResponse.json();
        const transcriptText = transcribeResult.text || "";

        console.log(`[BG-TRANSCRIBE] Transcription complete: ${transcriptText.substring(0, 100)}...`);

        // Step 4: Update database record with completed status
        const { error: updateError } = await supabase.from('user_voices').update({
          status: 'completed',
          type: 'transcription',
          prompt: transcriptText,
          url: audioUrl,
          duration: duration,
          name: title,
        }).eq('id', recordId);

        if (updateError) {
          console.error("[BG-TRANSCRIBE] Database update error:", updateError);
          throw updateError;
        }

        console.log(`[BG-TRANSCRIBE] ✅ Successfully completed processing for record ${recordId}`);

      } catch (error) {
        console.error(`[BG-TRANSCRIBE] ❌ Error processing record ${recordId}:`, error);
        
        // Update record with error status
        await supabase.from('user_voices').update({
          status: 'error',
        }).eq('id', recordId);
      }
    };

    // Start background task
    EdgeRuntime.waitUntil(backgroundTask());

    // Return immediately
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Processing started in background",
        recordId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[BG-TRANSCRIBE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
