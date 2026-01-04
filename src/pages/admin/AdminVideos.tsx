import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, Eye, Loader2, Video, Play } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AIVideo {
  id: string;
  video_topic: string;
  video_style: string;
  video_url: string | null;
  status: string;
  character_name: string;
  video_generation_model: string;
  created_at: string | null;
  user_id: string;
}

const AdminVideos = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<AIVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<AIVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('ai_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: 'Video Deleted',
        description: 'The video has been removed.',
      });
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video.',
        variant: 'destructive',
      });
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.video_topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.character_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">AI Videos</h1>
            <p className="text-muted-foreground">Manage all AI-generated videos on the platform.</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  All Videos ({filteredVideos.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by topic or character..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No videos found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative group">
                    {video.video_url ? (
                      <>
                        <video
                          src={video.video_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div 
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          onClick={() => setSelectedVideo(video)}
                        >
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(video.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium line-clamp-1 mb-1">{video.video_topic}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Character: {video.character_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {video.created_at && format(new Date(video.created_at), 'MMM d, yyyy')}
                      </span>
                      <div className="flex gap-1">
                        {video.video_url && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Video Preview Modal */}
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedVideo?.video_topic}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedVideo?.video_url && (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Character:</span>{' '}
                  {selectedVideo?.character_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Style:</span>{' '}
                  {selectedVideo?.video_style}
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span>{' '}
                  {selectedVideo?.video_generation_model}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  {selectedVideo?.status}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminVideos;