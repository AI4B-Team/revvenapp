import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Audio is stored in Lovable Cloud storage (the previous Cloudinary account was disabled).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const BUCKET = "audio-uploads";
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 365; // 1 year

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { audioData, filename, contentType, remoteUrl } = await req.json();
    let bytes: Uint8Array;
    let type: string;
    let name: string = filename || "audio.webm";

    if (remoteUrl) {
      const u = new URL(remoteUrl);
      if (u.protocol !== "https:") throw new Error("Only HTTPS URLs are allowed");
      const res = await fetch(remoteUrl);
      if (!res.ok) throw new Error(`Could not download remote audio (${res.status})`);
      bytes = new Uint8Array(await res.arrayBuffer());
      type = res.headers.get("content-type")?.split(";")[0] || contentType || "audio/mpeg";
      if (!filename) name = u.pathname.split("/").pop() || "audio";
    } else if (audioData) {
      const base64Data = audioData.split(",")[1] || audioData;
      const bin = atob(base64Data);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const isVideo = contentType?.includes("video") || name.endsWith(".mp4");
      type = contentType || (isVideo ? "video/mp4" : "audio/webm");
    } else {
      return json({ error: "No audio data or URL provided" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const path = `ugc-audio/${crypto.randomUUID()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: type, upsert: false });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
    if (signErr || !signed) throw new Error(`Could not create file link: ${signErr?.message}`);

    console.log("Audio uploaded:", path, bytes.length, "bytes");
    return json({
      success: true,
      url: signed.signedUrl,
      publicId: path,
      duration: null,
      format: safeName.split(".").pop() || null,
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
