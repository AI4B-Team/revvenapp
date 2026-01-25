import React, { useState, useEffect } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Eye, 
  Save, 
  Globe, 
  CreditCard, 
  Layout, 
  Type, 
  Image, 
  Star, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Palette,
  RefreshCw
} from 'lucide-react';
import { getAppThumbnail } from '@/utils/appThumbnails';
import { IconTooltip } from '@/components/ui/IconTooltip';

// Template definitions
const SALES_PAGE_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern SaaS',
    description: 'Clean and minimal design perfect for software products',
    primaryColor: '#6366F1',
    style: 'modern',
    preview: 'linear-gradient(135deg, #6366F1, #8B5CF6)'
  },
  {
    id: 'bold',
    name: 'Bold Impact',
    description: 'High-contrast design that grabs attention',
    primaryColor: '#EF4444',
    style: 'bold',
    preview: 'linear-gradient(135deg, #EF4444, #F97316)'
  },
  {
    id: 'elegant',
    name: 'Elegant Pro',
    description: 'Sophisticated design for premium products',
    primaryColor: '#0F172A',
    style: 'elegant',
    preview: 'linear-gradient(135deg, #0F172A, #334155)'
  },
  {
    id: 'fresh',
    name: 'Fresh Start',
    description: 'Vibrant and energetic for new products',
    primaryColor: '#10B981',
    style: 'fresh',
    preview: 'linear-gradient(135deg, #10B981, #06B6D4)'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean design focusing on content',
    primaryColor: '#1F2937',
    style: 'minimal',
    preview: 'linear-gradient(135deg, #F9FAFB, #E5E7EB)'
  },
  {
    id: 'vibrant',
    name: 'Vibrant Energy',
    description: 'Colorful and dynamic for creative products',
    primaryColor: '#EC4899',
    style: 'vibrant',
    preview: 'linear-gradient(135deg, #EC4899, #8B5CF6)'
  }
];

interface SalesPageSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta';
  enabled: boolean;
  content: Record<string, string>;
}

interface SalesPageData {
  template: string;
  sections: SalesPageSection[];
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  stripeConnected: boolean;
}

interface SalesPageBuilderProps {
  app: MarketplaceApp;
  license?: AppLicense;
  onSave: (data: SalesPageData) => void;
}

const defaultSections: SalesPageSection[] = [
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    content: {
      headline: '',
      subheadline: '',
      ctaText: 'Get Started',
      ctaLink: '#pricing'
    }
  },
  {
    id: 'features',
    type: 'features',
    enabled: true,
    content: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to succeed',
      feature1Title: '',
      feature1Desc: '',
      feature2Title: '',
      feature2Desc: '',
      feature3Title: '',
      feature3Desc: ''
    }
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    enabled: true,
    content: {
      title: 'What Our Customers Say',
      quote1: '',
      author1: '',
      role1: '',
      quote2: '',
      author2: '',
      role2: ''
    }
  },
  {
    id: 'pricing',
    type: 'pricing',
    enabled: true,
    content: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that works for you',
      planName: 'Pro',
      planPrice: '$29',
      planPeriod: '/month',
      planFeatures: 'All features included\n24/7 Support\nUnlimited usage'
    }
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    content: {
      title: 'Frequently Asked Questions',
      q1: '',
      a1: '',
      q2: '',
      a2: '',
      q3: '',
      a3: ''
    }
  },
  {
    id: 'cta',
    type: 'cta',
    enabled: true,
    content: {
      headline: 'Ready to Get Started?',
      description: '',
      buttonText: 'Start Now',
      buttonLink: '#pricing'
    }
  }
];

