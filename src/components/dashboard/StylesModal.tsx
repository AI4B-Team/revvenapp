import React, { useState } from 'react';
import { X, Star, Search, Plus, Flame } from 'lucide-react';

// Style categories and items
const styleCategories = ['Featured', 'My Styles', 'All', 'Photo', 'Illustration', '3D', 'Design'];

const styles = [
  { id: 1, name: 'All styles', image: null, icon: '🎨', category: 'all', featured: true },
  { id: 2, name: 'Reference image', image: null, icon: '🖼️', category: 'all', featured: true },
  { id: 3, name: '#photo', image: '/api/placeholder/150/150', category: 'photo', featured: true, trending: false },
  { id: 4, name: '#natural', image: '/api/placeholder/150/150', category: 'photo', featured: true, trending: true },
  { id: 5, name: '#editorial', image: '/api/placeholder/150/150', category: 'photo', featured: true, trending: true },
  { id: 6, name: '#illustration', image: '/api/placeholder/150/150', category: 'illustration', featured: true },
  { id: 7, name: '#character3d', image: '/api/placeholder/150/150', category: '3d', featured: true, trending: true },
  { id: 8, name: '#risoprint', image: '/api/placeholder/150/150', category: 'design', featured: true, trending: true },
  { id: 9, name: '#cartoonfun', image: '/api/placeholder/150/150', category: 'illustration', featured: true },
  { id: 10, name: '#pixelart', image: '/api/placeholder/150/150', category: 'design', featured: true },
  { id: 11, name: '#oilpainting', image: '/api/placeholder/150/150', category: 'illustration', featured: true },
  { id: 12, name: '#inkprint', image: '/api/placeholder/150/150', category: 'design', featured: true },
  { id: 13, name: '#popsurrealism', image: '/api/placeholder/150/150', category: 'illustration', featured: true, trending: true },
  { id: 14, name: '#vibrantfilm', image: '/api/placeholder/150/150', category: 'photo', featured: true },
  { id: 15, name: '#fashionphoto', image: '/api/placeholder/150/150', category: 'photo', featured: true },
  { id: 16, name: '#glitchcollage', image: '/api/placeholder/150/150', category: 'design', featured: true },
  { id: 17, name: '#weirdfilm', image: '/api/placeholder/150/150', category: 'photo', featured: false },
  { id: 18, name: '#crossprocessed', image: '/api/placeholder/150/150', category: 'photo', featured: false },
  { id: 19, name: '#filmlandscapes', image: '/api/placeholder/150/150', category: 'photo', featured: false, trending: true },
  { id: 20, name: '#looselines', image: '/api/placeholder/150/150', category: 'illustration', featured: false },
  { id: 21, name: '#watercolortexture', image: '/api/placeholder/150/150', category: 'illustration', featured: false },
  { id: 22, name: '#pastelcartoon', image: '/api/placeholder/150/150', category: 'illustration', featured: false },
  { id: 23, name: '#claymodel', image: '/api/placeholder/150/150', category: '3d', featured: false, trending: true },
  { id: 24, name: '#voxelart', image: '/api/placeholder/150/150', category: '3d', featured: false },
  { id: 25, name: '#retroarchitecture', image: '/api/placeholder/150/150', category: '3d', featured: false },
  { id: 26, name: '#vaporwaveflat', image: '/api/placeholder/150/150', category: 'design', featured: false },
  { id: 27, name: '#minimalistposter', image: '/api/placeholder/150/150', category: 'design', featured: false },
  { id: 28, name: '#retrofuturism', image: '/api/placeholder/150/150', category: 'design', featured: false },
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
  const [activeCategory, setActiveCategory] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter styles based on active category and search
  const filteredStyles = styles.filter(style => {
    const matchesCategory = 
      activeCategory === 'Featured' ? style.featured :
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-[90vw] max-w-6xl max-h-[85vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold text-white">Styles</h2>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
              />
            </div>

            {/* New Style Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="font-medium">New style</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800 overflow-x-auto">
          {styleCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                ${activeCategory === category
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {category === 'Featured' && <Star className="w-4 h-4" />}
              {category === 'My Styles' && <span className="text-sm">📁</span>}
              {category}
            </button>
          ))}
        </div>

        {/* Styles Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleClick(style)}
                className={`
                  group relative aspect-square rounded-xl overflow-hidden transition-all
                  hover:scale-105 hover:shadow-xl
                  ${selectedStyle?.id === style.id
                    ? 'ring-4 ring-blue-500'
                    : 'hover:ring-2 hover:ring-blue-400'
                  }
                `}
              >
                {/* Style Image or Icon */}
                {style.image ? (
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-4xl">{style.icon}</span>
                  </div>
                )}

                {/* Trending Badge */}
                {style.trending && (
                  <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-1.5 shadow-lg">
                    <Flame className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Style Name */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-medium text-sm truncate drop-shadow-lg">
                    {style.name}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedStyle?.id === style.id && (
                  <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
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
