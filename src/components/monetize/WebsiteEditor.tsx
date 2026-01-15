import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Eye, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Type, 
  Image, 
  Palette, 
  Layout, 
  Settings,
  Plus,
  Trash2,
  Move,
  Copy,
  Undo,
  Redo,
  Code,
  ExternalLink,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Section {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'footer' | 'about' | 'pricing' | 'gallery';
  content: Record<string, string>;
}

interface WebsiteData {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  sections: Section[];
}

const defaultSections: Record<string, Section> = {
  hero: {
    id: 'hero-1',
    type: 'hero',
    content: {
      headline: 'Welcome to Your Amazing Website',
      subheadline: 'Build something extraordinary with our powerful platform',
      buttonText: 'Get Started',
      buttonLink: '#'
    }
  },
  features: {
    id: 'features-1',
    type: 'features',
    content: {
      title: 'Our Features',
      feature1Title: 'Fast & Reliable',
      feature1Desc: 'Lightning-fast performance you can count on',
      feature2Title: 'Easy to Use',
      feature2Desc: 'Intuitive interface for seamless experience',
      feature3Title: 'Secure',
      feature3Desc: 'Enterprise-grade security for your peace of mind'
    }
  },
  testimonials: {
    id: 'testimonials-1',
    type: 'testimonials',
    content: {
      title: 'What Our Customers Say',
      quote1: 'This product changed my life!',
      author1: 'John Doe, CEO',
      quote2: 'Absolutely incredible experience.',
      author2: 'Jane Smith, Designer'
    }
  },
  cta: {
    id: 'cta-1',
    type: 'cta',
    content: {
      headline: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today',
      buttonText: 'Start Free Trial'
    }
  },
  about: {
    id: 'about-1',
    type: 'about',
    content: {
      title: 'About Us',
      description: 'We are a team of passionate individuals dedicated to creating amazing products.',
      mission: 'Our mission is to empower businesses with cutting-edge solutions.'
    }
  },
  pricing: {
    id: 'pricing-1',
    type: 'pricing',
    content: {
      title: 'Simple Pricing',
      plan1Name: 'Starter',
      plan1Price: '$9/mo',
      plan1Features: 'Basic features, Email support',
      plan2Name: 'Pro',
      plan2Price: '$29/mo',
      plan2Features: 'All features, Priority support',
      plan3Name: 'Enterprise',
      plan3Price: 'Custom',
      plan3Features: 'Custom solutions, Dedicated support'
    }
  },
  gallery: {
    id: 'gallery-1',
    type: 'gallery',
    content: {
      title: 'Our Work',
      description: 'Check out some of our amazing projects'
    }
  },
  footer: {
    id: 'footer-1',
    type: 'footer',
    content: {
      companyName: 'Your Company',
      tagline: 'Building the future, one step at a time',
      copyright: '© 2024 All rights reserved'
    }
  }
};

