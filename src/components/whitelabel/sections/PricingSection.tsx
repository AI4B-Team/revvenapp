import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  Check,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PricingSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['pricingSettings']>) => void;
}

type PricingModel = 'monthly' | 'one-time' | 'both';
type BillingCycle = 'monthly' | 'yearly';

const pricePresets = [9, 19, 29, 49, 99, 199];

export function PricingSection({ license, onUpdate }: PricingSectionProps) {
  const [pricingModel, setPricingModel] = useState<PricingModel>(license?.pricingSettings?.pricingModel || 'monthly');
  const [monthlyPrice, setMonthlyPrice] = useState(license?.pricingSettings?.monthlyPrice || 9.99);
  const [oneTimePrice, setOneTimePrice] = useState(license?.pricingSettings?.oneTimePrice || 99);
  const [setupFee, setSetupFee] = useState(license?.pricingSettings?.setupFee || 0);
  const [enableFreeTrial, setEnableFreeTrial] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [enableYearly, setEnableYearly] = useState(false);
  const [yearlyDiscount, setYearlyDiscount] = useState(20);
  const [customCustomers, setCustomCustomers] = useState(100);

  const calculateRevenue = (price: number, customers: number, isYearly: boolean = false) => {
    const multiplier = isYearly ? 12 : 1;
    const discountMultiplier = isYearly ? (100 - yearlyDiscount) / 100 : 1;
    return price * customers * multiplier * discountMultiplier;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSave = () => {
    onUpdate({
      pricingModel,
      monthlyPrice,
      oneTimePrice,
      setupFee: setupFee || undefined
    });
    toast.success('Pricing settings saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pricing Strategy</h2>
        <p className="text-muted-foreground mt-1">
          Set your price — you can always change it later
        </p>
      </div>

      {/* Pricing Model Selection */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Pricing Model</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['monthly', 'one-time', 'both'] as PricingModel[]).map((model) => (
            <button
              key={model}
              onClick={() => setPricingModel(model)}
              className={`p-4 rounded-xl border-2 transition-all ${
                pricingModel === model
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground capitalize">{model.replace('-', ' ')}</span>
                {pricingModel === model && <Check className="h-4 w-4 text-emerald-500" />}
              </div>
              <p className="text-xs text-muted-foreground text-left">
                {model === 'monthly' && 'Recurring subscription billing'}
                {model === 'one-time' && 'Single payment, lifetime access'}
                {model === 'both' && 'Let customers choose'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Pricing */}
      {(pricingModel === 'monthly' || pricingModel === 'both') && (
        <div className="p-6 rounded-xl border-2 border-border bg-card space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Monthly Subscription</h3>
          </div>

          {/* Price Presets */}
          <div className="space-y-3">
            <Label>Quick Price Options</Label>
            <div className="flex flex-wrap gap-2">
              {pricePresets.map((price) => (
                <button
                  key={price}
                  onClick={() => setMonthlyPrice(price)}
                  className={`px-5 py-3 rounded-xl border-2 font-semibold transition-all ${
                    monthlyPrice === price
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  ${price}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Price */}
          <div className="space-y-2">
            <Label>Custom Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)}
                className="pl-9 text-lg font-semibold"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/mo</span>
            </div>
          </div>

          {/* Yearly Option */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="font-medium text-foreground">Enable Yearly Billing</p>
              <p className="text-sm text-muted-foreground">Offer a discount for annual subscriptions</p>
            </div>
            <Switch checked={enableYearly} onCheckedChange={setEnableYearly} />
          </div>

          {enableYearly && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Yearly Discount</Label>
                <span className="text-sm font-medium text-emerald-600">{yearlyDiscount}% off</span>
              </div>
              <Slider
                value={[yearlyDiscount]}
                onValueChange={([v]) => setYearlyDiscount(v)}
                min={5}
                max={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Yearly price: {formatCurrency(monthlyPrice * 12 * (100 - yearlyDiscount) / 100)}/year
              </p>
            </div>
          )}

          {/* Setup Fee */}
          <div className="space-y-2">
            <Label>Setup Fee (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={setupFee || ''}
                onChange={(e) => setSetupFee(parseFloat(e.target.value) || 0)}
                className="pl-9"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">One-time fee charged at signup</p>
          </div>

          {/* Free Trial */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="font-medium text-foreground">Enable Free Trial</p>
              <p className="text-sm text-muted-foreground">Let customers try before they buy</p>
            </div>
            <Switch checked={enableFreeTrial} onCheckedChange={setEnableFreeTrial} />
          </div>

          {enableFreeTrial && (
            <div className="space-y-2">
              <Label>Trial Duration (Days)</Label>
              <div className="flex gap-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTrialDays(days)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      trialDays === days
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* One-Time Pricing */}
      {(pricingModel === 'one-time' || pricingModel === 'both') && (
        <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">One-Time Payment</h3>
          </div>

          <div className="space-y-2">
            <Label>Lifetime Access Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={oneTimePrice}
                onChange={(e) => setOneTimePrice(parseFloat(e.target.value) || 0)}
                className="pl-9 text-lg font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Calculator */}
      <div className="p-6 rounded-xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-foreground">Revenue Potential</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated revenue based on your pricing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[10, 50, 100].map((customers) => (
            <div key={customers} className="text-center p-4 rounded-xl bg-background border border-border">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(calculateRevenue(monthlyPrice, customers))}
              </div>
              <div className="text-sm text-muted-foreground">{customers} customers</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(calculateRevenue(monthlyPrice, customers, true))}/year
              </div>
            </div>
          ))}
          <div className="text-center p-4 rounded-xl bg-background border border-emerald-500/30">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(calculateRevenue(monthlyPrice, customCustomers))}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Input
                type="number"
                value={customCustomers}
                onChange={(e) => setCustomCustomers(parseInt(e.target.value) || 0)}
                className="w-16 h-7 text-center text-sm px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-muted-foreground">customers</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(calculateRevenue(monthlyPrice, customCustomers, true))}/year
            </div>
          </div>
        </div>
      </div>

      {/* AI Pricing Suggestion */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">AI Pricing Tip</p>
          <p className="text-sm text-muted-foreground">
            Based on similar products, a price point of ${monthlyPrice < 29 ? '29-49' : '49-99'}/month typically converts well. 
            Consider offering a yearly plan with 20-30% discount to boost lifetime value.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Pricing
        </Button>
      </div>
    </div>
  );
}
