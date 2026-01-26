import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { mockMarketplaceWorkspace } from '@/lib/marketplace/data';
import { getCatalogApp } from '@/lib/marketplace/catalog';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  WhiteLabelSidebar, 
  WhiteLabelSection,
  ProductSection,
  BrandingSection,
  StyleSection,
  PageSection,
  PricingSection,
  CheckoutSection,
  DomainSection,
  MarketingSection,
  LegalSection,
  SettingsSection,
  LivePreview,
  LicenseActivation
} from '@/components/whitelabel';
import type { CheckoutConfig } from '@/components/whitelabel/sections/CheckoutSection';
import type { PageBlock } from '@/components/whitelabel/sections/PageSection';
import type { PageStyle } from '@/components/whitelabel/sections/StyleSection';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

// Generate default page sections
const getDefaultPageSections = (appName: string, tagline: string, description: string): PageBlock[] => [
  { 
    id: 'hero', 
    type: 'hero', 
    enabled: true, 
    title: 'Hero Section', 
    content: { 
      badge: 'AI-Powered', 
      tagline: tagline,
      description: description,
      style: 'centered' // default style
    } 
  },
  { 
    id: 'features', 
    type: 'features', 
    enabled: true, 
    title: 'Features Section', 
    content: { 
      features: [
        { title: 'Smart AI Technology', description: 'Leverage cutting-edge artificial intelligence to automate and optimize your workflow' },
        { title: 'Built For You', description: 'Every feature is designed with your specific business needs in mind' },
        { title: 'Easy Integration', description: 'Get started in minutes with our plug-and-play setup process' },
        { title: 'Always Available', description: 'Access your tools 24/7 from any device, anywhere in the world' }
      ] 
    } 
  },
  { 
    id: 'capabilities', 
    type: 'capabilities', 
    enabled: true, 
    title: 'Capabilities Section', 
    content: { 
      cards: [
        { title: 'Automation', description: 'Automate repetitive tasks and save hours every week', icon: '⚡' },
        { title: 'Analytics', description: 'Get real-time insights and data-driven recommendations', icon: '📊' },
        { title: 'Collaboration', description: 'Work seamlessly with your team in real-time', icon: '👥' }
      ] 
    } 
  },
  { 
    id: 'credibility', 
    type: 'credibility', 
    enabled: true, 
    title: 'Credibility Section', 
    content: { 
      headline: 'Trusted By Industry Leaders',
      logos: [
        { id: '1', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/250px-Google_2015_logo.svg.png', name: 'Google' },
        { id: '2', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png', name: 'Microsoft' },
        { id: '3', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png', name: 'Amazon' },
        { id: '4', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png', name: 'Netflix' },
        { id: '5', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/120px-Tesla_logo.png', name: 'Tesla' },
      ]
    } 
  },
  { 
    id: 'testimonials', 
    type: 'testimonials', 
    enabled: true, 
    title: 'Testimonials', 
    content: { 
      testimonials: [
        { name: 'Sarah Johnson', role: 'Marketing Director', company: 'TechCorp', quote: 'This platform has completely transformed how we operate. The AI features alone have saved us 20+ hours per week.', avatar: '' },
        { name: 'Michael Chen', role: 'Founder & CEO', company: 'StartupXYZ', quote: 'The best investment we made this year. ROI was visible within the first month of usage.', avatar: '' },
        { name: 'Emily Rodriguez', role: 'Operations Manager', company: 'GrowthCo', quote: 'Incredible customer support and the product just keeps getting better with each update.', avatar: '' }
      ] 
    } 
  },
  { 
    id: 'pricing', 
    type: 'pricing', 
    enabled: true, 
    title: 'Pricing Section', 
    content: {
      headline: 'Simple, Transparent Pricing',
      subheadline: 'Start free, upgrade when you need more',
      showComparison: true,
      highlightedPlan: 'pro'
    } 
  },
  { 
    id: 'faq', 
    type: 'faq', 
    enabled: true, 
    title: 'FAQ Section', 
    content: { 
      questions: [
        { q: 'How quickly can I get started?', a: 'You can be up and running in less than 5 minutes. Our intuitive onboarding process guides you through everything you need to know.' },
        { q: 'Is there a free trial available?', a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.' },
        { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. You can cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period.' },
        { q: 'Do you offer refunds?', a: 'Yes, we have a 14-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full.' },
        { q: 'Is my data secure?', a: 'Security is our top priority. We use enterprise-grade encryption and are fully compliant with GDPR and other privacy regulations.' }
      ] 
    } 
  },
  { 
    id: 'cta', 
    type: 'cta', 
    enabled: true, 
    title: 'Call To Action', 
    content: {
      headline: 'Ready to Transform Your Business?',
      subheadline: 'Join thousands of successful businesses already using our platform',
      buttonText: 'Start Your Free Trial',
      secondaryButtonText: 'Schedule a Demo'
    } 
  },
  { 
    id: 'footer', 
    type: 'footer', 
    enabled: true, 
    title: 'Footer', 
    content: {
      companyName: appName,
      tagline: 'Empowering businesses with AI',
      showSocialLinks: true,
      showNewsletter: true,
      copyrightYear: new Date().getFullYear()
    } 
  },
];

const AppLicense = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<WhiteLabelSection>('product');
  const [legalDocs, setLegalDocs] = useState([
    { id: 'terms', title: 'Terms of Service', enabled: true },
    { id: 'privacy', title: 'Privacy Policy', enabled: true },
    { id: 'refund', title: 'Refund Policy', enabled: true },
    { id: 'cookies', title: 'Cookie Policy', enabled: true },
  ]);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    guaranteeDays: 14,
    guaranteeDescription: 'Try It Risk-Free',
    guaranteeItems: ['Customers Trust Us', 'One-Click Refund In Dashboard'],
    enableGuarantee: true,
    enableFAQs: true,
    checkoutFAQs: [{ q: 'Will I have access to all AIs?', a: 'Yes! You will have access to the main AIs on the market, all integrated in a single platform for you.' }],
    enableConversionBooster: true,
    discountPercent: 15,
    discountDuration: 3,
    enableUrgencyTimer: true,
    enableSpotlightCard: true,
    spotlightTitle: 'What You Get Immediately',
    spotlightItems: ['Full Platform Access In 2 Minutes', 'Unlimited AI Usage Included', '14-Day Money-Back Guarantee'],
    enableBadges: true,
    selectedBadges: ['ssl', 'pci', 'stripe', 'gdpr'],
  });
  const [pageSectionsInitialized, setPageSectionsInitialized] = useState(false);
  const [pageSections, setPageSections] = useState<PageBlock[]>([]);
  const [pageStyle, setPageStyle] = useState<PageStyle>('centered');

  const handleAIVAToggle = () => {
    const newState = !isAIVAPanelOpen;
    setIsAIVAPanelOpen(newState);
    if (newState) {
      setIsSidebarCollapsed(true);
    }
  };
  
  const { getLicense, activateLicense, updateLicense, deactivateLicense } = useInstalledApps();

  const app = appId ? getCatalogApp(appId) : undefined;
  const license = appId ? getLicense(appId) : undefined;

  // Initialize page sections with defaults when app is available
  useEffect(() => {
    if (app && !pageSectionsInitialized) {
      const appName = license?.brandSettings?.appName || app.name;
      const tagline = license?.brandSettings?.tagline || 'Transform Your Business With AI-Powered Solutions';
      const description = license?.brandSettings?.description || app.description;
      setPageSections(getDefaultPageSections(appName, tagline, description));
      setPageSectionsInitialized(true);
    }
  }, [app, license, pageSectionsInitialized]);

  const handleUpdateBrand = (settings: any, showToast = true) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { brandSettings: { ...currentLicense.brandSettings, ...settings } });
      if (showToast) {
        toast.success('Branding settings saved!');
      }
    }
  };

  const handleUpdateDomain = (settings: any) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { domainSettings: { ...currentLicense.domainSettings, ...settings } });
    }
    toast.success('Domain settings saved');
  };

  const handleUpdatePricing = (settings: any) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { pricingSettings: { ...currentLicense.pricingSettings, ...settings } });
    }
    toast.success('Pricing settings saved');
  };

  if (!app) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar onCollapseChange={setIsSidebarCollapsed} onAIVAPanelToggle={handleAIVAToggle} isAIVAPanelOpen={isAIVAPanelOpen} forceCollapsed />
        <div className="flex-1 flex flex-col transition-all duration-300 ml-16">
          <Header />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">App not found</p>
              <Button onClick={() => navigate('/apps')} variant="outline"><ArrowLeft size={16} className="mr-2" />Back to Apps</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleDeactivateLicense = () => {
    if (appId) {
      deactivateLicense(appId);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'product': return <ProductSection app={app} license={license} onUpdate={handleUpdateBrand} />;
      case 'branding': return <BrandingSection license={license} onUpdate={handleUpdateBrand} />;
      case 'style': return <StyleSection app={app} license={license} selectedStyle={pageStyle} onStyleChange={setPageStyle} />;
      case 'page': return <PageSection app={app} license={license} pageSections={pageSections} onPageSectionsChange={setPageSections} />;
      case 'checkout': return <CheckoutSection license={license} checkoutConfig={checkoutConfig} onCheckoutConfigChange={setCheckoutConfig} />;
      case 'domain': return <DomainSection license={license} onUpdate={handleUpdateDomain} canUseCustomDomain={mockMarketplaceWorkspace.plan === 'apps_license'} />;
      case 'marketing': return <MarketingSection />;
      case 'legal': return <LegalSection productName={license?.brandSettings?.appName || app?.name} legalDocs={legalDocs} onLegalDocsChange={setLegalDocs} />;
      case 'settings': return <SettingsSection onDeactivate={handleDeactivateLicense} />;
      default: return null;
    }
  };

  const handleActivateLicense = () => {
    if (appId) {
      activateLicense(appId, mockMarketplaceWorkspace.id);
    }
  };

  // Show activation screen if no license exists
  if (!license) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar 
          onCollapseChange={setIsSidebarCollapsed} 
          onAIVAPanelToggle={handleAIVAToggle} 
          isAIVAPanelOpen={isAIVAPanelOpen} 
          forceCollapsed 
        />
        <div className="flex-1 flex flex-col ml-16">
          <Header />
          <LicenseActivation app={app} onActivate={handleActivateLicense} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Sidebar - Force Collapsed */}
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed} 
        onAIVAPanelToggle={handleAIVAToggle} 
        isAIVAPanelOpen={isAIVAPanelOpen} 
        forceCollapsed 
      />
      
      {/* White-Label Sidebar - positioned after the collapsed main sidebar */}
      <div className="ml-16">
        <WhiteLabelSidebar 
          app={app} 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          onBack={() => navigate('/apps')} 
        />
      </div>
      
      {/* Main Content Area - 2 Resizable Panels */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Content/Form Panel */}
            <ResizablePanel defaultSize={45} minSize={30} maxSize={60}>
              <div className="h-full overflow-y-auto p-6 bg-background">
                <div className="max-w-2xl">
                  {renderSection()}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Live Preview Panel */}
            <ResizablePanel defaultSize={55} minSize={40}>
              <LivePreview 
                app={app} 
                license={license} 
                activeSection={activeSection}
                checkoutConfig={checkoutConfig}
                legalDocs={legalDocs}
                pageSections={pageSections}
                pageStyle={pageStyle}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default AppLicense;
