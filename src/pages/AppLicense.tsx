import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AppDetailView } from '@/components/marketplace';
import { mockMarketplaceWorkspace } from '@/lib/marketplace/data';
import { getCatalogApp } from '@/lib/marketplace/catalog';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AppLicense = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  const { 
    getInstall, 
    getLicense, 
    activateLicense, 
    updateLicense 
  } = useInstalledApps();

  // Use getCatalogApp to resolve any appId (from catalog or generate a placeholder)
  const app = appId ? getCatalogApp(appId) : undefined;
  const install = appId ? getInstall(appId) : undefined;
  const license = appId ? getLicense(appId) : undefined;

  const handleActivateLicense = () => {
    if (!appId) return;
    activateLicense(appId, mockMarketplaceWorkspace.id);
    toast.success('License activated successfully');
  };

  const handleUpdateBrand = (settings: any) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { 
        brandSettings: { ...currentLicense.brandSettings, ...settings } 
      });
    }
    toast.success('Brand settings saved');
  };

  const handleUpdateDomain = (settings: any) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { 
        domainSettings: { ...currentLicense.domainSettings, ...settings } 
      });
    }
    toast.success('Domain settings saved');
  };

  const handleUpdatePricing = (settings: any) => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { 
        pricingSettings: { ...currentLicense.pricingSettings, ...settings } 
      });
    }
    toast.success('Pricing settings saved');
  };

  const handlePublish = () => {
    if (!appId) return;
    const currentLicense = getLicense(appId);
    if (currentLicense) {
      updateLicense(appId, { 
        publishStatus: currentLicense.publishStatus === 'live' ? 'draft' : 'live' 
      });
      toast.success(currentLicense.publishStatus === 'live' ? 'App unpublished' : 'App published');
    }
  };

  const handleUpgradePlan = () => {
    toast.info('Upgrade flow would open here');
  };

  if (!app) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground text-lg">App not found</p>
              <Button onClick={() => navigate('/apps')} variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Apps
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Create a mock install object if not installed (allows access to white-label settings without installing)
  const effectiveInstall = install || {
    id: `temp-install-${appId}`,
    appId: appId!,
    workspaceId: mockMarketplaceWorkspace.id,
    installedAt: new Date(),
    installedBy: 'user',
    accessMode: 'all_members' as const,
    allowedUserIds: [],
    allowedTeamIds: []
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <AppDetailView
            app={app}
            install={effectiveInstall}
            license={license}
            workspace={mockMarketplaceWorkspace}
            onBack={() => navigate('/apps')}
            onActivateLicense={handleActivateLicense}
            onUpdateBrand={handleUpdateBrand}
            onUpdateDomain={handleUpdateDomain}
            onUpdatePricing={handleUpdatePricing}
            onPublish={handlePublish}
            onUpgradePlan={handleUpgradePlan}
            sidebarCollapsed={isSidebarCollapsed}
          />
        </main>
      </div>
    </div>
  );
};

export default AppLicense;
