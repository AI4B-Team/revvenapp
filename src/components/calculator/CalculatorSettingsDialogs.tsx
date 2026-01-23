import React from 'react';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/IconTooltip';

// Setting field types
type SettingFieldType = 'number' | 'percentage' | 'currency' | 'select' | 'toggle';

interface SettingField {
  key: string;
  label: string;
  type: SettingFieldType;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  suffix?: string;
  prefix?: string;
}

interface SettingSection {
  title: string;
  fields: SettingField[];
}

// Calculator-specific settings definitions
export const CALCULATOR_SETTINGS: Record<string, SettingSection[]> = {
  mao: [
    {
      title: 'Pricing Assumptions',
      fields: [
        { key: 'salesCommission', label: 'Sales Commission', type: 'percentage', tooltip: 'Agent commission percentage when selling', min: 0, max: 10, step: 0.5 },
        { key: 'closingCosts', label: 'Closing Costs', type: 'percentage', tooltip: 'Buyer/Seller closing costs as percentage of sale price', min: 0, max: 10, step: 0.5 },
        { key: 'desiredProfit', label: 'Desired Profit', type: 'currency', tooltip: 'Target profit amount for the deal' },
      ]
    },
    {
      title: 'Holding Costs',
      fields: [
        { key: 'propertyTax', label: 'Annual Property Tax', type: 'currency', tooltip: 'Annual property tax estimate' },
        { key: 'utilityCost', label: 'Monthly Utility Cost', type: 'currency', tooltip: 'Monthly utilities during hold period' },
        { key: 'hoaCost', label: 'Monthly HOA', type: 'currency', tooltip: 'HOA fees if applicable' },
        { key: 'insurance', label: 'Monthly Insurance', type: 'currency', tooltip: 'Insurance during holding period' },
      ]
    },
    {
      title: 'Hard Money',
      fields: [
        { key: 'interestRate', label: 'Interest Rate', type: 'percentage', tooltip: 'Annual interest rate for hard money loan', min: 8, max: 18, step: 0.25 },
        { key: 'points', label: 'Loan Points', type: 'percentage', tooltip: 'Points charged by lender (1 point = 1% of loan)', min: 0, max: 5, step: 0.5 },
        { key: 'holdPeriod', label: 'Expected Hold Period', type: 'number', tooltip: 'Months you expect to hold the property', min: 1, max: 24, suffix: 'months' },
        { key: 'recordingFees', label: 'Recording Fees', type: 'percentage', tooltip: 'Recording and document fees', min: 0, max: 3, step: 0.25 },
      ]
    }
  ],
  wmao: [
    {
      title: 'Deal Structure',
      fields: [
        { key: 'buyerProfitMargin', label: 'Buyer Profit Margin', type: 'percentage', tooltip: 'Percentage of ARV your buyer needs for profit', min: 60, max: 80, step: 1 },
        { key: 'minWholesaleFee', label: 'Minimum Wholesale Fee', type: 'currency', tooltip: 'Your minimum acceptable assignment fee' },
        { key: 'maxWholesaleFee', label: 'Target Wholesale Fee', type: 'currency', tooltip: 'Your ideal assignment fee' },
      ]
    },
    {
      title: 'Holding Costs (Buyer)',
      fields: [
        { key: 'buyerHoldPeriod', label: 'Buyer Hold Period', type: 'number', tooltip: 'Estimated months for buyer to flip', min: 1, max: 12, suffix: 'months' },
        { key: 'monthlyHoldingCosts', label: 'Monthly Holding Costs', type: 'currency', tooltip: 'Estimated monthly costs during buyer hold' },
      ]
    },
    {
      title: 'Closing',
      fields: [
        { key: 'doubleCloseCosts', label: 'Double Close Costs', type: 'currency', tooltip: 'Additional costs for double closing if used' },
        { key: 'assignmentFeeCap', label: 'Assignment Fee Cap', type: 'percentage', tooltip: 'Max assignment fee as % of ARV', min: 0, max: 15, step: 1 },
      ]
    }
  ],
  flip: [
    {
      title: 'Acquisition',
      fields: [
        { key: 'closingCosts', label: 'Closing Costs', type: 'percentage', tooltip: 'Acquisition closing costs', min: 1, max: 8, step: 0.5 },
        { key: 'inspectionCosts', label: 'Inspection Costs', type: 'currency', tooltip: 'Home inspection, appraisal, etc.' },
      ]
    },
    {
      title: 'Rehab',
      fields: [
        { key: 'rehabDuration', label: 'Rehab Duration', type: 'number', tooltip: 'Estimated months to complete rehab', min: 1, max: 12, suffix: 'months' },
        { key: 'rehabOverrun', label: 'Rehab Over-Run', type: 'percentage', tooltip: 'Buffer for unexpected rehab costs', min: 0, max: 30, step: 5 },
        { key: 'contingency', label: 'Contingency', type: 'percentage', tooltip: 'Additional contingency percentage', min: 5, max: 25, step: 1 },
      ]
    },
    {
      title: 'Hard Money',
      fields: [
        { key: 'hmInterestRate', label: 'Interest Rate', type: 'percentage', tooltip: 'Hard money loan annual interest rate', min: 8, max: 18, step: 0.25 },
        { key: 'hmPoints', label: 'Loan Points', type: 'number', tooltip: 'Points charged at closing', min: 0, max: 5, step: 0.5 },
        { key: 'hmTerm', label: 'Loan Term', type: 'number', tooltip: 'Loan term in months', min: 3, max: 18, suffix: 'months' },
        { key: 'hmLTV', label: 'Max LTV', type: 'percentage', tooltip: 'Maximum loan-to-value ratio', min: 60, max: 90, step: 5 },
      ]
    },
    {
      title: 'Selling',
      fields: [
        { key: 'sellingCosts', label: 'Selling Costs', type: 'percentage', tooltip: 'Agent commissions, closing costs when selling', min: 4, max: 10, step: 0.5 },
        { key: 'stagingCosts', label: 'Staging Costs', type: 'currency', tooltip: 'Estimated staging costs' },
        { key: 'marketingTime', label: 'Time on Market', type: 'number', tooltip: 'Expected months to sell', min: 1, max: 6, suffix: 'months' },
      ]
    }
  ],
  brrrr: [
    {
      title: 'Acquisition & Rehab',
      fields: [
        { key: 'closingCosts', label: 'Closing Costs', type: 'percentage', tooltip: 'Acquisition closing costs', min: 1, max: 8, step: 0.5 },
        { key: 'rehabDuration', label: 'Rehab Duration', type: 'number', tooltip: 'Months to complete rehab', min: 1, max: 12, suffix: 'months' },
        { key: 'rehabOverrun', label: 'Rehab Over-Run', type: 'percentage', tooltip: 'Buffer for unexpected costs', min: 0, max: 30, step: 5 },
      ]
    },
    {
      title: 'Refinance',
      fields: [
        { key: 'refinanceLTV', label: 'Refinance LTV', type: 'percentage', tooltip: 'Loan-to-value ratio for refinance', min: 60, max: 85, step: 5 },
        { key: 'refinanceRate', label: 'Interest Rate', type: 'percentage', tooltip: 'Refinance mortgage rate', min: 4, max: 12, step: 0.125 },
        { key: 'refinanceTerm', label: 'Loan Term', type: 'select', tooltip: 'Refinance loan term', options: [
          { value: 15, label: '15 Years' },
          { value: 20, label: '20 Years' },
          { value: 30, label: '30 Years' },
        ]},
        { key: 'refinanceClosing', label: 'Refinance Closing Costs', type: 'percentage', tooltip: 'Refinance closing costs', min: 1, max: 6, step: 0.5 },
      ]
    },
    {
      title: 'Rental Operations',
      fields: [
        { key: 'vacancy', label: 'Vacancy Rate', type: 'percentage', tooltip: 'Expected vacancy percentage', min: 3, max: 15, step: 1 },
        { key: 'propertyMgmt', label: 'Property Management', type: 'percentage', tooltip: 'PM fee as % of rent', min: 0, max: 15, step: 1 },
        { key: 'maintenance', label: 'Maintenance', type: 'percentage', tooltip: 'Maintenance reserve as % of rent', min: 3, max: 15, step: 1 },
        { key: 'capex', label: 'Capital Expenditures', type: 'percentage', tooltip: 'CapEx reserve as % of rent', min: 3, max: 15, step: 1 },
      ]
    }
  ],
  rental: [
    {
      title: 'Financing',
      fields: [
        { key: 'downPayment', label: 'Down Payment', type: 'percentage', tooltip: 'Down payment percentage', min: 5, max: 50, step: 5 },
        { key: 'interestRate', label: 'Interest Rate', type: 'percentage', tooltip: 'Mortgage interest rate', min: 4, max: 12, step: 0.125 },
        { key: 'loanTerm', label: 'Loan Term', type: 'select', tooltip: 'Mortgage term', options: [
          { value: 15, label: '15 Years' },
          { value: 20, label: '20 Years' },
          { value: 30, label: '30 Years' },
        ]},
        { key: 'closingCosts', label: 'Closing Costs', type: 'percentage', tooltip: 'Purchase closing costs', min: 1, max: 8, step: 0.5 },
      ]
    },
    {
      title: 'Recurring Expenses',
      fields: [
        { key: 'propertyMgmt', label: 'Property Management', type: 'percentage', tooltip: 'PM fee as percentage of rent', min: 0, max: 15, step: 1 },
        { key: 'capex', label: 'Capital Expenditures', type: 'percentage', tooltip: 'CapEx reserve percentage', min: 3, max: 15, step: 1 },
        { key: 'vacancy', label: 'Vacancy Rate', type: 'percentage', tooltip: 'Expected vacancy rate', min: 3, max: 15, step: 1 },
        { key: 'maintenance', label: 'Maintenance', type: 'percentage', tooltip: 'Maintenance reserve', min: 3, max: 15, step: 1 },
      ]
    },
    {
      title: 'Projections',
      fields: [
        { key: 'annualAppreciation', label: 'Annual Appreciation', type: 'percentage', tooltip: 'Expected property appreciation', min: 0, max: 10, step: 0.5 },
        { key: 'annualRentIncrease', label: 'Annual Rent Increase', type: 'percentage', tooltip: 'Expected annual rent growth', min: 0, max: 10, step: 0.5 },
        { key: 'annualExpenseIncrease', label: 'Annual Expense Increase', type: 'percentage', tooltip: 'Expected expense growth', min: 0, max: 10, step: 0.5 },
      ]
    }
  ],
  creative: [
    {
      title: 'Seller Financing Terms',
      fields: [
        { key: 'defaultDownPayment', label: 'Default Down Payment', type: 'percentage', tooltip: 'Typical seller finance down payment', min: 0, max: 30, step: 5 },
        { key: 'defaultInterestRate', label: 'Default Interest Rate', type: 'percentage', tooltip: 'Typical seller finance rate', min: 4, max: 12, step: 0.25 },
        { key: 'defaultTerm', label: 'Default Term', type: 'select', tooltip: 'Typical loan term', options: [
          { value: 60, label: '5 Years' },
          { value: 120, label: '10 Years' },
          { value: 180, label: '15 Years' },
          { value: 240, label: '20 Years' },
          { value: 360, label: '30 Years' },
        ]},
      ]
    },
    {
      title: 'Subject-To Terms',
      fields: [
        { key: 'catchUpPayments', label: 'Max Catch-Up Payments', type: 'number', tooltip: 'Max past-due payments to cure', min: 0, max: 12, suffix: 'months' },
        { key: 'closingAssistance', label: 'Closing Assistance', type: 'currency', tooltip: 'Amount to assist seller at closing' },
      ]
    },
    {
      title: 'Lease Option',
      fields: [
        { key: 'optionFee', label: 'Option Fee', type: 'percentage', tooltip: 'Option fee as % of purchase price', min: 1, max: 10, step: 0.5 },
        { key: 'monthlyCredit', label: 'Monthly Rent Credit', type: 'percentage', tooltip: 'Rent credited toward purchase', min: 0, max: 50, step: 5 },
        { key: 'optionTerm', label: 'Option Term', type: 'number', tooltip: 'Lease option duration', min: 12, max: 60, suffix: 'months' },
      ]
    }
  ],
  wholesale: [
    {
      title: 'Deal Parameters',
      fields: [
        { key: 'targetAssignmentFee', label: 'Target Assignment Fee', type: 'currency', tooltip: 'Your target profit per deal' },
        { key: 'minAssignmentFee', label: 'Minimum Assignment Fee', type: 'currency', tooltip: 'Walk-away fee amount' },
        { key: 'buyerMaoPercent', label: 'Buyer MAO Percent', type: 'percentage', tooltip: 'What % of ARV your buyers pay', min: 60, max: 80, step: 1 },
      ]
    },
    {
      title: 'Marketing & Acquisition',
      fields: [
        { key: 'earnestMoneyDefault', label: 'Default Earnest Money', type: 'currency', tooltip: 'Standard EMD amount' },
        { key: 'marketingBudget', label: 'Marketing Budget/Deal', type: 'currency', tooltip: 'Average marketing cost per deal' },
        { key: 'inspectionPeriod', label: 'Inspection Period', type: 'number', tooltip: 'Days for due diligence', min: 5, max: 30, suffix: 'days' },
      ]
    },
    {
      title: 'Closing',
      fields: [
        { key: 'closingTimeline', label: 'Closing Timeline', type: 'number', tooltip: 'Days to close', min: 14, max: 45, suffix: 'days' },
        { key: 'titleFees', label: 'Title/Escrow Fees', type: 'currency', tooltip: 'Estimated title fees' },
      ]
    }
  ],
  exchange: [
    {
      title: 'Tax Rates',
      fields: [
        { key: 'federalCapGains', label: 'Federal Capital Gains Rate', type: 'percentage', tooltip: 'Federal long-term capital gains rate', min: 0, max: 37, step: 1 },
        { key: 'stateCapGains', label: 'State Capital Gains Rate', type: 'percentage', tooltip: 'State capital gains rate', min: 0, max: 15, step: 0.5 },
        { key: 'depreciationRecapture', label: 'Depreciation Recapture Rate', type: 'percentage', tooltip: 'Rate for recapturing depreciation', min: 20, max: 30, step: 1 },
        { key: 'netInvestmentTax', label: 'Net Investment Income Tax', type: 'percentage', tooltip: '3.8% NIIT if applicable', min: 0, max: 5, step: 0.1 },
      ]
    },
    {
      title: 'Depreciation',
      fields: [
        { key: 'depreciationPeriod', label: 'Depreciation Period', type: 'number', tooltip: 'Years for depreciation (27.5 residential)', min: 27, max: 40, step: 0.5, suffix: 'years' },
        { key: 'landValue', label: 'Default Land Value', type: 'percentage', tooltip: 'Typical land value %', min: 10, max: 40, step: 5 },
      ]
    },
    {
      title: 'Timelines',
      fields: [
        { key: 'identificationPeriod', label: 'Identification Period', type: 'number', tooltip: 'Days to identify replacement property', min: 45, max: 45, suffix: 'days' },
        { key: 'exchangePeriod', label: 'Exchange Period', type: 'number', tooltip: 'Days to complete exchange', min: 180, max: 180, suffix: 'days' },
      ]
    }
  ],
  cashflow: [
    {
      title: 'Operating Reserves',
      fields: [
        { key: 'vacancy', label: 'Vacancy Rate', type: 'percentage', tooltip: 'Expected vacancy percentage', min: 3, max: 15, step: 1 },
        { key: 'propertyMgmt', label: 'Property Management', type: 'percentage', tooltip: 'PM fee as % of rent', min: 0, max: 15, step: 1 },
        { key: 'maintenance', label: 'Maintenance Reserve', type: 'percentage', tooltip: 'Maintenance as % of rent', min: 3, max: 15, step: 1 },
        { key: 'capex', label: 'CapEx Reserve', type: 'percentage', tooltip: 'Capital expenditures reserve', min: 3, max: 15, step: 1 },
      ]
    },
    {
      title: 'Income',
      fields: [
        { key: 'petRent', label: 'Default Pet Rent', type: 'currency', tooltip: 'Monthly pet rent if applicable' },
        { key: 'otherIncome', label: 'Other Income', type: 'currency', tooltip: 'Laundry, storage, parking, etc.' },
        { key: 'lateFeesPercent', label: 'Late Fees Collected', type: 'percentage', tooltip: 'Average late fees as % of rent', min: 0, max: 5, step: 0.5 },
      ]
    }
  ],
  roi: [
    {
      title: 'Return Components',
      fields: [
        { key: 'includeAppreciation', label: 'Include Appreciation', type: 'toggle', tooltip: 'Factor appreciation into ROI' },
        { key: 'includePrincipalPaydown', label: 'Include Principal Paydown', type: 'toggle', tooltip: 'Factor loan paydown into ROI' },
        { key: 'includeTaxBenefits', label: 'Include Tax Benefits', type: 'toggle', tooltip: 'Factor depreciation tax benefits' },
      ]
    },
    {
      title: 'Projections',
      fields: [
        { key: 'appreciationRate', label: 'Annual Appreciation', type: 'percentage', tooltip: 'Expected annual appreciation', min: 0, max: 10, step: 0.5 },
        { key: 'rentGrowth', label: 'Annual Rent Growth', type: 'percentage', tooltip: 'Expected annual rent increase', min: 0, max: 8, step: 0.5 },
        { key: 'expenseGrowth', label: 'Annual Expense Growth', type: 'percentage', tooltip: 'Expected expense increase', min: 0, max: 8, step: 0.5 },
      ]
    },
    {
      title: 'Analysis Period',
      fields: [
        { key: 'holdPeriod', label: 'Hold Period', type: 'number', tooltip: 'Years to project returns', min: 1, max: 30, suffix: 'years' },
        { key: 'exitCosts', label: 'Exit Costs', type: 'percentage', tooltip: 'Selling costs when exiting', min: 4, max: 10, step: 0.5 },
      ]
    }
  ],
  caprate: [
    {
      title: 'Operating Expenses',
      fields: [
        { key: 'vacancy', label: 'Vacancy Rate', type: 'percentage', tooltip: 'Expected vacancy rate', min: 3, max: 15, step: 1 },
        { key: 'propertyMgmt', label: 'Property Management', type: 'percentage', tooltip: 'PM fee as % of income', min: 0, max: 15, step: 1 },
        { key: 'maintenance', label: 'Maintenance', type: 'percentage', tooltip: 'Maintenance as % of income', min: 3, max: 15, step: 1 },
      ]
    },
    {
      title: 'Market Benchmarks',
      fields: [
        { key: 'targetCapRate', label: 'Target Cap Rate', type: 'percentage', tooltip: 'Your minimum acceptable cap rate', min: 4, max: 12, step: 0.5 },
        { key: 'marketCapRate', label: 'Market Cap Rate', type: 'percentage', tooltip: 'Typical cap rate in your market', min: 4, max: 12, step: 0.5 },
      ]
    }
  ],
  mortgage: [
    {
      title: 'Loan Defaults',
      fields: [
        { key: 'defaultRate', label: 'Default Interest Rate', type: 'percentage', tooltip: 'Typical mortgage rate', min: 4, max: 12, step: 0.125 },
        { key: 'defaultTerm', label: 'Default Loan Term', type: 'select', tooltip: 'Typical loan term', options: [
          { value: 15, label: '15 Years' },
          { value: 20, label: '20 Years' },
          { value: 30, label: '30 Years' },
        ]},
        { key: 'defaultDownPayment', label: 'Default Down Payment', type: 'percentage', tooltip: 'Typical down payment', min: 3, max: 50, step: 1 },
      ]
    },
    {
      title: 'PMI & Insurance',
      fields: [
        { key: 'pmiThreshold', label: 'PMI Threshold', type: 'percentage', tooltip: 'Equity % when PMI drops off', min: 78, max: 80, step: 1 },
        { key: 'pmiRate', label: 'PMI Rate', type: 'percentage', tooltip: 'Annual PMI as % of loan', min: 0.3, max: 2, step: 0.1 },
        { key: 'homeownersInsurance', label: 'Annual Insurance', type: 'currency', tooltip: 'Default annual insurance' },
      ]
    },
    {
      title: 'Taxes',
      fields: [
        { key: 'propertyTaxRate', label: 'Property Tax Rate', type: 'percentage', tooltip: 'Annual property tax rate', min: 0.5, max: 3, step: 0.1 },
      ]
    }
  ]
};

