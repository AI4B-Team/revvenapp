import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Youtube, Plus, Video, Upload, Clock, Send, Trash2, Eye, Settings, Link2, CheckCircle, AlertCircle, Loader2, Image, Type, Calendar as CalendarIcon, RefreshCw, Pencil, X } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YouTubeChannel {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string | null;
}

interface FacebookPage {
  id: string;
  page_id: string;
  page_name: string;
  page_picture: string | null;
  token_expires_at: string | null;
  token_type: string | null;
}

interface AutoYTVideo {
  id: string;
  prompt: string;
  source_type: string;
  source_image_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  category: string | null;
  visibility: string;
  youtube_video_id: string | null;
  facebook_post_id?: string | null;
  post_to_facebook?: boolean;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  channel_id: string | null;
}

const YOUTUBE_CATEGORIES = [
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
  { id: '29', name: 'Nonprofits & Activism' },
];

const AutoYT = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [videos, setVideos] = useState<AutoYTVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Facebook state
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<string | null>(null);
  const [postToFacebook, setPostToFacebook] = useState(false);
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  
  // Create video form state
  const [sourceType, setSourceType] = useState<'text' | 'image'>('text');
  const [videoModel, setVideoModel] = useState<'vo3' | 'vo3.1' | 'sora2'>('vo3');
  const [prompt, setPrompt] = useState('');
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [category, setCategory] = useState('22');
  const [visibility, setVisibility] = useState('private');
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishMode, setPublishMode] = useState<'instant' | 'schedule'>('instant');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('12:00');
  
  // Generated metadata state (shown after video generation)
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isRegeneratingMetadata, setIsRegeneratingMetadata] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);

  useEffect(() => {
    loadChannels();
    loadVideos();
    loadFacebookPages();
    
    // Subscribe to realtime updates for video status changes
    const channel = supabase
      .channel('autoyt-videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'autoyt_videos'
        },
        (payload) => {
          console.log('Video update received:', payload);
          // Reload videos when any change occurs
          loadVideos();
        }
      )
      .subscribe();

    // Listen for Facebook OAuth messages
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'FACEBOOK_AUTH_SUCCESS') {
        await loadFacebookPages();
        toast.success('Facebook Page connected successfully!');
      } else if (event.data.type === 'FACEBOOK_AUTH_ERROR') {
        toast.error(event.data.error || 'Failed to connect Facebook');
      }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from('youtube_channels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading channels:', error);
      return;
    }
    
    setChannels(data || []);
    if (data && data.length > 0 && !selectedChannel) {
      setSelectedChannel(data[0].id);
    }
    setIsLoading(false);
  };

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from('autoyt_videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading videos:', error);
      return;
    }
    
    setVideos(data || []);
  };

  const loadFacebookPages = async () => {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('id, page_id, page_name, page_picture, token_expires_at, token_type')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading Facebook pages:', error);
      return;
    }
    
    setFacebookPages((data as FacebookPage[]) || []);
    if (data && data.length > 0 && !selectedFacebookPage) {
      setSelectedFacebookPage(data[0].page_id);
    }
  };

  const connectFacebook = async () => {
    setIsConnectingFacebook(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        return;
      }

      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: { action: 'get_auth_url', userId: session.user.id }
      });
      
      if (error) throw error;
      
      // Open OAuth popup
      window.open(data.auth_url, 'facebook_oauth', 'width=600,height=700');
    } catch (error: any) {
      console.error('Error connecting Facebook:', error);
      toast.error(error.message || 'Failed to connect Facebook');
    } finally {
      setIsConnectingFacebook(false);
    }
  };

  const disconnectFacebookPage = async (pageId: string) => {
    const { error } = await supabase
      .from('facebook_pages')
      .delete()
      .eq('page_id', pageId);
    
    if (error) {
      toast.error('Failed to disconnect page');
      return;
    }
    
    toast.success('Facebook Page disconnected');
    loadFacebookPages();
  };

  const postToFacebookPage = async (videoId: string, message: string, videoUrl?: string) => {
    if (!selectedFacebookPage) {
      toast.error('Please select a Facebook Page');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: {
          action: 'post_to_page',
          pageId: selectedFacebookPage,
          message,
          videoUrl
        }
      });
      
      if (error) throw error;
      
      // Update video record with Facebook post ID
      await supabase
        .from('autoyt_videos')
        .update({ facebook_post_id: data.post_id })
        .eq('id', videoId);
      
      toast.success('Posted to Facebook!');
      loadVideos();
    } catch (error: any) {
      console.error('Error posting to Facebook:', error);
      toast.error(error.message || 'Failed to post to Facebook');
    }
  };

  const connectYouTube = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-oauth', {
        body: { action: 'get_auth_url' }
      });
      
      if (error) throw error;
      
      // Open OAuth popup
      const popup = window.open(data.auth_url, 'youtube_oauth', 'width=600,height=700');
      
      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'youtube_oauth_success') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          await loadChannels();
          toast.success('YouTube channel connected successfully!');
        } else if (event.data.type === 'youtube_oauth_error') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          toast.error(event.data.error || 'Failed to connect YouTube channel');
        }
      };
      
      window.addEventListener('message', handleMessage);
    } catch (error: any) {
      console.error('Error connecting YouTube:', error);
      toast.error(error.message || 'Failed to connect YouTube channel');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectChannel = async (channelId: string) => {
    const { error } = await supabase
      .from('youtube_channels')
      .delete()
      .eq('id', channelId);
    
    if (error) {
      toast.error('Failed to disconnect channel');
      return;
    }
    
    toast.success('Channel disconnected');
    loadChannels();
  };

  const generateAndPublish = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    // Require at least one platform connected
    if (channels.length === 0 && facebookPages.length === 0) {
      toast.error('Please connect a YouTube channel or Facebook page first');
      return;
    }
    
    if (!selectedChannel && channels.length === 0 && !postToFacebook) {
      toast.error('Please connect a platform or enable Facebook posting');
      return;
    }

    if (publishMode === 'schedule' && !scheduledDate) {
      toast.error('Please select a date and time for scheduling');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      // Calculate scheduled_at datetime if scheduling
      let scheduledAt: string | null = null;
      if (publishMode === 'schedule' && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        scheduledAt = scheduledDateTime.toISOString();
      }

      // Create video record (title, description, tags will be AI-generated)
      const { data: videoRecord, error: insertError } = await supabase
        .from('autoyt_videos')
        .insert({
          user_id: session.user.id,
          channel_id: selectedChannel,
          prompt,
          source_type: sourceType,
          source_image_url: sourceType === 'image' ? sourceImageUrl : null,
          title: prompt.slice(0, 100), // Placeholder, will be replaced by AI
          category,
          visibility,
          status: publishMode === 'schedule' ? 'scheduled' : 'generating',
          scheduled_at: scheduledAt
        })
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Call edge function to generate video with VO3 (AI will generate metadata)
      const { data, error } = await supabase.functions.invoke('autoyt-generate', {
        body: {
          videoId: videoRecord.id,
          prompt,
          sourceType,
          sourceImageUrl: sourceType === 'image' ? sourceImageUrl : null,
          publishMode,
          category,
          visibility
        }
      });
      
      if (error) throw error;
      
      // Show metadata editor with AI-generated content
      setGeneratedVideoId(videoRecord.id);
      setGeneratedTitle(data.title || '');
      setGeneratedDescription(data.description || '');
      setGeneratedTags(data.tags || []);
      setShowMetadataEditor(true);
      
      toast.success('Video generation started! Review and edit metadata below.');
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast.error(error.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishNow = async (videoId: string) => {
    try {
      const { error } = await supabase.functions.invoke('autoyt-publish', {
        body: { videoId }
      });
      
      if (error) throw error;
      
      toast.success('Video is being published...');
      loadVideos();
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish video');
    }
  };

  const regenerateMetadata = async () => {
    if (!generatedVideoId || !prompt.trim()) return;
    
    setIsRegeneratingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('autoyt-generate', {
        body: {
          videoId: generatedVideoId,
          prompt,
          regenerateMetadataOnly: true
        }
      });
      
      if (error) throw error;
      
      setGeneratedTitle(data.title || '');
      setGeneratedDescription(data.description || '');
      setGeneratedTags(data.tags || []);
      
      toast.success('Metadata regenerated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate metadata');
    } finally {
      setIsRegeneratingMetadata(false);
    }
  };

  const saveMetadata = async () => {
    if (!generatedVideoId) return;
    
    try {
      const { error } = await supabase
        .from('autoyt_videos')
        .update({
          title: generatedTitle,
          description: generatedDescription,
          tags: generatedTags
        })
        .eq('id', generatedVideoId);
      
      if (error) throw error;
      
      toast.success('Metadata saved!');
      
      // Reset and reload
      setShowMetadataEditor(false);
      setGeneratedVideoId(null);
      setPrompt('');
      setSourceImageUrl('');
      loadVideos();
      setActiveTab('history');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save metadata');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !generatedTags.includes(newTag.trim())) {
      setGeneratedTags([...generatedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGeneratedTags(generatedTags.filter(tag => tag !== tagToRemove));
  };

  const deleteVideo = async (videoId: string) => {
    const { error } = await supabase
      .from('autoyt_videos')
      .delete()
      .eq('id', videoId);
    
    if (error) {
      toast.error('Failed to delete video');
      return;
    }
    
    toast.success('Video deleted');
    loadVideos();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      generating: { variant: 'outline', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      ready: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      queued: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      scheduled: { variant: 'secondary', icon: <CalendarIcon className="w-3 h-3" /> },
      publishing: { variant: 'outline', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      published: { variant: 'default', icon: <Youtube className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col transition-all duration-300 ml-64">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Auto Post</h1>
                  <p className="text-muted-foreground">Generate and publish videos to social platforms with AI</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {channels.length > 0 && (
                  <Select value={selectedChannel || ''} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center gap-2">
                            {channel.channel_thumbnail && (
                              <img src={channel.channel_thumbnail} alt="" className="w-6 h-6 rounded-full" />
                            )}
                            {channel.channel_title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button onClick={connectYouTube} disabled={isConnecting} variant="outline">
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {channels.length > 0 ? 'Add Channel' : 'Connect YouTube'}
                </Button>
              </div>
            </div>

            {/* Main Content - Always visible */}
            {(
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="create">
                    <Video className="w-4 h-4 mr-2" />
                    Create Video
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <Clock className="w-4 h-4 mr-2" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="channels">
                    <Settings className="w-4 h-4 mr-2" />
                    Channels
                  </TabsTrigger>
                </TabsList>

                {/* Create Video Tab */}
                <TabsContent value="create" className="mt-6">
                  {/* Connection Warning */}
                  {channels.length === 0 && facebookPages.length === 0 && (
                    <Card className="border-amber-500/50 bg-amber-500/10 mb-6">
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="p-2 bg-amber-500/20 rounded-full">
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-600 dark:text-amber-400">Connect a Platform to Publish</h4>
                          <p className="text-sm text-muted-foreground">
                            Connect a YouTube channel or Facebook page to generate and publish videos.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={connectYouTube} disabled={isConnecting} size="sm" variant="outline">
                            <Youtube className="w-4 h-4 mr-2 text-red-500" />
                            Connect YouTube
                          </Button>
                          <Button onClick={connectFacebook} disabled={isConnectingFacebook} size="sm" variant="outline">
                            <FaFacebook className="w-4 h-4 mr-2 text-blue-500" />
                            Connect Facebook
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Video Source */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Video Source</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            variant={sourceType === 'text' ? 'default' : 'outline'}
                            onClick={() => setSourceType('text')}
                            className="flex-1"
                          >
                            <Type className="w-4 h-4 mr-2" />
                            Text to Video
                          </Button>
                          <Button
                            variant={sourceType === 'image' ? 'default' : 'outline'}
                            onClick={() => setSourceType('image')}
                            className="flex-1"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Image to Video
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Video Model</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant={videoModel === 'vo3' ? 'default' : 'outline'}
                              onClick={() => setVideoModel('vo3')}
                              className="flex-1"
                              size="sm"
                            >
                              VO3
                            </Button>
                            <Button
                              variant={videoModel === 'vo3.1' ? 'default' : 'outline'}
                              onClick={() => setVideoModel('vo3.1')}
                              className="flex-1"
                              size="sm"
                            >
                              VO3.1
                            </Button>
                            <Button
                              variant={videoModel === 'sora2' ? 'default' : 'outline'}
                              onClick={() => setVideoModel('sora2')}
                              className="flex-1"
                              size="sm"
                            >
                              Sora 2 Storyboard
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Prompt</Label>
                          <Textarea
                            placeholder="Describe the video you want to generate..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                          />
                        </div>

                        {sourceType === 'image' && (
                          <div className="space-y-2">
                            <Label>Source Image URL</Label>
                            <Input
                              placeholder="https://..."
                              value={sourceImageUrl}
                              onChange={(e) => setSourceImageUrl(e.target.value)}
                            />
                            {sourceImageUrl && (
                              <img 
                                src={sourceImageUrl} 
                                alt="Source" 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Video Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Video Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 text-primary mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">AI-Generated Metadata</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Title, description, and tags will be automatically generated by AI based on your prompt for optimal YouTube SEO.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {YOUTUBE_CATEGORIES.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Visibility</Label>
                            <Select value={visibility} onValueChange={setVisibility}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Facebook Cross-Post */}
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FaFacebook className="w-5 h-5 text-blue-500" />
                              <div>
                                <span className="font-medium">Also post to Facebook</span>
                                <p className="text-sm text-muted-foreground">Share this video on your Facebook Page</p>
                              </div>
                            </div>
                            <Switch 
                              checked={postToFacebook} 
                              onCheckedChange={setPostToFacebook}
                              disabled={facebookPages.length === 0}
                            />
                          </div>
                          
                          {postToFacebook && facebookPages.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-500/20">
                              <Label className="text-sm">Select Page</Label>
                              <Select value={selectedFacebookPage || ''} onValueChange={setSelectedFacebookPage}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select a page" />
                                </SelectTrigger>
                                <SelectContent>
                                  {facebookPages.map(page => (
                                    <SelectItem key={page.id} value={page.page_id}>
                                      <div className="flex items-center gap-2">
                                        {page.page_picture && (
                                          <img src={page.page_picture} alt="" className="w-5 h-5 rounded-full" />
                                        )}
                                        {page.page_name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {facebookPages.length === 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={connectFacebook}
                              disabled={isConnectingFacebook}
                            >
                              {isConnectingFacebook ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <FaFacebook className="w-4 h-4 mr-2" />
                              )}
                              Connect Facebook Page
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Publish Options */}
                  {!showMetadataEditor && (
                    <Card className="mt-6">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant={publishMode === 'instant' ? 'default' : 'outline'}
                              onClick={() => setPublishMode('instant')}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Publish Instantly
                            </Button>
                            <Button
                              variant={publishMode === 'schedule' ? 'default' : 'outline'}
                              onClick={() => setPublishMode('schedule')}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule
                            </Button>
                          </div>

                          <Button 
                            onClick={generateAndPublish} 
                            disabled={isGenerating || !prompt.trim() || (publishMode === 'schedule' && !scheduledDate) || (channels.length === 0 && facebookPages.length === 0)}
                            size="lg"
                          >
                            {isGenerating ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Video className="w-4 h-4 mr-2" />
                            )}
                            {channels.length === 0 && facebookPages.length === 0 ? 'Connect Platform First' : 'Generate Video'}
                          </Button>
                        </div>

                        {/* Schedule Date & Time Picker */}
                        {publishMode === 'schedule' && (
                          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="space-y-2">
                              <Label>Select Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-[240px] justify-start text-left font-normal",
                                      !scheduledDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={scheduledDate}
                                    onSelect={setScheduledDate}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label>Select Time</Label>
                              <Select value={scheduledTime} onValueChange={setScheduledTime}>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, hour) => {
                                    const hourStr = hour.toString().padStart(2, '0');
                                    return ['00', '30'].map(min => (
                                      <SelectItem key={`${hourStr}:${min}`} value={`${hourStr}:${min}`}>
                                        {`${hourStr}:${min}`}
                                      </SelectItem>
                                    ));
                                  }).flat()}
                                </SelectContent>
                              </Select>
                            </div>

                            {scheduledDate && (
                              <div className="ml-auto text-sm text-muted-foreground">
                                Scheduled for: {format(scheduledDate, "MMM d, yyyy")} at {scheduledTime}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata Editor - Shows after generation */}
                  {showMetadataEditor && (
                    <Card className="mt-6 border-primary/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5" />
                            Edit Video Metadata
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={regenerateMetadata}
                              disabled={isRegeneratingMetadata}
                            >
                              {isRegeneratingMetadata ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              Regenerate
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowMetadataEditor(false);
                                setGeneratedVideoId(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={generatedTitle}
                            onChange={(e) => setGeneratedTitle(e.target.value)}
                            placeholder="Video title..."
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground">{generatedTitle.length}/100 characters</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={generatedDescription}
                            onChange={(e) => setGeneratedDescription(e.target.value)}
                            placeholder="Video description..."
                            rows={5}
                            maxLength={5000}
                          />
                          <p className="text-xs text-muted-foreground">{generatedDescription.length}/5000 characters</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {generatedTags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="gap-1">
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add tag..."
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button variant="outline" onClick={addTag} type="button">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowMetadataEditor(false);
                              setGeneratedVideoId(null);
                              loadVideos();
                              setActiveTab('history');
                            }}
                          >
                            Skip & Continue
                          </Button>
                          <Button onClick={saveMetadata}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Metadata
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Video History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {videos.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No videos yet. Create your first video!</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[600px]">
                          <div className="space-y-4">
                            {videos.map(video => (
                              <div 
                                key={video.id} 
                                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border"
                              >
                                {video.video_url ? (
                                  <video 
                                    src={video.video_url} 
                                    className="w-40 h-24 object-cover rounded-lg bg-black"
                                  />
                                ) : (
                                  <div className="w-40 h-24 bg-muted rounded-lg flex items-center justify-center">
                                    <Video className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-medium truncate">
                                        {video.title || video.prompt.slice(0, 50)}
                                      </h4>
                                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {video.prompt}
                                      </p>
                                    </div>
                                    {getStatusBadge(video.status)}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-3">
                                    <Badge variant="outline" className="text-xs">
                                      {video.source_type === 'text' ? 'Text to Video' : 'Image to Video'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {video.visibility}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(video.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {video.error_message && (
                                    <p className="text-sm text-destructive mt-2">
                                      {video.error_message}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {video.status === 'ready' && (
                                    <Button size="sm" onClick={() => publishNow(video.id)}>
                                      <Send className="w-4 h-4 mr-1" />
                                      Publish
                                    </Button>
                                  )}
                                  {video.youtube_video_id && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => window.open(`https://youtube.com/watch?v=${video.youtube_video_id}`, '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => deleteVideo(video.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Channels Tab */}
                <TabsContent value="channels" className="mt-6 space-y-6">
                  {/* YouTube Channels */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <CardTitle>YouTube Channels</CardTitle>
                      </div>
                      <Button onClick={connectYouTube} disabled={isConnecting} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Channel
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {channels.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No YouTube channels connected</p>
                      ) : (
                        <div className="space-y-4">
                          {channels.map(channel => (
                            <div 
                              key={channel.id} 
                              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                            >
                              <div className="flex items-center gap-4">
                                {channel.channel_thumbnail ? (
                                  <img 
                                    src={channel.channel_thumbnail} 
                                    alt={channel.channel_title}
                                    className="w-12 h-12 rounded-full"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <Youtube className="w-6 h-6 text-red-500" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium">{channel.channel_title}</h4>
                                  <p className="text-sm text-muted-foreground">{channel.channel_id}</p>
                                </div>
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Disconnect
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Disconnect Channel?</DialogTitle>
                                  </DialogHeader>
                                  <p className="text-muted-foreground">
                                    Are you sure you want to disconnect "{channel.channel_title}"? 
                                    You won't be able to publish videos to this channel until you reconnect.
                                  </p>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => disconnectChannel(channel.id)}
                                    >
                                      Disconnect
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Facebook Pages */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaFacebook className="w-5 h-5 text-blue-500" />
                        <CardTitle>Facebook Pages</CardTitle>
                      </div>
                      <Button onClick={connectFacebook} disabled={isConnectingFacebook} size="sm">
                        {isConnectingFacebook ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Page
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {facebookPages.length === 0 ? (
                        <div className="text-center py-8">
                          <FaFacebook className="w-12 h-12 mx-auto mb-4 text-blue-500/50" />
                          <p className="text-muted-foreground mb-4">No Facebook pages connected</p>
                          <Button onClick={connectFacebook} disabled={isConnectingFacebook}>
                            {isConnectingFacebook ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FaFacebook className="w-4 h-4 mr-2" />
                            )}
                            Connect Facebook Page
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {facebookPages.map(page => {
                            const now = Date.now();
                            const expiryTime = page.token_expires_at ? new Date(page.token_expires_at).getTime() : null;
                            const isExpired = expiryTime ? expiryTime < now : false;
                            const msUntilExpiry = expiryTime ? expiryTime - now : null;
                            
                            // Calculate countdown
                            const days = msUntilExpiry ? Math.floor(msUntilExpiry / (1000 * 60 * 60 * 24)) : 0;
                            const hours = msUntilExpiry ? Math.floor((msUntilExpiry % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0;
                            const minutes = msUntilExpiry ? Math.floor((msUntilExpiry % (1000 * 60 * 60)) / (1000 * 60)) : 0;
                            
                            const isExpiringSoon = days <= 7 && !isExpired;
                            
                            // Format countdown string
                            const countdownStr = isExpired 
                              ? 'Expired' 
                              : days > 0 
                                ? `${days}d ${hours}h ${minutes}m` 
                                : hours > 0 
                                  ? `${hours}h ${minutes}m`
                                  : `${minutes}m`;
                            
                            return (
                              <div 
                                key={page.id} 
                                className={cn(
                                  "flex items-center justify-between p-4 bg-muted/30 rounded-lg border",
                                  isExpired && "border-destructive/50 bg-destructive/5",
                                  isExpiringSoon && !isExpired && "border-yellow-500/50 bg-yellow-500/5"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  {page.page_picture ? (
                                    <img 
                                      src={page.page_picture} 
                                      alt={page.page_name}
                                      className="w-12 h-12 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                                      <FaFacebook className="w-6 h-6 text-blue-500" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium">{page.page_name}</h4>
                                    <p className="text-sm text-muted-foreground">Page ID: {page.page_id}</p>
                                    {page.token_expires_at && (
                                      <div className="flex items-center gap-2 mt-2">
                                        {isExpired ? (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Token Expired
                                          </Badge>
                                        ) : (
                                          <div className={cn(
                                            "flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium",
                                            isExpiringSoon ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
                                          )}>
                                            <Clock className="w-3.5 h-3.5" />
                                            <div className="flex items-center gap-1">
                                              <span className="font-mono font-bold">{countdownStr}</span>
                                              <span className="text-muted-foreground">remaining</span>
                                            </div>
                                            {!isExpiringSoon && (
                                              <span className="text-muted-foreground text-[10px]">
                                                (until {format(new Date(page.token_expires_at), 'MMM d')})
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {(isExpired || isExpiringSoon) && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={connectFacebook}
                                      disabled={isConnectingFacebook}
                                    >
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Refresh Token
                                    </Button>
                                  )}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Disconnect
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Disconnect Page?</DialogTitle>
                                      </DialogHeader>
                                      <p className="text-muted-foreground">
                                        Are you sure you want to disconnect "{page.page_name}"? 
                                        You won't be able to post to this page until you reconnect.
                                      </p>
                                      <DialogFooter>
                                        <DialogClose asChild>
                                          <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button 
                                          variant="destructive"
                                          onClick={() => disconnectFacebookPage(page.page_id)}
                                        >
                                          Disconnect
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AutoYT;