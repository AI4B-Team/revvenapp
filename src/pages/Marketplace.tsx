import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { MarketplaceIndex, AppDetailView } from '@/components/marketplace';
import { 
  sampleMarketplaceApps, 
  mockMarketplaceWorkspace, 
  mockMarketplaceUser, 
  mockMembers, 
  mockTeams 
} from '@/lib/marketplace/data';
import { AppInstall, AppLicense } from '@/lib/marketplace/types';
import { toast } from 'sonner';

const Marketplace = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [installs, setInstalls] = useState<AppInstall[]>([]);
  const [licenses, setLicenses] = useState<AppLicense[]>([]);
  const [currentView, setCurrentView] = useState<'index' | 'detail'>('index');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const hasLicense = mockMarketplaceWorkspace.plan === 'apps_license';

  const handleInstall = async (
    appId: string,
    accessMode: string,
    userIds: string[],
    teamIds: string[]
  ) => {
    const newInstall: AppInstall = {
      id: `install-${Date.now()}`,
      appId,
      workspaceId: mockMarketplaceWorkspace.id,
      installedAt: new Date(),
      installedBy: mockMarketplaceUser.id,
      accessMode: accessMode as 'all_members' | 'select_users' | 'select_teams',
      allowedUserIds: userIds,
      allowedTeamIds: teamIds
    };

    setInstalls([...installs, newInstall]);
    toast.success('App installed successfully');
  };

  const handleOpenApp = (appId: string) => {
    setSelectedAppId(appId);
    setCurrentView('detail');
  };

  const handleActivateLicense = () => {
    if (!selectedAppId) return;

    const install = installs.find(i => i.appId === selectedAppId);
    if (!install) return;

    const newLicense: AppLicense = {
      id: `license-${Date.now()}`,
      appInstallId: install.id,
      workspaceId: mockMarketplaceWorkspace.id,
      status: 'active',
      brandSettings: {
        primaryColor: '#000000'
      },
      domainSettings: {
        subdomain: `app-${Date.now()}`
      },
      pricingSettings: {
        monthlyPrice: 29
      },
      publishStatus: 'draft',
      activatedAt: new Date()
    };

    setLicenses([...licenses, newLicense]);
    toast.success('License activated successfully');
  };

  const handleUpdateBrand = (settings: any) => {
    const install = installs.find(i => i.appId === selectedAppId);
    if (!install) return;

    setLicenses(licenses.map(l =>
      l.appInstallId === install.id
        ? { ...l, brandSettings: { ...l.brandSettings, ...settings } }
        : l
    ));
    toast.success('Brand settings saved');
  };

  const handleUpdateDomain = (settings: any) => {
    const install = installs.find(i => i.appId === selectedAppId);
    if (!install) return;

    setLicenses(licenses.map(l =>
      l.appInstallId === install.id
        ? { ...l, domainSettings: { ...l.domainSettings, ...settings } }
        : l
    ));
    toast.success('Domain settings saved');
  };

  const handleUpdatePricing = (settings: any) => {
    const install = installs.find(i => i.appId === selectedAppId);
    if (!install) return;

    setLicenses(licenses.map(l =>
      l.appInstallId === install.id
        ? { ...l, pricingSettings: { ...l.pricingSettings, ...settings } }
        : l
    ));
    toast.success('Pricing settings saved');
  };

  const handlePublish = () => {
    const install = installs.find(i => i.appId === selectedAppId);
    if (!install) return;

    setLicenses(licenses.map(l =>
      l.appInstallId === install.id
        ? { ...l, publishStatus: l.publishStatus === 'live' ? 'draft' : 'live' }
        : l
    ));
    
    const currentLicense = licenses.find(l => l.appInstallId === install.id);
    toast.success(currentLicense?.publishStatus === 'live' ? 'App unpublished' : 'App published');
  };

  const handleUpgradePlan = () => {
    toast.info('Upgrade flow would open here');
  };

  const selectedApp = sampleMarketplaceApps.find(a => a.id === selectedAppId);
  const selectedInstall = installs.find(i => i.appId === selectedAppId);
  const selectedLicense = selectedInstall 
    ? licenses.find(l => l.appInstallId === selectedInstall.id)
    : undefined;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          {currentView === 'index' ? (
            <MarketplaceIndex
              apps={sampleMarketplaceApps}
              installs={installs}
              members={mockMembers}
              teams={mockTeams}
              hasLicense={hasLicense}
              onInstall={handleInstall}
              onOpenApp={handleOpenApp}
            />
          ) : selectedApp && selectedInstall ? (
            <AppDetailView
              app={selectedApp}
              install={selectedInstall}
              license={selectedLicense}
              workspace={mockMarketplaceWorkspace}
              onBack={() => setCurrentView('index')}
              onActivateLicense={handleActivateLicense}
              onUpdateBrand={handleUpdateBrand}
              onUpdateDomain={handleUpdateDomain}
              onUpdatePricing={handleUpdatePricing}
              onPublish={handlePublish}
              onUpgradePlan={handleUpgradePlan}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">App not found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
