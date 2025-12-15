import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const recordId = url.searchParams.get('recordId');
    
    const payload = await req.json();
    console.log('Music webhook received:', JSON.stringify(payload));
    console.log('Record ID:', recordId);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // The callback has three stages: text, first, complete
    // We care about 'first' (first track complete) or 'complete' (all tracks complete)
    const stage = payload.stage || payload.data?.stage;
    const taskId = payload.taskId || payload.data?.taskId;
    
    console.log('Webhook stage:', stage, 'taskId:', taskId);

    // Check if we have audio URLs
    // Music generation returns multiple clips
    const clips = payload.data?.clips || payload.clips || [];
    const audioUrl = clips[0]?.audioUrl || clips[0]?.audio_url;
    const imageUrl = clips[0]?.imageUrl || clips[0]?.image_url;
    const title = clips[0]?.title;
    const duration = clips[0]?.duration;

    console.log('Audio URL:', audioUrl);
    console.log('Clips count:', clips.length);

    if (!recordId) {
      console.log('No recordId provided, skipping database update');
      return new Response(JSON.stringify({ success: true, message: 'Webhook received but no recordId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (stage === 'complete' || stage === 'first' || audioUrl) {
      if (audioUrl) {
        // Update database record with completed status and URL
        const { error: updateError } = await supabase.from('user_voices')
          .update({
            url: audioUrl,
            status: 'completed',
            duration: duration || 30,
          })
          .eq('id', recordId);

        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }

        console.log('Record updated successfully with audio URL');
      } else {
        console.log('Stage complete but no audio URL found');
      }
    } else if (stage === 'fail' || payload.status === 'failed') {
      // Update with error status
      const { error: updateError } = await supabase.from('user_voices')
        .update({ status: 'error' })
        .eq('id', recordId);

      if (updateError) {
        console.error('Error updating record to error status:', updateError);
      }
      console.log('Record updated with error status');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Music webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
