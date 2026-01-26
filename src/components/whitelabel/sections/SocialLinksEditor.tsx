import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  TikTokIcon,
  YouTubeIcon,
  LinkedInIcon,
  PinterestIcon,
  SnapchatIcon,
  BlueskyIcon,
  ThreadsIcon,
  RedditIcon,
} from '@/components/dashboard/SocialIcons';

interface SocialLink {
  enabled: boolean;
  url: string;
}

interface SocialLinks {
  facebook?: SocialLink;
  instagram?: SocialLink;
  x?: SocialLink;
  tiktok?: SocialLink;
  youtube?: SocialLink;
  linkedin?: SocialLink;
  pinterest?: SocialLink;
  snapchat?: SocialLink;
  bluesky?: SocialLink;
  threads?: SocialLink;
  reddit?: SocialLink;
}

interface SocialLinksEditorProps {
  socialLinks: SocialLinks;
  onChange: (socialLinks: SocialLinks) => void;
}

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', Icon: FacebookIcon, placeholder: 'https://facebook.com/yourpage' },
  { id: 'instagram', name: 'Instagram', Icon: InstagramIcon, placeholder: 'https://instagram.com/yourhandle' },
  { id: 'x', name: 'X (Twitter)', Icon: XIcon, placeholder: 'https://x.com/yourhandle' },
  { id: 'tiktok', name: 'TikTok', Icon: TikTokIcon, placeholder: 'https://tiktok.com/@yourhandle' },
  { id: 'youtube', name: 'YouTube', Icon: YouTubeIcon, placeholder: 'https://youtube.com/@yourchannel' },
  { id: 'linkedin', name: 'LinkedIn', Icon: LinkedInIcon, placeholder: 'https://linkedin.com/company/yourcompany' },
  { id: 'pinterest', name: 'Pinterest', Icon: PinterestIcon, placeholder: 'https://pinterest.com/yourprofile' },
  { id: 'threads', name: 'Threads', Icon: ThreadsIcon, placeholder: 'https://threads.net/@yourhandle' },
  { id: 'bluesky', name: 'Bluesky', Icon: BlueskyIcon, placeholder: 'https://bsky.app/profile/yourhandle' },
  { id: 'reddit', name: 'Reddit', Icon: RedditIcon, placeholder: 'https://reddit.com/r/yourcommunity' },
  { id: 'snapchat', name: 'Snapchat', Icon: SnapchatIcon, placeholder: 'https://snapchat.com/add/yourname' },
];

export function SocialLinksEditor({ socialLinks, onChange }: SocialLinksEditorProps) {
  const updateSocialLink = (platformId: string, field: 'enabled' | 'url', value: boolean | string) => {
    const currentLink = socialLinks[platformId as keyof SocialLinks] || { enabled: false, url: '' };
    onChange({
      ...socialLinks,
      [platformId]: {
        ...currentLink,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
      <Label className="text-sm font-medium">Social Media Profiles</Label>
      <p className="text-xs text-muted-foreground">Select which social platforms to display and add your profile URLs.</p>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {socialPlatforms.map((platform) => {
          const link = socialLinks[platform.id as keyof SocialLinks] || { enabled: false, url: '' };
          const IconComponent = platform.Icon;
          
          return (
            <div key={platform.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" variant="brand" />
                </div>
                <span className="text-sm font-medium flex-1">{platform.name}</span>
                <Switch
                  checked={link.enabled}
                  onCheckedChange={(checked) => updateSocialLink(platform.id, 'enabled', checked)}
                />
              </div>
              
              {link.enabled && (
                <Input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(platform.id, 'url', e.target.value)}
                  placeholder={platform.placeholder}
                  className="ml-11"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
