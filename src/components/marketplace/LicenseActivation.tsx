import React from 'react';
import { MarketplaceApp, MarketplaceWorkspace } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';

interface LicenseActivationProps {
  app: MarketplaceApp;
  workspace: MarketplaceWorkspace;
  isLicenseActive: boolean;
  onActivate: () => void;
  onUpgrade: () => void;
}

export function LicenseActivation({
  app,
  workspace,
  isLicenseActive,
  onActivate,
  onUpgrade
}: LicenseActivationProps) {
  const hasLicense = workspace.plan === 'apps_license';

  if (!app.isWhitelabelEligible) {
    return null;
  }

  return (
    <div className="border border-border rounded-xl p-6 bg-background">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            White-Label License
          </h3>
          <p className="text-sm text-muted-foreground">
            Rebrand This App And Resell It To Your Clients
          </p>
        </div>
        {isLicenseActive && (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
            <Check className="h-4 w-4" />
            Active
          </span>
        )}
      </div>

      {!hasLicense ? (
        // Locked State
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
            <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-foreground mb-2">
                White-label features require an APPS License plan
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Custom branding & domain</li>
                <li>• Set your own pricing</li>
                <li>• Manage client access</li>
                <li>• White-label all eligible apps</li>
              </ul>
            </div>
          </div>
          <Button onClick={onUpgrade} className="w-full">
            Upgrade to APPS License
          </Button>
        </div>
      ) : !isLicenseActive ? (
        // Can Activate
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              Activate Your License To Start Customizing And Reselling This App
            </p>
          </div>
          <Button onClick={onActivate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Activate License
          </Button>
        </div>
      ) : (
        // Already Active
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            Your white-label license is active. Configure branding, domain, and pricing below.
          </p>
        </div>
      )}
    </div>
  );
}
