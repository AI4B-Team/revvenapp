import React, { useState } from 'react';
import { Grid3x3, LayoutGrid, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlatformIcon } from '../SocialIcons';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  imageUrl?: string;
  caption?: string;
  type?: string;
}

interface FeedPreviewViewProps {
  posts: ContentItem[];
}

type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook';
type ViewMode = 'grid' | 'feed';

const FeedPreviewView: React.FC<FeedPreviewViewProps> = ({ posts }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  const platforms: Platform[] = ['instagram', 'tiktok', 'linkedin', 'twitter', 'facebook'];
  
  const platformPosts = posts.filter(p => p.platform === selectedPlatform);

  const renderInstagramGrid = () => (
    <div className="grid grid-cols-3 gap-0.5 bg-black">
      {platformPosts.slice(0, 9).map((post) => (
        <div 
          key={post.id} 
          className="aspect-square bg-muted relative overflow-hidden group cursor-pointer"
        >
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-4xl">📷</span>
            </div>
          )}
          {post.type === 'reel' && (
            <div className="absolute top-2 right-2">
              <span className="text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">▶️</span>
            </div>
          )}
          {post.type === 'carousel' && (
            <div className="absolute top-2 right-2">
              <span className="text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">📑</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm">
            <span>❤️ 1.2k</span>
            <span>💬 89</span>
          </div>
        </div>
      ))}
      {Array.from({ length: Math.max(0, 9 - platformPosts.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="aspect-square bg-muted/20 border border-dashed border-muted-foreground/20 flex items-center justify-center">
          <span className="text-muted-foreground/50 text-2xl">+</span>
        </div>
      ))}
    </div>
  );

  const renderInstagramFeed = () => (
    <div className="space-y-4">
      {platformPosts.slice(0, 3).map(post => (
        <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="font-semibold text-sm">your_account</span>
            <span className="text-muted-foreground ml-auto">•••</span>
          </div>
          {/* Image */}
          <div className="aspect-square bg-muted">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            )}
          </div>
          {/* Actions */}
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-4">
              <span>❤️</span>
              <span>💬</span>
              <span>📤</span>
              <span className="ml-auto">🔖</span>
            </div>
            <p className="text-sm font-semibold">1,234 likes</p>
            <p className="text-sm line-clamp-2">
              <span className="font-semibold">your_account</span> {post.caption || post.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTikTokFeed = () => (
    <div className="grid grid-cols-3 gap-1">
      {platformPosts.slice(0, 9).map(post => (
        <div key={post.id} className="aspect-[9/16] bg-black relative overflow-hidden rounded-sm">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-purple-600 to-pink-600" />
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs line-clamp-2 drop-shadow">{post.caption || post.title}</p>
            <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
              <span>▶️ 12.3k</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLinkedInFeed = () => (
    <div className="space-y-4">
      {platformPosts.slice(0, 2).map(post => (
        <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-border">
          {/* Header */}
          <div className="flex items-start gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Your Name</p>
              <p className="text-xs text-muted-foreground">Founder & CEO • 1st</p>
              <p className="text-xs text-muted-foreground">2h • 🌐</p>
            </div>
          </div>
          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-sm line-clamp-3">{post.caption || post.title}</p>
          </div>
          {/* Image */}
          {post.imageUrl && (
            <div className="aspect-video bg-muted">
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center justify-around p-3 border-t border-border text-muted-foreground text-sm">
            <span>👍 Like</span>
            <span>💬 Comment</span>
            <span>🔄 Repost</span>
            <span>📤 Send</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlatformFeed = () => {
    switch (selectedPlatform) {
      case 'instagram':
        return viewMode === 'grid' ? renderInstagramGrid() : renderInstagramFeed();
      case 'tiktok':
        return renderTikTokFeed();
      case 'linkedin':
        return renderLinkedInFeed();
      default:
        return renderInstagramFeed();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Feed Preview</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={deviceView === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('mobile')}
            className={deviceView === 'mobile' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={deviceView === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('desktop')}
            className={deviceView === 'desktop' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Platform Tabs - Vertical */}
        <div className="w-16 border-r border-border bg-muted/30 flex flex-col items-center py-4 gap-2">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                selectedPlatform === platform
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {getPlatformIcon(platform, 'w-5 h-5')}
            </button>
          ))}
        </div>
        
        {/* Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-muted/20 flex items-start justify-center">
          <div className={`${
            deviceView === 'mobile' 
              ? 'w-[375px] min-h-[600px] rounded-[40px] border-[8px] border-black bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl'
              : 'w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-lg border border-border overflow-hidden'
          }`}>
            {/* Phone Notch (mobile only) */}
            {deviceView === 'mobile' && (
              <div className="h-7 bg-black flex items-center justify-center">
                <div className="w-20 h-5 bg-black rounded-full" />
              </div>
            )}
            
            {/* View Mode Toggle (for Instagram) */}
            {selectedPlatform === 'instagram' && (
              <div className="flex items-center justify-center gap-2 py-3 border-b border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('feed')}
                  className={`p-2 rounded ${viewMode === 'feed' ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Feed Content */}
            <div className="overflow-y-auto" style={{ maxHeight: deviceView === 'mobile' ? '500px' : 'none' }}>
              {renderPlatformFeed()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {platformPosts.length} posts scheduled for {selectedPlatform}
        </p>
      </div>
    </div>
  );
};

export default FeedPreviewView;
