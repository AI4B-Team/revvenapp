import React, { useState } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Eye,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  Layout,
  Star,
  MessageSquare,
  HelpCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export interface PageBlock {
  id: string;
  type: SectionType;
  enabled: boolean;
  title: string;
  content: Record<string, any>;
}

interface PageSectionProps {
  app: MarketplaceApp;
  license?: AppLicense;
  pageSections?: PageBlock[];
  onPageSectionsChange?: (sections: PageBlock[]) => void;
}

type SectionType = 'hero' | 'features' | 'capabilities' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer';

const sectionIcons: Record<SectionType, React.ElementType> = {
  hero: Layout,
  features: Zap,
  capabilities: Star,
  testimonials: MessageSquare,
  pricing: Star,
  faq: HelpCircle,
  cta: Sparkles,
  footer: Type,
};

// Generate default sections based on app context
const getDefaultSections = (app: MarketplaceApp, license?: AppLicense): PageBlock[] => {
  const appName = license?.brandSettings?.appName || app.name;
  const tagline = license?.brandSettings?.tagline || 'Transform Your Business With AI-Powered Solutions';
  const description = license?.brandSettings?.description || app.description;
  
  return [
    { 
      id: 'hero', 
      type: 'hero', 
      enabled: true, 
      title: 'Hero Section', 
      content: { 
        badge: 'AI-Powered', 
        tagline: tagline,
        description: description
      } 
    },
    { 
      id: 'features', 
      type: 'features', 
      enabled: true, 
      title: 'Features Section', 
      content: { 
        features: [
          { title: 'Smart AI Technology', description: 'Leverage cutting-edge artificial intelligence to automate and optimize your workflow' },
          { title: 'Built For You', description: 'Every feature is designed with your specific business needs in mind' },
          { title: 'Easy Integration', description: 'Get started in minutes with our plug-and-play setup process' },
          { title: 'Always Available', description: 'Access your tools 24/7 from any device, anywhere in the world' }
        ] 
      } 
    },
    { 
      id: 'capabilities', 
      type: 'capabilities', 
      enabled: true, 
      title: 'Capabilities Section', 
      content: { 
        cards: [
          { title: 'Automation', description: 'Automate repetitive tasks and save hours every week', icon: '⚡' },
          { title: 'Analytics', description: 'Get real-time insights and data-driven recommendations', icon: '📊' },
          { title: 'Collaboration', description: 'Work seamlessly with your team in real-time', icon: '👥' }
        ] 
      } 
    },
    { 
      id: 'testimonials', 
      type: 'testimonials', 
      enabled: true, 
      title: 'Testimonials', 
      content: { 
        testimonials: [
          { name: 'Sarah Johnson', role: 'Marketing Director', company: 'TechCorp', quote: 'This platform has completely transformed how we operate. The AI features alone have saved us 20+ hours per week.', avatar: '' },
          { name: 'Michael Chen', role: 'Founder & CEO', company: 'StartupXYZ', quote: 'The best investment we made this year. ROI was visible within the first month of usage.', avatar: '' },
          { name: 'Emily Rodriguez', role: 'Operations Manager', company: 'GrowthCo', quote: 'Incredible customer support and the product just keeps getting better with each update.', avatar: '' }
        ] 
      } 
    },
    { 
      id: 'pricing', 
      type: 'pricing', 
      enabled: true, 
      title: 'Pricing Section', 
      content: {
        headline: 'Simple, Transparent Pricing',
        subheadline: 'Start free, upgrade when you need more',
        showComparison: true,
        highlightedPlan: 'pro'
      } 
    },
    { 
      id: 'faq', 
      type: 'faq', 
      enabled: true, 
      title: 'FAQ Section', 
      content: { 
        questions: [
          { q: 'How quickly can I get started?', a: 'You can be up and running in less than 5 minutes. Our intuitive onboarding process guides you through everything you need to know.' },
          { q: 'Is there a free trial available?', a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.' },
          { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. You can cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period.' },
          { q: 'Do you offer refunds?', a: 'Yes, we have a 14-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full.' },
          { q: 'Is my data secure?', a: 'Security is our top priority. We use enterprise-grade encryption and are fully compliant with GDPR and other privacy regulations.' }
        ] 
      } 
    },
    { 
      id: 'cta', 
      type: 'cta', 
      enabled: true, 
      title: 'Call To Action', 
      content: {
        headline: 'Ready to Transform Your Business?',
        subheadline: 'Join thousands of successful businesses already using our platform',
        buttonText: 'Start Your Free Trial',
        secondaryButtonText: 'Schedule a Demo'
      } 
    },
    { 
      id: 'footer', 
      type: 'footer', 
      enabled: true, 
      title: 'Footer', 
      content: {
        companyName: appName,
        tagline: 'Empowering businesses with AI',
        showSocialLinks: true,
        showNewsletter: true,
        copyrightYear: new Date().getFullYear()
      } 
    },
  ];
};

// Hero Style Templates
type HeroStyle = 'centered' | 'split-left' | 'split-right' | 'minimal' | 'gradient' | 'bold';

interface HeroStyleOption {
  id: HeroStyle;
  name: string;
  preview: React.ReactNode;
}

function HeroStyleSelector({ 
  selectedStyle, 
  onStyleChange, 
  content 
}: { 
  selectedStyle: HeroStyle; 
  onStyleChange: (style: HeroStyle) => void;
  content: Record<string, any>;
}) {
  const styles: HeroStyleOption[] = [
    { 
      id: 'centered', 
      name: 'Centered',
      preview: (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
          <div className="w-8 h-1.5 rounded bg-emerald-500/60 mb-1.5" />
          <div className="w-16 h-2 rounded bg-foreground/80 mb-1" />
          <div className="w-12 h-1 rounded bg-muted-foreground/40 mb-2" />
          <div className="w-6 h-2 rounded bg-emerald-500" />
        </div>
      )
    },
    { 
      id: 'split-left', 
      name: 'Split Left',
      preview: (
        <div className="w-full h-full flex items-center p-2">
          <div className="flex-1 flex flex-col items-start justify-center">
            <div className="w-8 h-1.5 rounded bg-emerald-500/60 mb-1" />
            <div className="w-12 h-2 rounded bg-foreground/80 mb-1" />
            <div className="w-10 h-1 rounded bg-muted-foreground/40 mb-1.5" />
            <div className="w-5 h-1.5 rounded bg-emerald-500" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 opacity-70" />
        </div>
      )
    },
    { 
      id: 'split-right', 
      name: 'Split Right',
      preview: (
        <div className="w-full h-full flex items-center p-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 opacity-70" />
          <div className="flex-1 flex flex-col items-end justify-center text-right">
            <div className="w-8 h-1.5 rounded bg-emerald-500/60 mb-1" />
            <div className="w-12 h-2 rounded bg-foreground/80 mb-1" />
            <div className="w-10 h-1 rounded bg-muted-foreground/40 mb-1.5" />
            <div className="w-5 h-1.5 rounded bg-emerald-500" />
          </div>
        </div>
      )
    },
    { 
      id: 'minimal', 
      name: 'Minimal',
      preview: (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
          <div className="w-20 h-2 rounded bg-foreground/80 mb-1" />
          <div className="w-14 h-1 rounded bg-muted-foreground/30" />
        </div>
      )
    },
    { 
      id: 'gradient', 
      name: 'Gradient',
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 rounded flex flex-col items-center justify-center text-center p-2">
          <div className="w-8 h-1.5 rounded bg-white/60 mb-1.5" />
          <div className="w-14 h-2 rounded bg-foreground/80 mb-1" />
          <div className="w-10 h-1 rounded bg-muted-foreground/40 mb-2" />
          <div className="w-6 h-2 rounded bg-white" />
        </div>
      )
    },
    { 
      id: 'bold', 
      name: 'Bold',
      preview: (
        <div className="w-full h-full bg-foreground rounded flex flex-col items-center justify-center text-center p-2">
          <div className="w-8 h-1.5 rounded bg-emerald-500 mb-1.5" />
          <div className="w-16 h-2 rounded bg-white mb-1" />
          <div className="w-12 h-1 rounded bg-white/40 mb-2" />
          <div className="w-6 h-2 rounded bg-emerald-500" />
        </div>
      )
    },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(() => {
    const idx = styles.findIndex(s => s.id === selectedStyle);
    return idx >= 0 ? idx : 0;
  });

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? styles.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onStyleChange(styles[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex === styles.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onStyleChange(styles[newIndex].id);
  };

  const currentStyle = styles[currentIndex];

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrev}
        className="h-8 w-8 shrink-0 rounded-full bg-muted"
      >
        <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
      </Button>
      
      <div className="flex-1 border-2 border-border rounded-xl overflow-hidden">
        <div className="h-24 bg-background">
          {currentStyle.preview}
        </div>
        <div className="p-2 bg-muted/30 border-t border-border text-center">
          <span className="text-xs font-medium text-foreground">{currentStyle.name}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNext}
        className="h-8 w-8 shrink-0 rounded-full bg-muted"
      >
        <ChevronUp className="h-4 w-4 rotate-90" />
      </Button>
    </div>
  );
}

