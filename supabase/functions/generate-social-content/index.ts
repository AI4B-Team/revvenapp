import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  prompt: string;
  platforms: string[];
  days: number;
  jobId?: string;
}

// Fetch related stock photos from Pexels
async function fetchPexelsPhotos(query: string, count: number = 1): Promise<string[]> {
  const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
  if (!PEXELS_API_KEY) {
    console.log('PEXELS_API_KEY not configured, skipping photo fetch');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.photos?.map((photo: any) => photo.src?.medium || photo.src?.small) || [];
  } catch (error) {
    console.error('Error fetching Pexels photos:', error);
    return [];
  }
}

// Background task to generate social content
async function generateContentInBackground(
  supabaseAdmin: any,
  userId: string,
  jobId: string,
  prompt: string,
  platforms: string[],
  days: number
) {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  try {
    console.log(`Starting background generation for job ${jobId}`);
    
    // Update job status to processing
    await supabaseAdmin
      .from('social_content_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    // Clear existing posts for this user before generating new ones
    await supabaseAdmin
      .from('social_posts')
      .delete()
      .eq('user_id', userId);

    const batchSize = 5;
    let postIndex = 0;
    let totalPostsGenerated = 0;
    
    for (let startDay = 0; startDay < days; startDay += batchSize) {
      const endDay = Math.min(startDay + batchSize, days);
      const platformNames = platforms.join(', ');
      
      const systemPrompt = `You are a social media content strategist. Generate a content calendar for days ${startDay + 1} to ${endDay}.

For each post, provide:
- A catchy title (max 60 chars)
- An engaging caption with emojis (150-280 chars)
- 4-6 relevant hashtags (without #)
- Post type: post, carousel, reel, or story

IMPORTANT PLATFORM-SPECIFIC RULES:
- For TikTok: ALWAYS use type "reel" with videoScript
- For YouTube/YouTube Shorts: ALWAYS use type "reel" with videoScript
- For Instagram: Mix between "post", "carousel", "story", and "reel" (at least 30% should be "reel" type)
- For Facebook: Mix between "post" and "reel" (at least 25% should be "reel" type)
- For other platforms: Use appropriate mix of types

CRITICAL: For ALL "reel" type posts (video content), you MUST include a "videoScript" field with a full video script including timestamps. The script should be structured like this:
{
  "videoScript": {
    "duration": "30s",
    "scenes": [
      { "timestamp": "0:00-0:03", "visual": "Hook shot - attention grabber", "audio": "Wait, you need to see this...", "text_overlay": "🤯 WATCH THIS" },
      { "timestamp": "0:03-0:10", "visual": "Main content reveal", "audio": "Here's what happened...", "text_overlay": null },
      { "timestamp": "0:10-0:25", "visual": "Demonstration or story", "audio": "Detailed explanation...", "text_overlay": "Key point here" },
      { "timestamp": "0:25-0:30", "visual": "Call to action", "audio": "Follow for more!", "text_overlay": "👆 FOLLOW" }
    ]
  }
}

Return ONLY valid JSON array with this structure:
[
  {
    "day": ${startDay + 1},
    "platform": "instagram",
    "title": "...",
    "caption": "...",
    "hashtags": ["tag1", "tag2"],
    "type": "reel",
    "videoScript": {
      "duration": "30s",
      "scenes": [...]
    }
  }
]

Generate 1-2 posts per platform per day. Make sure to include REELS for Instagram, Facebook, TikTok, and YouTube. Make content specific to each platform's style.`;

      const userPrompt = `Create content for days ${startDay + 1} to ${endDay} for these platforms: ${platformNames}

Theme/Topic: ${prompt}

Generate engaging, platform-specific content. Each post should be unique and valuable.`;

      console.log(`Generating batch: days ${startDay + 1} to ${endDay} for job ${jobId}...`);
      
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
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', response.status, errorText);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('No content in response');
        continue;
      }

      // Parse the JSON from the response
      let posts: any[];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('No JSON array found in response');
          continue;
        }
        posts = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        continue;
      }

      // Transform and save each post
      const today = new Date();
      for (const post of posts) {
        const postDate = new Date(today);
        postDate.setDate(today.getDate() + (post.day - 1));
        
        const hour = 8 + Math.floor(Math.random() * 12);
        const minute = Math.floor(Math.random() * 4) * 15;
        postDate.setHours(hour, minute, 0, 0);

        // Fetch related photos from Pexels
        const photoCount = post.type === 'carousel' ? 4 : 1;
        const searchQuery = post.title || prompt;
        const photos = await fetchPexelsPhotos(searchQuery, photoCount);

        // Save post to database
        const { error: insertError } = await supabaseAdmin
          .from('social_posts')
          .insert({
            user_id: userId,
            title: post.title || `Day ${post.day} ${post.platform} post`,
            platform: post.platform.toLowerCase(),
            scheduled_date: postDate.toISOString(),
            status: Math.random() > 0.3 ? 'scheduled' : 'draft',
            type: post.type || 'post',
            caption: post.caption || '',
            hashtags: post.hashtags || [],
            account_name: 'Your Brand',
            account_handle: '@yourbrand',
            video_script: post.videoScript || null,
            image_url: photos[0] || null,
            carousel_images: post.type === 'carousel' ? photos : null,
          });

        if (insertError) {
          console.error('Error saving post:', insertError);
        } else {
          totalPostsGenerated++;
        }

        postIndex++;
      }

      // Update job progress
      await supabaseAdmin
        .from('social_content_jobs')
        .update({ 
          generated_posts: totalPostsGenerated,
          total_posts: Math.ceil(days * platforms.length * 1.5) // Estimate
        })
        .eq('id', jobId);

      console.log(`Batch complete: ${posts.length} posts saved for job ${jobId}`);
    }

    // Mark job as completed
    await supabaseAdmin
      .from('social_content_jobs')
      .update({ 
        status: 'completed',
        generated_posts: totalPostsGenerated,
        total_posts: totalPostsGenerated,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Job ${jobId} completed with ${totalPostsGenerated} posts`);

  } catch (error) {
    console.error(`Error in background job ${jobId}:`, error);
    
    // Mark job as failed
    await supabaseAdmin
      .from('social_content_jobs')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platforms, days = 30, jobId }: ContentRequest = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create Supabase client with service role for background operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from token
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Invalid auth token');
    }

    // Create a job record
    const { data: job, error: jobError } = await supabaseAdmin
      .from('social_content_jobs')
      .insert({
        user_id: user.id,
        prompt,
        platforms,
        days,
        status: 'pending',
        total_posts: Math.ceil(days * platforms.length * 1.5),
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    console.log(`Created job ${job.id} for user ${user.id}`);

    // Start background processing using EdgeRuntime.waitUntil
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      generateContentInBackground(supabaseAdmin, user.id, job.id, prompt, platforms, days)
    );

    // Return immediately with job ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Content generation started in background'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Error starting social content generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
