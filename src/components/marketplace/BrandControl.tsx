import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { MarketplaceInput } from './MarketplaceInput';
import { Upload, Image } from 'lucide-react';

interface BrandControlProps {
  license: AppLicense;
  onUpdate: (settings: Partial<AppLicense['brandSettings']>) => void;
}

export function BrandControl({ license, onUpdate }: BrandControlProps) {
  const [settings, setSettings] = useState(license.brandSettings);

  const handleSave = () => {
    onUpdate(settings);
  };

  return (
    <div className="border border-border rounded-xl p-6 space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Brand Control</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your app appears to clients
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Logo
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-16 mx-auto" />
            ) : (
              <div>
                <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click To Upload Logo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Favicon
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            {settings.favicon ? (
              <img src={settings.favicon} alt="Favicon" className="h-16 mx-auto" />
            ) : (
              <div>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click To Upload Favicon</p>
                <p className="text-xs text-muted-foreground mt-1">ICO, PNG 32x32</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MarketplaceInput
        label="App Name Override"
        placeholder="Leave empty to use default name"
        value={settings.appName || ''}
        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
        helperText="This name will appear in your client's dashboard"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Primary Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.primaryColor || '#000000'}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            className="h-10 w-20 rounded border border-border cursor-pointer"
          />
          <MarketplaceInput
            type="text"
            value={settings.primaryColor || '#000000'}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Brand Settings</Button>
      </div>
    </div>
  );
}
