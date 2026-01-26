import React, { useState, useRef, useEffect } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Palette, 
  Image as ImageIcon,
  Check,
  Sparkles,
  Loader2,
  X,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogoGeneratorWizard } from '../wizards/LogoGeneratorWizard';

interface BrandingSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['brandSettings']>, showToast?: boolean) => void;
}

const predefinedIcons = ['🚀', '⚡', '💎', '🎯', '✨', '🔥', '💡', '🌟'];

const colorPresets = [
  { name: 'White', hue: 0, saturation: 0, lightness: 100 },
  { name: 'Purple', hue: 270 },
  { name: 'Blue', hue: 220 },
  { name: 'Green', hue: 150 },
  { name: 'Orange', hue: 30 },
  { name: 'Pink', hue: 330 },
  { name: 'Teal', hue: 180 },
  { name: 'Red', hue: 0 },
  { name: 'Gray', hue: 0, saturation: 0 },
];

// Parse hex to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Convert HSL to Hex
const hslToHex = (h: number, s: number = 70, l: number = 50) => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Initialize hue/saturation from existing color
const getInitialHueSaturation = (color?: string) => {
  if (color) {
    const hsl = hexToHsl(color);
    if (hsl) return { hue: hsl.h, saturation: hsl.s };
  }
  return { hue: 270, saturation: 70 };
};

