import React, { useState, useRef, useEffect } from 'react';
import { Search, Play, Clock, User, Loader2, Video, Upload, Link2 } from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';

const PEXELS_API_KEY = 'gXq4NKwHspnNWq4RUUraWlQOrtdgNXHZ0K8mNvT41w6PYQAHTm6RcHIT';

const PLATFORMS = [
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'X', icon: FaXTwitter, color: '#000000' },
  { name: 'Vimeo', icon: FaVimeo, color: '#1AB7EA' },
  { name: 'Google Drive', icon: FaGoogleDrive, color: '#4285F4' },
];

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
}

interface EditorVideoPanelProps {
  onSelectVideo?: (videoUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: () => void;
  onOpenTranslate?: () => void;
  uploadedMedia?: UploadedMedia[];
}

const categories = [
  { label: 'Trending', query: 'trending' },
  { label: 'Business', query: 'business office' },
  { label: 'Nature', query: 'nature landscape' },
  { label: 'Tech', query: 'technology' },
  { label: 'People', query: 'people lifestyle' },
  { label: 'Abstract', query: 'abstract motion' },
];

const EditorVideoPanel: React.FC<EditorVideoPanelProps> = ({ onSelectVideo, onOpenReferences, onOpenTranslate, uploadedMedia = [] }) => {
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
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
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a video file`);
        return;
      }
      toast.success(`Uploaded ${file.name}`, {
        description: 'Translate audio or add subtitles?',
        action: onOpenTranslate ? {
          label: 'Translate',
          onClick: () => onOpenTranslate(),
        } : undefined,
      });
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('video/')) {
        toast.success(`Uploaded ${file.name}`);
      }
    });
  };

  const handleUrlSubmit = () => {
    if (videoUrl.trim()) {
      toast.success('Video URL added');
      if (onSelectVideo) {
        onSelectVideo(videoUrl.trim(), '');
      }
      setVideoUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-6 mb-3 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onOpenReferences ? onOpenReferences() : fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-gray-500" />
          <p className="font-medium text-gray-900">Choose A Video</p>
          <p className="text-sm text-gray-500">or drag and drop a file here</p>
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

      {/* Paste Video URL */}
      <div className="mb-4">
        {showUrlInput ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="Paste video URL..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
                autoFocus
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowUrlInput(false); setVideoUrl(''); }}
              className="px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            <span>Paste Video URL</span>
          </button>
        )}
      </div>

      {/* Social Media Platform Icons */}
      <div className="flex items-center justify-center gap-3 mb-4 py-2">
        {PLATFORMS.map((platform) => (
          <button
            key={platform.name}
            onClick={() => toast.info(`Import from ${platform.name} coming soon`)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
            title={platform.name}
          >
            <platform.icon 
              className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" 
            />
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search Stock Videos"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.query}
            onClick={() => handleCategoryClick(cat.query)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.query
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Videos grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Uploaded Media Section */}
        {uploadedMedia.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Uploads</h4>
            <div className="space-y-2">
              {uploadedMedia.filter(m => m.type === 'video').map((media) => (
                <div
                  key={media.id}
                  className="group relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      type: 'video',
                      url: media.url,
                      thumbnail: media.thumbnail || '',
                      duration: 5,
                      name: media.name
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    if (onSelectVideo) {
                      onSelectVideo(media.url, media.thumbnail || '');
                      toast.success('Video added to timeline');
                    }
                  }}
                >
                  <div className="aspect-video relative bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    {media.thumbnail ? (
                      <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-8 h-8 text-emerald-500" />
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-medium rounded-full">
                      {media.source === 'upload' ? 'Uploaded' : 'URL'}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-700 font-medium truncate">{media.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Videos Section */}
        {uploadedMedia.length > 0 && (
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stock Videos</h4>
        )}
        
        {isLoading && videos.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 && uploadedMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="group relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
                draggable
                onDragStart={(e) => handleDragStart(e, video)}
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
                onClick={() => handleVideoSelect(video)}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.image}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  
                  <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center pointer-events-none ${
                    hoveredVideo === video.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md text-xs text-white flex items-center gap-1 pointer-events-none">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="p-2">
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <User className="w-3 h-3 flex-shrink-0" />
                    {video.user.name}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && !isLoading && (
              <button
                onClick={loadMore}
                className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Load more videos
              </button>
            )}

            {isLoading && videos.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Pexels attribution */}
      <div className="pt-3 border-t border-gray-100 mt-3">
        <p className="text-xs text-gray-400 text-center">
          Videos by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pexels</a>
        </p>
      </div>
    </div>
  );
};

export default EditorVideoPanel;
