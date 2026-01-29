import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const KIE_AI_API_KEY = Deno.env.get("KIE_AI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, whitepaperId, aspectRatio = "16:9" } = await req.json();

    if (!topic) {
      throw new Error('Topic is required');
    }

    if (!KIE_AI_API_KEY) {
      throw new Error("KIE_AI_API_KEY not configured");
    }

    console.log('Generating whitepaper IMAGE for topic:', topic, 'whitepaperId:', whitepaperId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build callback URL for async image generation
    const callbackUrl = `${supabaseUrl}/functions/v1/whitepaper-image-callback`;
    console.log("Callback URL:", callbackUrl);

    // Enhance prompt for whitepaper-style infographic image
    const imagePrompt = `Professional whitepaper infographic design about: ${topic}. 
Modern corporate presentation style with clean typography, data visualizations, charts, icons, and professional color scheme. 
Business document layout with clear sections, executive summary highlights, key statistics displayed prominently.
High quality, ultra detailed, professional business document aesthetic.`;

    // Use Nano Banana Pro model for image generation
    const requestBody = {
      model: 'nano-banana-pro',
      callBackUrl: callbackUrl,
      metadata: { db_id: whitepaperId },
      input: {
        prompt: imagePrompt,
        aspect_ratio: aspectRatio,
        resolution: "1K",
        output_format: "png"
      }
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const kieResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    if (!kieResponse.ok) {
      const errorText = await kieResponse.text();
      console.error("KIE.AI error:", kieResponse.status, errorText);
      
      // Update database with error
      await supabase
        .from("whitepapers")
        .update({ status: "error" })
        .eq("id", whitepaperId);
      
      if (kieResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (kieResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`KIE.AI API error: ${kieResponse.status}`);
    }

    const kieData = await kieResponse.json();
    
    if (kieData.code !== 200) {
      console.error("KIE.AI failed:", kieData.msg);
      
      await supabase
        .from("whitepapers")
        .update({ status: "error" })
        .eq("id", whitepaperId);
      
      throw new Error(kieData.msg || "KIE.AI generation failed");
    }

    const taskId = kieData.data.taskId;
    console.log("KIE.AI taskId:", taskId);

    // Update database with taskId
    await supabase
      .from("whitepapers")
      .update({ 
        status: "processing",
        updated_at: new Date().toISOString()
      })
      .eq("id", whitepaperId);

    console.log('Whitepaper image generation started, callback will update when ready');

    return new Response(JSON.stringify({ 
      success: true,
      taskId: taskId,
      message: "Image generation started"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-whitepaper function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
