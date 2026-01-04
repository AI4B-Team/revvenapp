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
  goal?: string;
  language?: string;
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

// Get posting schedule for a specific day of the week
function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

// Parse time string like "9:00 AM" to hours and minutes
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return { hours: 9, minutes: 0 }; // Default
  }
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
}

// Background task to generate social content
async function generateContentInBackground(
  supabaseAdmin: any,
  userId: string,
  jobId: string,
  prompt: string,
  platforms: string[],
  days: number,
  goal: string = 'Engagement',
  language: string = 'English'
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

    // Fetch user's posting schedule
    const { data: userSchedule } = await supabaseAdmin
      .from('posting_schedules')
      .select('*')
      .eq('user_id', userId);
    
    // Organize schedule by day of week
    const scheduleByDay: Record<string, Array<{ time: string; engagement: string }>> = {};
    if (userSchedule && userSchedule.length > 0) {
      for (const slot of userSchedule) {
        if (!scheduleByDay[slot.day]) {
          scheduleByDay[slot.day] = [];
        }
        scheduleByDay[slot.day].push({ time: slot.time, engagement: slot.engagement });
      }
      console.log(`Loaded ${userSchedule.length} posting schedule slots for user`);
    } else {
      console.log('No custom posting schedule found, using default times');
    }

    const batchSize = 2; // Reduced from 5 to ensure responses fit within token limits
    let postIndex = 0;
    let totalPostsGenerated = 0;
    const postsPerDay: Record<number, boolean> = {}; // Track which days have posts
    // Track how many times we've used for each day
    const usedTimesPerDay: Record<string, number> = {};
    
    for (let startDay = 0; startDay < days; startDay += batchSize) {
      const endDay = Math.min(startDay + batchSize, days);
      const batchDays = endDay - startDay;
      const platformNames = platforms.join(', ');
      const platformCount = platforms.length;
      
      // Calculate exact posts needed for this batch
      const postsNeeded = batchDays * platformCount;
      
      // Build explicit day requirements
      const dayRequirements = [];
      for (let d = startDay + 1; d <= endDay; d++) {
        dayRequirements.push(`Day ${d}: 1 post for EACH of these platforms: ${platformNames}`);
      }
      
      const systemPrompt = `You are a social media content strategist. Generate a content calendar for days ${startDay + 1} to ${endDay}.

CONTENT GOAL: ${goal}
- If goal is "Engagement": Focus on questions, polls, interactive content, conversation starters, and content that encourages likes/comments/shares
- If goal is "Awareness": Focus on brand storytelling, educational content, reaching new audiences, and shareable information
- If goal is "Traffic": Include clear calls-to-action, link mentions, and content that drives clicks to websites/landing pages
- If goal is "Sales": Focus on product highlights, promotions, testimonials, urgency, and purchase incentives
- If goal is "Education": Create informative, tutorial-style, how-to content that teaches the audience

LANGUAGE: Write ALL content (titles, captions, text overlays) in ${language}. 
- Use ${language} naturally with appropriate idioms and expressions
- Keep hashtags in ${language} where appropriate, but popular English hashtags can be mixed in
${language === 'Bengali' ? '- For Bengali, use proper বাংলা script with appropriate Unicode characters' : ''}
${language === 'Arabic' ? '- For Arabic, use proper عربي script with right-to-left text' : ''}
${language === 'Hindi' ? '- For Hindi, use proper हिंदी script with Devanagari characters' : ''}
${language === 'Chinese' ? '- For Chinese, use simplified Chinese characters (简体中文)' : ''}
${language === 'Japanese' ? '- For Japanese, use appropriate mix of hiragana, katakana, and kanji' : ''}

MANDATORY REQUIREMENTS:
- You MUST generate EXACTLY ${postsNeeded} posts total
- You MUST generate EXACTLY 1 post per platform per day
- Every single day from ${startDay + 1} to ${endDay} MUST have posts for ALL platforms
- ALL text content MUST be in ${language}

Required posts breakdown:
${dayRequirements.join('\n')}

For each post, provide:
- A catchy title in ${language} (max 60 chars)
- An engaging caption with emojis in ${language} (150-280 chars) - optimize for ${goal}
- 4-6 relevant hashtags (can mix ${language} and English hashtags)
- Post type: post, carousel, reel, or story

PLATFORM-SPECIFIC RULES:
- For TikTok: ALWAYS use type "reel" with videoScript
- For YouTube/YouTube Shorts: ALWAYS use type "reel" with videoScript
- For Instagram: Mix between "post", "carousel", "story", and "reel" (at least 30% should be "reel" type)
- For Facebook: Mix between "post" and "reel" (at least 25% should be "reel" type)
- For other platforms: Use appropriate mix of types

CRITICAL: For ALL "reel" type posts, you MUST include a "videoScript" field with ALL text in ${language}:
{
  "videoScript": {
    "duration": "30s",
    "scenes": [
      { "timestamp": "0:00-0:03", "visual": "Hook shot", "audio": "Hook text in ${language}...", "text_overlay": "🤯 ${language === 'Bengali' ? 'দেখুন' : language === 'Hindi' ? 'देखो' : language === 'Spanish' ? 'MIRA' : 'WATCH'}" },
      { "timestamp": "0:03-0:10", "visual": "Main content", "audio": "Main text in ${language}...", "text_overlay": null },
      { "timestamp": "0:10-0:25", "visual": "Details", "audio": "Details in ${language}...", "text_overlay": "Key point in ${language}" },
      { "timestamp": "0:25-0:30", "visual": "CTA", "audio": "Follow call in ${language}!", "text_overlay": "👆 ${language === 'Bengali' ? 'ফলো করুন' : language === 'Hindi' ? 'फॉलो करें' : language === 'Spanish' ? 'SÍGUEME' : 'FOLLOW'}" }
    ]
  }
}

Return ONLY a valid JSON array. VERIFY you have exactly ${postsNeeded} posts covering all ${batchDays} days and all ${platformCount} platforms.`;

      const userPrompt = `Create EXACTLY ${postsNeeded} posts for days ${startDay + 1} to ${endDay}.
Platforms: ${platformNames}
Theme/Topic: ${prompt}
Goal: ${goal} (optimize content for this goal)
Language: ${language} (write ALL content in this language)

IMPORTANT: Generate 1 post for EACH platform for EACH day. Do not skip any day or platform. Write everything in ${language}.`;

      console.log(`Generating batch: days ${startDay + 1} to ${endDay}, expecting ${postsNeeded} posts for job ${jobId}...`);
      
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
          max_tokens: 8000, // Increased to handle video scripts
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

      // Parse the JSON from the response - handle markdown code fences
      let posts: any[];
      try {
        // Remove markdown code fences if present (```json ... ```)
        let cleanContent = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        
        const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('No JSON array found in response');
          continue;
        }
        posts = JSON.parse(jsonMatch[0]);
        
        // Normalize post_type to type if needed
        posts = posts.map((p: any) => ({
          ...p,
          type: p.type || p.post_type || 'post'
        }));
        
        console.log(`Parsed ${posts.length} posts from AI response`);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content.slice(0, 500));
        continue;
      }

      // Validate and fill missing day/platform combinations
      const generatedCombos = new Set(posts.map((p: any) => `${p.day}-${p.platform.toLowerCase()}`));
      const missingPosts: any[] = [];
      
      for (let d = startDay + 1; d <= endDay; d++) {
        for (const platform of platforms) {
          const key = `${d}-${platform.toLowerCase()}`;
          if (!generatedCombos.has(key)) {
            console.log(`Missing post for day ${d}, platform ${platform} - generating fallback`);
            missingPosts.push({
              day: d,
              platform: platform.toLowerCase(),
              title: `${prompt.slice(0, 40)} - Day ${d}`,
              caption: `Check out today's content! ${prompt.slice(0, 100)}... 🔥`,
              hashtags: ['content', 'daily', platform.toLowerCase()],
              type: ['tiktok', 'youtube'].includes(platform.toLowerCase()) ? 'reel' : 'post',
              videoScript: ['tiktok', 'youtube'].includes(platform.toLowerCase()) ? {
                duration: '30s',
                scenes: [
                  { timestamp: '0:00-0:05', visual: 'Hook shot', audio: 'Hey! Check this out...', text_overlay: '👀 Watch!' },
                  { timestamp: '0:05-0:25', visual: 'Main content', audio: prompt.slice(0, 100), text_overlay: null },
                  { timestamp: '0:25-0:30', visual: 'CTA', audio: 'Follow for more!', text_overlay: '👆 Follow!' }
                ]
              } : null
            });
          }
        }
      }
      
      // Add missing posts to the array
      posts = [...posts, ...missingPosts];
      console.log(`Batch has ${posts.length} posts after filling gaps (${missingPosts.length} fallbacks added)`);

      // Transform and save each post
      // Use a fixed "today" reference based on midnight to ensure consistent date calculation
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      for (const post of posts) {
        // Track this day as having posts
        postsPerDay[post.day] = true;
        
        // Day 1 = today, Day 2 = tomorrow, etc.
        // Create a new date object and set the correct date
        const postDate = new Date(today.getTime());
        postDate.setDate(today.getDate() + (post.day - 1));
        
        // Get the day of week for this post date
        const dayOfWeek = getDayOfWeek(postDate);
        const daySchedule = scheduleByDay[dayOfWeek] || [];
        const dateKey = postDate.toDateString();
        
        // Initialize counter for this date if not exists
        if (!usedTimesPerDay[dateKey]) {
          usedTimesPerDay[dateKey] = 0;
        }
        
        // Try to use the user's schedule times, cycling through them
        let hour: number;
        let minute: number;
        
        if (daySchedule.length > 0) {
          // Use schedule times in order, cycling if more posts than times
          const scheduleIndex = usedTimesPerDay[dateKey] % daySchedule.length;
          const scheduledTime = daySchedule[scheduleIndex];
          const parsed = parseTimeString(scheduledTime.time);
          hour = parsed.hours;
          minute = parsed.minutes;
          usedTimesPerDay[dateKey]++;
          console.log(`Using scheduled time ${scheduledTime.time} for ${dayOfWeek}`);
        } else {
          // Fallback to random time if no schedule
          hour = 8 + Math.floor(Math.random() * 12);
          minute = Math.floor(Math.random() * 4) * 15;
        }
        
        postDate.setHours(hour, minute, 0, 0);

        // Fetch related photos from Pexels - use caption for more relevant results
        const photoCount = post.type === 'carousel' ? 4 : 1;
        // Extract key words from caption (remove emojis, hashtags, and limit length)
        const cleanCaption = (post.caption || '')
          .replace(/[^\w\s]/g, ' ')  // Remove emojis and special chars
          .replace(/\s+/g, ' ')       // Normalize spaces
          .trim()
          .slice(0, 80);              // Limit to first 80 chars for better search
        const searchQuery = cleanCaption || post.title || prompt;
        console.log(`Fetching photos for: "${searchQuery}"`);
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
    const { prompt, platforms, days = 30, goal = 'Engagement', language = 'English', jobId }: ContentRequest = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log(`Received request: goal=${goal}, language=${language}, days=${days}, platforms=${platforms.join(',')}`);

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

    console.log(`Created job ${job.id} for user ${user.id} with goal=${goal}, language=${language}`);

    // Start background processing using EdgeRuntime.waitUntil
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      generateContentInBackground(supabaseAdmin, user.id, job.id, prompt, platforms, days, goal, language)
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
