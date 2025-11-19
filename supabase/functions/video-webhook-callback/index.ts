import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Received webhook callback');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    const { video_id, video_url, status, error_message } = payload;

    if (!video_id) {
      throw new Error('video_id is required in webhook payload');
    }

    // Update video record in database
    const updateData: any = {
      webhook_response: payload,
      completed_at: new Date().toISOString(),
    };

    if (video_url) {
      updateData.video_url = video_url;
    }

    if (status) {
      updateData.status = status;
    } else if (video_url) {
      updateData.status = 'completed';
    }

    if (error_message) {
      updateData.status = 'failed';
    }

    const { error: updateError } = await supabase
      .from('ai_videos')
      .update(updateData)
      .eq('id', video_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Video status updated successfully:', video_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video status updated successfully',
        video_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in webhook callback:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
