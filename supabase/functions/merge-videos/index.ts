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

    // Build Shotstack timeline with sequential clips
    // Sort clips by startTime to maintain order
    const sortedClips = [...clips].sort((a: VideoClip, b: VideoClip) => a.startTime - b.startTime);
    
    // Build the timeline clips array for Shotstack
    // We'll place clips sequentially based on their relative positions
    let currentStart = 0;
    const shotstackClips = sortedClips.map((clip: VideoClip, index: number) => {
      // Calculate gap from previous clip
      const previousEnd = index > 0 
        ? sortedClips[index - 1].startTime + sortedClips[index - 1].duration 
        : 0;
      const gap = clip.startTime - previousEnd;
      
      // Add gap to current start position
      if (gap > 0) {
        currentStart += gap;
      }
      
      const shotstackClip = {
        asset: {
          type: 'video',
          src: clip.src,
          trim: 0, // Start from beginning of each source video
        },
        start: currentStart,
        length: clip.duration,
      };
      
      currentStart += clip.duration;
      
      return shotstackClip;
    });

    // Calculate total duration
    const totalDuration = currentStart;
    
    console.log('Total duration:', totalDuration, 'seconds');
    console.log('Shotstack clips:', JSON.stringify(shotstackClips, null, 2));

    // Create Shotstack edit
    const editPayload = {
      timeline: {
        tracks: [
          {
            clips: shotstackClips,
          },
        ],
      },
      output: {
        format: 'mp4',
        resolution: 'hd', // 1080p
        aspectRatio: '16:9',
      },
    };

    console.log('Sending to Shotstack API...');

    // Submit render job to Shotstack
    const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
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