export function PageSection({ app, license, pageSections: externalSections, onPageSectionsChange }: PageSectionProps) {
  const [sections, setSectionsInternal] = useState<PageBlock[]>(() => 
    externalSections || getDefaultSections(app, license)
  );
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Wrapper to sync sections to parent
  const setSections = (updater: PageBlock[] | ((prev: PageBlock[]) => PageBlock[])) => {
    setSectionsInternal(prev => {
      const newSections = typeof updater === 'function' ? updater(prev) : updater;
      onPageSectionsChange?.(newSections);
      return newSections;
    });
  };

  // Update sections when license changes (e.g., product name updated)
  React.useEffect(() => {
    const newDefaults = getDefaultSections(app, license);
    setSectionsInternal(current => {
      // Only update hero section with new product info if it hasn't been manually edited
      const updated = current.map((section, idx) => {
        if (section.id === 'hero') {
          return {
            ...section,
            content: {
              ...section.content,
              tagline: license?.brandSettings?.tagline || section.content.tagline,
              description: license?.brandSettings?.description || section.content.description
            }
          };
        }
        return section;
      });
      onPageSectionsChange?.(updated);
      return updated;
    });
  }, [license?.brandSettings?.tagline, license?.brandSettings?.description]);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const toggleSectionEnabled = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const updateSectionContent = (id: string, updates: Record<string, any>) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, content: { ...s.content, ...updates } } : s
    ));
  };

  const handleGenerateCopy = async (sectionId: string) => {
    setIsGenerating(sectionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate AI-generated content based on section type
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      switch (section.type) {
        case 'hero':
          updateSectionContent(sectionId, {
            tagline: 'Where Success Happens',
            description: `AI-powered platform that helps businesses create amazing results, optimize engagement, and grow their presence with intelligent automation.`
          });
          break;
        case 'features':
          updateSectionContent(sectionId, {
            features: [
              { title: 'Smart AI', description: 'Constantly evolving intelligence at your fingertips' },
              { title: 'Built for You', description: 'Every agent is designed to serve your specific needs' },
              { title: 'Plug & Play', description: 'No setup needed. Just log in and get things done.' },
              { title: '24/7 Available', description: 'Get help anytime, anywhere, on any device.' }
            ]
          });
          break;
        case 'faq':
          updateSectionContent(sectionId, {
            questions: [
              { q: 'Will I have access to all AI models?', a: 'Yes! You have access to the main AIs on the market, all integrated in a single platform.' },
              { q: 'Can I run unlimited AI sessions?', a: 'Absolutely. There are no limits on how many AI interactions you can initiate.' },
              { q: 'Is my data secure?', a: 'Your data is protected with enterprise-level security and privacy standards.' }
            ]
          });
          break;
      }
    }
    
    setIsGenerating(null);
    toast.success('AI copy generated!');
  };

  const handleSave = () => {
    toast.success('Page configuration saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Landing Page Builder</h2>
        <p className="text-muted-foreground mt-1">
          Configure and customize your sales page sections. Changes are reflected in the live preview.
        </p>
      </div>

      {/* Section List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Page Sections</h3>
          <span className="text-sm text-muted-foreground">
            {sections.filter(s => s.enabled).length} of {sections.length} Enabled
          </span>
        </div>

        {sections.map((section) => {
          const Icon = sectionIcons[section.type];
          const isExpanded = expandedSection === section.id;

          return (
            <div 
              key={section.id}
              className={`rounded-xl border-2 transition-all ${
                section.enabled ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              {/* Section Header */}
              <div 
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  section.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon size={16} />
                </div>
                <span className="font-medium text-foreground flex-1">{section.title}</span>
                
                <Switch
                  checked={section.enabled}
                  onCheckedChange={() => toggleSectionEnabled(section.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Section Content Editor */}
              {isExpanded && section.enabled && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  {section.type === 'hero' && (
                    <>
                      <div className="space-y-2">
                        <Label>Badge Text</Label>
                        <Input
                          value={section.content.badge || ''}
                          onChange={(e) => updateSectionContent(section.id, { badge: e.target.value })}
                          placeholder="e.g., AI-Powered, New, Trusted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input
                          value={section.content.tagline || ''}
                          onChange={(e) => updateSectionContent(section.id, { tagline: e.target.value })}
                          placeholder="Enter a catchy tagline"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground">{(section.content.tagline?.length || 0)}/60</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={section.content.description || ''}
                          onChange={(e) => updateSectionContent(section.id, { description: e.target.value })}
                          placeholder="Describe your platform's capabilities..."
                          rows={3}
                          maxLength={300}
                        />
                        <p className="text-xs text-muted-foreground">{(section.content.description?.length || 0)}/300</p>
                      </div>
                      
                      {/* Hero Visual Image */}
                      <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Hero Visual</Label>
                          {section.content.heroImageUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSectionContent(section.id, { heroImageUrl: '' })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload or generate an image for split layouts. Uses app thumbnail by default.
                        </p>
                        
                        {section.content.heroImageUrl ? (
                          <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-border">
                            <img 
                              src={section.content.heroImageUrl} 
                              alt="Hero visual" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-background hover:bg-muted/50 transition-colors cursor-pointer relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      updateSectionContent(section.id, { heroImageUrl: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="font-medium text-sm text-foreground">Upload Image</p>
                              <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={async () => {
                                setIsGenerating('hero-image');
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                // Mock AI-generated image placeholder
                                updateSectionContent(section.id, { 
                                  heroImageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop' 
                                });
                                setIsGenerating(null);
                                toast.success('AI image generated!');
                              }}
                              disabled={isGenerating === 'hero-image'}
                              className="gap-2"
                            >
                              {isGenerating === 'hero-image' ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                              Generate With AI
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {section.type === 'features' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input
                          value={section.content.headline || ''}
                          onChange={(e) => updateSectionContent(section.id, { headline: e.target.value })}
                          placeholder="Why Choose Us"
                        />
                      </div>
                      
                      {(section.content.features || []).map((feature: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Feature {idx + 1}</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newFeatures = [...section.content.features];
                                newFeatures.splice(idx, 1);
                                updateSectionContent(section.id, { features: newFeatures });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...section.content.features];
                              newFeatures[idx] = { ...feature, title: e.target.value };
                              updateSectionContent(section.id, { features: newFeatures });
                            }}
                            placeholder="Feature title"
                          />
                          <Input
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...section.content.features];
                              newFeatures[idx] = { ...feature, description: e.target.value };
                              updateSectionContent(section.id, { features: newFeatures });
                            }}
                            placeholder="Feature description"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newFeatures = [...(section.content.features || []), { title: '', description: '' }];
                          updateSectionContent(section.id, { features: newFeatures });
                        }}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Feature
                      </Button>
                    </div>
                  )}

                  {section.type === 'capabilities' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input
                          value={section.content.headline || ''}
                          onChange={(e) => updateSectionContent(section.id, { headline: e.target.value })}
                          placeholder="What We Offer"
                        />
                      </div>
                      
                      {(section.content.cards || []).map((card: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Capability {idx + 1}</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newCards = [...section.content.cards];
                                newCards.splice(idx, 1);
                                updateSectionContent(section.id, { cards: newCards });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={card.icon}
                              onChange={(e) => {
                                const newCards = [...section.content.cards];
                                newCards[idx] = { ...card, icon: e.target.value };
                                updateSectionContent(section.id, { cards: newCards });
                              }}
                              placeholder="Icon (emoji)"
                              className="w-16"
                            />
                            <Input
                              value={card.title}
                              onChange={(e) => {
                                const newCards = [...section.content.cards];
                                newCards[idx] = { ...card, title: e.target.value };
                                updateSectionContent(section.id, { cards: newCards });
                              }}
                              placeholder="Title"
                              className="flex-1"
                            />
                          </div>
                          <Textarea
                            value={card.description}
                            onChange={(e) => {
                              const newCards = [...section.content.cards];
                              newCards[idx] = { ...card, description: e.target.value };
                              updateSectionContent(section.id, { cards: newCards });
                            }}
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newCards = [...(section.content.cards || []), { title: '', description: '', icon: '✨' }];
                          updateSectionContent(section.id, { cards: newCards });
                        }}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Capability
                      </Button>
                    </div>
                  )}

                  {section.type === 'testimonials' && (
                    <div className="space-y-4">
                      {(section.content.testimonials || []).map((testimonial: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Testimonial {idx + 1}</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newTestimonials = [...section.content.testimonials];
                                newTestimonials.splice(idx, 1);
                                updateSectionContent(section.id, { testimonials: newTestimonials });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={testimonial.name}
                              onChange={(e) => {
                                const newTestimonials = [...section.content.testimonials];
                                newTestimonials[idx] = { ...testimonial, name: e.target.value };
                                updateSectionContent(section.id, { testimonials: newTestimonials });
                              }}
                              placeholder="Name"
                            />
                            <Input
                              value={testimonial.role}
                              onChange={(e) => {
                                const newTestimonials = [...section.content.testimonials];
                                newTestimonials[idx] = { ...testimonial, role: e.target.value };
                                updateSectionContent(section.id, { testimonials: newTestimonials });
                              }}
                              placeholder="Role"
                            />
                          </div>
                          <Input
                            value={testimonial.company}
                            onChange={(e) => {
                              const newTestimonials = [...section.content.testimonials];
                              newTestimonials[idx] = { ...testimonial, company: e.target.value };
                              updateSectionContent(section.id, { testimonials: newTestimonials });
                            }}
                            placeholder="Company"
                          />
                          <Textarea
                            value={testimonial.quote}
                            onChange={(e) => {
                              const newTestimonials = [...section.content.testimonials];
                              newTestimonials[idx] = { ...testimonial, quote: e.target.value };
                              updateSectionContent(section.id, { testimonials: newTestimonials });
                            }}
                            placeholder="Quote/Review"
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newTestimonials = [...(section.content.testimonials || []), { name: '', role: '', company: '', quote: '', avatar: '' }];
                          updateSectionContent(section.id, { testimonials: newTestimonials });
                        }}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Testimonial
                      </Button>
                    </div>
                  )}

                  {section.type === 'pricing' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input
                          value={section.content.headline || ''}
                          onChange={(e) => updateSectionContent(section.id, { headline: e.target.value })}
                          placeholder="e.g., Simple, Transparent Pricing"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subheadline</Label>
                        <Input
                          value={section.content.subheadline || ''}
                          onChange={(e) => updateSectionContent(section.id, { subheadline: e.target.value })}
                          placeholder="e.g., Start free, upgrade when you need more"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-sm text-muted-foreground">
                          💡 Pricing tiers are configured in the <span className="font-medium text-foreground">Pricing</span> section of this builder.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.type === 'cta' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                          value={section.content.headline || ''}
                          onChange={(e) => updateSectionContent(section.id, { headline: e.target.value })}
                          placeholder="e.g., Ready to Transform Your Business?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subheadline</Label>
                        <Input
                          value={section.content.subheadline || ''}
                          onChange={(e) => updateSectionContent(section.id, { subheadline: e.target.value })}
                          placeholder="e.g., Join thousands of successful businesses"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Primary Button</Label>
                          <Input
                            value={section.content.buttonText || ''}
                            onChange={(e) => updateSectionContent(section.id, { buttonText: e.target.value })}
                            placeholder="Start Your Free Trial"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Button</Label>
                          <Input
                            value={section.content.secondaryButtonText || ''}
                            onChange={(e) => updateSectionContent(section.id, { secondaryButtonText: e.target.value })}
                            placeholder="Schedule a Demo"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {section.type === 'footer' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={section.content.companyName || ''}
                          onChange={(e) => updateSectionContent(section.id, { companyName: e.target.value })}
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input
                          value={section.content.tagline || ''}
                          onChange={(e) => updateSectionContent(section.id, { tagline: e.target.value })}
                          placeholder="Empowering businesses with AI"
                        />
                      </div>
                      
                      {/* Social Links Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <p className="font-medium text-foreground text-sm">Show Social Links</p>
                          <p className="text-xs text-muted-foreground">Display social media icons</p>
                        </div>
                        <Switch
                          checked={section.content.showSocialLinks || false}
                          onCheckedChange={(checked) => updateSectionContent(section.id, { showSocialLinks: checked })}
                        />
                      </div>
                      
                      {/* Social Links Inputs - shown when toggle is enabled */}
                      {section.content.showSocialLinks && (
                        <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                          <Label className="text-sm font-medium">Social Media Links</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-24 text-sm text-muted-foreground">Twitter/X</span>
                              <Input
                                value={section.content.socialLinks?.twitter || ''}
                                onChange={(e) => updateSectionContent(section.id, { 
                                  socialLinks: { ...section.content.socialLinks, twitter: e.target.value }
                                })}
                                placeholder="https://twitter.com/yourbrand"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-24 text-sm text-muted-foreground">Facebook</span>
                              <Input
                                value={section.content.socialLinks?.facebook || ''}
                                onChange={(e) => updateSectionContent(section.id, { 
                                  socialLinks: { ...section.content.socialLinks, facebook: e.target.value }
                                })}
                                placeholder="https://facebook.com/yourbrand"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-24 text-sm text-muted-foreground">Instagram</span>
                              <Input
                                value={section.content.socialLinks?.instagram || ''}
                                onChange={(e) => updateSectionContent(section.id, { 
                                  socialLinks: { ...section.content.socialLinks, instagram: e.target.value }
                                })}
                                placeholder="https://instagram.com/yourbrand"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-24 text-sm text-muted-foreground">LinkedIn</span>
                              <Input
                                value={section.content.socialLinks?.linkedin || ''}
                                onChange={(e) => updateSectionContent(section.id, { 
                                  socialLinks: { ...section.content.socialLinks, linkedin: e.target.value }
                                })}
                                placeholder="https://linkedin.com/company/yourbrand"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-24 text-sm text-muted-foreground">YouTube</span>
                              <Input
                                value={section.content.socialLinks?.youtube || ''}
                                onChange={(e) => updateSectionContent(section.id, { 
                                  socialLinks: { ...section.content.socialLinks, youtube: e.target.value }
                                })}
                                placeholder="https://youtube.com/@yourbrand"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Newsletter Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <p className="font-medium text-foreground text-sm">Show Newsletter Signup</p>
                          <p className="text-xs text-muted-foreground">Include email capture form</p>
                        </div>
                        <Switch
                          checked={section.content.showNewsletter || false}
                          onCheckedChange={(checked) => updateSectionContent(section.id, { showNewsletter: checked })}
                        />
                      </div>
                      
                      {/* Newsletter Configuration - shown when toggle is enabled */}
                      {section.content.showNewsletter && (
                        <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                          <Label className="text-sm font-medium">Newsletter Configuration</Label>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Headline</Label>
                              <Input
                                value={section.content.newsletterHeadline || ''}
                                onChange={(e) => updateSectionContent(section.id, { newsletterHeadline: e.target.value })}
                                placeholder="Stay Updated"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Description</Label>
                              <Input
                                value={section.content.newsletterDescription || ''}
                                onChange={(e) => updateSectionContent(section.id, { newsletterDescription: e.target.value })}
                                placeholder="Get the latest news and updates"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Button Text</Label>
                              <Input
                                value={section.content.newsletterButtonText || ''}
                                onChange={(e) => updateSectionContent(section.id, { newsletterButtonText: e.target.value })}
                                placeholder="Subscribe"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === 'faq' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {(section.content.questions || []).length} questions configured
                      </p>
                      {(section.content.questions || []).map((faq: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Question {idx + 1}</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newQuestions = [...section.content.questions];
                                newQuestions.splice(idx, 1);
                                updateSectionContent(section.id, { questions: newQuestions });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            value={faq.q}
                            onChange={(e) => {
                              const newQuestions = [...section.content.questions];
                              newQuestions[idx] = { ...faq, q: e.target.value };
                              updateSectionContent(section.id, { questions: newQuestions });
                            }}
                            placeholder="Question"
                          />
                          <Textarea
                            value={faq.a}
                            onChange={(e) => {
                              const newQuestions = [...section.content.questions];
                              newQuestions[idx] = { ...faq, a: e.target.value };
                              updateSectionContent(section.id, { questions: newQuestions });
                            }}
                            placeholder="Answer"
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newQuestions = [...(section.content.questions || []), { q: '', a: '' }];
                          updateSectionContent(section.id, { questions: newQuestions });
                        }}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  )}

                  {/* Generate with AI Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateCopy(section.id)}
                    disabled={isGenerating === section.id}
                    className="gap-2"
                  >
                    {isGenerating === section.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate With AI
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Custom Section */}
        <Button variant="outline" className="w-full gap-2 border-dashed">
          <Plus className="h-4 w-4" />
          Add Custom Section
        </Button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Page Configuration
        </Button>
      </div>
    </div>
  );
}
