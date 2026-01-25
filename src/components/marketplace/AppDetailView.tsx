import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceApp, AppInstall, AppLicense, MarketplaceWorkspace } from '@/lib/marketplace/types';
import { appRoutes } from '@/lib/marketplace/catalog';
import { Button } from '@/components/ui/button';
import { LicenseActivation } from './LicenseActivation';
import { BrandControl } from './BrandControl';
import { DomainSettings } from './DomainSettings';
import { PricingSettings } from './PricingSettings';
import { MemberSelector } from './MemberSelector';
import { TeamSelector } from './TeamSelector';
import { mockMembers, mockTeams } from '@/lib/marketplace/data';
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { getAppThumbnail } from '@/utils/appThumbnails';

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
  onUpdatePermissions?: (accessMode: string, userIds: string[], teamIds: string[]) => void;
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
  onUpgradePlan,
  onUpdatePermissions
}: AppDetailViewProps) {
  const navigate = useNavigate();
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAccessMode, setSelectedAccessMode] = useState<'all_members' | 'select_users' | 'select_teams'>(install.accessMode);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(install.allowedUserIds || []);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(install.allowedTeamIds || []);
  
  const isLicenseActive = license?.status === 'active';
  const isPublished = license?.publishStatus === 'live';
  const appRoute = appRoutes[app.id];

  const handleEditPermissions = () => {
    setSelectedAccessMode(install.accessMode);
    setSelectedUserIds(install.allowedUserIds || []);
    setSelectedTeamIds(install.allowedTeamIds || []);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    if (onUpdatePermissions) {
      onUpdatePermissions(selectedAccessMode, selectedUserIds, selectedTeamIds);
    }
    toast.success('Permissions updated successfully');
    setShowPermissionsModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
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
              <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border shadow-md overflow-hidden flex-shrink-0">
                {getAppThumbnail(app.name) ? (
                  <img src={getAppThumbnail(app.name)} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{app.icon}</div>
                )}
              </div>
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
              <Button 
                onClick={() => appRoute && navigate(appRoute)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
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
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 bg-background">
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
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 bg-background">
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
          <Button variant="outline" className="w-full mt-4" onClick={handleEditPermissions}>
            Edit Permissions
          </Button>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Access Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Who Should Have Access?</Label>
            <RadioGroup value={selectedAccessMode} onValueChange={(value) => setSelectedAccessMode(value as 'all_members' | 'select_users' | 'select_teams')}>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <RadioGroupItem value="all_members" id="all" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">Everyone In This Workspace</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <RadioGroupItem value="select_users" id="users" />
                <Label htmlFor="users" className="flex-1 cursor-pointer">Select Specific Users</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <RadioGroupItem value="select_teams" id="teams" />
                <Label htmlFor="teams" className="flex-1 cursor-pointer">Select Specific Teams</Label>
              </div>
            </RadioGroup>

            {/* Conditional Selectors */}
            {selectedAccessMode === 'select_users' && (
              <MemberSelector
                members={mockMembers}
                selectedIds={selectedUserIds}
                onChange={setSelectedUserIds}
              />
            )}

            {selectedAccessMode === 'select_teams' && (
              <TeamSelector
                teams={mockTeams}
                selectedIds={selectedTeamIds}
                onChange={setSelectedTeamIds}
              />
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
