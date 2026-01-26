import React from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { 
  Maximize2, 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  ExternalLink,
  Check,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Clock,
  CreditCard,
  Lock,
  ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CheckoutConfig } from './sections/CheckoutSection';
import { getAppThumbnail } from '@/utils/appThumbnails';

interface LegalDocument {
  id: string;
  title: string;
  enabled: boolean;
}

interface PageBlock {
  id: string;
  type: string;
  enabled: boolean;
  title: string;
  content: Record<string, any>;
}

interface LivePreviewProps {
  app?: MarketplaceApp;
  license?: AppLicense;
  activeSection: string;
  checkoutConfig?: CheckoutConfig;
  legalDocs?: LegalDocument[];
  pageSections?: PageBlock[];
  pageStyle?: 'centered' | 'split-left' | 'split-right' | 'minimal' | 'gradient' | 'bold';
}

// Hero Preview Component with style variations
type HeroStyle = 'centered' | 'split-left' | 'split-right' | 'minimal' | 'gradient' | 'bold';

interface HeroPreviewProps {
  style: HeroStyle;
  badge: string;
  tagline: string;
  description?: string;
  productName: string;
  primaryColor: string;
  logoUrl?: string;
  selectedIcon: string;
  heroImageUrl?: string;
  appThumbnail?: string;
}

function HeroPreview({ style, badge, tagline, description, productName, primaryColor, logoUrl, selectedIcon, heroImageUrl, appThumbnail }: HeroPreviewProps) {
  const renderLogo = () => (
    logoUrl ? (
      <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
    ) : (
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        {selectedIcon}
      </div>
    )
  );

  const renderBadge = (inverted = false) => (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: inverted ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`, 
        color: inverted ? 'white' : primaryColor 
      }}
    >
      <Zap size={12} />
      {badge}
    </div>
  );

  const renderCTAButtons = (inverted = false) => (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button 
        className="px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        style={{ 
          backgroundColor: inverted ? 'white' : primaryColor,
          color: inverted ? primaryColor : 'white'
        }}
      >
        Get Started <ArrowRight size={16} />
      </button>
      <button 
        className={`px-6 py-3 rounded-lg font-medium ${
          inverted ? 'bg-white/10 text-white hover:bg-white/20' : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200'
        }`}
      >
        Learn More
      </button>
    </div>
  );

  // Render hero visual element (custom image, app thumbnail, or gradient fallback)
  const renderHeroVisual = (size: 'sm' | 'lg' = 'lg') => {
    const sizeClass = size === 'lg' ? 'w-32 h-32' : 'w-24 h-24';
    
    if (heroImageUrl) {
      return (
        <div className={`${sizeClass} rounded-2xl overflow-hidden shadow-lg shrink-0`}>
          <img src={heroImageUrl} alt="Hero visual" className="w-full h-full object-cover" />
        </div>
      );
    }
    
    if (appThumbnail) {
      return (
        <div className={`${sizeClass} rounded-2xl overflow-hidden shadow-lg shrink-0 bg-white`}>
          <img src={appThumbnail} alt="App visual" className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Fallback gradient
    return (
      <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 opacity-70 shrink-0`} />
    );
  };

  switch (style) {
    case 'split-left':
      return (
        <div 
          className="px-8 py-16 flex items-center gap-8"
          style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)` }}
        >
          <div className="flex-1 text-left">
            <div className="mb-4">{renderLogo()}</div>
            <div className="mb-4">{renderBadge()}</div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-3">{productName}</h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-md">{tagline}</p>
            {description && <p className="text-sm text-zinc-500 mb-6">{description}</p>}
            {renderCTAButtons()}
          </div>
          {renderHeroVisual('lg')}
        </div>
      );
    case 'split-right':
      return (
        <div 
          className="px-8 py-16 flex items-center gap-8"
          style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)` }}
        >
          {renderHeroVisual('lg')}
          <div className="flex-1 text-right">
            <div className="mb-4 flex justify-end">{renderLogo()}</div>
            <div className="mb-4">{renderBadge()}</div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-3">{productName}</h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-md ml-auto">{tagline}</p>
            <div className="flex justify-end">{renderCTAButtons()}</div>
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="px-8 py-24 text-center bg-white">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">{productName}</h1>
          <p className="text-xl text-zinc-500 mb-10 max-w-lg mx-auto">{tagline}</p>
          {renderCTAButtons()}
        </div>
      );
    case 'gradient':
      return (
        <div 
          className="px-8 py-16 text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%)` }}
        >
          <div className="mb-6 flex justify-center">{renderLogo()}</div>
          <div className="mb-4">{renderBadge(true)}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{productName}</h1>
          <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">{tagline}</p>
          {renderCTAButtons(true)}
        </div>
      );
    case 'bold':
      return (
        <div className="px-8 py-16 text-center bg-zinc-900">
          <div className="mb-6 flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                {selectedIcon}
              </div>
            )}
          </div>
          <div className="mb-4">{renderBadge(true)}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{productName}</h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">{tagline}</p>
          {renderCTAButtons(true)}
        </div>
      );
    case 'centered':
    default:
      return (
        <div 
          className="px-8 py-16 text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` }}
        >
          <div className="mb-6 flex justify-center">{renderLogo()}</div>
          <div className="mb-4">{renderBadge()}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{productName}</h1>
          <p className="text-lg text-zinc-600 mb-8 max-w-md mx-auto">{tagline}</p>
          {renderCTAButtons()}
        </div>
      );
  }
}

