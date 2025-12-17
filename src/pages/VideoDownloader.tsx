import { useState } from "react";
import { ArrowLeft, Download, Link, Loader2, Play, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaTwitter, FaVimeo } from "react-icons/fa";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string | null;
  source: string;
  medias: Array<{
    url: string;
    quality: string;
    extension: string;
    size?: number;
  }>;
}

const VideoDownloader = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleFetchVideo = async () => {
    if (!url.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke("download-video", {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (data?.success && data?.videoInfo) {
        setVideoInfo(data.videoInfo);
        toast.success("Video found! Select quality to download.");
      } else {
        throw new Error(data?.error || "Failed to fetch video info");
      }
    } catch (err: any) {
      console.error("Video fetch error:", err);
      setError(err.message || "Failed to fetch video");
      toast.error(err.message || "Failed to fetch video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (mediaUrl: string, quality: string) => {
    window.open(mediaUrl, "_blank");
    toast.success(`Downloading ${quality} version...`);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const platforms = [
    { icon: FaYoutube, color: "text-red-500", name: "YouTube" },
    { icon: FaTiktok, color: "text-foreground", name: "TikTok" },
    { icon: FaInstagram, color: "text-pink-500", name: "Instagram" },
    { icon: FaFacebook, color: "text-blue-600", name: "Facebook" },
    { icon: FaTwitter, color: "text-sky-500", name: "X/Twitter" },
    { icon: FaVimeo, color: "text-cyan-500", name: "Vimeo" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Page Header */}
          <div className="px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/apps")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Video Downloader</h1>
                  <p className="text-sm text-muted-foreground">Download videos from 50+ platforms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* URL Input Section */}
            <div className="bg-card rounded-2xl p-8 border border-border mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-foreground font-medium">Paste your video URL</span>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-12 h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl text-lg focus:border-primary focus:ring-primary/20"
                    onKeyDown={(e) => e.key === "Enter" && handleFetchVideo()}
                  />
                </div>
                <Button
                  onClick={handleFetchVideo}
                  disabled={isLoading || !url.trim()}
                  className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Fetch Video
                    </>
                  )}
                </Button>
              </div>

              {/* Supported Platforms */}
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <span className="text-muted-foreground text-sm">Supported:</span>
                {platforms.map((platform, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <platform.icon className={`h-4 w-4 ${platform.color}`} />
                    <span className="text-xs">{platform.name}</span>
                  </div>
                ))}
                <span className="text-muted-foreground text-xs">+50 more</span>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 mb-8 flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-destructive font-medium">Failed to fetch video</p>
                  <p className="text-destructive/70 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Video Info & Download Options */}
            {videoInfo && (
              <div className="bg-card rounded-2xl p-8 border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start gap-6 mb-8">
                  {/* Thumbnail */}
                  {videoInfo.thumbnail && (
                    <div className="relative flex-shrink-0 w-64 aspect-video rounded-xl overflow-hidden bg-muted">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-6 w-6 text-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Details */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{videoInfo.title}</h2>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <span className="px-2 py-1 bg-muted rounded-lg capitalize">{videoInfo.source}</span>
                      {videoInfo.duration && (
                        <span className="px-2 py-1 bg-muted rounded-lg">{videoInfo.duration}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-primary text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Video ready to download</span>
                    </div>
                  </div>
                </div>

                {/* Download Options */}
                <div className="space-y-3">
                  <h3 className="text-foreground/80 font-medium mb-4">Select Quality</h3>
                  {videoInfo.medias.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(media.url, media.quality)}
                      className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 border border-border hover:border-primary/50 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Download className="h-5 w-5 text-primary group-hover:text-primary/80" />
                        </div>
                        <div className="text-left">
                          <p className="text-foreground font-medium">{media.quality}</p>
                          <p className="text-muted-foreground text-sm">.{media.extension}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {media.size && (
                          <span className="text-muted-foreground text-sm">{formatFileSize(media.size)}</span>
                        )}
                        <div className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors">
                          Download
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!videoInfo && !error && !isLoading && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Download className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready to download</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Paste a video URL above to fetch download options. We support YouTube, TikTok, Instagram, Facebook, Twitter, and 50+ more platforms.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoDownloader;