const templateConfigs: Record<string, WebsiteData> = {
  nova: {
    name: 'Nova',
    description: 'Modern business template',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.cta, defaultSections.footer]
  },
  cascade: {
    name: 'Cascade',
    description: 'Education template',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    fontFamily: 'Poppins',
    sections: [defaultSections.hero, defaultSections.about, defaultSections.features, defaultSections.testimonials, defaultSections.footer]
  },
  minerva: {
    name: 'Minerva',
    description: 'Services template',
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    fontFamily: 'Inter',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.pricing, defaultSections.cta, defaultSections.footer]
  },
  aurora: {
    name: 'Aurora',
    description: 'Fashion template',
    primaryColor: '#EC4899',
    secondaryColor: '#DB2777',
    fontFamily: 'Playfair Display',
    sections: [defaultSections.hero, defaultSections.gallery, defaultSections.testimonials, defaultSections.footer]
  },
  zenith: {
    name: 'Zenith',
    description: 'Photography template',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    fontFamily: 'Montserrat',
    sections: [defaultSections.hero, defaultSections.gallery, defaultSections.about, defaultSections.cta, defaultSections.footer]
  },
  harmony: {
    name: 'Harmony',
    description: 'Personal template',
    primaryColor: '#06B6D4',
    secondaryColor: '#0891B2',
    fontFamily: 'Lato',
    sections: [defaultSections.hero, defaultSections.about, defaultSections.testimonials, defaultSections.footer]
  },
  summit: {
    name: 'Summit',
    description: 'Real Estate template',
    primaryColor: '#14B8A6',
    secondaryColor: '#0D9488',
    fontFamily: 'Roboto',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.gallery, defaultSections.cta, defaultSections.footer]
  },
  palette: {
    name: 'Palette',
    description: 'Art template',
    primaryColor: '#F43F5E',
    secondaryColor: '#E11D48',
    fontFamily: 'Playfair Display',
    sections: [defaultSections.hero, defaultSections.gallery, defaultSections.about, defaultSections.footer]
  },
  velvet: {
    name: 'Velvet',
    description: 'Membership template',
    primaryColor: '#A855F7',
    secondaryColor: '#9333EA',
    fontFamily: 'Inter',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.pricing, defaultSections.testimonials, defaultSections.footer]
  },
  savory: {
    name: 'Savory',
    description: 'Restaurant template',
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    fontFamily: 'Lora',
    sections: [defaultSections.hero, defaultSections.about, defaultSections.gallery, defaultSections.cta, defaultSections.footer]
  },
  bloom: {
    name: 'Bloom',
    description: 'Services template',
    primaryColor: '#22C55E',
    secondaryColor: '#16A34A',
    fontFamily: 'Nunito',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.pricing, defaultSections.testimonials, defaultSections.cta, defaultSections.footer]
  },
  echo: {
    name: 'Echo',
    description: 'Business template',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    fontFamily: 'Inter',
    sections: [defaultSections.hero, defaultSections.features, defaultSections.about, defaultSections.cta, defaultSections.footer]
  }
};

const sectionTypes = [
  { type: 'hero', label: 'Hero Section', icon: Layout },
  { type: 'features', label: 'Features', icon: Layout },
  { type: 'about', label: 'About', icon: Type },
  { type: 'testimonials', label: 'Testimonials', icon: Type },
  { type: 'pricing', label: 'Pricing', icon: Layout },
  { type: 'gallery', label: 'Gallery', icon: Image },
  { type: 'cta', label: 'Call to Action', icon: Layout },
  { type: 'footer', label: 'Footer', icon: Layout },
];

