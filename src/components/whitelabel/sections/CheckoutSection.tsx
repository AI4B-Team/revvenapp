import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard,
  Shield,
  Clock,
  Sparkles,
  Copy,
  ExternalLink,
  Eye,
  Plus,
  Trash2,
  Check,
  Gift,
  Timer,
  BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutSectionProps {
  license?: AppLicense;
}

const complianceBadges = [
  { id: 'ssl', name: '256-bit SSL', description: 'Encrypted', icon: Shield },
  { id: 'pci', name: 'PCI Compliant', description: 'Secure', icon: BadgeCheck },
  { id: 'stripe', name: 'Stripe Powered', description: 'Trusted', icon: CreditCard },
  { id: 'gdpr', name: 'GDPR Ready', description: 'Compliant', icon: Check },
];

export function CheckoutSection({ license }: CheckoutSectionProps) {
  const [checkoutLink, setCheckoutLink] = useState('https://yourapp.revven.app/checkout');
  const [enableConversionBooster, setEnableConversionBooster] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [discountDuration, setDiscountDuration] = useState(3);
  const [enableUrgencyTimer, setEnableUrgencyTimer] = useState(true);
  const [enableSpotlightCard, setEnableSpotlightCard] = useState(true);
  const [spotlightTitle, setSpotlightTitle] = useState('What You Get Immediately');
  const [spotlightItems, setSpotlightItems] = useState([
    'Full Platform Access In 2 Minutes',
    'Unlimited AI Usage Included',
    '14-Day Money-Back Guarantee'
  ]);
  const [enableBadges, setEnableBadges] = useState(true);
  const [selectedBadges, setSelectedBadges] = useState(['ssl', 'pci', 'stripe', 'gdpr']);
  const [enableGuarantee, setEnableGuarantee] = useState(true);
  const [guaranteeDays, setGuaranteeDays] = useState(14);
  const [guaranteeDescription, setGuaranteeDescription] = useState('Try It Risk-Free');
  const [guaranteeItems, setGuaranteeItems] = useState([
    'Customers Trust Us',
    'One-Click Refund In Dashboard'
  ]);
  const [enableFAQs, setEnableFAQs] = useState(true);
  const [checkoutFAQs, setCheckoutFAQs] = useState([
    { q: 'Will I have access to all AIs?', a: 'Yes! You will have access to the main AIs on the market, all integrated in a single platform for you.' }
  ]);

  const copyLink = () => {
    navigator.clipboard.writeText(checkoutLink);
    toast.success('Checkout link copied!');
  };

  const toggleBadge = (id: string) => {
    setSelectedBadges(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    toast.success('Checkout settings saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Checkout Configuration</h2>
        <p className="text-muted-foreground mt-1">
          Customize the checkout experience for your customers
        </p>
      </div>

      {/* Checkout Link */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Your Platform's Checkout Link</h3>
        <p className="text-sm text-muted-foreground">
          Share this link to provide direct access to your checkout process
        </p>
        
        <div className="flex gap-2">
          <Input value={checkoutLink} readOnly className="flex-1 bg-muted/30" />
          <Button onClick={copyLink} variant="default" className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Checkout
          </Button>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open In New Tab
          </Button>
        </div>
      </div>

      {/* Conversion Booster */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">Conversion Booster Offer</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 rounded">Recommended</span>
          </div>
          <Switch checked={enableConversionBooster} onCheckedChange={setEnableConversionBooster} />
        </div>
        <p className="text-sm text-muted-foreground">
          Increase your conversion rate by offering a final incentive at checkout.
        </p>

        {enableConversionBooster && (
          <>
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm text-muted-foreground mb-2">Your Offer</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-600">{discountPercent}% OFF</span>
                <span className="text-sm text-muted-foreground">
                  Applied automatically for the first {discountDuration} months
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <div className="flex gap-2 flex-wrap">
                  {[10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-4 py-2 rounded-lg border transition-all min-w-[60px] ${
                        discountPercent === pct
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration (Months)</Label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 3, 6].map((months) => (
                    <button
                      key={months}
                      onClick={() => setDiscountDuration(months)}
                      className={`px-4 py-2 rounded-lg border transition-all min-w-[60px] ${
                        discountDuration === months
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      {months} mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Urgency Timer */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-foreground">Session Urgency Timer</p>
                  <p className="text-sm text-muted-foreground">Show countdown after discount applied</p>
                </div>
              </div>
              <Switch checked={enableUrgencyTimer} onCheckedChange={setEnableUrgencyTimer} />
            </div>

            {/* Why This Converts */}
            <div className="space-y-3">
              <Label>Why This Booster Converts</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <Sparkles className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Visual Trigger</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A prominent button catches attention
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <Check className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-medium">Auto-Apply</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No coupon copy-paste needed
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-sm font-medium">Urgency</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Timer encourages action
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spotlight Card */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Spotlight Card</h3>
          <Switch checked={enableSpotlightCard} onCheckedChange={setEnableSpotlightCard} />
        </div>

        {enableSpotlightCard && (
          <>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={spotlightTitle}
                onChange={(e) => setSpotlightTitle(e.target.value)}
                placeholder="What You Get Immediately"
              />
            </div>

            <div className="space-y-2">
              <Label>Items</Label>
              {spotlightItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...spotlightItems];
                      newItems[idx] = e.target.value;
                      setSpotlightItems(newItems);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSpotlightItems(spotlightItems.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setSpotlightItems([...spotlightItems, ''])}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">{spotlightTitle}</p>
              <ul className="space-y-1">
                {spotlightItems.filter(Boolean).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Compliance Badges */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Compliance Badges</h3>
          <Switch checked={enableBadges} onCheckedChange={setEnableBadges} />
        </div>

        {enableBadges && (
          <div className="grid grid-cols-4 gap-3">
            {complianceBadges.map((badge) => {
              const Icon = badge.icon;
              const isSelected = selectedBadges.includes(badge.id);
              
              return (
                <button
                  key={badge.id}
                  onClick={() => toggleBadge(badge.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border opacity-50 hover:opacity-100'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Money-Back Guarantee */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Money-Back Guarantee</h3>
          <Switch checked={enableGuarantee} onCheckedChange={setEnableGuarantee} />
        </div>

        {enableGuarantee && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={guaranteeDescription}
                  onChange={(e) => setGuaranteeDescription(e.target.value)}
                  placeholder="Try it risk-free"
                />
              </div>
              <div className="space-y-2">
                <Label>Guarantee Period</Label>
                <div className="flex gap-2">
                  {[7, 14, 30, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => setGuaranteeDays(days)}
                      className={`px-4 py-2 rounded-lg border transition-all text-center whitespace-nowrap ${
                        guaranteeDays === days
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Guarantee Items</Label>
              {guaranteeItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...guaranteeItems];
                      newItems[idx] = e.target.value;
                      setGuaranteeItems(newItems);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGuaranteeItems(guaranteeItems.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setGuaranteeItems([...guaranteeItems, ''])}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded uppercase">
                  Guarantee
                </span>
                <span className="font-semibold text-foreground">{guaranteeDays}-Day Money-Back Guarantee</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{guaranteeDescription}</p>
              <ul className="space-y-1">
                {guaranteeItems.filter(Boolean).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Checkout FAQs */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Checkout FAQs</h3>
          <Switch checked={enableFAQs} onCheckedChange={setEnableFAQs} />
        </div>

        {enableFAQs && (
          <>
            {checkoutFAQs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Question {idx + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCheckoutFAQs(checkoutFAQs.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  value={faq.q}
                  onChange={(e) => {
                    const newFAQs = [...checkoutFAQs];
                    newFAQs[idx] = { ...faq, q: e.target.value };
                    setCheckoutFAQs(newFAQs);
                  }}
                  placeholder="Question"
                  className="bg-muted/50"
                />
                <Textarea
                  value={faq.a}
                  onChange={(e) => {
                    const newFAQs = [...checkoutFAQs];
                    newFAQs[idx] = { ...faq, a: e.target.value };
                    setCheckoutFAQs(newFAQs);
                  }}
                  placeholder="Answer"
                  rows={2}
                  className="bg-background"
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setCheckoutFAQs([...checkoutFAQs, { q: '', a: '' }])}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Checkout Settings
        </Button>
      </div>
    </div>
  );
}
