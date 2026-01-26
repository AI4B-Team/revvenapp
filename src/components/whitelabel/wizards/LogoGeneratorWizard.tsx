import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check, Sparkles, Loader2, ArrowRight, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LogoGeneratorWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLogo: (logoUrl: string) => void;
  productName?: string;
}

type Step = 'colors' | 'style' | 'symbols' | 'generating' | 'results';

const colorOptions = [
  { id: 'blue', name: 'Blue', hex: '#4F7DF3', gradient: 'from-blue-400 to-blue-600', description: 'Depth, trust, loyalty, confidence, intelligence, and calmness' },
  { id: 'purple', name: 'Purple', hex: '#9B59B6', gradient: 'from-purple-400 to-purple-600', description: 'Royalty, power, nobility, luxury, wealth, extravagance, and wisdom' },
  { id: 'pink', name: 'Pink', hex: '#E91E8C', gradient: 'from-pink-300 to-pink-400', description: 'Romance, love, femininity, gentleness, and warmth' },
  { id: 'red', name: 'Red', hex: '#C0392B', gradient: 'from-red-500 to-red-700', description: 'Power, energy, passion, desire, speed, strength, love, and intensity' },
  { id: 'orange', name: 'Orange', hex: '#E67E22', gradient: 'from-orange-400 to-orange-500', description: 'Creativity, enthusiasm, warmth, and excitement' },
  { id: 'yellow', name: 'Yellow', hex: '#F1C40F', gradient: 'from-yellow-300 to-yellow-500', description: 'Sunshine, joy, happiness, intellect, cheerfulness, and energy' },
  { id: 'green', name: 'Green', hex: '#27AE60', gradient: 'from-green-300 to-green-500', description: 'Growth, nature, health, harmony, and freshness' },
  { id: 'teal', name: 'Teal', hex: '#1ABC9C', gradient: 'from-teal-300 to-teal-500', description: 'Clarity, balance, calmness, and sophistication' },
  { id: 'cyan', name: 'Cyan', hex: '#00BCD4', gradient: 'from-cyan-300 to-cyan-500', description: 'Innovation, technology, freshness, and modernity' },
  { id: 'white', name: 'White', hex: '#FFFFFF', gradient: 'from-gray-100 to-white', description: 'Purity, simplicity, cleanliness, minimalism, and elegance' },
  { id: 'black', name: 'Black', hex: '#1a1a2e', gradient: 'from-gray-800 to-gray-900', description: 'Sophistication, luxury, power, elegance, and authority' },
  { id: 'grayscale', name: 'Greyscale', hex: '#7F8C8D', gradient: 'from-gray-400 to-gray-600', description: 'Power, elegance, reliability, intelligence, modesty, and maturity' },
];

const logoStyles = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, simple geometric shapes', icon: '◯' },
  { id: 'modern', name: 'Modern', description: 'Contemporary with sharp lines', icon: '◇' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated and refined', icon: '✧' },
  { id: 'bold', name: 'Bold', description: 'Strong, impactful designs', icon: '■' },
  { id: 'playful', name: 'Playful', description: 'Fun and approachable', icon: '★' },
  { id: 'tech', name: 'Tech', description: 'Digital and futuristic', icon: '⬡' },
];

const symbolTypes = [
  { id: 'abstract', name: 'Abstract Shapes', description: 'Geometric and non-representational' },
  { id: 'arrows', name: 'Arrows & Direction', description: 'Growth, movement, progress' },
  { id: 'circles', name: 'Circles & Rings', description: 'Unity, wholeness, infinity' },
  { id: 'squares', name: 'Squares & Diamonds', description: 'Stability, balance, structure' },
  { id: 'lines', name: 'Lines & Waves', description: 'Flow, connection, movement' },
  { id: 'stars', name: 'Stars & Sparks', description: 'Excellence, aspiration, energy' },
];

