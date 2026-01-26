import React, { useState } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Label } from '@/components/ui/label';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PageStyle = 'centered' | 'split-left' | 'split-right' | 'minimal' | 'gradient' | 'bold';

interface StyleSectionProps {
  app: MarketplaceApp;
  license?: AppLicense;
  selectedStyle: PageStyle;
  onStyleChange: (style: PageStyle) => void;
}

interface StyleOption {
  id: PageStyle;
  name: string;
  description: string;
}

const styleOptions: StyleOption[] = [
  { id: 'centered', name: 'Centered', description: 'Classic centered layout with logo, headline, and CTA' },
  { id: 'split-left', name: 'Split Left', description: 'Content on left with visual element on right' },
  { id: 'split-right', name: 'Split Right', description: 'Visual element on left with content on right' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, distraction-free design focusing on text' },
  { id: 'gradient', name: 'Gradient', description: 'Vibrant gradient background with white text' },
  { id: 'bold', name: 'Bold', description: 'Dark background with high-contrast elements' },
];

// Mini preview components that show actual page layout
function MiniPreview({ 
  style, 
  primaryColor, 
  productName, 
  logoUrl,
  selectedIcon 
}: { 
  style: PageStyle; 
  primaryColor: string; 
  productName: string;
  logoUrl?: string;
  selectedIcon: string;
}) {
  const renderLogo = () => (
    logoUrl ? (
      <img src={logoUrl} alt="Logo" className="h-4 object-contain" />
    ) : (
      <div 
        className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
        style={{ backgroundColor: `${primaryColor}30` }}
      >
        {selectedIcon}
      </div>
    )
  );

  const renderBadge = (inverted = false) => (
    <div 
      className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[6px] font-medium"
      style={{ 
        backgroundColor: inverted ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`, 
        color: inverted ? 'white' : primaryColor 
      }}
    >
      <Zap size={6} />
      <span>AI</span>
    </div>
  );

  const renderCTA = (inverted = false) => (
    <div className="flex gap-1 justify-center">
      <div 
        className="px-2 py-0.5 rounded text-[6px] font-medium flex items-center gap-0.5"
        style={{ 
          backgroundColor: inverted ? 'white' : primaryColor,
          color: inverted ? primaryColor : 'white'
        }}
      >
        Get Started <ArrowRight size={6} />
      </div>
      <div className={`px-2 py-0.5 rounded text-[6px] font-medium ${
        inverted ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
      }`}>
        Learn More
      </div>
    </div>
  );

  switch (style) {
    case 'split-left':
      return (
        <div 
          className="w-full h-full flex items-center gap-2 p-2"
          style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)` }}
        >
          <div className="flex-1 flex flex-col items-start gap-1">
            {renderLogo()}
            {renderBadge()}
            <div className="text-[7px] font-bold text-zinc-900 truncate max-w-full">{productName}</div>
            <div className="w-full h-1 bg-zinc-300 rounded" />
            <div className="flex gap-0.5">
              <div className="px-1 py-0.5 rounded text-[5px] font-medium text-white" style={{ backgroundColor: primaryColor }}>
                Get Started
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 opacity-70 shrink-0" />
        </div>
      );
    case 'split-right':
      return (
        <div 
          className="w-full h-full flex items-center gap-2 p-2"
          style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)` }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 opacity-70 shrink-0" />
          <div className="flex-1 flex flex-col items-end gap-1 text-right">
            {renderLogo()}
            {renderBadge()}
            <div className="text-[7px] font-bold text-zinc-900 truncate max-w-full">{productName}</div>
            <div className="w-full h-1 bg-zinc-300 rounded" />
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-white">
          <div className="text-[9px] font-bold text-zinc-900 mb-1">{productName}</div>
          <div className="w-16 h-1 bg-zinc-200 rounded mb-2" />
          {renderCTA()}
        </div>
      );
    case 'gradient':
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%)` }}
        >
          {renderLogo()}
          <div className="mt-1">{renderBadge(true)}</div>
          <div className="text-[8px] font-bold text-white mt-1">{productName}</div>
          <div className="w-12 h-0.5 bg-white/40 rounded my-1" />
          {renderCTA(true)}
        </div>
      );
    case 'bold':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-zinc-900 text-center">
          <div 
            className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
            style={{ backgroundColor: primaryColor }}
          >
            {selectedIcon}
          </div>
          <div className="mt-1">{renderBadge(true)}</div>
          <div className="text-[8px] font-bold text-white mt-1">{productName}</div>
          <div className="w-12 h-0.5 bg-zinc-600 rounded my-1" />
          {renderCTA(true)}
        </div>
      );
    case 'centered':
    default:
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` }}
        >
          {renderLogo()}
          <div className="mt-1">{renderBadge()}</div>
          <div className="text-[8px] font-bold text-zinc-900 mt-1">{productName}</div>
          <div className="w-12 h-0.5 bg-zinc-300 rounded my-1" />
          {renderCTA()}
        </div>
      );
  }
}

export function StyleSection({ app, license, selectedStyle, onStyleChange }: StyleSectionProps) {
  const primaryColor = license?.brandSettings?.primaryColor || '#10b981';
  const productName = license?.brandSettings?.appName || app.name;
  const logoUrl = license?.brandSettings?.logo;
  const selectedIcon = license?.brandSettings?.icon || '🚀';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Page Style</h2>
        <p className="text-muted-foreground mt-1">
          Choose a visual style for your landing page. This affects how your hero section and overall page looks.
        </p>
      </div>

      {/* Style Grid */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Choose Your Style</Label>
        <div className="grid grid-cols-2 gap-4">
          {styleOptions.map((option) => {
            const isSelected = selectedStyle === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => onStyleChange(option.id)}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden transition-all text-left group",
                  isSelected 
                    ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                {/* Mini Preview */}
                <div className="h-24 bg-background">
                  <MiniPreview 
                    style={option.id}
                    primaryColor={primaryColor}
                    productName={productName}
                    logoUrl={logoUrl}
                    selectedIcon={selectedIcon}
                  />
                </div>
                
                {/* Label */}
                <div className="p-3 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{option.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Note */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Your selected style will be reflected in the live preview. 
          The style affects your hero section layout and overall page aesthetic.
        </p>
      </div>
    </div>
  );
}
