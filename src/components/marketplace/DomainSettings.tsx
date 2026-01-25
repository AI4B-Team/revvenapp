import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { MarketplaceInput } from './MarketplaceInput';
import { Globe, ExternalLink, Lock } from 'lucide-react';

interface DomainSettingsProps {
  license: AppLicense;
  onUpdate: (settings: Partial<AppLicense['domainSettings']>) => void;
  canUseCustomDomain: boolean;
}

export function DomainSettings({ license, onUpdate, canUseCustomDomain }: DomainSettingsProps) {
  const [settings, setSettings] = useState(license.domainSettings);

  const subdomainUrl = `https://${settings.subdomain}.revven.app`;

  const handleSave = () => {
    onUpdate(settings);
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Domain Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure where your app is accessible
        </p>
      </div>

      {/* Subdomain */}
      <div>
        <MarketplaceInput
          label="REVVEN Subdomain"
          value={settings.subdomain}
          onChange={(e) => setSettings({ ...settings, subdomain: e.target.value })}
          helperText="Your app will be available at this subdomain"
        />
        <a
          href={subdomainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:text-primary/80"
        >
          <Globe className="h-4 w-4" />
          {subdomainUrl}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Custom Domain */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Custom Domain
          </label>
          {!canUseCustomDomain && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Premium feature
            </span>
          )}
        </div>
        <MarketplaceInput
          placeholder="app.yourdomain.com"
          value={settings.customDomain || ''}
          onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
          disabled={!canUseCustomDomain}
          helperText={
            canUseCustomDomain
              ? 'Point your domain\'s DNS to revven.app'
              : 'Upgrade to Pro to use custom domains'
          }
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Domain Settings</Button>
      </div>
    </div>
  );
}
