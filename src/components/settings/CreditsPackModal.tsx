import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditsPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPacks: number;
}

const creditTiers = [
  { multiplier: 0, credits: 0, price: 0 },
  { multiplier: 1, credits: 5000, price: 15 },
  { multiplier: 2, credits: 10000, price: 30 },
  { multiplier: 3, credits: 15000, price: 45 },
  { multiplier: 4, credits: 20000, price: 60 },
  { multiplier: 5, credits: 25000, price: 75 },
  { multiplier: 6, credits: 30000, price: 90 },
  { multiplier: 7, credits: 35000, price: 105 },
  { multiplier: 8, credits: 40000, price: 120 },
  { multiplier: 9, credits: 45000, price: 135 },
  { multiplier: 10, credits: 50000, price: 150 },
];

export default function CreditsPackModal({ isOpen, onClose, currentPacks }: CreditsPackModalProps) {
  const [selectedTier, setSelectedTier] = useState(currentPacks);
  
  const currentTier = creditTiers[selectedTier] || creditTiers[0];
  const isCurrentPack = selectedTier === currentPacks;
  const isIncrease = selectedTier > currentPacks;

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const handleSliderChange = (value: number[]) => {
    setSelectedTier(value[0]);
  };

  const getButtonText = () => {
    if (isCurrentPack && currentPacks === 0) return 'Cancel Plan';
    if (isCurrentPack) return 'Current Plan - Slide Right To Buy More';
    if (selectedTier === 0) return 'Cancel Plan';
    if (isIncrease) return 'Increase Credit Packs';
    return 'Reduce Credit Packs';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] min-h-[520px] flex flex-col">
        <DialogHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 text-brand-green mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Optional Add-On</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col">
          {/* Pricing Display */}
          <div className="bg-muted/50 rounded-xl p-5">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-medium text-foreground">Extra Credit</span>
              <span className="text-4xl font-bold text-brand-green">${currentTier.price}</span>
              <span className="text-muted-foreground">/Month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Available exclusively for <span className="font-medium text-foreground">Pro</span>, <span className="font-medium text-foreground">Business</span> and <span className="font-medium text-foreground">Enterprise</span> plan – Add extra monthly credits to your plan. <span className="text-brand-green cursor-pointer hover:underline">Learn more.</span>
            </p>

            {/* Slider Control */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-brand-green text-white font-bold px-3 py-1.5 rounded-full text-sm min-w-[48px] text-center">
                  {currentTier.multiplier}x
                </div>
                <div className="flex-1">
                  <Slider
                    value={[selectedTier]}
                    onValueChange={handleSliderChange}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground min-w-[140px] text-right">
                  {formatCredits(currentTier.credits)} credits / Month
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-medium text-foreground">Flexible Usage:</span>
                <span className="text-muted-foreground"> Adjust or cancel packs each month as needed.</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-medium text-foreground">10% Off Credit Packs:</span>
                <span className="text-muted-foreground"> Business users get 10% off credit packs.</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-medium text-foreground">Rollover Credits:</span>
                <span className="text-muted-foreground"> Unused add-on credits roll over for up to 3 months.</span>
              </p>
            </div>
          </div>

          {/* Message Area - Fixed height to prevent layout shift */}
          <div className="min-h-[60px] flex items-center">
            {isCurrentPack && currentPacks > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 w-full">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  This is your current pack. Slide right to increase your credit pack.
                </p>
              </div>
            )}

            {selectedTier === 0 && currentPacks > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 w-full">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  If you cancel, this seat will no longer receive {formatCredits(creditTiers[currentPacks].credits)} monthly credits starting next Month.
                </p>
              </div>
            )}

            {!isCurrentPack && selectedTier > 0 && (
              <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-4 flex items-start gap-3 w-full">
                <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <p className="text-sm text-brand-green">
                  You'll receive {formatCredits(currentTier.credits)} extra credits every month.
                </p>
              </div>
            )}
          </div>

          {/* Action Button - Always at bottom */}
          <div className="mt-auto pt-2">
            <Button
              className={cn(
                "w-full",
                selectedTier === 0 
                  ? "bg-foreground hover:bg-foreground/90 text-background" 
                  : isIncrease 
                    ? "bg-brand-green hover:bg-brand-green/90 text-white"
                    : "bg-foreground hover:bg-foreground/90 text-background"
              )}
              disabled={isCurrentPack && currentPacks > 0}
              onClick={onClose}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}