import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Crown,
  Star,
  Check,
  Plus,
  Trash2,
  Zap,
  Layers,
} from 'lucide-react';
import AITextInput from '../AITextInput';

export interface PricingTier {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice?: number;
  originalPrice?: number; // For strikethrough
  features: string[];
  ctaButtonText: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

interface MultiTierPricingEditorProps {
  content: Record<string, any>;
  onContentChange: (updates: Record<string, any>) => void;
}

const defaultTiers: PricingTier[] = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for getting started',
    monthlyPrice: 27,
    annualPrice: 270,
    features: ['Basic AI features', 'Up to 100 posts/month', 'Email support'],
    ctaButtonText: 'Start Free',
    isPopular: false,
  },
  {
    id: '2',
    name: 'Pro',
    description: 'For growing creators',
    monthlyPrice: 47,
    annualPrice: 470,
    originalPrice: 67,
    features: ['Advanced AI features', 'Unlimited posts', 'Priority support', 'Analytics dashboard'],
    ctaButtonText: 'Get Started',
    isPopular: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For teams and agencies',
    monthlyPrice: 97,
    annualPrice: 970,
    features: ['Everything in Pro', 'Team collaboration', 'Custom integrations', 'Dedicated account manager', 'API access'],
    ctaButtonText: 'Contact Sales',
    isPopular: false,
    isBestValue: true,
  },
];

export function MultiTierPricingEditor({ content, onContentChange }: MultiTierPricingEditorProps) {
  const enableMultiTier = content.enableMultiTier || false;
  const tiers: PricingTier[] = content.pricingTiers || defaultTiers;
  const showAnnualToggle = content.showAnnualToggle ?? true;
  const showComparisonTable = content.showComparisonTable ?? false;
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [newFeature, setNewFeature] = useState('');

  // Initialize pricingTiers in content if not set
  useEffect(() => {
    if (!content.pricingTiers) {
      onContentChange({ pricingTiers: defaultTiers });
    }
  }, []);

  const handleEnableMultiTier = (enabled: boolean) => {
    // When enabling multi-tier, make sure tiers are saved to content
    onContentChange({ 
      enableMultiTier: enabled,
      pricingTiers: content.pricingTiers || defaultTiers 
    });
  };

  const handleTiersChange = (updatedTiers: PricingTier[]) => {
    onContentChange({ pricingTiers: updatedTiers });
  };

  const handleTierUpdate = (index: number, updates: Partial<PricingTier>) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], ...updates };
    handleTiersChange(updated);
  };

  const handleAddTier = () => {
    if (tiers.length >= 3) return;
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: `Plan ${tiers.length + 1}`,
      description: 'Plan description',
      monthlyPrice: 47,
      annualPrice: 470,
      features: ['Feature 1', 'Feature 2'],
      ctaButtonText: 'Get Started',
      isPopular: false,
    };
    handleTiersChange([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return;
    const updated = tiers.filter((_, i) => i !== index);
    handleTiersChange(updated);
    if (selectedTierIndex >= updated.length) {
      setSelectedTierIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSetPopular = (index: number) => {
    const updated = tiers.map((tier, i) => ({
      ...tier,
      isPopular: i === index,
    }));
    handleTiersChange(updated);
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    const updated = [...tiers];
    updated[selectedTierIndex].features = [...updated[selectedTierIndex].features, newFeature.trim()];
    handleTiersChange(updated);
    setNewFeature('');
  };

  const handleRemoveFeature = (featureIndex: number) => {
    const updated = [...tiers];
    updated[selectedTierIndex].features = updated[selectedTierIndex].features.filter((_, i) => i !== featureIndex);
    handleTiersChange(updated);
  };

  const handleUpdateFeature = (featureIndex: number, value: string) => {
    const updated = [...tiers];
    updated[selectedTierIndex].features[featureIndex] = value;
    handleTiersChange(updated);
  };

  const selectedTier = tiers[selectedTierIndex];

  return (
    <div className="space-y-5">
      {/* Multi-Tier Toggle */}
      <div className="p-4 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold text-foreground">Multi-Tier Pricing</p>
              <p className="text-xs text-muted-foreground">Offer up to 3 pricing plans</p>
            </div>
          </div>
          <Switch checked={enableMultiTier} onCheckedChange={handleEnableMultiTier} />
        </div>
      </div>

      {enableMultiTier && (
        <>
          {/* Premium Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Annual Toggle</span>
                </div>
                <Switch 
                  checked={showAnnualToggle} 
                  onCheckedChange={(v) => {
                    onContentChange({ showAnnualToggle: v });
                  }} 
                />
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Comparison</span>
                </div>
                <Switch 
                  checked={showComparisonTable} 
                  onCheckedChange={(v) => {
                    onContentChange({ showComparisonTable: v });
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Tier Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Pricing Tiers ({tiers.length}/3)</Label>
              {tiers.length < 3 && (
                <Button variant="outline" size="sm" onClick={handleAddTier} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" />
                  Add Tier
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {tiers.map((tier, index) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTierIndex(index)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-left relative ${
                    selectedTierIndex === index
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Crown className="h-2.5 w-2.5" />
                      POPULAR
                    </div>
                  )}
                  <p className="font-semibold text-sm">{tier.name}</p>
                  <p className="text-lg font-bold text-emerald-600">${tier.monthlyPrice}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Tier Editor */}
          {selectedTier && (
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Edit: {selectedTier.name}</p>
                {tiers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTier(selectedTierIndex)}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Plan Name</Label>
                  <AITextInput
                    value={selectedTier.name}
                    onChange={(newValue) => handleTierUpdate(selectedTierIndex, { name: newValue })}
                    className="h-8 text-sm"
                    context="button_text"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Button Text</Label>
                  <AITextInput
                    value={selectedTier.ctaButtonText}
                    onChange={(newValue) => handleTierUpdate(selectedTierIndex, { ctaButtonText: newValue })}
                    className="h-8 text-sm"
                    context="button_text"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <AITextInput
                  value={selectedTier.description || ''}
                  onChange={(newValue) => handleTierUpdate(selectedTierIndex, { description: newValue })}
                  placeholder="Short description of this plan"
                  className="h-8 text-sm"
                  context="tagline"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Monthly Price</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={selectedTier.monthlyPrice}
                      onChange={(e) => handleTierUpdate(selectedTierIndex, { monthlyPrice: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm pl-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Annual Price</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={selectedTier.annualPrice || selectedTier.monthlyPrice * 10}
                      onChange={(e) => handleTierUpdate(selectedTierIndex, { annualPrice: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm pl-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Original (Strikethrough)</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={selectedTier.originalPrice || ''}
                      onChange={(e) => handleTierUpdate(selectedTierIndex, { originalPrice: parseFloat(e.target.value) || undefined })}
                      placeholder="Optional"
                      className="h-8 text-sm pl-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetPopular(selectedTierIndex)}
                  className={`flex-1 p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                    selectedTier.isPopular
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <Crown className="h-3 w-3" />
                  Most Popular
                </button>
                <button
                  onClick={() => handleTierUpdate(selectedTierIndex, { isBestValue: !selectedTier.isBestValue })}
                  className={`flex-1 p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                    selectedTier.isBestValue
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <Star className="h-3 w-3" />
                  Best Value
                </button>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Features</Label>
                {selectedTier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    <AITextInput
                      value={feature}
                      onChange={(newValue) => handleUpdateFeature(idx, newValue)}
                      className="flex-1 h-7 text-xs"
                      context="spotlight_item"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(idx)}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add A Feature"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                    className="flex-1 h-7 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                    className="gap-1 h-7 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
