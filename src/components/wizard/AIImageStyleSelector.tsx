import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';

interface ImageStyle {
  id: string;
  name: string;
  preview: string;
  gradient?: string;
  description?: string;
}

interface AIImageStyleSelectorProps {
  onStyleSelect?: (style: ImageStyle) => void;
  selectedStyle?: ImageStyle | null;
}

const AIImageStyleSelector: React.FC<AIImageStyleSelectorProps> = ({ onStyleSelect, selectedStyle }) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  const imageStyles: ImageStyle[] = [
    { 
      id: 'realistic', 
      name: 'Realistic', 
      preview: '/styles/realistic.jpg',
      gradient: 'from-amber-600 via-orange-500 to-rose-500',
      description: 'Photo-realistic imagery'
    },
    { 
      id: 'cinematic', 
      name: 'Cinematic', 
      preview: '/styles/cinematic.jpg',
      gradient: 'from-slate-800 via-slate-600 to-amber-700',
      description: 'Movie-like dramatic shots'
    },
    { 
      id: 'anime', 
      name: 'Anime', 
      preview: '/styles/anime.jpg',
      gradient: 'from-pink-500 via-purple-500 to-blue-500',
      description: 'Japanese animation style'
    },
    { 
      id: '3d-cartoon', 
      name: '3D Cartoon', 
      preview: '/styles/3d-cartoon.jpg',
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      description: 'Pixar-like 3D renders'
    },
    { 
      id: 'comic-book', 
      name: 'Comic Book', 
      preview: '/styles/comic-book.jpg',
      gradient: 'from-yellow-400 via-red-500 to-blue-600',
      description: 'Bold comic illustrations'
    },
    { 
      id: 'pop-art', 
      name: 'Pop Art', 
      preview: '/styles/pop-art.jpg',
      gradient: 'from-fuchsia-500 via-yellow-400 to-cyan-400',
      description: 'Warhol-inspired visuals'
    },
    { 
      id: 'fantasy-art', 
      name: 'Fantasy Art', 
      preview: '/styles/fantasy-art.jpg',
      gradient: 'from-purple-700 via-violet-500 to-indigo-800',
      description: 'Magical and mythical'
    },
    { 
      id: 'vector-portrait', 
      name: 'Vector Portrait', 
      preview: '/styles/vector-portrait.jpg',
      gradient: 'from-emerald-500 via-teal-400 to-cyan-500',
      description: 'Clean vector graphics'
    },
    { 
      id: 'neon-punk', 
      name: 'Neon Punk', 
      preview: '/styles/neon-punk.jpg',
      gradient: 'from-pink-600 via-purple-600 to-blue-700',
      description: 'Vibrant neon glow'
    },
    { 
      id: 'cyberpunk', 
      name: 'Cyberpunk', 
      preview: '/styles/cyberpunk.jpg',
      gradient: 'from-cyan-500 via-violet-600 to-fuchsia-600',
      description: 'Futuristic dystopia'
    },
    { 
      id: 'studio-ghibli', 
      name: 'Studio Ghibli', 
      preview: '/styles/studio-ghibli.jpg',
      gradient: 'from-sky-400 via-emerald-400 to-lime-400',
      description: 'Miyazaki-inspired art'
    },
    { 
      id: 'pixar-studio', 
      name: 'Pixar Studio', 
      preview: '/styles/pixar-studio.jpg',
      gradient: 'from-orange-400 via-amber-400 to-yellow-400',
      description: 'Charming 3D animation'
    },
    { 
      id: 'vector-cartoon', 
      name: 'Vector Cartoon', 
      preview: '/styles/vector-cartoon.jpg',
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      description: 'Flat illustration style'
    },
    { 
      id: 'pencil-art', 
      name: 'Pencil Art', 
      preview: '/styles/pencil-art.jpg',
      gradient: 'from-stone-400 via-stone-500 to-stone-600',
      description: 'Hand-drawn sketches'
    },
    { 
      id: 'charcoal-art', 
      name: 'Charcoal Art', 
      preview: '/styles/charcoal-art.jpg',
      gradient: 'from-zinc-600 via-neutral-700 to-stone-800',
      description: 'Dramatic charcoal drawings'
    },
    { 
      id: 'graffiti', 
      name: 'Graffiti', 
      preview: '/styles/graffiti.jpg',
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      description: 'Urban street art'
    },
    { 
      id: 'watercolor', 
      name: 'Watercolor', 
      preview: '/styles/watercolor.jpg',
      gradient: 'from-rose-300 via-sky-300 to-violet-300',
      description: 'Soft painted textures'
    },
    { 
      id: 'ink-sketch', 
      name: 'Ink Sketch', 
      preview: '/styles/ink-sketch.jpg',
      gradient: 'from-slate-700 via-gray-600 to-slate-500',
      description: 'Bold ink strokes'
    },
    { 
      id: 'isometric', 
      name: 'Isometric', 
      preview: '/styles/isometric.jpg',
      gradient: 'from-indigo-500 via-blue-500 to-cyan-400',
      description: '3D isometric views'
    },
    { 
      id: 'line-art', 
      name: 'Line Art', 
      preview: '/styles/line-art.jpg',
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      description: 'Minimalist outlines'
    },
    { 
      id: 'colored-line-art', 
      name: 'Colored Line Art', 
      preview: '/styles/colored-line-art.jpg',
      gradient: 'from-rose-400 via-violet-400 to-indigo-400',
      description: 'Vibrant line work'
    },
    { 
      id: 'origami', 
      name: 'Origami', 
      preview: '/styles/origami.jpg',
      gradient: 'from-red-400 via-orange-300 to-yellow-300',
      description: 'Paper-folded aesthetic'
    },
    { 
      id: 'clay', 
      name: 'Clay', 
      preview: '/styles/clay.jpg',
      gradient: 'from-orange-300 via-amber-300 to-yellow-200',
      description: 'Claymation style'
    },
    { 
      id: 'low-poly', 
      name: 'Low Poly', 
      preview: '/styles/low-poly.jpg',
      gradient: 'from-teal-400 via-emerald-500 to-green-600',
      description: 'Geometric polygons'
    },
    { 
      id: 'crayons', 
      name: 'Crayons', 
      preview: '/styles/crayons.jpg',
      gradient: 'from-yellow-300 via-orange-400 to-red-400',
      description: 'Childlike crayon art'
    },
    { 
      id: 'film-noir', 
      name: 'Film Noir', 
      preview: '/styles/film-noir.jpg',
      gradient: 'from-zinc-900 via-zinc-700 to-zinc-800',
      description: 'Classic black & white drama'
    },
    { 
      id: 'vintage', 
      name: 'Vintage', 
      preview: '/styles/vintage.jpg',
      gradient: 'from-amber-200 via-orange-200 to-rose-200',
      description: 'Retro nostalgic feel'
    },
    { 
      id: 'black-and-white', 
      name: 'Black And White', 
      preview: '/styles/black-and-white.jpg',
      gradient: 'from-gray-200 via-gray-400 to-gray-600',
      description: 'Timeless monochrome'
    },
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
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-brand-green" />
          <h2 className="text-lg font-bold text-gray-900">
            IMAGE STYLE
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Choose the visual style for your AI-generated images
        </p>
      </div>

      {/* Style Grid */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visibleStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className={`group relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 ${
                selectedStyle?.id === style.id
                  ? 'ring-4 ring-brand-green ring-offset-2 scale-[1.02]'
                  : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300 hover:scale-[1.01]'
              }`}
            >
              {/* Gradient Background */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}
              />
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

              {/* Label Container */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-8 pb-3 px-3">
                <p className="text-white text-sm font-semibold text-center drop-shadow-lg">
                  {style.name}
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedStyle?.id === style.id && (
                <div className="absolute top-2 right-2 w-7 h-7 bg-brand-green rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </button>
          ))}
        </div>

        {/* Show More/Less Button */}
        <button
          onClick={() => setShowAllStyles(!showAllStyles)}
          className="w-full mt-4 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors flex items-center justify-center gap-2 border-t border-gray-200 pt-4"
        >
          {showAllStyles ? (
            <>
              Show Less Styles
              <ChevronUp size={18} />
            </>
          ) : (
            <>
              Show More Styles ({imageStyles.length - 12} more)
              <ChevronDown size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIImageStyleSelector;