import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractYouTubeVideoId(input: string): string | null {
  try {
    const parsed = new URL(input);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/').filter(Boolean)[1] || null;
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    const match = input.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  }
  return null;
}

function formatCaptionTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function cleanCaptionText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

function extractJsonObjectAfter(source: string, marker: string): any | null {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf('{', markerIndex + marker.length);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(source.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

async function fetchYouTubeCaptionTranscript(cleanUrl: string): Promise<{ title: string; transcriptText: string; duration: number } | null> {
  const videoId = extractYouTubeVideoId(cleanUrl);
  if (!videoId) return null;

  console.log(`[BG-TRANSCRIBE] Checking YouTube captions for ${videoId}...`);

  const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US&has_verified=1&bpctr=9999999999`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': 'CONSENT=YES+cb; SOCS=CAI; PREF=hl=en&gl=US',
    },
  });

  if (!pageResponse.ok) {
    console.log(`[BG-TRANSCRIBE] YouTube page fetch failed: ${pageResponse.status}`);
    return null;
  }

  const html = await pageResponse.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = cleanCaptionText((titleMatch?.[1] || 'YouTube Transcript').replace(/ - YouTube$/i, ''));

  const playerResponse = extractJsonObjectAfter(html, 'ytInitialPlayerResponse =')
    || extractJsonObjectAfter(html, 'ytInitialPlayerResponse=');
  let tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks as Array<{ baseUrl?: string; languageCode?: string; kind?: string; name?: { simpleText?: string } }> | undefined;

  if (!tracks?.length) {
    const tracksMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (tracksMatch?.[1]) {
      try {
        tracks = JSON.parse(tracksMatch[1].replace(/\\u0026/g, '&'));
      } catch (error) {
        console.log('[BG-TRANSCRIBE] Failed to parse YouTube captionTracks regex:', error);
      }
    }
  }

  if (!tracks?.length) {
    console.log('[BG-TRANSCRIBE] No YouTube caption tracks found; falling back to audio transcription.');
    return null;
  }

  const track = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr')
    || tracks.find(t => t.languageCode === 'en')
    || tracks[0];

  if (!track?.baseUrl) return null;

  const captionsUrl = new URL(track.baseUrl.replace(/\\u0026/g, '&'));
  captionsUrl.searchParams.set('fmt', 'json3');

  const captionsResponse = await fetch(captionsUrl.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!captionsResponse.ok) {
    console.log(`[BG-TRANSCRIBE] YouTube captions fetch failed: ${captionsResponse.status}`);
    return null;
  }

  const captionsData = await captionsResponse.json();
  const lines: string[] = [];
  let maxSeconds = 0;

  for (const event of captionsData?.events || []) {
    const text = cleanCaptionText((event.segs || []).map((seg: { utf8?: string }) => seg.utf8 || '').join(''));
    if (!text) continue;
    const startSeconds = Number(event.tStartMs || 0) / 1000;
    const durationSeconds = Number(event.dDurationMs || 0) / 1000;
    maxSeconds = Math.max(maxSeconds, startSeconds + durationSeconds);
    lines.push(`[${formatCaptionTime(startSeconds)}] ${text}`);
  }

  const transcriptText = lines.join('\n');
  if (!transcriptText.trim()) return null;

  console.log(`[BG-TRANSCRIBE] YouTube captions transcript found: ${lines.length} caption lines.`);
  return { title, transcriptText, duration: maxSeconds };
}

function buildCloudinaryAudioSegmentUrl(audioUrl: string, startSeconds: number, endSeconds: number): string {
  const transform = `so_${Math.max(0, Math.floor(startSeconds))},eo_${Math.max(1, Math.ceil(endSeconds))},f_mp3,q_auto`;
  return audioUrl.replace('/upload/', `/upload/${transform}/`).replace(/\.(mp4|mov|webm|m4a|wav)$/i, '.mp3');
}

async function transcribeAudioBlob(audioBlob: Blob, filename: string): Promise<string> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const transcribeFormData = new FormData();
  transcribeFormData.append("file", audioBlob, filename);
  transcribeFormData.append("model_id", "scribe_v1");
  transcribeFormData.append("tag_audio_events", "false");
  transcribeFormData.append("diarize", "false");

  const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: transcribeFormData,
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    console.error("[BG-TRANSCRIBE] ElevenLabs error:", transcribeResponse.status, errorText);
    throw new Error(`Transcription failed: ${transcribeResponse.status}`);
  }

  const transcribeResult = await transcribeResponse.json();
  return transcribeResult.text || "";
}

async function processTranscriptionSegment(
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  supabaseServiceKey: string,
  params: { recordId: string; audioUrl: string; title: string; duration: number; cleanUrl: string; segmentStart?: number }
) {
  const chunkSeconds = 300;
  const segmentStart = Math.max(0, Math.floor(params.segmentStart || 0));
  const segmentEnd = Math.min(Math.ceil(params.duration || segmentStart + chunkSeconds), segmentStart + chunkSeconds);
  const segmentUrl = buildCloudinaryAudioSegmentUrl(params.audioUrl, segmentStart, segmentEnd);

  console.log(`[BG-TRANSCRIBE] Transcribing segment ${formatCaptionTime(segmentStart)}-${formatCaptionTime(segmentEnd)} from ${segmentUrl.substring(0, 100)}...`);

  const segmentResponse = await fetch(segmentUrl);
  if (!segmentResponse.ok) {
    throw new Error(`Failed to fetch audio segment: ${segmentResponse.status}`);
  }

  const segmentBuffer = await segmentResponse.arrayBuffer();
  const segmentBlob = new Blob([segmentBuffer], { type: 'audio/mpeg' });
  const segmentText = await transcribeAudioBlob(segmentBlob, `segment-${segmentStart}-${segmentEnd}.mp3`);
  const segmentTranscript = segmentText.trim() ? `[${formatCaptionTime(segmentStart)}] ${segmentText.trim()}` : '';

  const { data: currentRecord } = await supabase
    .from('user_voices')
    .select('prompt')
    .eq('id', params.recordId)
    .single();

  const existingText = typeof currentRecord?.prompt === 'string' ? currentRecord.prompt : '';
  const combinedText = [existingText, segmentTranscript].filter(Boolean).join('\n\n');
  const isComplete = segmentEnd >= (params.duration || segmentEnd);

  await supabase.from('user_voices').update({
    status: isComplete ? 'completed' : 'processing',
    type: 'transcription',
    prompt: combinedText,
    url: params.audioUrl,
    duration: params.duration,
    name: params.title,
    original_url: params.cleanUrl,
  }).eq('id', params.recordId);

  if (!isComplete) {
    console.log(`[BG-TRANSCRIBE] Segment complete; queueing next segment at ${formatCaptionTime(segmentEnd)}.`);
    await fetch(`${supabaseUrl}/functions/v1/process-url-transcription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        mode: 'transcribe-segment',
        recordId: params.recordId,
        audioUrl: params.audioUrl,
        title: params.title,
        duration: params.duration,
        cleanUrl: params.cleanUrl,
        segmentStart: segmentEnd,
      }),
    });
  } else {
    console.log(`[BG-TRANSCRIBE] ✅ Successfully completed chunked transcription for record ${params.recordId}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const requestBody = await req.json();
    const { url, recordId, userId, mode } = requestBody;

    if (mode === 'transcribe-segment') {
      const { audioUrl, title, duration, cleanUrl, segmentStart } = requestBody;
      if (!recordId || !audioUrl || !title || !duration || !cleanUrl) {
        throw new Error("Missing required segment transcription parameters");
      }

      EdgeRuntime.waitUntil(processTranscriptionSegment(supabase, supabaseUrl, supabaseServiceKey, {
        recordId,
        audioUrl,
        title,
        duration,
        cleanUrl,
        segmentStart,
      }));

      return new Response(
        JSON.stringify({ success: true, message: "Segment transcription started", recordId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!url || !recordId || !userId) {
      throw new Error("Missing required parameters: url, recordId, userId");
    }

    console.log(`[BG-TRANSCRIBE] Starting background processing for record ${recordId}`);
    console.log(`[BG-TRANSCRIBE] URL: ${url.substring(0, 100)}`);

    // Use EdgeRuntime.waitUntil for background processing
    const backgroundTask = async () => {
      try {
        // Step 1: Extract audio from URL using snap-video3
        console.log(`[BG-TRANSCRIBE] Step 1: Extracting audio from URL...`);
        
        const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
        if (!RAPIDAPI_KEY) {
          throw new Error("RAPIDAPI_KEY not configured");
        }

        // Basic URL cleanup + strong YouTube normalization (keep only videoId)
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = `https://${cleanUrl}`;
        }

        // Normalize YouTube Shorts + youtu.be to canonical watch URL
        if (cleanUrl.includes('youtube.com/shorts/')) {
          const videoId = cleanUrl.match(/shorts\/([a-zA-Z0-9_-]+)/)?.[1];
          if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (cleanUrl.includes('youtu.be/')) {
          const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
          if (match?.[1]) cleanUrl = `https://www.youtube.com/watch?v=${match[1]}`;
        }

        // Strip extra query params for youtube.com (list, t, si, etc.) and keep only v
        try {
          const urlObj = new URL(cleanUrl);
          if (urlObj.hostname.includes('youtube.com')) {
            const v = urlObj.searchParams.get('v');
            if (v) cleanUrl = `https://www.youtube.com/watch?v=${v}`;
          }
        } catch {
          // If URL parsing fails, keep original cleanUrl and let the downstream API validate.
        }

        // Add www if missing for youtube.com
        if (cleanUrl.includes('youtube.com') && !cleanUrl.includes('www.youtube.com')) {
          cleanUrl = cleanUrl.replace('youtube.com', 'www.youtube.com');
        }
        
        console.log("[BG-TRANSCRIBE] Cleaned URL:", cleanUrl);

        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
          const captionResult = await fetchYouTubeCaptionTranscript(cleanUrl);
          if (captionResult) {
            const { error: captionUpdateError } = await supabase.from('user_voices').update({
              status: 'completed',
              type: 'transcription',
              prompt: captionResult.transcriptText,
              duration: captionResult.duration,
              name: captionResult.title,
              original_url: cleanUrl,
              source: 'youtube-captions',
            }).eq('id', recordId);

            if (captionUpdateError) {
              console.error('[BG-TRANSCRIBE] Database update error for captions:', captionUpdateError);
              throw captionUpdateError;
            }

            console.log(`[BG-TRANSCRIBE] ✅ Completed from YouTube captions for record ${recordId}`);
            return;
          }
        }
        
        // Check if this is an Instagram URL - use dedicated Instagram API
        const isInstagramUrl = cleanUrl.includes('instagram.com');
        
        let downloadUrl: string | null = null;
        let title = "media_audio";
        
        if (isInstagramUrl) {
          // Use Instagram Downloader RapidAPI for Instagram URLs
          console.log("[BG-TRANSCRIBE] Detected Instagram URL, using Instagram Downloader API...");
          
          const apiUrl = `https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodeURIComponent(cleanUrl)}`;
          
          const downloadResponse = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "x-rapidapi-host": "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com",
              "x-rapidapi-key": RAPIDAPI_KEY,
            },
          });

          const responseText = await downloadResponse.text();
          console.log("[BG-TRANSCRIBE] Instagram Downloader API response:", responseText.substring(0, 500));
          
          if (!downloadResponse.ok) {
            console.error("[BG-TRANSCRIBE] Instagram Downloader API error:", downloadResponse.status, responseText);
            throw new Error(`Failed to extract from Instagram: ${downloadResponse.status}`);
          }

          let downloadData;
          try {
            downloadData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("[BG-TRANSCRIBE] Failed to parse Instagram API response:", responseText.substring(0, 200));
            throw new Error(`API returned invalid JSON response`);
          }
          
          console.log("[BG-TRANSCRIBE] Instagram Downloader API parsed:", JSON.stringify(downloadData).substring(0, 1000));

          title = downloadData.title || downloadData.caption || "instagram_media";

          // Extract video URL from response - API returns media array
          if (downloadData.media && Array.isArray(downloadData.media)) {
            const videoResult = downloadData.media.find((m: any) => m.type === 'video' && m.url);
            if (videoResult?.url) {
              downloadUrl = videoResult.url;
            } else if (downloadData.media[0]?.url) {
              downloadUrl = downloadData.media[0].url;
            }
          }

          // Fallback: try result array
          if (!downloadUrl && downloadData.result && Array.isArray(downloadData.result)) {
            const videoResult = downloadData.result.find((r: any) => r.url);
            if (videoResult?.url) {
              downloadUrl = videoResult.url;
            }
          }
          
          // Try direct url field
          if (!downloadUrl && downloadData.url) {
            downloadUrl = downloadData.url;
          }

          // Try video field
          if (!downloadUrl && downloadData.video) {
            downloadUrl = downloadData.video;
          }
          
          if (downloadUrl) {
            console.log(`[BG-TRANSCRIBE] Instagram video URL: ${downloadUrl.substring(0, 80)}...`);
          }
          
        } else {
          // Use snap-video3 for all non-Instagram URLs (including YouTube).
          console.log("[BG-TRANSCRIBE] Using Snap Video API for non-Instagram URL...");

          const downloadResponse = await fetch("https://snap-video3.p.rapidapi.com/download", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "x-rapidapi-host": "snap-video3.p.rapidapi.com",
              "x-rapidapi-key": RAPIDAPI_KEY,
            },
            body: `url=${encodeURIComponent(cleanUrl)}`,
          });

          const responseText = await downloadResponse.text();
          console.log("[BG-TRANSCRIBE] Snap Video API raw response:", responseText.substring(0, 500));

          if (!downloadResponse.ok) {
            console.error("[BG-TRANSCRIBE] Snap Video API error:", downloadResponse.status, responseText);
            throw new Error(`Failed to extract from URL: ${downloadResponse.status} - ${responseText.substring(0, 120)}`);
          }

          let downloadData: any;
          try {
            downloadData = JSON.parse(responseText);
          } catch {
            console.error("[BG-TRANSCRIBE] Failed to parse API response as JSON:", responseText.substring(0, 200));
            throw new Error("Video service returned invalid JSON");
          }

          // snap-video3 sometimes returns { error: "..." } with 200 status
          if (downloadData?.error) {
            console.error("[BG-TRANSCRIBE] Snap Video API returned error:", downloadData.error);
            throw new Error(`Video service error: ${downloadData.error}`);
          }

          console.log("[BG-TRANSCRIBE] Snap Video API parsed response:", JSON.stringify(downloadData).substring(0, 1000));

          title = downloadData.title || downloadData.meta?.title || "media_audio";

          // Extract a downloadable URL
          // Prefer a video stream (mp4) over audio-only, because later steps upload as video and extract audio.
          if (downloadData.medias && Array.isArray(downloadData.medias) && downloadData.medias.length > 0) {
            const preferredVideo = downloadData.medias.find((m: any) =>
              m?.url &&
              (
                m.extension === 'mp4' ||
                m.ext === 'mp4' ||
                m.type === 'video' ||
                (typeof m.mimeType === 'string' && m.mimeType.includes('video')) ||
                (typeof m.quality === 'string' && m.quality.includes('p'))
              )
            );
            const media = preferredVideo || downloadData.medias.find((m: any) => m?.url) || downloadData.medias[0];
            if (media?.url) {
              downloadUrl = media.url;
              console.log(
                `[BG-TRANSCRIBE] Selected media extension=${media.extension || media.ext || 'unknown'} quality=${media.quality || media.resolution || 'unknown'}`
              );
            }
          }

          if (!downloadUrl && typeof downloadData.url === 'string') {
            downloadUrl = downloadData.url;
          }

          if (!downloadUrl && downloadData.download_url) {
            downloadUrl = downloadData.download_url;
          }

          if (!downloadUrl && (downloadData.video_url || downloadData.audio_url)) {
            downloadUrl = downloadData.video_url || downloadData.audio_url;
          }

          if (!downloadUrl && downloadData.result) {
            downloadUrl = downloadData.result.url || downloadData.result.download_url || downloadData.result.video_url;
          }

          if (!downloadUrl && downloadData.data) {
            downloadUrl = downloadData.data.url || downloadData.data.download_url;
            if (!downloadUrl && downloadData.data.medias && downloadData.data.medias.length > 0) {
              downloadUrl = downloadData.data.medias[0].url;
            }
          }
        }

        if (!downloadUrl) {
          console.error("[BG-TRANSCRIBE] Could not find download URL from API response");
          throw new Error("No download URL found in API response");
        }

        console.log(`[BG-TRANSCRIBE] Download URL obtained: ${downloadUrl.substring(0, 100)}...`);

        // Step 2: Download video from URL
        console.log(`[BG-TRANSCRIBE] Step 2: Downloading video from: ${downloadUrl.substring(0, 80)}...`);
        
        const isProxyUrl = downloadUrl.includes('snapapi.space');
        let videoResponse: Response | null = null;
        
        if (isProxyUrl) {
          // For snapapi.space proxy, try multiple times with delays
          console.log(`[BG-TRANSCRIBE] Using snapapi.space proxy...`);
          
          // Helper for delay
          const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
          
          // Try up to 3 times with different configurations
          const attempts = [
            { headers: {} as Record<string, string>, desc: 'no headers' },
            { headers: { 'Accept': '*/*' } as Record<string, string>, desc: 'Accept */*' },
            { headers: { 'Accept': 'video/mp4,video/*,*/*', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } as Record<string, string>, desc: 'video Accept + UA' },
          ];
          
          for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            console.log(`[BG-TRANSCRIBE] Proxy attempt ${i + 1}: ${attempt.desc}`);
            
            try {
              videoResponse = await fetch(downloadUrl, {
                method: 'GET',
                headers: attempt.headers,
              });
              
              console.log(`[BG-TRANSCRIBE] Attempt ${i + 1} status: ${videoResponse.status}`);
              
              if (videoResponse.ok) {
                console.log(`[BG-TRANSCRIBE] Success on attempt ${i + 1}`);
                break;
              }
              
              // Wait before next attempt
              if (i < attempts.length - 1) {
                console.log(`[BG-TRANSCRIBE] Waiting 1s before retry...`);
                await delay(1000);
              }
            } catch (e) {
              console.log(`[BG-TRANSCRIBE] Attempt ${i + 1} error: ${e}`);
            }
          }
          
          // If all proxy attempts failed, try direct CDN as last resort
          if (!videoResponse?.ok && downloadUrl.includes('download.php?url=')) {
            console.log(`[BG-TRANSCRIBE] All proxy attempts failed, trying direct Instagram CDN...`);
            try {
              const urlObj = new URL(downloadUrl);
              const encodedUrl = urlObj.searchParams.get('url');
              if (encodedUrl) {
                const directUrl = decodeURIComponent(encodedUrl);
                console.log(`[BG-TRANSCRIBE] Trying direct CDN: ${directUrl.substring(0, 80)}...`);
                
                videoResponse = await fetch(directUrl, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'video/mp4,video/*,*/*',
                    'Referer': 'https://www.instagram.com/',
                    'Origin': 'https://www.instagram.com',
                  },
                });
                console.log(`[BG-TRANSCRIBE] Direct CDN response status: ${videoResponse.status}`);
              }
            } catch (e) {
              console.log(`[BG-TRANSCRIBE] Failed to extract/fetch direct URL: ${e}`);
            }
          }
        } else {
          // For non-proxy URLs, use standard headers
          const isInstagram = downloadUrl.includes('instagram') || cleanUrl.includes('instagram');
          const isYouTube = downloadUrl.includes('youtube') || downloadUrl.includes('ytdl') || cleanUrl.includes('youtube');
          const referer = isInstagram ? 'https://www.instagram.com/' : 
                          isYouTube ? 'https://www.youtube.com/' : 
                          'https://www.google.com/';
          
          videoResponse = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'video/mp4,video/*,*/*',
              'Referer': referer,
              'Origin': referer.replace(/\/$/, ''),
            },
          });
        }
        
        console.log(`[BG-TRANSCRIBE] Final video response status: ${videoResponse?.status}`);
        console.log(`[BG-TRANSCRIBE] Video download response headers: ${JSON.stringify(Object.fromEntries(videoResponse?.headers.entries() || []))}`);
        
        if (!videoResponse?.ok) {
          const errorBody = await videoResponse?.text().catch(() => 'Could not read error body');
          console.error("[BG-TRANSCRIBE] Video download failed:", videoResponse?.status, errorBody?.substring(0, 200));
          throw new Error(`Failed to download video: ${videoResponse?.status}`);
        }
        
        const videoArrayBuffer = await videoResponse.arrayBuffer();
        console.log(`[BG-TRANSCRIBE] Video downloaded: ${videoArrayBuffer.byteLength} bytes`);
        
        // Step 3: Upload binary to Cloudinary using signed upload
        console.log(`[BG-TRANSCRIBE] Step 3: Uploading to Cloudinary...`);
        
        const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "dfhyah2xw";
        const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
        const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");

        if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
          throw new Error("Cloudinary API credentials not configured");
        }

        // Generate signature for signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "ugc-audio";
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(paramsToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Upload as blob directly (no base64 to save memory)
        const videoBlob = new Blob([videoArrayBuffer], { type: 'video/mp4' });
        
        const formData = new FormData();
        formData.append("file", videoBlob, "video.mp4");
        formData.append("api_key", CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error("[BG-TRANSCRIBE] Cloudinary upload error:", errorText);
          throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const audioUrl = cloudinaryData.secure_url;
        const duration = cloudinaryData.duration || 0;

        console.log(`[BG-TRANSCRIBE] Cloudinary upload complete: ${audioUrl}`);
        console.log(`[BG-TRANSCRIBE] Duration: ${duration}s`);

        // Update record with URL, duration, and original source URL for video embedding
        await supabase.from('user_voices').update({
          url: audioUrl,
          duration: duration,
          name: title,
          original_url: cleanUrl, // Store original URL for YouTube/Vimeo embedding
        }).eq('id', recordId);

        // Step 4: Transcribe in chunks so long videos don't exceed backend/provider limits.
        console.log(`[BG-TRANSCRIBE] Step 4: Starting chunked transcription...`);
        await processTranscriptionSegment(supabase, supabaseUrl, supabaseServiceKey, {
          recordId,
          audioUrl,
          title,
          duration,
          cleanUrl,
          segmentStart: 0,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[BG-TRANSCRIBE] ❌ Error processing record ${recordId}:`, errorMessage);
        
        // Update record with error status and store error message in prompt field for debugging
        await supabase.from('user_voices').update({
          status: 'error',
          prompt: `Error: ${errorMessage}`,
        }).eq('id', recordId);
      }
    };

    // Start background task
    EdgeRuntime.waitUntil(backgroundTask());

    // Return immediately
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Processing started in background",
        recordId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[BG-TRANSCRIBE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
