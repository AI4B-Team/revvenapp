import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, PiggyBank, Percent, Calculator, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type OfferType = 'cash' | 'interest-only' | 'principal-only';

interface CreativeFinanceData {
  // Property Info
  arv: string;
  askingPrice: string;
  sqft: string;
  grossMonthlyRent: string;
  netRentPercent: number;
  
  // Cash Offer Inputs
  discount: number;
  repairsPerSqft: string;
  desiredProfit: string;
  
  // Seller Finance Inputs
  downPaymentPercent: number;
  interestRate: number;
  balloonYears: number;
  numPayments: number; // For principal-only option
}

interface CalculatedResults {
  cash: {
    purchasePrice: number;
    repairCost: number;
    cashIn: number;
    monthlyRent: number;
    croi: number;
  };
  interestOnly: {
    purchasePriceARV: number;
    purchasePriceAsking: number;
    downPaymentARV: number;
    downPaymentAsking: number;
    annualNetRent: number;
    annualDebtServiceARV: number;
    annualDebtServiceAsking: number;
    annualCADSARV: number;
    annualCADSAsking: number;
    cashInARV: number;
    cashInAsking: number;
    croiARV: number;
    croiAsking: number;
    dscrARV: number;
    dscrAsking: number;
    balloonPaymentARV: number;
    balloonPaymentAsking: number;
    monthlyPaymentARV: number;
    monthlyPaymentAsking: number;
  };
  principalOnly: {
    purchasePriceARV: number;
    purchasePriceAsking: number;
    downPaymentARV: number;
    downPaymentAsking: number;
    annualNetRent: number;
    annualDebtServiceARV: number;
    annualDebtServiceAsking: number;
    annualCADSARV: number;
    annualCADSAsking: number;
    cashInARV: number;
    cashInAsking: number;
    croiARV: number;
    croiAsking: number;
    dscrARV: number;
    dscrAsking: number;
    monthlyPaymentARV: number;
    monthlyPaymentAsking: number;
  };
}

interface CreativeFinanceCalculatorProps {
  onDataChange?: (data: CreativeFinanceData, results: CalculatedResults) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const InputField = ({ 
  label, 
  value, 
  onChange, 
  prefix = '', 
  suffix = '',
  type = 'number',
  step = '1'
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  step?: string;
}) => (
  <div className="flex items-center justify-between gap-4">
    <label className="text-sm font-medium text-foreground whitespace-nowrap">{label}</label>
    <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary w-40">
      {prefix && <span className="pl-3 text-muted-foreground text-sm flex-shrink-0">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        className={cn(
          "w-full px-2 py-2 bg-transparent outline-none text-sm",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          suffix ? "text-right" : ""
        )}
      />
      {suffix && <span className="pr-3 text-muted-foreground text-sm flex-shrink-0">{suffix}</span>}
    </div>
  </div>
);

const ResultCard = ({ 
  label, 
  value, 
  highlight = false, 
  positive = false,
  negative = false,
  subValue = ''
}: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
  positive?: boolean;
  negative?: boolean;
  subValue?: string;
}) => (
  <div className={cn(
    "flex items-center justify-between p-3 rounded-lg",
    highlight ? "bg-primary/10 border border-primary/20" : "bg-background/50"
  )}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="text-right">
      <span className={cn(
        "font-bold",
        positive ? "text-green-600" : negative ? "text-red-600" : ""
      )}>{value}</span>
      {subValue && <span className="text-xs text-muted-foreground ml-1">({subValue})</span>}
    </div>
  </div>
);

const DSCRIndicator = ({ value }: { value: number }) => {
  const isGood = value >= 1.25;
  const isOk = value >= 1.0 && value < 1.25;
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg",
      isGood ? "bg-green-100 border border-green-200" : isOk ? "bg-yellow-100 border border-yellow-200" : "bg-red-100 border border-red-200"
    )}>
      <span className="text-sm font-medium">Debt Service Coverage Ratio</span>
      <span className={cn(
        "font-bold",
        isGood ? "text-green-700" : isOk ? "text-yellow-700" : "text-red-700"
      )}>{value.toFixed(2)}</span>
    </div>
  );
};

