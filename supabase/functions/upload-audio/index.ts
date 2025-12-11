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
    const { audioData, filename, contentType } = await req.json();
    
    if (!audioData) {
      throw new Error("No audio data provided");
    }

    console.log("Uploading audio to Cloudinary:", filename, contentType);

    // Cloudinary credentials
    const cloudName = "dszt275xv";
    const uploadPreset = "revven";
    
    // Create form data for Cloudinary
    const formData = new FormData();
    
    // Convert base64 to blob
    const base64Data = audioData.split(',')[1] || audioData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: contentType || 'audio/webm' });
    
    formData.append("file", blob, filename || "audio.webm");
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "video"); // Cloudinary uses 'video' for audio files
    formData.append("folder", "ugc-audio");

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error("Cloudinary upload error:", errorText);
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log("Cloudinary upload success:", cloudinaryData.secure_url);

    return new Response(
      JSON.stringify({
        success: true,
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        duration: cloudinaryData.duration,
        format: cloudinaryData.format,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading audio:", error);
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
