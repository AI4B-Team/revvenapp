import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Clock, Calendar, Edit, Trash2, Copy, ExternalLink, Film, Play, Save, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getPlatformIcon } from './SocialIcons';
import ContentScoreBadge from './ContentScoreBadge';
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
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentItem | null;
  onSave?: (updatedPost: ContentItem) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [editedHashtags, setEditedHashtags] = useState('');
  const [editedVideoScript, setEditedVideoScript] = useState<VideoScript | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-swipe carousel effect
  useEffect(() => {
    if (!post?.carouselImages || post.carouselImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (post.carouselImages?.length || 1));
    }, 3000); // Swipe every 3 seconds
    
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
      setIsEditing(false);
    }
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    const updatedPost: ContentItem = {
      ...post,
      caption: editedCaption,
      hashtags: editedHashtags.split(',').map(tag => tag.trim().replace('#', '')).filter(Boolean),
      videoScript: editedVideoScript,
    };
    onSave?.(updatedPost);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCaption(post.caption || post.title || '');
    setEditedHashtags(post.hashtags?.join(', ') || '');
    setEditedVideoScript(post.videoScript ? JSON.parse(JSON.stringify(post.videoScript)) : null);
    setIsEditing(false);
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
        {post.type === 'carousel' && post.carouselImages && post.carouselImages.length > 0 ? (
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {post.carouselImages.map((img, idx) => (
              <div key={idx} className="aspect-square min-w-full bg-gray-100 dark:bg-gray-800">
                <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : post.imageUrl ? (
          <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50">
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
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
        {post.type === 'carousel' && post.carouselImages && post.carouselImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {post.carouselImages.map((_, idx) => (
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
        <p className="text-sm text-gray-900 dark:text-white mb-1">
          <span className="font-semibold">{post.accountHandle || '@yourhandle'}</span>{' '}
          {post.caption || post.title}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <p className="text-sm text-blue-500">
            {post.hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}
      </div>
    </div>
  );

  const renderThreadsPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-[350px]">
      {/* Header */}
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
            {post.caption || post.title}
            {post.hashtags && post.hashtags.length > 0 && (
              <span className="text-blue-500"> {post.hashtags.map(tag => `#${tag}`).join(' ')}</span>
            )}
          </p>
          
          {/* Image in Thread */}
          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={post.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
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
              {post.caption || post.title}
            </p>
            {post.hashtags && post.hashtags.length > 0 && (
              <p className="text-sm text-sky-500 mb-3">
                {post.hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            )}
            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={post.imageUrl} alt="" className="w-full aspect-video object-cover" />
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
          {post.caption || post.title}
        </p>
        {post.hashtags && (
          <p className="text-sm text-blue-600 mb-3">
            {post.hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 -mx-4">
            <img src={post.imageUrl} alt="" className="w-full aspect-video object-cover" />
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
        <p className="text-sm text-gray-900 dark:text-white mb-3">{post.caption || post.title}</p>
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img src={post.imageUrl} alt="" className="w-full aspect-video object-cover" />
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
        <div className="flex min-h-[500px] max-h-[90vh]">
          {/* Left Panel - Post Details */}
          <div className="flex-1 border-r border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platformColors[post.platform] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                  {getPlatformIcon(post.platform, 'w-5 h-5 text-white', 'mono')}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground capitalize">{post.platform}</h3>
                  <p className="text-sm text-muted-foreground">{post.type || 'Post'}</p>
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
                    <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Edit Post</DropdownMenuItem>
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

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.status === 'scheduled' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : post.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {post.status === 'scheduled' ? 'Scheduled' : post.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Content Score */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Content Score</h4>
              <ContentScoreBadge 
                item={post} 
                size="lg" 
                showBreakdown 
                onSuggestionApplied={(category, newValue) => {
                  if (category === 'caption') {
                    setEditedCaption(newValue);
                    setIsEditing(true);
                  } else if (category === 'hashtags') {
                    // Parse hashtags from the AI response
                    const hashtagsArray = newValue.match(/#\w+/g)?.map(h => h.replace('#', '')) || [];
                    setEditedHashtags(hashtagsArray.join(', '));
                    setIsEditing(true);
                  }
                }}
              />
            </div>

            {/* Schedule Info */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4 text-sm">
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

            {/* Caption */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Caption</h4>
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
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Hashtags</h4>
              {isEditing ? (
                <Input
                  value={editedHashtags}
                  onChange={(e) => setEditedHashtags(e.target.value)}
                  placeholder="Enter hashtags separated by commas..."
                />
              ) : (
                post.hashtags && post.hashtags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded">
                        #{tag}
                      </span>
                    ))}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
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

          {/* Right Panel - Social Preview */}
          <div className="w-[450px] bg-muted/30 p-6 flex flex-col overflow-y-auto">
            <h3 className="font-semibold text-foreground capitalize mb-4">{post.platform} Preview</h3>
            <div className="flex-1 flex items-start justify-center py-4">
              {getSocialPreview()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
