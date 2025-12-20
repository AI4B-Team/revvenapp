import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Star,
  Play,
  Plus,
  Check,
  Sliders,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface Effect {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  premium?: boolean;
}

interface EffectsPanelProps {
  onApplyEffect?: (effect: Effect) => void;
  selectedClipId?: string | null;
}

const effectCategories = ['All', 'Audio Reactive', 'Color', 'Blur', 'Distortion', 'Overlay', 'VHS'];

const effects: Effect[] = [
  { id: 'audio-dust', name: 'Audio Dust', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'audio-glitch', name: 'Audio Glitch', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'audio-glow', name: 'Audio Glow', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'audio-meltdown', name: 'Audio Meltdown', category: 'Audio Reactive', thumbnail: '/placeholder.svg', premium: true },
  { id: 'audio-mosh', name: 'Audio Mosh', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'audio-rgb', name: 'Audio RGB', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'audio-shake', name: 'Audio Shake', category: 'Audio Reactive', thumbnail: '/placeholder.svg' },
  { id: 'bw', name: 'Black & White', category: 'Color', thumbnail: '/placeholder.svg' },
  { id: 'chroma-key', name: 'Chroma Key', category: 'Color', thumbnail: '/placeholder.svg' },
  { id: 'color-grading', name: 'Color Grading', category: 'Color', thumbnail: '/placeholder.svg' },
  { id: 'color-strobe', name: 'Color Strobe', category: 'Color', thumbnail: '/placeholder.svg' },
  { id: 'night-vision', name: 'Night Vision', category: 'Color', thumbnail: '/placeholder.svg' },
  { id: 'gaussian-blur', name: 'Gaussian Blur', category: 'Blur', thumbnail: '/placeholder.svg' },
  { id: 'motion-blur', name: 'Motion Blur', category: 'Blur', thumbnail: '/placeholder.svg' },
  { id: 'radial-blur', name: 'Radial Blur', category: 'Blur', thumbnail: '/placeholder.svg' },
  { id: 'glitch', name: 'Glitch', category: 'Distortion', thumbnail: '/placeholder.svg' },
  { id: 'wave', name: 'Wave Distortion', category: 'Distortion', thumbnail: '/placeholder.svg' },
  { id: 'pixelate', name: 'Pixelate', category: 'Distortion', thumbnail: '/placeholder.svg' },
  { id: 'film-grain', name: 'Film Grain', category: 'Overlay', thumbnail: '/placeholder.svg' },
  { id: 'vignette', name: 'Vignette', category: 'Overlay', thumbnail: '/placeholder.svg' },
  { id: 'lens-flare', name: 'Lens Flare', category: 'Overlay', thumbnail: '/placeholder.svg', premium: true },
  { id: 'vhs-effect', name: 'VHS Effect', category: 'VHS', thumbnail: '/placeholder.svg' },
  { id: 'vhs-tracking', name: 'VHS Tracking', category: 'VHS', thumbnail: '/placeholder.svg' },
  { id: 'vhs-noise', name: 'VHS Noise', category: 'VHS', thumbnail: '/placeholder.svg' },
];

const EffectsPanel: React.FC<EffectsPanelProps> = ({ onApplyEffect, selectedClipId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedEffects, setAppliedEffects] = useState<Set<string>>(new Set());
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  const filteredEffects = effects.filter((effect) => {
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || effect.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const applyEffect = (effect: Effect) => {
    if (!selectedClipId) {
      toast.error('Select a clip first to apply effects');
      return;
    }

    setAppliedEffects((prev) => {
      const next = new Set(prev);
      if (next.has(effect.id)) {
        next.delete(effect.id);
        toast.success(`Removed "${effect.name}" effect`);
      } else {
        next.add(effect.id);
        toast.success(`Applied "${effect.name}" effect`);
      }
      return next;
    });

    if (onApplyEffect) {
      onApplyEffect(effect);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search effects..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {effectCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected clip indicator */}
      {selectedClipId ? (
        <div className="mb-3 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <Check className="w-4 h-4" />
          Clip selected - click effects to apply
        </div>
      ) : (
        <div className="mb-3 p-2 bg-yellow-50 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
          <Sparkles className="w-4 h-4" />
          Select a clip in the timeline first
        </div>
      )}

      {/* Effects Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {filteredEffects.map((effect) => (
            <motion.div
              key={effect.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyEffect(effect)}
              onMouseEnter={() => setPreviewEffect(effect.id)}
              onMouseLeave={() => setPreviewEffect(null)}
              className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                appliedEffects.has(effect.id)
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* Placeholder preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-500" />
              </div>

              {/* Premium badge */}
              {effect.premium && (
                <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}

              {/* Applied indicator */}
              {appliedEffects.has(effect.id) && (
                <div className="absolute top-1 left-1 bg-primary rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewEffect(effect.id);
                  }}
                  className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                >
                  <Eye className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyEffect(effect);
                  }}
                  className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                <span className="text-[10px] text-white font-medium truncate block">{effect.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Effect Settings Panel */}
      {appliedEffects.size > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700">Applied Effects ({appliedEffects.size})</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from(appliedEffects).map((effectId) => {
              const effect = effects.find((e) => e.id === effectId);
              return effect ? (
                <span
                  key={effectId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {effect.name}
                  <button
                    onClick={() => applyEffect(effect)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <span className="text-[10px]">×</span>
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectsPanel;
