import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateSelectorProps {
  pageType?: 'websites' | 'funnels' | 'store' | 'products';
}

const TemplateSelector = ({ pageType = 'websites' }: TemplateSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productType, setProductType] = useState<'all' | 'software' | 'product'>('all');
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
    { id: 'nova', name: 'Nova', category: 'Business', description: 'Catchy Headline About Your Services', type: 'software' },
    { id: 'cascade', name: 'Cascade', category: 'Education', description: 'Headline Of Your Academy', type: 'product' },
    { id: 'minerva', name: 'Minerva', category: 'Services', description: 'Catchy Headline About Your Services', type: 'software' },
    { id: 'aurora', name: 'Aurora', category: 'Fashion', description: 'Elevate Your Style Brand', type: 'product' },
    { id: 'zenith', name: 'Zenith', category: 'Photography', description: 'Showcase Your Portfolio', type: 'software' },
    { id: 'harmony', name: 'Harmony', category: 'Personal', description: 'Tell Your Story', type: 'product' },
    { id: 'summit', name: 'Summit', category: 'Real Estate', description: 'Find Your Dream Property', type: 'software' },
    { id: 'palette', name: 'Palette', category: 'Art', description: 'Display Your Creative Work', type: 'product' },
    { id: 'velvet', name: 'Velvet', category: 'Membership', description: 'Exclusive Member Benefits', type: 'software' },
    { id: 'savory', name: 'Savory', category: 'Restaurant', description: 'Delicious Dining Experience', type: 'product' },
    { id: 'bloom', name: 'Bloom', category: 'Services', description: 'Professional Service Solutions', type: 'software' },
    { id: 'echo', name: 'Echo', category: 'Business', description: 'Transform Your Business', type: 'product' }
  ];

  const handleSelect = (templateId: string) => {
    console.log('Selected template:', templateId);
    // Add your selection logic here - navigate to customization page
  };

  const handlePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    // Add your preview logic here - open preview modal or new window
  };

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
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-border"
              >
                {/* Template Preview */}
                <div className="relative bg-gradient-to-br from-sidebar to-sidebar-hover h-64 overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <button className="bg-brand-yellow text-primary px-3 py-1 rounded-md text-xs font-semibold hover:opacity-90 transition-opacity capitalize">
                      {pageType === 'products' ? template.type : 'Template'}
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {template.name}
                  </h3>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSelect(template.id)}
                      className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    >
                      ACTIVATE
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
    </>
  );
};

export default TemplateSelector;
