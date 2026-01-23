import React, { useState, useMemo } from 'react';
import { FileText, DollarSign, TrendingUp, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NovationData {
  // Property Info
  propertyValue: string;
  existingMortgageBalance: string;
  existingInterestRate: number;
  existingMonthlyPayment: string;
  remainingTermMonths: string;
  
  // Novation Terms
  purchasePrice: string;
  novationFee: string;
  sellerCashAtClose: string;
  
  // Exit Strategy
  arv: string;
  rehabCosts: string;
  holdingTimeMonths: number;
  sellingCosts: number;
  
  // Rental (if holding)
  expectedRent: string;
  propertyTax: string;
  insurance: string;
  maintenance: string;
}

interface NovationResults {
  // Equity Analysis
  existingEquity: number;
  discountFromValue: number;
  discountPercent: number;
  
  // Deal Costs
  totalCashNeeded: number;
  monthlyHoldingCost: number;
  totalHoldingCosts: number;
  
  // Exit as Flip
  flipProfit: number;
  flipROI: number;
  
  // Exit as Rental
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCash: number;
  
  // Risk Metrics
  dueOnSaleRisk: boolean;
  equityBuffer: number;
  equityBufferPercent: number;
}

interface NovationCalculatorProps {
  onDataChange?: (data: NovationData, results: NovationResults) => void;
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
  icon
}: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
  positive?: boolean;
  negative?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className={cn(
    "flex items-center justify-between p-3 rounded-lg",
    highlight ? "bg-primary/10 border border-primary/20" : "bg-background/50"
  )}>
    <span className="text-sm text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span className={cn(
      "font-bold",
      positive ? "text-green-600" : negative ? "text-red-600" : ""
    )}>{value}</span>
  </div>
);

