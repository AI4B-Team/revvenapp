import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Palette, 
  FileText, 
  DollarSign, 
  CreditCard, 
  Globe, 
  Settings,
  ChevronLeft,
  Sparkles,
  Scale,
  LayoutTemplate
} from 'lucide-react';
import { MarketplaceApp } from '@/lib/marketplace/types';
import { getAppThumbnail } from '@/utils/appThumbnails';

export type WhiteLabelSection = 
  | 'product' 
  | 'branding' 
  | 'style'
  | 'page' 
  | 'pricing' 
  | 'checkout' 
  | 'domain' 
  | 'legal'
  | 'settings';

interface WhiteLabelSidebarProps {
  app: MarketplaceApp;
  activeSection: WhiteLabelSection;
  onSectionChange: (section: WhiteLabelSection) => void;
  onBack: () => void;
}

const sections: { id: WhiteLabelSection; label: string; icon: React.ElementType; number: number }[] = [
  { id: 'product', label: 'Product', icon: Package, number: 1 },
  { id: 'branding', label: 'Branding', icon: Palette, number: 2 },
  { id: 'style', label: 'Style', icon: LayoutTemplate, number: 3 },
  { id: 'page', label: 'Page', icon: FileText, number: 4 },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, number: 5 },
  { id: 'checkout', label: 'Checkout', icon: CreditCard, number: 6 },
  { id: 'domain', label: 'Domain', icon: Globe, number: 7 },
  { id: 'legal', label: 'Legal', icon: Scale, number: 8 },
  { id: 'settings', label: 'Settings', icon: Settings, number: 9 },
];

export function WhiteLabelSidebar({ 
  app, 
  activeSection, 
  onSectionChange, 
  onBack 
}: WhiteLabelSidebarProps) {
  const thumbnail = getAppThumbnail(app.name);

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      {/* Back Button */}
      <div className="p-4 border-b border-border">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back To Apps</span>
        </button>
      </div>

      {/* App Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border overflow-hidden flex-shrink-0">
            {thumbnail ? (
              <img src={thumbnail} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">{app.icon}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{app.name}</h2>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles size={10} />
              <span>White-Label</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Configuration
        </p>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold",
                isActive 
                  ? "bg-emerald-500 text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {section.number}
              </span>
              <Icon size={16} className={isActive ? "text-emerald-500" : ""} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Help */}
      <div className="p-4 border-t border-border">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            Need help setting up your white-label app? Our AI assistant can guide you.
          </p>
        </div>
      </div>
    </div>
  );
}
