import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supported platforms by snap-video3 API
const SUPPORTED_PLATFORMS = [
  '9gag', 'akillitv', 'bandcamp', 'bilibili', 'bitchute', 'blogger', 'blogspot',
  'buzzfeed', 'capcut', 'chingari', 'dailymotion', 'douyin', 'espn', 'facebook',
  'fb.watch', 'febspot', 'flickr', 'gaana', 'ifunny', 'imdb', 'imgur', 'instagram',
  'izlesene', 'kickstarter', 'kinemaster', 'kuaishou', 'kwai', 'likee', 'linkedin',
  'mashable', 'mixcloud', 'mxtakatak', 'ok.ru', 'odnoklassniki', 'periscope',
  'pinterest', 'puhutv', 'reddit', 'rumble', 'snapchat', 'soundcloud', 'streamable',
  'ted', 'threads', 'tiktok', 'tumblr', 'twitch', 'twitter', 'x.com', 'vimeo',
  'vk', 'weibo', 'xiaohongshu', 'youtube', 'youtu.be', 'zingmp3'
];

function isSupportedPlatform(url: string): boolean {
  const urlLower = url.toLowerCase();
  return SUPPORTED_PLATFORMS.some(platform => urlLower.includes(platform));
}

function getPlatformName(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube') || urlLower.includes('youtu.be')) return 'YouTube';
  if (urlLower.includes('tiktok')) return 'TikTok';
  if (urlLower.includes('instagram')) return 'Instagram';
  if (urlLower.includes('facebook') || urlLower.includes('fb.watch')) return 'Facebook';
  if (urlLower.includes('twitter') || urlLower.includes('x.com')) return 'Twitter/X';
  if (urlLower.includes('vimeo')) return 'Vimeo';
  if (urlLower.includes('reddit')) return 'Reddit';
  if (urlLower.includes('soundcloud')) return 'SoundCloud';
  if (urlLower.includes('dailymotion')) return 'Dailymotion';
  if (urlLower.includes('twitch')) return 'Twitch';
  if (urlLower.includes('pinterest')) return 'Pinterest';
  if (urlLower.includes('linkedin')) return 'LinkedIn';
  if (urlLower.includes('threads')) return 'Threads';
  if (urlLower.includes('snapchat')) return 'Snapchat';
  if (urlLower.includes('rumble')) return 'Rumble';
  if (urlLower.includes('bilibili')) return 'Bilibili';
  if (urlLower.includes('douyin')) return 'Douyin';
  if (urlLower.includes('kwai') || urlLower.includes('kuaishou')) return 'Kwai';
  if (urlLower.includes('ted.com')) return 'TED';
  if (urlLower.includes('bandcamp')) return 'Bandcamp';
  if (urlLower.includes('mixcloud')) return 'Mixcloud';
  if (urlLower.includes('capcut')) return 'CapCut';
  
  return 'Media';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("No URL provided");
    }

    // Validate URL format
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Check if platform is supported
    if (!isSupportedPlatform(cleanUrl)) {
      throw new Error("Unsupported platform. Supported: YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Reddit, SoundCloud, Dailymotion, Twitch, Pinterest, LinkedIn, Threads, Snapchat, Rumble, Bilibili, Douyin, Kwai, TED, Bandcamp, Mixcloud, CapCut, and 40+ more.");
    }

    const platformName = getPlatformName(cleanUrl);
    console.log(`Extracting media from ${platformName}:`, cleanUrl);

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY") || "95ca0bc5aemsh3c366a842c91a7ep1fd154jsn605142776c85";

    // Use snap-video3 API to get download URL - supports all platforms
    const downloadResponse = await fetch("https://snap-video3.p.rapidapi.com/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "snap-video3.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: `url=${encodeURIComponent(cleanUrl)}`,
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error("Snap Video API error:", downloadResponse.status, errorText);
      throw new Error(`Failed to extract from ${platformName}. Please check the URL and try again.`);
    }

    const downloadData = await downloadResponse.json();
    console.log("Snap Video API response received, title:", downloadData.title);

    let downloadUrl: string | null = null;
    let title = downloadData.title || `${platformName}_media`;
    let extension = "mp4";

    // Extract download URL from medias array (primary source)
    if (downloadData.medias && Array.isArray(downloadData.medias) && downloadData.medias.length > 0) {
      // Prefer audio format for music platforms, otherwise get video
      const isMusicPlatform = ['soundcloud', 'bandcamp', 'mixcloud', 'gaana', 'zingmp3'].some(
        p => cleanUrl.toLowerCase().includes(p)
      );
      
      let selectedMedia = downloadData.medias[0];
      
      // For music platforms, try to find audio-only format
      if (isMusicPlatform) {
        const audioMedia = downloadData.medias.find((m: any) => 
          m.extension === 'mp3' || m.extension === 'ogg' || m.type === 'audio'
        );
        if (audioMedia) {
          selectedMedia = audioMedia;
        }
      }
      
      downloadUrl = selectedMedia.url;
      extension = selectedMedia.extension || "mp4";
      console.log(`Found media URL, quality: ${selectedMedia.quality}, extension: ${extension}`);
    }

    if (!downloadUrl) {
      console.log("No media URL found in response:", JSON.stringify(downloadData));
      throw new Error(`No downloadable media found for this ${platformName} URL. The content may be private or restricted.`);
    }

    // Clean filename
    const safeTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50);
    const filename = `${safeTitle || 'media'}.${extension}`;

    // Determine content type
    let contentType = "video/mp4";
    if (extension === "mp3") contentType = "audio/mpeg";
    else if (extension === "ogg") contentType = "audio/ogg";
    else if (extension === "webm") contentType = "video/webm";

    // Return the URL directly - let client/Cloudinary handle the download
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl,
        filename,
        contentType,
        title,
        duration: downloadData.duration || "0:00",
        platform: platformName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error extracting media:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
