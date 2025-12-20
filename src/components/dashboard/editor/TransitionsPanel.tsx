import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Search,
  Star,
  Play,
  Plus,
  Clock,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface Transition {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  duration: number;
  premium?: boolean;
}

interface TransitionsPanelProps {
  onApplyTransition?: (transition: Transition, position: 'start' | 'end' | 'between') => void;
}

const transitionCategories = ['All', 'Basic', 'Slide', 'Wipe', '3D', 'Glitch', 'Artistic'];

const transitions: Transition[] = [
  { id: 'fade', name: 'Fade', category: 'Basic', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'dissolve', name: 'Dissolve', category: 'Basic', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'crossfade', name: 'Crossfade', category: 'Basic', thumbnail: '/placeholder.svg', duration: 0.7 },
  { id: 'slide-left', name: 'Slide Left', category: 'Slide', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'slide-right', name: 'Slide Right', category: 'Slide', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'slide-up', name: 'Slide Up', category: 'Slide', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'slide-down', name: 'Slide Down', category: 'Slide', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'push', name: 'Push', category: 'Slide', thumbnail: '/placeholder.svg', duration: 0.4 },
  { id: 'wipe-left', name: 'Wipe Left', category: 'Wipe', thumbnail: '/placeholder.svg', duration: 0.6 },
  { id: 'wipe-right', name: 'Wipe Right', category: 'Wipe', thumbnail: '/placeholder.svg', duration: 0.6 },
  { id: 'clock-wipe', name: 'Clock Wipe', category: 'Wipe', thumbnail: '/placeholder.svg', duration: 0.8 },
  { id: 'iris', name: 'Iris', category: 'Wipe', thumbnail: '/placeholder.svg', duration: 0.6 },
  { id: 'flip', name: 'Flip', category: '3D', thumbnail: '/placeholder.svg', duration: 0.6, premium: true },
  { id: 'cube', name: 'Cube', category: '3D', thumbnail: '/placeholder.svg', duration: 0.7, premium: true },
  { id: 'rotate', name: 'Rotate', category: '3D', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'zoom', name: 'Zoom', category: '3D', thumbnail: '/placeholder.svg', duration: 0.5 },
  { id: 'glitch-1', name: 'Glitch', category: 'Glitch', thumbnail: '/placeholder.svg', duration: 0.3 },
  { id: 'glitch-2', name: 'Glitch 2', category: 'Glitch', thumbnail: '/placeholder.svg', duration: 0.4 },
  { id: 'static', name: 'Static', category: 'Glitch', thumbnail: '/placeholder.svg', duration: 0.3 },
  { id: 'light-leak', name: 'Light Leak', category: 'Artistic', thumbnail: '/placeholder.svg', duration: 0.6, premium: true },
  { id: 'explosion', name: 'Explosion', category: 'Artistic', thumbnail: '/placeholder.svg', duration: 0.5, premium: true },
  { id: 'paint', name: 'Paint Brush', category: 'Artistic', thumbnail: '/placeholder.svg', duration: 0.7 },
];

const TransitionsPanel: React.FC<TransitionsPanelProps> = ({ onApplyTransition }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);

  const filteredTransitions = transitions.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const applyTransition = (transition: Transition) => {
    setSelectedTransition(transition.id);
    toast.success(`Selected "${transition.name}" transition`);

    if (onApplyTransition) {
      onApplyTransition({ ...transition, duration: transitionDuration }, 'between');
    }
  };

  const playPreview = (transitionId: string) => {
    setPreviewPlaying(transitionId);
    setTimeout(() => setPreviewPlaying(null), 1000);
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
          placeholder="Search transitions..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {transitionCategories.map((cat) => (
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

      {/* Duration Slider */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Duration
          </span>
          <span className="text-sm text-gray-900 font-mono">{transitionDuration.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.1}
          value={transitionDuration}
          onChange={(e) => setTransitionDuration(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Info */}
      <div className="mb-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-blue-700">
        <ArrowLeftRight className="w-4 h-4" />
        Drag transitions between clips on timeline
      </div>

      {/* Transitions Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {filteredTransitions.map((transition) => (
            <motion.div
              key={transition.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              draggable
              onDragStart={(e) => {
                const dragEvent = e as unknown as React.DragEvent;
                dragEvent.dataTransfer?.setData(
                  'application/json',
                  JSON.stringify({ type: 'transition', ...transition, duration: transitionDuration })
                );
              }}
              onClick={() => applyTransition(transition)}
              className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                selectedTransition === transition.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* Preview animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                {previewPlaying === transition.id ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: transitionDuration }}
                    className="w-8 h-8 bg-primary rounded"
                  />
                ) : (
                  <ArrowLeftRight className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {/* Premium badge */}
              {transition.premium && (
                <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}

              {/* Selected indicator */}
              {selectedTransition === transition.id && (
                <div className="absolute top-1 left-1 bg-primary rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPreview(transition.id);
                  }}
                  className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                >
                  <Play className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyTransition(transition);
                  }}
                  className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Name & Duration */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                <span className="text-[10px] text-white font-medium truncate block">{transition.name}</span>
                <span className="text-[8px] text-gray-400">{transition.duration}s</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransitionsPanel;
