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
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['pricingSettings']>) => void;
}

type PricingModel = 'monthly' | 'one-time' | 'setup-monthly';

const pricePresets = [9, 19, 29, 49, 99, 199];
const customerPresets = [25, 50, 100];

export function PricingSection({ license, onUpdate }: PricingSectionProps) {
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    license?.pricingSettings?.pricingModel === 'both' 
      ? 'setup-monthly' 
      : (license?.pricingSettings?.pricingModel || 'monthly')
  );
  const [monthlyPrice, setMonthlyPrice] = useState(license?.pricingSettings?.monthlyPrice || 47);
  const [oneTimePrice, setOneTimePrice] = useState(license?.pricingSettings?.oneTimePrice || 297);
  const [setupFee, setSetupFee] = useState(license?.pricingSettings?.setupFee || 97);
  const [enableFreeTrial, setEnableFreeTrial] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [selectedCustomerCount, setSelectedCustomerCount] = useState(100);
  const [customCustomerCount, setCustomCustomerCount] = useState<number | ''>('');

  const activeCustomerCount = customCustomerCount !== '' ? customCustomerCount : selectedCustomerCount;

  const calculateMRR = (price: number, customers: number) => price * customers;
  const calculateARR = (price: number, customers: number) => price * customers * 12;
  const calculateOneTimeRevenue = (price: number, customers: number) => price * customers;
  const calculateSetupMonthlyRevenue = (setup: number, monthly: number, customers: number) => ({
    upfront: setup * customers,
    mrr: monthly * customers,
    arr: monthly * customers * 12,
    total: (setup * customers) + (monthly * customers * 12)
  });

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
      pricingModel: pricingModel === 'setup-monthly' ? 'both' : pricingModel,
      monthlyPrice: pricingModel === 'one-time' ? 0 : monthlyPrice,
      oneTimePrice: pricingModel === 'monthly' ? 0 : (pricingModel === 'one-time' ? oneTimePrice : 0),
      setupFee: pricingModel === 'setup-monthly' ? setupFee : undefined
    });
    toast.success('Pricing settings saved!');
  };

  const pricingModels = [
    { 
      id: 'monthly' as PricingModel, 
      name: 'Monthly Fee', 
      description: 'Recurring subscription billing',
      icon: Calendar
    },
    { 
      id: 'one-time' as PricingModel, 
      name: 'One-Time Fee', 
      description: 'Single payment, lifetime access',
      icon: DollarSign
    },
    { 
      id: 'setup-monthly' as PricingModel, 
      name: 'Setup + Monthly', 
      description: 'One-time setup fee with monthly recurring',
      icon: TrendingUp
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pricing Configuration</h2>
        <p className="text-muted-foreground mt-1">
          Set your price — you can always change it later
        </p>
      </div>

      {/* Pricing Model Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Pricing Model</Label>
        <div className="grid grid-cols-1 gap-3">
          {pricingModels.map((model) => {
            const IconComponent = model.icon;
            return (
              <button
                key={model.id}
                onClick={() => setPricingModel(model.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                  pricingModel === model.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pricingModel === model.id ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{model.name}</span>
                    {pricingModel === model.id && <Check className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{model.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Pricing with Slider */}
      {(pricingModel === 'monthly' || pricingModel === 'setup-monthly') && (
        <div className="p-6 rounded-xl border-2 border-border bg-card space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">
              <span className="text-2xl text-muted-foreground align-top">$</span>
              {monthlyPrice}
              <span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          {/* Price Slider */}
          <div className="space-y-3">
            <Slider
              value={[monthlyPrice]}
              onValueChange={([v]) => setMonthlyPrice(v)}
              min={5}
              max={299}
              step={1}
              className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.range]:bg-emerald-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$5</span>
              <span>$299</span>
            </div>
          </div>

          {/* Quick Price Options */}
          <div className="flex flex-wrap justify-center gap-2">
            {pricePresets.map((price) => (
              <button
                key={price}
                onClick={() => setMonthlyPrice(price)}
                className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                  monthlyPrice === price
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                ${price}
              </button>
            ))}
          </div>

          {/* Custom Price Input */}
          <div className="flex items-center gap-3 justify-center">
            <span className="text-sm text-muted-foreground">or enter custom:</span>
            <div className="relative w-24">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Math.min(299, Math.max(1, parseInt(e.target.value) || 0)))}
                className="pl-7 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Setup Fee for Setup + Monthly Model */}
      {pricingModel === 'setup-monthly' && (
        <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">One-Time Setup Fee</h3>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              <span className="text-xl text-muted-foreground align-top">$</span>
              {setupFee}
              <span className="text-sm font-normal text-muted-foreground ml-1">one-time</span>
            </p>
          </div>

          <Slider
            value={[setupFee]}
            onValueChange={([v]) => setSetupFee(v)}
            min={0}
            max={997}
            step={1}
            className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.range]:bg-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$997</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[0, 47, 97, 197, 497].map((price) => (
              <button
                key={price}
                onClick={() => setSetupFee(price)}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  setupFee === price
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                {price === 0 ? 'No fee' : `$${price}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* One-Time Pricing */}
      {pricingModel === 'one-time' && (
        <div className="p-6 rounded-xl border-2 border-border bg-card space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Lifetime Access Price</h3>
          </div>

          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">
              <span className="text-2xl text-muted-foreground align-top">$</span>
              {oneTimePrice}
            </p>
          </div>

          <Slider
            value={[oneTimePrice]}
            onValueChange={([v]) => setOneTimePrice(v)}
            min={47}
            max={2997}
            step={1}
            className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.range]:bg-emerald-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$47</span>
            <span>$2,997</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[97, 197, 297, 497, 997, 1997].map((price) => (
              <button
                key={price}
                onClick={() => setOneTimePrice(price)}
                className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                  oneTimePrice === price
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                ${price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Free Trial Option */}
      {pricingModel !== 'one-time' && (
        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Free Trial</p>
              <p className="text-sm text-muted-foreground">Let customers try before they buy</p>
            </div>
            <Switch checked={enableFreeTrial} onCheckedChange={setEnableFreeTrial} />
          </div>

          {enableFreeTrial && (
            <div className="flex gap-2 pt-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setTrialDays(days)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    trialDays === days
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Earnings Calculator */}
      <div className="p-6 rounded-xl border-2 border-foreground/10 bg-foreground text-background space-y-5">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-400" />
          <h3 className="font-semibold">
            With {activeCustomerCount} customers
          </h3>
        </div>

        {/* Customer Count Selector */}
        <div className="flex items-center justify-center gap-2">
          {customerPresets.map((count) => (
            <button
              key={count}
              onClick={() => {
                setSelectedCustomerCount(count);
                setCustomCustomerCount('');
              }}
              className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                selectedCustomerCount === count && customCustomerCount === ''
                  ? 'border-orange-400 bg-orange-400/20 text-orange-400'
                  : 'border-background/30 hover:border-background/50'
              }`}
            >
              {count}
            </button>
          ))}
          <div className="relative">
            <Input
              type="number"
              placeholder="Custom"
              value={customCustomerCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCustomCustomerCount(isNaN(val) ? '' : Math.max(1, val));
              }}
              className="w-20 h-9 text-center text-sm bg-background/10 border-background/30 text-background placeholder:text-background/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Revenue Display */}
        {pricingModel === 'monthly' && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-background/60 mb-1">MRR</p>
              <p className="text-3xl font-bold">{formatCurrency(calculateMRR(monthlyPrice, activeCustomerCount as number))}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-background/60 mb-1">ARR</p>
              <p className="text-3xl font-bold text-orange-400">{formatCurrency(calculateARR(monthlyPrice, activeCustomerCount as number))}</p>
            </div>
          </div>
        )}

        {pricingModel === 'one-time' && (
          <div className="text-center pt-2">
            <p className="text-sm text-background/60 mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-orange-400">{formatCurrency(calculateOneTimeRevenue(oneTimePrice, activeCustomerCount as number))}</p>
          </div>
        )}

        {pricingModel === 'setup-monthly' && (() => {
          const rev = calculateSetupMonthlyRevenue(setupFee, monthlyPrice, activeCustomerCount as number);
          return (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-background/60 mb-1">Upfront</p>
                  <p className="text-2xl font-bold">{formatCurrency(rev.upfront)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-background/60 mb-1">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(rev.mrr)}</p>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-background/20">
                <p className="text-sm text-background/60 mb-1">First Year Total</p>
                <p className="text-4xl font-bold text-orange-400">{formatCurrency(rev.total)}</p>
              </div>
            </div>
          );
        })()}

        <p className="text-xs text-background/50 text-center">
          {pricingModel === 'monthly' && 'MRR (Monthly Recurring Revenue) is your predictable monthly income. ARR (Annual Recurring Revenue) is MRR × 12, showing your yearly revenue potential.'}
          {pricingModel === 'one-time' && 'Total revenue from one-time purchases. Consider offering payment plans for higher-priced products.'}
          {pricingModel === 'setup-monthly' && 'Upfront revenue from setup fees plus recurring monthly income. First year total combines both revenue streams.'}
        </p>
      </div>

      {/* AI Pricing Suggestion */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">AI Pricing Tip</p>
          <p className="text-sm text-muted-foreground">
            {pricingModel === 'monthly' && `Based on similar products, a price point of $${monthlyPrice < 29 ? '29-49' : monthlyPrice < 99 ? '49-99' : '99-199'}/month typically converts well for your market.`}
            {pricingModel === 'one-time' && `One-time products in your category typically price between $${oneTimePrice < 297 ? '297-497' : '497-997'} for optimal conversions.`}
            {pricingModel === 'setup-monthly' && `Consider a setup fee of ${setupFee < 97 ? '$97-197' : '$197-497'} with monthly pricing around $${monthlyPrice < 49 ? '49-99' : '99-199'} to maximize both upfront and recurring revenue.`}
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
