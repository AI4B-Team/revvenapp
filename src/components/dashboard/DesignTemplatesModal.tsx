import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, LayoutGrid, FileText, Image, Presentation, Mail, Tag, BookOpen, Crown, Zap, Star } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    preview: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=300&fit=crop',
    isPremium: true,
    isNew: true
  },
  { 
    id: 'logo-2', 
    name: 'Luxury Gold Emblem', 
    category: 'Logo', 
    prompt: 'Opulent luxury emblem logo with 24k gold foil texture, intricate filigree patterns, raised 3D embossing effect, deep black velvet background, diamond dust sparkle accents, royal serif typography with metallic sheen', 
    preview: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
    isPremium: true
  },
  { 
    id: 'logo-3', 
    name: 'Aurora Gradient', 
    category: 'Logo', 
    prompt: 'Mesmerizing aurora borealis gradient logo with flowing liquid metal typography, iridescent pearl finish, soft ethereal glow effects, crystalline geometric accents, dreamy pastel to deep violet color transitions', 
    preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop',
    isNew: true
  },
  
  // Business Card Templates - Premium & Stylish
  { 
    id: 'bc-1', 
    name: 'Executive Prestige', 
    category: 'Business Card', 
    prompt: 'Ultra-premium executive business card with black titanium finish, rose gold foil debossing, soft-touch matte texture, holographic security stripe, minimalist Swiss typography, architectural line patterns', 
    preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=200&fit=crop',
    isPremium: true
  },
  { 
    id: 'bc-2', 
    name: 'Creative Prism', 
    category: 'Business Card', 
    prompt: 'Bold creative agency card with holographic rainbow prism effect, transparent acrylic material appearance, floating 3D elements, gradient mesh backgrounds, avant-garde asymmetric layout, neon accent highlights', 
    preview: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=200&fit=crop',
    isNew: true
  },
  { 
    id: 'bc-3', 
    name: 'Marble Luxe', 
    category: 'Business Card', 
    prompt: 'Sophisticated marble texture business card with gold vein details, premium weight cardstock appearance, copper foil accents, elegant serif typography, museum-quality minimalist design', 
    preview: 'https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?w=300&h=200&fit=crop'
  },
  
  // Poster Templates - Dynamic & Cinematic
  { 
    id: 'poster-1', 
    name: 'Synthwave Nights', 
    category: 'Poster', 
    prompt: 'Epic synthwave poster with retro-futuristic chrome typography, sunset gradient sky with grid mountains, neon palm silhouettes, VHS glitch effects, purple and hot pink color scheme, 80s nostalgia aesthetic with modern polish', 
    preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop',
    isPremium: true,
    isNew: true
  },
  { 
    id: 'poster-2', 
    name: 'Brutalist Art', 
    category: 'Poster', 
    prompt: 'High-fashion brutalist poster with bold geometric blocks, stark contrast black and white with single accent color, industrial concrete textures, experimental typography, avant-garde museum exhibition style', 
    preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=400&fit=crop'
  },
  { 
    id: 'poster-3', 
    name: 'Cosmic Journey', 
    category: 'Poster', 
    prompt: 'Breathtaking cosmic poster with nebula clouds, holographic planet rings, stardust particle effects, ethereal gradient backgrounds, futuristic chrome typography, space exploration cinematic atmosphere', 
    preview: 'https://images.unsplash.com/photo-1514820720301-4c4790309f46?w=300&h=400&fit=crop',
    isPremium: true
  },
  
  // Flyer Templates - Eye-catching & Modern
  { 
    id: 'flyer-1', 
    name: 'Neon Rave', 
    category: 'Flyer', 
    prompt: 'Explosive neon rave flyer with laser beam effects, holographic metallic surfaces, UV glow typography, liquid chrome drips, cyberpunk club aesthetic, electric blue and hot pink gradients, fog machine atmosphere', 
    preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=400&fit=crop',
    isNew: true
  },
  { 
    id: 'flyer-2', 
    name: 'Corporate Elite', 
    category: 'Flyer', 
    prompt: 'Premium corporate flyer with frosted glass panels, subtle gradient mesh, executive gold accents, architectural photography integration, sophisticated sans-serif typography, luxury real estate aesthetic', 
    preview: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=400&fit=crop',
    isPremium: true
  },
  { 
    id: 'flyer-3', 
    name: 'Flash Sale Blitz', 
    category: 'Flyer', 
    prompt: 'High-impact sale flyer with explosive starburst effects, 3D extruded text, chrome metallic percentages, dynamic motion blur, electric energy bolts, urgent countdown timer graphics, premium retail aesthetic', 
    preview: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=400&fit=crop'
  },
  
  // Invitation Templates - Elegant & Sophisticated
  { 
    id: 'inv-1', 
    name: 'Botanical Luxe', 
    category: 'Invitation', 
    prompt: 'Exquisite wedding invitation with hand-painted botanical illustrations, watercolor wash backgrounds, gold leaf accents, luxury cotton paper texture, romantic calligraphy, soft blush and sage color palette, pressed flower details', 
    preview: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=300&fit=crop',
    isPremium: true
  },
  { 
    id: 'inv-2', 
    name: 'Party Pop Art', 
    category: 'Invitation', 
    prompt: 'Vibrant pop art party invitation with halftone dots, comic book explosions, bold primary colors, retro cartoon illustrations, playful hand-lettering, confetti bursts, celebration energy', 
    preview: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=300&fit=crop',
    isNew: true
  },
  { 
    id: 'inv-3', 
    name: 'Gala Noir', 
    category: 'Invitation', 
    prompt: 'Ultra-sophisticated gala invitation with deep matte black background, subtle embossed patterns, platinum foil typography, art deco geometric borders, museum-quality minimalism, exclusive luxury feel', 
    preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop',
    isPremium: true
  },
  
  // Thumbnail Templates - Click-worthy & Bold
  { 
    id: 'thumb-1', 
    name: 'Viral Impact', 
    category: 'Thumbnail', 
    prompt: 'Maximum impact YouTube thumbnail with 3D extruded bold text, dramatic lighting, shocked expression placeholder, fire and explosion effects, saturated colors, impossible to ignore composition, click-bait masterclass', 
    preview: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=170&fit=crop',
    isNew: true
  },
  { 
    id: 'thumb-2', 
    name: 'Pro Tutorial', 
    category: 'Thumbnail', 
    prompt: 'Premium tutorial thumbnail with sleek dark interface preview, numbered step badges, gradient glass overlays, professional headshot frame, tech company aesthetic, clean modern typography', 
    preview: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=300&h=170&fit=crop'
  },
  { 
    id: 'thumb-3', 
    name: 'Podcast Studio', 
    category: 'Thumbnail', 
    prompt: 'Atmospheric podcast thumbnail with premium microphone visualization, sound wave graphics, moody studio lighting, guest photo frames, episode number badges, Spotify aesthetic', 
    preview: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=170&fit=crop',
    isPremium: true
  },
  
  // Infographic Templates - Data-rich & Visually Stunning
  { 
    id: 'info-1', 
    name: 'Neon Dashboard', 
    category: 'Infographic', 
    prompt: 'Futuristic data infographic with neon-accented glassmorphism panels, holographic chart visualizations, cyberpunk data nodes, dark mode interface, animated number counters appearance, tech startup aesthetic', 
    preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
    isPremium: true,
    isNew: true
  },
  { 
    id: 'info-2', 
    name: 'Journey Map', 
    category: 'Infographic', 
    prompt: 'Elegant journey infographic with winding path illustrations, milestone markers with icons, gradient transitions between stages, hand-drawn elements, storytelling visual flow, premium magazine quality', 
    preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop'
  },
  { 
    id: 'info-3', 
    name: 'Versus Battle', 
    category: 'Infographic', 
    prompt: 'Dynamic versus comparison infographic with split screen effect, lightning bolt divider, team color coding, stats bars with glow effects, competitive gaming aesthetic, bold iconography', 
    preview: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300&h=400&fit=crop',
    isNew: true
  },
  
  // Brochure Templates - Professional & Refined
  { 
    id: 'broch-1', 
    name: 'Fortune 500', 
    category: 'Brochure', 
    prompt: 'Elite corporate brochure with architectural photography, premium paper texture, metallic ink accents, executive boardroom aesthetic, sophisticated grid system, annual report quality, investor-ready polish', 
    preview: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    isPremium: true
  },
  { 
    id: 'broch-2', 
    name: 'Luxury Catalog', 
    category: 'Brochure', 
    prompt: 'High-fashion product catalog with editorial photography layouts, generous white space, subtle drop shadows, price tags with gold borders, magazine-quality print aesthetic, lifestyle imagery integration', 
    preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
  },
  { 
    id: 'broch-3', 
    name: 'Wanderlust', 
    category: 'Brochure', 
    prompt: 'Breathtaking travel brochure with panoramic destination photography, hand-drawn map illustrations, vintage stamp accents, adventure typography, bucket-list inspiration, National Geographic quality', 
    preview: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop',
    isNew: true
  },
  
  // Cover Templates - Captivating & Memorable
  { 
    id: 'cover-1', 
    name: 'Bestseller', 
    category: 'Cover', 
    prompt: 'Award-winning book cover with dramatic cinematic imagery, embossed foil title treatment, New York Times bestseller badge, atmospheric lighting, genre-defining visual impact, shelf presence optimization', 
    preview: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    isPremium: true
  },
  { 
    id: 'cover-2', 
    name: 'Vogue Style', 
    category: 'Cover', 
    prompt: 'High-fashion magazine cover with supermodel photography aesthetic, bold masthead typography, exclusive cover line hierarchy, luxury brand advertisement feel, editorial excellence, newsstand impact', 
    preview: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
    isNew: true
  },
  { 
    id: 'cover-3', 
    name: 'Platinum Record', 
    category: 'Cover', 
    prompt: 'Iconic album cover with artistic visual concept, textured background, experimental typography, mood-defining color grading, vinyl-worthy artwork, music history aesthetic, Grammy-winning vibes', 
    preview: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=400&fit=crop',
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
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

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
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 group ${
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
                  </motion.button>
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
            
            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-3 gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredTemplates.map((template, index) => (
                      <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => handleSelectTemplate(template)}
                        onMouseEnter={() => setHoveredTemplate(template.id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                        className="group relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-secondary/50 to-secondary/30 hover:border-brand-green/50 transition-all duration-500 hover:shadow-xl hover:shadow-brand-green/5"
                      >
                        {/* Premium/New Badges */}
                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                          {template.isPremium && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-lg"
                            >
                              <Crown size={10} />
                              PRO
                            </motion.span>
                          )}
                          {template.isNew && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg shadow-lg"
                            >
                              <Zap size={10} />
                              NEW
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Image Container */}
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <motion.img
                            src={template.preview}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            animate={{ 
                              scale: hoveredTemplate === template.id ? 1.1 : 1 
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 relative">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-green transition-colors line-clamp-1">
                                {template.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-green/60" />
                                {template.category}
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ 
                                rotate: hoveredTemplate === template.id ? 15 : 0,
                                scale: hoveredTemplate === template.id ? 1.1 : 1
                              }}
                              className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star size={12} className="fill-current" />
                            </motion.div>
                          </div>
                        </div>
                        
                        {/* Hover Overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-brand-green/90 via-brand-green/50 to-transparent flex items-end justify-center pb-16 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredTemplate === template.id ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.span 
                            className="bg-white text-brand-green px-6 py-2.5 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2"
                            initial={{ y: 20 }}
                            animate={{ y: hoveredTemplate === template.id ? 0 : 20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Sparkles size={14} />
                            Use This Template
                          </motion.span>
                        </motion.div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-muted-foreground"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-green/10 blur-2xl rounded-full" />
                      <div className="relative bg-secondary/50 p-6 rounded-2xl">
                        <LayoutGrid className="w-12 h-12 opacity-50" />
                      </div>
                    </div>
                    <p className="text-sm mt-4 font-medium">No templates found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignTemplatesModal;