export const CreativeFinanceCalculator: React.FC<CreativeFinanceCalculatorProps> = ({ onDataChange }) => {
  const [offerType, setOfferType] = useState<OfferType>('cash');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [data, setData] = useState<CreativeFinanceData>({
    arv: '',
    askingPrice: '',
    sqft: '',
    grossMonthlyRent: '',
    netRentPercent: 70,
    discount: 65,
    repairsPerSqft: '5',
    desiredProfit: '20000',
    downPaymentPercent: 10,
    interestRate: 5,
    balloonYears: 10,
    numPayments: 300
  });

  const results = useMemo<CalculatedResults>(() => {
    const arv = parseFloat(data.arv) || 0;
    const asking = parseFloat(data.askingPrice) || 0;
    const sqft = parseFloat(data.sqft) || 0;
    const grossRent = parseFloat(data.grossMonthlyRent) || 0;
    const netRentPercent = data.netRentPercent / 100;
    const discount = data.discount / 100;
    const repairsPerSqft = parseFloat(data.repairsPerSqft) || 0;
    const desiredProfit = parseFloat(data.desiredProfit) || 0;
    const downPaymentPercent = data.downPaymentPercent / 100;
    const interestRate = data.interestRate / 100;
    const balloonYears = data.balloonYears;
    const numPayments = data.numPayments;

    const annualNetRent = grossRent * 12 * netRentPercent;
    const monthlyNetRent = grossRent * netRentPercent;

    // Cash Offer Calculations
    const cashPurchasePrice = arv * discount - (sqft * repairsPerSqft) - desiredProfit;
    const cashRepairCost = sqft * repairsPerSqft;
    const cashIn = cashPurchasePrice + cashRepairCost;
    const cashCROI = cashIn > 0 ? (annualNetRent / cashIn) * 100 : 0;

    // Seller Finance (Interest Only) Calculations
    const sfIODiscountARV = 0.90; // 90% of ARV
    const sfIODiscountAsking = 0.90; // 90% of asking
    const sfIOPurchasePriceARV = arv * sfIODiscountARV;
    const sfIOPurchasePriceAsking = asking * sfIODiscountAsking;
    const sfIODownPaymentARV = sfIOPurchasePriceARV * downPaymentPercent;
    const sfIODownPaymentAsking = sfIOPurchasePriceAsking * downPaymentPercent;
    const sfIOFinancedARV = sfIOPurchasePriceARV - sfIODownPaymentARV;
    const sfIOFinancedAsking = sfIOPurchasePriceAsking - sfIODownPaymentAsking;
    const sfIOAnnualDebtServiceARV = sfIOFinancedARV * interestRate;
    const sfIOAnnualDebtServiceAsking = sfIOFinancedAsking * interestRate;
    const sfIOMonthlyPaymentARV = sfIOAnnualDebtServiceARV / 12;
    const sfIOMonthlyPaymentAsking = sfIOAnnualDebtServiceAsking / 12;
    const sfIOAnnualCADSARV = annualNetRent - sfIOAnnualDebtServiceARV;
    const sfIOAnnualCADSAsking = annualNetRent - sfIOAnnualDebtServiceAsking;
    const sfIOCashInARV = sfIODownPaymentARV + cashRepairCost;
    const sfIOCashInAsking = sfIODownPaymentAsking + cashRepairCost;
    const sfIOCROIARV = sfIOCashInARV > 0 ? (annualNetRent / sfIOCashInARV) * 100 : 0;
    const sfIOCROIAsking = sfIOCashInAsking > 0 ? (annualNetRent / sfIOCashInAsking) * 100 : 0;
    const sfIODSCRARV = sfIOAnnualDebtServiceARV > 0 ? annualNetRent / sfIOAnnualDebtServiceARV : 0;
    const sfIODSCRAsking = sfIOAnnualDebtServiceAsking > 0 ? annualNetRent / sfIOAnnualDebtServiceAsking : 0;
    const sfIOBalloonARV = sfIOFinancedARV; // Interest only, so balloon = principal
    const sfIOBalloonAsking = sfIOFinancedAsking;

    // Seller Finance (Principal Only) Calculations
    const sfPODiscountARV = 0.95; // 95% of ARV
    const sfPODiscountAsking = 1.0; // 100% of asking
    const sfPODownPaymentPercentARV = 0.20; // 20% down for ARV
    const sfPODownPaymentPercentAsking = 0.20; // 20% down for asking
    const sfPOPurchasePriceARV = arv * sfPODiscountARV;
    const sfPOPurchasePriceAsking = asking * sfPODiscountAsking;
    const sfPODownPaymentARV = sfPOPurchasePriceARV * sfPODownPaymentPercentARV;
    const sfPODownPaymentAsking = sfPOPurchasePriceAsking * sfPODownPaymentPercentAsking;
    const sfPOFinancedARV = sfPOPurchasePriceARV - sfPODownPaymentARV;
    const sfPOFinancedAsking = sfPOPurchasePriceAsking - sfPODownPaymentAsking;
    const sfPOMonthlyPaymentARV = numPayments > 0 ? sfPOFinancedARV / numPayments : 0;
    const sfPOMonthlyPaymentAsking = numPayments > 0 ? sfPOFinancedAsking / numPayments : 0;
    const sfPOAnnualDebtServiceARV = sfPOMonthlyPaymentARV * 12;
    const sfPOAnnualDebtServiceAsking = sfPOMonthlyPaymentAsking * 12;
    const sfPOAnnualCADSARV = annualNetRent - sfPOAnnualDebtServiceARV;
    const sfPOAnnualCADSAsking = annualNetRent - sfPOAnnualDebtServiceAsking;
    const sfPOCashInARV = sfPODownPaymentARV + cashRepairCost;
    const sfPOCashInAsking = sfPODownPaymentAsking + cashRepairCost;
    const sfPOCROIARV = sfPOCashInARV > 0 ? (annualNetRent / sfPOCashInARV) * 100 : 0;
    const sfPOCROIAsking = sfPOCashInAsking > 0 ? (annualNetRent / sfPOCashInAsking) * 100 : 0;
    const sfPODSCRARV = sfPOAnnualDebtServiceARV > 0 ? annualNetRent / sfPOAnnualDebtServiceARV : 0;
    const sfPODSCRAsking = sfPOAnnualDebtServiceAsking > 0 ? annualNetRent / sfPOAnnualDebtServiceAsking : 0;

    return {
      cash: {
        purchasePrice: cashPurchasePrice,
        repairCost: cashRepairCost,
        cashIn: cashIn,
        monthlyRent: monthlyNetRent,
        croi: cashCROI
      },
      interestOnly: {
        purchasePriceARV: sfIOPurchasePriceARV,
        purchasePriceAsking: sfIOPurchasePriceAsking,
        downPaymentARV: sfIODownPaymentARV,
        downPaymentAsking: sfIODownPaymentAsking,
        annualNetRent: annualNetRent,
        annualDebtServiceARV: sfIOAnnualDebtServiceARV,
        annualDebtServiceAsking: sfIOAnnualDebtServiceAsking,
        annualCADSARV: sfIOAnnualCADSARV,
        annualCADSAsking: sfIOAnnualCADSAsking,
        cashInARV: sfIOCashInARV,
        cashInAsking: sfIOCashInAsking,
        croiARV: sfIOCROIARV,
        croiAsking: sfIOCROIAsking,
        dscrARV: sfIODSCRARV,
        dscrAsking: sfIODSCRAsking,
        balloonPaymentARV: sfIOBalloonARV,
        balloonPaymentAsking: sfIOBalloonAsking,
        monthlyPaymentARV: sfIOMonthlyPaymentARV,
        monthlyPaymentAsking: sfIOMonthlyPaymentAsking
      },
      principalOnly: {
        purchasePriceARV: sfPOPurchasePriceARV,
        purchasePriceAsking: sfPOPurchasePriceAsking,
        downPaymentARV: sfPODownPaymentARV,
        downPaymentAsking: sfPODownPaymentAsking,
        annualNetRent: annualNetRent,
        annualDebtServiceARV: sfPOAnnualDebtServiceARV,
        annualDebtServiceAsking: sfPOAnnualDebtServiceAsking,
        annualCADSARV: sfPOAnnualCADSARV,
        annualCADSAsking: sfPOAnnualCADSAsking,
        cashInARV: sfPOCashInARV,
        cashInAsking: sfPOCashInAsking,
        croiARV: sfPOCROIARV,
        croiAsking: sfPOCROIAsking,
        dscrARV: sfPODSCRARV,
        dscrAsking: sfPODSCRAsking,
        monthlyPaymentARV: sfPOMonthlyPaymentARV,
        monthlyPaymentAsking: sfPOMonthlyPaymentAsking
      }
    };
  }, [data]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
  };

  const updateData = (key: keyof CreativeFinanceData, value: string | number) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const offerTypes: { id: OfferType; label: string; description: string }[] = [
    { id: 'cash', label: 'All Cash', description: 'Full cash purchase' },
    { id: 'interest-only', label: 'Seller Finance (Interest)', description: 'Interest-only payments with balloon' },
    { id: 'principal-only', label: 'Seller Finance (Principal)', description: 'Principal-only amortizing' }
  ];

  return (
    <div className="space-y-6">
      {/* Offer Type Toggle */}
      <div className="flex flex-wrap gap-2">
        {offerTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setOfferType(type.id)}
            className={cn(
              "flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 transition-all duration-200 text-center",
              offerType === type.id
                ? "border-pink-500 bg-pink-50 text-pink-700"
                : "border-border bg-card hover:border-pink-300 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="font-semibold text-sm">{type.label}</div>
            <div className="text-xs opacity-70">{type.description}</div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs Section */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            Property & Deal Inputs
          </h3>
          
          <div className="space-y-4">
            <div className="border-b border-border pb-3 mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Property Details</h4>
              <div className="space-y-3">
                <InputField label="After Repair Value (ARV)" value={data.arv} onChange={(val) => updateData('arv', val)} prefix="$" />
                <InputField label="Seller's Asking Price" value={data.askingPrice} onChange={(val) => updateData('askingPrice', val)} prefix="$" />
                <InputField label="Square Footage" value={data.sqft} onChange={(val) => updateData('sqft', val)} suffix="sqft" />
                <InputField label="Gross Monthly Rent" value={data.grossMonthlyRent} onChange={(val) => updateData('grossMonthlyRent', val)} prefix="$" />
                <InputField label="Net Rent %" value={data.netRentPercent} onChange={(val) => updateData('netRentPercent', parseFloat(val) || 0)} suffix="%" />
              </div>
            </div>

            {offerType === 'cash' && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Cash Offer Parameters</h4>
                <div className="space-y-3">
                  <InputField label="Discount (% of ARV)" value={data.discount} onChange={(val) => updateData('discount', parseFloat(val) || 0)} suffix="%" />
                  <InputField label="Repairs (per sqft)" value={data.repairsPerSqft} onChange={(val) => updateData('repairsPerSqft', val)} prefix="$" />
                  <InputField label="Desired Profit" value={data.desiredProfit} onChange={(val) => updateData('desiredProfit', val)} prefix="$" />
                </div>
              </div>
            )}

            {offerType === 'interest-only' && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Seller Finance Terms (Interest-Only)</h4>
                <div className="space-y-3">
                  <InputField label="Down Payment" value={data.downPaymentPercent} onChange={(val) => updateData('downPaymentPercent', parseFloat(val) || 0)} suffix="%" />
                  <InputField label="Interest Rate" value={data.interestRate} onChange={(val) => updateData('interestRate', parseFloat(val) || 0)} suffix="%" step="0.1" />
                  <InputField label="Balloon Due (Years)" value={data.balloonYears} onChange={(val) => updateData('balloonYears', parseInt(val) || 0)} suffix="yrs" />
                </div>
              </div>
            )}

            {offerType === 'principal-only' && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Seller Finance Terms (Principal-Only)</h4>
                <div className="space-y-3">
                  <InputField label="# of Monthly Payments" value={data.numPayments} onChange={(val) => updateData('numPayments', parseInt(val) || 0)} suffix="pmts" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-800">
            <PiggyBank className="w-5 h-5" />
            {offerType === 'cash' ? 'All Cash Offer Analysis' : 
             offerType === 'interest-only' ? 'Seller Finance (Interest-Only)' : 
             'Seller Finance (Principal-Only)'}
          </h3>

          {offerType === 'cash' && (
            <div className="space-y-3">
              <ResultCard label="Purchase Price" value={formatCurrency(results.cash.purchasePrice)} highlight />
              <ResultCard label="Repair Cost" value={formatCurrency(results.cash.repairCost)} />
              <ResultCard label="Your 'Cash In'" value={formatCurrency(results.cash.cashIn)} />
              <ResultCard label="Monthly Rent (Net)" value={formatCurrency(results.cash.monthlyRent)} />
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                results.cash.croi >= 10 ? "bg-green-100 border border-green-200" : "bg-yellow-100 border border-yellow-200"
              )}>
                <span className="text-sm font-medium">Cash-on-Cash ROI (CROI)</span>
                <span className={cn("font-bold", results.cash.croi >= 10 ? "text-green-700" : "text-yellow-700")}>
                  {formatPercent(results.cash.croi)}
                </span>
              </div>
            </div>
          )}

          {offerType === 'interest-only' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-pink-200/50 rounded-lg">
                  <div className="text-xs text-pink-600 font-medium">% of ARV</div>
                  <div className="text-lg font-bold text-pink-800">Offer This Price</div>
                </div>
                <div className="text-center p-2 bg-pink-200/50 rounded-lg">
                  <div className="text-xs text-pink-600 font-medium">% of Asking</div>
                  <div className="text-lg font-bold text-pink-800">Don't Use This</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Purchase Price" value={formatCurrency(results.interestOnly.purchasePriceARV)} highlight />
                <ResultCard label="Purchase Price" value={formatCurrency(results.interestOnly.purchasePriceAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Down Payment" value={formatCurrency(results.interestOnly.downPaymentARV)} />
                <ResultCard label="Down Payment" value={formatCurrency(results.interestOnly.downPaymentAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Monthly Payment" value={formatCurrency(results.interestOnly.monthlyPaymentARV)} />
                <ResultCard label="Monthly Payment" value={formatCurrency(results.interestOnly.monthlyPaymentAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual Net Rent" value={formatCurrency(results.interestOnly.annualNetRent)} />
                <ResultCard label="Annual Net Rent" value={formatCurrency(results.interestOnly.annualNetRent)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual Debt Service" value={formatCurrency(results.interestOnly.annualDebtServiceARV)} />
                <ResultCard label="Annual Debt Service" value={formatCurrency(results.interestOnly.annualDebtServiceAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual C.A.D.S." value={formatCurrency(results.interestOnly.annualCADSARV)} positive={results.interestOnly.annualCADSARV > 0} negative={results.interestOnly.annualCADSARV < 0} />
                <ResultCard label="Annual C.A.D.S." value={formatCurrency(results.interestOnly.annualCADSAsking)} positive={results.interestOnly.annualCADSAsking > 0} negative={results.interestOnly.annualCADSAsking < 0} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Cash In (DwnPmt+Rep)" value={formatCurrency(results.interestOnly.cashInARV)} />
                <ResultCard label="Cash In (DwnPmt+Rep)" value={formatCurrency(results.interestOnly.cashInAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  results.interestOnly.croiARV >= 10 ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                )}>
                  <span className="text-sm font-medium">CROI</span>
                  <span className={cn("font-bold", results.interestOnly.croiARV >= 10 ? "text-green-700" : "text-red-700")}>
                    {formatPercent(results.interestOnly.croiARV)}
                  </span>
                </div>
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  results.interestOnly.croiAsking >= 10 ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                )}>
                  <span className="text-sm font-medium">CROI</span>
                  <span className={cn("font-bold", results.interestOnly.croiAsking >= 10 ? "text-green-700" : "text-red-700")}>
                    {formatPercent(results.interestOnly.croiAsking)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DSCRIndicator value={results.interestOnly.dscrARV} />
                <DSCRIndicator value={results.interestOnly.dscrAsking} />
              </div>
              <div className="border-t border-pink-200 pt-3 mt-3">
                <h4 className="text-sm font-semibold text-pink-700 mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <ResultCard label="Cash at Closing" value={formatCurrency(results.interestOnly.downPaymentARV)} />
                  <ResultCard label="Cash at Closing" value={formatCurrency(results.interestOnly.downPaymentAsking)} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <ResultCard label="Balloon Payment" value={formatCurrency(results.interestOnly.balloonPaymentARV)} />
                  <ResultCard label="Balloon Payment" value={formatCurrency(results.interestOnly.balloonPaymentAsking)} />
                </div>
              </div>
            </div>
          )}

          {offerType === 'principal-only' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-pink-200/50 rounded-lg">
                  <div className="text-xs text-pink-600 font-medium">% of ARV</div>
                  <div className="text-lg font-bold text-pink-800">Offer This Price</div>
                </div>
                <div className="text-center p-2 bg-pink-200/50 rounded-lg">
                  <div className="text-xs text-pink-600 font-medium">% of Asking</div>
                  <div className="text-lg font-bold text-pink-800">Don't Use This</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Purchase Price" value={formatCurrency(results.principalOnly.purchasePriceARV)} highlight />
                <ResultCard label="Purchase Price" value={formatCurrency(results.principalOnly.purchasePriceAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Down Payment" value={formatCurrency(results.principalOnly.downPaymentARV)} />
                <ResultCard label="Down Payment" value={formatCurrency(results.principalOnly.downPaymentAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Monthly Payment" value={formatCurrency(results.principalOnly.monthlyPaymentARV)} />
                <ResultCard label="Monthly Payment" value={formatCurrency(results.principalOnly.monthlyPaymentAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual Net Rent" value={formatCurrency(results.principalOnly.annualNetRent)} />
                <ResultCard label="Annual Net Rent" value={formatCurrency(results.principalOnly.annualNetRent)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual Debt Service" value={formatCurrency(results.principalOnly.annualDebtServiceARV)} />
                <ResultCard label="Annual Debt Service" value={formatCurrency(results.principalOnly.annualDebtServiceAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Annual C.A.D.S." value={formatCurrency(results.principalOnly.annualCADSARV)} positive={results.principalOnly.annualCADSARV > 0} negative={results.principalOnly.annualCADSARV < 0} />
                <ResultCard label="Annual C.A.D.S." value={formatCurrency(results.principalOnly.annualCADSAsking)} positive={results.principalOnly.annualCADSAsking > 0} negative={results.principalOnly.annualCADSAsking < 0} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ResultCard label="Cash In (DwnPmt+Rep)" value={formatCurrency(results.principalOnly.cashInARV)} />
                <ResultCard label="Cash In (DwnPmt+Rep)" value={formatCurrency(results.principalOnly.cashInAsking)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  results.principalOnly.croiARV >= 10 ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                )}>
                  <span className="text-sm font-medium">CROI</span>
                  <span className={cn("font-bold", results.principalOnly.croiARV >= 10 ? "text-green-700" : "text-red-700")}>
                    {formatPercent(results.principalOnly.croiARV)}
                  </span>
                </div>
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  results.principalOnly.croiAsking >= 10 ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                )}>
                  <span className="text-sm font-medium">CROI</span>
                  <span className={cn("font-bold", results.principalOnly.croiAsking >= 10 ? "text-green-700" : "text-red-700")}>
                    {formatPercent(results.principalOnly.croiAsking)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DSCRIndicator value={results.principalOnly.dscrARV} />
                <DSCRIndicator value={results.principalOnly.dscrAsking} />
              </div>
              <div className="border-t border-pink-200 pt-3 mt-3">
                <h4 className="text-sm font-semibold text-pink-700 mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <ResultCard label="Cash at Closing" value={formatCurrency(results.principalOnly.downPaymentARV)} />
                  <ResultCard label="Cash at Closing" value={formatCurrency(results.principalOnly.downPaymentAsking)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeFinanceCalculator;
