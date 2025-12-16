import { useEffect, useState } from 'react';
import { 
  Play, Bookmark, Heart, Download, Edit, RefreshCw, 
  Share2, X, Copy, Check, Image as ImageIcon, Trash2,
  Video, Film, Mic, Users
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageViewerModal from './ImageViewerModal';
import { creationsData, communityData, type GalleryItem } from '@/data/creationsData';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FilterState {
  contentType: string;
  likes: boolean;
  edits: boolean;
  upscales: boolean;
  startDate: string;
  endDate: string;
  searchQuery: string;
}

interface GalleryProps {
  type: 'creations' | 'community';
  columnsPerRow?: number;
  filters?: FilterState;
  onAnimate?: (imageUrl: string) => void;
}

const CreationsGallery = ({ type, columnsPerRow = 4, filters, onAnimate }: GalleryProps) => {
  const [likedItems, setLikedItems] = useState(new Set());
  const [savedItems, setSavedItems] = useState(new Set());
  const [shareModalOpen, setShareModalOpen] = useState<number | string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [generatedItems, setGeneratedItems] = useState<GalleryItem[]>([]);
  const { toast } = useToast();

  // Fetch generated images and videos from Supabase with real-time subscriptions
  useEffect(() => {
    const fetchGeneratedContent = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (imagesError) {
        console.error('Error fetching generated images:', imagesError);
      }

      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('ai_videos')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('Error fetching generated videos:', videosError);
      }

      const getResolutionFromAspectRatio = (aspectRatio: string | null): string => {
        switch (aspectRatio) {
          case '1:1': return '1024x1024 px';
          case '16:9': return '1344x768 px';
          case '9:16': return '768x1344 px';
          case '4:3': return '1024x768 px';
          case '3:4': return '768x1024 px';
          default: return '1024x1024 px';
        }
      };

      const formatTimestamp = (dateString: string | null): string => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      const mappedImages: GalleryItem[] = imagesData?.map((img: any) => ({
        id: img.id,
        title: img.prompt.substring(0, 50) + (img.prompt.length > 50 ? '...' : ''),
        thumbnail: img.image_url || '/placeholder.svg',
        url: img.image_url || undefined,
        type: 'image',
        creator: {
          name: 'You',
          avatar: '/placeholder.svg'
        },
        likes: 0,
        isEdited: false,
        isUpscaled: false,
        createdAt: img.created_at || new Date().toISOString(),
        status: img.status as 'pending' | 'processing' | 'completed' | 'error',
        prompt: img.prompt,
        model: img.model || 'Nano Banana (Flux Pro)',
        aspectRatio: img.aspect_ratio || '1:1',
        resolution: getResolutionFromAspectRatio(img.aspect_ratio),
        timestamp: formatTimestamp(img.created_at),
        referenceImage: img.reference_image_url || undefined,
        referenceImages: img.reference_image_urls || undefined,
        errorMessage: img.error_message || undefined
      })) || [];

      const mappedVideos: GalleryItem[] = videosData?.map((video) => {
        // Parse scenes from the scenes JSONB column
        let scenes = undefined;
        const videoData = video as Record<string, unknown>;
        if (videoData.scenes && Array.isArray(videoData.scenes)) {
          scenes = videoData.scenes as { scene: string; duration: number }[];
        }
        
        return {
          id: video.id,
          title: video.video_topic.substring(0, 50) + (video.video_topic.length > 50 ? '...' : ''),
          // Use character image as thumbnail, video_url for playback
          thumbnail: video.character_image_url || '/placeholder.svg',
          url: video.video_url || undefined,
          type: 'video',
          creator: {
            name: 'You',
            avatar: '/placeholder.svg'
          },
          likes: 0,
          isEdited: false,
          isUpscaled: false,
          createdAt: video.created_at || new Date().toISOString(),
          status: video.status as 'pending' | 'processing' | 'completed' | 'error',
          prompt: video.video_topic,
          model: video.video_generation_model || 'Veo 3.1',
          aspectRatio: '16:9',
          resolution: '1280x720 px',
          timestamp: formatTimestamp(video.created_at),
          referenceImage: video.character_image_url || undefined,
          errorMessage: video.error_message || undefined,
          scenes
        };
      }) || [];

      // Combine and sort by creation date
      const allItems = [...mappedImages, ...mappedVideos].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setGeneratedItems(allItems);
    };

    fetchGeneratedContent();

    // Real-time subscription for images
    const imagesChannel = supabase
      .channel('generated_images_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_images'
        },
        (payload) => {
          console.log('Generated images update:', payload);
          fetchGeneratedContent();
        }
      )
      .subscribe();

    // Real-time subscription for videos
    const videosChannel = supabase
      .channel('ai_videos_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_videos'
        },
        (payload) => {
          console.log('AI videos update:', payload);
          fetchGeneratedContent();
        }
      )
      .subscribe();

    // Poll for stuck processing videos every 30 seconds
    const checkStuckVideos = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Check if there are any processing videos older than 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: stuckVideos } = await supabase
        .from('ai_videos')
        .select('id')
        .eq('user_id', session.session.user.id)
        .eq('status', 'processing')
        .lt('created_at', twoMinutesAgo);

      if (stuckVideos && stuckVideos.length > 0) {
        console.log('Found stuck videos, checking status...', stuckVideos.map(v => v.id));
        try {
          const response = await supabase.functions.invoke('check-video-status', {
            body: {}
          });
          console.log('Video status check result:', response.data);
          if (response.data?.updated > 0) {
            fetchGeneratedContent();
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      }
    };

    // Check immediately on mount
    checkStuckVideos();

    // Then poll every 30 seconds
    const pollInterval = setInterval(checkStuckVideos, 30000);

    return () => {
      supabase.removeChannel(imagesChannel);
      supabase.removeChannel(videosChannel);
      clearInterval(pollInterval);
    };
  }, []);

  const allItems = type === 'creations' ? [...generatedItems, ...creationsData] : communityData;

  // Apply filters
  const items = allItems.filter(item => {
    // Content type filter
    if (filters?.contentType && filters.contentType !== 'All') {
      if (filters.contentType === 'Image' && item.type !== 'image') return false;
      if (filters.contentType === 'Video' && item.type !== 'video') return false;
    }

    // Likes filter
    if (filters?.likes && !likedItems.has(item.id)) return false;

    // Edits filter
    if (filters?.edits && !item.isEdited) return false;

    // Upscales filter
    if (filters?.upscales && !item.isUpscaled) return false;

    // Date range filter
    if (filters?.startDate && item.createdAt) {
      if (new Date(item.createdAt) < new Date(filters.startDate)) return false;
    }
    if (filters?.endDate && item.createdAt) {
      if (new Date(item.createdAt) > new Date(filters.endDate)) return false;
    }

    // Search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query) || 
             item.creator.name.toLowerCase().includes(query);
    }

    return true;
  });

  const toggleLike = (id: number | string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: number | string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = (id: number | string) => {
    setShareModalOpen(id);
    setCopiedLink(false);
  };

  const copyShareLink = (id: number | string) => {
    const link = `${window.location.origin}/creation/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = async (item: GalleryItem) => {
    if (!item.url) {
      toast({
        title: "Download failed",
        description: "Image URL not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download image",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    try {
      const tableName = item.type === 'video' ? 'ai_videos' : 'generated_images';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', String(item.id));

      if (error) throw error;

      setGeneratedItems(prev => prev.filter(i => i.id !== item.id));
      
      toast({
        title: "Deleted",
        description: `${item.type === 'video' ? 'Video' : 'Image'} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: `Unable to delete ${item.type === 'video' ? 'video' : 'image'}`,
        variant: "destructive",
      });
    }
  };

  const handleRecreate = async (item: GalleryItem) => {
    if (!item.prompt) {
      toast({
        title: "Cannot recreate",
        description: "No prompt available for this image",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recreating...",
      description: "Starting new generation with the same prompt",
    });

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: item.prompt,
          aspectRatio: item.aspectRatio || '1:1',
          model: item.model?.toLowerCase().includes('flux') ? 'flux-pro' : 
                 item.model?.toLowerCase().includes('seedream') ? 'seedream-4' : 'auto'
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Generation started",
        description: "Your new image is being created",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Unable to start new generation",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    if (!item.url) {
      toast({
        title: "Cannot edit",
        description: "Image URL not available",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/create?editImage=${encodeURIComponent(item.url)}`;
  };

  const handleAnimate = (item: GalleryItem, type: 'video' | 'speak' | 'ugc') => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} animation`,
      description: `${type} animation feature coming soon`,
    });
  };

  const socialPlatforms = [
    { name: 'Twitter', icon: '𝕏', color: 'hover:bg-gray-900' },
    { name: 'Facebook', icon: 'f', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: '📷', color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-700' }
  ];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < items.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const getGridCols = () => {
    switch(columnsPerRow) {
      case 3: return 'lg:grid-cols-3';
      case 4: return 'lg:grid-cols-4';
      case 5: return 'lg:grid-cols-5';
      case 6: return 'lg:grid-cols-6';
      default: return 'lg:grid-cols-4';
    }
  };

  const getIconSize = () => {
    switch(columnsPerRow) {
      case 3: return { button: 'w-10 h-10', icon: 20, badge: 'px-3 py-1.5', badgeIcon: 16, text: 'text-sm', avatar: 'w-9 h-9', gap: 'gap-2' };
      case 4: return { button: 'w-9 h-9', icon: 18, badge: 'px-3 py-1.5', badgeIcon: 14, text: 'text-xs', avatar: 'w-8 h-8', gap: 'gap-2' };
      case 5: return { button: 'w-8 h-8', icon: 16, badge: 'px-2 py-1', badgeIcon: 12, text: 'text-xs', avatar: 'w-7 h-7', gap: 'gap-1.5' };
      case 6: return { button: 'w-7 h-7', icon: 14, badge: 'px-2 py-1', badgeIcon: 10, text: 'text-xs', avatar: 'w-6 h-6', gap: 'gap-1' };
      default: return { button: 'w-9 h-9', icon: 18, badge: 'px-3 py-1.5', badgeIcon: 14, text: 'text-xs', avatar: 'w-8 h-8', gap: 'gap-2' };
    }
  };

  const sizes = getIconSize();

  return (
    <div className="w-full">
      {/* Grid Layout - Dynamic columns based on zoom */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${getGridCols()} gap-4`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Image/Video */}
            <div 
              className="relative aspect-[4/3] overflow-hidden cursor-pointer"
              onClick={() => handleImageClick(index)}
            >
              {/* For completed videos, show video element; otherwise show image */}
              {item.type === 'video' && item.status === 'completed' && item.url ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                />
              ) : (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Loading Overlay for pending/processing */}
              {(item.status === 'pending' || item.status === 'processing') && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg mb-1">
                      {item.type === 'video' ? 'Generating Video' : 'Generating Image'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {item.type === 'video' ? 'This may take a few minutes...' : 'This may take a few moments...'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Error Overlay */}
              {item.status === 'error' && (
                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={24} className="text-white" />
                  </div>
                  <p className="text-red-600 font-semibold text-sm">Generation Failed</p>
                  {item.errorMessage && (
                    <p className="text-red-600 text-xs text-center max-w-[90%] line-clamp-3">
                      {item.errorMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Media Type Badge - Top Left */}
              <div className={`absolute top-3 left-3 ${sizes.badge} bg-black/70 backdrop-blur-sm rounded-lg flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {item.type === 'video' ? (
                  <>
                    <Play size={sizes.badgeIcon} className="text-white" fill="white" />
                    <span className={`text-white ${sizes.text} font-semibold uppercase`}>Video</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={sizes.badgeIcon} className="text-white" />
                    <span className={`text-white ${sizes.text} font-semibold uppercase`}>Image</span>
                  </>
                )}
              </div>

              {/* Top Right Actions - Always visible on hover */}
              <TooltipProvider>
                <div className={`absolute top-3 right-3 flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {/* Save Bookmark */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(item.id);
                        }}
                        className={`${sizes.button} rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                          savedItems.has(item.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-black/70 text-white hover:bg-blue-500'
                        }`}
                      >
                        <Bookmark size={sizes.icon} fill={savedItems.has(item.id) ? 'currentColor' : 'none'} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>Save</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Like Heart */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id);
                        }}
                        className={`${sizes.button} rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                          likedItems.has(item.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-black/70 text-white hover:bg-red-500'
                        }`}
                      >
                        <Heart size={sizes.icon} fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>Like</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Download */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                      >
                        <Download size={sizes.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>Download</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Delete */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-red-500 flex items-center justify-center transition-all`}
                      >
                        <Trash2 size={sizes.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-black">
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              {/* Creator Info - Bottom Left - Hidden when images are small */}
              {columnsPerRow <= 3 && (
                <div className={`absolute bottom-3 left-3 flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className={`${sizes.avatar} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {item.creator.avatar}
                  </div>
                  <span className={`text-white ${sizes.text} font-medium bg-black/70 backdrop-blur-sm ${sizes.badge} rounded-lg`}>
                    {item.creator.name}
                  </span>
                </div>
              )}

              {/* Action Icons - Bottom Right */}
              <TooltipProvider>
                <div className={`absolute bottom-3 right-3 flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                      >
                        <Edit size={sizes.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecreate(item);
                        }}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                      >
                        <RefreshCw size={sizes.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recreate</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item.id);
                        }}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                      >
                        <Share2 size={sizes.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Animate Dropdown - Only show for images, not videos */}
                  {item.type === 'image' && (
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-purple-500 flex items-center justify-center transition-all`}
                            >
                              <Video size={sizes.icon} />
                            </button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Animate</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent 
                        className="bg-black border-gray-800 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem 
                          onClick={() => handleAnimate(item, 'video')}
                          className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                        >
                          <Film className="mr-2 h-4 w-4" />
                          <span>Video</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAnimate(item, 'speak')}
                          className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          <span>Speak</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAnimate(item, 'ugc')}
                          className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          <span>UGC</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && (
        <ImageViewerModal
          image={items[selectedImageIndex]}
          onClose={handleCloseModal}
          onPrevious={selectedImageIndex > 0 ? handlePrevious : undefined}
          onNext={selectedImageIndex < items.length - 1 ? handleNext : undefined}
          isLiked={likedItems.has(items[selectedImageIndex].id)}
          isSaved={savedItems.has(items[selectedImageIndex].id)}
          onToggleLike={() => toggleLike(items[selectedImageIndex].id)}
          onToggleSave={() => toggleSave(items[selectedImageIndex].id)}
          onAnimate={onAnimate}
        />
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShareModalOpen(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pl-[var(--app-sidebar-width,16rem)]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">Share Creation</h3>

              {/* Social Platforms */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    className={`aspect-square bg-gray-100 ${platform.color} text-gray-700 hover:text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-colors p-4`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/creation/${shareModalOpen}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={() => copyShareLink(shareModalOpen)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      copiedLink
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreationsGallery;
