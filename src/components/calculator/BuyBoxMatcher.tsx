import React from 'react';
import { Target, Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuyBox {
  id: string;
  name: string;
  minPrice?: number;
  maxPrice?: number;
  minProfit?: number;
  minCashFlow?: number;
  preferredStrategies?: string[];
  maxRehab?: number;
  minArv?: number;
}

interface DealMetrics {
  purchasePrice?: number;
  profit?: number;
  cashFlow?: number;
  strategy?: string;
  rehabCost?: number;
  arv?: number;
}

interface BuyBoxMatcherProps {
  buyBox: BuyBox | null;
  dealMetrics: DealMetrics;
  onEditBuyBox?: () => void;
}

interface MatchCriteria {
  name: string;
  matches: boolean | null;
  actual: string;
  required: string;
}

export const BuyBoxMatcher: React.FC<BuyBoxMatcherProps> = ({
  buyBox,
  dealMetrics,
  onEditBuyBox
}) => {
  if (!buyBox) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">No Buy Box Set</h4>
              <p className="text-sm text-muted-foreground">Define your criteria to see deal matches</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEditBuyBox}>
            <Settings className="w-4 h-4 mr-2" />
            Set Up
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(v);

  // Calculate match criteria
  const criteria: MatchCriteria[] = [];
  let matchCount = 0;
  let totalCriteria = 0;

  if (buyBox.minPrice !== undefined && buyBox.maxPrice !== undefined && dealMetrics.purchasePrice) {
    const matches = dealMetrics.purchasePrice >= buyBox.minPrice && dealMetrics.purchasePrice <= buyBox.maxPrice;
    criteria.push({
      name: 'Price Range',
      matches,
      actual: formatCurrency(dealMetrics.purchasePrice),
      required: `${formatCurrency(buyBox.minPrice)} - ${formatCurrency(buyBox.maxPrice)}`
    });
    if (matches) matchCount++;
    totalCriteria++;
  }

  if (buyBox.minProfit !== undefined && dealMetrics.profit !== undefined) {
    const matches = dealMetrics.profit >= buyBox.minProfit;
    criteria.push({
      name: 'Minimum Profit',
      matches,
      actual: formatCurrency(dealMetrics.profit),
      required: `≥ ${formatCurrency(buyBox.minProfit)}`
    });
    if (matches) matchCount++;
    totalCriteria++;
  }

  if (buyBox.minCashFlow !== undefined && dealMetrics.cashFlow !== undefined) {
    const matches = dealMetrics.cashFlow >= buyBox.minCashFlow;
    criteria.push({
      name: 'Monthly Cash Flow',
      matches,
      actual: formatCurrency(dealMetrics.cashFlow),
      required: `≥ ${formatCurrency(buyBox.minCashFlow)}`
    });
    if (matches) matchCount++;
    totalCriteria++;
  }

  if (buyBox.maxRehab !== undefined && dealMetrics.rehabCost !== undefined) {
    const matches = dealMetrics.rehabCost <= buyBox.maxRehab;
    criteria.push({
      name: 'Max Rehab',
      matches,
      actual: formatCurrency(dealMetrics.rehabCost),
      required: `≤ ${formatCurrency(buyBox.maxRehab)}`
    });
    if (matches) matchCount++;
    totalCriteria++;
  }

  if (buyBox.preferredStrategies?.length && dealMetrics.strategy) {
    const matches = buyBox.preferredStrategies.includes(dealMetrics.strategy);
    criteria.push({
      name: 'Strategy',
      matches,
      actual: dealMetrics.strategy,
      required: buyBox.preferredStrategies.join(', ')
    });
    if (matches) matchCount++;
    totalCriteria++;
  }

  const matchPercentage = totalCriteria > 0 ? Math.round((matchCount / totalCriteria) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            matchPercentage >= 80 ? "bg-emerald-100 text-emerald-600" :
            matchPercentage >= 50 ? "bg-amber-100 text-amber-600" :
            "bg-red-100 text-red-600"
          )}>
            {matchPercentage}%
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Buy Box Match</h4>
            <p className="text-sm text-muted-foreground">{buyBox.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onEditBuyBox}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2">
              {c.matches ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">{c.name}</span>
            </div>
            <div className="text-right text-sm">
              <span className={cn(
                "font-medium",
                c.matches ? "text-emerald-600" : "text-red-600"
              )}>
                {c.actual}
              </span>
              <span className="text-muted-foreground ml-1">/ {c.required}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyBoxMatcher;
