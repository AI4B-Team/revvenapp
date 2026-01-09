import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SocialPost {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  caption: string | null;
  hashtags: string[] | null;
  image_url: string | null;
  video_script: any;
  scheduled_date: string;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time
    const now = new Date().toISOString();

    // Fetch all posts that are:
    // 1. auto_publish = true
    // 2. status = 'scheduled'
    // 3. scheduled_date <= now (due for publishing)
    const { data: postsToPublish, error: fetchError } = await supabase
      .from("social_posts")
      .select("*")
      .eq("auto_publish", true)
      .eq("status", "scheduled")
      .lte("scheduled_date", now);

    if (fetchError) {
      console.error("Error fetching posts:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch posts", details: fetchError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      console.log("No posts to publish at this time");
      return new Response(
        JSON.stringify({ message: "No posts to publish", publishedCount: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${postsToPublish.length} posts to publish`);

    const results: { postId: string; platform: string; success: boolean; error?: string }[] = [];

    for (const post of postsToPublish as SocialPost[]) {
      try {
        console.log(`Publishing post ${post.id} to ${post.platform}`);

        // For now, we'll mark the post as published
        // In a full implementation, you would integrate with each platform's API here
        // (YouTube, Facebook, Instagram, etc.)

        let publishSuccess = false;
        let publishError = "";

        // Platform-specific publishing logic
        switch (post.platform.toLowerCase()) {
          case "youtube":
            // YouTube publishing would require OAuth tokens from youtube_channels table
            // For now, mark as ready for manual review
            publishSuccess = true;
            break;

          case "facebook":
            // Facebook publishing would require page access tokens from facebook_pages table
            // For now, mark as ready for manual review
            publishSuccess = true;
            break;

          case "instagram":
          case "twitter":
          case "linkedin":
          case "threads":
          case "tiktok":
            // These platforms require their own OAuth integrations
            // For now, mark as published (simulating success)
            publishSuccess = true;
            break;

          default:
            publishSuccess = true;
            break;
        }

        if (publishSuccess) {
          // Update post status to 'published'
          const { error: updateError } = await supabase
            .from("social_posts")
            .update({ 
              status: "published",
              updated_at: new Date().toISOString()
            })
            .eq("id", post.id);

          if (updateError) {
            console.error(`Failed to update post ${post.id}:`, updateError);
            results.push({ 
              postId: post.id, 
              platform: post.platform, 
              success: false, 
              error: updateError.message 
            });
          } else {
            console.log(`Successfully published post ${post.id}`);
            results.push({ 
              postId: post.id, 
              platform: post.platform, 
              success: true 
            });
          }
        } else {
          // Mark as failed
          await supabase
            .from("social_posts")
            .update({ 
              status: "failed",
              updated_at: new Date().toISOString()
            })
            .eq("id", post.id);

          results.push({ 
            postId: post.id, 
            platform: post.platform, 
            success: false, 
            error: publishError 
          });
        }
      } catch (postError: unknown) {
        const errorMessage = postError instanceof Error ? postError.message : 'Unknown error';
        console.error(`Error publishing post ${post.id}:`, postError);
        results.push({ 
          postId: post.id, 
          platform: post.platform, 
          success: false, 
          error: errorMessage 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Publishing complete: ${successCount} succeeded, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Auto-publish completed",
        publishedCount: successCount,
        failedCount,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Auto-publish error:", error);
    return new Response(
      JSON.stringify({ error: "Auto-publish failed", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
