import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID');
const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET');

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

    const { videoId } = await req.json();

    // Get video record
    const { data: video, error: videoError } = await supabase
      .from('autoyt_videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (videoError || !video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!video.video_url) {
      return new Response(JSON.stringify({ error: 'Video not ready' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if we have at least one platform to publish to
    const hasYouTube = !!video.channel_id;
    const hasFacebook = video.post_to_facebook && !!video.facebook_page_id;

    if (!hasYouTube && !hasFacebook) {
      return new Response(JSON.stringify({ error: 'No platform selected for publishing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update status to publishing
    await supabase
      .from('autoyt_videos')
      .update({ status: 'publishing' })
      .eq('id', videoId);

    // Start publishing in background
    const publishPromise = publishToPlatforms(supabase, video, user.id);
    (globalThis as any).EdgeRuntime?.waitUntil?.(publishPromise) || publishPromise;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error in autoyt-publish:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function publishToPlatforms(supabase: any, video: any, userId: string) {
  const results = {
    youtube: { success: false, videoId: null as string | null, error: null as string | null },
    facebook: { success: false, postId: null as string | null, error: null as string | null },
  };

  // Publish to YouTube if channel is set
  if (video.channel_id) {
    try {
      const { data: channel, error: channelError } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('id', video.channel_id)
        .eq('user_id', userId)
        .single();

      if (channelError || !channel) {
        results.youtube.error = 'YouTube channel not found';
      } else {
        const ytResult = await publishToYouTube(supabase, video, channel);
        results.youtube = ytResult;
      }
    } catch (error: any) {
      results.youtube.error = error?.message || 'Failed to publish to YouTube';
    }
  }

  // Publish to Facebook if enabled
  if (video.post_to_facebook && video.facebook_page_id) {
    try {
      const { data: fbPage, error: fbError } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('id', video.facebook_page_id)
        .eq('user_id', userId)
        .single();

      if (fbError || !fbPage) {
        results.facebook.error = 'Facebook page not found';
      } else {
        const fbResult = await publishToFacebook(video, fbPage);
        results.facebook = fbResult;
      }
    } catch (error: any) {
      results.facebook.error = error?.message || 'Failed to publish to Facebook';
    }
  }

  // Determine overall status
  const ytSuccess = !video.channel_id || results.youtube.success;
  const fbSuccess = !video.post_to_facebook || !video.facebook_page_id || results.facebook.success;
  
  const overallSuccess = ytSuccess && fbSuccess;
  const partialSuccess = results.youtube.success || results.facebook.success;

  let status = 'failed';
  let errorMessage = null;

  if (overallSuccess) {
    status = 'published';
  } else if (partialSuccess) {
    status = 'partial';
    const errors = [];
    if (results.youtube.error) errors.push(`YouTube: ${results.youtube.error}`);
    if (results.facebook.error) errors.push(`Facebook: ${results.facebook.error}`);
    errorMessage = errors.join('; ');
  } else {
    const errors = [];
    if (results.youtube.error) errors.push(`YouTube: ${results.youtube.error}`);
    if (results.facebook.error) errors.push(`Facebook: ${results.facebook.error}`);
    errorMessage = errors.join('; ');
  }

  // Update video record
  await supabase
    .from('autoyt_videos')
    .update({
      status,
      youtube_video_id: results.youtube.videoId,
      facebook_post_id: results.facebook.postId,
      published_at: overallSuccess || partialSuccess ? new Date().toISOString() : null,
      error_message: errorMessage,
    })
    .eq('id', video.id);

  console.log('Publishing complete:', { status, results });
}

async function publishToYouTube(supabase: any, video: any, channel: any): Promise<{ success: boolean; videoId: string | null; error: string | null }> {
  try {
    // Refresh token if needed
    let accessToken = channel.access_token;
    const tokenExpiry = new Date(channel.token_expires_at);
    
    if (tokenExpiry < new Date()) {
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
    console.log('Downloading video from:', video.video_url);
    const videoResponse = await fetch(video.video_url);
    const videoBlob = await videoResponse.blob();
    console.log('Video downloaded, size:', videoBlob.size);

    // Upload to YouTube
    const metadata = {
      snippet: {
        title: video.title || 'Auto Post Video',
        description: video.description || '',
        tags: video.tags || [],
        categoryId: video.category || '22',
      },
      status: {
        privacyStatus: video.visibility || 'private',
        selfDeclaredMadeForKids: false,
      },
    };

    console.log('Starting YouTube upload with metadata:', metadata);

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

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Failed to initialize upload: ${errorText}`);
    }

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    console.log('Got upload URL, uploading video...');

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
      console.log('Video published to YouTube successfully:', uploadResult.id);
      return { success: true, videoId: uploadResult.id, error: null };
    } else {
      throw new Error('Upload failed: ' + JSON.stringify(uploadResult));
    }
  } catch (error: any) {
    console.error('Error publishing to YouTube:', error);
    return { success: false, videoId: null, error: error?.message || 'Failed to publish to YouTube' };
  }
}

async function publishToFacebook(video: any, fbPage: any): Promise<{ success: boolean; postId: string | null; error: string | null }> {
  try {
    const pageAccessToken = fbPage.page_access_token;
    const pageId = fbPage.page_id;

    console.log('Publishing video to Facebook page:', fbPage.page_name);

    // Post video to Facebook page
    const postUrl = `https://graph.facebook.com/v19.0/${pageId}/videos`;
    const postBody = {
      file_url: video.video_url,
      description: video.description || video.title || 'Auto Post Video',
      access_token: pageAccessToken,
    };

    console.log('Posting to Facebook:', postUrl);

    const postResponse = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    });

    const postData = await postResponse.json();

    if (postData.error) {
      console.error('Facebook posting error:', postData.error);
      throw new Error(postData.error.message || 'Failed to post to Facebook');
    }

    console.log('Video posted to Facebook successfully:', postData.id);
    return { success: true, postId: postData.id, error: null };
  } catch (error: any) {
    console.error('Error publishing to Facebook:', error);
    return { success: false, postId: null, error: error?.message || 'Failed to publish to Facebook' };
  }
}