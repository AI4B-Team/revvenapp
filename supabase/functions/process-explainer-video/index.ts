import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, recordId, sourceType, sourceUrl, audioBase64, title } = await req.json();
    console.log("Processing explainer video:", { action, recordId, sourceType, title });

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (action === "create") {
      // Create a new record
      const { data: record, error: insertError } = await supabaseClient
        .from("explainer_videos")
        .insert({
          user_id: user.id,
          title: title || "Untitled Video",
          source_type: sourceType,
          source_url: sourceUrl,
          status: "pending"
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to create record");
      }

      return new Response(
        JSON.stringify({ success: true, record }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "download") {
      // Download video from link using RapidAPI
      if (!RAPIDAPI_KEY) {
        throw new Error("RAPIDAPI_KEY is not configured");
      }

      // Update status
      await supabaseClient
        .from("explainer_videos")
        .update({ status: "downloading" })
        .eq("id", recordId);

      console.log("Downloading video from:", sourceUrl);

      // Clean and normalize URL
      let cleanUrl = sourceUrl.trim();
      if (cleanUrl.includes("youtube.com/shorts/")) {
        cleanUrl = cleanUrl.replace("/shorts/", "/watch?v=");
      }
      cleanUrl = cleanUrl.split("&")[0];

      const response = await fetch("https://snap-video3.p.rapidapi.com/download", {
        method: "POST",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "snap-video3.p.rapidapi.com",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("RapidAPI error:", response.status, errorText);
        
        await supabaseClient
          .from("explainer_videos")
          .update({ status: "failed", error_message: "Failed to download video" })
          .eq("id", recordId);
        
        throw new Error("Failed to download video");
      }

      const data = await response.json();
      console.log("RapidAPI response:", JSON.stringify(data).substring(0, 500));

      // Find audio or video URL
      let audioUrl = null;
      let videoUrl = null;

      // Try to find audio first
      if (data.audio && Array.isArray(data.audio) && data.audio.length > 0) {
        audioUrl = data.audio[0].url || data.audio[0];
      }
      if (data.medias && Array.isArray(data.medias)) {
        for (const media of data.medias) {
          if (media.type === "audio" && media.url) {
            audioUrl = media.url;
            break;
          }
          if (media.type === "video" && media.url && !videoUrl) {
            videoUrl = media.url;
          }
        }
      }
      if (!audioUrl && data.url) {
        videoUrl = data.url;
      }

      const title = data.title || "Downloaded Video";

      await supabaseClient
        .from("explainer_videos")
        .update({ 
          audio_url: audioUrl,
          video_url: videoUrl,
          title: title,
          status: audioUrl || videoUrl ? "downloading" : "failed",
          error_message: audioUrl || videoUrl ? null : "No media URL found"
        })
        .eq("id", recordId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          audioUrl, 
          videoUrl, 
          title,
          needsAudioExtraction: !audioUrl && !!videoUrl
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "transcribe") {
      // Transcribe audio using ElevenLabs
      if (!ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not configured");
      }

      await supabaseClient
        .from("explainer_videos")
        .update({ status: "transcribing" })
        .eq("id", recordId);

      console.log("Transcribing audio...");

      let audioBlob: Blob;

      if (audioBase64) {
        // Convert base64 to blob
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBlob = new Blob([bytes], { type: "audio/webm" });
      } else if (sourceUrl) {
        // Fetch audio from URL
        const audioResponse = await fetch(sourceUrl);
        if (!audioResponse.ok) {
          throw new Error("Failed to fetch audio");
        }
        audioBlob = await audioResponse.blob();
      } else {
        throw new Error("No audio source provided");
      }

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model_id", "scribe_v1");
      formData.append("language_code", "eng");

      const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: formData
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        console.error("ElevenLabs transcription error:", transcribeResponse.status, errorText);
        
        await supabaseClient
          .from("explainer_videos")
          .update({ status: "failed", error_message: "Failed to transcribe audio" })
          .eq("id", recordId);
        
        throw new Error("Failed to transcribe audio");
      }

      const transcriptData = await transcribeResponse.json();
      const transcript = transcriptData.text || "";

      console.log("Transcript:", transcript.substring(0, 200));

      await supabaseClient
        .from("explainer_videos")
        .update({ transcript, status: "transcribing" })
        .eq("id", recordId);

      return new Response(
        JSON.stringify({ success: true, transcript }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "explain") {
      // Generate explanation using OpenRouter
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const { transcript } = await req.json().catch(() => ({ transcript: "" }));

      // Fetch the transcript from the record if not provided
      let transcriptText = transcript;
      if (!transcriptText) {
        const { data: record } = await supabaseClient
          .from("explainer_videos")
          .select("transcript")
          .eq("id", recordId)
          .single();
        
        transcriptText = record?.transcript;
      }

      if (!transcriptText) {
        throw new Error("No transcript available");
      }

      await supabaseClient
        .from("explainer_videos")
        .update({ status: "explaining" })
        .eq("id", recordId);

      console.log("Generating explanation for transcript:", transcriptText.substring(0, 100));

      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.dev",
          "X-Title": "Lovable Explainer Video"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert educator who creates clear, comprehensive explanations of topics. 
Given a video transcript, you will:
1. Identify the main topic and key concepts
2. Provide a clear, well-structured explanation of the topic
3. Break down complex concepts into easy-to-understand parts
4. Add relevant examples or analogies where helpful
5. Summarize the key takeaways

Format your response with clear headings and bullet points for easy reading.`
            },
            {
              role: "user",
              content: `Please analyze this video transcript and create a comprehensive explanation of the topic being discussed:\n\n${transcriptText}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error("OpenRouter error:", openRouterResponse.status, errorText);
        
        await supabaseClient
          .from("explainer_videos")
          .update({ status: "failed", error_message: "Failed to generate explanation" })
          .eq("id", recordId);
        
        throw new Error("Failed to generate explanation");
      }

      const openRouterData = await openRouterResponse.json();
      const explanation = openRouterData.choices?.[0]?.message?.content || "";

      console.log("Explanation generated:", explanation.substring(0, 200));

      await supabaseClient
        .from("explainer_videos")
        .update({ 
          explanation, 
          status: "completed" 
        })
        .eq("id", recordId);

      return new Response(
        JSON.stringify({ success: true, explanation }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      const { error: deleteError } = await supabaseClient
        .from("explainer_videos")
        .delete()
        .eq("id", recordId);

      if (deleteError) {
        throw new Error("Failed to delete record");
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
