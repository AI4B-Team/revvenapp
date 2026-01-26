import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3,
  Target,
  Sparkles,
  HelpCircle,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TrackingConfig {
  googleAdsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  metaConversionsToken: string;
  tiktokPixelId: string;
}

interface MarketingSectionProps {
  trackingConfig?: TrackingConfig;
  onTrackingConfigChange?: (config: TrackingConfig) => void;
}

interface TrackingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  inputLabel: string;
  inputPlaceholder: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}

function TrackingCard({
  title,
  description,
  icon,
  inputLabel,
  inputPlaceholder,
  value,
  onChange,
  helpText,
}: TrackingCardProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onChange(localValue);
    setIsSaved(true);
    toast.success(`${title} saved!`);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-colors flex flex-col h-full min-h-[220px]">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm font-medium">{inputLabel}</Label>
          {helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={inputPlaceholder}
          className="font-mono text-sm"
        />
        <div className="mt-auto pt-4">
          <Button 
            onClick={handleSave}
            size="sm"
            className={`gap-2 ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'}`}
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MarketingSection({ trackingConfig, onTrackingConfigChange }: MarketingSectionProps) {
  const [config, setConfig] = useState<TrackingConfig>(trackingConfig || {
    googleAdsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    metaConversionsToken: '',
    tiktokPixelId: '',
  });

  const updateConfig = (key: keyof TrackingConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onTrackingConfigChange?.(newConfig);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Marketing & Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Connect tracking pixels and analytics to measure your marketing performance.
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-foreground">Track Everything, Optimize Anything</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your tracking IDs to monitor visitor behavior, measure ad performance, and build retargeting audiences.
          </p>
        </div>
      </div>

      {/* Tracking Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Tracking Integrations</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Google Ads */}
          <TrackingCard
            title="Google Ads"
            description="Track conversions and optimize your Google advertising campaigns for better ROI."
            icon={<Target className="h-5 w-5" />}
            inputLabel="Google Ads ID"
            inputPlaceholder="AW-1234567890"
            value={config.googleAdsId}
            onChange={(value) => updateConfig('googleAdsId', value)}
            helpText="Find this in your Google Ads account under Tools & Settings > Conversions"
          />

          {/* Google Tag Manager */}
          <TrackingCard
            title="Google Tag Manager"
            description="Manage all your tracking tags in one place with Google Tag Manager integration."
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            }
            inputLabel="GTM Container ID"
            inputPlaceholder="GTM-XXXXXXX"
            value={config.googleTagManagerId}
            onChange={(value) => updateConfig('googleTagManagerId', value)}
            helpText="Find this in your GTM dashboard in the container settings"
          />

          {/* Meta Pixel */}
          <TrackingCard
            title="Meta Pixel"
            description="Track visitor activity and measure the effectiveness of your Facebook & Instagram ads."
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
            }
            inputLabel="Meta Pixel ID"
            inputPlaceholder="123456789012345"
            value={config.metaPixelId}
            onChange={(value) => updateConfig('metaPixelId', value)}
            helpText="Find this in Meta Events Manager under Data Sources"
          />

          {/* Meta Conversions API */}
          <TrackingCard
            title="Meta Conversions API"
            description="Enable server-side tracking for more accurate conversion data and better ad optimization."
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
            }
            inputLabel="Access Token"
            inputPlaceholder="EAABsbCS1iHgBO7jZCZBpR8..."
            value={config.metaConversionsToken}
            onChange={(value) => updateConfig('metaConversionsToken', value)}
            helpText="Generate this in Meta Events Manager under Settings > Conversions API"
          />

          {/* TikTok Pixel */}
          <TrackingCard
            title="TikTok Pixel"
            description="Track visitor actions and build custom audiences for your TikTok advertising campaigns."
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            }
            inputLabel="TikTok Pixel ID"
            inputPlaceholder="C3ABCDEFGHIJKLMNOPQRST"
            value={config.tiktokPixelId}
            onChange={(value) => updateConfig('tiktokPixelId', value)}
            helpText="Find this in TikTok Ads Manager under Assets > Events"
          />
        </div>
      </div>

      {/* Documentation Link */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Need Help Setting Up?</p>
          <p className="text-sm text-muted-foreground">View our documentation for step-by-step setup guides.</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <ExternalLink className="h-4 w-4" />
          View Docs
        </Button>
      </div>
    </div>
  );
}
