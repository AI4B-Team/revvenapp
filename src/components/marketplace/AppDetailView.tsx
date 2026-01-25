import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceApp, AppInstall, AppLicense, MarketplaceWorkspace } from '@/lib/marketplace/types';
import { appRoutes } from '@/lib/marketplace/catalog';
import { Button } from '@/components/ui/button';
import { LicenseActivation } from './LicenseActivation';
import { BrandControl } from './BrandControl';
import { DomainSettings } from './DomainSettings';
import { PricingSettings } from './PricingSettings';
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react';

interface AppDetailViewProps {
  app: MarketplaceApp;
  install: AppInstall;
  license?: AppLicense;
  workspace: MarketplaceWorkspace;
  onBack: () => void;
  onActivateLicense: () => void;
  onUpdateBrand: (settings: any) => void;
  onUpdateDomain: (settings: any) => void;
  onUpdatePricing: (settings: any) => void;
  onPublish: () => void;
  onUpgradePlan: () => void;
}

export function AppDetailView({
  app,
  install,
  license,
  workspace,
  onBack,
  onActivateLicense,
  onUpdateBrand,
  onUpdateDomain,
  onUpdatePricing,
  onPublish,
  onUpgradePlan
}: AppDetailViewProps) {
  const navigate = useNavigate();
  const isLicenseActive = license?.status === 'active';
  const isPublished = license?.publishStatus === 'live';
  const appRoute = appRoutes[app.id];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Apps
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{app.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{app.name}</h1>
                <p className="text-muted-foreground mt-1">{app.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={() => appRoute && navigate(appRoute)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* License Activation */}
        <LicenseActivation
          app={app}
          workspace={workspace}
          isLicenseActive={isLicenseActive}
          onActivate={onActivateLicense}
          onUpgrade={onUpgradePlan}
        />

        {/* White-Label Sections (only if license active) */}
        {isLicenseActive && license && (
          <>
            <BrandControl license={license} onUpdate={onUpdateBrand} />
            <DomainSettings
              license={license}
              onUpdate={onUpdateDomain}
              canUseCustomDomain={workspace.plan === 'apps_license'}
            />
            <PricingSettings license={license} onUpdate={onUpdatePricing} />

            {/* Publish Section */}
            <div className="border border-border rounded-xl p-6 bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Publish Status
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isPublished
                      ? 'Your app is live and available to clients'
                      : 'Review your settings and launch your app'}
                  </p>
                </div>
                <Button
                  variant={isPublished ? 'outline' : 'default'}
                  onClick={onPublish}
                >
                  {isPublished ? 'Unpublish' : 'Launch App'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Install Info */}
        <div className="border border-border rounded-xl p-6 bg-background">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Access Control
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Installed On</span>
              <span className="font-medium text-foreground">
                {new Date(install.installedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Access Mode</span>
              <span className="font-medium text-foreground capitalize">
                {install.accessMode.replace('_', ' ')}
              </span>
            </div>
            {install.accessMode === 'select_users' && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Allowed Users</span>
                <span className="font-medium text-foreground">
                  {install.allowedUserIds.length} users
                </span>
              </div>
            )}
            {install.accessMode === 'select_teams' && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Allowed Teams</span>
                <span className="font-medium text-foreground">
                  {install.allowedTeamIds.length} teams
                </span>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Edit Permissions
          </Button>
        </div>
      </div>
    </div>
  );
}
