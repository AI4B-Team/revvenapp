import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Whitepaper image callback received:", JSON.stringify(payload, null, 2));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract data from callback - KIE.AI nests metadata in stringified param
    const taskId = payload.data?.taskId || payload.taskId;
    const status = payload.data?.state || payload.data?.status || payload.status;
    
    // Parse resultJson to get image URL
    let imageUrl: string | undefined;
    try {
      if (payload.data?.resultJson) {
        const resultData = JSON.parse(payload.data.resultJson);
        imageUrl = resultData.resultUrls?.[0];
      }
    } catch (e) {
      console.error("Failed to parse resultJson:", e);
    }
    
    // Fallback image URL extraction
    if (!imageUrl) {
      imageUrl = payload.data?.output?.image_url || 
                 payload.data?.output?.images?.[0] ||
                 payload.data?.result?.images?.[0] ||
                 payload.data?.images?.[0];
    }
    
    // Get whitepaper ID from metadata - KIE.AI puts it in stringified param
    let whitepaperId: string | undefined;
    try {
      if (payload.data?.param) {
        const paramData = JSON.parse(payload.data.param);
        whitepaperId = paramData.metadata?.db_id;
      }
    } catch (e) {
      console.error("Failed to parse param:", e);
    }
    
    // Fallback metadata extraction
    if (!whitepaperId) {
      whitepaperId = payload.metadata?.db_id || payload.data?.metadata?.db_id;
    }
    
    console.log("Parsed callback data:", { taskId, status, imageUrl, whitepaperId });

    if (!whitepaperId) {
      console.error("No whitepaper ID found in callback");
      return new Response(JSON.stringify({ error: "Missing whitepaper ID" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (status === 'SUCCESS' || status === 'success' || status === 'completed' || status === 'COMPLETED') {
      if (imageUrl) {
        // Update whitepaper with image URL as content
        const { error: updateError } = await supabase
          .from('whitepapers')
          .update({
            content: imageUrl,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', whitepaperId);

        if (updateError) {
          console.error("Error updating whitepaper:", updateError);
          return new Response(JSON.stringify({ error: "Database update failed" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log("Whitepaper image saved successfully:", whitepaperId);
      } else {
        console.error("No image URL in success callback");
        await supabase
          .from('whitepapers')
          .update({ status: 'error' })
          .eq('id', whitepaperId);
      }
    } else if (status === 'FAILED' || status === 'failed' || status === 'error') {
      console.log("Image generation failed for whitepaper:", whitepaperId);
      await supabase
        .from('whitepapers')
        .update({ status: 'error' })
        .eq('id', whitepaperId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in whitepaper-image-callback:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