// Per-calculator settings storage
export interface CalculatorSettings {
  [key: string]: Record<string, number | string | boolean>;
}

// Default values for each calculator's settings
export const getDefaultCalculatorSettings = (calcId: string): Record<string, number | string | boolean> => {
  const defaults: Record<string, Record<string, number | string | boolean>> = {
    mao: { salesCommission: 3, closingCosts: 2, desiredProfit: 60000, propertyTax: 3000, utilityCost: 200, hoaCost: 0, insurance: 150, interestRate: 12, points: 2, holdPeriod: 6, recordingFees: 1 },
    wmao: { buyerProfitMargin: 70, minWholesaleFee: 5000, maxWholesaleFee: 15000, buyerHoldPeriod: 6, monthlyHoldingCosts: 2000, doubleCloseCosts: 1500, assignmentFeeCap: 10 },
    flip: { closingCosts: 3, inspectionCosts: 500, rehabDuration: 3, rehabOverrun: 10, contingency: 10, hmInterestRate: 12, hmPoints: 3, hmTerm: 6, hmLTV: 70, sellingCosts: 6, stagingCosts: 3000, marketingTime: 2 },
    brrrr: { closingCosts: 3, rehabDuration: 3, rehabOverrun: 10, refinanceLTV: 75, refinanceRate: 7.5, refinanceTerm: 30, refinanceClosing: 3, vacancy: 5, propertyMgmt: 10, maintenance: 5, capex: 5 },
    rental: { downPayment: 20, interestRate: 7.5, loanTerm: 30, closingCosts: 3, propertyMgmt: 10, capex: 5, vacancy: 5, maintenance: 5, annualAppreciation: 3, annualRentIncrease: 3, annualExpenseIncrease: 3 },
    creative: { defaultDownPayment: 10, defaultInterestRate: 6, defaultTerm: 360, catchUpPayments: 3, closingAssistance: 5000, optionFee: 3, monthlyCredit: 25, optionTerm: 24 },
    wholesale: { targetAssignmentFee: 10000, minAssignmentFee: 5000, buyerMaoPercent: 70, earnestMoneyDefault: 1000, marketingBudget: 500, inspectionPeriod: 14, closingTimeline: 30, titleFees: 800 },
    exchange: { federalCapGains: 20, stateCapGains: 5, depreciationRecapture: 25, netInvestmentTax: 3.8, depreciationPeriod: 27.5, landValue: 20, identificationPeriod: 45, exchangePeriod: 180 },
    cashflow: { vacancy: 5, propertyMgmt: 10, maintenance: 5, capex: 5, petRent: 50, otherIncome: 0, lateFeesPercent: 1 },
    roi: { includeAppreciation: true, includePrincipalPaydown: true, includeTaxBenefits: false, appreciationRate: 3, rentGrowth: 3, expenseGrowth: 3, holdPeriod: 5, exitCosts: 6 },
    caprate: { vacancy: 5, propertyMgmt: 10, maintenance: 5, targetCapRate: 8, marketCapRate: 6 },
    mortgage: { defaultRate: 7.5, defaultTerm: 30, defaultDownPayment: 20, pmiThreshold: 80, pmiRate: 0.5, homeownersInsurance: 1800, propertyTaxRate: 1.2 }
  };
  return defaults[calcId] || {};
};

