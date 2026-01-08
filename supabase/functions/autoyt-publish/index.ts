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

    if (!video.channel_id) {
      return new Response(JSON.stringify({ error: 'No channel selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get channel with tokens
    const { data: channel, error: channelError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('id', video.channel_id)
      .eq('user_id', user.id)
      .single();

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: 'Channel not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update status to publishing
    await supabase
      .from('autoyt_videos')
      .update({ status: 'publishing' })
      .eq('id', videoId);

    // Start publishing in background
    (globalThis as any).EdgeRuntime?.waitUntil?.(publishToYouTube(supabase, video, channel)) || publishToYouTube(supabase, video, channel);

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

async function publishToYouTube(supabase: any, video: any, channel: any) {
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
      await supabase
        .from('autoyt_videos')
        .update({
          status: 'published',
          youtube_video_id: uploadResult.id,
          published_at: new Date().toISOString(),
        })
        .eq('id', video.id);
      
      console.log('Video published successfully:', uploadResult.id);
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
      .eq('id', video.id);
  }
}