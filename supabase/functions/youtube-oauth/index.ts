import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID');
const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle OAuth callback
    if (url.pathname.includes('/callback')) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // Contains user_id
      
      if (!code || !state) {
        return new Response(`
          <html><body><script>
            window.opener.postMessage({ type: 'youtube_oauth_error', error: 'Missing code or state' }, '*');
            window.close();
          </script></body></html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: YOUTUBE_CLIENT_ID!,
          client_secret: YOUTUBE_CLIENT_SECRET!,
          redirect_uri: `${SUPABASE_URL}/functions/v1/youtube-oauth/callback`,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();
      console.log('Token exchange response:', { 
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in
      });

      if (!tokens.access_token) {
        return new Response(`
          <html><body><script>
            window.opener.postMessage({ type: 'youtube_oauth_error', error: 'Failed to get access token' }, '*');
            window.close();
          </script></body></html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Get channel info
      const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      });
      const channelData = await channelResponse.json();
      console.log('Channel data:', channelData);

      if (!channelData.items || channelData.items.length === 0) {
        return new Response(`
          <html><body><script>
            window.opener.postMessage({ type: 'youtube_oauth_error', error: 'No YouTube channel found' }, '*');
            window.close();
          </script></body></html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      const channel = channelData.items[0];
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      // Store channel connection
      const { error: insertError } = await supabase
        .from('youtube_channels')
        .upsert({
          user_id: state,
          channel_id: channel.id,
          channel_title: channel.snippet.title,
          channel_thumbnail: channel.snippet.thumbnails?.default?.url || null,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        }, { onConflict: 'user_id,channel_id' });

      if (insertError) {
        console.error('Error storing channel:', insertError);
        return new Response(`
          <html><body><script>
            window.opener.postMessage({ type: 'youtube_oauth_error', error: 'Failed to store channel' }, '*');
            window.close();
          </script></body></html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      return new Response(`
        <html><body><script>
          window.opener.postMessage({ type: 'youtube_oauth_success' }, '*');
          window.close();
        </script></body></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // Regular API calls
    const { action } = await req.json();

    // Get user from authorization header
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

    if (action === 'get_auth_url') {
      const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly'
      ].join(' ');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${YOUTUBE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(`${SUPABASE_URL}/functions/v1/youtube-oauth/callback`)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${user.id}`;

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error in youtube-oauth:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});