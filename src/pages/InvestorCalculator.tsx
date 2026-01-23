import { useState, useRef, useEffect } from 'react';
import { Calculator, DollarSign, Home, TrendingUp, Repeat, FileText, Download, Printer, Save, Info, BarChart3, PiggyBank, RefreshCw, Building2, ArrowRightLeft, Wallet, Percent, Target, Landmark, Settings, X, RotateCcw, LayoutGrid, List, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { IconTooltip } from '@/components/ui/IconTooltip';
import { CalculatorSettingsDialog, getDefaultCalculatorSettings, CalculatorSettings } from '@/components/calculator/CalculatorSettingsDialogs';

const CALCULATOR_ORDER_KEY = 'investor_calculator_order';
const CALCULATOR_SETTINGS_KEY = 'investor_calculator_settings';

interface CalculatorItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Default Configuration Interface
interface DefaultConfig {
  // MAO
  mao_profitMargin: number;
  // WMAO
  wmao_buyerProfit: number;
  // Flip
  flip_holdingTime: number;
  flip_sellingCosts: number;
  flip_interestRate: number;
  flip_closingCosts: number;
  flip_contingency: number;
  // BRRRR
  brrrr_refinanceLTV: number;
  brrrr_interestRate: number;
  brrrr_maintenance: number;
  brrrr_vacancy: number;
  brrrr_propertyMgmt: number;
  brrrr_closingCosts: number;
  // Creative
  creative_term: number;
  // Rental
  rental_downPayment: number;
  rental_interestRate: number;
  rental_term: number;
  rental_maintenance: number;
  rental_vacancy: number;
  rental_propertyMgmt: number;
  rental_capex: number;
  // Exchange
  exchange_federalRate: number;
  exchange_stateRate: number;
  exchange_recaptureRate: number;
  // Cash Flow
  cashflow_vacancy: number;
  cashflow_propertyMgmt: number;
  // Cap Rate
  caprate_vacancy: number;
  // Mortgage
  mortgage_interestRate: number;
  mortgage_loanTerm: number;
}

const DEFAULT_CONFIG: DefaultConfig = {
  mao_profitMargin: 70,
  wmao_buyerProfit: 70,
  flip_holdingTime: 6,
  flip_sellingCosts: 6,
  flip_interestRate: 10,
  flip_closingCosts: 3,
  flip_contingency: 10,
  brrrr_refinanceLTV: 75,
  brrrr_interestRate: 7,
  brrrr_maintenance: 10,
  brrrr_vacancy: 8,
  brrrr_propertyMgmt: 10,
  brrrr_closingCosts: 3,
  creative_term: 360,
  rental_downPayment: 20,
  rental_interestRate: 7,
  rental_term: 360,
  rental_maintenance: 8,
  rental_vacancy: 5,
  rental_propertyMgmt: 10,
  rental_capex: 5,
  exchange_federalRate: 20,
  exchange_stateRate: 5,
  exchange_recaptureRate: 25,
  cashflow_vacancy: 5,
  cashflow_propertyMgmt: 10,
  caprate_vacancy: 5,
  mortgage_interestRate: 7,
  mortgage_loanTerm: 30,
};

const CONFIG_STORAGE_KEY = 'investor_calculator_defaults';

// Types
interface MAOData {
  arv: string;
  rehabCosts: string;
  profitMargin: number;
  assignmentFee: string;
}

interface WMAOData {
  arv: string;
  rehabCosts: string;
  wholesaleFee: string;
  buyerProfit: number;
  holdingCosts: string;
}

interface FlipData {
  purchasePrice: string;
  rehabCosts: string;
  arv: string;
  holdingTime: number;
  sellingCosts: number;
  loanAmount: string;
  interestRate: number;
  closingCosts: number;
  utilities: string;
  insurance: string;
  taxes: string;
  contingency: number;
}

interface BRRRRData {
  purchasePrice: string;
  rehabCosts: string;
  arv: string;
  rentAmount: string;
  refinanceLTV: number;
  interestRate: number;
  propertyTax: string;
  insurance: string;
  maintenance: number;
  vacancy: number;
  propertyMgmt: number;
  closingCosts: number;
}

interface CreativeData {
  purchasePrice: string;
  downPayment: string;
  interestRate: string;
  term: number;
  balloonTerm: string;
  rentAmount: string;
  propertyTax: string;
  insurance: string;
  maintenance: string;
  sellerCarryback: string;
}

interface RentalData {
  purchasePrice: string;
  downPayment: number;
  interestRate: number;
  term: number;
  rentAmount: string;
  propertyTax: string;
  insurance: string;
  hoa: string;
  maintenance: number;
  vacancy: number;
  propertyMgmt: number;
  capex: number;
  utilities: string;
}

interface WholesaleData {
  contractPrice: string;
  arv: string;
  rehabCosts: string;
  assignmentFee: string;
  marketingCosts: string;
  earnestMoney: string;
}

interface ExchangeData {
  salePrice: string;
  originalPurchase: string;
  currentBasis: string;
  depreciation: string;
  federalRate: number;
  stateRate: number;
  recaptureRate: number;
  purchasePriceNew: string;
}

interface CashFlowData {
  monthlyRent: string;
  mortgage: string;
  propertyTax: string;
  insurance: string;
  maintenance: string;
  vacancy: number;
  propertyMgmt: number;
  hoa: string;
  utilities: string;
}

interface ROIData {
  purchasePrice: string;
  currentValue: string;
  totalCashInvested: string;
  annualCashFlow: string;
  appreciationGain: string;
  principalPaydown: string;
}

interface CapRateData {
  purchasePrice: string;
  grossRent: string;
  vacancy: number;
  operatingExpenses: string;
  propertyTax: string;
  insurance: string;
  maintenance: string;
  propertyMgmt: string;
}


interface MortgageData {
  loanAmount: string;
  interestRate: number;
  loanTerm: number;
  propertyTax: string;
  insurance: string;
  pmi: string;
  hoa: string;
}

interface SavedDeal {
  id: number;
  type: string;
  date: string;
  data: unknown;
  results: unknown;
}

const InvestorCalculator = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalcSettings, setShowCalcSettings] = useState(false);
  const [calcSettingsTarget, setCalcSettingsTarget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedCalc, setDraggedCalc] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [hoveredCalc, setHoveredCalc] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const calculatorSectionRef = useRef<HTMLDivElement>(null);
  
  // Per-calculator settings
  const [calculatorSettings, setCalculatorSettings] = useState<CalculatorSettings>(() => {
    const saved = localStorage.getItem(CALCULATOR_SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });
  
  // Save calculator settings to localStorage
  useEffect(() => {
    localStorage.setItem(CALCULATOR_SETTINGS_KEY, JSON.stringify(calculatorSettings));
  }, [calculatorSettings]);

  // Default calculator order (removed 70% Rule as it's same as Fix & Flip)
  const defaultCalculators: CalculatorItem[] = [
    { id: 'mao', name: 'MAO Calculator', icon: Calculator, color: 'emerald' },
    { id: 'wmao', name: 'Wholesale MAO', icon: DollarSign, color: 'blue' },
    { id: 'flip', name: 'Fix & Flip', icon: Home, color: 'purple' },
    { id: 'brrrr', name: 'BRRRR Method', icon: Repeat, color: 'orange' },
    { id: 'rental', name: 'Rental Analysis', icon: Building2, color: 'green' },
    { id: 'creative', name: 'Creative Finance', icon: TrendingUp, color: 'pink' },
    { id: 'wholesale', name: 'Wholesale Deal', icon: ArrowRightLeft, color: 'cyan' },
    { id: 'exchange', name: '1031 Exchange', icon: RefreshCw, color: 'yellow' },
    { id: 'cashflow', name: 'Cash Flow', icon: Wallet, color: 'teal' },
    { id: 'roi', name: 'ROI Calculator', icon: Percent, color: 'indigo' },
    { id: 'caprate', name: 'Cap Rate', icon: Target, color: 'violet' },
    { id: 'mortgage', name: 'Mortgage', icon: Landmark, color: 'sky' }
  ];

  // Load calculator order from localStorage
  const [calculators, setCalculators] = useState<CalculatorItem[]>(() => {
    const savedOrder = localStorage.getItem(CALCULATOR_ORDER_KEY);
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as string[];
        const ordered = orderIds
          .map(id => defaultCalculators.find(c => c.id === id))
          .filter((c): c is CalculatorItem => c !== undefined);
        // Add any new calculators that might not be in saved order
        defaultCalculators.forEach(calc => {
          if (!ordered.find(c => c.id === calc.id)) {
            ordered.push(calc);
          }
        });
        return ordered;
      } catch {
        return defaultCalculators;
      }
    }
    return defaultCalculators;
  });

  // Save calculator order to localStorage
  useEffect(() => {
    localStorage.setItem(CALCULATOR_ORDER_KEY, JSON.stringify(calculators.map(c => c.id)));
  }, [calculators]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, calcId: string) => {
    setDraggedCalc(calcId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, calcId: string) => {
    e.preventDefault();
    if (draggedCalc && draggedCalc !== calcId) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const midPoint = viewMode === 'list' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      const mousePos = viewMode === 'list' ? e.clientY : e.clientX;
      const position = mousePos < midPoint ? 'before' : 'after';
      setDropPosition({ id: calcId, position });
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCalc || draggedCalc === targetId) {
      setDraggedCalc(null);
      setDropPosition(null);
      return;
    }

    const newCalculators = [...calculators];
    const draggedIndex = newCalculators.findIndex(c => c.id === draggedCalc);
    const targetIndex = newCalculators.findIndex(c => c.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newCalculators.splice(draggedIndex, 1);
      const insertIndex = dropPosition?.position === 'after' ? targetIndex + (draggedIndex < targetIndex ? 0 : 1) : targetIndex + (draggedIndex < targetIndex ? -1 : 0);
      newCalculators.splice(Math.max(0, insertIndex), 0, removed);
      setCalculators(newCalculators);
    }

    setDraggedCalc(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedCalc(null);
    setDropPosition(null);
  };

  // Click outside handler to close calculator section
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is inside calculator section or calculator buttons
      const isInsideCalculatorSection = calculatorSectionRef.current?.contains(target);
      const isCalculatorButton = target.closest('[data-calculator-button]');
      const isSettingsDialog = target.closest('[role="dialog"]');
      
      if (!isInsideCalculatorSection && !isCalculatorButton && !isSettingsDialog) {
        setActiveCalc(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open settings for specific calculator
  const openCalculatorSettings = (e: React.MouseEvent, calcId: string) => {
    e.stopPropagation();
    setCalcSettingsTarget(calcId);
    setShowCalcSettings(true);
  };
  
  // Handle per-calculator settings change
  const handleCalcSettingsChange = (calcId: string, settings: Record<string, number | string | boolean>) => {
    setCalculatorSettings(prev => ({ ...prev, [calcId]: settings }));
  };
  
  // Reset per-calculator settings to defaults
  const resetCalcSettings = (calcId: string) => {
    setCalculatorSettings(prev => ({ ...prev, [calcId]: getDefaultCalculatorSettings(calcId) }));
    toast({
      title: "Settings Reset",
      description: `${calculators.find(c => c.id === calcId)?.name || 'Calculator'} settings restored to defaults.`
    });
  };
  
  // Get settings for a specific calculator
  const getCalcSettings = (calcId: string) => {
    return calculatorSettings[calcId] || getDefaultCalculatorSettings(calcId);
  };

  // Load saved config from localStorage
  const [config, setConfig] = useState<DefaultConfig>(() => {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    toast({
      title: "Settings Reset",
      description: "All defaults have been restored."
    });
  };

  const updateConfig = (key: keyof DefaultConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Calculator States - use config defaults
  const [maoData, setMaoData] = useState<MAOData>({
    arv: '',
    rehabCosts: '',
    profitMargin: config.mao_profitMargin,
    assignmentFee: ''
  });

  const [wmaoData, setWmaoData] = useState<WMAOData>({
    arv: '',
    rehabCosts: '',
    wholesaleFee: '',
    buyerProfit: config.wmao_buyerProfit,
    holdingCosts: ''
  });

  const [flipData, setFlipData] = useState<FlipData>({
    purchasePrice: '',
    rehabCosts: '',
    arv: '',
    holdingTime: config.flip_holdingTime,
    sellingCosts: config.flip_sellingCosts,
    loanAmount: '',
    interestRate: config.flip_interestRate,
    closingCosts: config.flip_closingCosts,
    utilities: '',
    insurance: '',
    taxes: '',
    contingency: config.flip_contingency
  });

  const [brrrData, setBrrrrData] = useState<BRRRRData>({
    purchasePrice: '',
    rehabCosts: '',
    arv: '',
    rentAmount: '',
    refinanceLTV: config.brrrr_refinanceLTV,
    interestRate: config.brrrr_interestRate,
    propertyTax: '',
    insurance: '',
    maintenance: config.brrrr_maintenance,
    vacancy: config.brrrr_vacancy,
    propertyMgmt: config.brrrr_propertyMgmt,
    closingCosts: config.brrrr_closingCosts
  });

  const [creativeData, setCreativeData] = useState<CreativeData>({
    purchasePrice: '',
    downPayment: '',
    interestRate: '',
    term: config.creative_term,
    balloonTerm: '',
    rentAmount: '',
    propertyTax: '',
    insurance: '',
    maintenance: '',
    sellerCarryback: 'yes'
  });

  const [rentalData, setRentalData] = useState<RentalData>({
    purchasePrice: '',
    downPayment: config.rental_downPayment,
    interestRate: config.rental_interestRate,
    term: config.rental_term,
    rentAmount: '',
    propertyTax: '',
    insurance: '',
    hoa: '',
    maintenance: config.rental_maintenance,
    vacancy: config.rental_vacancy,
    propertyMgmt: config.rental_propertyMgmt,
    capex: config.rental_capex,
    utilities: ''
  });

  const [wholesaleData, setWholesaleData] = useState<WholesaleData>({
    contractPrice: '',
    arv: '',
    rehabCosts: '',
    assignmentFee: '',
    marketingCosts: '',
    earnestMoney: ''
  });

  const [exchangeData, setExchangeData] = useState<ExchangeData>({
    salePrice: '',
    originalPurchase: '',
    currentBasis: '',
    depreciation: '',
    federalRate: config.exchange_federalRate,
    stateRate: config.exchange_stateRate,
    recaptureRate: config.exchange_recaptureRate,
    purchasePriceNew: ''
  });

  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    monthlyRent: '',
    mortgage: '',
    propertyTax: '',
    insurance: '',
    maintenance: '',
    vacancy: config.cashflow_vacancy,
    propertyMgmt: config.cashflow_propertyMgmt,
    hoa: '',
    utilities: ''
  });

  const [roiData, setRoiData] = useState<ROIData>({
    purchasePrice: '',
    currentValue: '',
    totalCashInvested: '',
    annualCashFlow: '',
    appreciationGain: '',
    principalPaydown: ''
  });

  const [capRateData, setCapRateData] = useState<CapRateData>({
    purchasePrice: '',
    grossRent: '',
    vacancy: config.caprate_vacancy,
    operatingExpenses: '',
    propertyTax: '',
    insurance: '',
    maintenance: '',
    propertyMgmt: ''
  });


  const [mortgageData, setMortgageData] = useState<MortgageData>({
    loanAmount: '',
    interestRate: config.mortgage_interestRate,
    loanTerm: config.mortgage_loanTerm,
    propertyTax: '',
    insurance: '',
    pmi: '',
    hoa: ''
  });

  // Calculation Functions
  const calculateMAO = () => {
    const arv = parseFloat(maoData.arv) || 0;
    const rehab = parseFloat(maoData.rehabCosts) || 0;
    const margin = maoData.profitMargin || 70;
    const assignment = parseFloat(maoData.assignmentFee) || 0;

    const mao = (arv * (margin / 100)) - rehab - assignment;
    const equity = arv - (mao + rehab);
    const roi = rehab > 0 ? ((equity / rehab) * 100) : 0;

    return { mao, equity, roi };
  };

  const calculateWMAO = () => {
    const arv = parseFloat(wmaoData.arv) || 0;
    const rehab = parseFloat(wmaoData.rehabCosts) || 0;
    const fee = parseFloat(wmaoData.wholesaleFee) || 0;
    const buyerProfit = wmaoData.buyerProfit || 70;
    const holding = parseFloat(wmaoData.holdingCosts) || 0;

    const buyerMAO = (arv * (buyerProfit / 100)) - rehab;
    const wmao = buyerMAO - fee - holding;
    const totalProfit = fee;
    const roi = wmao > 0 ? ((totalProfit / wmao) * 100) : 0;

    return { wmao, buyerMAO, totalProfit, roi };
  };

  const calculateFlip = () => {
    const purchase = parseFloat(flipData.purchasePrice) || 0;
    const rehab = parseFloat(flipData.rehabCosts) || 0;
    const arv = parseFloat(flipData.arv) || 0;
    const months = flipData.holdingTime || 6;
    const sellingCostPercent = flipData.sellingCosts || 6;
    const loanAmount = parseFloat(flipData.loanAmount) || purchase;
    const rate = flipData.interestRate || 10;
    const closingPercent = flipData.closingCosts || 3;
    const utilities = parseFloat(flipData.utilities) || 0;
    const insurance = parseFloat(flipData.insurance) || 0;
    const taxes = parseFloat(flipData.taxes) || 0;
    const contingencyPercent = flipData.contingency || 10;

    const closingCosts = purchase * (closingPercent / 100);
    const contingency = rehab * (contingencyPercent / 100);
    const interestCost = (loanAmount * (rate / 100) * months) / 12;
    const holdingCosts = (utilities + insurance + taxes) * months;
    const sellingCosts = arv * (sellingCostPercent / 100);
    
    const totalCosts = purchase + rehab + contingency + closingCosts + interestCost + holdingCosts + sellingCosts;
    const profit = arv - totalCosts;
    const roi = purchase > 0 ? ((profit / purchase) * 100) : 0;
    const annualizedROI = months > 0 ? (roi * (12 / months)) : 0;
    const cashOnCash = (purchase - loanAmount) > 0 ? ((profit / (purchase - loanAmount)) * 100) : 0;

    return { profit, roi, annualizedROI, cashOnCash, totalCosts, sellingCosts, holdingCosts, interestCost, contingency };
  };

  const calculateBRRRR = () => {
    const purchase = parseFloat(brrrData.purchasePrice) || 0;
    const rehab = parseFloat(brrrData.rehabCosts) || 0;
    const arv = parseFloat(brrrData.arv) || 0;
    const rent = parseFloat(brrrData.rentAmount) || 0;
    const ltv = brrrData.refinanceLTV || 75;
    const rate = brrrData.interestRate || 7;
    const tax = parseFloat(brrrData.propertyTax) || 0;
    const insurance = parseFloat(brrrData.insurance) || 0;
    const maintenancePercent = brrrData.maintenance || 10;
    const vacancyPercent = brrrData.vacancy || 8;
    const pmPercent = brrrData.propertyMgmt || 10;
    const closingPercent = brrrData.closingCosts || 3;

    const totalInvested = purchase + rehab + (purchase * (closingPercent / 100));
    const refinanceAmount = arv * (ltv / 100);
    const cashRecovered = refinanceAmount - totalInvested;
    const monthlyPayment = (refinanceAmount * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 360)) / (Math.pow(1 + rate / 100 / 12, 360) - 1);
    
    const maintenance = rent * (maintenancePercent / 100);
    const vacancy = rent * (vacancyPercent / 100);
    const propertyMgmt = rent * (pmPercent / 100);
    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;
    
    const totalExpenses = monthlyPayment + monthlyTax + monthlyInsurance + maintenance + vacancy + propertyMgmt;
    const monthlyCashFlow = rent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashLeftIn = totalInvested - cashRecovered;
    const cashOnCash = cashLeftIn > 0 ? ((annualCashFlow / cashLeftIn) * 100) : 0;

    return { 
      cashRecovered, 
      cashLeftIn, 
      monthlyCashFlow, 
      annualCashFlow, 
      cashOnCash, 
      refinanceAmount,
      monthlyPayment,
      totalExpenses 
    };
  };

  const calculateCreative = () => {
    const purchase = parseFloat(creativeData.purchasePrice) || 0;
    const down = parseFloat(creativeData.downPayment) || 0;
    const rate = parseFloat(creativeData.interestRate) || 0;
    const term = creativeData.term || 360;
    const balloon = parseFloat(creativeData.balloonTerm) || 0;
    const rent = parseFloat(creativeData.rentAmount) || 0;
    const tax = parseFloat(creativeData.propertyTax) || 0;
    const insurance = parseFloat(creativeData.insurance) || 0;
    const maintenance = parseFloat(creativeData.maintenance) || 0;

    const financed = purchase - down;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = financed > 0 && rate > 0 ? 
      (financed * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1) : 0;
    
    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;
    const totalMonthlyExpense = monthlyPayment + monthlyTax + monthlyInsurance + maintenance;
    const monthlyCashFlow = rent - totalMonthlyExpense;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = down > 0 ? ((annualCashFlow / down) * 100) : 0;

    let balloonPayment = 0;
    if (balloon > 0 && balloon < term) {
      balloonPayment = financed * Math.pow(1 + monthlyRate, balloon) - 
        (monthlyPayment * (Math.pow(1 + monthlyRate, balloon) - 1) / monthlyRate);
    }

    return { 
      monthlyPayment, 
      monthlyCashFlow, 
      annualCashFlow, 
      cashOnCash, 
      balloonPayment,
      totalMonthlyExpense 
    };
  };

  const calculateRental = () => {
    const purchase = parseFloat(rentalData.purchasePrice) || 0;
    const downPercent = rentalData.downPayment || 20;
    const rate = rentalData.interestRate || 7;
    const term = rentalData.term || 360;
    const rent = parseFloat(rentalData.rentAmount) || 0;
    const tax = parseFloat(rentalData.propertyTax) || 0;
    const insurance = parseFloat(rentalData.insurance) || 0;
    const hoa = parseFloat(rentalData.hoa) || 0;
    const maintenancePercent = rentalData.maintenance || 8;
    const vacancyPercent = rentalData.vacancy || 5;
    const pmPercent = rentalData.propertyMgmt || 10;
    const capexPercent = rentalData.capex || 5;
    const utilities = parseFloat(rentalData.utilities) || 0;

    const downPayment = purchase * (downPercent / 100);
    const loanAmount = purchase - downPayment;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = loanAmount > 0 ? 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1) : 0;

    const maintenance = rent * (maintenancePercent / 100);
    const vacancy = rent * (vacancyPercent / 100);
    const propertyMgmt = rent * (pmPercent / 100);
    const capex = rent * (capexPercent / 100);
    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;

    const totalExpenses = monthlyPayment + monthlyTax + monthlyInsurance + hoa + 
                          maintenance + vacancy + propertyMgmt + capex + utilities;
    const noi = rent - (monthlyTax + monthlyInsurance + hoa + maintenance + vacancy + 
                        propertyMgmt + capex + utilities);
    const monthlyCashFlow = rent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = downPayment > 0 ? ((annualCashFlow / downPayment) * 100) : 0;
    const capRate = purchase > 0 ? ((noi * 12) / purchase * 100) : 0;
    const rentRatio = purchase > 0 ? ((rent / purchase) * 100) : 0;

    return { 
      monthlyCashFlow, 
      annualCashFlow, 
      cashOnCash, 
      capRate, 
      rentRatio,
      monthlyPayment,
      totalExpenses,
      noi
    };
  };

  const calculateWholesale = () => {
    const contract = parseFloat(wholesaleData.contractPrice) || 0;
    const arv = parseFloat(wholesaleData.arv) || 0;
    const rehab = parseFloat(wholesaleData.rehabCosts) || 0;
    const fee = parseFloat(wholesaleData.assignmentFee) || 0;
    const marketing = parseFloat(wholesaleData.marketingCosts) || 0;
    const earnest = parseFloat(wholesaleData.earnestMoney) || 0;

    const buyerMAO = (arv * 0.70) - rehab;
    const spread = buyerMAO - contract;
    const netProfit = fee - marketing;
    const roi = (earnest + marketing) > 0 ? ((netProfit / (earnest + marketing)) * 100) : 0;
    const buyerEquity = arv - (contract + fee + rehab);

    return { buyerMAO, spread, netProfit, roi, buyerEquity };
  };

  const calculateExchange = () => {
    const sale = parseFloat(exchangeData.salePrice) || 0;
    const original = parseFloat(exchangeData.originalPurchase) || 0;
    const basis = parseFloat(exchangeData.currentBasis) || original;
    const depreciation = parseFloat(exchangeData.depreciation) || 0;
    const federalRate = exchangeData.federalRate || 20;
    const stateRate = exchangeData.stateRate || 5;
    const recaptureRate = exchangeData.recaptureRate || 25;
    const newPurchase = parseFloat(exchangeData.purchasePriceNew) || 0;

    const capitalGain = sale - basis;
    const depreciationRecapture = depreciation;
    
    const federalCapGainTax = capitalGain * (federalRate / 100);
    const stateCapGainTax = capitalGain * (stateRate / 100);
    const recaptureTax = depreciationRecapture * (recaptureRate / 100);
    const totalTaxWithout1031 = federalCapGainTax + stateCapGainTax + recaptureTax;
    
    const taxDeferred = newPurchase >= sale ? totalTaxWithout1031 : 0;
    const boot = sale > newPurchase ? sale - newPurchase : 0;
    const taxOnBoot = boot * ((federalRate + stateRate) / 100);

    return { 
      capitalGain, 
      totalTaxWithout1031, 
      taxDeferred, 
      boot, 
      taxOnBoot,
      federalCapGainTax,
      stateCapGainTax,
      recaptureTax 
    };
  };

  const calculateCashFlow = () => {
    const rent = parseFloat(cashFlowData.monthlyRent) || 0;
    const mortgage = parseFloat(cashFlowData.mortgage) || 0;
    const tax = parseFloat(cashFlowData.propertyTax) || 0;
    const insurance = parseFloat(cashFlowData.insurance) || 0;
    const maintenance = parseFloat(cashFlowData.maintenance) || 0;
    const vacancyPercent = cashFlowData.vacancy || 5;
    const pmPercent = cashFlowData.propertyMgmt || 10;
    const hoa = parseFloat(cashFlowData.hoa) || 0;
    const utilities = parseFloat(cashFlowData.utilities) || 0;

    const vacancy = rent * (vacancyPercent / 100);
    const propertyMgmt = rent * (pmPercent / 100);
    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;

    const totalExpenses = mortgage + monthlyTax + monthlyInsurance + maintenance + vacancy + propertyMgmt + hoa + utilities;
    const monthlyCashFlow = rent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const effectiveGrossIncome = rent - vacancy;

    return { 
      monthlyCashFlow, 
      annualCashFlow, 
      totalExpenses,
      effectiveGrossIncome,
      vacancy,
      propertyMgmt
    };
  };

  const calculateROI = () => {
    const purchase = parseFloat(roiData.purchasePrice) || 0;
    const currentValue = parseFloat(roiData.currentValue) || 0;
    const cashInvested = parseFloat(roiData.totalCashInvested) || 0;
    const annualCashFlow = parseFloat(roiData.annualCashFlow) || 0;
    const appreciation = parseFloat(roiData.appreciationGain) || (currentValue - purchase);
    const principalPaydown = parseFloat(roiData.principalPaydown) || 0;

    const totalReturn = annualCashFlow + appreciation + principalPaydown;
    const cashOnCashROI = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;
    const totalROI = cashInvested > 0 ? (totalReturn / cashInvested) * 100 : 0;
    const equity = currentValue - (purchase - principalPaydown);

    return { 
      totalReturn, 
      cashOnCashROI, 
      totalROI, 
      equity,
      appreciation
    };
  };

  const calculateCapRate = () => {
    const purchase = parseFloat(capRateData.purchasePrice) || 0;
    const grossRent = parseFloat(capRateData.grossRent) || 0;
    const vacancyPercent = capRateData.vacancy || 5;
    const opExpenses = parseFloat(capRateData.operatingExpenses) || 0;
    const tax = parseFloat(capRateData.propertyTax) || 0;
    const insurance = parseFloat(capRateData.insurance) || 0;
    const maintenance = parseFloat(capRateData.maintenance) || 0;
    const pm = parseFloat(capRateData.propertyMgmt) || 0;

    const vacancy = grossRent * (vacancyPercent / 100);
    const effectiveGrossIncome = grossRent - vacancy;
    const totalExpenses = opExpenses + tax + insurance + maintenance + pm;
    const noi = effectiveGrossIncome - totalExpenses;
    const capRate = purchase > 0 ? (noi / purchase) * 100 : 0;
    const grm = grossRent > 0 ? purchase / grossRent : 0;

    return { 
      noi, 
      capRate, 
      effectiveGrossIncome,
      totalExpenses,
      grm
    };
  };


  const calculateMortgage = () => {
    const principal = parseFloat(mortgageData.loanAmount) || 0;
    const rate = mortgageData.interestRate || 7;
    const years = mortgageData.loanTerm || 30;
    const tax = parseFloat(mortgageData.propertyTax) || 0;
    const insurance = parseFloat(mortgageData.insurance) || 0;
    const pmi = parseFloat(mortgageData.pmi) || 0;
    const hoa = parseFloat(mortgageData.hoa) || 0;

    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    const monthlyPI = principal > 0 && rate > 0 ? 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;
    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + pmi + hoa;
    const totalInterest = (monthlyPI * numPayments) - principal;
    const totalCost = totalMonthlyPayment * numPayments;

    return { 
      monthlyPI, 
      totalMonthlyPayment, 
      totalInterest,
      totalCost,
      monthlyTax,
      monthlyInsurance
    };
  };

  // Helper Functions
  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return '0%';
    return `${value.toFixed(2)}%`;
  };

  const getCurrentData = () => {
    const dataMap: Record<string, unknown> = {
      mao: maoData,
      wmao: wmaoData,
      flip: flipData,
      brrrr: brrrData,
      creative: creativeData,
      rental: rentalData,
      wholesale: wholesaleData,
      exchange: exchangeData,
      cashflow: cashFlowData,
      roi: roiData,
      caprate: capRateData,
      mortgage: mortgageData
    };
    return dataMap[activeCalc];
  };

  const getCurrentResults = () => {
    const resultsMap: Record<string, unknown> = {
      mao: calculateMAO(),
      wmao: calculateWMAO(),
      flip: calculateFlip(),
      brrrr: calculateBRRRR(),
      creative: calculateCreative(),
      rental: calculateRental(),
      wholesale: calculateWholesale(),
      exchange: calculateExchange(),
      cashflow: calculateCashFlow(),
      roi: calculateROI(),
      caprate: calculateCapRate(),
      mortgage: calculateMortgage()
    };
    return resultsMap[activeCalc];
  };

  const saveDeal = () => {
    const deal: SavedDeal = {
      id: Date.now(),
      type: activeCalc,
      date: new Date().toLocaleDateString(),
      data: getCurrentData(),
      results: getCurrentResults()
    };
    setSavedDeals([...savedDeals, deal]);
    toast({
      title: "Deal Saved",
      description: "Your deal has been saved successfully!"
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = () => {
    toast({
      title: "Export PDF",
      description: "PDF export functionality coming soon!"
    });
  };


  // Get current results based on active calculator
  const getActiveResults = () => {
    switch(activeCalc) {
      case 'mao': return calculateMAO();
      case 'wmao': return calculateWMAO();
      case 'flip': return calculateFlip();
      case 'brrrr': return calculateBRRRR();
      case 'creative': return calculateCreative();
      case 'rental': return calculateRental();
      case 'wholesale': return calculateWholesale();
      case 'exchange': return calculateExchange();
      case 'cashflow': return calculateCashFlow();
      case 'roi': return calculateROI();
      case 'caprate': return calculateCapRate();
      case 'mortgage': return calculateMortgage();
      default: return {};
    }
  };

  const results = getActiveResults();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                  Analyze Deals Like A Pro
                </h1>
                <p className="text-muted-foreground text-lg">
                  MAO, Fix & Flip, BRRRR, Creative Finance & More
                </p>
              </div>

              {/* Calculator Selector */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Select Calculator Type <span className="text-xs">(drag to reorder)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-3' : 'flex flex-col gap-2'}>
                  {calculators.map((calc) => {
                    const Icon = calc.icon;
                    const isActive = activeCalc === calc.id;
                    const isDragging = draggedCalc === calc.id;
                    const isHovered = hoveredCalc === calc.id;
                    const showDropBefore = dropPosition?.id === calc.id && dropPosition?.position === 'before';
                    const showDropAfter = dropPosition?.id === calc.id && dropPosition?.position === 'after';
                    
                    return (
                      <div 
                        key={calc.id} 
                        className="relative"
                        onMouseEnter={() => setHoveredCalc(calc.id)}
                        onMouseLeave={() => setHoveredCalc(null)}
                      >
                        {showDropBefore && (
                          <div className={`absolute ${viewMode === 'list' ? 'top-0 left-0 right-0 h-0.5' : 'left-0 top-0 bottom-0 w-0.5'} bg-emerald-500 z-10`}>
                            <div className={`absolute ${viewMode === 'list' ? '-left-1 -top-1' : '-top-1 -left-1'} w-2 h-2 rounded-full bg-emerald-500`} />
                            <div className={`absolute ${viewMode === 'list' ? '-right-1 -top-1' : '-bottom-1 -left-1'} w-2 h-2 rounded-full bg-emerald-500`} />
                          </div>
                        )}
                        
                        <button
                          data-calculator-button
                          draggable
                          onDragStart={(e) => handleDragStart(e, calc.id)}
                          onDragOver={(e) => handleDragOver(e, calc.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, calc.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setActiveCalc(calc.id)}
                          className={`w-full ${viewMode === 'grid' ? 'p-4 flex-col' : 'p-3 flex-row justify-start'} rounded-lg border-2 transition-all duration-200 flex items-center gap-2 relative ${
                            isDragging ? 'opacity-50' : ''
                          } ${
                            isActive
                              ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                              : 'border-border bg-card hover:border-muted-foreground'
                          }`}
                        >
                          {/* Drag handle - only visible on hover */}
                          <div className={`absolute ${viewMode === 'grid' ? 'top-2 left-2' : 'left-2'} transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <IconTooltip label="Drag to reorder" side="top">
                              <div>
                                <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
                              </div>
                            </IconTooltip>
                          </div>
                          
                          {/* Settings icon - only visible on hover */}
                          <div 
                            className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'right-2'} transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            onClick={(e) => openCalculatorSettings(e, calc.id)}
                          >
                            <IconTooltip label="Calculator settings" side="top">
                              <div>
                                <Settings className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer" />
                              </div>
                            </IconTooltip>
                          </div>
                          
                          <Icon className={`w-6 h-6 ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${viewMode === 'grid' ? 'text-center' : ''}`}>{calc.name}</span>
                        </button>
                        
                        {showDropAfter && (
                          <div className={`absolute ${viewMode === 'list' ? 'bottom-0 left-0 right-0 h-0.5' : 'right-0 top-0 bottom-0 w-0.5'} bg-emerald-500 z-10`}>
                            <div className={`absolute ${viewMode === 'list' ? '-left-1 -bottom-1' : '-top-1 -right-1'} w-2 h-2 rounded-full bg-emerald-500`} />
                            <div className={`absolute ${viewMode === 'list' ? '-right-1 -bottom-1' : '-bottom-1 -right-1'} w-2 h-2 rounded-full bg-emerald-500`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons - only show when a calculator is selected */}
              {activeCalc && (
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <Button onClick={saveDeal} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="w-5 h-5 mr-2" />
                    Print
                  </Button>
                  <Button onClick={exportToPDF} variant="outline">
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="outline">
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </Button>
                </div>
              )}
            </div>

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Default Calculator Settings
                  </DialogTitle>
                  <DialogDescription>
                    Configure default values for all calculators. Changes are saved automatically.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* MAO & WMAO Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">MAO Calculators</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="MAO Profit Margin (%)" value={config.mao_profitMargin} min={50} max={90} onChange={(v) => updateConfig('mao_profitMargin', v)} />
                      <ConfigSlider label="WMAO Buyer Profit (%)" value={config.wmao_buyerProfit} min={50} max={90} onChange={(v) => updateConfig('wmao_buyerProfit', v)} />
                    </div>
                  </div>

                  {/* Flip Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Fix & Flip</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Holding Time (months)" value={config.flip_holdingTime} min={1} max={24} onChange={(v) => updateConfig('flip_holdingTime', v)} />
                      <ConfigSlider label="Selling Costs (%)" value={config.flip_sellingCosts} min={3} max={12} onChange={(v) => updateConfig('flip_sellingCosts', v)} />
                      <ConfigSlider label="Interest Rate (%)" value={config.flip_interestRate} min={5} max={20} step={0.5} onChange={(v) => updateConfig('flip_interestRate', v)} />
                      <ConfigSlider label="Closing Costs (%)" value={config.flip_closingCosts} min={1} max={10} onChange={(v) => updateConfig('flip_closingCosts', v)} />
                      <ConfigSlider label="Contingency (%)" value={config.flip_contingency} min={5} max={25} onChange={(v) => updateConfig('flip_contingency', v)} />
                    </div>
                  </div>

                  {/* BRRRR Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">BRRRR Method</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Refinance LTV (%)" value={config.brrrr_refinanceLTV} min={60} max={85} onChange={(v) => updateConfig('brrrr_refinanceLTV', v)} />
                      <ConfigSlider label="Interest Rate (%)" value={config.brrrr_interestRate} min={4} max={12} step={0.25} onChange={(v) => updateConfig('brrrr_interestRate', v)} />
                      <ConfigSlider label="Maintenance (%)" value={config.brrrr_maintenance} min={5} max={20} onChange={(v) => updateConfig('brrrr_maintenance', v)} />
                      <ConfigSlider label="Vacancy (%)" value={config.brrrr_vacancy} min={3} max={15} onChange={(v) => updateConfig('brrrr_vacancy', v)} />
                      <ConfigSlider label="Property Mgmt (%)" value={config.brrrr_propertyMgmt} min={0} max={15} onChange={(v) => updateConfig('brrrr_propertyMgmt', v)} />
                      <ConfigSlider label="Closing Costs (%)" value={config.brrrr_closingCosts} min={1} max={8} onChange={(v) => updateConfig('brrrr_closingCosts', v)} />
                    </div>
                  </div>

                  {/* Rental Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rental Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Down Payment (%)" value={config.rental_downPayment} min={5} max={50} onChange={(v) => updateConfig('rental_downPayment', v)} />
                      <ConfigSlider label="Interest Rate (%)" value={config.rental_interestRate} min={4} max={12} step={0.25} onChange={(v) => updateConfig('rental_interestRate', v)} />
                      <ConfigSlider label="Maintenance (%)" value={config.rental_maintenance} min={3} max={15} onChange={(v) => updateConfig('rental_maintenance', v)} />
                      <ConfigSlider label="Vacancy (%)" value={config.rental_vacancy} min={3} max={15} onChange={(v) => updateConfig('rental_vacancy', v)} />
                      <ConfigSlider label="Property Mgmt (%)" value={config.rental_propertyMgmt} min={0} max={15} onChange={(v) => updateConfig('rental_propertyMgmt', v)} />
                      <ConfigSlider label="CapEx (%)" value={config.rental_capex} min={3} max={15} onChange={(v) => updateConfig('rental_capex', v)} />
                    </div>
                  </div>

                  {/* Cash Flow & Cap Rate Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Cash Flow & Cap Rate</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Cash Flow Vacancy (%)" value={config.cashflow_vacancy} min={3} max={15} onChange={(v) => updateConfig('cashflow_vacancy', v)} />
                      <ConfigSlider label="Cash Flow Property Mgmt (%)" value={config.cashflow_propertyMgmt} min={0} max={15} onChange={(v) => updateConfig('cashflow_propertyMgmt', v)} />
                      <ConfigSlider label="Cap Rate Vacancy (%)" value={config.caprate_vacancy} min={3} max={15} onChange={(v) => updateConfig('caprate_vacancy', v)} />
                    </div>
                  </div>

                  {/* 1031 Exchange Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">1031 Exchange</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Federal Tax Rate (%)" value={config.exchange_federalRate} min={10} max={35} onChange={(v) => updateConfig('exchange_federalRate', v)} />
                      <ConfigSlider label="State Tax Rate (%)" value={config.exchange_stateRate} min={0} max={15} onChange={(v) => updateConfig('exchange_stateRate', v)} />
                      <ConfigSlider label="Recapture Rate (%)" value={config.exchange_recaptureRate} min={15} max={35} onChange={(v) => updateConfig('exchange_recaptureRate', v)} />
                    </div>
                  </div>

                  {/* Mortgage Defaults */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Mortgage</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigSlider label="Interest Rate (%)" value={config.mortgage_interestRate} min={4} max={12} step={0.125} onChange={(v) => updateConfig('mortgage_interestRate', v)} />
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Loan Term (Years)</label>
                        <select
                          value={config.mortgage_loanTerm}
                          onChange={(e) => updateConfig('mortgage_loanTerm', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value={15}>15 Years</option>
                          <option value={20}>20 Years</option>
                          <option value={30}>30 Years</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button variant="outline" onClick={resetToDefaults} className="text-destructive hover:text-destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button onClick={() => setShowSettings(false)}>
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Per-Calculator Settings Dialog */}
            {calcSettingsTarget && (
              <CalculatorSettingsDialog
                open={showCalcSettings}
                onOpenChange={setShowCalcSettings}
                calculatorId={calcSettingsTarget}
                calculatorName={calculators.find(c => c.id === calcSettingsTarget)?.name || 'Calculator'}
                settings={getCalcSettings(calcSettingsTarget)}
                onSettingsChange={handleCalcSettingsChange}
                onReset={resetCalcSettings}
              />
            )}

            {/* Calculator Content - Only show when a calculator is selected */}
            {activeCalc && (
              <div className="max-w-7xl mx-auto" ref={printRef}>
                {/* Wrapper div for click outside detection */}
                <div ref={calculatorSectionRef}>
                  {/* MAO Calculator */}
                  {activeCalc === 'mao' && (
                    <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      Deal Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="After Repair Value (ARV)" value={maoData.arv} onChange={(val) => setMaoData({...maoData, arv: val})} />
                      <InputField label="Estimated Rehab Costs" value={maoData.rehabCosts} onChange={(val) => setMaoData({...maoData, rehabCosts: val})} />
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Profit Margin (%)</label>
                        <input
                          type="range"
                          min="50"
                          max="90"
                          value={maoData.profitMargin}
                          onChange={(e) => setMaoData({...maoData, profitMargin: Number(e.target.value)})}
                          className="w-full accent-emerald-600"
                        />
                        <div className="text-right text-emerald-600 font-medium mt-1">{maoData.profitMargin}%</div>
                      </div>
                      <InputField label="Assignment Fee (Optional)" value={maoData.assignmentFee} onChange={(val) => setMaoData({...maoData, assignmentFee: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800">
                      <BarChart3 className="w-5 h-5" />
                      Analysis Results
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Maximum Allowable Offer" value={formatCurrency((results as ReturnType<typeof calculateMAO>).mao)} highlight />
                      <ResultCard label="Potential Equity" value={formatCurrency((results as ReturnType<typeof calculateMAO>).equity)} positive={(results as ReturnType<typeof calculateMAO>).equity > 0} />
                      <ResultCard label="Return on Investment" value={formatPercent((results as ReturnType<typeof calculateMAO>).roi)} positive={(results as ReturnType<typeof calculateMAO>).roi > 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* WMAO Calculator */}
              {activeCalc === 'wmao' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Wholesale Deal Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="After Repair Value (ARV)" value={wmaoData.arv} onChange={(val) => setWmaoData({...wmaoData, arv: val})} />
                      <InputField label="Estimated Rehab Costs" value={wmaoData.rehabCosts} onChange={(val) => setWmaoData({...wmaoData, rehabCosts: val})} />
                      <InputField label="Your Wholesale Fee" value={wmaoData.wholesaleFee} onChange={(val) => setWmaoData({...wmaoData, wholesaleFee: val})} />
                      <InputField label="Holding Costs" value={wmaoData.holdingCosts} onChange={(val) => setWmaoData({...wmaoData, holdingCosts: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
                      <BarChart3 className="w-5 h-5" />
                      Wholesale Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Your Maximum Offer (WMAO)" value={formatCurrency((results as ReturnType<typeof calculateWMAO>).wmao)} highlight />
                      <ResultCard label="Buyer's MAO" value={formatCurrency((results as ReturnType<typeof calculateWMAO>).buyerMAO)} />
                      <ResultCard label="Your Wholesale Profit" value={formatCurrency((results as ReturnType<typeof calculateWMAO>).totalProfit)} positive={(results as ReturnType<typeof calculateWMAO>).totalProfit > 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* Flip Calculator */}
              {activeCalc === 'flip' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-purple-600" />
                      Fix & Flip Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={flipData.purchasePrice} onChange={(val) => setFlipData({...flipData, purchasePrice: val})} />
                      <InputField label="Rehab Costs" value={flipData.rehabCosts} onChange={(val) => setFlipData({...flipData, rehabCosts: val})} />
                      <InputField label="After Repair Value (ARV)" value={flipData.arv} onChange={(val) => setFlipData({...flipData, arv: val})} />
                      <InputField label="Loan Amount" value={flipData.loanAmount} onChange={(val) => setFlipData({...flipData, loanAmount: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
                      <TrendingUp className="w-5 h-5" />
                      Flip Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Estimated Profit" value={formatCurrency((results as ReturnType<typeof calculateFlip>).profit)} highlight positive={(results as ReturnType<typeof calculateFlip>).profit > 0} />
                      <ResultCard label="ROI" value={formatPercent((results as ReturnType<typeof calculateFlip>).roi)} positive={(results as ReturnType<typeof calculateFlip>).roi > 0} />
                      <ResultCard label="Annualized ROI" value={formatPercent((results as ReturnType<typeof calculateFlip>).annualizedROI)} positive={(results as ReturnType<typeof calculateFlip>).annualizedROI > 0} />
                      <ResultCard label="Total Costs" value={formatCurrency((results as ReturnType<typeof calculateFlip>).totalCosts)} />
                    </div>
                  </div>
                </div>
              )}

              {/* BRRRR Calculator */}
              {activeCalc === 'brrrr' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-orange-600" />
                      BRRRR Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={brrrData.purchasePrice} onChange={(val) => setBrrrrData({...brrrData, purchasePrice: val})} />
                      <InputField label="Rehab Costs" value={brrrData.rehabCosts} onChange={(val) => setBrrrrData({...brrrData, rehabCosts: val})} />
                      <InputField label="After Repair Value (ARV)" value={brrrData.arv} onChange={(val) => setBrrrrData({...brrrData, arv: val})} />
                      <InputField label="Monthly Rent" value={brrrData.rentAmount} onChange={(val) => setBrrrrData({...brrrData, rentAmount: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-800">
                      <PiggyBank className="w-5 h-5" />
                      BRRRR Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Cash Recovered" value={formatCurrency((results as ReturnType<typeof calculateBRRRR>).cashRecovered)} highlight />
                      <ResultCard label="Cash Left In Deal" value={formatCurrency((results as ReturnType<typeof calculateBRRRR>).cashLeftIn)} />
                      <ResultCard label="Monthly Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateBRRRR>).monthlyCashFlow)} positive={(results as ReturnType<typeof calculateBRRRR>).monthlyCashFlow > 0} />
                      <ResultCard label="Cash on Cash Return" value={formatPercent((results as ReturnType<typeof calculateBRRRR>).cashOnCash)} positive={(results as ReturnType<typeof calculateBRRRR>).cashOnCash > 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* Rental Calculator */}
              {activeCalc === 'rental' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-600" />
                      Rental Property Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={rentalData.purchasePrice} onChange={(val) => setRentalData({...rentalData, purchasePrice: val})} />
                      <InputField label="Monthly Rent" value={rentalData.rentAmount} onChange={(val) => setRentalData({...rentalData, rentAmount: val})} />
                      <InputField label="Annual Property Tax" value={rentalData.propertyTax} onChange={(val) => setRentalData({...rentalData, propertyTax: val})} />
                      <InputField label="Annual Insurance" value={rentalData.insurance} onChange={(val) => setRentalData({...rentalData, insurance: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-800">
                      <BarChart3 className="w-5 h-5" />
                      Rental Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Monthly Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateRental>).monthlyCashFlow)} highlight positive={(results as ReturnType<typeof calculateRental>).monthlyCashFlow > 0} />
                      <ResultCard label="Annual Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateRental>).annualCashFlow)} positive={(results as ReturnType<typeof calculateRental>).annualCashFlow > 0} />
                      <ResultCard label="Cash on Cash Return" value={formatPercent((results as ReturnType<typeof calculateRental>).cashOnCash)} positive={(results as ReturnType<typeof calculateRental>).cashOnCash > 8} />
                      <ResultCard label="Cap Rate" value={formatPercent((results as ReturnType<typeof calculateRental>).capRate)} positive={(results as ReturnType<typeof calculateRental>).capRate > 6} />
                    </div>
                  </div>
                </div>
              )}

              {/* Creative Finance Calculator */}
              {activeCalc === 'creative' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      Creative Finance Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={creativeData.purchasePrice} onChange={(val) => setCreativeData({...creativeData, purchasePrice: val})} />
                      <InputField label="Down Payment" value={creativeData.downPayment} onChange={(val) => setCreativeData({...creativeData, downPayment: val})} />
                      <InputField label="Interest Rate (%)" value={creativeData.interestRate} onChange={(val) => setCreativeData({...creativeData, interestRate: val})} />
                      <InputField label="Expected Monthly Rent" value={creativeData.rentAmount} onChange={(val) => setCreativeData({...creativeData, rentAmount: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-800">
                      <PiggyBank className="w-5 h-5" />
                      Creative Finance Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Monthly Payment" value={formatCurrency((results as ReturnType<typeof calculateCreative>).monthlyPayment)} />
                      <ResultCard label="Monthly Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateCreative>).monthlyCashFlow)} highlight positive={(results as ReturnType<typeof calculateCreative>).monthlyCashFlow > 0} />
                      <ResultCard label="Annual Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateCreative>).annualCashFlow)} positive={(results as ReturnType<typeof calculateCreative>).annualCashFlow > 0} />
                      <ResultCard label="Cash on Cash Return" value={formatPercent((results as ReturnType<typeof calculateCreative>).cashOnCash)} positive={(results as ReturnType<typeof calculateCreative>).cashOnCash > 10} />
                    </div>
                  </div>
                </div>
              )}

              {/* Wholesale Deal Calculator */}
              {activeCalc === 'wholesale' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-cyan-600" />
                      Wholesale Deal Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Your Contract Price" value={wholesaleData.contractPrice} onChange={(val) => setWholesaleData({...wholesaleData, contractPrice: val})} />
                      <InputField label="After Repair Value (ARV)" value={wholesaleData.arv} onChange={(val) => setWholesaleData({...wholesaleData, arv: val})} />
                      <InputField label="Estimated Rehab Costs" value={wholesaleData.rehabCosts} onChange={(val) => setWholesaleData({...wholesaleData, rehabCosts: val})} />
                      <InputField label="Your Assignment Fee" value={wholesaleData.assignmentFee} onChange={(val) => setWholesaleData({...wholesaleData, assignmentFee: val})} />
                      <InputField label="Marketing Costs" value={wholesaleData.marketingCosts} onChange={(val) => setWholesaleData({...wholesaleData, marketingCosts: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-800">
                      <DollarSign className="w-5 h-5" />
                      Wholesale Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Your Net Profit" value={formatCurrency((results as ReturnType<typeof calculateWholesale>).netProfit)} highlight positive={(results as ReturnType<typeof calculateWholesale>).netProfit > 0} />
                      <ResultCard label="Buyer's Maximum Offer" value={formatCurrency((results as ReturnType<typeof calculateWholesale>).buyerMAO)} />
                      <ResultCard label="Deal Spread" value={formatCurrency((results as ReturnType<typeof calculateWholesale>).spread)} positive={(results as ReturnType<typeof calculateWholesale>).spread > 0} />
                      <ResultCard label="Your ROI" value={formatPercent((results as ReturnType<typeof calculateWholesale>).roi)} positive={(results as ReturnType<typeof calculateWholesale>).roi > 100} />
                    </div>
                  </div>
                </div>
              )}

              {/* 1031 Exchange Calculator */}
              {activeCalc === 'exchange' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-yellow-600" />
                      1031 Exchange Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Sale Price of Property" value={exchangeData.salePrice} onChange={(val) => setExchangeData({...exchangeData, salePrice: val})} />
                      <InputField label="Original Purchase Price" value={exchangeData.originalPurchase} onChange={(val) => setExchangeData({...exchangeData, originalPurchase: val})} />
                      <InputField label="Current Tax Basis" value={exchangeData.currentBasis} onChange={(val) => setExchangeData({...exchangeData, currentBasis: val})} />
                      <InputField label="Total Depreciation Taken" value={exchangeData.depreciation} onChange={(val) => setExchangeData({...exchangeData, depreciation: val})} />
                      <InputField label="Purchase Price of New Property" value={exchangeData.purchasePriceNew} onChange={(val) => setExchangeData({...exchangeData, purchasePriceNew: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-800">
                      <PiggyBank className="w-5 h-5" />
                      1031 Exchange Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Capital Gain" value={formatCurrency((results as ReturnType<typeof calculateExchange>).capitalGain)} />
                      <ResultCard label="Total Tax Without 1031" value={formatCurrency((results as ReturnType<typeof calculateExchange>).totalTaxWithout1031)} highlight />
                      <ResultCard label="Tax Deferred with 1031" value={formatCurrency((results as ReturnType<typeof calculateExchange>).taxDeferred)} positive={(results as ReturnType<typeof calculateExchange>).taxDeferred > 0} />
                      {(results as ReturnType<typeof calculateExchange>).boot > 0 && (
                        <ResultCard label="Tax on Boot" value={formatCurrency((results as ReturnType<typeof calculateExchange>).taxOnBoot)} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Flow Calculator */}
              {activeCalc === 'cashflow' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-teal-600" />
                      Cash Flow Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Monthly Rent" value={cashFlowData.monthlyRent} onChange={(val) => setCashFlowData({...cashFlowData, monthlyRent: val})} />
                      <InputField label="Monthly Mortgage (P&I)" value={cashFlowData.mortgage} onChange={(val) => setCashFlowData({...cashFlowData, mortgage: val})} />
                      <InputField label="Annual Property Tax" value={cashFlowData.propertyTax} onChange={(val) => setCashFlowData({...cashFlowData, propertyTax: val})} />
                      <InputField label="Annual Insurance" value={cashFlowData.insurance} onChange={(val) => setCashFlowData({...cashFlowData, insurance: val})} />
                      <InputField label="Monthly Maintenance" value={cashFlowData.maintenance} onChange={(val) => setCashFlowData({...cashFlowData, maintenance: val})} />
                      <InputField label="Monthly HOA" value={cashFlowData.hoa} onChange={(val) => setCashFlowData({...cashFlowData, hoa: val})} />
                      <InputField label="Monthly Utilities" value={cashFlowData.utilities} onChange={(val) => setCashFlowData({...cashFlowData, utilities: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-teal-800">
                      <BarChart3 className="w-5 h-5" />
                      Cash Flow Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Monthly Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateCashFlow>).monthlyCashFlow)} highlight positive={(results as ReturnType<typeof calculateCashFlow>).monthlyCashFlow > 0} />
                      <ResultCard label="Annual Cash Flow" value={formatCurrency((results as ReturnType<typeof calculateCashFlow>).annualCashFlow)} positive={(results as ReturnType<typeof calculateCashFlow>).annualCashFlow > 0} />
                      <ResultCard label="Total Monthly Expenses" value={formatCurrency((results as ReturnType<typeof calculateCashFlow>).totalExpenses)} />
                      <ResultCard label="Effective Gross Income" value={formatCurrency((results as ReturnType<typeof calculateCashFlow>).effectiveGrossIncome)} />
                    </div>
                  </div>
                </div>
              )}

              {/* ROI Calculator */}
              {activeCalc === 'roi' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-indigo-600" />
                      ROI Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={roiData.purchasePrice} onChange={(val) => setRoiData({...roiData, purchasePrice: val})} />
                      <InputField label="Current Property Value" value={roiData.currentValue} onChange={(val) => setRoiData({...roiData, currentValue: val})} />
                      <InputField label="Total Cash Invested" value={roiData.totalCashInvested} onChange={(val) => setRoiData({...roiData, totalCashInvested: val})} />
                      <InputField label="Annual Cash Flow" value={roiData.annualCashFlow} onChange={(val) => setRoiData({...roiData, annualCashFlow: val})} />
                      <InputField label="Appreciation Gain" value={roiData.appreciationGain} onChange={(val) => setRoiData({...roiData, appreciationGain: val})} />
                      <InputField label="Principal Paydown (Annual)" value={roiData.principalPaydown} onChange={(val) => setRoiData({...roiData, principalPaydown: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-800">
                      <TrendingUp className="w-5 h-5" />
                      ROI Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Total ROI" value={formatPercent((results as ReturnType<typeof calculateROI>).totalROI)} highlight positive={(results as ReturnType<typeof calculateROI>).totalROI > 0} />
                      <ResultCard label="Cash-on-Cash ROI" value={formatPercent((results as ReturnType<typeof calculateROI>).cashOnCashROI)} positive={(results as ReturnType<typeof calculateROI>).cashOnCashROI > 8} />
                      <ResultCard label="Total Annual Return" value={formatCurrency((results as ReturnType<typeof calculateROI>).totalReturn)} positive={(results as ReturnType<typeof calculateROI>).totalReturn > 0} />
                      <ResultCard label="Total Equity" value={formatCurrency((results as ReturnType<typeof calculateROI>).equity)} positive={(results as ReturnType<typeof calculateROI>).equity > 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* Cap Rate Calculator */}
              {activeCalc === 'caprate' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-violet-600" />
                      Cap Rate Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Purchase Price" value={capRateData.purchasePrice} onChange={(val) => setCapRateData({...capRateData, purchasePrice: val})} />
                      <InputField label="Annual Gross Rent" value={capRateData.grossRent} onChange={(val) => setCapRateData({...capRateData, grossRent: val})} />
                      <InputField label="Annual Property Tax" value={capRateData.propertyTax} onChange={(val) => setCapRateData({...capRateData, propertyTax: val})} />
                      <InputField label="Annual Insurance" value={capRateData.insurance} onChange={(val) => setCapRateData({...capRateData, insurance: val})} />
                      <InputField label="Annual Maintenance" value={capRateData.maintenance} onChange={(val) => setCapRateData({...capRateData, maintenance: val})} />
                      <InputField label="Annual Property Mgmt" value={capRateData.propertyMgmt} onChange={(val) => setCapRateData({...capRateData, propertyMgmt: val})} />
                      <InputField label="Other Operating Expenses" value={capRateData.operatingExpenses} onChange={(val) => setCapRateData({...capRateData, operatingExpenses: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-6 border border-violet-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-violet-800">
                      <BarChart3 className="w-5 h-5" />
                      Cap Rate Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Cap Rate" value={formatPercent((results as ReturnType<typeof calculateCapRate>).capRate)} highlight positive={(results as ReturnType<typeof calculateCapRate>).capRate > 6} />
                      <ResultCard label="Net Operating Income (NOI)" value={formatCurrency((results as ReturnType<typeof calculateCapRate>).noi)} positive={(results as ReturnType<typeof calculateCapRate>).noi > 0} />
                      <ResultCard label="Effective Gross Income" value={formatCurrency((results as ReturnType<typeof calculateCapRate>).effectiveGrossIncome)} />
                      <ResultCard label="Gross Rent Multiplier" value={(results as ReturnType<typeof calculateCapRate>).grm.toFixed(2)} />
                    </div>
                  </div>
                </div>
              )}


              {/* Mortgage Calculator */}
              {activeCalc === 'mortgage' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-sky-600" />
                      Mortgage Inputs
                    </h3>
                    <div className="space-y-4">
                      <InputField label="Loan Amount" value={mortgageData.loanAmount} onChange={(val) => setMortgageData({...mortgageData, loanAmount: val})} />
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.125"
                          value={mortgageData.interestRate}
                          onChange={(e) => setMortgageData({...mortgageData, interestRate: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          placeholder="7"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Loan Term (Years)</label>
                        <select
                          value={mortgageData.loanTerm}
                          onChange={(e) => setMortgageData({...mortgageData, loanTerm: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                          <option value={15}>15 Years</option>
                          <option value={20}>20 Years</option>
                          <option value={30}>30 Years</option>
                        </select>
                      </div>
                      <InputField label="Annual Property Tax" value={mortgageData.propertyTax} onChange={(val) => setMortgageData({...mortgageData, propertyTax: val})} />
                      <InputField label="Annual Insurance" value={mortgageData.insurance} onChange={(val) => setMortgageData({...mortgageData, insurance: val})} />
                      <InputField label="Monthly PMI" value={mortgageData.pmi} onChange={(val) => setMortgageData({...mortgageData, pmi: val})} />
                      <InputField label="Monthly HOA" value={mortgageData.hoa} onChange={(val) => setMortgageData({...mortgageData, hoa: val})} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6 border border-sky-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-sky-800">
                      <BarChart3 className="w-5 h-5" />
                      Mortgage Analysis
                    </h3>
                    <div className="space-y-4">
                      <ResultCard label="Total Monthly Payment" value={formatCurrency((results as ReturnType<typeof calculateMortgage>).totalMonthlyPayment)} highlight />
                      <ResultCard label="Principal & Interest" value={formatCurrency((results as ReturnType<typeof calculateMortgage>).monthlyPI)} />
                      <ResultCard label="Total Interest Over Life" value={formatCurrency((results as ReturnType<typeof calculateMortgage>).totalInterest)} />
                      <ResultCard label="Total Cost of Loan" value={formatCurrency((results as ReturnType<typeof calculateMortgage>).totalCost)} />
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            )}

            {/* Saved Deals */}
            {activeCalc && savedDeals.length > 0 && (
              <div className="max-w-7xl mx-auto mt-8">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Saved Deals ({savedDeals.length})
                  </h3>
                  <div className="grid gap-3">
                    {savedDeals.slice(-5).reverse().map(deal => (
                      <div key={deal.id} className="bg-muted/50 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-emerald-600">{deal.type.toUpperCase()}</span>
                            <span className="text-muted-foreground ml-3">{deal.date}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Components
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
}

const InputField = ({ label, value, onChange, tooltip }: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-2">
      {label}
      {tooltip && (
        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-xs cursor-help" title={tooltip}>
          <Info className="w-3 h-3" />
        </span>
      )}
    </label>
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        placeholder="0"
      />
    </div>
  </div>
);

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  description?: string;
}

const ResultCard = ({ label, value, highlight, positive, description }: ResultCardProps) => (
  <div className={`p-4 rounded-lg border ${
    highlight 
      ? 'bg-emerald-100 border-emerald-300' 
      : 'bg-white border-border'
  }`}>
    <div className="flex justify-between items-start mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <div className={`text-2xl font-bold ${
      highlight 
        ? 'text-emerald-700' 
        : positive === true 
          ? 'text-green-600' 
          : positive === false 
            ? 'text-red-600' 
            : 'text-foreground'
    }`}>
      {value}
    </div>
    {description && (
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    )}
  </div>
);

interface ConfigSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const ConfigSlider = ({ label, value, min, max, step = 1, onChange }: ConfigSliderProps) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-2">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="text-sm font-medium w-12 text-right">{value}</span>
    </div>
  </div>
);

export default InvestorCalculator;
