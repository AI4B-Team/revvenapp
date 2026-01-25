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
  SettingsSection,
  LivePreview,
  LicenseActivation
} from '@/components/whitelabel';
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

  const handleAIVAToggle = () => {
    const newState = !isAIVAPanelOpen;
    setIsAIVAPanelOpen(newState);
    if (newState) {
      setIsSidebarCollapsed(true);
    }
  };
  
  const { getLicense, activateLicense, updateLicense } = useInstalledApps();

  const app = appId ? getCatalogApp(appId) : undefined;
  const license = appId ? getLicense(appId) : undefined;

  const handleUpdateBrand = (settings: any, showToast = true) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { brandSettings: { ...currentLicense.brandSettings, ...settings } });
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

  const renderSection = () => {
    switch (activeSection) {
      case 'product': return <ProductSection app={app} license={license} onUpdate={handleUpdateBrand} />;
      case 'branding': return <BrandingSection license={license} onUpdate={handleUpdateBrand} />;
      case 'page': return <PageSection app={app} license={license} />;
      case 'pricing': return <PricingSection license={license} onUpdate={handleUpdatePricing} />;
      case 'checkout': return <CheckoutSection license={license} />;
      case 'domain': return <DomainSection license={license} onUpdate={handleUpdateDomain} canUseCustomDomain={mockMarketplaceWorkspace.plan === 'apps_license'} />;
      case 'settings': return <SettingsSection />;
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
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default AppLicense;
