import React from 'react';
import { MarketplaceApp, AppInstall } from '@/lib/marketplace/types';
import { AppCard } from './AppCard';

interface AppGridProps {
  apps: MarketplaceApp[];
  installs: AppInstall[];
  onInstall: (app: MarketplaceApp) => void;
  onOpen: (app: MarketplaceApp) => void;
  onResell?: (app: MarketplaceApp) => void;
  hasLicense: boolean;
}

export function AppGrid({ apps, installs, onInstall, onOpen, onResell, hasLicense }: AppGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {apps.map((app) => {
        const install = installs.find(i => i.appId === app.id);
        return (
          <AppCard
            key={app.id}
            app={app}
            install={install}
            onInstall={onInstall}
            onOpen={onOpen}
            onResell={onResell}
            hasLicense={hasLicense}
          />
        );
      })}
    </div>
  );
}
