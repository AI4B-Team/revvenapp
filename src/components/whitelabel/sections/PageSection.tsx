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

interface PageSectionProps {
  app: MarketplaceApp;
  license?: AppLicense;
}

type SectionType = 'hero' | 'features' | 'capabilities' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer';

interface PageBlock {
  id: string;
  type: SectionType;
  enabled: boolean;
  title: string;
  content: Record<string, any>;
}

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

const defaultSections: PageBlock[] = [
  { id: 'hero', type: 'hero', enabled: true, title: 'Hero Section', content: { badge: 'AI-Powered', tagline: '', description: '' } },
  { id: 'features', type: 'features', enabled: true, title: 'Features Section', content: { features: [] } },
  { id: 'capabilities', type: 'capabilities', enabled: true, title: 'Capabilities Section', content: { cards: [] } },
  { id: 'testimonials', type: 'testimonials', enabled: false, title: 'Testimonials', content: { testimonials: [] } },
  { id: 'pricing', type: 'pricing', enabled: true, title: 'Pricing Section', content: {} },
  { id: 'faq', type: 'faq', enabled: true, title: 'FAQ Section', content: { questions: [] } },
  { id: 'cta', type: 'cta', enabled: true, title: 'Call To Action', content: {} },
  { id: 'footer', type: 'footer', enabled: true, title: 'Footer', content: {} },
];

export function PageSection({ app, license }: PageSectionProps) {
  const [sections, setSections] = useState<PageBlock[]>(defaultSections);
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Landing Page Builder</h2>
          <p className="text-muted-foreground mt-1">
            Configure and customize your sales page sections
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview Page
        </Button>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 rounded-xl border-2 border-border bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Live Preview</span>
        </div>
        <div className="aspect-video rounded-lg bg-background border border-border flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Page preview will appear here</p>
        </div>
      </div>

      {/* Section List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Page Sections</h3>
          <span className="text-sm text-muted-foreground">
            {sections.filter(s => s.enabled).length} of {sections.length} enabled
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
                    </>
                  )}

                  {section.type === 'features' && (
                    <div className="space-y-4">
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

                  {section.type === 'faq' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {(section.content.questions || []).length} of 5 questions
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
