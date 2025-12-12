import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { video, filename, duration } = await req.json();

    if (!video) {
      throw new Error('No video provided');
    }

    console.log('Uploading video to Cloudinary for user:', user.id);

    // Upload to Cloudinary VIDEO endpoint (not image)
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', video);
    cloudinaryFormData.append('upload_preset', 'revven');
    cloudinaryFormData.append('folder', 'user_videos');
    cloudinaryFormData.append('resource_type', 'video');

    const cloudinaryResponse = await fetch(
      'https://api.cloudinary.com/v1_1/dszt275xv/video/upload',
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary video upload failed:', errorText);
      throw new Error('Failed to upload video to Cloudinary');
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log('Video uploaded to Cloudinary:', cloudinaryData.secure_url);

    return new Response(
      JSON.stringify({ 
        success: true,
        video: {
          url: cloudinaryData.secure_url,
          cloudinary_public_id: cloudinaryData.public_id,
          duration: cloudinaryData.duration || duration
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
