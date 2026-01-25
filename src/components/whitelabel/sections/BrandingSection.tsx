import React, { useState, useRef } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Palette, 
  Image as ImageIcon,
  RefreshCw,
  Check,
  Eye,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BrandingSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['brandSettings']>) => void;
}

const predefinedIcons = ['🚀', '⚡', '💎', '🎯', '✨', '🔥', '💡', '🌟'];

const colorPresets = [
  { name: 'Purple', hue: 270 },
  { name: 'Blue', hue: 220 },
  { name: 'Green', hue: 150 },
  { name: 'Orange', hue: 30 },
  { name: 'Pink', hue: 330 },
  { name: 'Teal', hue: 180 },
  { name: 'Red', hue: 0 },
  { name: 'Gray', hue: 0, saturation: 0 },
];

export function BrandingSection({ license, onUpdate }: BrandingSectionProps) {
  const [logoUrl, setLogoUrl] = useState(license?.brandSettings?.logo || '');
  const [faviconUrl, setFaviconUrl] = useState(license?.brandSettings?.favicon || '');
  const [primaryHue, setPrimaryHue] = useState(270);
  const [primarySaturation, setPrimarySaturation] = useState(70);
  const [useCustomLogo, setUseCustomLogo] = useState(!!license?.brandSettings?.logo);
  const [selectedIcon, setSelectedIcon] = useState('🚀');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const hslToHex = (h: number, s: number = 70, l: number = 50) => {
    const a = s / 100;
    const b = l / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = b - a * Math.min(b, 1 - b) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

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

  const primaryColor = hslToHex(primaryHue, primarySaturation);

  const handlePresetClick = (preset: typeof colorPresets[0]) => {
    setPrimaryHue(preset.hue);
    setPrimarySaturation(preset.saturation !== undefined ? preset.saturation : 70);
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

  const handleGenerateLogo = async () => {
    const appName = license?.brandSettings?.appName || 'My App';
    
    setIsGeneratingLogo(true);
    try {
      const { data, error } = await supabase.functions.invoke('editor-generate-image', {
        body: {
          prompt: `Create a modern, minimal, professional logo icon for a brand called "${appName}". The logo should be simple, memorable, and work well at small sizes. Use bold shapes and clean lines. Square aspect ratio, centered design, solid background. No text in the logo.`
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setLogoUrl(data.imageUrl);
        setUseCustomLogo(true);
        toast.success('Logo generated successfully!');
      } else {
        throw new Error('No image generated');
      }
    } catch (error) {
      console.error('Logo generation error:', error);
      toast.error('Failed to generate logo. Please try again.');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const clearLogo = () => {
    setLogoUrl('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const clearFavicon = () => {
    setFaviconUrl('');
    if (faviconInputRef.current) faviconInputRef.current.value = '';
  };

  const handleSave = () => {
    onUpdate({
      logo: useCustomLogo ? logoUrl : undefined,
      favicon: faviconUrl || undefined,
      primaryColor: primaryColor
    });
    toast.success('Branding settings saved!');
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

      {/* Brand Snapshot Preview */}
      <div className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Brand Snapshot</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Quick view of how your identity comes together.
        </p>
        
        <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
            style={{ backgroundColor: `${primaryColor}20`, border: `2px solid ${primaryColor}` }}
          >
            {useCustomLogo && logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              selectedIcon
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{license?.brandSettings?.appName || 'Your Product'}</p>
            <p className="text-sm text-muted-foreground">White-Label App</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {faviconUrl && (
              <div className="w-6 h-6 rounded overflow-hidden border border-border">
                <img src={faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
              </div>
            )}
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>
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

            {/* AI Logo Generation */}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleGenerateLogo}
                disabled={isGeneratingLogo}
                variant="outline"
                className="w-full border-dashed border-2 h-12"
              >
                {isGeneratingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Logo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Logo With AI
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI will create a unique logo based on your product name
              </p>
            </div>
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
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: hslToHex(preset.hue, preset.saturation !== undefined ? preset.saturation : 70) }}
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
    </div>
  );
}