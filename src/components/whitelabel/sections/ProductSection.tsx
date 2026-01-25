import React, { useState } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  RefreshCw, 
  Lightbulb, 
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductSectionProps {
  app: MarketplaceApp;
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['brandSettings']>) => void;
}

const suggestedNames = [
  'GrowthHub',
  'LaunchPad Pro',
  'ScaleForce',
  'NextLevel AI',
  'SmartFlow'
];

export function ProductSection({ app, license, onUpdate }: ProductSectionProps) {
  const [productName, setProductName] = useState(license?.brandSettings?.appName || '');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const handleGenerateNames = async () => {
    setIsGeneratingNames(true);
    // Simulate AI name generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGeneratedNames(suggestedNames);
    setIsGeneratingNames(false);
    toast.success('Name ideas generated!');
  };

  const handleSelectName = (name: string) => {
    setProductName(name);
    onUpdate({ appName: name });
    toast.success(`"${name}" selected as product name`);
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    onUpdate({ appName: newName });
  };

  const handleGenerateMessaging = async () => {
    toast.success('AI messaging generated!');
    // TODO: Integrate with Lovable AI
  };

  const handleSave = () => {
    onUpdate({ appName: productName });
    toast.success('Product settings saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Product Setup</h2>
        <p className="text-muted-foreground mt-1">
          Customize your product's identity for your audience
        </p>
      </div>

      {/* Product Naming */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">Name Your Product</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          This is where it becomes real. Choose a memorable name for your white-label app.
        </p>

        <div className="space-y-3">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            value={productName}
            onChange={handleProductNameChange}
            placeholder="Enter your product name"
            className="text-lg"
          />
        </div>

        <Button 
          variant="outline" 
          onClick={handleGenerateNames}
          disabled={isGeneratingNames}
          className="gap-2"
        >
          {isGeneratingNames ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          Generate Name Ideas
        </Button>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Click To Use:</p>
            <div className="flex flex-wrap gap-2">
              {generatedNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectName(name)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    productName === name
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-muted/50 text-foreground border-border hover:border-emerald-500/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tagline & Description */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Brand Messaging</h3>
        
        <div className="space-y-3">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Enter a catchy tagline (e.g., 'Where Success Happens')"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">{tagline.length}/60 characters</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your product's capabilities and value proposition..."
            rows={4}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">{description.length}/300 characters</p>
        </div>

        <Button variant="outline" className="gap-2" onClick={handleGenerateMessaging}>
          <Sparkles className="h-4 w-4" />
          Generate With AI
        </Button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Product Settings
        </Button>
      </div>
    </div>
  );
}
