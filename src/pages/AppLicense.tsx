import React, { useEffect, useState } from 'react';
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
  PageSection,
  PricingSection,
  CheckoutSection,
  DomainSection,
  LegalSection,
  SettingsSection,
  LivePreview,
  LicenseActivation
} from '@/components/whitelabel';
import type { CheckoutConfig } from '@/components/whitelabel/sections/CheckoutSection';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

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
  });

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
      case 'page': return <PageSection app={app} license={license} />;
      case 'pricing': return <PricingSection license={license} onUpdate={handleUpdatePricing} />;
      case 'checkout': return <CheckoutSection license={license} checkoutConfig={checkoutConfig} onCheckoutConfigChange={setCheckoutConfig} />;
      case 'domain': return <DomainSection license={license} onUpdate={handleUpdateDomain} canUseCustomDomain={mockMarketplaceWorkspace.plan === 'apps_license'} />;
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
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default AppLicense;
