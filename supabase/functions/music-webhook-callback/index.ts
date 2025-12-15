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

    // KIE.AI music callback structure:
    // { code: 200, msg: "...", data: { callbackType: "text|first|complete", data: [...clips], task_id: "..." } }
    const callbackType = payload.data?.callbackType;
    const taskId = payload.data?.task_id;
    const clips = payload.data?.data || [];
    
    console.log('Callback type:', callbackType, 'taskId:', taskId);
    console.log('Clips count:', clips.length);

    // Find the first clip with an audio URL
    const clipWithAudio = clips.find((c: any) => c.audio_url);
    const audioUrl = clipWithAudio?.audio_url;
    const imageUrl = clipWithAudio?.image_url;
    const title = clipWithAudio?.title;
    const duration = clipWithAudio?.duration;

    console.log('Audio URL:', audioUrl);
    console.log('Duration:', duration);

    if (!recordId) {
      console.log('No recordId provided, skipping database update');
      return new Response(JSON.stringify({ success: true, message: 'Webhook received but no recordId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update on 'complete' or 'first' if we have an audio URL
    if ((callbackType === 'complete' || callbackType === 'first') && audioUrl) {
      // Update database record with completed status and URL
      const updateData: Record<string, any> = {
        url: audioUrl,
        status: 'completed',
      };
      
      if (duration) {
        updateData.duration = duration;
      }
      if (title) {
        updateData.name = title;
      }
      
      const { error: updateError } = await supabase.from('user_voices')
        .update(updateData)
        .eq('id', recordId);

      if (updateError) {
        console.error('Error updating record:', updateError);
        throw updateError;
      }

      console.log('Record updated successfully with audio URL:', audioUrl);
    } else if (payload.code !== 200 || callbackType === 'fail') {
      // Update with error status
      const { error: updateError } = await supabase.from('user_voices')
        .update({ status: 'error' })
        .eq('id', recordId);

      if (updateError) {
        console.error('Error updating record to error status:', updateError);
      }
      console.log('Record updated with error status');
    } else {
      console.log('Callback type:', callbackType, '- waiting for audio URL');
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
