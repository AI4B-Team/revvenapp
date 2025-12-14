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
    cloudinaryFormData.append("resource_type", "video");
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
    const originalUrl: string = cloudinaryData.secure_url;
    // Request mp3-transcoded version from Cloudinary and ensure .mp3 extension so KIE.AI accepts the type
    const transformedUrl = originalUrl.replace("/upload/", "/upload/f_mp3/");
    const audioUrl = transformedUrl.replace(/\.(webm|wav|ogg|mp4)$/i, ".mp3");
    console.log("Audio uploaded to Cloudinary (mp3 URL):", audioUrl);

    // Step 2: Create transcription task using KIE.AI jobs API
    console.log("Creating transcription task...");
    const createTaskResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "elevenlabs/speech-to-text",
        input: {
          audio_url: audioUrl,
          language_code: "eng",
          tag_audio_events: false,
          diarize: false,
        },
      }),
    });

    if (!createTaskResponse.ok) {
      const errorText = await createTaskResponse.text();
      console.error("KIE.AI createTask error:", createTaskResponse.status, errorText);
      throw new Error(`Failed to create transcription task: ${errorText}`);
    }

    const createTaskResult = await createTaskResponse.json();
    console.log("Task created:", JSON.stringify(createTaskResult));

    if (createTaskResult.code !== 200 || !createTaskResult.data?.taskId) {
      const msg = createTaskResult.message || createTaskResult.msg || JSON.stringify(createTaskResult);
      throw new Error(`Task creation failed: ${msg}`);
    }

    const taskId = createTaskResult.data.taskId;
    console.log("Task ID:", taskId);

    // Step 3: Poll for task completion
    let transcribedText = "";
    let attempts = 0;
    const maxAttempts = 180; // wait up to 3 minutes
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/task/${taskId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        console.error("Status check error:", statusResponse.status, await statusResponse.text());
        attempts++;
        continue;
      }

      const statusResult = await statusResponse.json();
      console.log("Task status response:", JSON.stringify(statusResult));

      if (statusResult.code && statusResult.code !== 200) {
        const msg = statusResult.msg || statusResult.message || JSON.stringify(statusResult);
        throw new Error(`Transcription failed: ${msg}`);
      }

      const state = statusResult.data?.state;
      console.log("Task state:", state);

      if (state === "success") {
        // Parse the resultJson
        const resultJson = statusResult.data.resultJson;
        if (resultJson) {
          try {
            const parsed = typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;
            transcribedText = parsed.resultObject?.text || parsed.text || "";
            console.log("Transcription complete:", transcribedText.substring(0, 100));
          } catch (e) {
            console.error("Failed to parse resultJson:", e);
            transcribedText = resultJson;
          }
        }
        break;
      } else if (state === "fail") {
        throw new Error(`Transcription failed: ${statusResult.data.failMsg || "Unknown error"}`);
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Transcription timed out");
    }

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
