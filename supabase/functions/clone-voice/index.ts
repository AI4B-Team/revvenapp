import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not configured');
      throw new Error('ElevenLabs API key not configured');
    }

    // Parse JSON body
    const { audioUrl, voiceName, description, removeBackgroundNoise } = await req.json();

    if (!voiceName || !audioUrl) {
      throw new Error('Voice name and audio URL are required');
    }

    console.log('Cloning voice:', { 
      voiceName, 
      description, 
      audioUrl: audioUrl.substring(0, 50) + '...',
      removeBackgroundNoise 
    });

    // Fetch audio from URL
    console.log('Fetching audio from URL...');
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
    }
    
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const audioBlob = new Blob([audioArrayBuffer], { type: contentType });
    
    console.log('Audio fetched, size:', audioBlob.size, 'type:', contentType);

    // Prepare form data for ElevenLabs
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('name', voiceName);
    if (description) {
      elevenLabsFormData.append('description', description);
    }
    elevenLabsFormData.append('files', audioBlob, 'voice_sample.mp3');
    
    if (removeBackgroundNoise) {
      elevenLabsFormData.append('remove_background_noise', 'true');
    }

    // Call ElevenLabs voice cloning API
    console.log('Calling ElevenLabs API...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      let userMessage = 'Failed to clone voice';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail?.message) {
          userMessage = errorData.detail.message;
        } else if (errorData.detail) {
          userMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        userMessage = `ElevenLabs error: ${response.status}`;
      }
      
      throw new Error(userMessage);
    }

    const result = await response.json();
    console.log('Voice cloned successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      voice_id: result.voice_id,
      name: voiceName,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in clone-voice function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to clone voice';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
