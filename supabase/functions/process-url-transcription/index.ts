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

        let cleanUrl = url.trim();
        
        // Clean and normalize YouTube URLs
        // Convert shorts to regular format: youtube.com/shorts/ID -> youtube.com/watch?v=ID
        if (cleanUrl.includes('youtube.com/shorts/')) {
          const videoId = cleanUrl.match(/shorts\/([a-zA-Z0-9_-]+)/)?.[1];
          if (videoId) {
            cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
          }
        }
        
        // Remove tracking parameters (?si=...)
        cleanUrl = cleanUrl.split('?si=')[0];
        
        // Add www if missing for youtube.com
        if (cleanUrl.includes('youtube.com') && !cleanUrl.includes('www.youtube.com')) {
          cleanUrl = cleanUrl.replace('youtube.com', 'www.youtube.com');
        }
        
        console.log("[BG-TRANSCRIBE] Cleaned URL:", cleanUrl);
        
        const downloadResponse = await fetch("https://snap-video3.p.rapidapi.com/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-rapidapi-host": "snap-video3.p.rapidapi.com",
            "x-rapidapi-key": RAPIDAPI_KEY,
          },
          body: `url=${encodeURIComponent(cleanUrl)}`,
        });

        const responseText = await downloadResponse.text();
        console.log("[BG-TRANSCRIBE] Snap Video API raw response:", responseText.substring(0, 500));
        
        if (!downloadResponse.ok) {
          console.error("[BG-TRANSCRIBE] Snap Video API error:", downloadResponse.status, responseText);
          throw new Error(`Failed to extract from URL: ${downloadResponse.status} - ${responseText.substring(0, 100)}`);
        }

        let downloadData;
        try {
          downloadData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[BG-TRANSCRIBE] Failed to parse API response as JSON:", responseText.substring(0, 200));
          throw new Error(`API returned invalid JSON response. Platform may not be supported.`);
        }
        
        console.log("[BG-TRANSCRIBE] Snap Video API parsed response:", JSON.stringify(downloadData).substring(0, 1000));

        let downloadUrl: string | null = null;
        const title = downloadData.title || downloadData.meta?.title || "media_audio";

        // Try multiple extraction strategies
        // 1. medias array (most common)
        if (downloadData.medias && Array.isArray(downloadData.medias) && downloadData.medias.length > 0) {
          const media = downloadData.medias.find((m: any) => m.url) || downloadData.medias[0];
          if (media?.url) {
            downloadUrl = media.url;
          }
        }

        // 2. Direct url field
        if (!downloadUrl && downloadData.url) {
          downloadUrl = downloadData.url;
        }

        // 3. download_url field
        if (!downloadUrl && downloadData.download_url) {
          downloadUrl = downloadData.download_url;
        }

        // 4. video_url or audio_url field
        if (!downloadUrl && (downloadData.video_url || downloadData.audio_url)) {
          downloadUrl = downloadData.video_url || downloadData.audio_url;
        }

        // 5. result object
        if (!downloadUrl && downloadData.result) {
          downloadUrl = downloadData.result.url || downloadData.result.download_url || downloadData.result.video_url;
        }

        // 6. data object
        if (!downloadUrl && downloadData.data) {
          downloadUrl = downloadData.data.url || downloadData.data.download_url;
          if (!downloadUrl && downloadData.data.medias && downloadData.data.medias.length > 0) {
            downloadUrl = downloadData.data.medias[0].url;
          }
        }

        if (!downloadUrl) {
          console.error("[BG-TRANSCRIBE] Could not find download URL. Response keys:", Object.keys(downloadData));
          throw new Error("No download URL found in API response");
        }

        console.log(`[BG-TRANSCRIBE] Download URL obtained: ${downloadUrl.substring(0, 100)}...`);

        // Step 2: Download video from snap-video URL
        console.log(`[BG-TRANSCRIBE] Step 2: Downloading video from: ${downloadUrl.substring(0, 80)}...`);
        
        // Determine referer based on source
        const isInstagram = downloadUrl.includes('instagram') || cleanUrl.includes('instagram');
        const isYouTube = downloadUrl.includes('youtube') || downloadUrl.includes('ytdl') || cleanUrl.includes('youtube');
        const referer = isInstagram ? 'https://www.instagram.com/' : 
                        isYouTube ? 'https://www.youtube.com/' : 
                        'https://www.google.com/';
        
        console.log(`[BG-TRANSCRIBE] Using referer: ${referer}, isInstagram: ${isInstagram}, isYouTube: ${isYouTube}`);
        
        const videoResponse = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'video/mp4,video/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity',
            'Referer': referer,
            'Origin': referer.replace(/\/$/, ''),
            'Sec-Fetch-Dest': 'video',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
          }
        });
        
        console.log(`[BG-TRANSCRIBE] Video download response status: ${videoResponse.status}`);
        console.log(`[BG-TRANSCRIBE] Video download response headers: ${JSON.stringify(Object.fromEntries(videoResponse.headers.entries()))}`);
        
        if (!videoResponse.ok) {
          const errorBody = await videoResponse.text().catch(() => 'Could not read error body');
          console.error("[BG-TRANSCRIBE] Video download failed:", videoResponse.status, errorBody.substring(0, 200));
          throw new Error(`Failed to download video: ${videoResponse.status}`);
        }
        
        const videoArrayBuffer = await videoResponse.arrayBuffer();
        console.log(`[BG-TRANSCRIBE] Video downloaded: ${videoArrayBuffer.byteLength} bytes`);
        
        // Step 3: Upload binary to Cloudinary using signed upload
        console.log(`[BG-TRANSCRIBE] Step 3: Uploading to Cloudinary...`);
        
        const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "dfhyah2xw";
        const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
        const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");

        if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
          throw new Error("Cloudinary API credentials not configured");
        }

        // Generate signature for signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "ugc-audio";
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(paramsToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Upload as blob directly (no base64 to save memory)
        const videoBlob = new Blob([videoArrayBuffer], { type: 'video/mp4' });
        
        const formData = new FormData();
        formData.append("file", videoBlob, "video.mp4");
        formData.append("api_key", CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

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
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[BG-TRANSCRIBE] ❌ Error processing record ${recordId}:`, errorMessage);
        
        // Update record with error status and store error message in prompt field for debugging
        await supabase.from('user_voices').update({
          status: 'error',
          prompt: `Error: ${errorMessage}`,
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
