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
  Image as ImageIcon,
  Check,
  Wand2,
  Target,
  Users
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

const targetCustomers = [
  { id: 'freelancers', label: 'Freelancers', icon: Users },
  { id: 'small_business', label: 'Small Businesses', icon: Target },
  { id: 'agencies', label: 'Agencies', icon: Users },
  { id: 'enterprises', label: 'Enterprises', icon: Target },
  { id: 'creators', label: 'Content Creators', icon: Sparkles },
];

const benefits = [
  'Save time',
  'Make more money',
  'Reduce costs',
  'Automate work',
  'Get insights',
  'Simplify workflows'
];

export function ProductSection({ app, license, onUpdate }: ProductSectionProps) {
  const [productName, setProductName] = useState(license?.brandSettings?.appName || '');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGeneratingLogos, setIsGeneratingLogos] = useState(false);

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
    toast.success(`"${name}" selected as product name`);
  };

  const handleGenerateLogos = async () => {
    setIsGeneratingLogos(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingLogos(false);
    toast.success('Logo concepts generated! Check the Branding section.');
  };

  const toggleCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    );
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
          Define your product identity and target audience
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
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter your product name"
            className="text-lg"
          />
        </div>

        <div className="flex gap-3">
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
          <Button 
            variant="outline" 
            onClick={handleGenerateLogos}
            disabled={isGeneratingLogos}
            className="gap-2"
          >
            {isGeneratingLogos ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Generate AI Logo
          </Button>
        </div>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Click to use:</p>
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

        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate With AI
        </Button>
      </div>

      {/* Target Customers */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Target Customers</h3>
        <p className="text-sm text-muted-foreground">
          Who is this for? Clear customers = faster sales.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {targetCustomers.map((customer) => {
            const Icon = customer.icon;
            const isSelected = selectedCustomers.includes(customer.id);
            
            return (
              <button
                key={customer.id}
                onClick={() => toggleCustomer(customer.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted/30 border-border hover:border-muted-foreground/30'
                }`}
              >
                {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{customer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Key Benefits</h3>
        <p className="text-sm text-muted-foreground">
          Select 1-2 benefits that best describe your product.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit) => {
            const isSelected = selectedBenefits.includes(benefit);
            
            return (
              <button
                key={benefit}
                onClick={() => toggleBenefit(benefit)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-muted/30 text-foreground border-border hover:border-emerald-500/50'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                {benefit}
              </button>
            );
          })}
        </div>
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
