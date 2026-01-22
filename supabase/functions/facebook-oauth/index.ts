import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the app URL for redirects - use published URL
const APP_URL = 'https://revvenapp.lovable.app';

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyMetaSignature({
  appSecret,
  rawBody,
  signatureHeader,
}: {
  appSecret: string;
  rawBody: string;
  signatureHeader: string | null;
}) {
  if (!signatureHeader) return false;
  const [algo, sigHex] = signatureHeader.split('=');
  if (algo !== 'sha256' || !sigHex) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const macBytes = new Uint8Array(mac);

  // Convert provided hex signature to bytes
  const sigBytes = new Uint8Array(sigHex.length / 2);
  for (let i = 0; i < sigHex.length; i += 2) {
    sigBytes[i / 2] = parseInt(sigHex.slice(i, i + 2), 16);
  }

  return timingSafeEqual(macBytes, sigBytes);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const facebookAppId = Deno.env.get('FACEBOOK_APP_ID')!;
  const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')!;
  const instagramVerifyToken = Deno.env.get('INSTAGRAM_VERIFY_TOKEN')!;
  const instagramClientId = Deno.env.get('INSTAGRAM_CLIENT_ID')!;
  const instagramClientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET')!;

  const url = new URL(req.url);
  const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth`;

  // --- Meta (Facebook/Instagram) Webhook Verification ---
  // GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
  if (req.method === 'GET' && url.searchParams.has('hub.mode')) {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const provided = (token ?? '').trim();
    const expected = (instagramVerifyToken ?? '').trim();
    const tokenMatches = mode === 'subscribe' && provided.length > 0 && provided === expected;

    console.log('Meta webhook verification request:', {
      mode,
      hasChallenge: Boolean(challenge),
      tokenMatches,
      providedTokenLength: provided.length,
      expectedTokenLength: expected.length,
    });

    if (tokenMatches && challenge) {
      console.log('Meta webhook verified successfully');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('Meta webhook verification failed');
    return new Response('Forbidden', { status: 403 });
  }

  // Handle OAuth callback from Facebook
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code')!;
    const state = url.searchParams.get('state') || '';
    const isInstagram = state.startsWith('ig:');
    
    console.log(`${isInstagram ? 'Instagram' : 'Facebook'} OAuth callback received with code`);

    try {
      // --- Instagram OAuth Callback (for IG DMs / Messaging API) ---
      if (isInstagram) {
        const userId = state.replace(/^ig:/, '');

        const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${instagramClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${instagramClientSecret}&code=${code}`;
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          console.error('Error exchanging IG code:', tokenData.error);
          const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(tokenData.error.message)}&provider=Instagram`;
          return Response.redirect(redirectUrl, 302);
        }

        const userAccessToken = tokenData.access_token as string;
        console.log('Got Instagram user access token');

        // Fetch user's pages and their connected Instagram business account
        const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,instagram_business_account{id,username}`;
        const pagesResponse = await fetch(pagesUrl);
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
          console.error('Error fetching pages for IG:', pagesData.error);
          const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(pagesData.error.message)}&provider=Instagram`;
          return Response.redirect(redirectUrl, 302);
        }

        const entries: any[] = pagesData.data || [];
        const withIg = entries.filter((p) => p.instagram_business_account?.id);

        if (withIg.length === 0) {
          const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent('No Instagram Business account found on your connected Facebook Pages. Ensure your IG Professional account is linked to a Facebook Page.')}&provider=Instagram`;
          return Response.redirect(redirectUrl, 302);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Page access tokens are generally long-lived; store with a safety expiration.
        const pageTokenExpiresAt = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000));

        let savedUsername = '';
        for (const page of withIg) {
          const ig = page.instagram_business_account;

          // Store page access token (used for IG Messaging sends as well)
          const { error: upsertPageError } = await supabase
            .from('facebook_pages')
            .upsert({
              user_id: userId,
              page_id: page.id,
              page_name: page.name,
              page_access_token: page.access_token,
              page_picture: null,
              token_expires_at: pageTokenExpiresAt.toISOString(),
              token_type: 'long_lived',
            }, {
              onConflict: 'user_id,page_id'
            });

          if (upsertPageError) {
            console.error('Error saving page for IG:', upsertPageError);
          }

          // Store IG mapping
          const { error: upsertIgError } = await supabase
            .from('instagram_accounts')
            .upsert({
              user_id: userId,
              facebook_page_id: page.id,
              instagram_id: ig.id,
              instagram_username: ig.username || null,
            }, {
              onConflict: 'user_id,instagram_id'
            });

          if (upsertIgError) {
            console.error('Error saving instagram account mapping:', upsertIgError);
          } else {
            savedUsername = ig.username || savedUsername;
          }
        }

        const channel = encodeURIComponent(savedUsername || withIg[0].instagram_business_account?.username || 'Instagram');
        const redirectUrl = `${APP_URL}/oauth/callback?success=true&channel=${channel}&provider=Instagram`;
        return Response.redirect(redirectUrl, 302);
      }

      // Exchange code for short-lived user access token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${facebookAppSecret}&code=${code}`;
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Error exchanging code:', tokenData.error);
        const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(tokenData.error.message)}&provider=Facebook`;
        return Response.redirect(redirectUrl, 302);
      }

      const shortLivedToken = tokenData.access_token;
      console.log('Got short-lived user access token');

      // Exchange short-lived token for long-lived token (60 days)
      const longLivedTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${facebookAppId}&client_secret=${facebookAppSecret}&fb_exchange_token=${shortLivedToken}`;
      
      const longLivedResponse = await fetch(longLivedTokenUrl);
      const longLivedData = await longLivedResponse.json();

      if (longLivedData.error) {
        console.error('Error getting long-lived token:', longLivedData.error);
        // Fall back to short-lived token if exchange fails
      }

      const userAccessToken = longLivedData.access_token || shortLivedToken;
      const tokenExpiresIn = longLivedData.expires_in || 3600; // Default 1 hour for short-lived
      const tokenExpiresAt = new Date(Date.now() + (tokenExpiresIn * 1000));
      
      console.log(`Got ${longLivedData.access_token ? 'long-lived' : 'short-lived'} token, expires in ${tokenExpiresIn} seconds`);

      // Get user's pages with long-lived page access tokens
      const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,picture`;
      const pagesResponse = await fetch(pagesUrl);
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.error('Error fetching pages:', pagesData.error);
        const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(pagesData.error.message)}&provider=Facebook`;
        return Response.redirect(redirectUrl, 302);
      }

      console.log(`Found ${pagesData.data?.length || 0} pages`);

      if (!pagesData.data || pagesData.data.length === 0) {
        const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent('No Facebook Pages found. Please create a Facebook Page first.')}&provider=Facebook`;
        return Response.redirect(redirectUrl, 302);
      }

      // Store pages in database with token expiration
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const userId = state; // User ID passed in state

      let savedPageName = '';
      for (const page of pagesData.data) {
        // Page access tokens obtained from long-lived user tokens don't expire
        // But we'll set a 60-day expiration as a safety measure
        const pageTokenExpiresAt = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)); // 60 days

        const { error: upsertError } = await supabase
          .from('facebook_pages')
          .upsert({
            user_id: userId,
            page_id: page.id,
            page_name: page.name,
            page_access_token: page.access_token,
            page_picture: page.picture?.data?.url || null,
            token_expires_at: pageTokenExpiresAt.toISOString(),
            token_type: 'long_lived',
          }, {
            onConflict: 'user_id,page_id'
          });

        if (upsertError) {
          console.error('Error saving page:', upsertError);
        } else {
          console.log(`Saved page: ${page.name} with token expiring at ${pageTokenExpiresAt.toISOString()}`);
          savedPageName = page.name;
        }
      }

      // Success - redirect to callback page
      const pageName = encodeURIComponent(savedPageName || pagesData.data[0]?.name || 'Facebook Page');
      const redirectUrl = `${APP_URL}/oauth/callback?success=true&channel=${pageName}&provider=Facebook`;
      return Response.redirect(redirectUrl, 302);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OAuth error:', error);
      const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(errorMessage)}&provider=Facebook`;
      return Response.redirect(redirectUrl, 302);
    }
  }

  // Handle POST request to get auth URL, post to Facebook, or refresh token
  if (req.method === 'POST') {
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    // --- Meta Webhook Events ---
    // Meta sends webhook POSTs with headers like: x-hub-signature-256
    // and bodies like: { object: 'page', entry: [...] }
    if (!body?.action && body?.object) {
      const signatureHeader = req.headers.get('x-hub-signature-256');
      const isValid = await verifyMetaSignature({
        appSecret: facebookAppSecret,
        rawBody,
        signatureHeader,
      });

      if (!isValid) {
        console.error('Invalid Meta webhook signature');
        return new Response('Invalid signature', { status: 401 });
      }

      // For now we only acknowledge and log; AI Responder processing will be wired separately.
      console.log('Received Meta webhook event:', JSON.stringify(body));
      return new Response('OK', { status: 200 });
    }

    const { action, userId, pageId, message, link, videoUrl } = body;

    if (action === 'get_auth_url') {
      const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list';
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${userId}`;
      
      console.log('Generated Facebook auth URL');
      
      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_instagram_auth_url') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing userId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const scopes = [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
        'instagram_business_content_publish',
        'instagram_business_manage_insights',
      ].join(',');

      const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${instagramClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(`ig:${userId}`)}`;

      console.log('Generated Instagram auth URL');

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Refresh token action - reconnect to get fresh tokens
    if (action === 'refresh_token') {
      console.log('Token refresh requested for user:', userId);
      
      // For Facebook, the best way to refresh is to re-authorize
      const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list';
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${userId}&auth_type=reauthorize`;
      
      return new Response(JSON.stringify({ 
        auth_url: authUrl,
        message: 'Please re-authorize to refresh your token'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'post_to_page') {
      console.log('Posting to Facebook page:', pageId);
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get page access token and check expiration
      const { data: pageData, error: pageError } = await supabase
        .from('facebook_pages')
        .select('page_access_token, token_expires_at, page_name')
        .eq('page_id', pageId)
        .single();

      if (pageError || !pageData) {
        console.error('Page not found:', pageError);
        return new Response(JSON.stringify({ error: 'Page not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if token is expired
      if (pageData.token_expires_at) {
        const expiresAt = new Date(pageData.token_expires_at);
        if (expiresAt < new Date()) {
          console.error('Token expired for page:', pageData.page_name);
          return new Response(JSON.stringify({ 
            error: 'Token expired. Please reconnect your Facebook page.',
            token_expired: true
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const pageAccessToken = pageData.page_access_token;

      // Post to page
      let postUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const postBody: any = {
        message,
        access_token: pageAccessToken,
      };

      if (link) {
        postBody.link = link;
      }

      // If there's a video URL, post as video instead
      if (videoUrl) {
        postUrl = `https://graph.facebook.com/v19.0/${pageId}/videos`;
        postBody.file_url = videoUrl;
        postBody.description = message;
        delete postBody.message;
      }

      const postResponse = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      });

      const postData = await postResponse.json();

      if (postData.error) {
        console.error('Error posting:', postData.error);
        return new Response(JSON.stringify({ error: postData.error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Posted successfully:', postData.id);

      return new Response(JSON.stringify({ 
        success: true, 
        post_id: postData.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