export function BrandingSection({ license, onUpdate }: BrandingSectionProps) {
  const initialColor = getInitialHueSaturation(license?.brandSettings?.primaryColor);
  
  const [logoUrl, setLogoUrl] = useState(license?.brandSettings?.logo || '');
  const [faviconUrl, setFaviconUrl] = useState(license?.brandSettings?.favicon || '');
  const [primaryHue, setPrimaryHue] = useState(initialColor.hue);
  const [primarySaturation, setPrimarySaturation] = useState(initialColor.saturation);
  const [primaryLightness, setPrimaryLightness] = useState(50);
  const [useCustomLogo, setUseCustomLogo] = useState(!!license?.brandSettings?.logo);
  const [selectedIcon, setSelectedIcon] = useState(license?.brandSettings?.icon || '🚀');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingFavicon, setIsGeneratingFavicon] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  
  // Generated options
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [generatedFavicons, setGeneratedFavicons] = useState<string[]>([]);
  const [isLogoWizardOpen, setIsLogoWizardOpen] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const primaryColor = hslToHex(primaryHue, primarySaturation, primaryLightness);

  // Auto-update preview when color changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onUpdate({ primaryColor }, false);
  }, [primaryColor]);

  // Auto-update preview when logo changes
  useEffect(() => {
    if (!isInitialMount.current) {
      onUpdate({ logo: useCustomLogo ? logoUrl : undefined }, false);
    }
  }, [logoUrl, useCustomLogo]);

  // Auto-update preview when icon changes
  useEffect(() => {
    if (!isInitialMount.current && !useCustomLogo) {
      onUpdate({ icon: selectedIcon }, false);
    }
  }, [selectedIcon, useCustomLogo]);

  // Auto-update preview when favicon changes
  useEffect(() => {
    if (!isInitialMount.current) {
      onUpdate({ favicon: faviconUrl || undefined }, false);
    }
  }, [faviconUrl]);

  const handlePresetClick = (preset: { name: string; hue: number; saturation?: number; lightness?: number }) => {
    setPrimaryHue(preset.hue);
    setPrimarySaturation(preset.saturation !== undefined ? preset.saturation : 70);
    setPrimaryLightness(preset.lightness !== undefined ? preset.lightness : 50);
  };

  const handleHexInput = (hex: string) => {
    const hsl = hexToHsl(hex);
    if (hsl) {
      setPrimaryHue(hsl.h);
      setPrimarySaturation(hsl.s);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setUseCustomLogo(true);
        toast.success('Logo uploaded successfully');
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload logo');
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Favicon must be less than 2MB');
      return;
    }

    setIsUploadingFavicon(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconUrl(reader.result as string);
        toast.success('Favicon uploaded successfully');
        setIsUploadingFavicon(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setIsUploadingFavicon(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload favicon');
      setIsUploadingFavicon(false);
    }
  };

  const generateSingleLogo = async (style: string, productContext: string, appName: string, retries = 2): Promise<string | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await supabase.functions.invoke('editor-generate-image', {
          body: {
            prompt: `Ultra-minimal app icon: ONE simple ${style} on solid #1a1a2e background. RULES: Only 1-2 basic geometric shapes (circle, square, triangle, line). Single bright color (white, cyan #00d4ff, or green #10b981). NO gradients, NO shadows, NO details, NO text, NO 3D. Flat vector style. Must look perfect at 32x32px. Centered. Square format.`
          }
        });
        if (!result.error && result.data?.imageUrl) {
          return result.data.imageUrl;
        }
      } catch (e) {
        console.error(`Logo generation attempt ${attempt + 1} failed:`, e);
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return null;
  };

  const handleGenerateLogos = async () => {
    const appName = license?.brandSettings?.appName || 'My App';
    const tagline = license?.brandSettings?.tagline || '';
    const description = license?.brandSettings?.description || '';
    const productContext = tagline ? `Represents: ${tagline}.` : (description ? `Represents: ${description}.` : 'Represents innovation and growth.');
    
    setIsGeneratingLogo(true);
    setGeneratedLogos([]);
    
    try {
      const styleVariations = [
        'single upward arrow shape',
        'simple circle or ring',
        'basic diamond or square rotated 45 degrees'
      ];
      
      // Generate 3 logos in parallel with retry logic
      const promises = styleVariations.map(style => 
        generateSingleLogo(style, productContext, appName)
      );

      const results = await Promise.all(promises);
      const logos = results.filter((url): url is string => url !== null);

      if (logos.length === 0) {
        throw new Error('No logos generated');
      }

      setGeneratedLogos(logos);
      toast.success(`Generated ${logos.length} logo options!`);
    } catch (error) {
      console.error('Logo generation error:', error);
      toast.error('Failed to generate logos. Please try again.');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const generateSingleFavicon = async (style: string, retries = 2): Promise<string | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await supabase.functions.invoke('editor-generate-image', {
          body: {
            prompt: `Minimal favicon: ${style} on solid #1a1a2e. ONLY one geometric shape. Single color (white or cyan). NO details, NO gradients. Flat vector. 16x16px optimized. Square, centered.`
          }
        });
        if (!result.error && result.data?.imageUrl) {
          return result.data.imageUrl;
        }
      } catch (e) {
        console.error(`Favicon generation attempt ${attempt + 1} failed:`, e);
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return null;
  };

  const handleGenerateFavicons = async () => {    
    setIsGeneratingFavicon(true);
    setGeneratedFavicons([]);
    
    try {
      const faviconStyles = [
        'Simple upward arrow or chevron',
        'Small diamond or hexagon shape',
        'Tiny star or spark symbol'
      ];
      
      // Generate 3 favicons in parallel with retry logic
      const promises = faviconStyles.map(style => generateSingleFavicon(style));

      const results = await Promise.all(promises);
      const favicons = results.filter((url): url is string => url !== null);

      if (favicons.length === 0) {
        throw new Error('No favicons generated');
      }

      setGeneratedFavicons(favicons);
      toast.success(`Generated ${favicons.length} favicon options!`);
    } catch (error) {
      console.error('Favicon generation error:', error);
      toast.error('Failed to generate favicons. Please try again.');
    } finally {
      setIsGeneratingFavicon(false);
    }
  };

  const selectGeneratedLogo = (url: string) => {
    setLogoUrl(url);
    setUseCustomLogo(true);
    setGeneratedLogos([]);
    toast.success('Logo selected!');
  };

  const selectGeneratedFavicon = (url: string) => {
    setFaviconUrl(url);
    setGeneratedFavicons([]);
    toast.success('Favicon selected!');
  };

  const clearLogo = () => {
    setLogoUrl('');
    setGeneratedLogos([]);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const clearFavicon = () => {
    setFaviconUrl('');
    setGeneratedFavicons([]);
    if (faviconInputRef.current) faviconInputRef.current.value = '';
  };

  const handleSave = () => {
    onUpdate({
      logo: useCustomLogo ? logoUrl : undefined,
      favicon: faviconUrl || undefined,
      primaryColor: primaryColor
    }, true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Branding</h2>
        <p className="text-muted-foreground mt-1">
          Customize your brand identity with logos, colors, and themes
        </p>
      </div>


      {/* Logo & Icon */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Logo & Icon</h3>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setUseCustomLogo(false)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              !useCustomLogo 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <p className="font-medium text-foreground">Use Predefined Icons</p>
            <p className="text-sm text-muted-foreground mt-1">Choose from our icon library</p>
          </button>
          <button
            onClick={() => setUseCustomLogo(true)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              useCustomLogo 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <p className="font-medium text-foreground">Use Your Own Logo</p>
            <p className="text-sm text-muted-foreground mt-1">Upload custom artwork</p>
          </button>
        </div>

        {!useCustomLogo ? (
          <div className="space-y-3">
            <Label>Select Icon</Label>
            <div className="flex flex-wrap gap-3">
              {predefinedIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                    selectedIcon === icon
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Wizard Button */}
            <Button
              onClick={() => setIsLogoWizardOpen(true)}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-medium rounded-xl"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              Create Logo with AI Wizard
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <span className="relative bg-card px-4 text-sm text-muted-foreground uppercase tracking-wider">
                Or Quick Generate
              </span>
            </div>

            {/* Logo Upload */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Logo</Label>
                <div className="relative">
                  <div 
                    onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                    className={`h-32 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors ${isUploadingLogo ? 'opacity-50' : ''}`}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click To Upload Logo</p>
                      </>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  {logoUrl && (
                    <button
                      onClick={clearLogo}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Transparent PNGs with a square layout look best.
                </p>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-3">
                <Label>Favicon</Label>
                <div className="relative">
                  <div 
                    onClick={() => !isUploadingFavicon && faviconInputRef.current?.click()}
                    className={`h-32 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors ${isUploadingFavicon ? 'opacity-50' : ''}`}
                  >
                    {isUploadingFavicon ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click To Upload Favicon</p>
                      </>
                    )}
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </div>
                  {faviconUrl && (
                    <button
                      onClick={clearFavicon}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  We optimize the favicon automatically.
                </p>
              </div>
            </div>

            {/* AI Generation Section */}
            <div className="pt-4 border-t border-border space-y-4">
              {/* Logo Wizard Button - Primary Action */}
              <Button
                onClick={() => setIsLogoWizardOpen(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Create Logo with AI Wizard
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or quick generate</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Generate Logo Button */}
                <Button
                  onClick={handleGenerateLogos}
                  disabled={isGeneratingLogo}
                  variant="outline"
                  className="border-dashed border-2 h-12"
                >
                  {isGeneratingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Quick Logos
                    </>
                  )}
                </Button>

                {/* Generate Favicon Button */}
                <Button
                  onClick={handleGenerateFavicons}
                  disabled={isGeneratingFavicon}
                  variant="outline"
                  className="border-dashed border-2 h-12"
                >
                  {isGeneratingFavicon ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Quick Favicons
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Quick generate creates 3 random options. Use the wizard for more control.
              </p>

              {/* Generated Logo Options */}
              {generatedLogos.length > 0 && (
                <div className="space-y-2">
                  <Label>Select A Logo</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {generatedLogos.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => selectGeneratedLogo(url)}
                        className="aspect-square rounded-xl border-2 border-border hover:border-emerald-500 overflow-hidden transition-all hover:scale-105"
                      >
                        <img src={url} alt={`Logo option ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Favicon Options */}
              {generatedFavicons.length > 0 && (
                <div className="space-y-2">
                  <Label>Select A Favicon</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {generatedFavicons.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => selectGeneratedFavicon(url)}
                        className="aspect-square rounded-xl border-2 border-border hover:border-emerald-500 overflow-hidden transition-all hover:scale-105"
                      >
                        <img src={url} alt={`Favicon option ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logo Generator Wizard Modal */}
            <LogoGeneratorWizard
              isOpen={isLogoWizardOpen}
              onClose={() => setIsLogoWizardOpen(false)}
              onSelectLogo={(url) => {
                setLogoUrl(url);
                setUseCustomLogo(true);
                setGeneratedLogos([]);
              }}
              productName={license?.brandSettings?.appName}
            />
          </div>
        )}
      </div>

      {/* Colors & Theme */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Colors & Theme</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pick an accent color and fine-tune it to match your brand personality.
        </p>

        {/* Color Presets */}
        <div className="space-y-3">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  primaryHue === preset.hue && primarySaturation === (preset.saturation !== undefined ? preset.saturation : 70)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: hslToHex(
                      preset.hue, 
                      preset.saturation !== undefined ? preset.saturation : 70,
                      preset.lightness !== undefined ? preset.lightness : 50
                    ) 
                  }}
                />
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hue Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Primary Accent Color</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-md border border-border"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-sm font-mono text-muted-foreground">{primaryColor}</span>
            </div>
          </div>
          
          <div 
            className="h-4 rounded-full"
            style={{
              background: `linear-gradient(to right, 
                hsl(0, ${primarySaturation}%, 50%), 
                hsl(60, ${primarySaturation}%, 50%), 
                hsl(120, ${primarySaturation}%, 50%), 
                hsl(180, ${primarySaturation}%, 50%), 
                hsl(240, ${primarySaturation}%, 50%), 
                hsl(300, ${primarySaturation}%, 50%), 
                hsl(360, ${primarySaturation}%, 50%)
              )`
            }}
          />
          <Slider
            value={[primaryHue]}
            onValueChange={([value]) => setPrimaryHue(value)}
            min={0}
            max={360}
            step={1}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground">
            Slide between 0° and 360° to pick the hue — we'll map it to an accessible palette automatically.
          </p>
        </div>

        {/* Saturation Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Saturation</Label>
            <span className="text-sm font-mono text-muted-foreground">{primarySaturation}%</span>
          </div>
          <Slider
            value={[primarySaturation]}
            onValueChange={([value]) => setPrimarySaturation(value)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label htmlFor="customColor">Custom Hex Color</Label>
          <Input
            id="customColor"
            value={primaryColor}
            onChange={(e) => handleHexInput(e.target.value)}
            placeholder="#590BA8"
            className="font-mono"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          <Check className="h-4 w-4 mr-2" />
          Save Branding
        </Button>
      </div>

      {/* Logo Generator Wizard */}
      <LogoGeneratorWizard
        isOpen={isLogoWizardOpen}
        onClose={() => setIsLogoWizardOpen(false)}
        onSelectLogo={(url) => {
          setLogoUrl(url);
          setUseCustomLogo(true);
        }}
        productName={license?.brandSettings?.appName}
      />
    </div>
  );
}