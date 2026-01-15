import React, { useState } from 'react';
import { X, Search, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import real style preview images
import realisticImg from '@/assets/style-icons/realistic.jpg';
import radianceImg from '@/assets/style-icons/radiance.jpg';
import debonairImg from '@/assets/style-icons/debonair.jpg';
import mystiqueImg from '@/assets/style-icons/mystique.jpg';
import poiseImg from '@/assets/style-icons/poise.jpg';
import strikingImg from '@/assets/style-icons/striking.jpg';
import cinematicImg from '@/assets/style-icons/cinematic.jpg';
import editorialImg from '@/assets/style-icons/editorial.jpg';
import naturalImg from '@/assets/style-icons/natural.jpg';
import vibrantImg from '@/assets/style-icons/vibrant.jpg';
import fashionImg from '@/assets/style-icons/fashion.jpg';
import illustrationImg from '@/assets/style-icons/illustration.jpg';
import cartoonImg from '@/assets/style-icons/cartoon.jpg';
import oilPaintingImg from '@/assets/style-icons/oil-painting.jpg';
import watercolorImg from '@/assets/style-icons/watercolor.jpg';
import popArtImg from '@/assets/style-icons/pop-art.jpg';
import minimalistImg from '@/assets/style-icons/minimalist.jpg';
import vintageImg from '@/assets/style-icons/vintage.jpg';
import filmNoirImg from '@/assets/style-icons/film-noir.jpg';
import retroImg from '@/assets/style-icons/retro.jpg';
import pixelArtImg from '@/assets/style-icons/pixel-art.jpg';
import abstractImg from '@/assets/style-icons/abstract.jpg';
import geometricImg from '@/assets/style-icons/geometric.jpg';
import dramaticImg from '@/assets/style-icons/dramatic.jpg';
import softFocusImg from '@/assets/style-icons/soft-focus.jpg';
import highContrastImg from '@/assets/style-icons/high-contrast.jpg';
import moodyImg from '@/assets/style-icons/moody.jpg';

// Style categories and items
const styleCategories = ['All', 'My Styles'];

const styles = [
  { id: 3, name: 'Realistic', image: realisticImg, category: 'all' },
  { id: 4, name: 'Radiance', image: radianceImg, category: 'all' },
  { id: 5, name: 'Debonair', image: debonairImg, category: 'all' },
  { id: 6, name: 'Mystique', image: mystiqueImg, category: 'all' },
  { id: 7, name: 'Poise', image: poiseImg, category: 'all' },
  { id: 8, name: 'Striking', image: strikingImg, category: 'all' },
  { id: 9, name: 'Cinematic', image: cinematicImg, category: 'all' },
  { id: 10, name: 'Editorial', image: editorialImg, category: 'all' },
  { id: 11, name: 'Natural', image: naturalImg, category: 'all' },
  { id: 12, name: 'Vibrant', image: vibrantImg, category: 'all' },
  { id: 13, name: 'Fashion', image: fashionImg, category: 'all' },
  { id: 14, name: 'Illustration', image: illustrationImg, category: 'all' },
  { id: 15, name: 'Cartoon', image: cartoonImg, category: 'all' },
  { id: 16, name: 'Oil Painting', image: oilPaintingImg, category: 'all' },
  { id: 17, name: 'Watercolor', image: watercolorImg, category: 'all' },
  { id: 18, name: 'Pop Art', image: popArtImg, category: 'all' },
  { id: 19, name: 'Minimalist', image: minimalistImg, category: 'all' },
  { id: 20, name: 'Vintage', image: vintageImg, category: 'all' },
  { id: 21, name: 'Film Noir', image: filmNoirImg, category: 'all' },
  { id: 22, name: 'Retro', image: retroImg, category: 'all' },
  { id: 23, name: 'Pixel Art', image: pixelArtImg, category: 'all' },
  { id: 24, name: 'Abstract', image: abstractImg, category: 'all' },
  { id: 25, name: 'Geometric', image: geometricImg, category: 'all' },
  { id: 26, name: 'Dramatic', image: dramaticImg, category: 'all' },
  { id: 27, name: 'Soft Focus', image: softFocusImg, category: 'all' },
  { id: 28, name: 'High Contrast', image: highContrastImg, category: 'all' },
  { id: 29, name: 'Moody', image: moodyImg, category: 'all' },
];

interface StylesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStyle: (style: any) => void;
  selectedStyle?: any;
}

const StylesModal: React.FC<StylesModalProps> = ({
  isOpen,
  onClose,
  onSelectStyle,
  selectedStyle,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredStyle, setHoveredStyle] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter styles based on active category and search
  const filteredStyles = styles.filter(style => {
    const matchesCategory = 
      activeCategory === 'My Styles' ? false : // No user styles yet
      activeCategory === 'All' ? true :
      style.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleStyleClick = (style: any) => {
    onSelectStyle(style);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Close Button - Outside Modal */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20 z-[10000] backdrop-blur-sm"
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-gradient-to-br from-[#1a1f2e]/95 via-[#1e2538]/95 to-[#1a1f2e]/95 rounded-3xl shadow-2xl w-[95vw] max-w-[1400px] max-h-[90vh] flex flex-col border border-white/10 backdrop-blur-xl overflow-hidden"
        >
          {/* Shimmer Effect on Border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>

          {/* Header */}
          <div className="relative px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10"
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Style Gallery
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">Transform your vision with AI-powered styles</p>
              </div>
            </div>

            {/* Right Side: Search & New Style Button */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative w-72"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                />
              </motion.div>

              {/* New Style Button */}
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Style</span>
              </motion.button>
            </div>
          </div>

          {/* Category Links */}
          <div className="px-8 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              {styleCategories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                    ${activeCategory === category
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Styles Grid */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
              className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4"
            >
              {filteredStyles.map((style) => (
                <motion.button
                  key={style.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStyleClick(style)}
                  onMouseEnter={() => setHoveredStyle(style.id)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  className={`
                    group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300
                    ${selectedStyle?.id === style.id
                      ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1a1f2e]'
                      : ''
                    }
                  `}
                >
                  {/* Glow Effect on Hover */}
                  <AnimatePresence>
                    {hoveredStyle === style.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50 rounded-2xl blur-lg z-0"
                      />
                    )}
                  </AnimatePresence>

                  {/* Card Content */}
                  <div className="relative z-10 bg-[#1e2538] rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                    {/* Style Image */}
                    <div className="aspect-square w-full overflow-hidden">
                      <motion.img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      
                      {/* Overlay on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4"
                      >
                        <span className="text-white text-xs font-medium px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                          Apply Style
                        </span>
                      </motion.div>
                    </div>

                    {/* Style Name */}
                    <div className="p-3 bg-gradient-to-b from-[#1e2538] to-[#1a1f2e]">
                      <p className="text-white font-medium text-sm truncate text-center">
                        {style.name}
                      </p>
                    </div>

                    {/* Selected Indicator */}
                    <AnimatePresence>
                      {selectedStyle?.id === style.id && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredStyles.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-gray-400"
              >
                <div className="p-4 rounded-full bg-white/5 mb-4">
                  <Search className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-lg font-medium text-white">No styles found</p>
                <p className="text-sm mt-1 text-gray-500">Try a different search or category</p>
              </motion.div>
            )}
          </div>

          {/* Footer with Stats */}
          <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
            <span>{filteredStyles.length} styles available</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI-powered style engine
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StylesModal;
