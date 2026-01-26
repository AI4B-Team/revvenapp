import React, { useState } from 'react';
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
  ChevronDown,
  Play,
  X,
  Rocket,
  Award,
  TrendingUp,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface HeroButton {
  id: string;
  text: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  action: 'link' | 'anchor' | 'video' | 'custom';
  url?: string;
  anchorId?: string;
  videoUrl?: string;
  openInNewTab?: boolean;
}

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
  headline?: string;
  headlineFontSize?: string;
  headlineFontFamily?: string;
  buttons?: HeroButton[];
}

function HeroPreview({ 
  style, 
  badge, 
  tagline, 
  description, 
  productName, 
  primaryColor, 
  logoUrl, 
  selectedIcon, 
  heroImageUrl, 
  appThumbnail,
  headline,
  headlineFontSize = '3xl',
  headlineFontFamily = 'inter',
  buttons = []
}: HeroPreviewProps) {
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
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

  const getButtonStyle = (btn: HeroButton, inverted: boolean) => {
    switch (btn.style) {
      case 'primary':
        return {
          backgroundColor: inverted ? 'white' : primaryColor,
          color: inverted ? primaryColor : 'white',
        };
      case 'secondary':
        return inverted 
          ? { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }
          : { backgroundColor: '#f4f4f5', color: '#3f3f46' };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${inverted ? 'white' : primaryColor}`,
          color: inverted ? 'white' : primaryColor,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: inverted ? 'white' : primaryColor,
        };
      default:
        return {};
    }
  };

  const handleButtonClick = (btn: HeroButton) => {
    if (btn.action === 'video' && btn.videoUrl) {
      setVideoModalUrl(btn.videoUrl);
    } else if (btn.action === 'link' && btn.url) {
      if (btn.openInNewTab) {
        window.open(btn.url, '_blank');
      } else {
        window.location.href = btn.url;
      }
    } else if (btn.action === 'anchor' && btn.anchorId) {
      const element = document.getElementById(btn.anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const defaultButtons: HeroButton[] = [
    { id: '1', text: 'Get Started', style: 'primary', action: 'anchor', anchorId: 'pricing' },
    { id: '2', text: 'Learn More', style: 'secondary', action: 'anchor', anchorId: 'features' },
  ];

  const displayButtons = buttons.length > 0 ? buttons : defaultButtons;

  const renderCTAButtons = (inverted = false) => (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
      {displayButtons.map((btn) => (
        <button 
          key={btn.id}
          onClick={() => handleButtonClick(btn)}
          className="px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={getButtonStyle(btn, inverted)}
        >
          {btn.action === 'video' && <Play size={16} />}
          {btn.text}
          {btn.action === 'link' && btn.style === 'primary' && <ArrowRight size={16} />}
        </button>
      ))}
    </div>
  );

  // Get font size class based on setting
  const getFontSizeClass = () => {
    const sizeMap: Record<string, string> = {
      'md': 'text-lg md:text-xl',
      'lg': 'text-xl md:text-2xl',
      'xl': 'text-2xl md:text-3xl',
      '2xl': 'text-3xl md:text-4xl',
      '3xl': 'text-4xl md:text-5xl',
      '4xl': 'text-5xl md:text-6xl',
    };
    return sizeMap[headlineFontSize] || sizeMap['3xl'];
  };

  // Get font family style
  const getFontFamilyStyle = (): React.CSSProperties => {
    const fontMap: Record<string, string> = {
      'inter': 'Inter, system-ui, sans-serif',
      'georgia': 'Georgia, serif',
      'helvetica': 'Helvetica, Arial, sans-serif',
      'playfair': '"Playfair Display", serif',
      'roboto': 'Roboto, sans-serif',
      'montserrat': 'Montserrat, sans-serif',
    };
    return { fontFamily: fontMap[headlineFontFamily] || fontMap['inter'] };
  };

  // Render headline with rich text HTML support
  const renderHeadline = (defaultColor: string = 'text-zinc-900') => {
    const displayText = headline || productName;
    const fontSizeClass = getFontSizeClass();
    const isRichText = displayText.includes('<');
    
    return (
      <h1 
        className={`${fontSizeClass} font-bold mb-4 ${defaultColor}`}
        style={getFontFamilyStyle()}
        {...(isRichText ? { dangerouslySetInnerHTML: { __html: displayText } } : {})}
      >
        {!isRichText ? displayText : null}
      </h1>
    );
  };

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

  // Video Modal
  const videoModal = videoModalUrl ? (
    <Dialog open={!!videoModalUrl} onOpenChange={() => setVideoModalUrl(null)}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="relative aspect-video bg-black">
          <iframe
            src={videoModalUrl.includes('youtube') 
              ? videoModalUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
              : videoModalUrl.includes('vimeo') 
                ? videoModalUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
                : videoModalUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  ) : null;

  const getContent = () => {
    switch (style) {
      case 'split-left':
        return (
          <div 
            className="px-8 py-16 flex items-center gap-8"
            style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}05 100%)` }}
          >
            <div className="flex-1 text-left">
              <div className="mb-4">{renderBadge()}</div>
              {renderHeadline('text-zinc-900')}
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
              <div className="mb-4">{renderBadge()}</div>
              {renderHeadline('text-zinc-900')}
              <p className="text-lg text-zinc-600 mb-6 max-w-md ml-auto">{tagline}</p>
              {description && <p className="text-sm text-zinc-500 mb-6 ml-auto">{description}</p>}
              <div className="flex justify-end">{renderCTAButtons()}</div>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="px-8 py-24 text-center bg-white">
            {renderHeadline('text-zinc-900')}
            <p className="text-xl text-zinc-500 mb-4 max-w-lg mx-auto">{tagline}</p>
            {description && <p className="text-sm text-zinc-400 mb-10 max-w-lg mx-auto">{description}</p>}
            {renderCTAButtons()}
          </div>
        );
      case 'gradient':
        return (
          <div 
            className="px-8 py-16 text-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%)` }}
          >
            <div className="mb-4">{renderBadge(true)}</div>
            {renderHeadline('text-white')}
            <p className="text-lg text-white/80 mb-4 max-w-md mx-auto">{tagline}</p>
            {description && <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">{description}</p>}
            {renderCTAButtons(true)}
          </div>
        );
      case 'bold':
        return (
          <div className="px-8 py-16 text-center bg-zinc-900">
            <div className="mb-4">{renderBadge(true)}</div>
            {renderHeadline('text-white')}
            <p className="text-lg text-zinc-400 mb-4 max-w-md mx-auto">{tagline}</p>
            {description && <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">{description}</p>}
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
            <div className="mb-4">{renderBadge()}</div>
            {renderHeadline('text-zinc-900')}
            <p className="text-lg text-zinc-600 mb-8 max-w-md mx-auto">{tagline}</p>
            {renderCTAButtons()}
          </div>
        );
    }
  };

  return (
    <>
      {getContent()}
      {videoModal}
    </>
  );
}

