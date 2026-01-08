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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>YouTube Connected</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #fff;
            }
            .container {
              text-align: center;
              padding: 3rem;
              background: rgba(255,255,255,0.05);
              border-radius: 1.5rem;
              border: 1px solid rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              max-width: 400px;
              animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 1.5rem;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
              50% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
            }
            .icon svg {
              width: 40px;
              height: 40px;
              color: white;
            }
            h1 {
              font-size: 1.75rem;
              font-weight: 700;
              margin-bottom: 0.75rem;
            }
            p {
              color: rgba(255,255,255,0.7);
              margin-bottom: 1.5rem;
              line-height: 1.6;
            }
            .channel-name {
              display: inline-block;
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
            }
            .closing {
              font-size: 0.875rem;
              color: rgba(255,255,255,0.5);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">
              <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1>Successfully Connected!</h1>
            <div class="channel-name">${channel.snippet.title}</div>
            <p>Your YouTube channel has been linked. You can now generate and publish videos directly.</p>
            <p class="closing">This window will close automatically...</p>
          </div>
          <script>
            setTimeout(function() {
              if (window.opener) {
                window.opener.postMessage({ type: 'youtube_oauth_success' }, '*');
              }
              window.close();
            }, 2000);
          </script>
        </body>
        </html>
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