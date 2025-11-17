import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TemplateSelector = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    { id: 'nova', name: 'Nova', category: 'Business', description: 'Catchy Headline About Your Services' },
    { id: 'cascade', name: 'Cascade', category: 'Education', description: 'Headline Of Your Academy' },
    { id: 'minerva', name: 'Minerva', category: 'Services', description: 'Catchy Headline About Your Services' },
    { id: 'aurora', name: 'Aurora', category: 'Fashion', description: 'Elevate Your Style Brand' },
    { id: 'zenith', name: 'Zenith', category: 'Photography', description: 'Showcase Your Portfolio' },
    { id: 'harmony', name: 'Harmony', category: 'Personal', description: 'Tell Your Story' },
    { id: 'summit', name: 'Summit', category: 'Real Estate', description: 'Find Your Dream Property' },
    { id: 'palette', name: 'Palette', category: 'Art', description: 'Display Your Creative Work' },
    { id: 'velvet', name: 'Velvet', category: 'Membership', description: 'Exclusive Member Benefits' },
    { id: 'savory', name: 'Savory', category: 'Restaurant', description: 'Delicious Dining Experience' },
    { id: 'bloom', name: 'Bloom', category: 'Services', description: 'Professional Service Solutions' },
    { id: 'echo', name: 'Echo', category: 'Business', description: 'Transform Your Business' }
  ];

  const handleSelect = (templateId: string) => {
    console.log('Selected template:', templateId);
    // Add your selection logic here - navigate to customization page
  };

  const handlePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    // Add your preview logic here - open preview modal or new window
  };

  const filteredTemplates = activeCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <>
      <div className="min-h-screen bg-background p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                WEBSITES
              </h1>
              <p className="text-muted-foreground text-lg">
                Start By Selecting A Template
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors min-w-[100px]">
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
              <div className="relative flex items-center">
                {!searchExpanded ? (
                  <button
                    onClick={() => setSearchExpanded(true)}
                    className="flex items-center justify-center w-11 h-11 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-2 animate-in slide-in-from-right">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search templates..."
                      className="bg-transparent outline-none text-sm w-64 text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => {
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-border"
              >
                {/* Template Preview */}
                <div className="relative bg-gradient-to-br from-sidebar to-sidebar-hover h-64 overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <button className="bg-brand-yellow text-primary px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      Template
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
                      SELECT
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
