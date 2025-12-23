import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Captions,
  Sparkles,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  Type,
  Search,
  Smile,
  BarChart2,
  Languages,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: string;
  emoji?: string;
}

interface CaptionStyle {
  id: string;
  name: string;
  className: string;
  preview: React.ReactNode;
}

interface CaptionsPanelProps {
  onApplyCaptions?: (captions: Caption[]) => void;
  currentTime?: number;
  duration?: number;
}

const captionStyles: CaptionStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    className: 'bg-black/80 text-white px-3 py-1',
    preview: <div className="bg-black/80 text-white px-2 py-0.5 text-xs rounded">Classic</div>,
  },
  {
    id: 'yellow-slam',
    name: 'Yellow Slam',
    className: 'bg-yellow-500 text-black px-3 py-1 font-bold',
    preview: <div className="bg-yellow-500 text-black px-2 py-0.5 text-xs rounded font-bold">SLAM</div>,
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    className: 'bg-transparent text-pink-500 px-3 py-1 font-bold drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]',
    preview: <div className="text-pink-500 px-2 py-0.5 text-xs font-bold drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">Neon</div>,
  },
  {
    id: 'brat',
    name: 'Brat',
    className: 'bg-lime-400 text-black px-3 py-1 font-black uppercase',
    preview: <div className="bg-lime-400 text-black px-2 py-0.5 text-xs font-black">BRAT</div>,
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    className: 'bg-purple-600 text-white px-3 py-1 font-bold rotate-[-2deg]',
    preview: <div className="bg-purple-600 text-white px-2 py-0.5 text-xs font-bold rotate-[-2deg]">Chaos</div>,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    className: 'bg-transparent text-white px-3 py-1 font-serif italic border-b-2 border-white',
    preview: <div className="text-gray-800 px-2 py-0.5 text-xs italic border-b border-gray-400">Elegant</div>,
  },
  {
    id: 'outline',
    name: 'Outline',
    className: 'bg-transparent text-white px-3 py-1 font-bold [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000]',
    preview: <div className="text-white px-2 py-0.5 text-xs font-bold [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]">Outline</div>,
  },
  {
    id: 'gradient',
    name: 'Gradient',
    className: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 font-medium',
    preview: <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 text-xs rounded">Gradient</div>,
  },
];

const emojiOptions = ['😊', '🎬', '📊', '🌍', '🔥', '💡', '❤️', '⭐'];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const formatTimeRange = (startSeconds: number, endSeconds: number): string => {
  const formatShort = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };
  return `${formatShort(startSeconds)} - ${formatShort(endSeconds)}`;
};

