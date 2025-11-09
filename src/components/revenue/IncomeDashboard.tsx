import { useState } from 'react';
import { 
  HelpCircle, Copy, Plus, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IncomeDashboard = () => {
  const { toast } = useToast();
  const [availableForCashout] = useState(0.00);
  const [availableSoon] = useState(0.00);
  const [storeUrl] = useState('revven.com/ai4bsummit');

  // Sample revenue data for chart (all zeros for empty state)
  const revenueData = [
    { date: 'Oct 10', amount: 0 },
    { date: 'Oct 13', amount: 0 },
    { date: 'Oct 16', amount: 0 },
    { date: 'Oct 19', amount: 0 },
    { date: 'Oct 22', amount: 0 },
    { date: 'Oct 25', amount: 0 },
    { date: 'Oct 28', amount: 0 },
    { date: 'Oct 31', amount: 0 },
    { date: 'Nov 03', amount: 0 },
    { date: 'Nov 06', amount: 0 },
  ];

  const filterOptions = [
    'Date & Time',
    'Email',
    'Product',
    'Amount',
    'Discount Code',
    'Payment Method',
    'Status'
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    toast({
      title: "Copied!",
      description: "Store URL copied to clipboard",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Income</h1>
        
        {/* Store URL with Copy */}
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-accent rounded-lg transition-colors"
        >
          <span className="font-medium">{storeUrl}</span>
          <Copy size={18} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Total Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-semibold text-card-foreground">Total Revenue</h2>
            <button className="text-muted-foreground hover:text-foreground">
              <HelpCircle size={18} />
            </button>
          </div>

          {/* Chart Area */}
          <div className="h-64 flex items-end justify-between gap-2 border-b border-border pb-4">
            {revenueData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                {/* Bar (empty state) */}
                <div className="w-full bg-muted rounded-t-lg h-1"></div>
                {/* Date Label */}
                <span className="text-xs text-muted-foreground mt-3 whitespace-nowrap">
                  {data.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cashout Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-6">
          
          {/* Available for Cashout */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Cash Available</p>
            <p className="text-4xl font-bold text-foreground">
              ${availableForCashout.toFixed(2)}
            </p>
          </div>

          {/* Available Soon */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Available Soon</p>
              <button className="text-brand-blue hover:opacity-80 text-sm font-medium">
                View Breakdown
              </button>
            </div>
            <p className="text-2xl font-semibold text-muted-foreground">
              ${availableSoon.toFixed(2)}
            </p>
          </div>

          {/* Cash Out Button */}
          <button 
            disabled
            className="w-full bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Plus size={20} />
            <span>Cash Out</span>
          </button>

          {/* Settings Link */}
          <button className="w-full flex items-center justify-center gap-2 text-brand-blue hover:opacity-80 font-medium py-2">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Latest Orders Section */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">Latest Transactions</h2>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {filterOptions.map((filter, idx) => (
            <button
              key={idx}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border text-muted-foreground rounded-full hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">{filter}</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          {/* Robot Icon */}
          <div className="mb-6 flex justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              {/* Robot head */}
              <rect x="35" y="40" width="50" height="45" rx="5" fill="hsl(var(--brand-blue))" opacity="0.9"/>
              
              {/* Antenna */}
              <line x1="60" y1="30" x2="60" y2="40" stroke="hsl(var(--brand-blue))" strokeWidth="3" opacity="0.9"/>
              <circle cx="60" cy="27" r="4" fill="hsl(var(--brand-blue))" opacity="0.9"/>
              
              {/* Eyes */}
              <circle cx="48" cy="55" r="5" fill="white"/>
              <circle cx="72" cy="55" r="5" fill="white"/>
              
              {/* Mouth/display */}
              <rect x="45" y="68" width="30" height="8" rx="2" fill="white" opacity="0.8"/>
              
              {/* Body */}
              <rect x="40" y="85" width="40" height="25" rx="4" fill="hsl(var(--brand-blue))" opacity="0.7"/>
              
              {/* Arms */}
              <rect x="25" y="90" width="12" height="6" rx="3" fill="hsl(var(--brand-blue))" opacity="0.6"/>
              <rect x="83" y="90" width="12" height="6" rx="3" fill="hsl(var(--brand-blue))" opacity="0.6"/>
            </svg>
          </div>

          {/* Text */}
          <h3 className="text-2xl font-bold text-foreground mb-3">
            No Transactions Yet
          </h3>
          <p className="text-muted-foreground">
            <a href="#" className="text-brand-blue hover:opacity-80 font-medium">
              Learn How To Increase Your Sales Here!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomeDashboard;
