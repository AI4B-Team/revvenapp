import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoClip {
  src: string;
  startTime: number;
  duration: number;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clips, projectTitle } = await req.json();
    
    if (!clips || !Array.isArray(clips) || clips.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No clips provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');
    const SHOTSTACK_OWNER_ID = Deno.env.get('SHOTSTACK_OWNER_ID');

    if (!SHOTSTACK_API_KEY) {
      console.error('SHOTSTACK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Shotstack API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing', clips.length, 'clips for project:', projectTitle);

    // Build Shotstack timeline with each clip on a separate track (per API docs)
    // Sort clips by startTime to maintain order
    const sortedClips = [...clips].sort((a: VideoClip, b: VideoClip) => a.startTime - b.startTime);
    
    // Build tracks array - each clip goes on its own track with sequential start times
    let currentStart = 0;
    const tracks = sortedClips.map((clip: VideoClip, index: number) => {
      const trackClip = {
        asset: {
          type: 'video',
          src: clip.src,
        },
        start: currentStart,
        length: clip.duration,
      };
      
      // Next clip starts when this one ends
      currentStart += clip.duration;
      
      // Each clip is in its own track
      return {
        clips: [trackClip],
      };
    });

    // Calculate total duration
    const totalDuration = currentStart;
    
    console.log('Total duration:', totalDuration, 'seconds');
    console.log('Shotstack tracks:', JSON.stringify(tracks, null, 2));

    // Create Shotstack edit - each clip on separate track per documentation
    const editPayload = {
      timeline: {
        tracks: tracks,
      },
      output: {
        format: 'mp4',
        resolution: 'sd', // Use SD for sandbox to reduce credit usage
      },
    };

    console.log('Sending to Shotstack API...');

    // Submit render job to Shotstack (using sandbox/stage API for free testing)
    const renderResponse = await fetch('https://api.shotstack.io/stage/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY,
      },
      body: JSON.stringify(editPayload),
    });

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      console.error('Shotstack render error:', renderResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to submit render job', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const renderData = await renderResponse.json();
    console.log('Render job submitted:', renderData);

    const renderId = renderData.response?.id;
    if (!renderId) {
      return new Response(
        JSON.stringify({ error: 'No render ID returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the render ID for polling
    return new Response(
      JSON.stringify({ 
        success: true, 
        renderId,
        message: 'Render job submitted. Poll for status.',
        estimatedDuration: totalDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in merge-videos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
