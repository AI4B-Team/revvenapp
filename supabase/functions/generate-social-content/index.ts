import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  prompt: string;
  platforms: string[];
  days: number;
}

interface Post {
  id: string;
  title: string;
  platform: string;
  date: string;
  status: 'scheduled' | 'draft';
  type: 'post' | 'carousel' | 'reel' | 'story';
  caption: string;
  hashtags: string[];
  accountName: string;
  accountHandle: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platforms, days = 30 }: ContentRequest = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const platformNames = platforms.join(', ');
    
    const systemPrompt = `You are a social media content strategist. Generate a ${days}-day content calendar with engaging posts.
    
For each post, provide:
- A catchy title (max 60 chars)
- An engaging caption with emojis (150-280 chars)
- 4-6 relevant hashtags (without #)
- Post type: post, carousel, reel, or story

Return ONLY valid JSON array with this structure:
[
  {
    "day": 1,
    "platform": "instagram",
    "title": "...",
    "caption": "...",
    "hashtags": ["tag1", "tag2"],
    "type": "post"
  }
]

Generate 1-2 posts per platform per day. Mix post types for variety. Make content specific to each platform's style.`;

    const userPrompt = `Create a ${days}-day social media content plan for these platforms: ${platformNames}

Theme/Topic: ${prompt}

Generate engaging, platform-specific content that will drive engagement and grow the audience. Each post should be unique and valuable.`;

    console.log('Calling OpenRouter for social content generation...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON from the response
    let posts: any[];
    try {
      // Extract JSON array from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      posts = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse generated content');
    }

    // Transform posts into the expected format with dates
    const today = new Date();
    const formattedPosts: Post[] = posts.map((post: any, index: number) => {
      const postDate = new Date(today);
      postDate.setDate(today.getDate() + (post.day - 1));
      
      // Random time between 8am and 8pm
      const hour = 8 + Math.floor(Math.random() * 12);
      const minute = Math.floor(Math.random() * 4) * 15;
      postDate.setHours(hour, minute, 0, 0);

      return {
        id: `ai-${Date.now()}-${index}`,
        title: post.title || `Day ${post.day} ${post.platform} post`,
        platform: post.platform.toLowerCase(),
        date: postDate.toISOString(),
        status: Math.random() > 0.3 ? 'scheduled' : 'draft',
        type: post.type || 'post',
        caption: post.caption || '',
        hashtags: post.hashtags || [],
        accountName: 'Your Brand',
        accountHandle: '@yourbrand',
      };
    });

    console.log(`Generated ${formattedPosts.length} posts`);

    return new Response(
      JSON.stringify({ success: true, posts: formattedPosts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating social content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
