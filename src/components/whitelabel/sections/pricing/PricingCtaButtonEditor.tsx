import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ExternalLink,
  Anchor,
  Play,
  ShoppingCart,
  Edit2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PricingCtaButton {
  text: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  action: 'checkout' | 'link' | 'anchor' | 'video';
  url?: string;
  anchorId?: string;
  videoUrl?: string;
  openInNewTab?: boolean;
  color?: string;
}

interface PricingCtaButtonEditorProps {
  button: PricingCtaButton;
  onChange: (button: PricingCtaButton) => void;
}

const BUTTON_COLORS = [
  { value: '', label: 'Default', color: 'hsl(var(--primary))', border: false },
  { value: '#ffffff', label: 'White', color: '#ffffff', border: true },
  { value: '#000000', label: 'Black', color: '#000000', border: false },
  { value: '#10b981', label: 'Emerald', color: '#10b981', border: false },
  { value: '#14b8a6', label: 'Teal', color: '#14b8a6', border: false },
  { value: '#06b6d4', label: 'Cyan', color: '#06b6d4', border: false },
  { value: '#3b82f6', label: 'Blue', color: '#3b82f6', border: false },
  { value: '#6366f1', label: 'Indigo', color: '#6366f1', border: false },
  { value: '#8b5cf6', label: 'Purple', color: '#8b5cf6', border: false },
  { value: '#a855f7', label: 'Violet', color: '#a855f7', border: false },
  { value: '#ec4899', label: 'Pink', color: '#ec4899', border: false },
  { value: '#f43f5e', label: 'Rose', color: '#f43f5e', border: false },
  { value: '#ef4444', label: 'Red', color: '#ef4444', border: false },
  { value: '#f59e0b', label: 'Amber', color: '#f59e0b', border: false },
  { value: '#84cc16', label: 'Lime', color: '#84cc16', border: false },
];

const defaultButton: PricingCtaButton = {
  text: 'Get Started Now',
  style: 'primary',
  action: 'checkout',
  color: '',
};

