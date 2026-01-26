import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Trash2,
  Sparkles,
  RefreshCw,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

export interface OrderBump {
  id: string;
  enabled: boolean;
  headline: string;
  description: string;
  price: number;
  originalPrice?: number;
  isAISuggested: boolean;
}

interface OrderBumpEditorProps {
  bump: OrderBump;
  index: number;
  productName: string;
  onUpdate: (bump: OrderBump) => void;
  onDelete: () => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

// AI-suggested order bumps based on product type
const getAISuggestedBumps = (productName: string): Partial<OrderBump>[] => {
  const name = productName.toLowerCase();
  
  if (name.includes('influencer') || name.includes('content') || name.includes('social')) {
    return [
      { headline: 'VIP Content Calendar Template Pack', description: '90 days of pre-planned content themes, hooks, and posting schedules that top creators use to stay consistent.', price: 27, originalPrice: 47 },
      { headline: 'Viral Hook Swipe File', description: '500+ proven scroll-stopping hooks and captions that have generated millions of views. Copy, paste, customize.', price: 17, originalPrice: 37 },
      { headline: 'Analytics Mastery Bootcamp', description: 'Learn to read your analytics like a pro. Know exactly what content to make more of and what to stop.', price: 47, originalPrice: 97 },
    ];
  }
  
  if (name.includes('closer') || name.includes('sales')) {
    return [
      { headline: 'Objection Crusher Playbook', description: 'Word-for-word scripts to handle the 50 most common objections. Never lose a deal to "I need to think about it" again.', price: 37, originalPrice: 67 },
      { headline: 'High-Ticket Closing Masterclass', description: 'The exact framework used to close $10K+ deals consistently. Includes call recordings and breakdown.', price: 97, originalPrice: 197 },
      { headline: 'CRM Setup & Automation Kit', description: 'Done-for-you sales pipeline templates and follow-up sequences that close deals on autopilot.', price: 27, originalPrice: 47 },
    ];
  }
  
  if (name.includes('vault') || name.includes('storage') || name.includes('asset')) {
    return [
      { headline: 'Premium Template Library', description: 'Instant access to 1,000+ professionally designed templates across all categories. Updated monthly.', price: 27, originalPrice: 47 },
      { headline: 'Brand Kit Setup Service', description: 'We\'ll create your complete brand kit with colors, fonts, and guidelines uploaded to your vault.', price: 67, originalPrice: 147 },
      { headline: 'Stock Media Bundle', description: 'Unlimited access to 100,000+ royalty-free images, videos, and audio files. Use commercially anywhere.', price: 17, originalPrice: 37 },
    ];
  }
  
  if (name.includes('video') || name.includes('shorts') || name.includes('viral')) {
    return [
      { headline: 'Trending Audio Library', description: 'Updated daily with viral sounds and music tracks. Know what\'s trending before it peaks.', price: 17, originalPrice: 37 },
      { headline: 'Video Script Templates', description: '200+ fill-in-the-blank scripts for every niche. From hooks to CTAs, never face a blank page again.', price: 27, originalPrice: 47 },
      { headline: 'Thumbnail & Cover Pack', description: '500+ customizable thumbnails and covers that get clicks. Proven designs from top creators.', price: 37, originalPrice: 67 },
    ];
  }
  
  if (name.includes('ghost') || name.includes('writer') || name.includes('writing')) {
    return [
      { headline: 'SEO Keyword Research Toolkit', description: 'Find low-competition, high-traffic keywords in any niche. Includes step-by-step ranking guide.', price: 27, originalPrice: 47 },
      { headline: 'Email Sequence Templates', description: '50+ proven email sequences for launches, nurturing, and sales. Just customize and send.', price: 37, originalPrice: 67 },
      { headline: 'Content Repurposing System', description: 'Turn one piece of content into 10+ formats automatically. Blog to video, thread, carousel, and more.', price: 17, originalPrice: 37 },
    ];
  }
  
  // Default suggestions
  return [
    { headline: 'Priority Support Upgrade', description: 'Skip the line with dedicated support. Get answers within 2 hours, not 2 days.', price: 27, originalPrice: 47 },
    { headline: 'Done-For-You Setup Service', description: 'Our team will configure everything for you. Just answer a few questions and we handle the rest.', price: 97, originalPrice: 197 },
    { headline: 'Extended Training Library', description: 'Unlock 50+ hours of advanced training videos. From beginner to expert in record time.', price: 47, originalPrice: 97 },
  ];
};

export function OrderBumpEditor({
  bump,
  index,
  productName,
  onUpdate,
  onDelete,
  isGenerating,
  onGenerate,
}: OrderBumpEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRegenerate = async () => {
    onGenerate();
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bump.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
          <Package size={16} />
        </div>
        <div className="flex-1">
          <span className="font-medium text-foreground">
            {bump.headline || `Order Bump ${index + 1}`}
          </span>
          {bump.isAISuggested && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-violet-500/10 text-violet-600 rounded">AI Suggested</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-600">${bump.price}</span>
          <Switch
            checked={bump.enabled}
            onCheckedChange={(checked) => onUpdate({ ...bump, enabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Headline</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="gap-1.5 text-xs h-7"
              >
                {isGenerating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Rewrite with AI
              </Button>
            </div>
            <Input
              value={bump.headline}
              onChange={(e) => onUpdate({ ...bump, headline: e.target.value })}
              placeholder="Add [Product Name] to Your Order"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={bump.description}
              onChange={(e) => onUpdate({ ...bump, description: e.target.value })}
              placeholder="Describe what the customer gets with this add-on..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Price</Label>
                <span className="text-xs text-muted-foreground">(AI Suggested)</span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={bump.price}
                  onChange={(e) => onUpdate({ ...bump, price: parseFloat(e.target.value) || 0 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Original Price (Strikethrough)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={bump.originalPrice || ''}
                  onChange={(e) => onUpdate({ ...bump, originalPrice: parseFloat(e.target.value) || undefined })}
                  className="pl-8"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-amber-500/5 border-2 border-dashed border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-600 text-xs">✓</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{bump.headline || 'Order Bump Headline'}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-700 rounded font-medium">SPECIAL OFFER</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{bump.description || 'Description of what the customer gets...'}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">${bump.price.toFixed(2)}</span>
                  {bump.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${bump.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Bump
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { getAISuggestedBumps };
