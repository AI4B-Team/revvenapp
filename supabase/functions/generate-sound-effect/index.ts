import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All available output formats
const OUTPUT_FORMATS = [
  'mp3_22050_32',   // MP3 22050Hz 32kbps
  'mp3_44100_32',   // MP3 44100Hz 32kbps
  'mp3_44100_64',   // MP3 44100Hz 64kbps
  'mp3_44100_96',   // MP3 44100Hz 96kbps
  'mp3_44100_128',  // MP3 44100Hz 128kbps (default)
  'mp3_44100_192',  // MP3 44100Hz 192kbps
  'pcm_8000',       // PCM 8000Hz
  'pcm_16000',      // PCM 16000Hz
  'pcm_22050',      // PCM 22050Hz
  'pcm_24000',      // PCM 24000Hz
  'pcm_44100',      // PCM 44100Hz
  'pcm_48000',      // PCM 48000Hz
  'ulaw_8000',      // μ-law 8000Hz
  'alaw_8000',      // A-law 8000Hz
  'opus_48000_32',  // Opus 48000Hz 32kbps
  'opus_48000_64',  // Opus 48000Hz 64kbps
  'opus_48000_96',  // Opus 48000Hz 96kbps
  'opus_48000_128', // Opus 48000Hz 128kbps
  'opus_48000_192', // Opus 48000Hz 192kbps
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      text,                    // Required: Text describing the sound effect (max 5000 chars)
      loop,                    // Optional: Whether to create a looping sound effect (boolean)
      duration_seconds,        // Optional: Duration in seconds (0.5-22, step 0.1)
      prompt_influence,        // Optional: How closely to follow the prompt (0-1, step 0.01)
      output_format            // Optional: Output format (see OUTPUT_FORMATS)
    } = await req.json();
    
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    // Validate required text parameter
    if (!text || text.trim().length === 0) {
      throw new Error('Text description is required');
    }

    // Validate text length (max 5000 characters)
    const trimmedText = text.substring(0, 5000);

    // Validate duration_seconds if provided (0.5 to 22)
    let validDuration = undefined;
    if (duration_seconds !== undefined) {
      const durationNum = Number(duration_seconds);
      if (isNaN(durationNum) || durationNum < 0.5 || durationNum > 22) {
        throw new Error('duration_seconds must be between 0.5 and 22');
      }
      validDuration = Math.round(durationNum * 10) / 10; // Round to 0.1 step
    }

    // Validate prompt_influence if provided (0 to 1)
    let validPromptInfluence = 0.3; // Default
    if (prompt_influence !== undefined) {
      const influenceNum = Number(prompt_influence);
      if (isNaN(influenceNum) || influenceNum < 0 || influenceNum > 1) {
        throw new Error('prompt_influence must be between 0 and 1');
      }
      validPromptInfluence = Math.round(influenceNum * 100) / 100; // Round to 0.01 step
    }

    // Validate output_format if provided
    let validOutputFormat = 'mp3_44100_128'; // Default
    if (output_format !== undefined) {
      if (!OUTPUT_FORMATS.includes(output_format)) {
        throw new Error(`Invalid output_format. Valid options: ${OUTPUT_FORMATS.join(', ')}`);
      }
      validOutputFormat = output_format;
    }

    // Validate loop (must be boolean)
    const validLoop = loop === true;

    console.log('Creating sound effect task:', {
      text: trimmedText.substring(0, 100) + '...',
      loop: validLoop,
      duration_seconds: validDuration,
      prompt_influence: validPromptInfluence,
      output_format: validOutputFormat,
    });

    // Build input object
    const input: Record<string, unknown> = {
      text: trimmedText,
      loop: validLoop,
      prompt_influence: validPromptInfluence,
      output_format: validOutputFormat,
    };

    // Only include duration_seconds if explicitly provided
    if (validDuration !== undefined) {
      input.duration_seconds = validDuration;
    }

    // Create task
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'elevenlabs/sound-effect-v2',
        input,
      }),
    });

    const createResult = await createResponse.json();
    console.log('Create task response:', JSON.stringify(createResult));

    if (createResult.code !== 200 || !createResult.data?.taskId) {
      throw new Error(`Failed to create task: ${createResult.message || 'Unknown error'}`);
    }

    const taskId = createResult.data.taskId;
    console.log('Task created with ID:', taskId);

    // Poll for completion (max 60 seconds)
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      });

      const statusResult = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}, state:`, statusResult.data?.state);

      if (statusResult.code !== 200) {
        console.error('Status check failed:', statusResult);
        attempts++;
        continue;
      }

      const state = statusResult.data?.state;

      if (state === 'success') {
        const resultJson = statusResult.data?.resultJson;
        if (resultJson) {
          try {
            const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
            const audioUrl = parsed.resultUrls?.[0];
            
            if (audioUrl) {
              console.log('Sound effect generated successfully:', audioUrl);
              return new Response(JSON.stringify({ 
                success: true, 
                audioUrl,
                taskId,
                duration_seconds: validDuration,
                output_format: validOutputFormat,
                loop: validLoop,
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (parseError) {
            console.error('Error parsing resultJson:', parseError);
          }
        }
        throw new Error('No audio URL in result');
      }

      if (state === 'fail') {
        throw new Error(`Generation failed: ${statusResult.data?.failMsg || 'Unknown error'}`);
      }

      // States: waiting, queuing, generating - continue polling
      attempts++;
    }

    throw new Error('Generation timed out after 60 seconds');

  } catch (error) {
    console.error('Sound effect generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
