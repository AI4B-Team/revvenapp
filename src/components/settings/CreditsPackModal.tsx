import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface CreditsPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPacks: number;
}

// Extended credit tiers matching the reference images
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
  { multiplier: 11, credits: 55000, price: 165 },
  { multiplier: 12, credits: 60000, price: 180 },
  { multiplier: 13, credits: 65000, price: 195 },
  { multiplier: 14, credits: 70000, price: 210 },
  { multiplier: 15, credits: 75000, price: 225 },
  { multiplier: 16, credits: 80000, price: 240 },
  { multiplier: 17, credits: 85000, price: 255 },
  { multiplier: 18, credits: 90000, price: 270 },
  { multiplier: 19, credits: 95000, price: 285 },
  { multiplier: 20, credits: 100000, price: 300 },
  { multiplier: 21, credits: 105000, price: 315 },
  { multiplier: 22, credits: 110000, price: 330 },
  { multiplier: 23, credits: 115000, price: 345 },
  { multiplier: 24, credits: 120000, price: 360 },
  { multiplier: 25, credits: 125000, price: 375 },
  { multiplier: 26, credits: 130000, price: 390 },
  { multiplier: 27, credits: 135000, price: 405 },
  { multiplier: 28, credits: 140000, price: 420 },
  { multiplier: 29, credits: 145000, price: 435 },
  { multiplier: 30, credits: 150000, price: 450 },
  { multiplier: 40, credits: 200000, price: 600 },
  { multiplier: 50, credits: 250000, price: 750 },
  { multiplier: 60, credits: 300000, price: 900 },
  { multiplier: 70, credits: 350000, price: 1050 },
  { multiplier: 80, credits: 400000, price: 1200 },
  { multiplier: 90, credits: 450000, price: 1350 },
  { multiplier: 100, credits: 500000, price: 1500 },
  { multiplier: 150, credits: 750000, price: 2250 },
  { multiplier: 200, credits: 1000000, price: 3000 },
  { multiplier: 300, credits: 1500000, price: 4500 },
];

export default function CreditsPackModal({ isOpen, onClose, currentPacks }: CreditsPackModalProps) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(currentPacks);
  
  const currentTier = creditTiers[selectedTierIndex] || creditTiers[0];
  const isCurrentPack = selectedTierIndex === currentPacks;
  const isIncrease = selectedTierIndex > currentPacks;
  
  // Calculate progress percentage for the visual slider
  const progressPercentage = (selectedTierIndex / (creditTiers.length - 1)) * 100;

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const handleTierChange = (value: string) => {
    setSelectedTierIndex(parseInt(value));
  };

  const getButtonText = () => {
    if (isCurrentPack && currentPacks === 0) return 'Select a Credit Pack';
    if (isCurrentPack) return 'Current Plan - Select More Credits';
    if (selectedTierIndex === 0) return 'Remove Credit Pack';
    if (isIncrease) return 'Increase Credit Packs';
    return 'Reduce Credit Packs';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] min-h-[560px] flex flex-col">
        <DialogHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 text-brand-green mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Optional Add-On</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col">
          {/* Pricing Display - Dark themed card */}
          <div className="bg-gray-900 rounded-xl p-5 text-white">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-medium text-white">Extra Credit</span>
              <span className="text-4xl font-bold text-brand-green">${formatCredits(currentTier.price)}</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Available exclusively for <span className="font-medium text-white">Advanced</span>, <span className="font-medium text-white">Infinite</span> and <span className="font-medium text-white">Wonder</span> plan – Add extra monthly credits to your plan. <span className="text-brand-green cursor-pointer hover:underline">Learn more.</span>
            </p>

            {/* Slider with Dropdown Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-brand-green text-white font-bold px-3 py-1.5 rounded-full text-sm min-w-[56px] text-center">
                  {currentTier.multiplier}x
                </div>
                <div className="flex-1 relative">
                  <Progress 
                    value={progressPercentage} 
                    className="h-3 bg-gray-700 [&>div]:bg-brand-green rounded-full"
                  />
                </div>
                <Select value={selectedTierIndex.toString()} onValueChange={handleTierChange}>
                  <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                    <SelectValue>
                      {formatCredits(currentTier.credits)} credits / month
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-gray-800 border-gray-700">
                    {creditTiers.slice(1).map((tier, index) => (
                      <SelectItem 
                        key={tier.multiplier} 
                        value={(index + 1).toString()}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                      >
                        {formatCredits(tier.credits)} credits / month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <span className="text-muted-foreground"> Wonder users get 10% off credit packs.</span>
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
                  This is your current pack. Select a higher tier to increase your credits.
                </p>
              </div>
            )}

            {selectedTierIndex === 0 && currentPacks > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 w-full">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  If you remove the pack, you will no longer receive {formatCredits(creditTiers[currentPacks].credits)} monthly credits.
                </p>
              </div>
            )}

            {!isCurrentPack && selectedTierIndex > 0 && (
              <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-4 flex items-start gap-3 w-full">
                <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <p className="text-sm text-brand-green">
                  You'll receive {formatCredits(currentTier.credits)} extra credits every month for ${formatCredits(currentTier.price)}.
                </p>
              </div>
            )}
          </div>

          {/* Action Button - Always at bottom */}
          <div className="mt-auto pt-2">
            <Button
              className={cn(
                "w-full h-12 text-base font-medium",
                selectedTierIndex === 0 && currentPacks > 0
                  ? "bg-destructive hover:bg-destructive/90 text-white" 
                  : isIncrease || (!isCurrentPack && selectedTierIndex > 0)
                    ? "bg-brand-green hover:bg-brand-green/90 text-white"
                    : "bg-brand-blue hover:bg-brand-blue/90 text-white"
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
