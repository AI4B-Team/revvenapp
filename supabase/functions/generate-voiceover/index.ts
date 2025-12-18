import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard KIE.AI voice names
const STANDARD_VOICES = [
  'Rachel', 'Aria', 'Roger', 'Sarah', 'Laura', 'Charlie', 'George', 
  'Callum', 'River', 'Liam', 'Charlotte', 'Alice', 'Matilda', 'Will', 
  'Jessica', 'Eric', 'Chris', 'Brian', 'Daniel', 'Lily', 'Bill'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, voiceName, stability = 0.5, similarity_boost = 0.75, style = 0, speed: rawSpeed = 1, use_speaker_boost = true } = await req.json();

    // Clamp speed to valid range (0.7 to 1.19)
    const speed = Math.round(Math.max(0.7, Math.min(1.19, rawSpeed)) * 100) / 100;

    if (!text || !voice) {
      return new Response(
        JSON.stringify({ error: 'Text and voice are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a cloned voice or standard voice by checking voiceName against standard voices
    const isClonedVoice = voiceName ? !STANDARD_VOICES.includes(voiceName) : !STANDARD_VOICES.includes(voice);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate estimated duration (rough estimate: 150 words per minute)
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(1, Math.round((wordCount / 150) * 60));

    // Insert pending record immediately
    const { data: voiceRecord, error: insertError } = await supabase
      .from('user_voices')
      .insert({
        user_id: user.id,
        name: `${voiceName || voice} - ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
        duration: estimatedDuration,
        url: '', // Will be updated when generation completes
        type: isClonedVoice ? 'cloned' : 'voiceover',
        status: 'processing',
        prompt: text,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting voice record:', insertError);
      throw new Error('Failed to create voice record');
    }

    console.log(`Created pending voice record: ${voiceRecord.id}, isClonedVoice: ${isClonedVoice}`);

    // Start background task for actual generation
    EdgeRuntime.waitUntil((async () => {
      try {
        console.log(`Starting voice generation for record ${voiceRecord.id}, voice: ${voice}, text length: ${text.length}, isCloned: ${isClonedVoice}`);

        if (isClonedVoice) {
          // Use ElevenLabs API directly for cloned voices
          const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
          if (!ELEVENLABS_API_KEY) {
            throw new Error('ELEVENLABS_API_KEY is not configured');
          }

          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability,
                similarity_boost,
                style,
                use_speaker_boost,
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            throw new Error(`ElevenLabs API error: ${response.status}`);
          }

          // Get audio as array buffer and convert to base64
          const audioBuffer = await response.arrayBuffer();
          const base64Audio = base64Encode(audioBuffer);
          const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

          // Update record with completed audio
          await supabase
            .from('user_voices')
            .update({ 
              url: audioDataUrl,
              status: 'completed'
            })
            .eq('id', voiceRecord.id);
          
          console.log(`ElevenLabs voice generation completed for record ${voiceRecord.id}`);
          return;
        }

        // Use KIE.AI for standard voices
        const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');
        if (!KIE_API_KEY) {
          throw new Error('KIE_AI_API_KEY is not configured');
        }

        // Call KIE.AI TTS API
        const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KIE_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'elevenlabs/text-to-speech-multilingual-v2',
            input: {
              text,
              voice,
              stability,
              similarity_boost,
              style,
              speed,
              use_speaker_boost,
              timestamps: false,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('KIE API error:', errorText);
          throw new Error(`KIE API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Task created:', result);

        if (result.code !== 200) {
          throw new Error(result.message || 'Failed to create TTS task');
        }

        const taskId = result.data.taskId;

        // Poll for completion
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const statusResponse = await fetch(
            `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
            {
              headers: {
                'Authorization': `Bearer ${KIE_API_KEY}`,
              },
            }
          );

          const statusResult = await statusResponse.json();
          console.log(`Poll attempt ${attempts + 1}, state: ${statusResult.data?.state}`);

          if (statusResult.data?.state === 'success') {
            const resultJson = JSON.parse(statusResult.data.resultJson);
            const audioUrl = resultJson.resultUrls?.[0];
            
            if (audioUrl) {
              // Update record with completed URL
              await supabase
                .from('user_voices')
                .update({ 
                  url: audioUrl,
                  status: 'completed'
                })
                .eq('id', voiceRecord.id);
              
              console.log(`Voice generation completed for record ${voiceRecord.id}`);
              return;
            }
          } else if (statusResult.data?.state === 'fail') {
            throw new Error(statusResult.data.failMsg || 'TTS generation failed');
          }

          attempts++;
        }

        throw new Error('TTS generation timed out');

      } catch (error) {
        console.error(`Voice generation failed for record ${voiceRecord.id}:`, error);
        // Update record with error status
        await supabase
          .from('user_voices')
          .update({ 
            status: 'error',
          })
          .eq('id', voiceRecord.id);
      }
    })());

    // Return immediately with the pending record ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: voiceRecord.id,
        message: 'Voice generation started' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-voiceover:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
