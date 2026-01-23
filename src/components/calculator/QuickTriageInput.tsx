import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface QuickTriageInputProps {
  onTriageComplete?: (result: string) => void;
}

export const QuickTriageInput: React.FC<QuickTriageInputProps> = ({ onTriageComplete }) => {
  const [address, setAddress] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [rehabEstimate, setRehabEstimate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<string | null>(null);

  const handleTriage = async () => {
    if (!askingPrice) {
      toast({
        title: "Missing Info",
        description: "Please enter at least the asking price",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTriageResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-deal', {
        body: {
          action: 'quick_triage',
          dealData: {
            calculatorType: 'triage',
            inputs: {
              askingPrice: parseFloat(askingPrice.replace(/[^0-9.-]/g, '')) || 0,
              rehabCosts: parseFloat(rehabEstimate.replace(/[^0-9.-]/g, '')) || 0,
            },
            results: {},
            address: address || undefined
          }
        }
      });

      if (error) throw error;

      const result = data?.content || "Unable to analyze. Please try with more details.";
      setTriageResult(result);
      onTriageComplete?.(result);
    } catch (error) {
      console.error('Triage error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete quick triage. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (num) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseInt(num));
    }
    return '';
  };

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-foreground">Quick Deal Triage</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
          AI-Powered
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Paste basic info and get instant feedback: "Should I even look at this?"
      </p>

      <div className="space-y-3">
        <Input
          placeholder="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-white"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Asking Price"
            value={askingPrice}
            onChange={(e) => setAskingPrice(formatCurrencyInput(e.target.value))}
            className="bg-white"
          />
          <Input
            placeholder="Est. Rehab"
            value={rehabEstimate}
            onChange={(e) => setRehabEstimate(formatCurrencyInput(e.target.value))}
            className="bg-white"
          />
        </div>

        <Button 
          onClick={handleTriage} 
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Should I Look at This?
            </>
          )}
        </Button>
      </div>

      {triageResult && (
        <div className="mt-4 p-4 rounded-lg bg-white border border-emerald-200">
          <p className="text-sm text-foreground leading-relaxed">{triageResult}</p>
        </div>
      )}
    </div>
  );
};

export default QuickTriageInput;
