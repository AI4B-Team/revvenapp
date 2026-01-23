import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RiskFlag {
  type: 'warning' | 'danger' | 'info';
  message: string;
  field?: string;
}

interface AnalysisResult {
  dealScore: number;
  verdict: string;
  riskFlags: RiskFlag[];
  aiAnalysis: string;
  recommendations: string[];
}

interface OfferSuggestions {
  cashOffer?: number;
  wholesaleMAO?: number;
  creativeTerms?: string;
  sellerFinancePitch?: string;
}

interface DealData {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  address?: string;
  strategy?: string;
}

export const useDealAnalysis = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [offers, setOffers] = useState<OfferSuggestions | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingOffers, setIsGeneratingOffers] = useState(false);

  const analyzeDeal = useCallback(async (dealData: DealData) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-deal', {
        body: {
          action: 'analyze',
          dealData
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive"
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits are exhausted. Please add credits to continue.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return null;
      }

      setAnalysis(data as AnalysisResult);
      return data as AnalysisResult;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the deal. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateOffers = useCallback(async (dealData: DealData) => {
    setIsGeneratingOffers(true);
    setOffers(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-deal', {
        body: {
          action: 'generate_offers',
          dealData
        }
      });

      if (error) throw error;

      // Parse the AI response to extract offer suggestions
      const content = data?.content || '';
      
      // Try to extract numbers from the response
      const cashMatch = content.match(/cash offer[:\s]*\$?([\d,]+)/i);
      const wholesaleMatch = content.match(/wholesale[:\s]*\$?([\d,]+)/i);
      
      const extractedOffers: OfferSuggestions = {
        cashOffer: cashMatch ? parseInt(cashMatch[1].replace(/,/g, '')) : undefined,
        wholesaleMAO: wholesaleMatch ? parseInt(wholesaleMatch[1].replace(/,/g, '')) : undefined,
        creativeTerms: content.includes('Creative') || content.includes('seller financing') 
          ? content.split('\n').find(line => line.toLowerCase().includes('creative') || line.toLowerCase().includes('seller')) 
          : undefined,
        sellerFinancePitch: content.match(/"([^"]+)"/)?.[1] || undefined
      };

      setOffers(extractedOffers);
      return extractedOffers;
    } catch (error) {
      console.error('Offer generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate offers. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingOffers(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setOffers(null);
  }, []);

  return {
    analysis,
    offers,
    isAnalyzing,
    isGeneratingOffers,
    analyzeDeal,
    generateOffers,
    clearAnalysis
  };
};

export default useDealAnalysis;
