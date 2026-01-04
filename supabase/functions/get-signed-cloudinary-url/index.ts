import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate SHA-1 signature for Cloudinary
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      throw new Error('Cloudinary credentials not configured');
    }

    const { urls } = await req.json();
    
    if (!urls || !Array.isArray(urls)) {
      throw new Error('urls array is required');
    }

    console.log(`Processing ${urls.length} URLs for signing`);

    const signedUrls: Record<string, string> = {};
    const timestamp = Math.floor(Date.now() / 1000);

    for (const url of urls) {
      if (!url || typeof url !== 'string') continue;
      
      // Check if this is a Cloudinary URL that needs signing
      if (!url.includes('res.cloudinary.com') && !url.includes('cloudinary')) {
        signedUrls[url] = url; // Return as-is for non-Cloudinary URLs
        continue;
      }

      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        
        // Find the upload index and get everything after it
        const uploadIndex = pathParts.findIndex(p => p === 'upload');
        if (uploadIndex === -1) {
          signedUrls[url] = url;
          continue;
        }

        // Get the parts after 'upload', skipping version if present
        let publicIdParts = pathParts.slice(uploadIndex + 1);
        
        // Remove version number if present (starts with 'v' followed by numbers)
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
          publicIdParts = publicIdParts.slice(1);
        }

        // Join remaining parts and remove file extension
        const publicIdWithExt = publicIdParts.join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        
        // Determine resource type from URL
        const resourceType = pathParts.includes('video') ? 'video' : 'image';

        // Generate signature for this URL
        const params: Record<string, string> = {
          timestamp: timestamp.toString(),
        };

        const signature = await generateSignature(params, apiSecret);

        // Construct signed URL
        const signedUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/s--${signature.substring(0, 8)}--/${publicIdWithExt}`;
        
        signedUrls[url] = signedUrl;
        console.log(`Signed: ${publicId}`);
      } catch (e) {
        console.error(`Error processing URL ${url}:`, e);
        signedUrls[url] = url; // Return original URL on error
      }
    }

    return new Response(JSON.stringify({ signedUrls }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in get-signed-cloudinary-url:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
