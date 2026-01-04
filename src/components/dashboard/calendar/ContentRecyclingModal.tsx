import React, { useState } from 'react';
import { X, RefreshCw, Calendar, Clock, TrendingUp, Check, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPlatformIcon } from '../SocialIcons';
import { Checkbox } from '@/components/ui/checkbox';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  imageUrl?: string;
  caption?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface ContentRecyclingModalProps {
  isOpen: boolean;
  onClose: () => void;
  topPerformingPosts: ContentItem[];
  onRecyclePost: (postId: string, scheduledDate: Date) => void;
}

const ContentRecyclingModal: React.FC<ContentRecyclingModalProps> = ({ 
  isOpen, 
  onClose, 
  topPerformingPosts,
  onRecyclePost 
}) => {
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [recycleInterval, setRecycleInterval] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  const togglePost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleRecycle = () => {
    const intervalDays = recycleInterval === 'weekly' ? 7 : recycleInterval === 'monthly' ? 30 : 90;
    selectedPosts.forEach(postId => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + intervalDays);
      onRecyclePost(postId, scheduledDate);
    });
    onClose();
  };

  const totalEngagement = (post: ContentItem) => 
    post.engagement.likes + post.engagement.comments + post.engagement.shares;

  // Mock data if none provided
  const posts = topPerformingPosts.length > 0 ? topPerformingPosts : [
    {
      id: 'r1',
      title: 'Our most popular product launch post',
      platform: 'instagram',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      caption: '🚀 Exciting launch day! Check out our newest feature...',
      engagement: { likes: 1250, comments: 89, shares: 156 },
    },
    {
      id: 'r2',
      title: 'Tips & tricks carousel',
      platform: 'instagram',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      caption: '5 tips that will change how you work...',
      engagement: { likes: 980, comments: 67, shares: 234 },
    },
    {
      id: 'r3',
      title: 'Behind the scenes video',
      platform: 'tiktok',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400',
      caption: 'A day in our creative process...',
      engagement: { likes: 2100, comments: 145, shares: 389 },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            Content Recycling
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-muted-foreground">
          Repurpose your top-performing content to maximize engagement. Select posts to schedule again.
        </p>
        
        {/* Recycle Interval */}
        <div className="flex items-center gap-3 py-3 border-b border-border">
          <span className="text-sm font-medium">Schedule for:</span>
          <div className="flex items-center gap-2">
            {(['weekly', 'monthly', 'quarterly'] as const).map(interval => (
              <button
                key={interval}
                onClick={() => setRecycleInterval(interval)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  recycleInterval === interval
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>
        
        {/* Top Performing Posts */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Top performing posts from the last 90 days</span>
          </div>
          
          {posts.sort((a, b) => totalEngagement(b) - totalEngagement(a)).map(post => (
            <div 
              key={post.id}
              onClick={() => togglePost(post.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPosts.has(post.id) 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              {/* Checkbox */}
              <Checkbox
                checked={selectedPosts.has(post.id)}
                onCheckedChange={() => togglePost(post.id)}
                className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                  {getPlatformIcon(post.platform, 'w-3 h-3 text-white')}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                  {post.caption || post.title}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                  <span>💬 {post.engagement.comments}</span>
                  <span>🔄 {post.engagement.shares}</span>
                </div>
              </div>
              
              {/* Engagement Score */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">{totalEngagement(post).toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">total engagement</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI will optimize captions for each platform</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecycle}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={selectedPosts.size === 0}
            >
              <RefreshCw className="w-4 h-4" />
              Recycle {selectedPosts.size > 0 ? `${selectedPosts.size} Posts` : 'Posts'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentRecyclingModal;
