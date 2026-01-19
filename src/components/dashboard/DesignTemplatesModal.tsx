import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, LayoutGrid, FileText, Image, Presentation, Mail, Tag, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  preview: string;
}

interface DesignTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DesignTemplate) => void;
  designType?: string;
}

const designTemplates: DesignTemplate[] = [
  // Logo Templates
  { id: 'logo-1', name: 'Modern Tech Logo', category: 'Logo', prompt: 'Modern minimalist tech startup logo with geometric shapes and gradient blue-purple colors', preview: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=300&fit=crop' },
  { id: 'logo-2', name: 'Elegant Brand Logo', category: 'Logo', prompt: 'Elegant luxury brand logo with gold foil effects and serif typography on dark background', preview: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop' },
  { id: 'logo-3', name: 'Playful Creative Logo', category: 'Logo', prompt: 'Playful colorful logo with hand-drawn elements and vibrant gradient colors', preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop' },
  
  // Business Card Templates
  { id: 'bc-1', name: 'Executive Minimal', category: 'Business Card', prompt: 'Executive business card with white space, embossed gold foil name, and premium paper texture', preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=200&fit=crop' },
  { id: 'bc-2', name: 'Creative Agency', category: 'Business Card', prompt: 'Creative agency business card with bold colors, geometric patterns, and modern typography', preview: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=200&fit=crop' },
  { id: 'bc-3', name: 'Professional Classic', category: 'Business Card', prompt: 'Classic professional business card with navy blue accents, subtle texture, and serif fonts', preview: 'https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?w=300&h=200&fit=crop' },
  
  // Poster Templates
  { id: 'poster-1', name: 'Event Promo', category: 'Poster', prompt: 'Dynamic event poster with bold typography, neon glow effects, and dark moody background', preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop' },
  { id: 'poster-2', name: 'Minimalist Art', category: 'Poster', prompt: 'Minimalist art poster with abstract geometric shapes and pastel color palette', preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=400&fit=crop' },
  { id: 'poster-3', name: 'Retro Vintage', category: 'Poster', prompt: 'Retro vintage poster with worn texture, classic typography, and warm sepia tones', preview: 'https://images.unsplash.com/photo-1514820720301-4c4790309f46?w=300&h=400&fit=crop' },
  
  // Flyer Templates
  { id: 'flyer-1', name: 'Party Night', category: 'Flyer', prompt: 'Club party flyer with vibrant neon colors, glitter effects, and energetic composition', preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=400&fit=crop' },
  { id: 'flyer-2', name: 'Business Promo', category: 'Flyer', prompt: 'Professional business promotion flyer with clean layout, corporate colors, and call-to-action', preview: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=400&fit=crop' },
  { id: 'flyer-3', name: 'Sale Event', category: 'Flyer', prompt: 'Eye-catching sale flyer with bold percentages, red and yellow colors, and urgency elements', preview: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=400&fit=crop' },
  
  // Invitation Templates
  { id: 'inv-1', name: 'Wedding Elegant', category: 'Invitation', prompt: 'Elegant wedding invitation with floral watercolor borders, calligraphy fonts, and rose gold accents', preview: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=300&fit=crop' },
  { id: 'inv-2', name: 'Birthday Party', category: 'Invitation', prompt: 'Fun birthday party invitation with balloons, confetti, and cheerful colorful design', preview: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=300&fit=crop' },
  { id: 'inv-3', name: 'Corporate Event', category: 'Invitation', prompt: 'Sophisticated corporate event invitation with minimalist design and premium finishes', preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop' },
  
  // Thumbnail Templates
  { id: 'thumb-1', name: 'YouTube Tech', category: 'Thumbnail', prompt: 'High-impact YouTube thumbnail with bold text, bright colors, and excited expression', preview: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=170&fit=crop' },
  { id: 'thumb-2', name: 'Tutorial Video', category: 'Thumbnail', prompt: 'Tutorial video thumbnail with step numbers, clean layout, and professional look', preview: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=300&h=170&fit=crop' },
  { id: 'thumb-3', name: 'Podcast Cover', category: 'Thumbnail', prompt: 'Podcast thumbnail with microphone icon, gradient background, and episode title', preview: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=170&fit=crop' },
  
  // Infographic Templates
  { id: 'info-1', name: 'Data Visualization', category: 'Infographic', prompt: 'Modern data infographic with charts, icons, and color-coded sections', preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop' },
  { id: 'info-2', name: 'Process Flow', category: 'Infographic', prompt: 'Step-by-step process infographic with timeline, numbered steps, and connecting lines', preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop' },
  { id: 'info-3', name: 'Comparison Chart', category: 'Infographic', prompt: 'Side-by-side comparison infographic with icons, checkmarks, and clear visual hierarchy', preview: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300&h=400&fit=crop' },
  
  // Brochure Templates
  { id: 'broch-1', name: 'Corporate Profile', category: 'Brochure', prompt: 'Professional corporate brochure with clean layout, brand colors, and high-end imagery', preview: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop' },
  { id: 'broch-2', name: 'Product Catalog', category: 'Brochure', prompt: 'Product catalog brochure with grid layout, product photos, and pricing information', preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop' },
  { id: 'broch-3', name: 'Travel Guide', category: 'Brochure', prompt: 'Travel brochure with stunning destination photos, maps, and itinerary layout', preview: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop' },
  
  // Cover Templates
  { id: 'cover-1', name: 'Book Cover', category: 'Cover', prompt: 'Bestseller book cover with dramatic imagery, bold title treatment, and author name', preview: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop' },
  { id: 'cover-2', name: 'Magazine Cover', category: 'Cover', prompt: 'Fashion magazine cover with stunning photo, headline overlays, and premium layout', preview: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop' },
  { id: 'cover-3', name: 'Album Art', category: 'Cover', prompt: 'Music album cover with artistic visuals, band name, and album title', preview: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=400&fit=crop' },
];

const categories = [
  { id: 'all', name: 'All Templates', icon: LayoutGrid },
  { id: 'Logo', name: 'Logo', icon: Sparkles },
  { id: 'Business Card', name: 'Business Card', icon: FileText },
  { id: 'Poster', name: 'Poster', icon: Image },
  { id: 'Flyer', name: 'Flyer', icon: Tag },
  { id: 'Invitation', name: 'Invitation', icon: Mail },
  { id: 'Thumbnail', name: 'Thumbnail', icon: Presentation },
  { id: 'Infographic', name: 'Infographic', icon: LayoutGrid },
  { id: 'Brochure', name: 'Brochure', icon: BookOpen },
  { id: 'Cover', name: 'Cover', icon: Image },
];

const DesignTemplatesModal = ({ isOpen, onClose, onSelectTemplate, designType }: DesignTemplatesModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(designType || 'all');

  // Filter templates based on search and category
  const filteredTemplates = designTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: DesignTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green" />
            Design Templates
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 h-[calc(85vh-120px)]">
          {/* Sidebar - Categories */}
          <div className="w-48 flex-shrink-0 border-r border-border pr-4">
            <div className="space-y-1">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-brand-green/10 text-brand-green'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            
            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group relative rounded-xl overflow-hidden border border-border bg-secondary hover:border-brand-green transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-foreground truncate">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
                      </div>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                          Use Template
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <LayoutGrid className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No templates found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignTemplatesModal;
