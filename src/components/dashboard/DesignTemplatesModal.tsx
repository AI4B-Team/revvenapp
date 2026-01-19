import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, LayoutGrid, FileText, Image, Presentation, Mail, Tag, BookOpen, Crown, Zap, Star } from 'lucide-react';
import { useState, useMemo, memo } from 'react';

// Import template images
import logoNeonCyber from '@/assets/templates/logo-neon-cyber.jpg';
import logoLuxuryGold from '@/assets/templates/logo-luxury-gold.jpg';
import logoAurora from '@/assets/templates/logo-aurora.jpg';
import bcExecutive from '@/assets/templates/bc-executive.jpg';
import bcCreative from '@/assets/templates/bc-creative.jpg';
import bcMarble from '@/assets/templates/bc-marble.jpg';
import posterSynthwave from '@/assets/templates/poster-synthwave.jpg';
import posterBrutalist from '@/assets/templates/poster-brutalist.jpg';
import posterCosmic from '@/assets/templates/poster-cosmic.jpg';
import flyerRave from '@/assets/templates/flyer-rave.jpg';
import flyerCorporate from '@/assets/templates/flyer-corporate.jpg';
import flyerSale from '@/assets/templates/flyer-sale.jpg';
import invBotanical from '@/assets/templates/inv-botanical.jpg';
import invPopart from '@/assets/templates/inv-popart.jpg';
import invGala from '@/assets/templates/inv-gala.jpg';
import thumbViral from '@/assets/templates/thumb-viral.jpg';
import thumbTutorial from '@/assets/templates/thumb-tutorial.jpg';
import thumbPodcast from '@/assets/templates/thumb-podcast.jpg';
import infoDashboard from '@/assets/templates/info-dashboard.jpg';
import infoJourney from '@/assets/templates/info-journey.jpg';
import infoVersus from '@/assets/templates/info-versus.jpg';
import brochCorporate from '@/assets/templates/broch-corporate.jpg';
import brochCatalog from '@/assets/templates/broch-catalog.jpg';
import brochTravel from '@/assets/templates/broch-travel.jpg';
import coverBestseller from '@/assets/templates/cover-bestseller.jpg';
import coverVogue from '@/assets/templates/cover-vogue.jpg';
import coverAlbum from '@/assets/templates/cover-album.jpg';

interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  preview: string;
  isPremium?: boolean;
  isNew?: boolean;
}

interface DesignTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DesignTemplate) => void;
  designType?: string;
}