export function LivePreview({ app, license, activeSection, checkoutConfig, legalDocs = [], pageSections = [], pageStyle = 'centered' }: LivePreviewProps) {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && previewRef.current) {
      previewRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleOpenInNewTab = () => {
    const subdomain = license?.domainSettings?.subdomain || 'preview';
    // Open in a new window with the preview URL
    const previewUrl = `https://${subdomain}.revven.app`;
    window.open(previewUrl, '_blank');
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getPreviewWidth = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  // Get brand colors from license or use defaults
  const primaryColor = license?.brandSettings?.primaryColor || '#10b981';
  const productName = license?.brandSettings?.appName || app?.name || 'Your Product';
  const tagline = license?.brandSettings?.tagline || 'Transform Your Business Today';
  const selectedIcon = license?.brandSettings?.icon || '🚀';
  const logoUrl = license?.brandSettings?.logo;

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Live Preview</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
            Auto-sync
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Device Toggle */}
          <TooltipProvider>
            <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Desktop View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('tablet')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'tablet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Tablet size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Tablet View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Mobile View</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleFullscreen}
                >
                  <Maximize2 size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open In New Tab</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Preview Content */}
      <div ref={previewRef} className="flex-1 overflow-auto p-4">
        <div className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}>
          {/* Browser Chrome */}
          <div className="rounded-t-lg bg-zinc-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-300 truncate">
                {license?.domainSettings?.subdomain || 'your-brand'}.revven.app
              </div>
            </div>
          </div>

          {/* Page Preview */}
          <div className="bg-white rounded-b-lg shadow-2xl overflow-hidden min-h-[600px]">
            {activeSection === 'checkout' ? (
              /* Dedicated Checkout Page Preview - Unique Design */
              <div className="min-h-[600px] bg-gradient-to-br from-zinc-50 to-zinc-100">
                {/* Checkout Header */}
                <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-emerald-100">
                        {selectedIcon}
                      </div>
                    )}
                    <span className="font-semibold text-zinc-900">{productName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Lock size={12} />
                    <span>Secure Checkout</span>
                  </div>
                </div>

                {/* Countdown Timer Banner - Only show if urgency timer enabled */}
                {checkoutConfig?.enableUrgencyTimer !== false && checkoutConfig?.enableConversionBooster !== false && (
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 flex items-center justify-center gap-3">
                    <Clock size={16} className="text-white" />
                    <span className="text-white font-medium text-sm">Special Offer Expires In:</span>
                    <div className="flex items-center gap-1">
                      {['14', '59', '32'].map((time, idx) => (
                        <React.Fragment key={idx}>
                          <span className="bg-white/20 text-white font-bold px-2 py-1 rounded text-sm">
                            {time}
                          </span>
                          {idx < 2 && <span className="text-white/80">:</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Checkout Content */}
                <div className="p-6 max-w-2xl mx-auto">
                  {/* Discount Applied Banner - Only show if conversion booster enabled */}
                  {checkoutConfig?.enableConversionBooster !== false && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Zap size={24} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-emerald-700 font-medium">Discount Applied!</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {checkoutConfig?.discountPercent || 15}% OFF For {checkoutConfig?.discountDuration || 3} Month{(checkoutConfig?.discountDuration || 3) > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Check size={24} className="text-emerald-500" />
                      </div>
                    </div>
                  )}

                  {/* Order Summary Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                    <div className="p-5 border-b border-zinc-100">
                      <h3 className="font-bold text-zinc-900 mb-1">Order Summary</h3>
                      <p className="text-sm text-zinc-500">Complete your purchase to get started</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Zap size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">Pro Plan</p>
                            <p className="text-xs text-zinc-500">Monthly Subscription</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-400 line-through">${license?.pricingSettings?.monthlyPrice || '97'}/mo</p>
                          <p className="font-bold text-emerald-600">
                            ${Math.round((license?.pricingSettings?.monthlyPrice || 97) * (1 - (checkoutConfig?.discountPercent || 15) / 100))}/mo
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 py-3 border-t border-zinc-100">
                        {['Unlimited AI Usage', 'Priority Support', `${checkoutConfig?.guaranteeDays || 14}-Day Money-Back Guarantee`].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-zinc-600">
                            <Check size={14} className="text-emerald-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Form Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                    <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-zinc-600" />
                        <h3 className="font-bold text-zinc-900">Payment Details</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Shield size={12} />
                        Powered by Stripe
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Card Number</label>
                        <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400 flex items-center justify-between">
                          <span>1234 5678 9012 3456</span>
                          <div className="flex gap-1">
                            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded" />
                            <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Expiry</label>
                          <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
                            MM / YY
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-600 mb-1.5 block">CVC</label>
                          <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
                            •••
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Name On Card</label>
                        <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
                          John Doe
                        </div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="p-5 pt-0">
                      <button className="w-full py-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-lg">
                        <Lock size={18} />
                        Complete Purchase
                      </button>
                    </div>
                  </div>

                  {/* Guarantee & Trust */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Money-Back Guarantee */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-white rounded uppercase">
                          Guarantee
                        </span>
                      </div>
                      <p className="font-semibold text-zinc-900 text-sm mb-1">{checkoutConfig?.guaranteeDays || 14}-Day Money-Back</p>
                      <p className="text-xs text-zinc-600">{checkoutConfig?.guaranteeDescription || 'Try It Risk-Free'}</p>
                    </div>
                    
                    {/* Instant Access */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded uppercase">
                          Instant
                        </span>
                      </div>
                      <p className="font-semibold text-zinc-900 text-sm mb-1">Immediate Access</p>
                      <p className="text-xs text-zinc-600">Start In 2 Minutes</p>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex justify-center gap-6 mb-6">
                    {[
                      { label: '256-bit SSL', sub: 'Encrypted' },
                      { label: 'PCI DSS', sub: 'Compliant' },
                      { label: 'Stripe', sub: 'Secured' },
                      { label: 'GDPR', sub: 'Ready' },
                    ].map((badge, idx) => (
                      <div key={idx} className="text-center">
                        <Shield size={18} className="mx-auto mb-1 text-zinc-300" />
                        <p className="text-[10px] font-medium text-zinc-500">{badge.label}</p>
                        <p className="text-[10px] text-zinc-400">{badge.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Checkout FAQs */}
                  <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="p-5 border-b border-zinc-100">
                      <h3 className="font-bold text-zinc-900">Frequently Asked Questions</h3>
                    </div>
                    <div className="px-5 pb-2">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="faq-1" className="border-b border-zinc-100">
                          <AccordionTrigger className="text-left font-medium text-zinc-900 text-sm py-4 hover:no-underline">
                            Will I have access to all AIs?
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-zinc-600 pb-4">
                            Yes! You will have access to the main AIs on the market, all integrated in a single platform for you.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faq-2" className="border-none">
                          <AccordionTrigger className="text-left font-medium text-zinc-900 text-sm py-4 hover:no-underline">
                            Is there a money-back guarantee?
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-zinc-600 pb-4">
                            Absolutely! We offer a {checkoutConfig?.guaranteeDays || 14}-day money-back guarantee with one-click refunds in your dashboard.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Sales Page Preview */
              <>
                {/* Hero Section */}
                {(pageSections.find(s => s.id === 'hero')?.enabled !== false) && (
                  <HeroPreview 
                    style={pageStyle}
                    badge={pageSections.find(s => s.id === 'hero')?.content?.badge || 'AI-Powered'}
                    tagline={pageSections.find(s => s.id === 'hero')?.content?.tagline || tagline}
                    description={pageSections.find(s => s.id === 'hero')?.content?.description}
                    productName={productName}
                    primaryColor={primaryColor}
                    logoUrl={logoUrl}
                    selectedIcon={selectedIcon}
                    heroImageUrl={pageSections.find(s => s.id === 'hero')?.content?.heroImageUrl}
                    appThumbnail={app ? getAppThumbnail(app.name) : undefined}
                  />
                )}

                {/* Features Section */}
                {(pageSections.find(s => s.id === 'features')?.enabled !== false) && (
                  <div className="px-8 py-12 bg-zinc-50">
                    <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                      {pageSections.find(s => s.id === 'features')?.content?.headline || 'Why Choose Us'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(pageSections.find(s => s.id === 'features')?.content?.features || [
                        { title: 'Lightning Fast', description: 'Get results in seconds' },
                        { title: 'Secure & Private', description: 'Your data is protected' },
                        { title: 'Premium Quality', description: 'Best-in-class results' },
                      ]).slice(0, 3).map((feature: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm">
                          <div 
                            className="w-10 h-10 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: feature.iconUrl ? 'transparent' : `${primaryColor}15`, color: primaryColor }}
                          >
                            {feature.iconUrl ? (
                              <img src={feature.iconUrl} alt="" className="w-full h-full object-contain" />
                            ) : feature.icon ? (
                              <span className="text-xl">{feature.icon}</span>
                            ) : (
                              <Zap size={20} />
                            )}
                          </div>
                          <h3 className="font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                          <p className="text-sm text-zinc-600">{feature.description || feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities Section */}
                {(pageSections.find(s => s.id === 'capabilities')?.enabled !== false) && (
                  <div className="px-8 py-12">
                    <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                      {pageSections.find(s => s.id === 'capabilities')?.content?.headline || 'What We Offer'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(pageSections.find(s => s.id === 'capabilities')?.content?.cards || [
                        { title: 'Automation', description: 'Automate repetitive tasks', icon: '⚡' },
                        { title: 'Analytics', description: 'Get real-time insights', icon: '📊' },
                        { title: 'Collaboration', description: 'Work seamlessly with your team', icon: '👥' },
                      ]).map((card: any, idx: number) => (
                        <div key={idx} className="bg-zinc-50 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                            {card.iconUrl ? (
                              <img src={card.iconUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-3xl">{card.icon}</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-zinc-900 mb-2">{card.title}</h3>
                          <p className="text-sm text-zinc-600">{card.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonials Section */}
                {(pageSections.find(s => s.id === 'testimonials')?.enabled !== false) && (
                  <div className="px-8 py-12 bg-zinc-50">
                    <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                      What Our Customers Say
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(pageSections.find(s => s.id === 'testimonials')?.content?.testimonials || [
                        { name: 'Sarah J.', role: 'Marketing Director', quote: 'This platform transformed our workflow.' },
                        { name: 'Michael C.', role: 'Founder', quote: 'Best investment we made this year.' },
                        { name: 'Emily R.', role: 'Operations Manager', quote: 'Incredible support and product.' },
                      ]).slice(0, 3).map((testimonial: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                          <p className="text-zinc-600 text-sm mb-4">"{testimonial.quote}"</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-medium">
                              {testimonial.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900">{testimonial.name}</p>
                              <p className="text-xs text-zinc-500">{testimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Section */}
                {(pageSections.find(s => s.id === 'pricing')?.enabled !== false) && (
                  <div className="px-8 py-12">
                    <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                      {pageSections.find(s => s.id === 'pricing')?.content?.headline || 'Simple Pricing'}
                    </h2>
                    <div className="max-w-sm mx-auto bg-white rounded-2xl border-2 p-6 text-center" style={{ borderColor: primaryColor }}>
                      <div className="text-sm font-medium mb-2" style={{ color: primaryColor }}>
                        {license?.pricingSettings?.pricingModel === 'one-time' ? 'One-Time Payment' : 'Monthly'}
                      </div>
                      <div className="text-4xl font-bold text-zinc-900 mb-4">
                        ${license?.pricingSettings?.monthlyPrice || license?.pricingSettings?.oneTimePrice || '97'}
                        {license?.pricingSettings?.pricingModel !== 'one-time' && (
                          <span className="text-lg font-normal text-zinc-500">/mo</span>
                        )}
                      </div>
                      <ul className="text-left space-y-3 mb-6">
                        {['Full Access', 'Priority Support', 'Regular Updates'].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-zinc-600">
                            <Check size={16} style={{ color: primaryColor }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button 
                        className="w-full py-3 rounded-lg font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Get Started Now
                      </button>
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {(pageSections.find(s => s.id === 'faq')?.enabled !== false) && (
                  <div className="px-8 py-12 bg-zinc-50">
                    <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                      Frequently Asked Questions
                    </h2>
                    <div className="max-w-2xl mx-auto space-y-4">
                      {(pageSections.find(s => s.id === 'faq')?.content?.questions || [
                        { q: 'How quickly can I get started?', a: 'You can be up and running in less than 5 minutes.' },
                        { q: 'Is there a free trial?', a: 'Yes! We offer a 14-day free trial with full access.' },
                        { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel anytime with no questions asked.' },
                      ]).slice(0, 3).map((faq: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="font-medium text-zinc-900 mb-2">{faq.q}</p>
                          <p className="text-sm text-zinc-600">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call To Action Section */}
                {(pageSections.find(s => s.id === 'cta')?.enabled !== false) && (
                  <div 
                    className="px-8 py-16 text-center"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` }}
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
                      {pageSections.find(s => s.id === 'cta')?.content?.headline || 'Ready to Transform Your Business?'}
                    </h2>
                    <p className="text-zinc-600 mb-8 max-w-md mx-auto">
                      {pageSections.find(s => s.id === 'cta')?.content?.subheadline || 'Join thousands of successful businesses already using our platform'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        className="px-8 py-3 rounded-lg font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {pageSections.find(s => s.id === 'cta')?.content?.buttonText || 'Start Your Free Trial'}
                      </button>
                      <button className="px-8 py-3 rounded-lg font-medium text-zinc-700 bg-white border border-zinc-200">
                        {pageSections.find(s => s.id === 'cta')?.content?.secondaryButtonText || 'Schedule a Demo'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                {(pageSections.find(s => s.id === 'footer')?.enabled !== false) && (() => {
                  const footerSection = pageSections.find(s => s.id === 'footer');
                  const footerContent = footerSection?.content || {};
                  const showSocialLinks = footerContent.showSocialLinks;
                  const showNewsletter = footerContent.showNewsletter;
                  const socialLinks = footerContent.socialLinks || {};
                  const companyName = footerContent.companyName || productName;
                  const footerTagline = footerContent.tagline || 'Empowering businesses with AI';
                  
                  return (
                    <div className="px-8 py-10 bg-zinc-900">
                      <div className="max-w-4xl mx-auto">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                          {/* Brand Column */}
                          <div className="text-left">
                            <div className="flex items-center gap-2 mb-3">
                              {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-8 object-contain brightness-0 invert" />
                              ) : (
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {selectedIcon}
                                </div>
                              )}
                              <span className="font-bold text-white">{companyName}</span>
                            </div>
                            <p className="text-zinc-400 text-sm">{footerTagline}</p>
                          </div>
                          
                          {/* Newsletter Column */}
                          {showNewsletter && (
                            <div className="text-left">
                              <h4 className="font-semibold text-white mb-3">
                                {footerContent.newsletterHeadline || 'Stay Updated'}
                              </h4>
                              <p className="text-zinc-400 text-sm mb-3">
                                {footerContent.newsletterDescription || 'Get the latest news and updates'}
                              </p>
                              <div className="flex gap-2">
                                <input 
                                  type="email"
                                  placeholder="Enter your email"
                                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder:text-zinc-500"
                                />
                                <button 
                                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {footerContent.newsletterButtonText || 'Subscribe'}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Social Links Column */}
                          {showSocialLinks && (
                            <div className="text-left md:text-right">
                              <h4 className="font-semibold text-white mb-3">Follow Us</h4>
                              <div className="flex gap-3 md:justify-end">
                                {socialLinks.twitter && (
                                  <a href={socialLinks.twitter} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                  </a>
                                )}
                                {socialLinks.facebook && (
                                  <a href={socialLinks.facebook} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                  </a>
                                )}
                                {socialLinks.instagram && (
                                  <a href={socialLinks.instagram} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                  </a>
                                )}
                                {socialLinks.linkedin && (
                                  <a href={socialLinks.linkedin} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                  </a>
                                )}
                                {socialLinks.youtube && (
                                  <a href={socialLinks.youtube} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                  </a>
                                )}
                                {/* Show placeholder icons if no links configured */}
                                {!socialLinks.twitter && !socialLinks.facebook && !socialLinks.instagram && !socialLinks.linkedin && !socialLinks.youtube && (
                                  <>
                                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-zinc-800 pt-6">
                          {/* Legal Links */}
                          {legalDocs.filter(doc => doc.enabled).length > 0 && (
                            <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
                              {legalDocs.filter(doc => doc.enabled).map((doc) => (
                                <a 
                                  key={doc.id}
                                  href={`#${doc.id}`}
                                  className="text-zinc-400 text-sm hover:text-white transition-colors"
                                >
                                  {doc.title}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          {/* Copyright */}
                          <p className="text-zinc-500 text-sm text-center">
                            © {footerContent.copyrightYear || new Date().getFullYear()} {companyName}. All rights reserved.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 border-t border-border bg-background">
        <p className="text-xs text-muted-foreground text-center">
          Preview Updates Automatically As You Make Changes
        </p>
      </div>
    </div>
  );
}
