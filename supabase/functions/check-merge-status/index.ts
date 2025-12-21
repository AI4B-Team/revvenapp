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

    const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');

    if (!SHOTSTACK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Shotstack API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking status for render:', renderId);

    // Check render status
    const statusResponse = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Shotstack status error:', statusResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to check render status', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusData = await statusResponse.json();
    console.log('Render status:', statusData);

    const status = statusData.response?.status;
    const url = statusData.response?.url;

    return new Response(
      JSON.stringify({ 
        status,
        url: url || null,
        progress: statusData.response?.progress || 0,
        message: status === 'done' ? 'Render complete!' : `Status: ${status}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking merge status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
