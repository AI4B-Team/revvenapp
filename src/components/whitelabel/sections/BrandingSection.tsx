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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [useCustomLogo, setUseCustomLogo] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('🚀');
  
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

  const primaryColor = hslToHex(primaryHue, primarySaturation);

  const handlePresetClick = (preset: typeof colorPresets[0]) => {
    setPrimaryHue(preset.hue);
    setPrimarySaturation(preset.saturation !== undefined ? preset.saturation : 70);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconUrl(reader.result as string);
        toast.success('Favicon uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate({
      logo: logoUrl,
      favicon: faviconUrl,
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
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${primaryColor}20`, border: `2px solid ${primaryColor}` }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              selectedIcon
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{license?.brandSettings?.appName || 'Your Product'}</p>
            <p className="text-sm text-muted-foreground">White-Label App</p>
          </div>
          <div 
            className="ml-auto w-8 h-8 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
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
          <div className="grid grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Logo</Label>
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="h-32 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                {logoUrl ? (
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
              <p className="text-xs text-muted-foreground">
                Tip: Transparent PNGs with a square layout look best.
              </p>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <Label>Favicon</Label>
              <div 
                onClick={() => faviconInputRef.current?.click()}
                className="h-32 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                {faviconUrl ? (
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
              <p className="text-xs text-muted-foreground">
                We optimize the favicon automatically.
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
                hsl(0, 70%, 50%), 
                hsl(60, 70%, 50%), 
                hsl(120, 70%, 50%), 
                hsl(180, 70%, 50%), 
                hsl(240, 70%, 50%), 
                hsl(300, 70%, 50%), 
                hsl(360, 70%, 50%)
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

        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label htmlFor="customColor">Custom Hex Color</Label>
          <Input
            id="customColor"
            value={primaryColor}
            onChange={(e) => {
              // Parse hex and convert to hue
              // For now, just show the value
            }}
            placeholder="#590BA8"
            className="font-mono"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Branding
        </Button>
      </div>
    </div>
  );
}
