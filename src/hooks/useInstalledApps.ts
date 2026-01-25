import { useState, useCallback } from 'react';
import { AppInstall, AppLicense } from '@/lib/marketplace/types';

const INSTALLS_KEY = 'marketplace-installs';
const LICENSES_KEY = 'marketplace-licenses';

export function useInstalledApps() {
  const [installs, setInstalls] = useState<AppInstall[]>(() => {
    const saved = localStorage.getItem(INSTALLS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [licenses, setLicenses] = useState<AppLicense[]>(() => {
    const saved = localStorage.getItem(LICENSES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const saveInstalls = (newInstalls: AppInstall[]) => {
    localStorage.setItem(INSTALLS_KEY, JSON.stringify(newInstalls));
    setInstalls(newInstalls);
  };

  const saveLicenses = (newLicenses: AppLicense[]) => {
    localStorage.setItem(LICENSES_KEY, JSON.stringify(newLicenses));
    setLicenses(newLicenses);
  };

  const installApp = useCallback((
    appId: string,
    workspaceId: string,
    userId: string,
    accessMode: 'all_members' | 'select_users' | 'select_teams',
    userIds: string[] = [],
    teamIds: string[] = []
  ) => {
    const newInstall: AppInstall = {
      id: `install-${Date.now()}`,
      appId,
      workspaceId,
      installedAt: new Date(),
      installedBy: userId,
      accessMode,
      allowedUserIds: userIds,
      allowedTeamIds: teamIds
    };
    const newInstalls = [...installs, newInstall];
    saveInstalls(newInstalls);
    return newInstall;
  }, [installs]);

  const isInstalled = useCallback((appId: string) => {
    return installs.some(i => i.appId === appId);
  }, [installs]);

  const getInstall = useCallback((appId: string) => {
    return installs.find(i => i.appId === appId);
  }, [installs]);

  const activateLicense = useCallback((appId: string, workspaceId: string) => {
    let install = installs.find(i => i.appId === appId);
    
    // If no install exists, create one automatically
    if (!install) {
      install = {
        id: `install-${Date.now()}`,
        appId,
        workspaceId,
        installedAt: new Date(),
        installedBy: 'user',
        accessMode: 'all_members' as const,
        allowedUserIds: [],
        allowedTeamIds: []
      };
      const newInstalls = [...installs, install];
      saveInstalls(newInstalls);
    }

    const existingLicense = licenses.find(l => l.appInstallId === install.id);
    if (existingLicense) return existingLicense;

    const newLicense: AppLicense = {
      id: `license-${Date.now()}`,
      appInstallId: install.id,
      workspaceId,
      status: 'active',
      brandSettings: { primaryColor: '#000000' },
      domainSettings: { subdomain: `app-${Date.now()}` },
      pricingSettings: { pricingModel: 'monthly', monthlyPrice: 29 },
      publishStatus: 'draft',
      activatedAt: new Date()
    };
    const newLicenses = [...licenses, newLicense];
    saveLicenses(newLicenses);
    return newLicense;
  }, [installs, licenses]);

  const getLicense = useCallback((appId: string) => {
    const install = installs.find(i => i.appId === appId);
    if (!install) return undefined;
    return licenses.find(l => l.appInstallId === install.id);
  }, [installs, licenses]);

  const updateLicense = useCallback((appId: string, updates: Partial<AppLicense>) => {
    const install = installs.find(i => i.appId === appId);
    if (!install) return;

    const newLicenses = licenses.map(l =>
      l.appInstallId === install.id ? { ...l, ...updates } : l
    );
    saveLicenses(newLicenses);
  }, [installs, licenses]);

  return {
    installs,
    licenses,
    installApp,
    isInstalled,
    getInstall,
    activateLicense,
    getLicense,
    updateLicense
  };
}