const CaptionsPanel: React.FC<CaptionsPanelProps> = ({ onApplyCaptions, currentTime = 0, duration = 60 }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'style'>('edit');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<'sentence' | 'word'>('sentence');

  const generateCaptions = async () => {
    setIsGenerating(true);
    toast.info('Generating captions...');

    // Simulate AI caption generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockCaptions: Caption[] = [
      { id: '1', text: 'At a certain point,', startTime: 0, endTime: 0.8, style: selectedStyle, emoji: '🎬' },
      { id: '2', text: 'you just take all of', startTime: 0.8, endTime: 2.76, style: selectedStyle },
      { id: '3', text: 'the qualitative data', startTime: 2.76, endTime: 4.8, style: selectedStyle, emoji: '📊' },
      { id: '4', text: "that's coming in.", startTime: 4.8, endTime: 4.9, style: selectedStyle },
      { id: '5', text: 'If you have', startTime: 5.44, endTime: 6.14, style: selectedStyle },
      { id: '6', text: 'customer feedback', startTime: 6.14, endTime: 8, style: selectedStyle },
      { id: '7', text: "you're getting from", startTime: 8, endTime: 10, style: selectedStyle },
    ];

    setCaptions(mockCaptions);
    setIsGenerating(false);
    toast.success('Captions generated!');

    if (onApplyCaptions) {
      onApplyCaptions(mockCaptions);
    }
  };

  const updateCaption = (id: string, updates: Partial<Caption>) => {
    setCaptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCaption = (id: string) => {
    setCaptions((prev) => prev.filter((c) => c.id !== id));
    toast.success('Caption deleted');
  };

  const startEditing = (caption: Caption) => {
    setEditingCaption(caption.id);
    setEditText(caption.text);
  };

  const saveEdit = (id: string) => {
    updateCaption(id, { text: editText });
    setEditingCaption(null);
    setEditText('');
  };

  const applyStyleToAll = (styleId: string) => {
    setCaptions((prev) => prev.map((c) => ({ ...c, style: styleId })));
    setSelectedStyle(styleId);
    toast.success('Style applied to all captions');
  };

  const addManualCaption = () => {
    const newCaption: Caption = {
      id: `caption-${Date.now()}`,
      text: 'New caption',
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
      style: selectedStyle,
    };
    setCaptions((prev) => [...prev, newCaption]);
    startEditing(newCaption);
  };

  const setEmojiForCaption = (captionId: string, emoji: string | undefined) => {
    updateCaption(captionId, { emoji });
  };

  const filteredCaptions = captions.filter(c => 
    searchQuery ? c.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs: Edit / Style */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full mb-4">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'edit'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'style'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Style
        </button>
      </div>

      {/* Edit Tab Content */}
      {activeTab === 'edit' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Tools Row */}
          <div className="flex items-center gap-2 mb-4">
            {/* Search bar */}
            <div className="flex items-center gap-2 flex-1 px-3 py-1.5 border border-gray-300 rounded-lg">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-6 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-gray-400 px-0"
              />
            </div>

            {/* Display mode toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Captions className="w-4 h-4" />
                  {displayMode === 'sentence' ? 'Sentence' : 'Word'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => setDisplayMode('sentence')}>
                  Sentence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDisplayMode('word')}>
                  Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Icon buttons */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Alignment">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Translate">
              <Languages className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 space-y-2">
            <button
              onClick={generateCaptions}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-colors w-full justify-center disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto Generate Captions
                </>
              )}
            </button>
            <div className="flex gap-2">
              <button
                onClick={addManualCaption}
                className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors justify-center"
              >
                <Type className="w-4 h-4" />
                Add Manual
              </button>
              <button className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors justify-center">
                <Upload className="w-4 h-4" />
                Import SRT
              </button>
            </div>
          </div>

          {/* Captions List - Edit View */}
          {filteredCaptions.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredCaptions.map((caption) => (
                    <motion.div
                      key={caption.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`border-b border-gray-100 pb-3 ${
                        currentTime >= caption.startTime && currentTime < caption.endTime
                          ? 'bg-primary/5 -mx-2 px-2 rounded-lg'
                          : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <div className="text-xs text-gray-400 font-mono mb-1">
                        {formatTimeRange(caption.startTime, caption.endTime)}
                      </div>
                      
                      {/* Caption text and emoji */}
                      <div className="flex items-start justify-between gap-2">
                        {editingCaption === caption.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(caption.id);
                                if (e.key === 'Escape') setEditingCaption(null);
                              }}
                            />
                            <button
                              onClick={() => saveEdit(caption.id)}
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCaption(null)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p 
                              className="flex-1 text-sm text-gray-800 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"
                              onClick={() => startEditing(caption)}
                            >
                              {caption.text.split(' ').map((word, idx) => (
                                <span key={idx} className="hover:underline decoration-gray-400">
                                  {word}{idx < caption.text.split(' ').length - 1 ? ' ' : ''}
                                </span>
                              ))}
                            </p>
                            
                            {/* Emoji selector */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
                                  caption.emoji 
                                    ? 'bg-gray-100' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                                }`}>
                                  {caption.emoji || <Smile className="w-4 h-4" />}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover p-2">
                                <div className="grid grid-cols-4 gap-1">
                                  {emojiOptions.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => setEmojiForCaption(caption.id, emoji)}
                                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                                {caption.emoji && (
                                  <button
                                    onClick={() => setEmojiForCaption(caption.id, undefined)}
                                    className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 py-1"
                                  >
                                    Remove
                                  </button>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Empty State */}
          {captions.length === 0 && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <Captions className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No Captions Yet</h3>
              <p className="text-sm text-gray-500 max-w-[240px]">
                Generate captions automatically from your video's audio or add them manually
              </p>
            </div>
          )}
        </div>
      )}

      {/* Style Tab Content */}
      {activeTab === 'style' && (
        <div className="flex-1 overflow-y-auto">
          {/* Style Picker */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Caption Style</h4>
            <div className="grid grid-cols-4 gap-2">
              {captionStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => applyStyleToAll(style.id)}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    selectedStyle === style.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {style.preview}
                  <span className="text-[10px] text-gray-600">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Captions List Preview */}
          {captions.length > 0 && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Preview ({captions.length})</h4>
                <button
                  onClick={() => {
                    if (onApplyCaptions) {
                      onApplyCaptions(captions);
                      toast.success('Captions applied to timeline');
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Apply All
                </button>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {captions.map((caption, index) => (
                    <motion.div
                      key={caption.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-3 rounded-lg border transition-all ${
                        currentTime >= caption.startTime && currentTime < caption.endTime
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-400 font-mono w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{caption.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 font-mono">
                              {formatTime(caption.startTime)} → {formatTime(caption.endTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(caption)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-600"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCaption(caption.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaptionsPanel;
