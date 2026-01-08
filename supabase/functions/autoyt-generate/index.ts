import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

async function generateVideoMetadata(prompt: string): Promise<{ title: string; description: string; tags: string[] }> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a YouTube SEO expert. Generate optimized metadata for a YouTube video based on the given prompt. Return a JSON object with:
- title: Catchy, SEO-friendly title (max 100 characters)
- description: Engaging description with keywords (150-300 words)
- tags: Array of 8-15 relevant tags for discoverability

Only return valid JSON, no other text.`
          },
          {
            role: 'user',
            content: `Generate YouTube metadata for a video about: ${prompt}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_metadata",
              description: "Generate YouTube video metadata",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Video title, max 100 chars" },
                  description: { type: "string", description: "Video description, 150-300 words" },
                  tags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "8-15 relevant tags"
                  }
                },
                required: ["title", "description", "tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_metadata" } }
      }),
    });

    const data = await response.json();
    console.log('AI metadata response:', JSON.stringify(data));

    // Extract from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        title: parsed.title || prompt.slice(0, 100),
        description: parsed.description || '',
        tags: parsed.tags || []
      };
    }

    // Fallback: try parsing content as JSON
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || prompt.slice(0, 100),
        description: parsed.description || '',
        tags: parsed.tags || []
      };
    }

    throw new Error('No valid response from AI');
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback to basic metadata
    return {
      title: prompt.slice(0, 100),
      description: `Video created from prompt: ${prompt}`,
      tags: prompt.split(' ').filter(w => w.length > 3).slice(0, 10)
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      videoId, 
      prompt, 
      sourceType, 
      sourceImageUrl,
      publishMode,
      category,
      visibility,
      regenerateMetadataOnly
    } = await req.json();

    console.log('Generating video:', { videoId, prompt, sourceType, publishMode, regenerateMetadataOnly });

    // Generate metadata with AI
    console.log('Generating metadata with AI...');
    const metadata = await generateVideoMetadata(prompt);
    console.log('Generated metadata:', metadata);

    // Update video record with generated metadata
    await supabase
      .from('autoyt_videos')
      .update({
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      })
      .eq('id', videoId);

    // If only regenerating metadata, return early
    if (regenerateMetadataOnly) {
      return new Response(JSON.stringify({ 
        success: true, 
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update video record with generated metadata
    await supabase
      .from('autoyt_videos')
      .update({
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      })
      .eq('id', videoId);

    // Generate video with Veo 3.1 - always 30 seconds
    const veoPayload: any = {
      prompt,
      aspectRatio: '16:9',
      model: 'veo3_fast',
      duration: 30,
    };

    // If image-to-video, include the source image
    if (sourceType === 'image' && sourceImageUrl) {
      veoPayload.imageUrls = [sourceImageUrl];
      veoPayload.generationType = 'REFERENCE_2_VIDEO';
    } else {
      veoPayload.generationType = 'TEXT_2_VIDEO';
    }

    console.log('Calling Veo 3.1 API with payload:', veoPayload);

    // Call Veo 3.1 API via KIE
    const veoResponse = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify(veoPayload),
    });

    const veoData = await veoResponse.json();
    console.log('VO3 response:', veoData);

    if (!veoData.data?.taskId) {
      throw new Error('Failed to start video generation');
    }

    // Update video record with task ID and set status
    const { error: updateError } = await supabase
      .from('autoyt_videos')
      .update({
        status: publishMode === 'queue' ? 'queued' : 'generating',
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Error updating video record:', updateError);
    }

    // Start background task to poll for completion
    (globalThis as any).EdgeRuntime?.waitUntil?.(pollVideoCompletion(
      supabase, 
      videoId, 
      veoData.data.taskId, 
      publishMode
    )) || pollVideoCompletion(supabase, videoId, veoData.data.taskId, publishMode);

    return new Response(JSON.stringify({ 
      success: true, 
      taskId: veoData.data.taskId,
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error in autoyt-generate:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function pollVideoCompletion(
  supabase: any, 
  videoId: string, 
  taskId: string,
  publishMode: string
) {
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  const maxAttempts = 120; // 10 minutes max (video generation can take a while)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;

    try {
      // Use the correct record-info endpoint with query parameter
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      });

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempts}:`, JSON.stringify(statusData));

      // successFlag: 0=generating, 1=success, 2=failed, 3=generation failed
      const successFlag = statusData.data?.successFlag;
      
      if (successFlag === 1) {
        // Success - get video URL from response.resultUrls
        const videoUrl = statusData.data?.response?.resultUrls?.[0] || 
                         statusData.data?.response?.originUrls?.[0];
        
        if (!videoUrl) {
          console.error('No video URL in response:', statusData);
          continue;
        }
        
        // Update video record
        await supabase
          .from('autoyt_videos')
          .update({
            video_url: videoUrl,
            status: publishMode === 'instant' ? 'ready' : 'queued',
          })
          .eq('id', videoId);

        // If instant publish, trigger publishing
        if (publishMode === 'instant') {
          await publishToYouTube(supabase, videoId);
        }

        console.log('Video generation completed:', videoId);
        return;
      }

      if (successFlag === 2 || successFlag === 3) {
        // Failed
        const errorMessage = statusData.data?.errorMessage || 'Video generation failed';
        await supabase
          .from('autoyt_videos')
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', videoId);
        return;
      }
      
      // successFlag === 0 means still generating, continue polling
    } catch (error) {
      console.error('Error polling video status:', error);
    }
  }

  // Timeout
  await supabase
    .from('autoyt_videos')
    .update({
      status: 'failed',
      error_message: 'Video generation timed out after 10 minutes',
    })
    .eq('id', videoId);
}

async function publishToYouTube(supabase: any, videoId: string) {
  // Get video record with channel info
  const { data: video, error: videoError } = await supabase
    .from('autoyt_videos')
    .select('*, youtube_channels(*)')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    console.error('Error getting video for publishing:', videoError);
    return;
  }

  if (!video.channel_id) {
    console.error('No channel selected for video');
    return;
  }

  // Get channel with tokens
  const { data: channel, error: channelError } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('id', video.channel_id)
    .single();

  if (channelError || !channel) {
    console.error('Error getting channel:', channelError);
    await supabase
      .from('autoyt_videos')
      .update({ 
        status: 'failed', 
        error_message: 'Channel not found' 
      })
      .eq('id', videoId);
    return;
  }

  // Update status to publishing
  await supabase
    .from('autoyt_videos')
    .update({ status: 'publishing' })
    .eq('id', videoId);

  try {
    // Refresh token if needed
    let accessToken = channel.access_token;
    const tokenExpiry = new Date(channel.token_expires_at);
    
    if (tokenExpiry < new Date()) {
      const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID');
      const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: YOUTUBE_CLIENT_ID!,
          client_secret: YOUTUBE_CLIENT_SECRET!,
          refresh_token: channel.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        
        // Update stored token
        await supabase
          .from('youtube_channels')
          .update({
            access_token: accessToken,
            token_expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
          })
          .eq('id', channel.id);
      }
    }

    // Download video file
    const videoResponse = await fetch(video.video_url);
    const videoBlob = await videoResponse.blob();

    // Upload to YouTube
    const metadata = {
      snippet: {
        title: video.title || 'AutoYT Video',
        description: video.description || '',
        tags: video.tags || [],
        categoryId: video.category || '22',
      },
      status: {
        privacyStatus: video.visibility || 'private',
        selfDeclaredMadeForKids: false,
      },
    };

    // Start resumable upload
    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': videoBlob.size.toString(),
        },
        body: JSON.stringify(metadata),
      }
    );

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    // Upload video
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'video/mp4',
        'Content-Length': videoBlob.size.toString(),
      },
      body: videoBlob,
    });

    const uploadResult = await uploadResponse.json();
    console.log('YouTube upload result:', uploadResult);

    if (uploadResult.id) {
      await supabase
        .from('autoyt_videos')
        .update({
          status: 'published',
          youtube_video_id: uploadResult.id,
          published_at: new Date().toISOString(),
        })
        .eq('id', videoId);
    } else {
      throw new Error('Upload failed: ' + JSON.stringify(uploadResult));
    }
  } catch (error: any) {
    console.error('Error publishing to YouTube:', error);
    await supabase
      .from('autoyt_videos')
      .update({
        status: 'failed',
        error_message: error?.message || 'Failed to publish to YouTube',
      })
      .eq('id', videoId);
  }
}