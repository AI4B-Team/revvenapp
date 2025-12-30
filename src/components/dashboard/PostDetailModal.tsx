import React from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Clock, Calendar, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPlatformIcon } from './SocialIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
  imageUrl?: string;
  type?: 'post' | 'story' | 'carousel' | 'reel';
  caption?: string;
  hashtags?: string[];
  accountName?: string;
  accountHandle?: string;
  accountAvatar?: string;
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentItem | null;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post }) => {
  if (!post) return null;

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

      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 flex items-center justify-center">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/80 dark:bg-black/30 flex items-center justify-center mb-4">
              {getPlatformIcon('instagram', 'w-8 h-8')}
            </div>
            <p className="text-sm text-gray-500">Image Preview</p>
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
            {getPlatformIcon(post.platform, 'w-5 h-5 text-white')}
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
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Left Panel - Post Details */}
          <div className="flex-1 border-r border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platformColors[post.platform] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                  {getPlatformIcon(post.platform, 'w-5 h-5 text-white')}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground capitalize">{post.platform}</h3>
                  <p className="text-sm text-muted-foreground">{post.type || 'Post'}</p>
                </div>
              </div>
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
              <p className="text-foreground leading-relaxed">{post.caption || post.title}</p>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1 gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Clock className="w-4 h-4" />
                Reschedule
              </Button>
            </div>
          </div>

          {/* Right Panel - Social Preview */}
          <div className="w-[420px] bg-muted/30 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground capitalize">{post.platform} Preview</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {getSocialPreview()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
