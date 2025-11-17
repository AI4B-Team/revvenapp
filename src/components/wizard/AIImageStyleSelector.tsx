import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ImageStyle {
  id: string;
  name: string;
  preview: string;
}

interface AIImageStyleSelectorProps {
  onStyleSelect?: (style: ImageStyle) => void;
  selectedStyle?: ImageStyle | null;
}

const AIImageStyleSelector: React.FC<AIImageStyleSelectorProps> = ({ onStyleSelect, selectedStyle }) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  const imageStyles: ImageStyle[] = [
    { id: 'realistic', name: 'Realistic', preview: '/styles/realistic.jpg' },
    { id: 'cinematic', name: 'Cinematic', preview: '/styles/cinematic.jpg' },
    { id: 'anime', name: 'Anime', preview: '/styles/anime.jpg' },
    { id: '3d-cartoon', name: '3D Cartoon', preview: '/styles/3d-cartoon.jpg' },
    { id: 'comic-book', name: 'Comic Book', preview: '/styles/comic-book.jpg' },
    { id: 'pop-art', name: 'Pop Art', preview: '/styles/pop-art.jpg' },
    { id: 'fantasy-art', name: 'Fantasy Art', preview: '/styles/fantasy-art.jpg' },
    { id: 'vector-portrait', name: 'Vector Portrait', preview: '/styles/vector-portrait.jpg' },
    { id: 'neon-punk', name: 'Neon Punk', preview: '/styles/neon-punk.jpg' },
    { id: 'cyberpunk', name: 'Cyberpunk', preview: '/styles/cyberpunk.jpg' },
    { id: 'studio-ghibli', name: 'Studio Ghibli', preview: '/styles/studio-ghibli.jpg' },
    { id: 'pixar-studio', name: 'Pixar Studio', preview: '/styles/pixar-studio.jpg' },
    { id: 'vector-cartoon', name: 'Vector Cartoon', preview: '/styles/vector-cartoon.jpg' },
    { id: 'pencil-art', name: 'Pencil Art', preview: '/styles/pencil-art.jpg' },
    { id: 'charcoal-art', name: 'Charcoal Art', preview: '/styles/charcoal-art.jpg' },
    { id: 'graffiti', name: 'Graffiti', preview: '/styles/graffiti.jpg' },
    { id: 'simps', name: 'Simps', preview: '/styles/simps.jpg' },
    { id: 'ink-sketch', name: 'Ink Sketch', preview: '/styles/ink-sketch.jpg' },
    { id: 'isometric', name: 'Isometric', preview: '/styles/isometric.jpg' },
    { id: 'line-art', name: 'Line Art', preview: '/styles/line-art.jpg' },
    { id: 'colored-line-art', name: 'Colored Line Art', preview: '/styles/colored-line-art.jpg' },
    { id: 'origami', name: 'Origami', preview: '/styles/origami.jpg' },
    { id: 'clay', name: 'Clay', preview: '/styles/clay.jpg' },
    { id: 'low-poly', name: 'Low Poly', preview: '/styles/low-poly.jpg' },
    { id: 'crayons', name: 'Crayons', preview: '/styles/crayons.jpg' },
    { id: 'film-noir', name: 'Film Noir', preview: '/styles/film-noir.jpg' },
    { id: 'vintage', name: 'Vintage', preview: '/styles/vintage.jpg' },
    { id: 'black-and-white', name: 'Black And White', preview: '/styles/black-and-white.jpg' },
  ];

  const visibleStyles = showAllStyles ? imageStyles : imageStyles.slice(0, 12);

  const handleStyleClick = (style: ImageStyle) => {
    if (onStyleSelect) {
      onStyleSelect(style);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          IMAGE STYLE
        </h2>
        <p className="text-gray-600">
          Choose the visual style for your AI-generated images
        </p>
      </div>

      {/* Style Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {visibleStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className={`group relative aspect-square rounded-xl overflow-hidden transition-all ${
                selectedStyle?.id === style.id
                  ? 'ring-4 ring-green-500 ring-offset-2'
                  : 'ring-2 ring-transparent hover:ring-gray-300'
              }`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400"
                style={{
                  backgroundImage: `url(${style.preview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Placeholder pattern if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-20" />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-semibold text-center">
                  {style.name}
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedStyle?.id === style.id && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Show More/Less Button */}
        <button
          onClick={() => setShowAllStyles(!showAllStyles)}
          className="w-full py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          {showAllStyles ? (
            <>
              Show Less Styles
              <ChevronUp size={20} />
            </>
          ) : (
            <>
              Show More Styles
              <ChevronDown size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIImageStyleSelector;