export function PricingCtaButtonEditor({ button = defaultButton, onChange }: PricingCtaButtonEditorProps) {
  const [editingButton, setEditingButton] = useState<PricingCtaButton | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  const generateButtonText = async () => {
    if (!editingButton) return;
    
    setIsGeneratingText(true);
    try {
      const { data, error } = await supabase.functions.invoke('editor-generate-text', {
        body: { 
          prompt: `Generate 1 short, compelling call-to-action button text (2-4 words max) for a pricing page checkout button. Return ONLY the button text, nothing else. Examples: "Get Started Now", "Start Free Trial", "Choose Plan", "Buy Now", "Subscribe Today"`,
          type: 'button'
        }
      });

      if (error) throw error;
      
      const generatedText = data?.text?.trim() || data?.message?.trim();
      if (generatedText) {
        setEditingButton({ ...editingButton, text: generatedText });
      }
    } catch (error) {
      console.error('Error generating button text:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate button text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  const openEditDialog = () => {
    setEditingButton({ ...button });
    setIsDialogOpen(true);
  };

  const saveEditDialog = () => {
    if (editingButton) {
      onChange(editingButton);
      setIsDialogOpen(false);
      setEditingButton(null);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'checkout': return 'Checkout';
      case 'link': return button.url || 'Link';
      case 'anchor': return `#${button.anchorId || 'section'}`;
      case 'video': return 'Video';
      default: return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'checkout': return <ShoppingCart className="h-3 w-3" />;
      case 'link': return <ExternalLink className="h-3 w-3" />;
      case 'anchor': return <Anchor className="h-3 w-3" />;
      case 'video': return <Play className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <>
      <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">CTA Button</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            className="gap-1 h-7 text-xs"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        </div>
        
        {/* Button Preview */}
        <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{button.text}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                {button.style}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              {getActionIcon(button.action)}
              <span className="truncate">{getActionLabel(button.action)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Button Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit CTA Button</DialogTitle>
          </DialogHeader>

          {editingButton && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Form Fields */}
              <div className="space-y-4">
                {/* Button Text */}
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <div className="relative">
                    <Input
                      value={editingButton.text}
                      onChange={(e) => setEditingButton({ ...editingButton, text: e.target.value })}
                      placeholder="Enter Button Text"
                      className="pr-10"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={generateButtonText}
                            disabled={isGeneratingText}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                          >
                            {isGeneratingText ? (
                              <Loader2 className="h-4 w-4 text-brand-yellow animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-brand-yellow" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate Button Text With AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Button Style */}
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select
                    value={editingButton.style}
                    onValueChange={(value: PricingCtaButton['style']) => 
                      setEditingButton({ ...editingButton, style: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Filled)</SelectItem>
                      <SelectItem value="secondary">Secondary (Muted)</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost (Text Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button Color */}
                <div className="space-y-2">
                  <Label>Button Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {BUTTON_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.value || 'default'}
                        type="button"
                        onClick={() => setEditingButton({ ...editingButton, color: colorOption.value })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          (editingButton.color || '') === colorOption.value
                            ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                            : 'hover:scale-105'
                        } ${colorOption.border ? 'border-2 border-muted-foreground/40' : ''}`}
                        style={{ backgroundColor: colorOption.color }}
                        title={colorOption.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Type */}
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={editingButton.action}
                    onValueChange={(value: PricingCtaButton['action']) => 
                      setEditingButton({ ...editingButton, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkout">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Go To Checkout
                        </div>
                      </SelectItem>
                      <SelectItem value="anchor">
                        <div className="flex items-center gap-2">
                          <Anchor className="h-4 w-4" />
                          Scroll To Section
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Open URL
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Video Popup
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action-specific fields */}
                {editingButton.action === 'link' && (
                  <>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={editingButton.url || ''}
                        onChange={(e) => setEditingButton({ ...editingButton, url: e.target.value })}
                        placeholder="https://example.com or #section"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="openInNewTabPricing"
                        checked={editingButton.openInNewTab || false}
                        onChange={(e) => setEditingButton({ ...editingButton, openInNewTab: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="openInNewTabPricing" className="text-sm cursor-pointer">
                        Open in new tab
                      </Label>
                    </div>
                  </>
                )}

                {editingButton.action === 'anchor' && (
                  <div className="space-y-2">
                    <Label>Section ID</Label>
                    <Select
                      value={editingButton.anchorId || ''}
                      onValueChange={(value) => setEditingButton({ ...editingButton, anchorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="features">Features</SelectItem>
                        <SelectItem value="capabilities">Capabilities</SelectItem>
                        <SelectItem value="testimonials">Testimonials</SelectItem>
                        <SelectItem value="pricing">Pricing</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="cta">Call to Action</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingButton.action === 'video' && (
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={editingButton.videoUrl || ''}
                      onChange={(e) => setEditingButton({ ...editingButton, videoUrl: e.target.value })}
                      placeholder="YouTube or Vimeo URL"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports YouTube and Vimeo embed URLs
                    </p>
                  </div>
                )}
              </div>

              {/* Live Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Live Preview</Label>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                    Auto-Sync
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-gradient-to-br from-muted/50 to-muted/30 p-8 flex items-center justify-center min-h-[200px]">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      editingButton.style === 'primary' 
                        ? 'text-primary-foreground shadow-md' 
                        : editingButton.style === 'secondary'
                        ? 'text-secondary-foreground'
                        : editingButton.style === 'outline'
                        ? 'border-2 bg-transparent'
                        : 'bg-transparent hover:bg-muted'
                    }`}
                    style={{
                      backgroundColor: editingButton.style === 'primary' 
                        ? (editingButton.color || 'hsl(var(--primary))') 
                        : editingButton.style === 'secondary'
                        ? (editingButton.color || 'hsl(var(--secondary))')
                        : editingButton.style === 'outline'
                        ? 'transparent'
                        : 'transparent',
                      borderColor: editingButton.style === 'outline' 
                        ? (editingButton.color || 'hsl(var(--primary))') 
                        : undefined,
                      color: editingButton.style === 'outline' || editingButton.style === 'ghost'
                        ? (editingButton.color || 'hsl(var(--primary))')
                        : editingButton.color === '#ffffff' ? '#000000' : undefined,
                    }}
                  >
                    {editingButton.action === 'video' && <Play className="h-4 w-4" />}
                    {editingButton.action === 'checkout' && <ShoppingCart className="h-4 w-4" />}
                    {editingButton.text || 'Button Text'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {editingButton.action === 'checkout' && (
                    <>Opens checkout page</>
                  )}
                  {editingButton.action === 'link' && editingButton.url && (
                    <>Links to: <span className="font-mono">{editingButton.url}</span></>
                  )}
                  {editingButton.action === 'anchor' && editingButton.anchorId && (
                    <>Scrolls to: <span className="font-mono">#{editingButton.anchorId}</span></>
                  )}
                  {editingButton.action === 'video' && (
                    <>Opens video popup</>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditDialog}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
