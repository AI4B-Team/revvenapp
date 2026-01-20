import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, reportType, dataPoints } = await req.json();

    if (!topic) {
      throw new Error('No topic provided');
    }

    console.log('Generating report image with Nano Banana Pro...');
    console.log('Topic:', topic);
    console.log('Report Type:', reportType);

    // Build a detailed prompt for generating a professional report infographic
    const prompt = `Create a professional, modern business report infographic image for: "${topic}"

Design Requirements:
- Style: Clean, corporate, data-driven infographic layout
- Color scheme: Professional blues, greens, and accent colors
- Layout: Include a header with title and date, multiple data visualization sections
- Must include:
  * A prominent title header with company branding area
  * At least 2-3 different chart types (bar charts, line graphs, pie charts, donut charts)
  * Key metrics/KPIs displayed in card format with large numbers
  * Data tables or comparison sections
  * A "Next Steps" or "Summary" section
  * Clean section dividers and visual hierarchy

Report Type: ${reportType || 'Quarterly Performance Report'}
${dataPoints ? `Key Data Points to visualize: ${dataPoints}` : ''}

Make it look like a premium, executive-level business report infographic that would be used in board meetings or investor presentations. High quality, sharp graphics, professional typography.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`Report generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error('No image was generated');
    }

    console.log('Report image generated successfully');

    return new Response(JSON.stringify({ 
      imageUrl,
      description: textContent || 'Professional report generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-report-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
