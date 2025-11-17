import { useState } from 'react';
import { SlidersHorizontal, Search, ZoomIn, ZoomOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

const TemplateSelector = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [zoom, setZoom] = useState(100);

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
    {
      id: 'nova',
      name: 'Nova',
      category: 'business',
      description: 'Catchy Headline About Your Services',
    },
    {
      id: 'cascade',
      name: 'Cascade',
      category: 'academy',
      description: 'Headline Of Your Academy',
    },
    {
      id: 'minerva',
      name: 'Minerva',
      category: 'services',
      description: 'Catchy Headline About Your Services',
    }
  ];

  const handleSelect = (templateId: string) => {
    console.log('Selected template:', templateId);
    // Add your selection logic here - navigate to customization page
  };

  const handlePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    // Add your preview logic here - open preview modal or new window
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Websites
            </h1>
            <p className="text-muted-foreground text-lg">
              Start By Selecting A Template
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm font-medium">{activeCategory}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
            <button className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={50}
                max={150}
                step={10}
                className="w-24"
              />
              <button 
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
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
                  {/* Mockup Hero Section */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-sidebar-text">
                    <div className="absolute top-4 right-4 text-xs text-sidebar-text-muted">
                      Company
                    </div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow rounded-full opacity-20 blur-3xl" />
                    <h3 className="text-2xl font-bold text-center mb-4 relative z-10">
                      {template.description}
                    </h3>
                    <button className="bg-brand-yellow text-primary px-6 py-2 rounded-lg font-semibold relative z-10 hover:opacity-90 transition-opacity">
                      Get Started
                    </button>
                  </div>
                  
                  {/* Thumbnail Images Section */}
                  <div className="absolute bottom-0 left-0 right-0 bg-sidebar/80 p-4">
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-20 h-16 bg-sidebar-hover rounded border border-border"
                        />
                      ))}
                    </div>
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
  );
};

export default TemplateSelector;