export function SalesPageBuilder({ app, license, onSave }: SalesPageBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(SALES_PAGE_TEMPLATES[0]);
  const [sections, setSections] = useState<SalesPageSection[]>(defaultSections);
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState({
    primary: '#6366F1',
    secondary: '#1F2937',
    accent: '#10B981'
  });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  // Generate all copy on mount
  useEffect(() => {
    generateAllCopy();
  }, [app]);

  const generateAllCopy = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate content');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sales-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          appName: app.name,
          appDescription: app.description,
          appFeatures: app.features,
          appCategory: app.category
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate copy');
      }

      const data = await response.json();
      if (data.sections) {
        setSections(prev => prev.map(section => {
          const generated = data.sections.find((s: any) => s.type === section.type);
          if (generated) {
            return { ...section, content: { ...section.content, ...generated.content } };
          }
          return section;
        }));
        toast.success('Sales copy generated!');
      }
    } catch (error) {
      console.error('Error generating copy:', error);
      // Use fallback content
      generateFallbackCopy();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCopy = () => {
    setSections(prev => prev.map(section => {
      switch (section.type) {
        case 'hero':
          return {
            ...section,
            content: {
              ...section.content,
              headline: `Transform Your Business with ${app.name}`,
              subheadline: `${app.description} Start today and see results immediately.`
            }
          };
        case 'features':
          return {
            ...section,
            content: {
              ...section.content,
              feature1Title: app.features[0] || 'Powerful Automation',
              feature1Desc: 'Save hours of manual work with intelligent automation.',
              feature2Title: app.features[1] || 'Easy Integration',
              feature2Desc: 'Connect with your existing tools in minutes.',
              feature3Title: app.features[2] || 'Real-time Analytics',
              feature3Desc: 'Track your progress with detailed insights.'
            }
          };
        case 'testimonials':
          return {
            ...section,
            content: {
              ...section.content,
              quote1: `${app.name} completely transformed how we work. The results speak for themselves.`,
              author1: 'Sarah Johnson',
              role1: 'CEO, TechStart Inc.',
              quote2: 'Best investment we\'ve made. Our productivity doubled within the first month.',
              author2: 'Michael Chen',
              role2: 'Founder, GrowthLab'
            }
          };
        case 'faq':
          return {
            ...section,
            content: {
              ...section.content,
              q1: 'How quickly can I get started?',
              a1: 'You can be up and running in less than 5 minutes. Our intuitive setup wizard guides you through every step.',
              q2: 'Is there a free trial available?',
              a2: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required.',
              q3: 'What kind of support do you offer?',
              a3: 'We provide 24/7 email support and live chat during business hours. Premium plans include priority support.'
            }
          };
        case 'cta':
          return {
            ...section,
            content: {
              ...section.content,
              description: `Join thousands of businesses already using ${app.name} to achieve their goals.`
            }
          };
        default:
          return section;
      }
    }));
  };

  const regenerateSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setGeneratingSection(sectionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to regenerate content');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sales-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          appName: app.name,
          appDescription: app.description,
          appFeatures: app.features,
          appCategory: app.category,
          sectionType: section.type,
          regenerate: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate');
      }

      const data = await response.json();
      if (data.content) {
        updateSectionContent(sectionId, data.content);
        toast.success('Section regenerated!');
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
      toast.error('Failed to regenerate. Please try again.');
    } finally {
      setGeneratingSection(null);
    }
  };

  const updateSectionContent = (sectionId: string, updates: Record<string, string>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content: { ...section.content, ...updates } }
        : section
    ));
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const handleSave = () => {
    onSave({
      template: selectedTemplate.id,
      sections,
      customColors,
      stripeConnected
    });
    toast.success('Sales page saved!');
  };

  const handleConnectStripe = () => {
    toast.info('Stripe connection would open here');
    setStripeConnected(true);
  };

  const renderSectionEditor = (section: SalesPageSection) => {
    const isExpanded = expandedSection === section.id;
    const isRegenerating = generatingSection === section.id;

    return (
      <div key={section.id} className="border border-border rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer"
          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => {
                e.stopPropagation();
                toggleSection(section.id);
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="font-medium capitalize">{section.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconTooltip label="Regenerate">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  regenerateSection(section.id);
                }}
                disabled={isRegenerating}
                className="h-8"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </IconTooltip>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {isExpanded && section.enabled && (
          <div className="p-4 space-y-4 border-t border-border">
            {Object.entries(section.content).map(([key, value]) => (
              <div key={key}>
                <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                {key.includes('desc') || key.includes('quote') || key.includes('description') || key.includes('Features') ? (
                  <Textarea
                    value={value}
                    onChange={(e) => updateSectionContent(section.id, { [key]: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => updateSectionContent(section.id, { [key]: e.target.value })}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              Sales Page Builder
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a custom landing page to market and sell {app.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto">
              <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 py-3 px-4">
                <Layout className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="content" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 py-3 px-4">
                <Type className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="style" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 py-3 px-4">
                <Palette className="h-4 w-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="stripe" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 py-3 px-4">
                <CreditCard className="h-4 w-4 mr-2" />
                Stripe
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <TabsContent value="templates" className="p-4 m-0 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {SALES_PAGE_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setCustomColors(prev => ({ ...prev, primary: template.primaryColor }));
                      }}
                      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedTemplate.id === template.id 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div 
                        className="h-24"
                        style={{ background: template.preview }}
                      />
                      <div className="p-3 bg-card">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                      {selectedTemplate.id === template.id && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                          <Star className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    AI-generated copy • Click to edit
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateAllCopy}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Regenerate All
                  </Button>
                </div>
                {sections.map(renderSectionEditor)}
              </TabsContent>

              <TabsContent value="style" className="p-4 m-0 space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="h-10 w-20 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={customColors.primary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="h-10 w-20 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="h-10 w-20 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={customColors.accent}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stripe" className="p-4 m-0 space-y-4">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">Connect Stripe</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accept payments directly on your sales page
                  </p>
                  <Button 
                    onClick={handleConnectStripe}
                    className={stripeConnected ? 'bg-emerald-500' : ''}
                  >
                    {stripeConnected ? (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      'Connect Stripe Account'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-muted/20">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <SalesPagePreview 
                app={app}
                template={selectedTemplate}
                sections={sections}
                colors={customColors}
                license={license}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Preview Component
function SalesPagePreview({ 
  app, 
  template, 
  sections, 
  colors,
  license 
}: { 
  app: MarketplaceApp; 
  template: typeof SALES_PAGE_TEMPLATES[0];
  sections: SalesPageSection[];
  colors: { primary: string; secondary: string; accent: string };
  license?: AppLicense;
}) {
  const enabledSections = sections.filter(s => s.enabled);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg text-gray-900 text-sm">
      {/* Hero Section */}
      {enabledSections.find(s => s.type === 'hero') && (
        <div 
          className="p-6 text-center text-white"
          style={{ background: template.preview }}
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
            {getAppThumbnail(app.name) ? (
              <img src={getAppThumbnail(app.name)} alt={app.name} className="w-8 h-8 rounded" />
            ) : (
              <span className="text-2xl">{app.icon}</span>
            )}
          </div>
          <h1 className="text-xl font-bold mb-2">
            {enabledSections.find(s => s.type === 'hero')?.content.headline || `Welcome to ${app.name}`}
          </h1>
          <p className="text-white/80 mb-4 text-xs">
            {enabledSections.find(s => s.type === 'hero')?.content.subheadline || app.description}
          </p>
          <button 
            className="px-4 py-2 rounded-full font-medium text-xs"
            style={{ backgroundColor: colors.accent, color: 'white' }}
          >
            {enabledSections.find(s => s.type === 'hero')?.content.ctaText || 'Get Started'}
          </button>
        </div>
      )}

      {/* Features Section */}
      {enabledSections.find(s => s.type === 'features') && (
        <div className="p-6">
          <h2 className="text-center font-bold text-lg mb-1" style={{ color: colors.secondary }}>
            {enabledSections.find(s => s.type === 'features')?.content.title}
          </h2>
          <p className="text-center text-gray-500 mb-4 text-xs">
            {enabledSections.find(s => s.type === 'features')?.content.subtitle}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => {
              const section = enabledSections.find(s => s.type === 'features');
              return (
                <div key={i} className="text-center p-3 rounded-lg bg-gray-50">
                  <div 
                    className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <Star className="h-4 w-4" style={{ color: colors.primary }} />
                  </div>
                  <h3 className="font-medium text-xs mb-1">
                    {section?.content[`feature${i}Title`] || `Feature ${i}`}
                  </h3>
                  <p className="text-gray-500 text-[10px]">
                    {section?.content[`feature${i}Desc`] || 'Feature description'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {enabledSections.find(s => s.type === 'testimonials') && (
        <div className="p-6 bg-gray-50">
          <h2 className="text-center font-bold text-lg mb-4" style={{ color: colors.secondary }}>
            {enabledSections.find(s => s.type === 'testimonials')?.content.title}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => {
              const section = enabledSections.find(s => s.type === 'testimonials');
              return (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                  <MessageSquare className="h-4 w-4 mb-2" style={{ color: colors.primary }} />
                  <p className="text-gray-600 text-[10px] italic mb-2">
                    "{section?.content[`quote${i}`] || 'Great product!'}"
                  </p>
                  <p className="font-medium text-xs">{section?.content[`author${i}`] || 'Customer'}</p>
                  <p className="text-gray-500 text-[10px]">{section?.content[`role${i}`] || 'User'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {enabledSections.find(s => s.type === 'pricing') && (
        <div className="p-6">
          <h2 className="text-center font-bold text-lg mb-1" style={{ color: colors.secondary }}>
            {enabledSections.find(s => s.type === 'pricing')?.content.title}
          </h2>
          <p className="text-center text-gray-500 mb-4 text-xs">
            {enabledSections.find(s => s.type === 'pricing')?.content.subtitle}
          </p>
          <div className="max-w-[200px] mx-auto border-2 rounded-xl p-4" style={{ borderColor: colors.primary }}>
            <h3 className="font-bold text-center mb-2">
              {enabledSections.find(s => s.type === 'pricing')?.content.planName}
            </h3>
            <div className="text-center mb-3">
              <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                {license?.pricingSettings?.monthlyPrice 
                  ? `$${license.pricingSettings.monthlyPrice}` 
                  : enabledSections.find(s => s.type === 'pricing')?.content.planPrice}
              </span>
              <span className="text-gray-500 text-xs">
                {enabledSections.find(s => s.type === 'pricing')?.content.planPeriod}
              </span>
            </div>
            <button 
              className="w-full py-2 rounded-lg font-medium text-white text-xs"
              style={{ backgroundColor: colors.primary }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {enabledSections.find(s => s.type === 'cta') && (
        <div 
          className="p-6 text-center text-white"
          style={{ background: template.preview }}
        >
          <h2 className="text-lg font-bold mb-2">
            {enabledSections.find(s => s.type === 'cta')?.content.headline}
          </h2>
          <p className="text-white/80 mb-4 text-xs">
            {enabledSections.find(s => s.type === 'cta')?.content.description}
          </p>
          <button 
            className="px-4 py-2 rounded-full font-medium text-xs"
            style={{ backgroundColor: 'white', color: colors.primary }}
          >
            {enabledSections.find(s => s.type === 'cta')?.content.buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
