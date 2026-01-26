import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Check,
  List,
  Plus,
  Trash2,
} from 'lucide-react';
import AITextInput from '../AITextInput';

type PricingModel = 'monthly' | 'one-time' | 'setup-monthly';

interface PricingBlockEditorProps {
  content: Record<string, any>;
  onContentChange: (updates: Record<string, any>) => void;
}

const pricePresets = [7, 17, 27, 47, 97, 197];
const customerPresets = [25, 50, 100];

export function PricingBlockEditor({ content, onContentChange }: PricingBlockEditorProps) {
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    content.pricingModel === 'both' ? 'setup-monthly' : (content.pricingModel || 'monthly')
  );
  const [monthlyPrice, setMonthlyPrice] = useState(content.monthlyPrice || 47);
  const [oneTimePrice, setOneTimePrice] = useState(content.oneTimePrice || 297);
  const [setupFee, setSetupFee] = useState(content.setupFee || 97);
  const [customMonthlyPrice, setCustomMonthlyPrice] = useState<string>('');
  const [customSetupFee, setCustomSetupFee] = useState<string>('');
  const [customOneTimePrice, setCustomOneTimePrice] = useState<string>('');
  const [enableFreeTrial, setEnableFreeTrial] = useState(content.enableFreeTrial || false);
  const [trialDays, setTrialDays] = useState(content.trialDays || 14);
  const [selectedCustomerCount, setSelectedCustomerCount] = useState(100);
  const [customCustomerCount, setCustomCustomerCount] = useState<number | ''>('');
  
  // Pricing Features (what customers get)
  const defaultFeatures = [
    'Unlimited AI Content Generation',
    'Advanced Audience Analytics',
    'Multi-Platform Scheduling',
    'Viral Content Templates',
  ];
  const [pricingFeatures, setPricingFeatures] = useState<string[]>(
    content.pricingFeatures || defaultFeatures
  );
  const [newFeature, setNewFeature] = useState('');

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

  const handlePricingModelChange = (model: PricingModel) => {
    setPricingModel(model);
    onContentChange({ 
      pricingModel: model === 'setup-monthly' ? 'both' : model,
      monthlyPrice: model === 'one-time' ? 0 : monthlyPrice,
      oneTimePrice: model === 'monthly' ? 0 : (model === 'one-time' ? oneTimePrice : 0),
      setupFee: model === 'setup-monthly' ? setupFee : 0
    });
  };

  const handleMonthlyPriceChange = (price: number) => {
    setMonthlyPrice(price);
    onContentChange({ monthlyPrice: price });
  };

  const handleOneTimePriceChange = (price: number) => {
    setOneTimePrice(price);
    onContentChange({ oneTimePrice: price });
  };

  const handleSetupFeeChange = (fee: number) => {
    setSetupFee(fee);
    onContentChange({ setupFee: fee });
  };

  const handleFreeTrialChange = (enabled: boolean) => {
    setEnableFreeTrial(enabled);
    onContentChange({ enableFreeTrial: enabled, trialDays: enabled ? trialDays : 0 });
  };

  const handleTrialDaysChange = (days: number) => {
    setTrialDays(days);
    onContentChange({ trialDays: days });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updated = [...pricingFeatures, newFeature.trim()];
      setPricingFeatures(updated);
      onContentChange({ pricingFeatures: updated });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updated = pricingFeatures.filter((_, i) => i !== index);
    setPricingFeatures(updated);
    onContentChange({ pricingFeatures: updated });
  };

  const handleUpdateFeature = (index: number, value: string) => {
    const updated = [...pricingFeatures];
    updated[index] = value;
    setPricingFeatures(updated);
    onContentChange({ pricingFeatures: updated });
  };

  const pricingModels = [
    { 
      id: 'monthly' as PricingModel, 
      name: 'Recurring Subscription', 
      description: 'Monthly recurring payments',
      icon: Calendar
    },
    { 
      id: 'one-time' as PricingModel, 
      name: 'Single Payment', 
      description: 'One-time purchase',
      icon: DollarSign
    },
    { 
      id: 'setup-monthly' as PricingModel, 
      name: 'Setup Fee + Recurring', 
      description: 'Upfront fee plus monthly',
      icon: TrendingUp
    },
  ];

  return (
    <div className="space-y-5">
      {/* Display Settings */}
      <div className="space-y-4">
        <AITextInput
          label="Section Headline"
          value={content.headline || ''}
          onChange={(value) => onContentChange({ headline: value })}
          placeholder="Simple, Transparent Pricing"
          context="headline"
        />
        <AITextInput
          label="Subheadline"
          value={content.subheadline || ''}
          onChange={(value) => onContentChange({ subheadline: value })}
          placeholder="Start free, upgrade when you need more"
          context="subheadline"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-4">
        <Label className="text-sm font-semibold text-foreground">Pricing Model</Label>
      </div>

      {/* Pricing Model Selection */}
      <div className="grid grid-cols-1 gap-2">
        {pricingModels.map((model) => {
          const IconComponent = model.icon;
          return (
            <button
              key={model.id}
              onClick={() => handlePricingModelChange(model.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                pricingModel === model.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                pricingModel === model.id ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground">{model.name}</span>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
              {pricingModel === model.id && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Setup Fee for Setup + Monthly Model - FIRST */}
      {pricingModel === 'setup-monthly' && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">One-Time Setup Fee</span>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              <span className="text-lg text-muted-foreground align-top">$</span>
              {setupFee}
            </p>
          </div>

          <Slider
            value={[Math.min(setupFee, 1000)]}
            onValueChange={([v]) => {
              handleSetupFeeChange(v);
              setCustomSetupFee('');
            }}
            min={0}
            max={1000}
            step={1}
            className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.range]:bg-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$1,000</span>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {[0, 47, 97, 197, 497].map((price) => (
              <button
                key={price}
                onClick={() => {
                  handleSetupFeeChange(price);
                  setCustomSetupFee('');
                }}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                  setupFee === price && customSetupFee === ''
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                {price === 0 ? 'No Fee' : `$${price}`}
              </button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={customSetupFee}
              onChange={(e) => {
                const val = e.target.value;
                setCustomSetupFee(val);
                const num = parseInt(val);
                if (!isNaN(num) && num >= 0) {
                  handleSetupFeeChange(num);
                }
              }}
              className="w-20 h-7 text-center text-xs bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}

      {/* Monthly Pricing with Slider - SECOND */}
      {(pricingModel === 'monthly' || pricingModel === 'setup-monthly') && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              <span className="text-xl text-muted-foreground align-top">$</span>
              {monthlyPrice}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <Slider
            value={[Math.min(monthlyPrice, 1000)]}
            onValueChange={([v]) => {
              handleMonthlyPriceChange(v);
              setCustomMonthlyPrice('');
            }}
            min={0}
            max={1000}
            step={1}
            className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.range]:bg-emerald-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$1,000</span>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {pricePresets.map((price) => (
              <button
                key={price}
                onClick={() => {
                  handleMonthlyPriceChange(price);
                  setCustomMonthlyPrice('');
                }}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  monthlyPrice === price && customMonthlyPrice === ''
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                ${price}
              </button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={customMonthlyPrice}
              onChange={(e) => {
                const val = e.target.value;
                setCustomMonthlyPrice(val);
                const num = parseInt(val);
                if (!isNaN(num) && num >= 0) {
                  handleMonthlyPriceChange(num);
                }
              }}
              className="w-20 h-7 text-center text-xs bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}

      {/* One-Time Pricing */}
      {pricingModel === 'one-time' && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Lifetime Access Price</span>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              <span className="text-xl text-muted-foreground align-top">$</span>
              {oneTimePrice}
            </p>
          </div>

          <Slider
            value={[Math.min(oneTimePrice, 1000)]}
            onValueChange={([v]) => {
              handleOneTimePriceChange(v);
              setCustomOneTimePrice('');
            }}
            min={0}
            max={1000}
            step={1}
            className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500 [&_.range]:bg-emerald-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$1,000</span>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {[97, 197, 297, 497, 997].map((price) => (
              <button
                key={price}
                onClick={() => {
                  handleOneTimePriceChange(price);
                  setCustomOneTimePrice('');
                }}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  oneTimePrice === price && customOneTimePrice === ''
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                ${price}
              </button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              value={customOneTimePrice}
              onChange={(e) => {
                const val = e.target.value;
                setCustomOneTimePrice(val);
                const num = parseInt(val);
                if (!isNaN(num) && num >= 0) {
                  handleOneTimePriceChange(num);
                }
              }}
              className="w-20 h-7 text-center text-xs bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}

      {/* Free Trial Option */}
      {pricingModel !== 'one-time' && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-foreground">Enable Free Trial</p>
              <p className="text-xs text-muted-foreground">Let customers try before they buy</p>
            </div>
            <Switch checked={enableFreeTrial} onCheckedChange={handleFreeTrialChange} />
          </div>

          {enableFreeTrial && (
            <div className="flex gap-2 pt-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleTrialDaysChange(days)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    trialDays === days
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pricing Card Features - What Customers Get */}
      <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-sm text-foreground">Pricing Card Features</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Bullet points shown in the pricing box
        </p>

        {/* Feature List */}
        <div className="space-y-2">
          {pricingFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <Input
                value={feature}
                onChange={(e) => handleUpdateFeature(index, e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFeature(index)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Feature */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add a feature..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
            className="flex-1 h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddFeature}
            disabled={!newFeature.trim()}
            className="gap-1 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="p-4 rounded-lg bg-foreground text-background space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-background/70">Revenue Projections</p>
          <p className="font-semibold text-sm">
            With {activeCustomerCount} Customers
          </p>
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
              className={`px-3 py-1.5 rounded-full border transition-all text-xs font-medium ${
                selectedCustomerCount === count && customCustomerCount === ''
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : 'border-background/30 hover:border-background/50'
              }`}
            >
              {count}
            </button>
          ))}
          <Input
            type="number"
            placeholder="#"
            value={customCustomerCount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCustomCustomerCount(isNaN(val) ? '' : Math.max(1, val));
            }}
            className="w-14 h-7 text-center text-xs bg-background/10 border-background/30 text-background placeholder:text-background/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Revenue Display */}
        {pricingModel === 'monthly' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xs text-background/60 mb-0.5">MRR</p>
              <p className="text-xl font-bold">{formatCurrency(calculateMRR(monthlyPrice, activeCustomerCount as number))}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-background/60 mb-0.5">ARR</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(calculateARR(monthlyPrice, activeCustomerCount as number))}</p>
            </div>
          </div>
        )}

        {pricingModel === 'one-time' && (
          <div className="text-center">
            <p className="text-xs text-background/60 mb-0.5">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(calculateOneTimeRevenue(oneTimePrice, activeCustomerCount as number))}</p>
          </div>
        )}

        {pricingModel === 'setup-monthly' && (() => {
          const rev = calculateSetupMonthlyRevenue(setupFee, monthlyPrice, activeCustomerCount as number);
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-background/60 mb-0.5">Upfront</p>
                  <p className="text-lg font-bold">{formatCurrency(rev.upfront)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-background/60 mb-0.5">MRR</p>
                  <p className="text-lg font-bold">{formatCurrency(rev.mrr)}</p>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-background/20">
                <p className="text-xs text-background/60 mb-0.5">First Year Total</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(rev.total)}</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