interface SettingInputProps {
  field: SettingField;
  value: number | string | boolean;
  onChange: (key: string, value: number | string | boolean) => void;
}

const SettingInput = ({ field, value, onChange }: SettingInputProps) => {
  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value as string | number}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => onChange(field.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-muted'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        );
      case 'percentage':
        return (
          <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
            <input
              type="number"
              value={value as number}
              onChange={(e) => onChange(field.key, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              className="w-full px-3 py-2 bg-transparent outline-none text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="pr-3 text-muted-foreground text-sm flex-shrink-0">%</span>
          </div>
        );
      case 'currency':
        return (
          <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
            <span className="pl-3 text-muted-foreground text-sm flex-shrink-0">$</span>
            <input
              type="number"
              value={value as number}
              onChange={(e) => onChange(field.key, Number(e.target.value))}
              className="w-full px-1 py-2 bg-transparent outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
            <input
              type="number"
              value={value as number}
              onChange={(e) => onChange(field.key, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              className={`w-full px-3 py-2 bg-transparent outline-none text-sm ${field.suffix ? 'text-right' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
            {field.suffix && (
              <span className="pr-3 text-muted-foreground text-xs flex-shrink-0">{field.suffix}</span>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        {field.tooltip && (
          <IconTooltip label={field.tooltip} side="right">
            <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          </IconTooltip>
        )}
      </div>
      <div className="w-36">{renderInput()}</div>
    </div>
  );
};

interface CalculatorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorId: string;
  calculatorName: string;
  settings: Record<string, number | string | boolean>;
  onSettingsChange: (calcId: string, settings: Record<string, number | string | boolean>) => void;
  onReset: (calcId: string) => void;
}

export const CalculatorSettingsDialog = ({
  open,
  onOpenChange,
  calculatorId,
  calculatorName,
  settings,
  onSettingsChange,
  onReset
}: CalculatorSettingsDialogProps) => {
  const sections = CALCULATOR_SETTINGS[calculatorId] || [];

  const handleChange = (key: string, value: number | string | boolean) => {
    onSettingsChange(calculatorId, { ...settings, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg">{calculatorName} Settings</DialogTitle>
          <DialogDescription className="text-sm">
            Configure default values for this calculator. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                {section.title}
              </h4>
              <div className="bg-muted/30 rounded-lg p-3">
                {section.fields.map(field => (
                  <SettingInput
                    key={field.key}
                    field={field}
                    value={settings[field.key] ?? getDefaultCalculatorSettings(calculatorId)[field.key]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReset(calculatorId)}
            className="text-destructive hover:text-destructive"
          >
            Reset Defaults
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
