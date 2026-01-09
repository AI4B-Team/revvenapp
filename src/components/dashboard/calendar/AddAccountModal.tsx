import React, { useEffect, useState } from 'react';
import { Chrome, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedInIcon, 
  ThreadsIcon, 
  TikTokIcon, 
  XIcon, 
  PinterestIcon, 
  YouTubeIcon, 
  BlueskyIcon,
  GoogleBusinessIcon,
  EmailIcon,
  BlogIcon
} from '../SocialIcons';

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  available: boolean;
}

interface ConnectedPage {
  id: string;
  page_id: string;
  page_name: string;
  page_picture: string | null;
  token_expires_at: string | null;
}

interface YouTubeChannel {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string | null;
  token_expires_at: string;
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
    Icon: InstagramIcon,
    available: true
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    description: 'Connect your Facebook Page to publish posts',
    Icon: FacebookIcon,
    available: true
  },
  { 
    id: 'bluesky', 
    name: 'Bluesky', 
    description: 'Connect your Bluesky account to publish posts',
    Icon: BlueskyIcon,
    available: true
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    description: 'Connect your TikTok account to schedule posts',
    Icon: TikTokIcon,
    available: true
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    description: 'Connect your LinkedIn Profile or Company account to publish posts',
    Icon: LinkedInIcon,
    available: true
  },
  { 
    id: 'threads', 
    name: 'Threads', 
    description: 'Connect your Threads account to schedule posts',
    Icon: ThreadsIcon,
    available: true
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    description: 'Connect your X account to schedule posts',
    Icon: XIcon,
    available: true
  },
  { 
    id: 'google-business', 
    name: 'Google Business', 
    description: 'Connect your Google Business Profile to publish posts',
    Icon: GoogleBusinessIcon,
    available: true
  },
  { 
    id: 'pinterest', 
    name: 'Pinterest', 
    description: 'Connect your Pinterest Board to publish pins',
    Icon: PinterestIcon,
    available: true
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    description: 'Connect your YouTube Channel to publish videos and shorts',
    Icon: YouTubeIcon,
    available: true
  },
  { 
    id: 'email', 
    name: 'Email', 
    description: 'Connect your email service to send newsletters',
    Icon: EmailIcon,
    available: true
  },
  { 
    id: 'blog', 
    name: 'Blog', 
    description: 'Connect your blog platform to publish articles',
    Icon: BlogIcon,
    available: true
  },
];

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConnectedPages();
      loadYouTubeChannels();
      
      // Listen for OAuth callbacks
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS') {
          loadConnectedPages();
          toast.success('Facebook page connected successfully!');
        } else if (event.data?.type === 'YOUTUBE_AUTH_SUCCESS') {
          loadYouTubeChannels();
          toast.success('YouTube channel connected successfully!');
        }
      };
      
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isOpen]);

  const loadConnectedPages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('facebook_pages')
      .select('id, page_id, page_name, page_picture, token_expires_at')
      .eq('user_id', user.id);

    if (!error && data) {
      setConnectedPages(data);
    }
  };

  const loadYouTubeChannels = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('youtube_channels')
      .select('id, channel_id, channel_title, channel_thumbnail, token_expires_at')
      .eq('user_id', user.id);

    if (!error && data) {
      setYoutubeChannels(data);
    }
  };

  const handleConnect = async (platformId: string) => {
    if (platformId === 'facebook') {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('facebook-oauth', {
          body: { action: 'get_auth_url' }
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, 'Facebook Login', 'width=600,height=700');
        }
      } catch (err) {
        console.error('Error connecting Facebook:', err);
        toast.error('Failed to connect Facebook');
      } finally {
        setLoading(false);
      }
    } else if (platformId === 'youtube') {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('youtube-oauth', {
          body: { action: 'get_auth_url' }
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, 'YouTube Login', 'width=600,height=700');
        }
      } catch (err) {
        console.error('Error connecting YouTube:', err);
        toast.error('Failed to connect YouTube');
      } finally {
        setLoading(false);
      }
    } else {
      console.log(`Connecting to ${platformId}`);
      toast.info(`${platformId} integration coming soon`);
    }
  };

  const handleDisconnectYouTube = async (channelId: string, channelTitle: string) => {
    setDisconnecting(channelId);
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      setYoutubeChannels(prev => prev.filter(c => c.id !== channelId));
      toast.success(`Disconnected ${channelTitle}`);
    } catch (err) {
      console.error('Error disconnecting channel:', err);
      toast.error('Failed to disconnect channel');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleDisconnect = async (pageId: string, pageName: string) => {
    setDisconnecting(pageId);
    try {
      const { error } = await supabase
        .from('facebook_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      setConnectedPages(prev => prev.filter(p => p.id !== pageId));
      toast.success(`Disconnected ${pageName}`);
    } catch (err) {
      console.error('Error disconnecting page:', err);
      toast.error('Failed to disconnect page');
    } finally {
      setDisconnecting(null);
    }
  };

  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isTokenExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return new Date(expiresAt) < sevenDaysFromNow && !isTokenExpired(expiresAt);
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: { action: 'refresh_token' }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, 'Facebook Reconnect', 'width=600,height=700');
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      toast.error('Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Manage Connections</DialogTitle>
        </DialogHeader>

        {/* Connected Accounts Section */}
        {(connectedPages.length > 0 || youtubeChannels.length > 0) && (
          <div className="pb-4 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Connected Accounts</h3>
            <div className="space-y-2">
              {/* Facebook Pages */}
              {connectedPages.map(page => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                      {page.page_picture ? (
                        <img src={page.page_picture} alt={page.page_name} className="w-full h-full object-cover" />
                      ) : (
                        <FacebookIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{page.page_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Facebook Page</span>
                        {isTokenExpired(page.token_expires_at) && (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        )}
                        {isTokenExpiringSoon(page.token_expires_at) && (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Expiring soon
                          </span>
                        )}
                        {page.token_expires_at && !isTokenExpired(page.token_expires_at) && !isTokenExpiringSoon(page.token_expires_at) && (
                          <span className="text-xs text-muted-foreground">
                            Expires {format(new Date(page.token_expires_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(isTokenExpired(page.token_expires_at) || isTokenExpiringSoon(page.token_expires_at)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefreshToken}
                        disabled={loading}
                        className="gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisconnect(page.id, page.page_name)}
                      disabled={disconnecting === page.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {disconnecting === page.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {/* YouTube Channels */}
              {youtubeChannels.map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center overflow-hidden">
                      {channel.channel_thumbnail ? (
                        <img src={channel.channel_thumbnail} alt={channel.channel_title} className="w-full h-full object-cover" />
                      ) : (
                        <YouTubeIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{channel.channel_title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">YouTube Channel</span>
                        {isTokenExpired(channel.token_expires_at) && (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnectYouTube(channel.id, channel.channel_title)}
                    disabled={disconnecting === channel.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {disconnecting === channel.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Connection */}
        <div className="pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Add New Connection</h3>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(platform => {
              const IconComponent = platform.Icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => handleConnect(platform.id)}
                  disabled={loading}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-left group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                    <IconComponent className="w-7 h-7" />
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
              );
            })}
          </div>
        </div>
        
        {/* Manual Publishing */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Manual publishing (reminders):</p>
          
          <button className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-left group w-full">
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
              <InstagramIcon className="w-7 h-7" />
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