export const NovationCalculator: React.FC<NovationCalculatorProps> = ({ onDataChange }) => {
  const [exitStrategy, setExitStrategy] = useState<'flip' | 'rental'>('flip');
  
  const [data, setData] = useState<NovationData>({
    propertyValue: '',
    existingMortgageBalance: '',
    existingInterestRate: 5.5,
    existingMonthlyPayment: '',
    remainingTermMonths: '240',
    purchasePrice: '',
    novationFee: '5000',
    sellerCashAtClose: '',
    arv: '',
    rehabCosts: '',
    holdingTimeMonths: 6,
    sellingCosts: 6,
    expectedRent: '',
    propertyTax: '',
    insurance: '',
    maintenance: ''
  });

  const results = useMemo<NovationResults>(() => {
    const propertyValue = parseFloat(data.propertyValue) || 0;
    const mortgageBalance = parseFloat(data.existingMortgageBalance) || 0;
    const monthlyPayment = parseFloat(data.existingMonthlyPayment) || 0;
    const purchasePrice = parseFloat(data.purchasePrice) || 0;
    const novationFee = parseFloat(data.novationFee) || 0;
    const sellerCash = parseFloat(data.sellerCashAtClose) || 0;
    const arv = parseFloat(data.arv) || 0;
    const rehabCosts = parseFloat(data.rehabCosts) || 0;
    const holdingMonths = data.holdingTimeMonths || 6;
    const sellingCostPercent = data.sellingCosts / 100;
    const expectedRent = parseFloat(data.expectedRent) || 0;
    const propertyTax = parseFloat(data.propertyTax) || 0;
    const insurance = parseFloat(data.insurance) || 0;
    const maintenance = parseFloat(data.maintenance) || 0;

    // Equity Analysis
    const existingEquity = propertyValue - mortgageBalance;
    const discountFromValue = propertyValue - purchasePrice;
    const discountPercent = propertyValue > 0 ? (discountFromValue / propertyValue) * 100 : 0;

    // Deal Costs
    const totalCashNeeded = novationFee + sellerCash + rehabCosts;
    const monthlyHoldingCost = monthlyPayment + (propertyTax / 12) + (insurance / 12);
    const totalHoldingCosts = monthlyHoldingCost * holdingMonths;

    // Exit as Flip
    const sellingCosts = arv * sellingCostPercent;
    const totalFlipCosts = totalCashNeeded + totalHoldingCosts + sellingCosts + mortgageBalance;
    const flipProfit = arv - totalFlipCosts;
    const flipROI = totalCashNeeded > 0 ? (flipProfit / totalCashNeeded) * 100 : 0;

    // Exit as Rental
    const monthlyExpenses = monthlyPayment + (propertyTax / 12) + (insurance / 12) + (parseFloat(data.maintenance) || 0);
    const monthlyCashFlow = expectedRent - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = totalCashNeeded > 0 ? (annualCashFlow / totalCashNeeded) * 100 : 0;

    // Risk Metrics
    const equityBuffer = arv - mortgageBalance - rehabCosts;
    const equityBufferPercent = arv > 0 ? (equityBuffer / arv) * 100 : 0;

    return {
      existingEquity,
      discountFromValue,
      discountPercent,
      totalCashNeeded,
      monthlyHoldingCost,
      totalHoldingCosts,
      flipProfit,
      flipROI,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash,
      dueOnSaleRisk: true, // Always true for novation
      equityBuffer,
      equityBufferPercent
    };
  }, [data]);

  const updateData = (key: keyof NovationData, value: string | number) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Exit Strategy Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setExitStrategy('flip')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-center",
            exitStrategy === 'flip'
              ? "border-amber-500 bg-amber-50 text-amber-700"
              : "border-border bg-card hover:border-amber-300 text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="font-semibold text-sm">Exit as Flip</div>
          <div className="text-xs opacity-70">Rehab and sell for profit</div>
        </button>
        <button
          onClick={() => setExitStrategy('rental')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-center",
            exitStrategy === 'rental'
              ? "border-amber-500 bg-amber-50 text-amber-700"
              : "border-border bg-card hover:border-amber-300 text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="font-semibold text-sm">Exit as Rental</div>
          <div className="text-xs opacity-70">Hold for cash flow</div>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs Section */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Existing Loan Details
            </h3>
            <div className="space-y-3">
              <InputField label="Property Value (FMV)" value={data.propertyValue} onChange={(val) => updateData('propertyValue', val)} prefix="$" />
              <InputField label="Mortgage Balance" value={data.existingMortgageBalance} onChange={(val) => updateData('existingMortgageBalance', val)} prefix="$" />
              <InputField label="Interest Rate" value={data.existingInterestRate} onChange={(val) => updateData('existingInterestRate', parseFloat(val) || 0)} suffix="%" step="0.1" />
              <InputField label="Monthly Payment (PITI)" value={data.existingMonthlyPayment} onChange={(val) => updateData('existingMonthlyPayment', val)} prefix="$" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Novation Terms
            </h3>
            <div className="space-y-3">
              <InputField label="Your Purchase Price" value={data.purchasePrice} onChange={(val) => updateData('purchasePrice', val)} prefix="$" />
              <InputField label="Novation Fee" value={data.novationFee} onChange={(val) => updateData('novationFee', val)} prefix="$" />
              <InputField label="Seller Cash at Close" value={data.sellerCashAtClose} onChange={(val) => updateData('sellerCashAtClose', val)} prefix="$" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              {exitStrategy === 'flip' ? 'Flip Strategy' : 'Rental Strategy'}
            </h3>
            <div className="space-y-3">
              <InputField label="ARV (After Repair Value)" value={data.arv} onChange={(val) => updateData('arv', val)} prefix="$" />
              <InputField label="Rehab Costs" value={data.rehabCosts} onChange={(val) => updateData('rehabCosts', val)} prefix="$" />
              
              {exitStrategy === 'flip' && (
                <>
                  <InputField label="Holding Time" value={data.holdingTimeMonths} onChange={(val) => updateData('holdingTimeMonths', parseInt(val) || 0)} suffix="mos" />
                  <InputField label="Selling Costs" value={data.sellingCosts} onChange={(val) => updateData('sellingCosts', parseFloat(val) || 0)} suffix="%" />
                </>
              )}
              
              {exitStrategy === 'rental' && (
                <>
                  <InputField label="Expected Monthly Rent" value={data.expectedRent} onChange={(val) => updateData('expectedRent', val)} prefix="$" />
                  <InputField label="Annual Property Tax" value={data.propertyTax} onChange={(val) => updateData('propertyTax', val)} prefix="$" />
                  <InputField label="Annual Insurance" value={data.insurance} onChange={(val) => updateData('insurance', val)} prefix="$" />
                  <InputField label="Monthly Maintenance" value={data.maintenance} onChange={(val) => updateData('maintenance', val)} prefix="$" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200 space-y-6">
          {/* Risk Warning */}
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Due-on-Sale Clause Risk</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Novation involves taking over existing financing. The lender may call the loan due if discovered. Always consult legal counsel.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800">
              <Calculator className="w-5 h-5" />
              Equity Analysis
            </h3>
            <div className="space-y-2">
              <ResultCard label="Existing Equity" value={formatCurrency(results.existingEquity)} positive={results.existingEquity > 0} />
              <ResultCard label="Discount from Value" value={formatCurrency(results.discountFromValue)} />
              <ResultCard label="Discount Percent" value={formatPercent(results.discountPercent)} positive={results.discountPercent > 10} />
            </div>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800">
              <DollarSign className="w-5 h-5" />
              Deal Costs
            </h3>
            <div className="space-y-2">
              <ResultCard label="Total Cash Needed" value={formatCurrency(results.totalCashNeeded)} highlight />
              <ResultCard label="Monthly Holding Cost" value={formatCurrency(results.monthlyHoldingCost)} />
              {exitStrategy === 'flip' && (
                <ResultCard label="Total Holding Costs" value={formatCurrency(results.totalHoldingCosts)} />
              )}
            </div>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800">
              <TrendingUp className="w-5 h-5" />
              {exitStrategy === 'flip' ? 'Flip Returns' : 'Rental Returns'}
            </h3>
            <div className="space-y-2">
              {exitStrategy === 'flip' ? (
                <>
                  <ResultCard label="Estimated Profit" value={formatCurrency(results.flipProfit)} highlight positive={results.flipProfit > 0} negative={results.flipProfit < 0} />
                  <ResultCard label="Cash-on-Cash ROI" value={formatPercent(results.flipROI)} positive={results.flipROI > 50} />
                </>
              ) : (
                <>
                  <ResultCard label="Monthly Cash Flow" value={formatCurrency(results.monthlyCashFlow)} highlight positive={results.monthlyCashFlow > 0} negative={results.monthlyCashFlow < 0} />
                  <ResultCard label="Annual Cash Flow" value={formatCurrency(results.annualCashFlow)} positive={results.annualCashFlow > 0} negative={results.annualCashFlow < 0} />
                  <ResultCard label="Cash-on-Cash Return" value={formatPercent(results.cashOnCash)} positive={results.cashOnCash > 10} />
                </>
              )}
            </div>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800">
              <CheckCircle className="w-5 h-5" />
              Safety Buffer
            </h3>
            <div className="space-y-2">
              <ResultCard 
                label="Equity Buffer (ARV - Loan - Rehab)" 
                value={formatCurrency(results.equityBuffer)} 
                positive={results.equityBuffer > 0} 
                negative={results.equityBuffer < 0} 
              />
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                results.equityBufferPercent >= 20 ? "bg-green-100 border border-green-200" : 
                results.equityBufferPercent >= 10 ? "bg-yellow-100 border border-yellow-200" : 
                "bg-red-100 border border-red-200"
              )}>
                <span className="text-sm font-medium">Equity Buffer %</span>
                <span className={cn(
                  "font-bold",
                  results.equityBufferPercent >= 20 ? "text-green-700" : 
                  results.equityBufferPercent >= 10 ? "text-yellow-700" : 
                  "text-red-700"
                )}>
                  {formatPercent(results.equityBufferPercent)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovationCalculator;
