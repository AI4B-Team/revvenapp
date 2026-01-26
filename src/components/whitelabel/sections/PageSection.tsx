import React, { useState } from 'react';
import { MarketplaceApp, AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Layout,
  Type,
  Star,
  MessageSquare,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSectionItem } from './SortableSectionItem';
import { AddSectionModal } from './AddSectionModal';

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
  onPricingSettingsChange?: (settings: Record<string, any>) => void;
}

type SectionType = 'hero' | 'features' | 'capabilities' | 'credibility' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer';

const sectionIcons: Record<SectionType, React.ElementType> = {
  hero: Layout,
  features: Zap,
  capabilities: Star,
  credibility: ImageIcon,
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
        headline: appName,
        headlineFontSize: '3xl',
        headlineColor: '',
        headlineUnderline: false,
        tagline: tagline,
        description: description,
        buttons: [
          { id: '1', text: 'Get Started', style: 'primary', action: 'anchor', anchorId: 'pricing' },
          { id: '2', text: 'Learn More', style: 'secondary', action: 'anchor', anchorId: 'features' },
        ]
      } 
    },
    { 
      id: 'credibility', 
      type: 'credibility', 
      enabled: true, 
      title: 'Credibility Section', 
      content: { 
        headline: 'Trusted By Industry Leaders',
        logos: [
          { id: '1', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/250px-Google_2015_logo.svg.png', name: 'Google' },
          { id: '2', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png', name: 'Microsoft' },
          { id: '3', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png', name: 'Amazon' },
          { id: '4', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png', name: 'Netflix' },
          { id: '5', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/120px-Tesla_logo.png', name: 'Tesla' },
        ]
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

export function PageSection({ app, license, pageSections: externalSections, onPageSectionsChange, onPricingSettingsChange }: PageSectionProps) {
  const [sections, setSectionsInternal] = useState<PageBlock[]>(() => 
    externalSections || getDefaultSections(app, license)
  );
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

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

  const moveSectionUp = (id: string) => {
    const index = sections.findIndex(s => s.id === id);
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setSections(newSections);
    }
  };

  const moveSectionDown = (id: string) => {
    const index = sections.findIndex(s => s.id === id);
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
    }
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (expandedSection === id) {
      setExpandedSection(null);
    }
    toast.success('Section deleted');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleGenerateCopy = async (sectionId: string) => {
    setIsGenerating(sectionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
            headline: 'Why Choose Us',
            features: [
              { title: 'Smart AI', description: 'Constantly evolving intelligence at your fingertips', icon: '🧠' },
              { title: 'Built for You', description: 'Every agent is designed to serve your specific needs', icon: '🎯' },
              { title: 'Plug & Play', description: 'No setup needed. Just log in and get things done.', icon: '⚡' },
              { title: '24/7 Available', description: 'Get help anytime, anywhere, on any device.', icon: '🌐' }
            ]
          });
          break;
        case 'capabilities':
          updateSectionContent(sectionId, {
            headline: 'What We Offer',
            cards: [
              { title: 'Automation', description: 'Automate repetitive tasks and save hours every week', icon: '🤖' },
              { title: 'Analytics', description: 'Get real-time insights and data-driven decisions', icon: '📊' },
              { title: 'Collaboration', description: 'Work seamlessly with your team in one platform', icon: '👥' },
              { title: 'Integration', description: 'Connect with your favorite tools and workflows', icon: '🔗' }
            ]
          });
          break;
        case 'testimonials':
          updateSectionContent(sectionId, {
            testimonials: [
              { name: 'John Smith', role: 'CEO', company: 'TechVentures', quote: 'Absolutely game-changing. Our productivity doubled in the first month.', avatar: '' },
              { name: 'Lisa Wang', role: 'VP Marketing', company: 'GrowthLabs', quote: 'The AI capabilities are unmatched. Best decision we made this quarter.', avatar: '' },
              { name: 'Mark Johnson', role: 'Founder', company: 'StartupHub', quote: 'Simple to use, powerful results. Highly recommend to any business.', avatar: '' }
            ]
          });
          break;
        case 'pricing':
          updateSectionContent(sectionId, {
            headline: 'Choose Your Plan',
            subheadline: 'Start free, scale when ready'
          });
          break;
        case 'cta':
          updateSectionContent(sectionId, {
            headline: 'Start Your Journey Today',
            subheadline: 'Join 10,000+ businesses already growing with us',
            buttonText: 'Get Started Now',
            secondaryButtonText: 'Talk to Sales'
          });
          break;
        case 'footer':
          updateSectionContent(sectionId, {
            tagline: 'Building the future of business automation'
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section, sectionIndex) => {
              const Icon = sectionIcons[section.type];
              const isExpanded = expandedSection === section.id;
              const isFirst = sectionIndex === 0;
              const isLast = sectionIndex === sections.length - 1;

              return (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  isExpanded={isExpanded}
                  isFirst={isFirst}
                  isLast={isLast}
                  Icon={Icon}
                  onToggle={() => toggleSection(section.id)}
                  onToggleEnabled={() => toggleSectionEnabled(section.id)}
                  onMoveUp={() => moveSectionUp(section.id)}
                  onMoveDown={() => moveSectionDown(section.id)}
                  onDelete={() => deleteSection(section.id)}
                  isGenerating={isGenerating}
                  updateSectionContent={updateSectionContent}
                  handleGenerateCopy={handleGenerateCopy}
                  setIsGenerating={setIsGenerating}
                  onPricingSettingsChange={onPricingSettingsChange}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Add Custom Section */}
        <Button 
          variant="outline" 
          className="w-full gap-2 border-dashed"
          onClick={() => setIsAddSectionModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Add Custom Section
        </Button>

        <AddSectionModal
          open={isAddSectionModalOpen}
          onOpenChange={setIsAddSectionModalOpen}
          onSectionCreated={(newSection) => {
            setSections([...sections, newSection]);
            setExpandedSection(newSection.id);
          }}
          appName={license?.brandSettings?.appName || app.name}
          appDescription={license?.brandSettings?.description || app.description}
        />
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
