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
    // Business
    { id: 'nova', name: 'Nova', category: 'Business', description: 'Catchy Headline About Your Services', type: 'software', color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'echo', name: 'Echo', category: 'Business', description: 'Transform Your Business', type: 'product', color: '#6366F1', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'vertex', name: 'Vertex', category: 'Business', description: 'Scale Your Enterprise', type: 'software', color: '#0EA5E9', gradient: 'from-sky-500 to-blue-600' },
    { id: 'nexus', name: 'Nexus', category: 'Business', description: 'Connect & Collaborate', type: 'product', color: '#1D4ED8', gradient: 'from-blue-700 to-indigo-800' },
    
    // Education
    { id: 'cascade', name: 'Cascade', category: 'Education', description: 'Headline Of Your Academy', type: 'product', color: '#10B981', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'scholar', name: 'Scholar', category: 'Education', description: 'Learn Without Limits', type: 'software', color: '#059669', gradient: 'from-emerald-600 to-green-700' },
    { id: 'wisdom', name: 'Wisdom', category: 'Education', description: 'Knowledge Hub Platform', type: 'product', color: '#0D9488', gradient: 'from-teal-500 to-cyan-600' },
    
    // Fashion
    { id: 'aurora', name: 'Aurora', category: 'Fashion', description: 'Elevate Your Style Brand', type: 'product', color: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
    { id: 'vogue', name: 'Vogue', category: 'Fashion', description: 'Haute Couture Collection', type: 'software', color: '#DB2777', gradient: 'from-pink-600 to-fuchsia-700' },
    { id: 'luxe', name: 'Luxe', category: 'Fashion', description: 'Premium Fashion House', type: 'product', color: '#C026D3', gradient: 'from-fuchsia-600 to-purple-700' },
    { id: 'chic', name: 'Chic', category: 'Fashion', description: 'Modern Style Boutique', type: 'software', color: '#E11D48', gradient: 'from-rose-600 to-pink-700' },
    
    // Photography
    { id: 'zenith', name: 'Zenith', category: 'Photography', description: 'Showcase Your Portfolio', type: 'software', color: '#F59E0B', gradient: 'from-amber-500 to-orange-600' },
    { id: 'lens', name: 'Lens', category: 'Photography', description: 'Capture Every Moment', type: 'product', color: '#D97706', gradient: 'from-amber-600 to-yellow-700' },
    { id: 'shutter', name: 'Shutter', category: 'Photography', description: 'Visual Storytelling', type: 'software', color: '#EA580C', gradient: 'from-orange-600 to-red-700' },
    
    // Personal
    { id: 'harmony', name: 'Harmony', category: 'Personal', description: 'Tell Your Story', type: 'product', color: '#06B6D4', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'persona', name: 'Persona', category: 'Personal', description: 'Your Digital Identity', type: 'software', color: '#0891B2', gradient: 'from-cyan-600 to-teal-700' },
    { id: 'memoir', name: 'Memoir', category: 'Personal', description: 'Share Your Journey', type: 'product', color: '#7C3AED', gradient: 'from-violet-600 to-purple-700' },
    
    // Real Estate
    { id: 'summit', name: 'Summit', category: 'Real Estate', description: 'Find Your Dream Property', type: 'software', color: '#14B8A6', gradient: 'from-teal-500 to-emerald-600' },
    { id: 'manor', name: 'Manor', category: 'Real Estate', description: 'Luxury Living Spaces', type: 'product', color: '#047857', gradient: 'from-emerald-700 to-green-800' },
    { id: 'estate', name: 'Estate', category: 'Real Estate', description: 'Premium Property Listings', type: 'software', color: '#166534', gradient: 'from-green-700 to-emerald-800' },
    
    // Art
    { id: 'palette', name: 'Palette', category: 'Art', description: 'Display Your Creative Work', type: 'product', color: '#F43F5E', gradient: 'from-rose-500 to-pink-600' },
    { id: 'canvas', name: 'Canvas', category: 'Art', description: 'Digital Art Gallery', type: 'software', color: '#DC2626', gradient: 'from-red-600 to-rose-700' },
    { id: 'gallery', name: 'Gallery', category: 'Art', description: 'Curated Art Collections', type: 'product', color: '#9333EA', gradient: 'from-purple-600 to-violet-700' },
    { id: 'atelier', name: 'Atelier', category: 'Art', description: 'Artist Studio Space', type: 'software', color: '#7E22CE', gradient: 'from-purple-700 to-fuchsia-800' },
    
    // Membership
    { id: 'velvet', name: 'Velvet', category: 'Membership', description: 'Exclusive Member Benefits', type: 'software', color: '#A855F7', gradient: 'from-purple-500 to-violet-600' },
    { id: 'elite', name: 'Elite', category: 'Membership', description: 'Premium Access Club', type: 'product', color: '#7C3AED', gradient: 'from-violet-600 to-indigo-700' },
    { id: 'vip', name: 'VIP', category: 'Membership', description: 'Exclusive Members Only', type: 'software', color: '#4F46E5', gradient: 'from-indigo-600 to-blue-700' },
    
    // Restaurant
    { id: 'savory', name: 'Savory', category: 'Restaurant', description: 'Delicious Dining Experience', type: 'product', color: '#EF4444', gradient: 'from-red-500 to-orange-600' },
    { id: 'bistro', name: 'Bistro', category: 'Restaurant', description: 'Fine Dining Excellence', type: 'software', color: '#B91C1C', gradient: 'from-red-700 to-rose-800' },
    { id: 'cuisine', name: 'Cuisine', category: 'Restaurant', description: 'Gourmet Food Journey', type: 'product', color: '#C2410C', gradient: 'from-orange-700 to-red-800' },
    { id: 'tavern', name: 'Tavern', category: 'Restaurant', description: 'Cozy Dining Atmosphere', type: 'software', color: '#92400E', gradient: 'from-amber-800 to-orange-900' },
    
    // Services
    { id: 'minerva', name: 'Minerva', category: 'Services', description: 'Catchy Headline About Your Services', type: 'software', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
    { id: 'bloom', name: 'Bloom', category: 'Services', description: 'Professional Service Solutions', type: 'software', color: '#22C55E', gradient: 'from-green-500 to-emerald-600' },
    { id: 'spark', name: 'Spark', category: 'Services', description: 'Ignite Your Potential', type: 'product', color: '#F97316', gradient: 'from-orange-500 to-amber-600' },
    { id: 'prime', name: 'Prime', category: 'Services', description: 'Premium Service Solutions', type: 'software', color: '#2563EB', gradient: 'from-blue-600 to-indigo-700' },
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
