import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shapes,
  Search,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
  Hexagon,
  Pentagon,
  Octagon,
  Plus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Check,
  Smile,
  Sun,
  Moon,
  Cloud,
  Zap,
  MessageCircle,
  ThumbsUp,
  Music,
  Camera,
  Film,
} from 'lucide-react';
import { toast } from 'sonner';

interface Element {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

interface ElementsPanelProps {
  onAddElement?: (element: Element) => void;
}

const elementCategories = ['All', 'Shapes', 'Arrows', 'Icons', 'Stickers'];

const shapes: Element[] = [
  { id: 'circle', name: 'Circle', category: 'Shapes', icon: <Circle className="w-full h-full" />, color: '#3B82F6' },
  { id: 'square', name: 'Square', category: 'Shapes', icon: <Square className="w-full h-full" />, color: '#10B981' },
  { id: 'triangle', name: 'Triangle', category: 'Shapes', icon: <Triangle className="w-full h-full" />, color: '#F59E0B' },
  { id: 'star', name: 'Star', category: 'Shapes', icon: <Star className="w-full h-full" />, color: '#EF4444' },
  { id: 'heart', name: 'Heart', category: 'Shapes', icon: <Heart className="w-full h-full" />, color: '#EC4899' },
  { id: 'hexagon', name: 'Hexagon', category: 'Shapes', icon: <Hexagon className="w-full h-full" />, color: '#8B5CF6' },
  { id: 'pentagon', name: 'Pentagon', category: 'Shapes', icon: <Pentagon className="w-full h-full" />, color: '#14B8A6' },
  { id: 'octagon', name: 'Octagon', category: 'Shapes', icon: <Octagon className="w-full h-full" />, color: '#F97316' },
];

const arrows: Element[] = [
  { id: 'arrow-right', name: 'Arrow Right', category: 'Arrows', icon: <ArrowRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-left', name: 'Arrow Left', category: 'Arrows', icon: <ArrowLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-up', name: 'Arrow Up', category: 'Arrows', icon: <ArrowUp className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-down', name: 'Arrow Down', category: 'Arrows', icon: <ArrowDown className="w-full h-full" />, color: '#6B7280' },
];

const icons: Element[] = [
  { id: 'smile', name: 'Smile', category: 'Icons', icon: <Smile className="w-full h-full" />, color: '#FBBF24' },
  { id: 'sun', name: 'Sun', category: 'Icons', icon: <Sun className="w-full h-full" />, color: '#F59E0B' },
  { id: 'moon', name: 'Moon', category: 'Icons', icon: <Moon className="w-full h-full" />, color: '#6366F1' },
  { id: 'cloud', name: 'Cloud', category: 'Icons', icon: <Cloud className="w-full h-full" />, color: '#60A5FA' },
  { id: 'zap', name: 'Lightning', category: 'Icons', icon: <Zap className="w-full h-full" />, color: '#FBBF24' },
  { id: 'message', name: 'Message', category: 'Icons', icon: <MessageCircle className="w-full h-full" />, color: '#10B981' },
  { id: 'thumbs-up', name: 'Thumbs Up', category: 'Icons', icon: <ThumbsUp className="w-full h-full" />, color: '#3B82F6' },
  { id: 'music', name: 'Music', category: 'Icons', icon: <Music className="w-full h-full" />, color: '#EC4899' },
  { id: 'camera', name: 'Camera', category: 'Icons', icon: <Camera className="w-full h-full" />, color: '#8B5CF6' },
  { id: 'film', name: 'Film', category: 'Icons', icon: <Film className="w-full h-full" />, color: '#14B8A6' },
];

const stickers: Element[] = [
  { id: 'sticker-fire', name: 'Fire', category: 'Stickers', icon: <span className="text-2xl">🔥</span>, color: 'transparent' },
  { id: 'sticker-100', name: '100', category: 'Stickers', icon: <span className="text-2xl">💯</span>, color: 'transparent' },
  { id: 'sticker-rocket', name: 'Rocket', category: 'Stickers', icon: <span className="text-2xl">🚀</span>, color: 'transparent' },
  { id: 'sticker-star', name: 'Star', category: 'Stickers', icon: <span className="text-2xl">⭐</span>, color: 'transparent' },
  { id: 'sticker-sparkle', name: 'Sparkle', category: 'Stickers', icon: <span className="text-2xl">✨</span>, color: 'transparent' },
  { id: 'sticker-heart', name: 'Heart', category: 'Stickers', icon: <span className="text-2xl">❤️</span>, color: 'transparent' },
  { id: 'sticker-clap', name: 'Clap', category: 'Stickers', icon: <span className="text-2xl">👏</span>, color: 'transparent' },
  { id: 'sticker-eyes', name: 'Eyes', category: 'Stickers', icon: <span className="text-2xl">👀</span>, color: 'transparent' },
  { id: 'sticker-party', name: 'Party', category: 'Stickers', icon: <span className="text-2xl">🎉</span>, color: 'transparent' },
  { id: 'sticker-money', name: 'Money', category: 'Stickers', icon: <span className="text-2xl">💰</span>, color: 'transparent' },
  { id: 'sticker-crown', name: 'Crown', category: 'Stickers', icon: <span className="text-2xl">👑</span>, color: 'transparent' },
  { id: 'sticker-brain', name: 'Brain', category: 'Stickers', icon: <span className="text-2xl">🧠</span>, color: 'transparent' },
];

const allElements = [...shapes, ...arrows, ...icons, ...stickers];

const ElementsPanel: React.FC<ElementsPanelProps> = ({ onAddElement }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedElements, setAddedElements] = useState<Set<string>>(new Set());

  const filteredElements = allElements.filter((el) => {
    const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || el.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addElement = (element: Element) => {
    setAddedElements((prev) => new Set([...prev, element.id]));
    toast.success(`Added "${element.name}" to canvas`);

    if (onAddElement) {
      onAddElement(element);
    }

    // Remove the added indicator after 1 second
    setTimeout(() => {
      setAddedElements((prev) => {
        const next = new Set(prev);
        next.delete(element.id);
        return next;
      });
    }, 1000);
  };

  const groupedElements = {
    Shapes: shapes,
    Arrows: arrows,
    Icons: icons,
    Stickers: stickers,
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
          placeholder="Search Elements"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {elementCategories.map((cat) => (
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

      {/* Elements */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {selectedCategory === 'All' ? (
          Object.entries(groupedElements).map(([category, elements]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
              <div className="grid grid-cols-4 gap-2">
                {elements.map((element) => (
                  <motion.button
                    key={element.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addElement(element)}
                    draggable
                    onDragStart={(e) => {
                      const dragEvent = e as unknown as React.DragEvent;
                      dragEvent.dataTransfer?.setData(
                        'application/json',
                        JSON.stringify({ type: 'element', ...element })
                      );
                    }}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all relative ${
                      addedElements.has(element.id)
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{ color: element.color !== 'transparent' ? element.color : undefined }}
                  >
                    <div className="w-6 h-6">{element.icon}</div>
                    {addedElements.has(element.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredElements.map((element) => (
              <motion.button
                key={element.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addElement(element)}
                draggable
                onDragStart={(e) => {
                  const dragEvent = e as unknown as React.DragEvent;
                  dragEvent.dataTransfer?.setData(
                    'application/json',
                    JSON.stringify({ type: 'element', ...element })
                  );
                }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                  addedElements.has(element.id)
                    ? 'bg-green-100 ring-2 ring-green-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{ color: element.color !== 'transparent' ? element.color : undefined }}
              >
                <div className="w-6 h-6">{element.icon}</div>
                <span className="text-[9px] text-gray-500 truncate max-w-full px-1">{element.name}</span>
                {addedElements.has(element.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="mt-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
        <Shapes className="w-4 h-4" />
        Drag elements to the canvas or click to add
      </div>
    </div>
  );
};

export default ElementsPanel;
