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

interface LivePreviewProps {
  app?: MarketplaceApp;
  license?: AppLicense;
  activeSection: string;
  checkoutConfig?: CheckoutConfig;
}

export function LivePreview({ app, license, activeSection, checkoutConfig }: LivePreviewProps) {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize2 size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open In New Tab</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
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

                {/* Countdown Timer Banner */}
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

                {/* Main Checkout Content */}
                <div className="p-6 max-w-2xl mx-auto">
                  {/* Discount Applied Banner */}
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Zap size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Discount Applied!</p>
                          <p className="text-2xl font-bold text-emerald-600">15% OFF For 3 Months</p>
                        </div>
                      </div>
                      <Check size={24} className="text-emerald-500" />
                    </div>
                  </div>

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
                          <p className="font-bold text-emerald-600">${Math.round((license?.pricingSettings?.monthlyPrice || 97) * 0.85)}/mo</p>
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
                <div 
                  className="px-8 py-16 text-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` }}
                >
                  {/* Logo */}
                  <div className="mb-6">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-12 mx-auto object-contain"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        {selectedIcon}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <Zap size={12} />
                    AI-Powered
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                    {productName}
                  </h1>
                  <p className="text-lg text-zinc-600 mb-8 max-w-md mx-auto">
                    {tagline}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      className="px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Get Started <ArrowRight size={16} />
                    </button>
                    <button className="px-6 py-3 rounded-lg font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Features Section */}
                <div className="px-8 py-12 bg-zinc-50">
                  <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                    Why Choose Us
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Zap, title: 'Lightning Fast', desc: 'Get results in seconds' },
                      { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected' },
                      { icon: Star, title: 'Premium Quality', desc: 'Best-in-class results' },
                    ].map((feature, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm">
                        <div 
                          className="w-10 h-10 rounded-lg mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          <feature.icon size={20} />
                        </div>
                        <h3 className="font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-zinc-600">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="px-8 py-12">
                  <h2 className="text-2xl font-bold text-zinc-900 text-center mb-8">
                    Simple Pricing
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

                {/* Footer */}
                <div className="px-8 py-6 bg-zinc-900 text-center">
                  <p className="text-zinc-400 text-sm">
                    © {new Date().getFullYear()} {productName}. All rights reserved.
                  </p>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="px-8 py-6 bg-zinc-900 text-center">
              <p className="text-zinc-400 text-sm">
                © {new Date().getFullYear()} {productName}. All rights reserved.
              </p>
            </div>
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
