import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UNSPLASH_ACCESS_KEY = 'qjXucJJM-rqNnTPbSCeDfgAMV-LPYFkHLQWaEu0CDFI';

interface ImageSuggestion {
  id: string;
  url: string;
  thumbnailUrl: string;
  source: 'ai' | 'stock' | 'user';
  prompt?: string;
  alt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageTitle, pageContent, bookTitle, pageType } = await req.json();

    console.log('Analyzing content for image suggestions:', { pageTitle, bookTitle, pageType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context for AI analysis
    const contextText = `
Book Title: ${bookTitle || 'Untitled Book'}
Page Type: ${pageType || 'chapter'}
Page Title: ${pageTitle || 'Untitled'}
Content: ${pageContent || 'No content available'}
    `.trim();

    // Use Lovable AI to analyze content and generate image search terms + AI prompts
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing book content and suggesting relevant imagery. 
Given book/chapter content, you will:
1. Generate 3 specific search terms for stock photography that match the topic, mood, and style
2. Generate 3 detailed AI image prompts that would create professional, editorial-style images matching the content

Respond ONLY with valid JSON in this exact format:
{
  "searchTerms": ["term1", "term2", "term3"],
  "aiPrompts": [
    "Detailed prompt 1 for professional editorial image...",
    "Detailed prompt 2 for professional editorial image...",
    "Detailed prompt 3 for professional editorial image..."
  ],
  "mood": "professional/creative/warm/modern/etc",
  "colorPalette": ["#hexcolor1", "#hexcolor2"]
}`
          },
          {
            role: 'user',
            content: contextText
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI analysis failed:', aiResponse.status);
      // Fallback to basic keyword extraction
      const fallbackTerms = [pageTitle || bookTitle || 'business', 'professional', 'modern'];
      return await fetchUnsplashImages(fallbackTerms, corsHeaders);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI analysis response:', aiContent);

    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysisResult = {
        searchTerms: [pageTitle || 'business', 'professional', 'modern'],
        aiPrompts: [],
        mood: 'professional'
      };
    }

    const { searchTerms = [], aiPrompts = [], mood = 'professional' } = analysisResult;

    // Fetch stock images from Unsplash
    const stockImages: ImageSuggestion[] = [];
    
    for (const term of searchTerms.slice(0, 3)) {
      try {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=2&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        );

        if (unsplashResponse.ok) {
          const unsplashData = await unsplashResponse.json();
          for (const photo of unsplashData.results || []) {
            stockImages.push({
              id: `unsplash-${photo.id}`,
              url: photo.urls.regular,
              thumbnailUrl: photo.urls.small,
              source: 'stock',
              alt: photo.alt_description || term,
            });
          }
        }
      } catch (unsplashError) {
        console.error('Unsplash fetch error for term:', term, unsplashError);
      }
    }

    // Create AI prompt suggestions (these can be used with AI image generation later)
    const aiSuggestions: ImageSuggestion[] = aiPrompts.slice(0, 3).map((prompt: string, idx: number) => ({
      id: `ai-prompt-${idx}`,
      url: '', // Will be generated on demand
      thumbnailUrl: '',
      source: 'ai' as const,
      prompt: prompt,
      alt: `AI Generated: ${prompt.substring(0, 50)}...`,
    }));

    // Dedupe stock images and limit
    const uniqueStockImages = stockImages.reduce((acc: ImageSuggestion[], img) => {
      if (!acc.find(i => i.id === img.id)) {
        acc.push(img);
      }
      return acc;
    }, []).slice(0, 6);

    const suggestions = {
      stockImages: uniqueStockImages,
      aiPrompts: aiSuggestions,
      mood,
      searchTerms,
    };

    console.log('Returning suggestions:', { 
      stockCount: uniqueStockImages.length, 
      aiPromptCount: aiSuggestions.length 
    });

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-ebook-images:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchUnsplashImages(terms: string[], corsHeaders: Record<string, string>) {
  const stockImages: ImageSuggestion[] = [];
  
  for (const term of terms) {
    try {
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=2&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        for (const photo of unsplashData.results || []) {
          stockImages.push({
            id: `unsplash-${photo.id}`,
            url: photo.urls.regular,
            thumbnailUrl: photo.urls.small,
            source: 'stock',
            alt: photo.alt_description || term,
          });
        }
      }
    } catch (e) {
      console.error('Fallback Unsplash error:', e);
    }
  }

  return new Response(JSON.stringify({
    stockImages: stockImages.slice(0, 6),
    aiPrompts: [],
    mood: 'professional',
    searchTerms: terms,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
