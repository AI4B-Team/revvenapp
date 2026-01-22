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
    console.log("Starting voice preview generation...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const cloudinaryCloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "dszt275xv";

    if (!supabaseUrl || !supabaseKey || !elevenLabsApiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all preset voices
    const { data: voices, error: fetchError } = await supabase
      .from('preset_voices')
      .select('*')
      .order('sort_order');

    if (fetchError) {
      throw new Error(`Failed to fetch voices: ${fetchError.message}`);
    }

    console.log(`Found ${voices.length} voices to process`);

    const results = [];

    for (const voice of voices) {
      try {
        console.log(`Generating preview for ${voice.name}...`);

        const previewText = `Hi, I am ${voice.name}. Welcome to Revven.`;

        // Generate audio using ElevenLabs
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice.elevenlabs_voice_id}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: previewText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0,
                use_speaker_boost: true
              }
            }),
          }
        );

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          console.error(`ElevenLabs error for ${voice.name}:`, errorText);
          results.push({ name: voice.name, success: false, error: errorText });
          continue;
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        
        // Convert to base64 in chunks to avoid stack overflow
        const uint8Array = new Uint8Array(audioBuffer);
        let audioBase64 = '';
        const chunkSize = 32768;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          audioBase64 += String.fromCharCode.apply(null, Array.from(chunk));
        }
        audioBase64 = btoa(audioBase64);

        console.log(`Uploading audio for ${voice.name} to Cloudinary...`);

        // Upload to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", `data:audio/mpeg;base64,${audioBase64}`);
        cloudinaryFormData.append("upload_preset", "revven");
        cloudinaryFormData.append("folder", "voice_previews");
        cloudinaryFormData.append("resource_type", "video");
        cloudinaryFormData.append("public_id", `voice_preview_${voice.name.toLowerCase()}`);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`,
          { method: "POST", body: cloudinaryFormData }
        );

        if (!cloudinaryResponse.ok) {
          const cloudinaryError = await cloudinaryResponse.text();
          console.error(`Cloudinary error for ${voice.name}:`, cloudinaryError);
          results.push({ name: voice.name, success: false, error: cloudinaryError });
          continue;
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const previewUrl = cloudinaryData.secure_url;

        console.log(`Updating database for ${voice.name} with URL: ${previewUrl}`);

        // Update the preset_voices table with the preview URL
        const { error: updateError } = await supabase
          .from('preset_voices')
          .update({ preview_url: previewUrl })
          .eq('id', voice.id);

        if (updateError) {
          console.error(`Database update error for ${voice.name}:`, updateError);
          results.push({ name: voice.name, success: false, error: updateError.message });
          continue;
        }

        results.push({ name: voice.name, success: true, preview_url: previewUrl });
        console.log(`✓ Completed ${voice.name}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (voiceError) {
        console.error(`Error processing ${voice.name}:`, voiceError);
        results.push({ name: voice.name, success: false, error: String(voiceError) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${voices.length} voices processed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${successCount}/${voices.length} voice previews`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice preview generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
