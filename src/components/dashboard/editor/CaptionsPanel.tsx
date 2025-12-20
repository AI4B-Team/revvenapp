import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Captions,
  Sparkles,
  Upload,
  Play,
  Pause,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';

interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: string;
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

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const CaptionsPanel: React.FC<CaptionsPanelProps> = ({ onApplyCaptions, currentTime = 0, duration = 60 }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const generateCaptions = async () => {
    setIsGenerating(true);
    toast.info('Generating captions...');

    // Simulate AI caption generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockCaptions: Caption[] = [
      { id: '1', text: "I'm going to tell you something shocking.", startTime: 0, endTime: 3, style: selectedStyle },
      { id: '2', text: "I'm not real.", startTime: 3, endTime: 5, style: selectedStyle },
      { id: '3', text: "I wasn't born. I don't have a past.", startTime: 5, endTime: 8, style: selectedStyle },
      { id: '4', text: "I don't even exist, and yet I show up online.", startTime: 8, endTime: 12, style: selectedStyle },
      { id: '5', text: "I create content. I build influence.", startTime: 12, endTime: 15, style: selectedStyle },
      { id: '6', text: "Hi, my name is Vicki Revelle.", startTime: 15, endTime: 18, style: selectedStyle },
      { id: '7', text: "And I'm what's called a digital babe.", startTime: 18, endTime: 21, style: selectedStyle },
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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
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

      {/* Captions List */}
      {captions.length > 0 && (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Captions ({captions.length})</h4>
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
                      {editingCaption === caption.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
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
                          <p className="text-sm text-gray-800">{caption.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 font-mono">
                              {formatTime(caption.startTime)} → {formatTime(caption.endTime)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {editingCaption !== caption.id && (
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
  );
};

export default CaptionsPanel;
