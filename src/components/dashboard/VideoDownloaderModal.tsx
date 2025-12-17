import React, { useState } from 'react';
import { X, Download, Loader2, Play, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Social Media Brand Icons
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <defs>
      <radialGradient id="ig-gradient-dl" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <path fill="url(#ig-gradient-dl)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

const VimeoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1AB7EA">
    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 003.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
  </svg>
);

interface VideoDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const VideoDownloaderModal: React.FC<VideoDownloaderModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socialPlatforms = [
    { icon: YouTubeIcon, name: 'YouTube' },
    { icon: TikTokIcon, name: 'TikTok' },
    { icon: InstagramIcon, name: 'Instagram' },
    { icon: FacebookIcon, name: 'Facebook' },
    { icon: XTwitterIcon, name: 'X' },
    { icon: VimeoIcon, name: 'Vimeo' },
  ];

  const handleFetchVideo = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('download-video', {
        body: { url: url.trim() },
      });

      if (fnError) throw fnError;

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch video info');
      }

      setVideoInfo(data.videoInfo);
      
      toast({
        title: "Video Found!",
        description: `Found "${data.videoInfo.title}"`,
      });
    } catch (err: any) {
      console.error('Error fetching video:', err);
      setError(err.message || 'Failed to fetch video information');
      toast({
        title: "Error",
        description: err.message || "Failed to fetch video. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (mediaUrl: string, index: number, filename: string) => {
    setDownloadingIndex(index);
    
    try {
      // Open in new tab for download
      window.open(mediaUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: "Your download should begin shortly",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not start download",
        variant: "destructive",
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 mb-4 shadow-lg shadow-violet-500/30">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Video Downloader</h2>
            <p className="text-white/60 text-sm">Download videos from 50+ platforms instantly</p>
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchVideo()}
                placeholder="Paste video URL here..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                disabled={isLoading}
              />
              {url && !isLoading && (
                <button
                  onClick={() => setUrl('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              )}
            </div>
          </div>

          {/* Fetch Button */}
          <button
            onClick={handleFetchVideo}
            disabled={isLoading || !url.trim()}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching Video Info...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Get Video
              </>
            )}
          </button>

          {/* Supported Platforms */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {socialPlatforms.map(({ icon: Icon, name }) => (
              <div
                key={name}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title={name}
              >
                <Icon />
              </div>
            ))}
            <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 font-medium">
              +44 more
            </span>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">Failed to fetch video</p>
                <p className="text-red-400/70 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Video Info & Download Options */}
          {videoInfo && (
            <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex gap-4 mb-5">
                {videoInfo.thumbnail && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black/50">
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {videoInfo.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="px-2 py-0.5 bg-white/10 rounded-full capitalize">
                      {videoInfo.source}
                    </span>
                    {videoInfo.duration && (
                      <span>{videoInfo.duration}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-2">
                <p className="text-xs text-white/50 font-medium mb-3">Available Downloads:</p>
                {videoInfo.medias.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownload(media.url, index, videoInfo.title)}
                    disabled={downloadingIndex === index}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        {downloadingIndex === index ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Download className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">
                          {media.quality || 'Standard'} Quality
                        </p>
                        <p className="text-white/50 text-xs">
                          {media.extension?.toUpperCase() || 'MP4'} • {formatSize(media.size)}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDownloaderModal;
