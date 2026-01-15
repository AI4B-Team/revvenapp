import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

// Import style icons
import realisticIcon from '@/assets/style-icons/realistic.png';
import radianceIcon from '@/assets/style-icons/radiance.png';
import debonairIcon from '@/assets/style-icons/debonair.png';
import mystiqueIcon from '@/assets/style-icons/mystique.png';
import poiseIcon from '@/assets/style-icons/poise.png';
import strikingIcon from '@/assets/style-icons/striking.png';
import cinematicIcon from '@/assets/style-icons/cinematic.png';
import editorialIcon from '@/assets/style-icons/editorial.png';
import naturalIcon from '@/assets/style-icons/natural.png';
import vibrantIcon from '@/assets/style-icons/vibrant.png';
import fashionIcon from '@/assets/style-icons/fashion.png';
import illustrationIcon from '@/assets/style-icons/illustration.png';
import cartoonIcon from '@/assets/style-icons/cartoon.png';
import oilPaintingIcon from '@/assets/style-icons/oil-painting.png';
import watercolorIcon from '@/assets/style-icons/watercolor.png';
import popArtIcon from '@/assets/style-icons/pop-art.png';
import minimalistIcon from '@/assets/style-icons/minimalist.png';
import vintageIcon from '@/assets/style-icons/vintage.png';
import filmNoirIcon from '@/assets/style-icons/film-noir.png';
import retroIcon from '@/assets/style-icons/retro.png';
import pixelArtIcon from '@/assets/style-icons/pixel-art.png';
import abstractIcon from '@/assets/style-icons/abstract.png';
import geometricIcon from '@/assets/style-icons/geometric.png';
import dramaticIcon from '@/assets/style-icons/dramatic.png';
import softFocusIcon from '@/assets/style-icons/soft-focus.png';
import highContrastIcon from '@/assets/style-icons/high-contrast.png';
import moodyIcon from '@/assets/style-icons/moody.png';

// Style categories and items
const styleCategories = ['All', 'My Styles'];

const styles = [
  { id: 3, name: 'Realistic', image: null, iconImg: realisticIcon, category: 'all' },
  { id: 4, name: 'Radiance', image: null, iconImg: radianceIcon, category: 'all' },
  { id: 5, name: 'Debonair', image: null, iconImg: debonairIcon, category: 'all' },
  { id: 6, name: 'Mystique', image: null, iconImg: mystiqueIcon, category: 'all' },
  { id: 7, name: 'Poise', image: null, iconImg: poiseIcon, category: 'all' },
  { id: 8, name: 'Striking', image: null, iconImg: strikingIcon, category: 'all' },
  { id: 9, name: 'Cinematic', image: null, iconImg: cinematicIcon, category: 'all' },
  { id: 10, name: 'Editorial', image: null, iconImg: editorialIcon, category: 'all' },
  { id: 11, name: 'Natural', image: null, iconImg: naturalIcon, category: 'all' },
  { id: 12, name: 'Vibrant', image: null, iconImg: vibrantIcon, category: 'all' },
  { id: 13, name: 'Fashion', image: null, iconImg: fashionIcon, category: 'all' },
  { id: 14, name: 'Illustration', image: null, iconImg: illustrationIcon, category: 'all' },
  { id: 15, name: 'Cartoon', image: null, iconImg: cartoonIcon, category: 'all' },
  { id: 16, name: 'Oil Painting', image: null, iconImg: oilPaintingIcon, category: 'all' },
  { id: 17, name: 'Watercolor', image: null, iconImg: watercolorIcon, category: 'all' },
  { id: 18, name: 'Pop Art', image: null, iconImg: popArtIcon, category: 'all' },
  { id: 19, name: 'Minimalist', image: null, iconImg: minimalistIcon, category: 'all' },
  { id: 20, name: 'Vintage', image: null, iconImg: vintageIcon, category: 'all' },
  { id: 21, name: 'Film Noir', image: null, iconImg: filmNoirIcon, category: 'all' },
  { id: 22, name: 'Retro', image: null, iconImg: retroIcon, category: 'all' },
  { id: 23, name: 'Pixel Art', image: null, iconImg: pixelArtIcon, category: 'all' },
  { id: 24, name: 'Abstract', image: null, iconImg: abstractIcon, category: 'all' },
  { id: 25, name: 'Geometric', image: null, iconImg: geometricIcon, category: 'all' },
  { id: 26, name: 'Dramatic', image: null, iconImg: dramaticIcon, category: 'all' },
  { id: 27, name: 'Soft Focus', image: null, iconImg: softFocusIcon, category: 'all' },
  { id: 28, name: 'High Contrast', image: null, iconImg: highContrastIcon, category: 'all' },
  { id: 29, name: 'Moody', image: null, iconImg: moodyIcon, category: 'all' },
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Close Button - Outside Modal */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-background rounded-lg transition-colors border border-border z-[10000]"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl w-[95vw] max-w-[1400px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Styles</h2>
            <p className="text-sm text-gray-400">Choose A Style</p>
          </div>

          {/* Right Side: Search & New Style Button */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search Styles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* New Style Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Style</span>
            </button>
          </div>
        </div>

        {/* Category Links */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-1">
            {styleCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${activeCategory === category
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Styles Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1a1f2e]">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleClick(style)}
                className={`
                  group relative flex flex-col rounded-xl overflow-hidden transition-all
                  hover:scale-105 hover:shadow-xl bg-gray-800 border-2
                  ${selectedStyle?.id === style.id
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Style Image or Icon */}
                <div className="aspect-square w-full">
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center p-4">
                      <img 
                        src={style.iconImg} 
                        alt={style.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Style Name */}
                <div className="p-3 bg-gray-800">
                  <p className="text-white font-medium text-sm truncate">
                    {style.name}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedStyle?.id === style.id && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredStyles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No styles found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylesModal;
