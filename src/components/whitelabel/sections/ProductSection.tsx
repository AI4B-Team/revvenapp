import React, { useState, useRef, useCallback } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Lightbulb, 
  Wand2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { NameGeneratorWizard } from '../wizards/NameGeneratorWizard';
import AITextInput from '../AITextInput';

interface ProductSectionProps {
  app: MarketplaceApp;
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['brandSettings']>, showToast?: boolean) => void;
}

export function ProductSection({ app, license, onUpdate }: ProductSectionProps) {
  const [productName, setProductName] = useState(license?.brandSettings?.appName || '');
  const [badge, setBadge] = useState(license?.brandSettings?.badge || '');
  const [headline, setHeadline] = useState(license?.brandSettings?.headline || '');
  const [tagline, setTagline] = useState(license?.brandSettings?.tagline || '');
  const [description, setDescription] = useState(license?.brandSettings?.description || '');
  const [isNameWizardOpen, setIsNameWizardOpen] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((settings: Partial<AppLicense['brandSettings']>) => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Update preview immediately (no toast)
    onUpdate(settings, false);
    
    // Schedule toast after 5 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      toast.success('Brand settings saved');
    }, 5000);
  }, [onUpdate]);

  const handleSelectName = (name: string) => {
    setProductName(name);
    onUpdate({ appName: name }, false);
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProductName(newName);
    debouncedSave({ appName: newName });
  };

  const handleTaglineAIChange = (newTagline: string) => {
    setTagline(newTagline);
    debouncedSave({ tagline: newTagline });
  };

  const handleBadgeAIChange = (newBadge: string) => {
    setBadge(newBadge);
    debouncedSave({ badge: newBadge });
  };

  const handleHeadlineAIChange = (newHeadline: string) => {
    setHeadline(newHeadline);
    debouncedSave({ headline: newHeadline });
  };

  const handleDescriptionAIChange = (newDescription: string) => {
    setDescription(newDescription);
    debouncedSave({ description: newDescription });
  };

  const handleGenerateAllCopy = async () => {
    setIsGeneratingAll(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const badges = [
        'AI-Powered',
        'New Release',
        '#1 Rated',
        'Industry Leading',
        'Award Winning',
      ];
      
      const headlines = [
        'Stop Scrolling. Start Winning.',
        'The Secret Weapon Top Performers Use',
        'Finally, A Solution That Actually Works',
        'Your Competition Is Already Using This',
      ];
      
      const taglines = [
        'Transform Your Business With AI-Powered Solutions',
        'Unlock Your Potential With Smart Automation',
        'The Future of Work, Available Today',
      ];
      
      const descriptions = [
        'Streamline your workflow, boost productivity, and achieve more with our cutting-edge platform designed for modern businesses.',
        'Experience the power of intelligent automation that adapts to your needs and scales with your growth.',
        'Join thousands of successful businesses already transforming their operations with our innovative solutions.',
      ];
      
      const newBadge = badges[Math.floor(Math.random() * badges.length)];
      const newHeadline = headlines[Math.floor(Math.random() * headlines.length)];
      const newTagline = taglines[Math.floor(Math.random() * taglines.length)];
      const newDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      setBadge(newBadge);
      setHeadline(newHeadline);
      setTagline(newTagline);
      setDescription(newDescription);
      
      onUpdate({ 
        badge: newBadge,
        headline: newHeadline, 
        tagline: newTagline, 
        description: newDescription 
      }, false);
      
      toast.success('All brand messaging generated!');
    } catch (error) {
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGeneratingAll(false);
    }
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
          onClick={() => setIsNameWizardOpen(true)}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Generate Name Ideas
        </Button>
      </div>

      {/* Name Generator Wizard Modal */}
      <NameGeneratorWizard
        isOpen={isNameWizardOpen}
        onClose={() => setIsNameWizardOpen(false)}
        onSelectName={handleSelectName}
        appContext={app.description}
      />

      {/* Tagline & Description */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Brand Messaging</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAllCopy}
            disabled={isGeneratingAll}
            className="gap-2"
          >
            {isGeneratingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGeneratingAll ? 'Generating...' : 'AI Writer'}
          </Button>
        </div>
        
        <div className="space-y-3">
          <AITextInput
            label="Badge Text"
            value={badge}
            onChange={handleBadgeAIChange}
            placeholder="Short badge text (e.g., 'AI-Powered', '#1 Rated')"
            context="badge"
          />
          <p className="text-xs text-muted-foreground">{badge.length}/20 characters</p>
        </div>

        <div className="space-y-3">
          <AITextInput
            label="Headline"
            value={headline}
            onChange={handleHeadlineAIChange}
            placeholder="A short, hypnotic scroll-stopping headline to sell your product"
            context="headline"
          />
          <p className="text-xs text-muted-foreground">{headline.length}/80 characters</p>
        </div>

        <div className="space-y-3">
          <AITextInput
            label="Tagline"
            value={tagline}
            onChange={handleTaglineAIChange}
            placeholder="Enter a catchy tagline (e.g., 'Where Success Happens')"
            context="tagline"
          />
          <p className="text-xs text-muted-foreground">{tagline.length}/60 characters</p>
        </div>

        <div className="space-y-3">
          <AITextInput
            label="Description"
            value={description}
            onChange={handleDescriptionAIChange}
            placeholder="Describe your product's capabilities and value proposition..."
            context="description"
            multiline
            rows={4}
          />
          <p className="text-xs text-muted-foreground">{description.length}/300 characters</p>
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
