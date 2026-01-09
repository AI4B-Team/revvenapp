import React, { useState, useEffect } from 'react';
import { 
  X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Clock, Calendar as CalendarIcon, 
  Edit, Trash2, Copy, ExternalLink, Film, Play, Save, XCircle, Hash, Sparkles, 
  Search, Check, Image as ImageIcon, Upload, BarChart3, Eye, TrendingUp, Users,
  RefreshCw, Loader2, FileText, Youtube, Facebook
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getPlatformIcon } from './SocialIcons';
import ContentScoreBadge from './ContentScoreBadge';
import StatusBadge from './StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface VideoScene {
  timestamp: string;
  visual: string;
  audio: string;
  text_overlay: string | null;
}

interface VideoScript {
  duration: string;
  scenes: VideoScene[];
}

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
  imageUrl?: string;
  carouselImages?: string[] | null;
  type?: 'post' | 'story' | 'carousel' | 'reel';
  caption?: string;
  hashtags?: string[];
  accountName?: string;
  accountHandle?: string;
  accountAvatar?: string;
  videoScript?: VideoScript | null;
  autoPublish?: boolean;
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentItem | null;
  onSave?: (updatedPost: ContentItem) => void;
}

interface HashtagSuggestion {
  tag: string;
  relevance: 'High' | 'Medium' | 'Low';
  selected: boolean;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [editedHashtags, setEditedHashtags] = useState('');
  const [editedVideoScript, setEditedVideoScript] = useState<VideoScript | null>(null);
  const [editedCarouselImages, setEditedCarouselImages] = useState<string[] | null>(null);
  const [editedType, setEditedType] = useState<'post' | 'story' | 'carousel' | 'reel' | undefined>(undefined);
  const [editedImageUrl, setEditedImageUrl] = useState<string | undefined>(undefined);
  const [editedStatus, setEditedStatus] = useState<string>('scheduled');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // New feature states
  const [showHashtagPanel, setShowHashtagPanel] = useState(false);
  const [hashtagSearchQuery, setHashtagSearchQuery] = useState('');
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const [isAIWriting, setIsAIWriting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'predictions' | 'results'>('details');
  
  // YouTube scheduling states
  const [showYTSchedule, setShowYTSchedule] = useState(false);
  const [ytScheduledDate, setYtScheduledDate] = useState<Date | undefined>(undefined);
  const [ytScheduledTime, setYtScheduledTime] = useState('12:00');
  const [isPublishingToYT, setIsPublishingToYT] = useState(false);
  
  // Facebook scheduling states
  const [showFBSchedule, setShowFBSchedule] = useState(false);
  const [fbScheduledDate, setFbScheduledDate] = useState<Date | undefined>(undefined);
  const [fbScheduledTime, setFbScheduledTime] = useState('12:00');
  const [isPublishingToFB, setIsPublishingToFB] = useState(false);
  
  // Auto publish mode - when ON, auto-publish by schedule; when OFF, user publishes manually
  const [autoPublishMode, setAutoPublishMode] = useState(post?.autoPublish ?? true);
  
  // Check if post is published (for showing Results tab)
  const isPublished = post?.status === 'published' || post?.status === 'posted';

  // Auto-swipe carousel effect
  useEffect(() => {
    if (!post?.carouselImages || post.carouselImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (post.carouselImages?.length || 1));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [post?.carouselImages]);

  // Reset slide when post changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [post?.id]);

  useEffect(() => {
    if (post) {
      setEditedCaption(post.caption || post.title || '');
      setEditedHashtags(post.hashtags?.join(', ') || '');
      setEditedVideoScript(post.videoScript ? JSON.parse(JSON.stringify(post.videoScript)) : null);
      setEditedCarouselImages(post.carouselImages || null);
      setEditedType(post.type);
      setEditedImageUrl(post.imageUrl);
      setEditedStatus(post.status);
      setIsEditing(false);
      setShowHashtagPanel(false);
      setShowYTSchedule(false);
      setYtScheduledDate(undefined);
      setYtScheduledTime('12:00');
      setShowFBSchedule(false);
      setFbScheduledDate(undefined);
      setFbScheduledTime('12:00');
      setActiveTab('details');
    }
  }, [post]);

  if (!post) return null;

  const handleSave = async () => {
    // Save auto_publish to database
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ auto_publish: autoPublishMode })
        .eq('id', post.id);
      
      if (error) {
        console.error('Failed to update auto_publish:', error);
        toast.error('Failed to save publish settings');
      }
    } catch (err) {
      console.error('Error saving auto_publish:', err);
    }

