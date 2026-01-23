import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Share2, Save, Copy, Check, History, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DealScoreMeter from './DealScoreMeter';
import ScenarioSwitcher from './ScenarioSwitcher';
import SensitivitySliders from './SensitivitySliders';
import BuyBoxMatcher from './BuyBoxMatcher';
import OfferGenerator from './OfferGenerator';
import QuickTriageInput from './QuickTriageInput';
import { useDealAnalysis } from '@/hooks/useDealAnalysis';

interface RiskFlag {
  type: 'warning' | 'danger' | 'info';
  message: string;
  field?: string;
}

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

interface DealPanelProps {
  activeCalc: string;
  currentInputs: Record<string, unknown>;
  currentResults: Record<string, unknown>;
  address?: string;
  onSaveDeal?: (dealId: string) => void;
  onShareDeal?: (shareUrl: string) => void;
}

export const DealAnalysisPanel: React.FC<DealPanelProps> = ({
  activeCalc,
  currentInputs,
  currentResults,
  address,
  onSaveDeal,
  onShareDeal
}) => {
  const [activeStrategy, setActiveStrategy] = useState(activeCalc);
  const [buyBox, setBuyBox] = useState<BuyBox | null>(null);
  const [showBuyBoxDialog, setShowBuyBoxDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  const { 
    analysis, 
    offers, 
    isAnalyzing, 
    isGeneratingOffers,
    analyzeDeal,
    generateOffers,
    clearAnalysis
  } = useDealAnalysis();

  // Load buy box from database
  useEffect(() => {
    const loadBuyBox = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('investor_buy_boxes')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single();
          
          if (data) {
            setBuyBox({
              id: data.id,
              name: data.name,
              minPrice: data.min_price,
              maxPrice: data.max_price,
              minProfit: data.min_profit,
              minCashFlow: data.min_cash_flow,
              preferredStrategies: data.preferred_strategies,
              maxRehab: data.max_rehab,
              minArv: data.min_arv
            });
          }
        }
      } catch (error) {
        console.error('Error loading buy box:', error);
      }
    };
    loadBuyBox();
  }, []);

  // Sensitivity slider fields based on calculator type
  const getSensitivityFields = () => {
    const arv = parseFloat(String(currentInputs.arv || 0));
    const rehab = parseFloat(String(currentInputs.rehabCosts || currentInputs.rehab || 0));

    return [
      { key: 'arv', label: 'After Repair Value', value: arv, min: arv * 0.7, max: arv * 1.3 || 500000, step: 5000, format: 'currency' as const },
      { key: 'rehab', label: 'Rehab Costs', value: rehab, min: rehab * 0.5, max: rehab * 2 || 100000, step: 1000, format: 'currency' as const },
    ];
  };

  const handleAnalyze = async () => {
    await analyzeDeal({
      calculatorType: activeCalc,
      inputs: currentInputs,
      results: currentResults,
      address,
      strategy: activeStrategy
    });
  };

  const handleGenerateOffers = async () => {
    await generateOffers({
      calculatorType: activeCalc,
      inputs: currentInputs,
      results: currentResults,
      address,
      strategy: activeStrategy
    });
  };

  const handleSaveDeal = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in Required",
          description: "Please sign in to save deals.",
          variant: "destructive"
        });
        return;
      }

      const shareToken = crypto.randomUUID().slice(0, 8);
      
      const { data, error } = await supabase
        .from('investor_deals')
        .insert([{
          user_id: user.id,
          address: address || null,
          calculator_type: activeCalc,
          strategy: activeStrategy,
          inputs: JSON.parse(JSON.stringify(currentInputs)),
          results: JSON.parse(JSON.stringify(currentResults)),
          deal_score: analysis?.dealScore || null,
          deal_verdict: analysis?.verdict || null,
          risk_flags: analysis?.riskFlags ? JSON.parse(JSON.stringify(analysis.riskFlags)) : [],
          ai_analysis: analysis?.aiAnalysis || null,
          share_token: shareToken
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Deal Saved!",
        description: "Your deal has been saved to your account."
      });

      onSaveDeal?.(data.id);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Could not save the deal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareDeal = async () => {
    const shareUrl = `${window.location.origin}/deal/share/${crypto.randomUUID().slice(0, 8)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      toast({
        title: "Link Copied!",
        description: "Share this read-only link with partners or buyers."
      });
      setTimeout(() => setCopiedShare(false), 2000);
      onShareDeal?.(shareUrl);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy share link.",
        variant: "destructive"
      });
    }
  };

  const dealMetrics = {
    purchasePrice: parseFloat(String(currentInputs.purchasePrice || currentInputs.contractPrice || 0)),
    profit: parseFloat(String(currentResults.profit || currentResults.netProfit || 0)),
    cashFlow: parseFloat(String(currentResults.monthlyCashFlow || 0)),
    strategy: activeStrategy,
    rehabCost: parseFloat(String(currentInputs.rehabCosts || currentInputs.rehab || 0)),
    arv: parseFloat(String(currentInputs.arv || 0))
  };

  return (
    <div className="space-y-6">
      {/* Quick Triage */}
      <QuickTriageInput />

      {/* Strategy Switcher */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Scenario Switcher
        </h4>
        <ScenarioSwitcher
          activeStrategy={activeStrategy}
          onStrategyChange={(strategy) => {
            setActiveStrategy(strategy);
            clearAnalysis();
          }}
        />
      </div>

      {/* AI Analysis Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Deal with AI
            </>
          )}
        </Button>
      </div>

      {/* Deal Score Meter */}
      <DealScoreMeter
        score={analysis?.dealScore || null}
        verdict={analysis?.verdict || null}
        riskFlags={analysis?.riskFlags || []}
        isLoading={isAnalyzing}
      />

      {/* AI Analysis Text */}
      {analysis?.aiAnalysis && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            AI Analysis
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{analysis.aiAnalysis}</p>
          
          {analysis.recommendations?.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recommendations
              </h5>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Sensitivity Sliders */}
      <div className="rounded-xl border border-border bg-card p-4">
        <SensitivitySliders
          fields={getSensitivityFields()}
          onChange={(key, value) => {
            // This would update the main form - implement callback
            console.log('Sensitivity change:', key, value);
          }}
        />
      </div>

      {/* Buy Box Matcher */}
      <BuyBoxMatcher
        buyBox={buyBox}
        dealMetrics={dealMetrics}
        onEditBuyBox={() => setShowBuyBoxDialog(true)}
      />

      {/* Offer Generator */}
      <OfferGenerator
        offers={offers}
        isLoading={isGeneratingOffers}
        onGenerate={handleGenerateOffers}
      />

      {/* Save & Share Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveDeal}
          disabled={isSaving}
          variant="outline"
          className="flex-1"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Deal
        </Button>
        <Button
          onClick={handleShareDeal}
          variant="outline"
          className="flex-1"
        >
          {copiedShare ? (
            <Check className="w-4 h-4 mr-2 text-emerald-500" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          Share Link
        </Button>
      </div>

      {/* Buy Box Dialog */}
      <Dialog open={showBuyBoxDialog} onOpenChange={setShowBuyBoxDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Configure Buy Box
            </DialogTitle>
            <DialogDescription>
              Define your investment criteria to see how deals match your strategy.
            </DialogDescription>
          </DialogHeader>
          <BuyBoxForm 
            initialValues={buyBox}
            onSave={(values) => {
              setBuyBox(values);
              setShowBuyBoxDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Buy Box Form Component
interface BuyBoxFormProps {
  initialValues: BuyBox | null;
  onSave: (values: BuyBox) => void;
}

const BuyBoxForm: React.FC<BuyBoxFormProps> = ({ initialValues, onSave }) => {
  const [name, setName] = useState(initialValues?.name || 'My Buy Box');
  const [minPrice, setMinPrice] = useState(String(initialValues?.minPrice || ''));
  const [maxPrice, setMaxPrice] = useState(String(initialValues?.maxPrice || ''));
  const [minProfit, setMinProfit] = useState(String(initialValues?.minProfit || ''));
  const [minCashFlow, setMinCashFlow] = useState(String(initialValues?.minCashFlow || ''));
  const [maxRehab, setMaxRehab] = useState(String(initialValues?.maxRehab || ''));
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in Required",
          description: "Please sign in to save your buy box.",
          variant: "destructive"
        });
        return;
      }

      const buyBoxData = {
        user_id: user.id,
        name,
        min_price: minPrice ? parseFloat(minPrice) : null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        min_profit: minProfit ? parseFloat(minProfit) : null,
        min_cash_flow: minCashFlow ? parseFloat(minCashFlow) : null,
        max_rehab: maxRehab ? parseFloat(maxRehab) : null,
        is_default: true
      };

      let result;
      if (initialValues?.id) {
        result = await supabase
          .from('investor_buy_boxes')
          .update(buyBoxData)
          .eq('id', initialValues.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('investor_buy_boxes')
          .insert(buyBoxData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Buy Box Saved!",
        description: "Your investment criteria have been updated."
      });

      onSave({
        id: result.data.id,
        name,
        minPrice: result.data.min_price,
        maxPrice: result.data.max_price,
        minProfit: result.data.min_profit,
        minCashFlow: result.data.min_cash_flow,
        maxRehab: result.data.max_rehab
      });
    } catch (error) {
      console.error('Buy box save error:', error);
      toast({
        title: "Save Failed",
        description: "Could not save buy box. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Buy Box Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="My Buy Box"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Min Price</label>
          <Input 
            type="number" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)} 
            placeholder="50000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Price</label>
          <Input 
            type="number" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)} 
            placeholder="300000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Min Profit</label>
          <Input 
            type="number" 
            value={minProfit} 
            onChange={(e) => setMinProfit(e.target.value)} 
            placeholder="25000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Min Monthly Cash Flow</label>
          <Input 
            type="number" 
            value={minCashFlow} 
            onChange={(e) => setMinCashFlow(e.target.value)} 
            placeholder="200"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Max Rehab Budget</label>
        <Input 
          type="number" 
          value={maxRehab} 
          onChange={(e) => setMaxRehab(e.target.value)} 
          placeholder="75000"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Save Buy Box
      </Button>
    </form>
  );
};

export default DealAnalysisPanel;