export function LogoGeneratorWizard({ isOpen, onClose, onSelectLogo, productName }: LogoGeneratorWizardProps) {
  const [step, setStep] = useState<Step>('colors');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('minimal');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [slogan, setSlogan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
    );
  };

  const toggleSymbol = (symbolId: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbolId) 
        ? prev.filter(s => s !== symbolId)
        : [...prev, symbolId]
    );
  };

  const handleGenerate = async () => {
    setStep('generating');
    setIsGenerating(true);
    setGeneratedLogos([]);

    try {
      const selectedColorNames = selectedColors.length > 0 
        ? selectedColors.map(c => colorOptions.find(co => co.id === c)?.name).join(', ')
        : 'teal, cyan, or emerald';
      
      const selectedStyleInfo = logoStyles.find(s => s.id === selectedStyle);
      const selectedSymbolNames = selectedSymbols.length > 0
        ? selectedSymbols.map(s => symbolTypes.find(st => st.id === s)?.name).join(', ')
        : 'abstract geometric shapes';

      const styleVariations = [
        `single centered ${selectedSymbolNames.split(',')[0]?.trim() || 'arrow'} icon`,
        `simple ${selectedStyleInfo?.name || 'minimal'} shape`,
        `clean ${selectedSymbols[1] ? symbolTypes.find(s => s.id === selectedSymbols[1])?.name : 'geometric'} symbol`
      ];

      const promises = styleVariations.map(async (variation) => {
        const prompt = `Ultra-minimal app logo: ONE simple ${variation} on solid dark navy background (#1a1a2e). 
          Style: ${selectedStyleInfo?.name || 'Minimal'} - ${selectedStyleInfo?.description || 'clean and simple'}.
          Colors: Use ${selectedColorNames} as the icon color.
          RULES: 
          - Only 1-2 basic geometric shapes
          - Single flat color, no gradients
          - NO text, NO letters, NO words
          - NO shadows, NO details, NO 3D effects
          - Must be recognizable at 32x32px
          - Centered, square format
          - Flat vector style only`;

        try {
          const result = await supabase.functions.invoke('editor-generate-image', {
            body: { prompt }
          });
          if (!result.error && result.data?.imageUrl) {
            return result.data.imageUrl;
          }
        } catch (e) {
          console.error('Logo generation failed:', e);
        }
        return null;
      });

      const results = await Promise.all(promises);
      const logos = results.filter((url): url is string => url !== null);

      if (logos.length === 0) {
        throw new Error('No logos generated');
      }

      setGeneratedLogos(logos);
      setStep('results');
      toast.success(`Generated ${logos.length} logo options!`);
    } catch (error) {
      console.error('Logo generation error:', error);
      toast.error('Failed to generate logos. Please try again.');
      setStep('symbols');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectLogo = (url: string) => {
    onSelectLogo(url);
    onClose();
    toast.success('Logo selected!');
  };

  const resetWizard = () => {
    setStep('colors');
    setSelectedColors([]);
    setSelectedStyle('minimal');
    setSelectedSymbols([]);
    setSlogan('');
    setGeneratedLogos([]);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const canProceedFromColors = selectedColors.length > 0;
  const canProceedFromSymbols = selectedSymbols.length > 0 || true; // Allow skip

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative w-full max-w-3xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background z-10 p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                {step === 'colors' && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">Pick some colors you like</h2>
                    <p className="text-muted-foreground mt-1">Colors help convey emotion in your logo</p>
                  </>
                )}
                {step === 'style' && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">Choose a logo style</h2>
                    <p className="text-muted-foreground mt-1">This defines the overall aesthetic</p>
                  </>
                )}
                {step === 'symbols' && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">Select symbol types</h2>
                    <p className="text-muted-foreground mt-1">What kind of shapes represent your brand?</p>
                  </>
                )}
                {step === 'generating' && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">Creating your logos...</h2>
                    <p className="text-muted-foreground mt-1">This may take a moment</p>
                  </>
                )}
                {step === 'results' && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">Pick your favorite logo</h2>
                    <p className="text-muted-foreground mt-1">Click a design to use it</p>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {(step === 'colors' || step === 'style' || step === 'symbols') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (step === 'colors') setStep('style');
                      else if (step === 'style') setStep('symbols');
                      else handleGenerate();
                    }}
                    className="text-muted-foreground"
                  >
                    Skip
                    <SkipForward className="h-4 w-4 ml-1" />
                  </Button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'colors' && (
              <div className="grid grid-cols-3 gap-4">
                {colorOptions.map((color) => {
                  const isWhite = color.id === 'white';
                  return (
                    <button
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`group relative rounded-xl overflow-hidden transition-all ${
                        selectedColors.includes(color.id)
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'hover:scale-105'
                      } ${isWhite ? 'border-2 border-border' : ''}`}
                    >
                      <div 
                        className={`h-28 bg-gradient-to-br ${color.gradient} flex items-end p-3`}
                      >
                        <div className="text-left">
                          <p className={`font-semibold ${isWhite ? 'text-gray-800' : 'text-white'}`}>{color.name}</p>
                          <p className={`text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity ${isWhite ? 'text-gray-600' : 'text-white/80'}`}>
                            {color.description}
                          </p>
                        </div>
                      </div>
                      {selectedColors.includes(color.id) && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${isWhite ? 'bg-gray-800' : 'bg-white'}`}>
                          <Check className={`h-4 w-4 ${isWhite ? 'text-white' : 'text-primary'}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 'style' && (
              <div className="grid grid-cols-3 gap-4">
                {logoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-6 rounded-xl border-2 text-center transition-all ${
                      selectedStyle === style.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{style.icon}</div>
                    <p className="font-semibold text-foreground">{style.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 'symbols' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {symbolTypes.map((symbol) => (
                    <button
                      key={symbol.id}
                      onClick={() => toggleSymbol(symbol.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedSymbols.includes(symbol.id)
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedSymbols.includes(symbol.id) ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground'
                        }`}>
                          {selectedSymbols.includes(symbol.id) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="font-medium text-foreground">{symbol.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-7">{symbol.description}</p>
                    </button>
                  ))}
                </div>

                {productName && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Label htmlFor="slogan">Add a slogan (optional)</Label>
                    <Input
                      id="slogan"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="e.g., Innovate. Create. Scale."
                    />
                  </div>
                )}
              </div>
            )}

            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
                  <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <p className="text-lg text-muted-foreground mt-6">Creating unique logos for you...</p>
                <p className="text-sm text-muted-foreground mt-2">This usually takes 10-20 seconds</p>
              </div>
            )}

            {step === 'results' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {generatedLogos.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLogo(url)}
                      className="aspect-square rounded-xl border-2 border-border hover:border-emerald-500 overflow-hidden transition-all hover:scale-105 bg-[#1a1a2e]"
                    >
                      <img src={url} alt={`Logo option ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setStep('colors');
                      setGeneratedLogos([]);
                    }}
                    variant="outline"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate More
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {(step === 'colors' || step === 'style' || step === 'symbols') && (
            <div className="sticky bottom-0 bg-background border-t border-border p-6">
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    if (step === 'colors') setStep('style');
                    else if (step === 'style') setStep('symbols');
                    else handleGenerate();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                >
                  {step === 'symbols' ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Logos
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
