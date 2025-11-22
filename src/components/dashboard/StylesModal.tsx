import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

// Style categories and items
const styleCategories = ['All', 'My Styles'];

const styles = [
  { id: 1, name: 'All styles', image: null, icon: '🎨', category: 'all' },
  { id: 2, name: 'Reference image', image: null, icon: '🖼️', category: 'all' },
  { id: 3, name: 'Radiance', image: null, icon: '✨', category: 'all' },
  { id: 4, name: 'Debonair', image: null, icon: '🎩', category: 'all' },
  { id: 5, name: 'Mystique', image: null, icon: '🌙', category: 'all' },
  { id: 6, name: 'Poise', image: null, icon: '💼', category: 'all' },
  { id: 7, name: 'Striking', image: null, icon: '⚡', category: 'all' },
  { id: 8, name: 'Cinematic', image: null, icon: '🎬', category: 'all' },
  { id: 9, name: 'Editorial', image: null, icon: '📸', category: 'all' },
  { id: 10, name: 'Natural', image: null, icon: '🌿', category: 'all' },
  { id: 11, name: 'Vibrant', image: null, icon: '🎨', category: 'all' },
  { id: 12, name: 'Fashion', image: null, icon: '👗', category: 'all' },
  { id: 13, name: 'Illustration', image: null, icon: '✏️', category: 'all' },
  { id: 14, name: 'Cartoon', image: null, icon: '🎭', category: 'all' },
  { id: 15, name: 'Oil Painting', image: null, icon: '🖌️', category: 'all' },
  { id: 16, name: 'Watercolor', image: null, icon: '💧', category: 'all' },
  { id: 17, name: 'Pop Art', image: null, icon: '💥', category: 'all' },
  { id: 18, name: 'Minimalist', image: null, icon: '⚪', category: 'all' },
  { id: 19, name: 'Vintage', image: null, icon: '📷', category: 'all' },
  { id: 20, name: 'Film Noir', image: null, icon: '🎞️', category: 'all' },
  { id: 21, name: 'Retro', image: null, icon: '🕹️', category: 'all' },
  { id: 22, name: 'Pixel Art', image: null, icon: '🎮', category: 'all' },
  { id: 23, name: 'Abstract', image: null, icon: '🌀', category: 'all' },
  { id: 24, name: 'Geometric', image: null, icon: '🔷', category: 'all' },
  { id: 25, name: 'Dramatic', image: null, icon: '🎭', category: 'all' },
  { id: 26, name: 'Soft Focus', image: null, icon: '💫', category: 'all' },
  { id: 27, name: 'High Contrast', image: null, icon: '⚫', category: 'all' },
  { id: 28, name: 'Moody', image: null, icon: '🌑', category: 'all' },
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
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

      <div className="bg-background rounded-2xl shadow-2xl w-[95vw] max-w-[1400px] max-h-[90vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-2xl font-bold text-foreground">Styles</h2>
            
            {/* Category Links */}
            <div className="flex items-center gap-4">
              {styleCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    text-sm font-medium transition-colors
                    ${activeCategory === category
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Search & New Style Button */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Styles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
              />
            </div>

            {/* New Style Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border">
              <Plus className="w-4 h-4" />
              <span className="font-medium">+ New Style</span>
            </button>
          </div>
        </div>

        {/* Styles Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleClick(style)}
                className={`
                  group relative flex flex-col rounded-xl overflow-hidden transition-all
                  hover:scale-105 hover:shadow-xl bg-card border border-border
                  ${selectedStyle?.id === style.id
                    ? 'ring-2 ring-primary'
                    : 'hover:ring-2 hover:ring-primary/50'
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
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <span className="text-4xl">{style.icon}</span>
                    </div>
                  )}
                </div>

                {/* Style Name */}
                <div className="p-3 bg-card">
                  <p className="text-foreground font-medium text-sm truncate">
                    {style.name}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedStyle?.id === style.id && (
                  <div className="absolute top-2 left-2 bg-primary rounded-full p-1">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredStyles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
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
