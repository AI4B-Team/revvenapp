import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Search, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface TemplateSelectorProps {
  pageType?: 'websites' | 'funnels' | 'store' | 'products';
}

const TemplateSelector = ({ pageType = 'websites' }: TemplateSelectorProps) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productType, setProductType] = useState<'all' | 'software' | 'product'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pageConfig = {
    websites: { title: 'WEBSITES', subtitle: 'Start By Selecting A Template' },
    funnels: { title: 'FUNNELS', subtitle: 'Start By Selecting A Template' },
    store: { title: 'STORE', subtitle: 'Start By Selecting A Template' },
    products: { title: 'PRODUCTS', subtitle: 'Ready-To-Sell Products' },
  };

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  const categories = [
    'All',
    'Art',
    'Business',
    'Education',
    'Fashion',
    'Membership',
    'Personal',
    'Photography',
    'Real Estate',
    'Restaurant',
    'Services'
  ];

  const templates = [
    { id: 'nova', name: 'Nova', category: 'Business', description: 'Catchy Headline About Your Services', type: 'software', color: '#3B82F6' },
    { id: 'cascade', name: 'Cascade', category: 'Education', description: 'Headline Of Your Academy', type: 'product', color: '#10B981' },
    { id: 'minerva', name: 'Minerva', category: 'Services', description: 'Catchy Headline About Your Services', type: 'software', color: '#8B5CF6' },
    { id: 'aurora', name: 'Aurora', category: 'Fashion', description: 'Elevate Your Style Brand', type: 'product', color: '#EC4899' },
    { id: 'zenith', name: 'Zenith', category: 'Photography', description: 'Showcase Your Portfolio', type: 'software', color: '#F59E0B' },
    { id: 'harmony', name: 'Harmony', category: 'Personal', description: 'Tell Your Story', type: 'product', color: '#06B6D4' },
    { id: 'summit', name: 'Summit', category: 'Real Estate', description: 'Find Your Dream Property', type: 'software', color: '#14B8A6' },
    { id: 'palette', name: 'Palette', category: 'Art', description: 'Display Your Creative Work', type: 'product', color: '#F43F5E' },
    { id: 'velvet', name: 'Velvet', category: 'Membership', description: 'Exclusive Member Benefits', type: 'software', color: '#A855F7' },
    { id: 'savory', name: 'Savory', category: 'Restaurant', description: 'Delicious Dining Experience', type: 'product', color: '#EF4444' },
    { id: 'bloom', name: 'Bloom', category: 'Services', description: 'Professional Service Solutions', type: 'software', color: '#22C55E' },
    { id: 'echo', name: 'Echo', category: 'Business', description: 'Transform Your Business', type: 'product', color: '#6366F1' }
  ];

  const handleSelect = (templateId: string) => {
    navigate(`/websites/edit/${templateId}`);
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const getPreviewTemplate = () => templates.find(t => t.id === previewTemplate);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesType = pageType === 'products' 
      ? (productType === 'all' || t.type === productType)
      : true;
    return matchesCategory && matchesType;
  });

  return (
    <>
      <div className="min-h-screen bg-background p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {pageConfig[pageType].title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {pageConfig[pageType].subtitle}
              </p>
              
              {/* Product Type Toggle - Only for Products Page */}
              {pageType === 'products' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setProductType('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      productType === 'all'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setProductType('software')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      productType === 'software'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Software
                  </button>
                  <button
                    onClick={() => setProductType('product')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      productType === 'product'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Product
                  </button>
                </div>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2.5 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">{activeCategory}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={activeCategory === category ? 'bg-muted' : ''}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Button */}
              <button className="p-2.5 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Expandable Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className="flex items-center justify-center w-11 h-11 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                {searchExpanded && (
                  <div className="absolute right-0 top-0 flex items-center gap-3 bg-background border border-border rounded-full px-5 py-2.5 shadow-lg animate-in slide-in-from-right z-50">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="bg-transparent outline-none text-sm w-64 text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => {
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-border group"
              >
                {/* Template Preview */}
                <div 
                  className="relative h-64 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${template.color}, ${template.color}cc)` }}
                >
                  {/* Mini preview content */}
                  <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col">
                    <div className="text-white/90 text-sm font-semibold mb-2">{template.name}</div>
                    <div className="text-white/70 text-xs">{template.description}</div>
                    <div className="mt-auto flex gap-2">
                      <div className="w-8 h-1 bg-white/30 rounded" />
                      <div className="w-12 h-1 bg-white/30 rounded" />
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-md text-xs font-semibold">
                      {template.category}
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePreview(template.id)}
                      className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Eye size={16} />
                      Quick Preview
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSelect(template.id)}
                      className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handlePreview(template.id)}
                      className="flex-1 bg-card text-foreground px-6 py-3 rounded-full font-semibold border border-border hover:bg-muted transition-colors"
                    >
                      PREVIEW
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          {getPreviewTemplate() && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{getPreviewTemplate()?.name}</h3>
                  <p className="text-sm text-muted-foreground">{getPreviewTemplate()?.description}</p>
                </div>
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    handleSelect(getPreviewTemplate()?.id || '');
                  }}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Use This Template
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-100">
                {/* Hero Preview */}
                <div 
                  style={{ background: `linear-gradient(135deg, ${getPreviewTemplate()?.color}, ${getPreviewTemplate()?.color}cc)` }}
                  className="p-16 text-center text-white"
                >
                  <h1 className="text-4xl font-bold mb-4">Welcome to {getPreviewTemplate()?.name}</h1>
                  <p className="text-xl mb-6 opacity-90">{getPreviewTemplate()?.description}</p>
                  <button className="bg-white px-6 py-3 rounded-lg font-semibold" style={{ color: getPreviewTemplate()?.color }}>
                    Get Started
                  </button>
                </div>
                
                {/* Features Preview */}
                <div className="p-12 bg-slate-50">
                  <h2 className="text-2xl font-bold text-center mb-8">Our Features</h2>
                  <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {['Fast & Reliable', 'Easy to Use', 'Secure'].map((feature, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ background: `${getPreviewTemplate()?.color}20` }}
                        >
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ background: getPreviewTemplate()?.color }}
                          />
                        </div>
                        <h3 className="font-semibold mb-2">{feature}</h3>
                        <p className="text-sm text-slate-600">Lorem ipsum dolor sit amet consectetur.</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Preview */}
                <div 
                  style={{ background: `linear-gradient(135deg, ${getPreviewTemplate()?.color}, ${getPreviewTemplate()?.color}cc)` }}
                  className="p-12 text-center text-white"
                >
                  <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                  <p className="text-lg mb-6 opacity-90">Join thousands of satisfied customers today</p>
                  <button className="bg-white px-8 py-3 rounded-lg font-semibold" style={{ color: getPreviewTemplate()?.color }}>
                    Start Free Trial
                  </button>
                </div>

                {/* Footer Preview */}
                <div className="p-8 bg-slate-800 text-white text-center">
                  <h3 className="text-lg font-semibold mb-2">{getPreviewTemplate()?.name}</h3>
                  <p className="opacity-70 mb-4">Building the future, one step at a time</p>
                  <p className="text-sm opacity-50">© 2024 All rights reserved</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
