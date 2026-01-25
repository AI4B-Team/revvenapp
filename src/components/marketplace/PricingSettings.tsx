import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { MarketplaceInput } from './MarketplaceInput';
import { TrendingUp } from 'lucide-react';

interface PricingSettingsProps {
  license: AppLicense;
  onUpdate: (settings: Partial<AppLicense['pricingSettings']>) => void;
}

type PricingModel = 'monthly' | 'one-time' | 'both';

export function PricingSettings({ license, onUpdate }: PricingSettingsProps) {
  const [settings, setSettings] = useState({
    pricingModel: license.pricingSettings.pricingModel || 'monthly' as PricingModel,
    monthlyPrice: license.pricingSettings.monthlyPrice,
    setupFee: license.pricingSettings.setupFee,
    oneTimePrice: license.pricingSettings.oneTimePrice || 0
  });
  const [customClients, setCustomClients] = useState<number>(25);

  const calculateMonthlyRevenue = (customers: number) => {
    const monthlyRevenue = settings.monthlyPrice * customers;
    const setupRevenue = (settings.setupFee || 0) * customers;
    const totalRevenue = monthlyRevenue + setupRevenue;
    return totalRevenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  };

  const calculateOneTimeRevenue = (customers: number) => {
    const totalRevenue = (settings.oneTimePrice || 0) * customers;
    return totalRevenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  };

  const handleSave = () => {
    onUpdate(settings);
  };

  const pricingModels: { value: PricingModel; label: string }[] = [
    { value: 'monthly', label: 'Monthly Recurring' },
    { value: 'one-time', label: 'One-Time Fee' },
    { value: 'both', label: 'Both Options' }
  ];

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 space-y-6 bg-background">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Billing & Pricing
        </h3>
        <p className="text-sm text-muted-foreground">
          Set how much you'll charge your clients
        </p>
      </div>

      {/* Pricing Model Toggle */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Pricing Model
        </label>
        <div className="flex gap-2">
          {pricingModels.map((model) => (
            <button
              key={model.value}
              onClick={() => setSettings({ ...settings, pricingModel: model.value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.pricingModel === model.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Pricing Fields */}
      {(settings.pricingModel === 'monthly' || settings.pricingModel === 'both') && (
        <div className="space-y-4">
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
              helperText="One-Time Setup Fee"
            />
          </div>

          {/* Monthly Revenue Calculator */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Monthly Revenue Potential</h4>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[10, 50, 100].map((customers) => (
                <div key={customers} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {calculateMonthlyRevenue(customers)}
                  </div>
                  <div className="text-sm text-muted-foreground">{customers} clients</div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {calculateMonthlyRevenue(customClients || 0)}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={customClients}
                    onChange={(e) => setCustomClients(parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-sm font-medium text-foreground bg-background border border-border rounded-md px-2 py-1 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    placeholder="25"
                  />
                  <span className="text-sm text-muted-foreground">clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Time Pricing Fields */}
      {(settings.pricingModel === 'one-time' || settings.pricingModel === 'both') && (
        <div className="space-y-4">
          <MarketplaceInput
            label="One-Time Price"
            type="number"
            value={settings.oneTimePrice || ''}
            onChange={(e) =>
              setSettings({ ...settings, oneTimePrice: parseFloat(e.target.value) || 0 })
            }
            helperText="Single Payment Per Client"
          />

          {/* One-Time Revenue Calculator */}
          <div className="p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-foreground">One-Time Revenue Potential</h4>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[10, 50, 100].map((customers) => (
                <div key={`onetime-${customers}`} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {calculateOneTimeRevenue(customers)}
                  </div>
                  <div className="text-sm text-muted-foreground">{customers} clients</div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {calculateOneTimeRevenue(customClients || 0)}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={customClients}
                    onChange={(e) => setCustomClients(parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-sm font-medium text-foreground bg-background border border-border rounded-md px-2 py-1 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    placeholder="25"
                  />
                  <span className="text-sm text-muted-foreground">clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Pricing</Button>
      </div>
    </div>
  );
}