    const updatedPost: ContentItem = {
      ...post,
      caption: editedCaption,
      hashtags: editedHashtags.split(',').map(tag => tag.trim().replace('#', '')).filter(Boolean),
      videoScript: editedVideoScript,
      carouselImages: editedCarouselImages,
      type: editedType,
      imageUrl: editedImageUrl,
      status: editedStatus,
      autoPublish: autoPublishMode,
    };
    onSave?.(updatedPost);
    setIsEditing(false);
    toast.success('Post updated successfully');
  };

  const handleCancel = () => {
    setEditedCaption(post.caption || post.title || '');
    setEditedHashtags(post.hashtags?.join(', ') || '');
    setEditedVideoScript(post.videoScript ? JSON.parse(JSON.stringify(post.videoScript)) : null);
    setEditedImageUrl(post.imageUrl);
    setEditedStatus(post.status);
    setIsEditing(false);
  };

  // Publish to YouTube with optional scheduling
  const handlePublishToYouTube = async () => {
    if (!post) return;
    
    setIsPublishingToYT(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to publish to YouTube');
        return;
      }

      // Calculate scheduled time if scheduling
      let scheduledAt: string | null = null;
      if (showYTSchedule && ytScheduledDate) {
        const [hours, minutes] = ytScheduledTime.split(':').map(Number);
        const scheduledDateTime = new Date(ytScheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        scheduledAt = scheduledDateTime.toISOString();
      }

      // Create entry in autoyt_videos table
      const { data, error } = await supabase.from('autoyt_videos').insert({
        user_id: user.id,
        prompt: editedCaption || post.title || 'Content post',
        title: post.title,
        description: editedCaption,
        tags: editedHashtags ? editedHashtags.split(',').map(t => t.trim()) : [],
        status: scheduledAt ? 'scheduled' : 'pending',
        scheduled_at: scheduledAt,
        source_type: 'content',
        source_image_url: editedImageUrl || post.imageUrl,
      }).select().single();

      if (error) throw error;

      toast.success(
        scheduledAt 
          ? `Scheduled for YouTube on ${format(new Date(scheduledAt), 'MMM d, yyyy')} at ${ytScheduledTime}`
          : 'Added to YouTube publishing queue'
      );
      
      setShowYTSchedule(false);
      setYtScheduledDate(undefined);
    } catch (err) {
      console.error('Failed to publish to YouTube:', err);
      toast.error('Failed to publish to YouTube');
    } finally {
      setIsPublishingToYT(false);
    }
  };

  // Publish to Facebook with optional scheduling
  const handlePublishToFacebook = async () => {
    if (!post) return;
    
    setIsPublishingToFB(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to publish to Facebook');
        return;
      }

      // Get user's connected Facebook page
      const { data: facebookPages, error: pagesError } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pagesError || !facebookPages || facebookPages.length === 0) {
        toast.error('No Facebook page connected. Please connect a Facebook page first.');
        return;
      }

      const page = facebookPages[0]; // Use the first connected page

      // Check if token is expired
      if (page.token_expires_at) {
        const expiresAt = new Date(page.token_expires_at);
        if (expiresAt < new Date()) {
          toast.error('Facebook token expired. Please reconnect your Facebook page.');
          return;
        }
      }

      // Build the message with caption and hashtags
      let message = editedCaption || post.caption || post.title || '';
      if (editedHashtags) {
        const hashtags = editedHashtags.split(',').map(t => `#${t.trim().replace('#', '')}`).filter(Boolean);
        if (hashtags.length > 0) {
          message += '\n\n' + hashtags.join(' ');
        }
      }

      // Post directly to the connected Facebook page
      const { data: postResult, error: postError } = await supabase.functions.invoke('facebook-oauth', {
        body: {
          action: 'post_to_page',
          pageId: page.page_id,
          message: message,
          link: editedImageUrl || post.imageUrl || null,
        }
      });

      if (postError) throw postError;
      
      if (postResult.error) {
        if (postResult.token_expired) {
          toast.error('Facebook token expired. Please reconnect your Facebook page.');
        } else {
          throw new Error(postResult.error);
        }
        return;
      }

      toast.success(`Posted to ${page.page_name} successfully!`);
      
      // Update post status to published
      if (post.id) {
        await supabase
          .from('social_posts')
          .update({ status: 'published' })
          .eq('id', post.id);
      }
      
      setShowFBSchedule(false);
      setFbScheduledDate(undefined);
    } catch (err) {
      console.error('Failed to publish to Facebook:', err);
      toast.error('Failed to publish to Facebook');
    } finally {
      setIsPublishingToFB(false);
    }
  };

  const updateScene = (sceneIndex: number, field: keyof VideoScene, value: string) => {
    if (!editedVideoScript) return;
    const updatedScenes = [...editedVideoScript.scenes];
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      [field]: value,
    };
    setEditedVideoScript({
      ...editedVideoScript,
      scenes: updatedScenes,
    });
  };

  // Generate hashtag suggestions using AI
  const generateHashtagSuggestions = async () => {
    setIsLoadingHashtags(true);
    try {
      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a social media hashtag expert. Generate relevant, trending hashtags that will maximize reach and engagement. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: `Generate 10 relevant hashtags for this ${post.platform} post about: "${editedCaption}". 
              Return ONLY a JSON array of objects with "tag" (without #) and "relevance" (High, Medium, or Low).
              Example: [{"tag": "marketing", "relevance": "High"}, {"tag": "business", "relevance": "Medium"}]`
            }
          ],
          stream: false
        }
      });

      if (error) throw error;
      
      const content = data?.message || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setHashtagSuggestions(parsed.map((h: any) => ({ ...h, selected: false })));
        toast.success(`Generated ${parsed.length} hashtag suggestions`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to generate hashtags:', err);
      toast.error('Failed to generate hashtags, showing fallback suggestions');
      // Fallback suggestions
      setHashtagSuggestions([
        { tag: 'marketing', relevance: 'High', selected: false },
        { tag: 'socialmedia', relevance: 'High', selected: false },
        { tag: 'business', relevance: 'Medium', selected: false },
        { tag: 'entrepreneur', relevance: 'Medium', selected: false },
        { tag: 'contentcreator', relevance: 'High', selected: false },
        { tag: 'digitalmarketing', relevance: 'High', selected: false },
        { tag: 'branding', relevance: 'Medium', selected: false },
        { tag: 'growth', relevance: 'Low', selected: false },
      ]);
    } finally {
      setIsLoadingHashtags(false);
    }
  };

  // Toggle hashtag selection
  const toggleHashtagSelection = (index: number) => {
    const updated = [...hashtagSuggestions];
    updated[index].selected = !updated[index].selected;
    setHashtagSuggestions(updated);
  };

  // Insert selected hashtags
  const insertSelectedHashtags = () => {
    const selected = hashtagSuggestions.filter(h => h.selected).map(h => h.tag);
    if (selected.length === 0) {
      toast.error('No hashtags selected');
      return;
    }
    const current = editedHashtags ? editedHashtags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const merged = [...new Set([...current, ...selected])];
    setEditedHashtags(merged.join(', '));
    setShowHashtagPanel(false);
    setIsEditing(true);
    toast.success(`Added ${selected.length} hashtags`);
  };

  // AI Writer for caption
  const rewriteWithAI = async () => {
    setIsAIWriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Rewrite this ${post.platform} post caption to be more engaging and optimized for the platform. Keep the same meaning but make it more compelling. Original: "${editedCaption}". Return ONLY the new caption text, nothing else.`
          }]
        }
      });

      if (error) throw error;
      
      const newCaption = data?.message?.trim() || editedCaption;
      setEditedCaption(newCaption);
      setIsEditing(true);
      toast.success('Caption rewritten with AI');
    } catch (err) {
      console.error('Failed to rewrite caption:', err);
      toast.error('Failed to rewrite caption');
    } finally {
      setIsAIWriting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedImageUrl(event.target?.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle draft status
  const toggleDraftStatus = () => {
    const newStatus = editedStatus === 'draft' ? 'scheduled' : 'draft';
    setEditedStatus(newStatus);
    setIsEditing(true);
    toast.success(`Post marked as ${newStatus}`);
  };

  const platformColors: Record<string, string> = {
    instagram: 'from-purple-500 via-pink-500 to-orange-400',
    facebook: 'from-blue-600 to-blue-500',
    twitter: 'from-sky-400 to-sky-500',
    linkedin: 'from-blue-700 to-blue-600',
    tiktok: 'from-black to-gray-800',
    youtube: 'from-red-600 to-red-500',
    pinterest: 'from-red-500 to-red-400',
    threads: 'from-gray-900 to-black',
  };

  // Predictions data (AI-generated estimates before posting)
  const predictionsData = {
    predictedReach: Math.floor(Math.random() * 5000) + 1000,
    predictedEngagement: (Math.random() * 5 + 2).toFixed(1),
    predictedLikes: Math.floor(Math.random() * 500) + 50,
    predictedComments: Math.floor(Math.random() * 50) + 5,
    predictedShares: Math.floor(Math.random() * 30) + 2,
    bestTimeToPost: '9:00 AM - 11:00 AM',
    audienceMatch: Math.floor(Math.random() * 30) + 70,
  };

  // Actual results data (shown only after publishing)
  const resultsData = {
    actualReach: Math.floor(Math.random() * 6000) + 800,
    actualEngagement: (Math.random() * 6 + 1.5).toFixed(1),
    actualLikes: Math.floor(Math.random() * 600) + 40,
    actualComments: Math.floor(Math.random() * 60) + 3,
    actualShares: Math.floor(Math.random() * 40) + 1,
    impressions: Math.floor(Math.random() * 10000) + 2000,
    saves: Math.floor(Math.random() * 50) + 5,
    profileVisits: Math.floor(Math.random() * 100) + 10,
  };

  const renderHashtagPanel = () => (
    <div className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtag Suggestions
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowHashtagPanel(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="auto" className="flex-1">Auto</TabsTrigger>
            <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
          </TabsList>
          <TabsContent value="auto" className="mt-3">
            <p className="text-xs text-muted-foreground mb-3">
              AI-powered hashtag suggestions based on your content
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={generateHashtagSuggestions}
              disabled={isLoadingHashtags}
            >
              {isLoadingHashtags ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generate Suggestions
            </Button>
          </TabsContent>
          <TabsContent value="search" className="mt-3">
            <Input
              placeholder="Search hashtags..."
              value={hashtagSearchQuery}
              onChange={(e) => setHashtagSearchQuery(e.target.value)}
              className="text-sm"
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {hashtagSuggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Click "Generate Suggestions" to get AI-powered hashtags
          </p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
              <span>Hashtags ({hashtagSuggestions.length})</span>
              <span>Relevance</span>
            </div>
            {hashtagSuggestions
              .filter(h => !hashtagSearchQuery || h.tag.toLowerCase().includes(hashtagSearchQuery.toLowerCase()))
              .map((hashtag, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    hashtag.selected 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleHashtagSelection(index)}
                >
                  <span className="text-sm text-foreground">#{hashtag.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      hashtag.relevance === 'High' ? 'text-emerald-500' :
                      hashtag.relevance === 'Medium' ? 'text-amber-500' :
                      'text-gray-400'
                    }`}>
                      {hashtag.relevance}
                    </span>
                    {hashtag.selected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-border space-y-2">
        <Button 
          className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          onClick={insertSelectedHashtags}
          disabled={hashtagSuggestions.filter(h => h.selected).length === 0}
        >
          Insert {hashtagSuggestions.filter(h => h.selected).length} Hashtags
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setShowHashtagPanel(false)}>
          Done
        </Button>
      </div>
    </div>
  );

  // Predictions Tab - AI estimates before posting
  const renderPredictionsTab = () => (
    <div className="space-y-6">
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Predicted Engagement Rate</p>
        <p className="text-2xl font-bold text-foreground">{predictionsData.predictedEngagement}%</p>
        <p className="text-xs text-muted-foreground">Based on AI analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <Eye className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-semibold text-foreground">{predictionsData.predictedReach.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Est. Reach</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-purple-500" />
          <p className="text-lg font-semibold text-foreground">{predictionsData.audienceMatch}%</p>
          <p className="text-xs text-muted-foreground">Audience Match</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
          <p className="text-lg font-semibold text-foreground">{predictionsData.predictedLikes}</p>
          <p className="text-xs text-muted-foreground">Est. Likes</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <MessageCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
          <p className="text-lg font-semibold text-foreground">{predictionsData.predictedComments}</p>
          <p className="text-xs text-muted-foreground">Est. Comments</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Performance Insights</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-foreground">Best Time to Post</span>
            </div>
            <span className="text-sm font-medium text-foreground">{predictionsData.bestTimeToPost}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-foreground">Content Quality</span>
            </div>
            <span className="text-sm font-medium text-emerald-500">Good</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-foreground">Est. Shares</span>
            </div>
            <span className="text-sm font-medium text-foreground">{predictionsData.predictedShares}</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          💡 <strong>Tip:</strong> Posts with 5-15 hashtags typically see 20% higher engagement on {post.platform}.
        </p>
      </div>
    </div>
  );

  // Results Tab - Actual performance after publishing
  const renderResultsTab = () => {
    // Calculate deltas vs predictions
    const reachDelta = resultsData.actualReach - predictionsData.predictedReach;
    const likesDelta = resultsData.actualLikes - predictionsData.predictedLikes;
    const commentsDelta = resultsData.actualComments - predictionsData.predictedComments;
    const sharesDelta = resultsData.actualShares - predictionsData.predictedShares;

    const formatDelta = (delta: number) => {
      if (delta > 0) return <span className="text-emerald-500">+{delta}</span>;
      if (delta < 0) return <span className="text-red-500">{delta}</span>;
      return <span className="text-muted-foreground">0</span>;
    };

    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Actual Engagement Rate</p>
          <p className="text-2xl font-bold text-foreground">{resultsData.actualEngagement}%</p>
          <p className="text-xs text-muted-foreground">
            vs {predictionsData.predictedEngagement}% predicted
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Eye className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-semibold text-foreground">{resultsData.actualReach.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Reach ({formatDelta(reachDelta)})</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-semibold text-foreground">{resultsData.impressions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Impressions</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-semibold text-foreground">{resultsData.actualLikes}</p>
            <p className="text-xs text-muted-foreground">Likes ({formatDelta(likesDelta)})</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-semibold text-foreground">{resultsData.actualComments}</p>
            <p className="text-xs text-muted-foreground">Comments ({formatDelta(commentsDelta)})</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Share2 className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-semibold text-foreground">{resultsData.actualShares}</p>
            <p className="text-[10px] text-muted-foreground">Shares</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Bookmark className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">{resultsData.saves}</p>
            <p className="text-[10px] text-muted-foreground">Saves</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-purple-500" />
            <p className="text-sm font-semibold text-foreground">{resultsData.profileVisits}</p>
            <p className="text-[10px] text-muted-foreground">Profile Visits</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Performance vs Prediction</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-foreground">Reach</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{predictionsData.predictedReach.toLocaleString()}</span>
                <span className="text-sm">→</span>
                <span className="text-sm font-medium text-foreground">{resultsData.actualReach.toLocaleString()}</span>
                <span className="text-xs font-medium">{formatDelta(reachDelta)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-foreground">Likes</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{predictionsData.predictedLikes}</span>
                <span className="text-sm">→</span>
                <span className="text-sm font-medium text-foreground">{resultsData.actualLikes}</span>
                <span className="text-xs font-medium">{formatDelta(likesDelta)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            🎉 <strong>What worked:</strong> Your hashtag strategy helped increase discoverability. Posting at the optimal time boosted initial engagement.
          </p>
        </div>
      </div>
    );
  };

  const renderInstagramPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {post.accountName?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.accountHandle || '@yourhandle'}</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      {/* Image / Carousel */}
      <div className="relative overflow-hidden">
        {post.type === 'carousel' && editedCarouselImages && editedCarouselImages.length > 0 ? (
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {editedCarouselImages.map((img, idx) => (
              <div key={idx} className="aspect-square min-w-full bg-gray-100 dark:bg-gray-800">
                <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : editedImageUrl ? (
          <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50">
            <img src={editedImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/80 dark:bg-black/30 flex items-center justify-center mb-4">
                {getPlatformIcon('instagram', 'w-8 h-8')}
              </div>
              <p className="text-sm text-gray-500">Image Preview</p>
            </div>
          </div>
        )}
        {post.type === 'carousel' && editedCarouselImages && editedCarouselImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {editedCarouselImages.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentSlide(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'bg-white w-3' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer hover:text-red-500 transition-colors" />
            <MessageCircle className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" />
            <Send className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" />
        </div>
        
        {/* Caption */}
        <p className="text-sm text-gray-900 dark:text-white mb-2">
          <span className="font-semibold">{post.accountHandle || '@yourhandle'}</span>{' '}
          {editedCaption || post.title}
        </p>
        
        {/* Hashtags - Visually Separated */}
        {editedHashtags && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Hashtags</p>
            <p className="text-xs text-blue-500 leading-relaxed">
              {editedHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderThreadsPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {post.accountName?.charAt(0) || 'A'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.accountHandle || 'yourhandle'}</p>
            <span className="text-xs text-gray-500">{post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <p className="text-sm text-gray-900 dark:text-white mb-3 leading-relaxed">
            {editedCaption || post.title}
            {editedHashtags && (
              <span className="text-blue-500"> {editedHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}</span>
            )}
          </p>
          
          {editedImageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={editedImageUrl} alt="" className="w-full aspect-[4/3] object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 px-4 pb-4 pt-2 pl-16">
        <Heart className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500 transition-colors" />
        <MessageCircle className="w-5 h-5 text-gray-500 cursor-pointer" />
        <Share2 className="w-5 h-5 text-gray-500 cursor-pointer" />
        <Send className="w-5 h-5 text-gray-500 cursor-pointer" />
      </div>
    </div>
  );

  const renderTwitterPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
              {post.accountName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{post.accountName || 'Your Name'}</span>
              <span className="text-gray-500 text-sm">{post.accountHandle || '@handle'}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white mb-3">
              {editedCaption || post.title}
            </p>
            {editedHashtags && (
              <p className="text-sm text-sky-500 mb-3">
                {editedHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}
              </p>
            )}
            {editedImageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={editedImageUrl} alt="" className="w-full aspect-video object-cover" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pl-12 text-gray-500">
          <MessageCircle className="w-4 h-4 cursor-pointer hover:text-sky-500" />
          <Share2 className="w-4 h-4 cursor-pointer hover:text-green-500" />
          <Heart className="w-4 h-4 cursor-pointer hover:text-red-500" />
          <Bookmark className="w-4 h-4 cursor-pointer hover:text-sky-500" />
        </div>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {post.accountName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{post.accountName || 'Your Name'}</p>
            <p className="text-xs text-gray-500">Professional Title</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · 🌐
            </p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </div>
        <p className="text-sm text-gray-900 dark:text-white mb-3 leading-relaxed">
          {editedCaption || post.title}
        </p>
        {editedHashtags && (
          <p className="text-sm text-blue-600 mb-3">
            {editedHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}
          </p>
        )}
        {editedImageUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 -mx-4">
            <img src={editedImageUrl} alt="" className="w-full aspect-video object-cover" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-around py-3 border-t border-gray-200 dark:border-gray-700 text-gray-500 text-sm">
        <button className="flex items-center gap-1 hover:text-blue-600"><Heart className="w-4 h-4" /> Like</button>
        <button className="flex items-center gap-1 hover:text-blue-600"><MessageCircle className="w-4 h-4" /> Comment</button>
        <button className="flex items-center gap-1 hover:text-blue-600"><Share2 className="w-4 h-4" /> Share</button>
      </div>
    </div>
  );

  const renderGenericPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${platformColors[post.platform] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
            {getPlatformIcon(post.platform, 'w-5 h-5 text-white', 'mono')}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize">{post.platform}</p>
            <p className="text-xs text-gray-500">Preview</p>
          </div>
        </div>
        <p className="text-sm text-gray-900 dark:text-white mb-3">{editedCaption || post.title}</p>
        {editedImageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img src={editedImageUrl} alt="" className="w-full aspect-video object-cover" />
          </div>
        )}
      </div>
    </div>
  );

  const getSocialPreview = () => {
    switch (post.platform) {
      case 'instagram': return renderInstagramPreview();
      case 'threads': return renderThreadsPreview();
      case 'twitter': return renderTwitterPreview();
      case 'linkedin': return renderLinkedInPreview();
      default: return renderGenericPreview();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="flex min-h-[500px] max-h-[90vh] relative">
          {/* Left Panel - Post Details */}
          <div className="flex-1 border-r border-border flex flex-col overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platformColors[post.platform] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                    {getPlatformIcon(post.platform, 'w-5 h-5 text-white', 'mono')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground capitalize">{post.platform}</h3>
                    <p className="text-sm text-muted-foreground">{editedType || 'Post'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Copy className="w-4 h-4" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><ExternalLink className="w-4 h-4" /> Open in {post.platform}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 border-b border-border -mx-6 px-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('predictions')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'predictions'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1.5" />
                  Predictions
                </button>
                {isPublished && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'results'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-1.5" />
                    Results
                  </button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              {activeTab === 'details' && (
                <>
                  {/* Status & Draft Toggle */}
                  <div className="flex items-center justify-between mb-6">
                    <StatusBadge status={editedStatus} size="lg" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Draft</span>
                      <Switch
                        checked={editedStatus === 'draft'}
                        onCheckedChange={toggleDraftStatus}
                      />
                    </div>
                  </div>

                  {/* Content Score */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Content Score</h4>
                    <ContentScoreBadge 
                      item={{ ...post, type: editedType, carouselImages: editedCarouselImages, caption: editedCaption }} 
                      size="lg" 
                      showBreakdown 
                      onSuggestionApplied={(category, newValue) => {
                        if (category === 'caption') {
                          setEditedCaption(newValue);
                          setIsEditing(true);
                        } else if (category === 'hashtags') {
                          const hashtagsArray = newValue.match(/#\w+/g)?.map(h => h.replace('#', '')) || [];
                          setEditedHashtags(hashtagsArray.join(', '));
                          setIsEditing(true);
                        }
                      }}
                      onConvertToCarousel={(images) => {
                        setEditedCarouselImages(images);
                        setEditedType('carousel');
                        setIsEditing(true);
                      }}
                    />
                  </div>

                  {/* Schedule Info */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{post.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Image</h4>
                      {isEditing && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Button variant="outline" size="sm" className="gap-1.5" asChild>
                            <span>
                              <Upload className="w-3.5 h-3.5" />
                              Change
                            </span>
                          </Button>
                        </label>
                      )}
                    </div>
                    {editedImageUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-border">
                        <img src={editedImageUrl} alt="" className="w-full h-32 object-cover" />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <Button size="sm" variant="secondary" className="gap-1.5" asChild>
                                <span>
                                  <ImageIcon className="w-4 h-4" />
                                  Replace Image
                                </span>
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                        <label className="cursor-pointer text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload</p>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Caption</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5 text-purple-500 hover:text-purple-600"
                        onClick={rewriteWithAI}
                        disabled={isAIWriting}
                      >
                        {isAIWriting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        AI Writer
                      </Button>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="min-h-[120px] resize-none"
                        placeholder="Enter your caption..."
                      />
                    ) : (
                      <p className="text-foreground leading-relaxed">{post.caption || post.title}</p>
                    )}
                  </div>

                  {/* Hashtags */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Hashtags</h4>
                      {editedHashtags && editedHashtags.split(',').filter(Boolean).length >= 5 && 
                       editedHashtags.split(',').filter(Boolean).length <= 15 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded font-medium">
                          ✓ Optimized
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto gap-1.5 text-sky-500 hover:text-sky-600"
                        onClick={() => setShowHashtagPanel(true)}
                      >
                        <Hash className="w-3.5 h-3.5" />
                        Suggestions
                      </Button>
                    </div>
                    {isEditing ? (
                      <Input
                        value={editedHashtags}
                        onChange={(e) => setEditedHashtags(e.target.value)}
                        placeholder="Enter hashtags separated by commas..."
                      />
                    ) : (
                      editedHashtags ? (
                        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                          <div className="flex flex-wrap gap-2">
                            {editedHashtags.split(',').filter(Boolean).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            {editedHashtags.split(',').filter(Boolean).length} hashtag{editedHashtags.split(',').filter(Boolean).length !== 1 ? 's' : ''} • 
                            {editedHashtags.split(',').filter(Boolean).length >= 5 && editedHashtags.split(',').filter(Boolean).length <= 15 
                              ? ' Optimal range (5-15)' 
                              : editedHashtags.split(',').filter(Boolean).length < 5 
                                ? ' Add more for better reach' 
                                : ' Consider reducing for less spam'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No hashtags</p>
                      )
                    )}
                  </div>

                  {/* Video Script - Only for reel type */}
                  {post.type === 'reel' && (post.videoScript || editedVideoScript) && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Film className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-medium text-muted-foreground">Video Script</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                          {(isEditing ? editedVideoScript : post.videoScript)?.duration}
                        </span>
                      </div>
                      <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                        {(isEditing ? editedVideoScript : post.videoScript)?.scenes.map((scene, index) => (
                          <div key={index} className="relative pl-4 border-l-2 border-emerald-500/50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                                {scene.timestamp}
                              </span>
                              {(isEditing ? editedVideoScript?.scenes[index]?.text_overlay : scene.text_overlay) && (
                                <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                                  📝 {isEditing ? editedVideoScript?.scenes[index]?.text_overlay : scene.text_overlay}
                                </span>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs text-muted-foreground">Visual:</span>
                                  <Input
                                    value={editedVideoScript?.scenes[index]?.visual || ''}
                                    onChange={(e) => updateScene(index, 'visual', e.target.value)}
                                    className="mt-1 text-sm"
                                    placeholder="Visual description..."
                                  />
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Audio/Script:</span>
                                  <Textarea
                                    value={editedVideoScript?.scenes[index]?.audio || ''}
                                    onChange={(e) => updateScene(index, 'audio', e.target.value)}
                                    className="mt-1 text-sm min-h-[60px]"
                                    placeholder="Audio script..."
                                  />
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Text Overlay:</span>
                                  <Input
                                    value={editedVideoScript?.scenes[index]?.text_overlay || ''}
                                    onChange={(e) => updateScene(index, 'text_overlay', e.target.value)}
                                    className="mt-1 text-sm"
                                    placeholder="Text overlay (optional)..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground">Visual:</span>
                                  <p className="text-foreground">{scene.visual}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Audio/Script:</span>
                                  <p className="text-foreground italic">"{scene.audio}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {activeTab === 'predictions' && renderPredictionsTab()}
              {activeTab === 'results' && isPublished && renderResultsTab()}
            </ScrollArea>

            {/* Actions */}
            <div className="p-6 pt-4 border-t border-border space-y-4">
              {/* Auto/Manual Publish Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    autoPublishMode ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                  )}>
                    {autoPublishMode ? (
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Send className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {autoPublishMode ? 'Auto Publish' : 'Manual Publish'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {autoPublishMode 
                        ? 'Post will be published automatically on schedule' 
                        : 'You will publish this post manually'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoPublishMode}
                  onCheckedChange={async (checked) => {
                    setAutoPublishMode(checked);
                    // Save to database immediately
                    try {
                      const { error } = await supabase
                        .from('social_posts')
                        .update({ auto_publish: checked })
                        .eq('id', post.id);
                      
                      if (error) {
                        console.error('Failed to update auto_publish:', error);
                        toast.error('Failed to save publish settings');
                      } else {
                        toast.success(checked ? 'Auto-publish enabled' : 'Manual publish enabled');
                      }
                    } catch (err) {
                      console.error('Error saving auto_publish:', err);
                    }
                  }}
                />
              </div>

              {/* Manual Publish Buttons - Only show when auto mode is OFF */}
              {!autoPublishMode && (
                <>
                  {/* YouTube Publish Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showYTSchedule ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "gap-2",
                          showYTSchedule && "bg-red-600 hover:bg-red-700 text-white"
                        )}
                        onClick={() => setShowYTSchedule(!showYTSchedule)}
                      >
                        <Youtube className="w-4 h-4" />
                        Publish to YouTube
                      </Button>
                      {showYTSchedule && (
                        <span className="text-xs text-muted-foreground">
                          Schedule or publish instantly
                        </span>
                      )}
                    </div>

                    {showYTSchedule && (
                      <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs">Select Date (optional)</Label>
                          <Input
                            type="date"
                            className="w-[180px]"
                            min={format(new Date(), "yyyy-MM-dd")}
                            value={ytScheduledDate ? format(ytScheduledDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => setYtScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </div>

                        {ytScheduledDate && (
                          <div className="space-y-2">
                            <Label className="text-xs">Select Time</Label>
                            <Select value={ytScheduledTime} onValueChange={setYtScheduledTime}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Time" />
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
                        )}

                        <Button
                          onClick={handlePublishToYouTube}
                          disabled={isPublishingToYT}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white gap-2"
                        >
                          {isPublishingToYT ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {ytScheduledDate ? 'Schedule' : 'Publish Now'}
                        </Button>

                        {ytScheduledDate && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(ytScheduledDate, "MMM d, yyyy")} at {ytScheduledTime}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Facebook Publish Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showFBSchedule ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "gap-2",
                          showFBSchedule && "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        onClick={() => setShowFBSchedule(!showFBSchedule)}
                      >
                        <Facebook className="w-4 h-4" />
                        Publish to Facebook
                      </Button>
                      {showFBSchedule && (
                        <span className="text-xs text-muted-foreground">
                          Schedule or publish instantly
                        </span>
                      )}
                    </div>

                    {showFBSchedule && (
                      <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs">Select Date (optional)</Label>
                          <Input
                            type="date"
                            className="w-[180px]"
                            min={format(new Date(), "yyyy-MM-dd")}
                            value={fbScheduledDate ? format(fbScheduledDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => setFbScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </div>

                        {fbScheduledDate && (
                          <div className="space-y-2">
                            <Label className="text-xs">Select Time</Label>
                            <Select value={fbScheduledTime} onValueChange={setFbScheduledTime}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Time" />
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
                        )}

                        <Button
                          onClick={handlePublishToFacebook}
                          disabled={isPublishingToFB}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                          {isPublishingToFB ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {fbScheduledDate ? 'Schedule' : 'Publish Now'}
                        </Button>

                        {fbScheduledDate && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(fbScheduledDate, "MMM d, yyyy")} at {fbScheduledTime}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Edit/Save Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" className="flex-1 gap-2" onClick={handleCancel}>
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSave}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Clock className="w-4 h-4" />
                      Reschedule
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Social Preview */}
          <div className="w-[450px] bg-muted/30 p-6 flex flex-col overflow-y-auto relative z-0">
            <h3 className="font-semibold text-foreground capitalize mb-4">{post.platform} Preview</h3>
            <div className="flex-1 flex items-start justify-center py-4 overflow-hidden">
              {getSocialPreview()}
            </div>
          </div>

          {/* Hashtag Suggestions Panel (Slide-in) */}
          {showHashtagPanel && renderHashtagPanel()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
