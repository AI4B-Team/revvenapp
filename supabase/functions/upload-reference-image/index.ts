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
    const cloudinaryApiSecret = Deno.env.get('CLOUDINARY_API_SECRET')!;
    
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

    const { image, filename } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Uploading reference image to Cloudinary for user:', user.id);

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', image);
    cloudinaryFormData.append('upload_preset', 'revven');
    cloudinaryFormData.append('folder', 'reference_images');

    const cloudinaryResponse = await fetch(
      'https://api.cloudinary.com/v1_1/dszt275xv/image/upload',
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error('Failed to upload image to Cloudinary');
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log('Image uploaded to Cloudinary:', cloudinaryData.secure_url);

    // Insert reference image record into database
    const { data: referenceImage, error: dbError } = await supabase
      .from('reference_images')
      .insert({
        user_id: user.id,
        image_url: cloudinaryData.secure_url,
        cloudinary_public_id: cloudinaryData.public_id,
        thumbnail_url: cloudinaryData.eager?.[0]?.secure_url || cloudinaryData.secure_url,
        original_filename: filename || 'reference.jpg'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error('Failed to save reference image');
    }

    console.log('Reference image saved to database:', referenceImage.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        referenceImage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload-reference-image function:', error);
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