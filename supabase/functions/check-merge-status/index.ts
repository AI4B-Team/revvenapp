import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { renderId } = await req.json();
    
    if (!renderId) {
      return new Response(
        JSON.stringify({ error: 'No render ID provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const JSON2VIDEO_API_KEY = Deno.env.get('JSON2VIDEO_API_KEY');

    if (!JSON2VIDEO_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'JSON2Video API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking status for render:', renderId);

    // Check render status from JSON2Video
    const statusResponse = await fetch(`https://api.json2video.com/v2/movies?project=${renderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': JSON2VIDEO_API_KEY,
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('JSON2Video status error:', statusResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to check render status', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusData = await statusResponse.json();
    console.log('Status response:', statusData);

    // Map JSON2Video status to our expected format
    // JSON2Video statuses: pending, processing, done, failed
    let status = statusData.status || 'unknown';
    let url = null;
    let progress = 0;

    if (status === 'done') {
      url = statusData.movie;
      progress = 100;
    } else if (status === 'processing') {
      progress = statusData.progress || 50;
    } else if (status === 'pending') {
      progress = 0;
    } else if (status === 'failed') {
      return new Response(
        JSON.stringify({ 
          status: 'failed', 
          error: statusData.error || 'Render failed' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        status,
        url,
        progress
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-merge-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
