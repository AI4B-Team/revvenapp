import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the app URL for redirects
const APP_URL = 'https://82e744b5-adf9-4635-a4c4-d4aad03b4ede.lovableproject.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const facebookAppId = Deno.env.get('FACEBOOK_APP_ID')!;
  const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')!;

  const url = new URL(req.url);
  const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth`;

  // Handle OAuth callback from Facebook
  if (url.searchParams.has('code')) {
    const code = url.searchParams.get('code')!;
    const state = url.searchParams.get('state') || '';
    
    console.log('Facebook OAuth callback received with code');

    try {
      // Exchange code for short-lived user access token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${facebookAppSecret}&code=${code}`;
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Error exchanging code:', tokenData.error);
        const redirectUrl = `${APP_URL}/oauth/callback?success=false&error=${encodeURIComponent(tokenData.error.message)}&provider=Facebook`;
        return Response.redirect(redirectUrl, 302);
      }

      const userAccessToken = tokenData.access_token;
      console.log('Got user access token');

      // Get user's pages
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

      // Store pages in database
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const userId = state; // User ID passed in state

      let savedPageName = '';
      for (const page of pagesData.data) {
        const { error: upsertError } = await supabase
          .from('facebook_pages')
          .upsert({
            user_id: userId,
            page_id: page.id,
            page_name: page.name,
            page_access_token: page.access_token,
            page_picture: page.picture?.data?.url || null,
          }, {
            onConflict: 'user_id,page_id'
          });

        if (upsertError) {
          console.error('Error saving page:', upsertError);
        } else {
          console.log(`Saved page: ${page.name}`);
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

  // Handle POST request to get auth URL or post to Facebook
  if (req.method === 'POST') {
    const body = await req.json();
    const { action, userId, pageId, message, link, videoUrl } = body;

    if (action === 'get_auth_url') {
      const scopes = 'pages_manage_posts,pages_read_engagement,pages_show_list';
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${userId}`;
      
      console.log('Generated Facebook auth URL');
      
      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'post_to_page') {
      console.log('Posting to Facebook page:', pageId);
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get page access token
      const { data: pageData, error: pageError } = await supabase
        .from('facebook_pages')
        .select('page_access_token')
        .eq('page_id', pageId)
        .single();

      if (pageError || !pageData) {
        console.error('Page not found:', pageError);
        return new Response(JSON.stringify({ error: 'Page not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