const designTemplates: DesignTemplate[] = [
  // Logo Templates - Premium & Dynamic
  { 
    id: 'logo-1', 
    name: 'Neon Cyber Logo', 
    category: 'Logo', 
    prompt: 'Ultra-premium cyberpunk logo with holographic chrome finish, neon magenta and electric cyan gradients, floating 3D geometric elements, glass morphism effects, dark obsidian background with particle effects, cinematic lighting with volumetric rays', 
    preview: logoNeonCyber,
    isPremium: true,
    isNew: true
  },
  { 
    id: 'logo-2', 
    name: 'Luxury Gold Emblem', 
    category: 'Logo', 
    prompt: 'Opulent luxury emblem logo with 24k gold foil texture, intricate filigree patterns, raised 3D embossing effect, deep black velvet background, diamond dust sparkle accents, royal serif typography with metallic sheen', 
    preview: logoLuxuryGold,
    isPremium: true
  },
  { 
    id: 'logo-3', 
    name: 'Aurora Gradient', 
    category: 'Logo', 
    prompt: 'Mesmerizing aurora borealis gradient logo with flowing liquid metal typography, iridescent pearl finish, soft ethereal glow effects, crystalline geometric accents, dreamy pastel to deep violet color transitions', 
    preview: logoAurora,
    isNew: true
  },
  
  // Business Card Templates - Premium & Stylish
  { 
    id: 'bc-1', 
    name: 'Executive Prestige', 
    category: 'Business Card', 
    prompt: 'Ultra-premium executive business card with black titanium finish, rose gold foil debossing, soft-touch matte texture, holographic security stripe, minimalist Swiss typography, architectural line patterns', 
    preview: bcExecutive,
    isPremium: true
  },
  { 
    id: 'bc-2', 
    name: 'Creative Prism', 
    category: 'Business Card', 
    prompt: 'Bold creative agency card with holographic rainbow prism effect, transparent acrylic material appearance, floating 3D elements, gradient mesh backgrounds, avant-garde asymmetric layout, neon accent highlights', 
    preview: bcCreative,
    isNew: true
  },
  { 
    id: 'bc-3', 
    name: 'Marble Luxe', 
    category: 'Business Card', 
    prompt: 'Sophisticated marble texture business card with gold vein details, premium weight cardstock appearance, copper foil accents, elegant serif typography, museum-quality minimalist design', 
    preview: bcMarble
  },
  
  // Poster Templates - Dynamic & Cinematic
  { 
    id: 'poster-1', 
    name: 'Synthwave Nights', 
    category: 'Poster', 
    prompt: 'Epic synthwave poster with retro-futuristic chrome typography, sunset gradient sky with grid mountains, neon palm silhouettes, VHS glitch effects, purple and hot pink color scheme, 80s nostalgia aesthetic with modern polish', 
    preview: posterSynthwave,
    isPremium: true,
    isNew: true
  },
  { 
    id: 'poster-2', 
    name: 'Brutalist Art', 
    category: 'Poster', 
    prompt: 'High-fashion brutalist poster with bold geometric blocks, stark contrast black and white with single accent color, industrial concrete textures, experimental typography, avant-garde museum exhibition style', 
    preview: posterBrutalist
  },
  { 
    id: 'poster-3', 
    name: 'Cosmic Journey', 
    category: 'Poster', 
    prompt: 'Breathtaking cosmic poster with nebula clouds, holographic planet rings, stardust particle effects, ethereal gradient backgrounds, futuristic chrome typography, space exploration cinematic atmosphere', 
    preview: posterCosmic,
    isPremium: true
  },
  
  // Flyer Templates - Eye-catching & Modern
  { 
    id: 'flyer-1', 
    name: 'Neon Rave', 
    category: 'Flyer', 
    prompt: 'Explosive neon rave flyer with laser beam effects, holographic metallic surfaces, UV glow typography, liquid chrome drips, cyberpunk club aesthetic, electric blue and hot pink gradients, fog machine atmosphere', 
    preview: flyerRave,
    isNew: true
  },
  { 
    id: 'flyer-2', 
    name: 'Corporate Elite', 
    category: 'Flyer', 
    prompt: 'Premium corporate flyer with frosted glass panels, subtle gradient mesh, executive gold accents, architectural photography integration, sophisticated sans-serif typography, luxury real estate aesthetic', 
    preview: flyerCorporate,
    isPremium: true
  },
  { 
    id: 'flyer-3', 
    name: 'Flash Sale Blitz', 
    category: 'Flyer', 
    prompt: 'High-impact sale flyer with explosive starburst effects, 3D extruded text, chrome metallic percentages, dynamic motion blur, electric energy bolts, urgent countdown timer graphics, premium retail aesthetic', 
    preview: flyerSale
  },
  
  // Invitation Templates - Elegant & Sophisticated
  { 
    id: 'inv-1', 
    name: 'Botanical Luxe', 
    category: 'Invitation', 
    prompt: 'Exquisite wedding invitation with hand-painted botanical illustrations, watercolor wash backgrounds, gold leaf accents, luxury cotton paper texture, romantic calligraphy, soft blush and sage color palette, pressed flower details', 
    preview: invBotanical,
    isPremium: true
  },
  { 
    id: 'inv-2', 
    name: 'Party Pop Art', 
    category: 'Invitation', 
    prompt: 'Vibrant pop art party invitation with halftone dots, comic book explosions, bold primary colors, retro cartoon illustrations, playful hand-lettering, confetti bursts, celebration energy', 
    preview: invPopart,
    isNew: true
  },
  { 
    id: 'inv-3', 
    name: 'Gala Noir', 
    category: 'Invitation', 
    prompt: 'Ultra-sophisticated gala invitation with deep matte black background, subtle embossed patterns, platinum foil typography, art deco geometric borders, museum-quality minimalism, exclusive luxury feel', 
    preview: invGala,
    isPremium: true
  },
  
  // Thumbnail Templates - Click-worthy & Bold
  { 
    id: 'thumb-1', 
    name: 'Viral Impact', 
    category: 'Thumbnail', 
    prompt: 'Maximum impact YouTube thumbnail with 3D extruded bold text, dramatic lighting, shocked expression placeholder, fire and explosion effects, saturated colors, impossible to ignore composition, click-bait masterclass', 
    preview: thumbViral,
    isNew: true
  },
  { 
    id: 'thumb-2', 
    name: 'Pro Tutorial', 
    category: 'Thumbnail', 
    prompt: 'Premium tutorial thumbnail with sleek dark interface preview, numbered step badges, gradient glass overlays, professional headshot frame, tech company aesthetic, clean modern typography', 
    preview: thumbTutorial
  },
  { 
    id: 'thumb-3', 
    name: 'Podcast Studio', 
    category: 'Thumbnail', 
    prompt: 'Atmospheric podcast thumbnail with premium microphone visualization, sound wave graphics, moody studio lighting, guest photo frames, episode number badges, Spotify aesthetic', 
    preview: thumbPodcast,
    isPremium: true
  },
  
  // Infographic Templates - Data-rich & Visually Stunning
  { 
    id: 'info-1', 
    name: 'Neon Dashboard', 
    category: 'Infographic', 
    prompt: 'Futuristic data infographic with neon-accented glassmorphism panels, holographic chart visualizations, cyberpunk data nodes, dark mode interface, animated number counters appearance, tech startup aesthetic', 
    preview: infoDashboard,
    isPremium: true,
    isNew: true
  },
  { 
    id: 'info-2', 
    name: 'Journey Map', 
    category: 'Infographic', 
    prompt: 'Elegant journey infographic with winding path illustrations, milestone markers with icons, gradient transitions between stages, hand-drawn elements, storytelling visual flow, premium magazine quality', 
    preview: infoJourney
  },
  { 
    id: 'info-3', 
    name: 'Versus Battle', 
    category: 'Infographic', 
    prompt: 'Dynamic versus comparison infographic with split screen effect, lightning bolt divider, team color coding, stats bars with glow effects, competitive gaming aesthetic, bold iconography', 
    preview: infoVersus,
    isNew: true
  },
  
  // Brochure Templates - Professional & Refined
  { 
    id: 'broch-1', 
    name: 'Fortune 500', 
    category: 'Brochure', 
    prompt: 'Elite corporate brochure with architectural photography, premium paper texture, metallic ink accents, executive boardroom aesthetic, sophisticated grid system, annual report quality, investor-ready polish', 
    preview: brochCorporate,
    isPremium: true
  },
  { 
    id: 'broch-2', 
    name: 'Luxury Catalog', 
    category: 'Brochure', 
    prompt: 'High-fashion product catalog with editorial photography layouts, generous white space, subtle drop shadows, price tags with gold borders, magazine-quality print aesthetic, lifestyle imagery integration', 
    preview: brochCatalog
  },
  { 
    id: 'broch-3', 
    name: 'Wanderlust', 
    category: 'Brochure', 
    prompt: 'Breathtaking travel brochure with panoramic destination photography, hand-drawn map illustrations, vintage stamp accents, adventure typography, bucket-list inspiration, National Geographic quality', 
    preview: brochTravel,
    isNew: true
  },
  
  // Cover Templates - Captivating & Memorable
  { 
    id: 'cover-1', 
    name: 'Bestseller', 
    category: 'Cover', 
    prompt: 'Award-winning book cover with dramatic cinematic imagery, embossed foil title treatment, New York Times bestseller badge, atmospheric lighting, genre-defining visual impact, shelf presence optimization', 
    preview: coverBestseller,
    isPremium: true
  },
  { 
    id: 'cover-2', 
    name: 'Vogue Style', 
    category: 'Cover', 
    prompt: 'High-fashion magazine cover with supermodel photography aesthetic, bold masthead typography, exclusive cover line hierarchy, luxury brand advertisement feel, editorial excellence, newsstand impact', 
    preview: coverVogue,
    isNew: true
  },
  { 
    id: 'cover-3', 
    name: 'Platinum Record', 
    category: 'Cover', 
    prompt: 'Iconic album cover with artistic visual concept, textured background, experimental typography, mood-defining color grading, vinyl-worthy artwork, music history aesthetic, Grammy-winning vibes', 
    preview: coverAlbum,
    isPremium: true
  },
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 border-border/50 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-green/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-brand-green to-emerald-600 p-2.5 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Premium Design Templates
            </span>
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full border border-amber-500/30">
              {filteredTemplates.length} Templates
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-[calc(90vh-140px)] pt-4">
          {/* Sidebar - Categories */}
          <div className="w-52 flex-shrink-0">
            <div className="space-y-1.5">
              {categories.map(category => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                const count = category.id === 'all' 
                  ? designTemplates.length 
                  : designTemplates.filter(t => t.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 group hover:translate-x-1 active:scale-[0.98] ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-green/20 via-brand-green/10 to-transparent text-brand-green border-l-2 border-brand-green shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-brand-green/20' : 'bg-secondary group-hover:bg-secondary/50'
                    }`}>
                      <Icon size={14} className={isActive ? 'text-brand-green' : ''} />
                    </div>
                    <span className="flex-1">{category.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-brand-green/20 text-brand-green' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-transparent rounded-xl" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search premium templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-secondary/50 border-border/50 rounded-xl focus:border-brand-green/50 focus:ring-brand-green/20 transition-all"
              />
            </div>
            
            {/* Templates Grid - GPU accelerated scroll */}
            <div className="flex-1 overflow-y-auto pr-2 will-change-scroll" style={{ transform: 'translateZ(0)' }}>
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group relative rounded-xl overflow-hidden border border-border/50 bg-secondary/30 hover:border-brand-green/50 transition-colors duration-150"
                    >
                      {/* Premium/New Badges */}
                      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                        {template.isPremium && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded">
                            <Crown size={8} />
                            PRO
                          </span>
                        )}
                        {template.isNew && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500 text-white rounded">
                            <Zap size={8} />
                            NEW
                          </span>
                        )}
                      </div>
                      
                      {/* Image Container - no transforms on scroll */}
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={template.preview}
                          alt={template.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-foreground group-hover:text-brand-green transition-colors duration-150 line-clamp-1 text-left">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 text-left">
                          {template.category}
                        </p>
                      </div>
                      
                      {/* Simple hover overlay */}
                      <div className="absolute inset-0 bg-brand-green/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <span className="bg-white text-brand-green px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                          <Sparkles size={14} />
                          Use Template
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <LayoutGrid className="w-12 h-12 opacity-50" />
                  <p className="text-sm mt-4 font-medium">No templates found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
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