// Pricing Section (without Order Bumps - those are on checkout only)
interface PricingSectionProps {
  section: PageBlock;
  pricingModel: 'monthly' | 'one-time' | 'both' | undefined;
  setupFee: number;
  monthlyPrice: number;
  oneTimePrice: number;
  primaryColor: string;
  getAppFeatures: () => string[];
}

function PricingSection({
  section,
  pricingModel,
  setupFee,
  monthlyPrice,
  oneTimePrice,
  primaryColor,
  getAppFeatures,
}: PricingSectionProps) {
  const basePrice = pricingModel === 'one-time' ? oneTimePrice : monthlyPrice;
  
  return (
    <div className="px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
          {section.content?.headline || 'Simple, Transparent Pricing'}
        </h2>
        <p className="text-zinc-500 text-center mb-8">
          {section.content?.subheadline || 'Start today and see results immediately'}
        </p>
        <div className="max-w-md mx-auto space-y-4">
          {/* Main Price Card */}
          <div className="bg-white rounded-2xl border-2 p-6 text-center" style={{ borderColor: primaryColor }}>
            <div className="text-sm font-medium mb-2" style={{ color: primaryColor }}>
              {pricingModel === 'one-time' ? 'One-Time Payment' : pricingModel === 'both' ? 'Setup + Monthly' : 'Monthly'}
            </div>
            
            {/* Setup Fee Display */}
            {pricingModel === 'both' && setupFee > 0 && (
              <div className="mb-3 pb-3 border-b border-zinc-100">
                <div className="text-sm text-zinc-500">One-Time Setup</div>
                <div className="text-2xl font-bold text-zinc-900">${setupFee}</div>
              </div>
            )}
            
            {/* Main Price Display */}
            <div className="text-4xl font-bold text-zinc-900 mb-4">
              ${basePrice.toFixed(0)}
              {pricingModel !== 'one-time' && (
                <span className="text-lg font-normal text-zinc-500">/mo</span>
              )}
            </div>
            <ul className="text-left space-y-3 mb-6">
              {getAppFeatures().map((item, idx) => (
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
      </div>
    </div>
  );
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
  const brandBadge = license?.brandSettings?.badge || '';
  const brandHeadline = license?.brandSettings?.headline || '';
  const brandTagline = license?.brandSettings?.tagline || 'Transform Your Business Today';
  const brandDescription = license?.brandSettings?.description || '';
  const selectedIcon = license?.brandSettings?.icon || '🚀';
  const logoUrl = license?.brandSettings?.logo;

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Live Preview</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
            Auto-Sync
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
                            <p className="text-xs text-zinc-500">
                              {license?.pricingSettings?.pricingModel === 'one-time' ? 'One-Time Payment' : 'Monthly Subscription'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* Discount Badge */}
                          {checkoutConfig?.enableConversionBooster !== false && (
                            <span className="inline-block px-2.5 py-1 mb-2 text-xs font-bold text-white bg-zinc-900 rounded-full">
                              {checkoutConfig?.discountPercent || 15}% off
                            </span>
                          )}
                          {/* Pricing Display */}
                          <div className="flex items-baseline justify-end gap-2">
                            {checkoutConfig?.enableConversionBooster !== false && (
                              <span className="text-base text-zinc-400 line-through font-medium">
                                ${license?.pricingSettings?.monthlyPrice || license?.pricingSettings?.oneTimePrice || '97'}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-zinc-900">
                              ${checkoutConfig?.enableConversionBooster !== false 
                                ? Math.round((license?.pricingSettings?.monthlyPrice || license?.pricingSettings?.oneTimePrice || 97) * (1 - (checkoutConfig?.discountPercent || 15) / 100))
                                : (license?.pricingSettings?.monthlyPrice || license?.pricingSettings?.oneTimePrice || '97')
                              }
                            </span>
                            {license?.pricingSettings?.pricingModel !== 'one-time' && (
                              <span className="text-sm text-zinc-500">/mo</span>
                            )}
                          </div>
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
              /* Sales Page Preview - Render sections in order */
              <>
                {/* Sticky Header with Logo, Site Name, and Auth Buttons */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
                  <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${primaryColor}15` }}
                        >
                          {selectedIcon}
                        </div>
                      )}
                      <span className="font-semibold text-zinc-900">{productName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                        Login
                      </button>
                      <button 
                        className="text-sm font-medium px-4 py-1.5 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>

                {pageSections.map((section) => {
                  if (!section.enabled) return null;
                  
                  switch (section.id) {
                    case 'hero':
                        return (
                          <HeroPreview 
                            key={section.id}
                            style={pageStyle}
                            badge={brandBadge || section.content?.badge || 'AI-Powered'}
                            tagline={brandTagline || section.content?.tagline || 'Transform Your Business Today'}
                            description={brandDescription || section.content?.description}
                            productName={productName}
                            primaryColor={primaryColor}
                            logoUrl={logoUrl}
                            selectedIcon={selectedIcon}
                            heroImageUrl={section.content?.heroImageUrl}
                            appThumbnail={app ? getAppThumbnail(app.name) : undefined}
                            headline={brandHeadline || section.content?.headline}
                            headlineFontSize={section.content?.headlineFontSize}
                            headlineFontFamily={section.content?.headlineFontFamily}
                            buttons={section.content?.buttons}
                          />
                        );
                    
                    case 'credibility':
                      const logos = section.content?.logos || [];
                      const headline = section.content?.headline || 'Trusted By Industry Leaders';
                      if (logos.length === 0) return null;
                      const duplicatedLogos = [...logos, ...logos, ...logos];
                      return (
                        <div key={section.id} className="py-12 overflow-hidden bg-zinc-50/50">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-xl font-semibold text-zinc-600 text-center mb-8">
                              {headline}
                            </h2>
                            <div className="relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-50/50 to-transparent z-10" />
                              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-50/50 to-transparent z-10" />
                              <div 
                                className="flex items-center gap-12 animate-scroll-left"
                                style={{ width: 'fit-content' }}
                              >
                                {duplicatedLogos.map((logo: { id: string; url: string; name: string }, idx: number) => (
                                  <div 
                                    key={`${logo.id}-${idx}`} 
                                    className="flex-shrink-0 h-10 w-28 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                  >
                                    <img 
                                      src={logo.url} 
                                      alt={logo.name || 'Company logo'} 
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    
                    case 'features':
                      return (
                        <div key={section.id} className="px-6 md:px-12 lg:px-16 py-12 bg-zinc-50">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                              {section.content?.headline || 'Why Choose Us'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(section.content?.features || [
                                { title: 'Lightning Fast', description: 'Get results in seconds' },
                                { title: 'Secure & Private', description: 'Your data is protected' },
                                { title: 'Premium Quality', description: 'Best-in-class results' },
                              ]).slice(0, 3).map((feature: any, idx: number) => {
                                const defaultIcons = [Zap, Shield, Award];
                                const IconComponent = defaultIcons[idx] || Zap;
                                return (
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
                                        <IconComponent size={20} />
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-600">{feature.description || feature.desc}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    
                    case 'capabilities':
                      return (
                        <div key={section.id} className="px-6 md:px-12 lg:px-16 py-12">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                              {section.content?.headline || 'What We Offer'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(section.content?.cards || [
                                { title: 'Automation', description: 'Automate repetitive tasks', icon: '⚡' },
                                { title: 'Analytics', description: 'Get real-time insights', icon: '📊' },
                                { title: 'Collaboration', description: 'Work seamlessly with your team', icon: '👥' },
                              ]).map((card: any, idx: number) => {
                                const defaultIcons = [Rocket, BarChart3, Users];
                                const IconComponent = defaultIcons[idx] || Settings;
                                return (
                                  <div key={idx} className="bg-zinc-50 rounded-xl p-6 text-center">
                                    <div 
                                      className="w-10 h-10 rounded-lg mx-auto mb-4 flex items-center justify-center"
                                      style={{ backgroundColor: card.iconUrl ? 'transparent' : `${primaryColor}15`, color: primaryColor }}
                                    >
                                      {card.iconUrl ? (
                                        <img src={card.iconUrl} alt="" className="w-full h-full object-contain" />
                                      ) : card.icon ? (
                                        <span className="text-xl">{card.icon}</span>
                                      ) : (
                                        <IconComponent size={20} />
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 mb-2">{card.title}</h3>
                                    <p className="text-sm text-zinc-600">{card.description}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    
                    case 'testimonials':
                      return (
                        <div key={section.id} className="px-6 md:px-12 lg:px-16 py-12 bg-zinc-50">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                              What Our Customers Say
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(section.content?.testimonials || [
                                { name: 'Sarah J.', role: 'Marketing Director', quote: 'This platform transformed our workflow.' },
                                { name: 'Michael C.', role: 'Founder', quote: 'Best investment we made this year.' },
                                { name: 'Emily R.', role: 'Operations Manager', quote: 'Incredible support and product.' },
                              ]).slice(0, 3).map((testimonial: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm flex flex-col">
                                  {testimonial.screenshotUrl && (
                                    <div className="mb-4 -mx-2 -mt-2">
                                      <img 
                                        src={testimonial.screenshotUrl} 
                                        alt="Testimonial screenshot" 
                                        className="w-full rounded-lg object-cover max-h-48"
                                      />
                                    </div>
                                  )}
                                  {testimonial.quote && (
                                    <p className="text-zinc-600 text-sm mb-4 flex-1">"{testimonial.quote}"</p>
                                  )}
                                  {testimonial.name && (
                                    <div className="flex items-center gap-3 mt-auto">
                                      {testimonial.avatarUrl && (
                                        <img 
                                          src={testimonial.avatarUrl} 
                                          alt={testimonial.name}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium text-zinc-900">{testimonial.name}</p>
                                        {testimonial.role && <p className="text-xs text-zinc-500">{testimonial.role}{testimonial.company && `, ${testimonial.company}`}</p>}
                                      </div>
                                    </div>
                                  )}
                                  {!testimonial.name && !testimonial.quote && testimonial.screenshotUrl && (
                                    <p className="text-xs text-zinc-400 text-center">Customer Testimonial</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    
                    case 'pricing':
                      const pricingModel = license?.pricingSettings?.pricingModel;
                      const setupFee = license?.pricingSettings?.setupFee || 0;
                      const monthlyPrice = license?.pricingSettings?.monthlyPrice || 97;
                      const oneTimePrice = license?.pricingSettings?.oneTimePrice || 297;
                      const orderBumps = checkoutConfig?.orderBumps?.filter(b => b.enabled) || [];
                      
                      // Generate compelling app-specific features
                      const getAppFeatures = () => {
                        const appName = app?.name?.toLowerCase() || '';
                        const features = {
                          'digital influencer': [
                            'Unlimited AI Content Generation',
                            'Advanced Audience Analytics',
                            'Multi-Platform Scheduling',
                            'Viral Content Templates',
                          ],
                          'creator vault': [
                            'Unlimited Asset Storage',
                            'Advanced Organization Tools',
                            'Quick-Access Collections',
                            'Secure Cloud Backup',
                          ],
                          'master closer': [
                            'AI-Powered Sales Scripts',
                            'Objection Handler Library',
                            'Deal Pipeline Tracking',
                            'Performance Analytics',
                          ],
                          'viral shorts': [
                            'AI Video Generation',
                            'Trending Template Library',
                            'Auto-Caption & Effects',
                            'Multi-Platform Export',
                          ],
                          'ghost ink': [
                            'AI Writing Assistant',
                            'SEO Optimization Tools',
                            'Plagiarism Checker',
                            'Unlimited Word Count',
                          ],
                          default: [
                            'Unlimited Access To All Features',
                            'Priority Customer Support',
                            'Regular Feature Updates',
                            'Cancel Anytime, No Questions',
                          ],
                        };
                        return features[appName] || features.default;
                      };
                      
                      return (
                        <PricingSection
                          key={section.id}
                          section={section}
                          pricingModel={pricingModel}
                          setupFee={setupFee}
                          monthlyPrice={monthlyPrice}
                          oneTimePrice={oneTimePrice}
                          primaryColor={primaryColor}
                          getAppFeatures={getAppFeatures}
                        />
                      );
                    
                    case 'faq':
                      return (
                        <div key={section.id} className="px-6 md:px-12 lg:px-16 py-12 bg-zinc-50">
                          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                            Frequently Asked Questions
                          </h2>
                          <div className="max-w-3xl mx-auto">
                            <Accordion type="single" collapsible className="space-y-3">
                              {(section.content?.questions || [
                                { q: 'How quickly can I get started?', a: 'You can be up and running in less than 5 minutes.' },
                                { q: 'Is there a free trial?', a: 'Yes! We offer a 14-day free trial with full access.' },
                                { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel anytime with no questions asked.' },
                              ]).map((faq: any, idx: number) => (
                                <AccordionItem 
                                  key={idx} 
                                  value={`faq-${idx}`} 
                                  className="bg-white rounded-xl shadow-sm border-none overflow-hidden"
                                >
                                  <AccordionTrigger className="px-5 py-4 text-left font-medium text-zinc-900 hover:no-underline hover:bg-zinc-50 transition-colors">
                                    {faq.q}
                                  </AccordionTrigger>
                                  <AccordionContent className="px-5 pb-4 text-sm text-zinc-600">
                                    {faq.a}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                      );
                    
                    case 'cta':
                      return (
                        <div 
                          key={section.id}
                          className="px-6 md:px-12 lg:px-16 py-16 text-center"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` }}
                        >
                          <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
                              {section.content?.headline || 'Ready to Transform Your Business?'}
                            </h2>
                            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
                              {section.content?.subheadline || 'Join thousands of successful businesses already using our platform'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <button 
                                className="px-8 py-3 rounded-lg font-medium text-white"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {section.content?.buttonText || 'Start Your Free Trial'}
                              </button>
                              <button className="px-8 py-3 rounded-lg font-medium text-zinc-700 bg-white border border-zinc-200">
                                {section.content?.secondaryButtonText || 'Schedule a Demo'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    
                    case 'footer':
                      const footerContent = section.content || {};
                      const showSocialLinks = footerContent.showSocialLinks;
                      const showNewsletter = footerContent.showNewsletter;
                      const socialLinks = footerContent.socialLinks || {};
                      const companyName = footerContent.companyName || productName;
                      const footerTagline = footerContent.tagline || 'Empowering businesses with AI';
                      
                      return (
                        <div key={section.id} className="px-6 md:px-12 lg:px-16 py-10 bg-zinc-900">
                          <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
                                      placeholder={footerContent.newsletterPlaceholder || 'Enter your email'}
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
                              
                              {showSocialLinks && (
                                <div className="text-left md:text-right">
                                  <h4 className="font-semibold text-white mb-3">Follow Us</h4>
                                  <div className="flex gap-3 md:justify-end flex-wrap">
                                    {(() => {
                                      const enabledLinks = Object.entries(socialLinks).filter(
                                        ([_, link]: [string, any]) => link?.enabled && link?.url
                                      );
                                      
                                      if (enabledLinks.length === 0) {
                                        // Show placeholder icons when no social links configured
                                        return (
                                          <>
                                            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                              <XIcon className="w-4 h-4" variant="mono" />
                                            </div>
                                            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                              <InstagramIcon className="w-4 h-4" variant="mono" />
                                            </div>
                                          </>
                                        );
                                      }
                                      
                                      const iconMap: Record<string, React.FC<any>> = {
                                        facebook: FacebookIcon,
                                        instagram: InstagramIcon,
                                        x: XIcon,
                                        tiktok: TikTokIcon,
                                        youtube: YouTubeIcon,
                                        linkedin: LinkedInIcon,
                                        pinterest: PinterestIcon,
                                        snapchat: SnapchatIcon,
                                        bluesky: BlueskyIcon,
                                        threads: ThreadsIcon,
                                        reddit: RedditIcon,
                                      };
                                      
                                      return enabledLinks.map(([platform, link]: [string, any]) => {
                                        const IconComponent = iconMap[platform];
                                        if (!IconComponent) return null;
                                        
                                        return (
                                          <a 
                                            key={platform}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                          >
                                            <IconComponent className="w-4 h-4" variant="mono" />
                                          </a>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-6">
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
                              <p className="text-zinc-500 text-sm text-center">
                                © {footerContent.copyrightYear || new Date().getFullYear()} {companyName}. All rights reserved.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    
                    default:
                      return null;
                  }
                })}
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
