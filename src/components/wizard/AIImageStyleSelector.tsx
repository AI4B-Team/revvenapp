import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface ImageStyle {
  id: string;
  name: string;
  color: string;
}

interface AIImageStyleSelectorProps {
  onStyleSelect?: (style: ImageStyle) => void;
  selectedStyle?: ImageStyle | null;
}

const AIImageStyleSelector: React.FC<AIImageStyleSelectorProps> = ({ onStyleSelect, selectedStyle }) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  const imageStyles: ImageStyle[] = [
    { id: 'realistic', name: 'Realistic', color: 'from-amber-600 to-amber-800' },
    { id: 'cinematic', name: 'Cinematic', color: 'from-yellow-500 to-orange-600' },
    { id: 'anime', name: 'Anime', color: 'from-pink-400 to-purple-500' },
    { id: '3d-cartoon', name: '3D Cartoon', color: 'from-blue-400 to-cyan-500' },
    { id: 'comic-book', name: 'Comic Book', color: 'from-yellow-400 to-red-500' },
    { id: 'pop-art', name: 'Pop Art', color: 'from-red-500 to-pink-600' },
    { id: 'fantasy-art', name: 'Fantasy Art', color: 'from-purple-600 to-indigo-700' },
    { id: 'vector-portrait', name: 'Vector Portrait', color: 'from-rose-400 to-pink-500' },
    { id: 'neon-punk', name: 'Neon Punk', color: 'from-purple-700 to-blue-800' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'from-purple-600 to-pink-600' },
    { id: 'studio-ghibli', name: 'Studio Ghibli', color: 'from-green-400 to-emerald-600' },
    { id: 'pixar-studio', name: 'Pixar Studio', color: 'from-orange-500 to-red-600' },
    { id: 'vector-cartoon', name: 'Vector Cartoon', color: 'from-blue-300 to-blue-500' },
    { id: 'pencil-art', name: 'Pencil Art', color: 'from-gray-400 to-gray-600' },
    { id: 'charcoal-art', name: 'Charcoal Art', color: 'from-gray-600 to-gray-800' },
    { id: 'graffiti', name: 'Graffiti', color: 'from-orange-500 to-red-600' },
    { id: 'simps', name: 'Simps', color: 'from-yellow-300 to-yellow-500' },
    { id: 'ink-sketch', name: 'Ink Sketch', color: 'from-gray-300 to-gray-500' },
    { id: 'isometric', name: 'Isometric', color: 'from-teal-400 to-cyan-600' },
    { id: 'line-art', name: 'Line Art', color: 'from-gray-200 to-gray-400' },
    { id: 'colored-line-art', name: 'Colored Line Art', color: 'from-pink-300 to-pink-500' },
    { id: 'origami', name: 'Origami', color: 'from-green-300 to-green-500' },
    { id: 'clay', name: 'Clay', color: 'from-blue-300 to-blue-500' },
    { id: 'low-poly', name: 'Low Poly', color: 'from-purple-400 to-purple-600' },
    { id: 'crayons', name: 'Crayons', color: 'from-green-400 to-lime-500' },
    { id: 'film-noir', name: 'Film Noir', color: 'from-gray-700 to-black' },
    { id: 'vintage', name: 'Vintage', color: 'from-amber-700 to-amber-900' },
    { id: 'black-and-white', name: 'Black And White', color: 'from-gray-400 to-gray-700' },
  ];

  const visibleStyles = showAllStyles ? imageStyles : imageStyles.slice(0, 12);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Image Style
        </h2>
        <p className="text-gray-600">
          Choose the visual style for your AI-generated images
        </p>
      </div>

      {/* Style Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visibleStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect?.(style)}
              className={`group relative aspect-square rounded-xl overflow-hidden transition-all ${
                selectedStyle?.id === style.id
                  ? 'ring-4 ring-green-500 ring-offset-2 scale-105'
                  : 'ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.color}`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-30" 
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                     }}
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-2 px-2">
                <p className="text-white text-xs font-bold text-center leading-tight">
                  {style.name}
                </p>
              </div>

              {/* Selected Check */}
              {selectedStyle?.id === style.id && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Show More/Less Button */}
        <button
          onClick={() => setShowAllStyles(!showAllStyles)}
          className="w-full mt-6 py-3 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {showAllStyles ? (
            <>
              Show less styles
              <ChevronUp size={18} />
            </>
          ) : (
            <>
              Show more styles
              <ChevronDown size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIImageStyleSelector;