const WebsiteEditor = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  
  const initialData = templateConfigs[templateId || 'nova'] || templateConfigs.nova;
  
  const [websiteData, setWebsiteData] = useState<WebsiteData>({
    ...initialData,
    sections: initialData.sections.map(s => ({ ...s, id: `${s.type}-${Date.now()}-${Math.random()}` }))
  });
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePanel, setActivePanel] = useState<'sections' | 'style' | 'settings'>('sections');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSectionContent = (sectionId: string, field: string, value: string) => {
    setWebsiteData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, [field]: value } }
          : s
      )
    }));
  };

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      ...defaultSections[type],
      id: `${type}-${Date.now()}`
    };
    setWebsiteData(prev => ({
      ...prev,
      sections: [...prev.sections.slice(0, -1), newSection, prev.sections[prev.sections.length - 1]]
    }));
    setShowAddSection(false);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} section added`);
  };

  const removeSection = (sectionId: string) => {
    setWebsiteData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    setSelectedSection(null);
    toast.success('Section removed');
  };

  const duplicateSection = (sectionId: string) => {
    const section = websiteData.sections.find(s => s.id === sectionId);
    if (section) {
      const newSection = { ...section, id: `${section.type}-${Date.now()}` };
      const index = websiteData.sections.findIndex(s => s.id === sectionId);
      setWebsiteData(prev => ({
        ...prev,
        sections: [
          ...prev.sections.slice(0, index + 1),
          newSection,
          ...prev.sections.slice(index + 1)
        ]
      }));
      toast.success('Section duplicated');
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = websiteData.sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === websiteData.sections.length - 1)
    ) return;

    const newSections = [...websiteData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setWebsiteData(prev => ({ ...prev, sections: newSections }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Website saved successfully!');
  };

  const generateHTML = () => {
    const { name, primaryColor, secondaryColor, fontFamily, sections } = websiteData;
    
    const sectionsHTML = sections.map(section => {
      switch (section.type) {
        case 'hero':
          return `
    <section class="hero" style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 100px 20px; text-align: center; color: white;">
      <h1 style="font-size: 3rem; margin-bottom: 20px;">${section.content.headline}</h1>
      <p style="font-size: 1.25rem; margin-bottom: 30px; opacity: 0.9;">${section.content.subheadline}</p>
      <a href="${section.content.buttonLink}" style="background: white; color: ${primaryColor}; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">${section.content.buttonText}</a>
    </section>`;
        case 'features':
          return `
    <section class="features" style="padding: 80px 20px; background: #f8fafc;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 50px;">${section.content.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: ${primaryColor}; margin-bottom: 10px;">${section.content.feature1Title}</h3>
          <p style="color: #64748b;">${section.content.feature1Desc}</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: ${primaryColor}; margin-bottom: 10px;">${section.content.feature2Title}</h3>
          <p style="color: #64748b;">${section.content.feature2Desc}</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: ${primaryColor}; margin-bottom: 10px;">${section.content.feature3Title}</h3>
          <p style="color: #64748b;">${section.content.feature3Desc}</p>
        </div>
      </div>
    </section>`;
        case 'testimonials':
          return `
    <section class="testimonials" style="padding: 80px 20px; background: white;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 50px;">${section.content.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 900px; margin: 0 auto;">
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 4px solid ${primaryColor};">
          <p style="font-style: italic; margin-bottom: 15px;">"${section.content.quote1}"</p>
          <p style="color: ${primaryColor}; font-weight: 600;">— ${section.content.author1}</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 4px solid ${primaryColor};">
          <p style="font-style: italic; margin-bottom: 15px;">"${section.content.quote2}"</p>
          <p style="color: ${primaryColor}; font-weight: 600;">— ${section.content.author2}</p>
        </div>
      </div>
    </section>`;
        case 'cta':
          return `
    <section class="cta" style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 80px 20px; text-align: center; color: white;">
      <h2 style="font-size: 2.5rem; margin-bottom: 20px;">${section.content.headline}</h2>
      <p style="font-size: 1.125rem; margin-bottom: 30px; opacity: 0.9;">${section.content.description}</p>
      <a href="#" style="background: white; color: ${primaryColor}; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">${section.content.buttonText}</a>
    </section>`;
        case 'about':
          return `
    <section class="about" style="padding: 80px 20px; background: white;">
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2rem; margin-bottom: 30px; color: ${primaryColor};">${section.content.title}</h2>
        <p style="font-size: 1.125rem; color: #64748b; margin-bottom: 20px;">${section.content.description}</p>
        <p style="font-size: 1rem; color: #94a3b8;">${section.content.mission}</p>
      </div>
    </section>`;
        case 'pricing':
          return `
    <section class="pricing" style="padding: 80px 20px; background: #f8fafc;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 50px;">${section.content.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto;">
        <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: ${primaryColor};">${section.content.plan1Name}</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 20px 0;">${section.content.plan1Price}</p>
          <p style="color: #64748b;">${section.content.plan1Features}</p>
        </div>
        <div style="background: ${primaryColor}; color: white; padding: 40px; border-radius: 12px; text-align: center; transform: scale(1.05);">
          <h3>${section.content.plan2Name}</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 20px 0;">${section.content.plan2Price}</p>
          <p style="opacity: 0.9;">${section.content.plan2Features}</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: ${primaryColor};">${section.content.plan3Name}</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 20px 0;">${section.content.plan3Price}</p>
          <p style="color: #64748b;">${section.content.plan3Features}</p>
        </div>
      </div>
    </section>`;
        case 'gallery':
          return `
    <section class="gallery" style="padding: 80px 20px; background: white;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">${section.content.title}</h2>
      <p style="text-align: center; color: #64748b; margin-bottom: 40px;">${section.content.description}</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20); height: 200px; border-radius: 12px;"></div>
        <div style="background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20); height: 200px; border-radius: 12px;"></div>
        <div style="background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20); height: 200px; border-radius: 12px;"></div>
        <div style="background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20); height: 200px; border-radius: 12px;"></div>
      </div>
    </section>`;
        case 'footer':
          return `
    <footer style="background: #1e293b; color: white; padding: 60px 20px; text-align: center;">
      <h3 style="font-size: 1.5rem; margin-bottom: 10px;">${section.content.companyName}</h3>
      <p style="opacity: 0.7; margin-bottom: 30px;">${section.content.tagline}</p>
      <p style="opacity: 0.5; font-size: 0.875rem;">${section.content.copyright}</p>
    </footer>`;
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: '${fontFamily}', sans-serif; line-height: 1.6; }
    a { transition: opacity 0.2s; }
    a:hover { opacity: 0.8; }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
  };

  const handleDownload = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Website downloaded successfully!');
    setShowExportModal(false);
  };

  const handlePreview = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-full';
    }
  };

  const selectedSectionData = websiteData.sections.find(s => s.id === selectedSection);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate('/websites')} className="mb-3">
            <ArrowLeft size={16} className="mr-2" />
            Back to Templates
          </Button>
          <h2 className="font-semibold text-lg">{websiteData.name}</h2>
          <p className="text-sm text-muted-foreground">{websiteData.description}</p>
        </div>

        {/* Panel Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActivePanel('sections')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'sections' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Layout size={16} className="inline mr-1" />
            Sections
          </button>
          <button
            onClick={() => setActivePanel('style')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'style' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Palette size={16} className="inline mr-1" />
            Style
          </button>
          <button
            onClick={() => setActivePanel('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'settings' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Settings size={16} className="inline mr-1" />
            Settings
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === 'sections' && (
            <div className="space-y-2">
              {websiteData.sections.map((section, index) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSection === section.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{section.type}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                        className="p-1 hover:bg-muted rounded"
                        disabled={index === 0}
                      >
                        <Move size={12} className="rotate-180" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                        className="p-1 hover:bg-muted rounded"
                        disabled={index === websiteData.sections.length - 1}
                      >
                        <Move size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setShowAddSection(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Section
              </Button>
            </div>
          )}

          {activePanel === 'style' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={websiteData.primaryColor}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={websiteData.primaryColor}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={websiteData.secondaryColor}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={websiteData.secondaryColor}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Font Family</label>
                <select
                  value={websiteData.fontFamily}
                  onChange={(e) => setWebsiteData(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Lato">Lato</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Lora">Lora</option>
                </select>
              </div>
            </div>
          )}

          {activePanel === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Website Name</label>
                <Input
                  value={websiteData.name}
                  onChange={(e) => setWebsiteData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={websiteData.description}
                  onChange={(e) => setWebsiteData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Undo size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-background shadow-sm' : ''}`}
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-background shadow-sm' : ''}`}
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-background shadow-sm' : ''}`}
            >
              <Smartphone size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" onClick={() => setShowExportModal(true)}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/50 p-8">
          <div className={`mx-auto bg-white shadow-xl rounded-lg overflow-hidden transition-all ${getViewportWidth()}`}>
            {websiteData.sections.map(section => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`relative cursor-pointer transition-all ${
                  selectedSection === section.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'
                }`}
              >
                {/* Section Preview */}
                {section.type === 'hero' && (
                  <div 
                    style={{ background: `linear-gradient(135deg, ${websiteData.primaryColor}, ${websiteData.secondaryColor})` }}
                    className="p-16 text-center text-white"
                  >
                    <h1 className="text-4xl font-bold mb-4">{section.content.headline}</h1>
                    <p className="text-xl mb-6 opacity-90">{section.content.subheadline}</p>
                    <button className="bg-white px-6 py-3 rounded-lg font-semibold" style={{ color: websiteData.primaryColor }}>
                      {section.content.buttonText}
                    </button>
                  </div>
                )}
                
                {section.type === 'features' && (
                  <div className="p-12 bg-slate-50">
                    <h2 className="text-2xl font-bold text-center mb-8">{section.content.title}</h2>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-semibold mb-2" style={{ color: websiteData.primaryColor }}>{section.content.feature1Title}</h3>
                        <p className="text-sm text-slate-600">{section.content.feature1Desc}</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-semibold mb-2" style={{ color: websiteData.primaryColor }}>{section.content.feature2Title}</h3>
                        <p className="text-sm text-slate-600">{section.content.feature2Desc}</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-semibold mb-2" style={{ color: websiteData.primaryColor }}>{section.content.feature3Title}</h3>
                        <p className="text-sm text-slate-600">{section.content.feature3Desc}</p>
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'testimonials' && (
                  <div className="p-12 bg-white">
                    <h2 className="text-2xl font-bold text-center mb-8">{section.content.title}</h2>
                    <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                      <div className="bg-slate-50 p-6 rounded-xl" style={{ borderLeft: `4px solid ${websiteData.primaryColor}` }}>
                        <p className="italic mb-3">"{section.content.quote1}"</p>
                        <p className="font-semibold" style={{ color: websiteData.primaryColor }}>— {section.content.author1}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-xl" style={{ borderLeft: `4px solid ${websiteData.primaryColor}` }}>
                        <p className="italic mb-3">"{section.content.quote2}"</p>
                        <p className="font-semibold" style={{ color: websiteData.primaryColor }}>— {section.content.author2}</p>
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'cta' && (
                  <div 
                    style={{ background: `linear-gradient(135deg, ${websiteData.primaryColor}, ${websiteData.secondaryColor})` }}
                    className="p-12 text-center text-white"
                  >
                    <h2 className="text-3xl font-bold mb-4">{section.content.headline}</h2>
                    <p className="text-lg mb-6 opacity-90">{section.content.description}</p>
                    <button className="bg-white px-8 py-3 rounded-lg font-semibold" style={{ color: websiteData.primaryColor }}>
                      {section.content.buttonText}
                    </button>
                  </div>
                )}

                {section.type === 'about' && (
                  <div className="p-12 bg-white text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: websiteData.primaryColor }}>{section.content.title}</h2>
                    <p className="text-lg text-slate-600 mb-4 max-w-2xl mx-auto">{section.content.description}</p>
                    <p className="text-slate-500 max-w-2xl mx-auto">{section.content.mission}</p>
                  </div>
                )}

                {section.type === 'pricing' && (
                  <div className="p-12 bg-slate-50">
                    <h2 className="text-2xl font-bold text-center mb-8">{section.content.title}</h2>
                    <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                        <h3 className="font-semibold mb-2" style={{ color: websiteData.primaryColor }}>{section.content.plan1Name}</h3>
                        <p className="text-3xl font-bold my-4">{section.content.plan1Price}</p>
                        <p className="text-sm text-slate-600">{section.content.plan1Features}</p>
                      </div>
                      <div className="p-8 rounded-xl text-center text-white transform scale-105" style={{ background: websiteData.primaryColor }}>
                        <h3 className="font-semibold mb-2">{section.content.plan2Name}</h3>
                        <p className="text-3xl font-bold my-4">{section.content.plan2Price}</p>
                        <p className="text-sm opacity-90">{section.content.plan2Features}</p>
                      </div>
                      <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                        <h3 className="font-semibold mb-2" style={{ color: websiteData.primaryColor }}>{section.content.plan3Name}</h3>
                        <p className="text-3xl font-bold my-4">{section.content.plan3Price}</p>
                        <p className="text-sm text-slate-600">{section.content.plan3Features}</p>
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'gallery' && (
                  <div className="p-12 bg-white">
                    <h2 className="text-2xl font-bold text-center mb-4">{section.content.title}</h2>
                    <p className="text-center text-slate-600 mb-8">{section.content.description}</p>
                    <div className="grid grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => (
                        <div 
                          key={i}
                          className="aspect-square rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${websiteData.primaryColor}20, ${websiteData.secondaryColor}20)` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {section.type === 'footer' && (
                  <div className="p-12 bg-slate-800 text-white text-center">
                    <h3 className="text-xl font-semibold mb-2">{section.content.companyName}</h3>
                    <p className="opacity-70 mb-6">{section.content.tagline}</p>
                    <p className="text-sm opacity-50">{section.content.copyright}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Section Editor */}
      {selectedSectionData && (
        <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold capitalize">{selectedSectionData.type} Section</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => duplicateSection(selectedSectionData.id)}>
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeSection(selectedSectionData.id)} className="text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(selectedSectionData.content).map(([key, value]) => (
              <div key={key}>
                <label className="text-sm font-medium mb-2 block capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {value.length > 50 ? (
                  <Textarea
                    value={value}
                    onChange={(e) => updateSectionContent(selectedSectionData.id, key, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => updateSectionContent(selectedSectionData.id, key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {sectionTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addSection(type as Section['type'])}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Icon size={20} className="text-primary" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Website</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Download HTML</h4>
                <p className="text-sm text-muted-foreground">Get a single HTML file ready to deploy</p>
              </div>
            </button>
            <button
              onClick={handlePreview}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ExternalLink size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Preview in Browser</h4>
                <p className="text-sm text-muted-foreground">Open the website in a new tab</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsiteEditor;
