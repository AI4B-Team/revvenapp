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

    const JSON2VIDEO_API_KEY = Deno.env.get('JSON2VIDEO_API_KEY');

    if (!JSON2VIDEO_API_KEY) {
      console.error('JSON2VIDEO_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'JSON2Video API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing', clips.length, 'clips for project:', projectTitle);

    // Sort clips by startTime to maintain order
    const sortedClips = [...clips].sort((a: VideoClip, b: VideoClip) => a.startTime - b.startTime);
    
    // Build JSON2Video scenes array - each clip becomes a scene
    const scenes = sortedClips.map((clip: VideoClip) => ({
      elements: [
        {
          type: 'video',
          src: clip.src,
          duration: clip.duration,
        }
      ]
    }));

    // Calculate total duration
    const totalDuration = sortedClips.reduce((sum, clip) => sum + clip.duration, 0);
    
    console.log('Total duration:', totalDuration, 'seconds');
    console.log('JSON2Video scenes:', JSON.stringify(scenes, null, 2));

    // Create JSON2Video project payload
    const projectPayload = {
      resolution: 'full-hd',
      quality: 'high',
      scenes: scenes,
    };

    console.log('Sending to JSON2Video API...');

    // Submit render job to JSON2Video
    const renderResponse = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': JSON2VIDEO_API_KEY,
      },
      body: JSON.stringify(projectPayload),
    });

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      console.error('JSON2Video render error:', renderResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to submit render job', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const renderData = await renderResponse.json();
    console.log('Render job submitted:', renderData);

    const renderId = renderData.project;
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
