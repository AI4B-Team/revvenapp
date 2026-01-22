import { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Play, Trash2, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  GoogleBusinessIcon,
} from '@/components/dashboard/SocialIcons';

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  available: boolean;
  hasWatchVideos?: boolean;
  faqs?: { question: string; answer: string }[];
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

const platforms: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Business or Creator accounts',
    Icon: InstagramIcon,
    available: true,
    hasWatchVideos: true,
    faqs: [
      { question: "I am trying to Link Instagram but a Facebook Popup Opens up?", answer: "Instagram Business accounts are linked through Facebook. You need to connect your Facebook page that is linked to your Instagram Business account." },
      { question: "I don't have a Facebook page. How can I link Instagram?", answer: "You need to create a Facebook Page and connect it to your Instagram Business or Creator account first." },
      { question: "I can't see my Instagram Account inside the Facebook Popup.", answer: "Make sure your Instagram account is converted to a Business or Creator account and is connected to your Facebook Page." },
      { question: "I have an Instagram creator account. Will it work?", answer: "Yes! Creator accounts work the same way as Business accounts for publishing." },
      { question: "After I link, the loader keeps spinning. What can I do?", answer: "Try refreshing the page and attempting the connection again. If the issue persists, try disconnecting and reconnecting." },
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Page',
    Icon: FacebookIcon,
    available: true,
    hasWatchVideos: true,
    faqs: [
      { question: "How do I connect my Facebook Page?", answer: "Click the Add button and sign in with Facebook. Make sure you have admin access to the Page you want to connect." },
      { question: "I can't see my Facebook Page in the list.", answer: "Ensure you have admin access to the Page and that you've granted all necessary permissions during the connection process." },
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Page or Profile',
    Icon: LinkedInIcon,
    available: true,
    hasWatchVideos: true,
    faqs: [
      { question: "Can I connect both personal profile and company page?", answer: "Yes, you can connect both your personal LinkedIn profile and any company pages you manage." },
    ]
  },
  {
    id: 'google-business',
    name: 'Google Business Profile',
    description: 'Profile',
    Icon: GoogleBusinessIcon,
    available: true,
    hasWatchVideos: false,
    faqs: [
      { question: "How do I connect my Google Business Profile?", answer: "Click Add and sign in with the Google account that manages your Business Profile." },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Profile',
    Icon: TikTokIcon,
    available: true,
    hasWatchVideos: false,
    faqs: [
      { question: "What type of TikTok account can I connect?", answer: "You can connect both personal and creator TikTok accounts." },
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Boards',
    Icon: PinterestIcon,
    available: true,
    hasWatchVideos: false,
    faqs: [
      { question: "Can I select which boards to post to?", answer: "Yes, after connecting you can choose which boards to publish your pins to." },
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Profile',
    Icon: XIcon,
    available: true,
    hasWatchVideos: true,
    faqs: [
      { question: "Why is it called Twitter here?", answer: "We support posting to X (formerly Twitter). The connection process remains the same." },
    ]
  },
  {
    id: 'youtube',
    name: 'Youtube',
    description: 'Channel',
    Icon: YouTubeIcon,
    available: true,
    hasWatchVideos: false,
    faqs: [
      { question: "What types of content can I post to YouTube?", answer: "You can publish videos and YouTube Shorts directly to your channel." },
    ]
  },
];

export default function SocialTab() {
  const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [selectedPlatformFaqs, setSelectedPlatformFaqs] = useState<{ name: string; faqs: { question: string; answer: string }[] } | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadConnectedPages();
    loadYouTubeChannels();

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
  }, []);

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
    if (platformId === 'facebook' || platformId === 'instagram') {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('facebook-oauth', {
          body: { action: 'get_auth_url' }
        });

        if (error) throw error;
        if (data?.auth_url) {
          window.open(data.auth_url, 'Facebook Login', 'width=600,height=700');
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
        if (data?.auth_url) {
          window.open(data.auth_url, 'YouTube Login', 'width=600,height=700');
        }
      } catch (err) {
        console.error('Error connecting YouTube:', err);
        toast.error('Failed to connect YouTube');
      } finally {
        setLoading(false);
      }
    } else {
      toast.info(`${platformId} integration coming soon`);
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

  const openFaqModal = (platform: SocialPlatform) => {
    if (platform.faqs && platform.faqs.length > 0) {
      setSelectedPlatformFaqs({ name: platform.name, faqs: platform.faqs });
      setFaqModalOpen(true);
    }
  };

  const totalConnected = connectedPages.length + youtubeChannels.length;
  const maxChannels = 20;

  const getConnectedAccountsForPlatform = (platformId: string) => {
    if (platformId === 'facebook' || platformId === 'instagram') {
      return connectedPages;
    }
    if (platformId === 'youtube') {
      return youtubeChannels;
    }
    return [];
  };

  const toggleAccountSelection = (platformId: string, accountId: string) => {
    setSelectedAccounts(prev => {
      const current = prev[platformId] || [];
      if (current.includes(accountId)) {
        return { ...prev, [platformId]: current.filter(id => id !== accountId) };
      }
      return { ...prev, [platformId]: [...current, accountId] };
    });
  };

  const toggleSelectAll = (platformId: string, accounts: { id: string }[]) => {
    setSelectedAccounts(prev => {
      const current = prev[platformId] || [];
      if (current.length === accounts.length) {
        return { ...prev, [platformId]: [] };
      }
      return { ...prev, [platformId]: accounts.map(a => a.id) };
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-300">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect Social Media Accounts</h2>
          <p className="text-sm text-gray-500">
            Choose the platforms where your posts should be published. You must connect at least one to enable auto posting.
          </p>
        </div>
      </div>

      {/* Channels Connected Counter */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-blue-600">{totalConnected}/{maxChannels} Channels connected</span>
        <ArrowRight className="w-4 h-4 text-blue-600" />
      </div>
      <p className="text-sm text-gray-500 mb-6">You are on the Rise Plan and can connect up to {maxChannels} channels</p>

      {/* Platforms List */}
      <div className="space-y-4">
        {platforms.map(platform => {
          const connectedAccounts = getConnectedAccountsForPlatform(platform.id);
          const hasConnectedAccounts = connectedAccounts.length > 0;
          const selected = selectedAccounts[platform.id] || [];

          return (
            <div key={platform.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Platform Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <platform.Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{platform.name}</p>
                    <p className="text-sm text-gray-500">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnect(platform.id)}
                    disabled={loading}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Add
                  </Button>
                  {platform.faqs && platform.faqs.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openFaqModal(platform)}
                      className="text-gray-500 gap-1"
                    >
                      <HelpCircle className="w-4 h-4" />
                      FAQ
                    </Button>
                  )}
                  {platform.hasWatchVideos && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Watch Videos
                    </Button>
                  )}
                </div>
              </div>

              {/* Connected Accounts Section */}
              {hasConnectedAccounts && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Select All */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-all-${platform.id}`}
                        checked={selected.length === connectedAccounts.length}
                        onCheckedChange={() => toggleSelectAll(platform.id, connectedAccounts)}
                      />
                      <label htmlFor={`select-all-${platform.id}`} className="text-sm text-gray-600 cursor-pointer">
                        Select all accounts
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">
                      {selected.length}/{connectedAccounts.length} accounts selected
                    </span>
                  </div>

                  {/* Account Cards */}
                  <div className="flex flex-wrap gap-3">
                    {platform.id === 'youtube' ? (
                      youtubeChannels.map(channel => (
                        <div
                          key={channel.id}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer min-w-[140px] ${
                            selected.includes(channel.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleAccountSelection(platform.id, channel.id)}
                        >
                          {selected.includes(channel.id) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="w-16 h-16 mb-2">
                              <AvatarImage src={channel.channel_thumbnail || undefined} alt={channel.channel_title} />
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {channel.channel_title.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-sm text-gray-900 truncate max-w-[120px]">{channel.channel_title}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnectYouTube(channel.id, channel.channel_title);
                              }}
                              disabled={disconnecting === channel.id}
                              className="text-xs text-red-500 hover:text-red-600 mt-1"
                            >
                              {disconnecting === channel.id ? 'Unlinking...' : 'Unlink'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      connectedPages.map(page => (
                        <div
                          key={page.id}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer min-w-[140px] ${
                            selected.includes(page.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleAccountSelection(platform.id, page.id)}
                        >
                          {selected.includes(page.id) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="w-16 h-16 mb-2">
                              <AvatarImage src={page.page_picture || undefined} alt={page.page_name} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {page.page_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-sm text-gray-900 truncate max-w-[120px]">{page.page_name}</p>
                            {isTokenExpired(page.token_expires_at) && (
                              <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" /> Expired
                              </span>
                            )}
                            {isTokenExpiringSoon(page.token_expires_at) && !isTokenExpired(page.token_expires_at) && (
                              <span className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" /> Expiring soon
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(page.id, page.page_name);
                              }}
                              disabled={disconnecting === page.id}
                              className="text-xs text-red-500 hover:text-red-600 mt-1"
                            >
                              {disconnecting === page.id ? 'Unlinking...' : 'Unlink'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Modal */}
      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPlatformFaqs?.name} FAQ's</DialogTitle>
          </DialogHeader>
          <Accordion type="single" collapsible className="w-full">
            {selectedPlatformFaqs?.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DialogContent>
      </Dialog>
    </div>
  );
}
