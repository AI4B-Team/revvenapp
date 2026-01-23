import React, { useState } from 'react';
import { Copy, Check, DollarSign, FileText, TrendingUp, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface OfferSuggestions {
  cashOffer?: number;
  wholesaleMAO?: number;
  creativeTerms?: string;
  sellerFinancePitch?: string;
}

interface OfferGeneratorProps {
  offers: OfferSuggestions | null;
  isLoading?: boolean;
  onGenerate?: () => void;
}

export const OfferGenerator: React.FC<OfferGeneratorProps> = ({
  offers,
  isLoading = false,
  onGenerate
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard"
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (!offers && !isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-1">Generate Offers</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get AI-powered offer suggestions based on your analysis
          </p>
          <Button onClick={onGenerate} className="bg-emerald-600 hover:bg-emerald-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Offers
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-muted-foreground">Generating offer strategies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Offer Suggestions
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Offer */}
        {offers?.cashOffer && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Cash Offer</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(offers.cashOffer)}</p>
          </div>
        )}

        {/* Wholesale MAO */}
        {offers?.wholesaleMAO && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Wholesale MAO</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(offers.wholesaleMAO)}</p>
          </div>
        )}
      </div>

      {/* Creative Terms */}
      {offers?.creativeTerms && (
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Creative Terms</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(offers.creativeTerms!, 'creative')}
              className="h-7 px-2"
            >
              {copiedField === 'creative' ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm text-purple-800 whitespace-pre-wrap">{offers.creativeTerms}</p>
        </div>
      )}

      {/* Seller Finance Pitch */}
      {offers?.sellerFinancePitch && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Seller Finance Pitch</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(offers.sellerFinancePitch!, 'pitch')}
              className="h-7 px-2"
            >
              {copiedField === 'pitch' ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm text-amber-800 whitespace-pre-wrap italic">"{offers.sellerFinancePitch}"</p>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={onGenerate} className="w-full">
        <Sparkles className="w-4 h-4 mr-2" />
        Regenerate Offers
      </Button>
    </div>
  );
};

export default OfferGenerator;
