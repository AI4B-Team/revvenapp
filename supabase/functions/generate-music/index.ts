import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available models
const MODELS = ['V4', 'V4_5', 'V4_5PLUS', 'V4_5ALL', 'V5'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt,              // Required: Description of the music
      customMode = false,  // Optional: Enable advanced customization
      instrumental = true, // Optional: No vocals if true
      model = 'V4',        // Optional: Model version
      style,               // Required if customMode=true
      title,               // Required if customMode=true
      negativeTags,        // Optional: Styles to exclude
      vocalGender,         // Optional: 'm' or 'f'
      styleWeight,         // Optional: 0-1
      weirdnessConstraint, // Optional: 0-1
      audioWeight,         // Optional: 0-1
      recordId,            // Optional: Database record ID to update
    } = await req.json();
    
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    if (!KIE_AI_API_KEY) {
      throw new Error('KIE_AI_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Validate required prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    // Validate model
    if (!MODELS.includes(model)) {
      throw new Error(`Invalid model. Valid options: ${MODELS.join(', ')}`);
    }

    // Get character limits based on model
    const getPromptLimit = (m: string) => {
      if (m === 'V4') return 3000;
      return 5000; // V4_5, V4_5PLUS, V4_5ALL, V5
    };

    const getStyleLimit = (m: string) => {
      if (m === 'V4') return 200;
      return 1000; // V4_5, V4_5PLUS, V4_5ALL, V5
    };

    // Validate and truncate prompt
    const promptLimit = customMode ? getPromptLimit(model) : 500;
    const trimmedPrompt = prompt.substring(0, promptLimit);

    // Validate customMode requirements
    if (customMode) {
      if (!title || title.trim().length === 0) {
        throw new Error('Title is required in custom mode');
      }
      if (!style || style.trim().length === 0) {
        throw new Error('Style is required in custom mode');
      }
      if (!instrumental && (!prompt || prompt.trim().length === 0)) {
        throw new Error('Prompt (lyrics) is required in custom mode when not instrumental');
      }
    }

    // Build callback URL
    const callBackUrl = `${SUPABASE_URL}/functions/v1/music-webhook-callback`;

    // Build request body
    const requestBody: Record<string, unknown> = {
      prompt: trimmedPrompt,
      customMode,
      instrumental,
      model,
      callBackUrl,
    };

    // Add optional parameters for custom mode
    if (customMode) {
      if (style) {
        requestBody.style = style.substring(0, getStyleLimit(model));
      }
      if (title) {
        requestBody.title = title.substring(0, 80);
      }
    }

    // Add optional parameters
    if (negativeTags) {
      requestBody.negativeTags = negativeTags;
    }
    if (vocalGender && (vocalGender === 'm' || vocalGender === 'f')) {
      requestBody.vocalGender = vocalGender;
    }
    if (styleWeight !== undefined) {
      const sw = Math.max(0, Math.min(1, Number(styleWeight)));
      requestBody.styleWeight = Math.round(sw * 100) / 100;
    }
    if (weirdnessConstraint !== undefined) {
      const wc = Math.max(0, Math.min(1, Number(weirdnessConstraint)));
      requestBody.weirdnessConstraint = Math.round(wc * 100) / 100;
    }
    if (audioWeight !== undefined) {
      const aw = Math.max(0, Math.min(1, Number(audioWeight)));
      requestBody.audioWeight = Math.round(aw * 100) / 100;
    }

    // Add recordId to callback URL if provided
    if (recordId) {
      requestBody.callBackUrl = `${callBackUrl}?recordId=${recordId}`;
    }

    console.log('Creating music generation task:', {
      prompt: trimmedPrompt.substring(0, 50) + '...',
      customMode,
      instrumental,
      model,
      style: style?.substring(0, 30),
      title: title?.substring(0, 30),
      recordId,
    });

    // Call KIE.AI music generation API
    const response = await fetch('https://api.kie.ai/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('Music generation API response:', JSON.stringify(result));

    if (result.code !== 200 || !result.data?.taskId) {
      // Update database record with error if recordId provided
      if (recordId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from('user_voices')
          .update({ status: 'error' })
          .eq('id', recordId);
      }
      throw new Error(`Failed to create music task: ${result.msg || 'Unknown error'}`);
    }

    const taskId = result.data.taskId;
    console.log('Music task created with ID:', taskId);

    return new Response(JSON.stringify({ 
      success: true, 
      taskId,
      message: 'Music generation started. You will be notified when complete.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Music generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
