import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upload character image function called');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.error('No file provided in request');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File received:', file.name, file.type, file.size);

    // Convert file to base64 in chunks to avoid stack overflow
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 8192;
    let binary = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64 = btoa(binary);
    const base64Data = `data:${file.type};base64,${base64}`;

    // Prepare Cloudinary upload
    const cloudinaryApiKey = '357119741731559';
    const cloudinaryApiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
    const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dszt275xv/upload';
    const uploadPreset = 'revven';

    console.log('Uploading to Cloudinary...');

    // Create form data for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64Data);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('api_key', cloudinaryApiKey);

    // Generate timestamp and signature for authenticated upload
    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}${cloudinaryApiSecret}`;
    
    // Create signature (simple SHA-1 implementation)
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(cloudinaryUploadUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary upload failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to upload to Cloudinary', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log('Upload successful:', cloudinaryData.secure_url);

    return new Response(
      JSON.stringify({
        success: true,
        url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-character-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});