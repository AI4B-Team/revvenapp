import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X, Play, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { creationsData } from '@/data/creationsData';

interface VideoToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect: (video: { url: string; name: string; duration?: number }) => void;
}

const VideoToVideoModal = ({ isOpen, onClose, onVideoSelect }: VideoToVideoModalProps) => {
  const [activeTab, setActiveTab] = useState('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [savedVideos, setSavedVideos] = useState<{ id: string; url: string; name: string; duration?: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock stock and community videos
  const stockVideos = [
    { id: 'stock-1', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400', name: 'Urban Lifestyle', type: 'stock', duration: 15 },
    { id: 'stock-2', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400', name: 'Nature Walk', type: 'stock', duration: 20 },
    { id: 'stock-3', url: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=400', name: 'City Night', type: 'stock', duration: 10 },
    { id: 'stock-4', url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400', name: 'Motivation', type: 'stock', duration: 12 },
  ];

  const communityVideos = [
    { id: 'comm-1', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400', name: 'Tech Showcase', type: 'community', duration: 18 },
    { id: 'comm-2', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', name: 'Fashion Reel', type: 'community', duration: 25 },
    { id: 'comm-3', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', name: 'Travel Vlog', type: 'community', duration: 22 },
  ];

  useEffect(() => {
    const fetchSavedVideos = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_videos')
          .select('id, url, name, duration')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedVideos(data || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSavedVideos();
    }
  }, [isOpen]);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, MOV, or MKV video files",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const duration = await new Promise<number>((resolve) => {
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(Math.round(video.duration));
        };
        video.src = URL.createObjectURL(file);
      });

      // Upload to Cloudinary via edge function
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
        body: {
          videoData: base64Data,
          filename: file.name,
          duration
        }
      });

      if (uploadError) throw uploadError;

      // Save to database
      const { data: savedVideo, error: dbError } = await supabase
        .from('user_videos')
        .insert({
          user_id: user.id,
          url: uploadData.url,
          name: file.name,
          duration,
          cloudinary_public_id: uploadData.public_id
        })
        .select('id, url, name, duration')
        .single();

      if (dbError) throw dbError;

      setSavedVideos(prev => [savedVideo, ...prev]);
      onVideoSelect({ url: savedVideo.url, name: savedVideo.name, duration: savedVideo.duration });
      onClose();

      toast({
        title: "Video uploaded",
        description: "Your video is ready for Video-To-Video generation",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleVideoClick = (video: { url: string; name: string; duration?: number }) => {
    onVideoSelect(video);
    onClose();
  };

  const filterItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="text-red-500" size={22} />
            Video-To-Video
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[65vh]">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="creations">My Videos</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="creations" className="flex-1 overflow-y-auto">
              {/* Upload Section */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/quicktime,video/x-matroska"
                  className="hidden"
                  id="video-upload"
                  onChange={handleVideoUpload}
                />
                <label
                  htmlFor="video-upload"
                  className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-rose-500" />
                      <span className="text-muted-foreground">Click to upload a video</span>
                    </>
                  )}
                </label>
              </div>

              {/* Saved Videos Grid */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-muted-foreground" />
                </div>
              ) : filterItems(savedVideos).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No videos yet. Upload one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filterItems(savedVideos).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition group"
                    >
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Play size={32} className="text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs truncate">{video.name}</p>
                        {video.duration && (
                          <p className="text-white/70 text-xs">{video.duration}s</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stock" className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {filterItems(stockVideos).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition group"
                  >
                    <img
                      src={video.url}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{video.name}</p>
                      {video.duration && (
                        <p className="text-white/70 text-xs">{video.duration}s</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="community" className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {filterItems(communityVideos).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition group"
                  >
                    <img
                      src={video.url}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{video.name}</p>
                      {video.duration && (
                        <p className="text-white/70 text-xs">{video.duration}s</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoToVideoModal;
