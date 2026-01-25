import React from 'react';
import { MarketplaceApp, AppInstall } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface AppCardProps {
  app: MarketplaceApp;
  install?: AppInstall;
  onInstall: (app: MarketplaceApp) => void;
  onOpen: (app: MarketplaceApp) => void;
  hasLicense: boolean;
}

export function AppCard({ app, install, onInstall, onOpen, hasLicense }: AppCardProps) {
  const isInstalled = !!install;

  return (
    <div className="bg-background rounded-xl border border-border p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{app.icon}</div>
        {app.isWhitelabelEligible && (
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            {hasLicense ? '✓' : <Lock className="h-3 w-3" />}
            <span>White-label</span>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{app.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.description}</p>

      {/* Features */}
      <ul className="space-y-1 mb-4">
        {app.features.slice(0, 3).map((feature, idx) => (
          <li key={idx} className="text-xs text-muted-foreground flex items-center">
            <span className="text-primary mr-2">•</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Action */}
      <Button
        variant={isInstalled ? 'outline' : 'default'}
        className="w-full"
        onClick={() => (isInstalled ? onOpen(app) : onInstall(app))}
      >
        {isInstalled ? 'Open' : 'Install'}
      </Button>
    </div>
  );
}
