import React from 'react';
import { X, ExternalLink, Chrome } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
}

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const platforms: SocialPlatform[] = [
  { 
    id: 'instagram-business', 
    name: 'Instagram Business', 
    description: 'Connect your Instagram Business account to publish posts',
    icon: '📸',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    available: true
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    description: 'Connect your Facebook Page to publish posts',
    icon: '👍',
    color: 'bg-blue-600',
    available: true
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    description: 'Connect your LinkedIn Profile or Company account to publish posts',
    icon: '💼',
    color: 'bg-blue-700',
    available: true
  },
  { 
    id: 'threads', 
    name: 'Threads', 
    description: 'Connect your Threads account to schedule posts',
    icon: '🧵',
    color: 'bg-black',
    available: true
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    description: 'Connect your TikTok account to schedule posts',
    icon: '🎵',
    color: 'bg-black',
    available: true
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    description: 'Connect your X account to schedule posts',
    icon: '𝕏',
    color: 'bg-black',
    available: true
  },
  { 
    id: 'pinterest', 
    name: 'Pinterest', 
    description: 'Connect your Pinterest Board to publish pins',
    icon: '📌',
    color: 'bg-red-600',
    available: true
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    description: 'Connect your YouTube Channel to publish videos and shorts',
    icon: '▶️',
    color: 'bg-red-500',
    available: true
  },
  { 
    id: 'bluesky', 
    name: 'Bluesky', 
    description: 'Connect your Bluesky account to publish posts',
    icon: '🦋',
    color: 'bg-sky-500',
    available: true
  },
  { 
    id: 'google-profile', 
    name: 'Google Profile', 
    description: 'Connect your Google Profile account to publish posts',
    icon: '🔍',
    color: 'bg-green-500',
    available: true
  },
];

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const handleConnect = (platformId: string) => {
    console.log(`Connecting to ${platformId}`);
    // Integration logic would go here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Connection</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => handleConnect(platform.id)}
              className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-2xl`}>
                {platform.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                  {platform.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {platform.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        {/* Manual Publishing */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Manual publishing (reminders):</p>
          
          <button className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-left group w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-2xl">
              📷
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Instagram Personal</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Reminders</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect your Instagram personal account to schedule posts (reminders)
              </p>
            </div>
          </button>
        </div>
        
        {/* Browser Extension */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Chrome className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Publish Directly from your Browser!</h3>
              <p className="text-xs text-muted-foreground">Install the Chrome Extension</p>
            </div>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            Add to Chrome
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
