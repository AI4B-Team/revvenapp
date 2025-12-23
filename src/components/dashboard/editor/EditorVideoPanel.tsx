import React, { useState, useRef, useEffect } from 'react';
import { Search, Play, Clock, User, Loader2, Video, Upload, Link2, Heart, Plus, CircleDot } from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebookF, FaVimeoV, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiZoom } from 'react-icons/si';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const PEXELS_API_KEY = 'gXq4NKwHspnNWq4RUUraWlQOrtdgNXHZ0K8mNvT41w6PYQAHTm6RcHIT';

interface PexelsVideo {
  id: number;
  image: string;
  duration: number;
  user: {
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

interface UploadedMedia {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type: 'video' | 'audio';
  source: 'upload' | 'url';
  inUse?: boolean;
}

interface EditorVideoPanelProps {
  onSelectVideo?: (videoUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: () => void;
  onOpenTranslate?: () => void;
  uploadedMedia?: UploadedMedia[];
  onFileUpload?: (files: FileList) => void;
  onUrlSubmit?: (url: string) => void;
  onAddToTimeline?: (videoUrl: string, name: string, thumbnail?: string, duration?: number) => void;
  onOpenRecord?: () => void;
}

const categories = [
  { label: 'Trending', query: 'trending' },
  { label: 'Business', query: 'business office' },
  { label: 'Nature', query: 'nature landscape' },
  { label: 'Tech', query: 'technology' },
  { label: 'People', query: 'people lifestyle' },
  { label: 'Abstract', query: 'abstract motion' },
];

const socialPlatforms = [
  { icon: FaYoutube, color: '#FF0000', name: 'YouTube' },
  { icon: FaTiktok, color: '#000000', name: 'TikTok' },
  { icon: FaInstagram, color: '#E4405F', name: 'Instagram' },
  { icon: FaFacebookF, color: '#1877F2', name: 'Facebook' },
  { icon: FaXTwitter, color: '#000000', name: 'X' },
  { icon: FaVimeoV, color: '#1AB7EA', name: 'Vimeo' },
  { icon: FaGoogleDrive, color: '#4285F4', name: 'Google Drive' },
];

const EditorVideoPanel: React.FC<EditorVideoPanelProps> = ({ 
  onSelectVideo, 
  onOpenReferences, 
  onOpenTranslate, 
  uploadedMedia = [],
  onFileUpload,
  onUrlSubmit,
  onAddToTimeline,
  onOpenRecord
}) => {
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async (query: string, pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15&page=${pageNum}`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      setVideos(prev => append ? [...prev, ...data.videos] : data.videos);
      setHasMore(data.videos.length === 15);
    } catch (error) {
      console.error('Error fetching Pexels videos:', error);
      toast.error('Failed to load stock videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(activeCategory, 1, false);
  }, [activeCategory]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveCategory('');
      setPage(1);
      fetchVideos(searchQuery, 1, false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(searchQuery || activeCategory, nextPage, true);
  };

  const handleCategoryClick = (query: string) => {
    setActiveCategory(query);
    setSearchQuery('');
    setPage(1);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBestVideoFile = (video: PexelsVideo) => {
    const hdFile = video.video_files.find(f => f.quality === 'hd' && f.file_type === 'video/mp4');
    if (hdFile) return hdFile.link;
    const mp4File = video.video_files.find(f => f.file_type === 'video/mp4');
    return mp4File?.link || video.video_files[0]?.link;
  };

  const handleVideoSelect = (video: PexelsVideo) => {
    const videoUrl = getBestVideoFile(video);
    if (onSelectVideo && videoUrl) {
      onSelectVideo(videoUrl, video.image);
      toast.success('Video added to timeline');
    }
  };

  const handleDragStart = (e: React.DragEvent, video: PexelsVideo) => {
    const videoUrl = getBestVideoFile(video);
    if (!videoUrl) return;
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'video',
      url: videoUrl,
      thumbnail: video.image,
      duration: video.duration,
      name: video.user.name
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (onFileUpload) {
      onFileUpload(files);
    } else {
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a video file`);
          return;
        }
        toast.success(`Uploaded ${file.name}`);
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (onFileUpload && files.length > 0) {
      onFileUpload(files);
    } else {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('video/')) {
          toast.success(`Uploaded ${file.name}`);
        }
      });
    }
  };

  const handleUrlSubmit = () => {
    if (videoUrl.trim()) {
      if (onUrlSubmit) {
        onUrlSubmit(videoUrl.trim());
      } else {
        toast.success('Video URL added');
        if (onSelectVideo) {
          onSelectVideo(videoUrl.trim(), '');
        }
      }
      setVideoUrl('');
    }
  };

  const handleUploadedVideoSelect = (video: UploadedMedia) => {
    if (onSelectVideo) {
      onSelectVideo(video.url, video.thumbnail || '');
      toast.success('Video added to timeline');
    }
  };

  const handleUploadedVideoDragStart = (e: React.DragEvent, video: UploadedMedia) => {
    // Try to get duration from the video element if available
    const videoEl = e.currentTarget.querySelector('video') as HTMLVideoElement | null;
    const actualDuration = videoEl?.duration && !isNaN(videoEl.duration) ? videoEl.duration : 10;
    
    const dragData = JSON.stringify({
      type: 'video',
      url: video.url,
      thumbnail: video.thumbnail || '',
      name: video.name,
      duration: actualDuration
    });
    e.dataTransfer.setData('application/json', dragData);
    e.dataTransfer.setData('text/plain', dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddUploadedVideoToTimeline = async (video: UploadedMedia) => {
    if (onAddToTimeline) {
      // Get actual video duration by loading video metadata
      const videoEl = document.createElement('video');
      videoEl.src = video.url;
      videoEl.preload = 'metadata';
      
      videoEl.onloadedmetadata = () => {
        const actualDuration = videoEl.duration || 10;
        onAddToTimeline(video.url, video.name, video.thumbnail, actualDuration);
        toast.success(`Added "${video.name}" (${Math.round(actualDuration)}s) to timeline`);
      };
      
      videoEl.onerror = () => {
        // Fallback if duration can't be determined
        onAddToTimeline(video.url, video.name, video.thumbnail, 10);
        toast.success(`Added "${video.name}" to timeline`);
      };
    } else {
      toast.error('Timeline not available');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Click To Upload Section */}
      <div className="space-y-4">
        {/* Upload Area with Link Input Inside */}
        <div 
          className={`bg-white rounded-xl p-6 text-center transition-all cursor-pointer border-2 border-dashed ${
            isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500'
          }`}
          onClick={(e) => {
            // Only trigger file input if clicking outside the link input area
            if (!(e.target as HTMLElement).closest('.link-input-area')) {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="w-8 h-8 text-emerald-500 mb-1" />
            <span className="text-gray-900 font-semibold text-lg">Click To Upload</span>
            <p className="text-gray-500 text-sm">or, drag and drop a file here</p>
          </div>
          
          {/* Paste Link Section - Inside Upload Box */}
          <div className="link-input-area mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="Paste A Supported Public Media Link"
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 text-center placeholder:text-center"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!videoUrl.trim()}
                className="absolute right-2 p-1.5 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>

            {/* Social Platform Icons */}
            <div className="flex items-center justify-center gap-2.5 opacity-60">
              {socialPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  title={platform.name}
                >
                  <platform.icon className="w-3.5 h-3.5" style={{ color: platform.color }} />
                </div>
              ))}
              <span className="text-gray-500 text-xs font-medium cursor-pointer hover:text-gray-700 transition-colors">+43</span>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Import & Record Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-gray-300 hover:bg-gray-50"
            onClick={() => toast.info('Zoom import coming soon')}
          >
            <SiZoom className="w-4 h-4 text-[#2D8CFF]" />
            <span className="text-sm font-medium">Import From Zoom</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-gray-300 hover:bg-gray-50"
            onClick={onOpenRecord}
          >
            <CircleDot className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Record</span>
          </Button>
        </div>
      </div>

      {/* Uploaded Videos Section */}
      {uploadedMedia && uploadedMedia.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Uploaded Videos</h3>
          <p className="text-xs text-gray-500 mb-2">Drag to timeline or click + to add</p>
          <div className="grid grid-cols-2 gap-3">
            {uploadedMedia.filter(m => m.type === 'video').map((video) => (
              <div
                key={video.id}
                className="relative aspect-video rounded-lg overflow-hidden cursor-grab group bg-gray-100 border-2 border-transparent hover:border-primary transition-colors"
                draggable
                onDragStart={(e) => handleUploadedVideoDragStart(e, video)}
                onClick={() => handleUploadedVideoSelect(video)}
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.pause();
                    target.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2">
                  <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
                  <p className="text-xs text-white truncate flex-1">{video.name}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 bg-white/20 hover:bg-white/40 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddUploadedVideoToTimeline(video);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorVideoPanel;
