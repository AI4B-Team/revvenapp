import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) {
      throw new Error("PEXELS_API_KEY is not configured");
    }

    const { type, query, page = 1, per_page = 30 } = await req.json();

    let pexelsUrl: string;
    
    if (type === "videos") {
      pexelsUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`;
    } else {
      // Default to images
      pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query || 'business professional')}&per_page=${per_page}&page=${page}`;
    }

    const response = await fetch(pexelsUrl, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in pexels-proxy:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
