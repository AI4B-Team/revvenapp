import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { MarketplaceInput } from './MarketplaceInput';
import { TrendingUp } from 'lucide-react';

interface PricingSettingsProps {
  license: AppLicense;
  onUpdate: (settings: Partial<AppLicense['pricingSettings']>) => void;
}

export function PricingSettings({ license, onUpdate }: PricingSettingsProps) {
  const [settings, setSettings] = useState(license.pricingSettings);
  const [customClients, setCustomClients] = useState<number>(25);

  const calculateRevenue = (customers: number) => {
    const monthlyRevenue = settings.monthlyPrice * customers;
    const setupRevenue = (settings.setupFee || 0) * customers;
    const totalRevenue = monthlyRevenue + setupRevenue;
    return totalRevenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  };

  const handleSave = () => {
    onUpdate(settings);
  };

  return (
    <div className="border border-border rounded-xl p-6 space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Billing & Pricing
        </h3>
        <p className="text-sm text-muted-foreground">
          Set how much you'll charge your clients
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MarketplaceInput
          label="Monthly Price"
          type="number"
          value={settings.monthlyPrice}
          onChange={(e) =>
            setSettings({ ...settings, monthlyPrice: parseFloat(e.target.value) || 0 })
          }
          helperText="Per Client Per Month"
        />
        <MarketplaceInput
          label="Setup Fee (Optional)"
          type="number"
          value={settings.setupFee || ''}
          onChange={(e) =>
            setSettings({ ...settings, setupFee: parseFloat(e.target.value) || undefined })
          }
          helperText="One-Time Fee"
        />
      </div>

      {/* Revenue Calculator */}
      <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Revenue Potential</h4>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[10, 50, 100].map((customers) => (
            <div key={customers} className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {calculateRevenue(customers)}
              </div>
              <div className="text-sm text-muted-foreground">{customers} clients</div>
            </div>
          ))}
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {calculateRevenue(customClients || 0)}
            </div>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={customClients}
                onChange={(e) => setCustomClients(parseInt(e.target.value) || 0)}
                className="w-16 text-center text-sm text-muted-foreground bg-transparent border-b border-muted-foreground/30 focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
              />
              <span className="text-sm text-muted-foreground">clients</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Pricing</Button>
      </div>
    </div>
  );
}
