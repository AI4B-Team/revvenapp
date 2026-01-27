import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RevenuePricing =
  | { mode: "monthly"; monthlyPrice: number }
  | { mode: "one-time"; oneTimePrice: number }
  | { mode: "setup-monthly"; setupFee: number; monthlyPrice: number };

interface RevenueCalculatorProps {
  pricing: RevenuePricing;
  title?: string;
  className?: string;
}

const customerPresets = [25, 50, 100];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function RevenueCalculator({ pricing, title = "Revenue Projections", className }: RevenueCalculatorProps) {
  const [selectedCustomerCount, setSelectedCustomerCount] = useState(100);
  const [customCustomerCount, setCustomCustomerCount] = useState<number | "">("");

  const activeCustomerCount = customCustomerCount !== "" ? customCustomerCount : selectedCustomerCount;

  const computed = useMemo(() => {
    const customers = Number(activeCustomerCount || 0);

    if (pricing.mode === "monthly") {
      const mrr = pricing.monthlyPrice * customers;
      const arr = mrr * 12;
      return { mode: pricing.mode, mrr, arr } as const;
    }

    if (pricing.mode === "one-time") {
      const total = pricing.oneTimePrice * customers;
      return { mode: pricing.mode, total } as const;
    }

    const upfront = pricing.setupFee * customers;
    const mrr = pricing.monthlyPrice * customers;
    const total = upfront + mrr * 12;
    return { mode: pricing.mode, upfront, mrr, total } as const;
  }, [activeCustomerCount, pricing]);

  return (
    <div className={cn("p-4 rounded-lg bg-foreground text-background space-y-4", className)}>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-background/70">{title}</p>
        <p className="font-semibold text-sm">With {activeCustomerCount || 0} Customers</p>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {customerPresets.map((count) => (
          <button
            key={count}
            onClick={() => {
              setSelectedCustomerCount(count);
              setCustomCustomerCount("");
            }}
            className={cn(
              "px-3 py-1.5 rounded-full border transition-all text-xs font-medium",
              selectedCustomerCount === count && customCustomerCount === ""
                ? "border-primary/60 bg-primary/20 text-primary"
                : "border-background/30 hover:border-background/50",
            )}
          >
            {count}
          </button>
        ))}
        <Input
          type="number"
          placeholder="Custom"
          value={customCustomerCount}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setCustomCustomerCount(Number.isNaN(val) ? "" : Math.max(1, val));
          }}
          className="w-16 h-7 text-center text-xs bg-background/10 border-background/30 text-background placeholder:text-background/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {computed.mode === "monthly" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-background/60 mb-0.5">MRR</p>
            <p className="text-xl font-bold">{formatCurrency(computed.mrr)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-background/60 mb-0.5">ARR</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(computed.arr)}</p>
          </div>
        </div>
      )}

      {computed.mode === "one-time" && (
        <div className="text-center">
          <p className="text-xs text-background/60 mb-0.5">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(computed.total)}</p>
        </div>
      )}

      {computed.mode === "setup-monthly" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xs text-background/60 mb-0.5">Upfront</p>
              <p className="text-lg font-bold">{formatCurrency(computed.upfront)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-background/60 mb-0.5">MRR</p>
              <p className="text-lg font-bold">{formatCurrency(computed.mrr)}</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t border-background/20">
            <p className="text-xs text-background/60 mb-0.5">First Year Total</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(computed.total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
