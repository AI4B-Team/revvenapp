import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Trash2,
  Move,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  startTime?: number;
  duration?: number;
}

interface TextPanelProps {
  onAddToTimeline?: (text: TextOverlay) => void;
}

const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
];

const presetStyles = [
  { name: 'Title', fontSize: 48, fontWeight: 'bold' as const, color: '#ffffff' },
  { name: 'Subtitle', fontSize: 32, fontWeight: 'normal' as const, color: '#ffffff' },
  { name: 'Body', fontSize: 24, fontWeight: 'normal' as const, color: '#ffffff' },
  { name: 'Caption', fontSize: 18, fontWeight: 'normal' as const, color: '#cccccc' },
  { name: 'Quote', fontSize: 28, fontWeight: 'normal' as const, fontStyle: 'italic' as const, color: '#ffffff' },
];

const colorPresets = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

const TextPanel: React.FC<TextPanelProps> = ({ onAddToTimeline }) => {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<TextOverlay | null>(null);

  const createNewText = (preset?: typeof presetStyles[0]) => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: preset?.name || 'New Text',
      fontFamily: 'Inter',
      fontSize: preset?.fontSize || 32,
      fontWeight: preset?.fontWeight || 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      color: preset?.color || '#ffffff',
      backgroundColor: 'transparent',
    };
    setTextOverlays((prev) => [...prev, newText]);
    setEditingText(newText);
    setSelectedText(newText.id);
  };

  const updateText = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (editingText?.id === id) {
      setEditingText((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteText = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
    if (selectedText === id) {
      setSelectedText(null);
      setEditingText(null);
    }
    toast.success('Text deleted');
  };

  const addToTimeline = (text: TextOverlay) => {
    if (onAddToTimeline) {
      onAddToTimeline(text);
      toast.success('Text added to timeline');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Add Text Button */}
      <div className="mb-4">
        <button
          onClick={() => createNewText()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Text
        </button>
      </div>

      {/* Preset Styles */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Styles</h4>
        <div className="grid grid-cols-2 gap-2">
          {presetStyles.map((preset) => (
            <button
              key={preset.name}
              onClick={() => createNewText(preset)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
            >
              <span
                style={{
                  fontSize: Math.min(preset.fontSize / 3, 16),
                  fontWeight: preset.fontWeight,
                  fontStyle: preset.fontStyle || 'normal',
                }}
                className="block text-gray-800"
              >
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Editor (when editing) */}
      {editingText && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Edit Text</h4>
            <button
              onClick={() => setEditingText(null)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>
          </div>

          {/* Text Input */}
          <textarea
            value={editingText.text}
            onChange={(e) => updateText(editingText.id, { text: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
            placeholder="Enter your text..."
          />

          {/* Font Family */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Font</label>
            <select
              value={editingText.fontFamily}
              onChange={(e) => updateText(editingText.id, { fontFamily: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Size: {editingText.fontSize}px</label>
            <input
              type="range"
              min={12}
              max={120}
              value={editingText.fontSize}
              onChange={(e) => updateText(editingText.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Style Buttons */}
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() =>
                updateText(editingText.id, {
                  fontWeight: editingText.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`p-2 rounded-lg transition-colors ${
                editingText.fontWeight === 'bold' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                updateText(editingText.id, {
                  fontStyle: editingText.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-2 rounded-lg transition-colors ${
                editingText.fontStyle === 'italic' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                updateText(editingText.id, {
                  textDecoration: editingText.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`p-2 rounded-lg transition-colors ${
                editingText.textDecoration === 'underline' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={() => updateText(editingText.id, { textAlign: 'left' })}
              className={`p-2 rounded-lg transition-colors ${
                editingText.textAlign === 'left' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateText(editingText.id, { textAlign: 'center' })}
              className={`p-2 rounded-lg transition-colors ${
                editingText.textAlign === 'center' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateText(editingText.id, { textAlign: 'right' })}
              className={`p-2 rounded-lg transition-colors ${
                editingText.textAlign === 'right' ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Color</label>
            <div className="flex items-center gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => updateText(editingText.id, { color })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    editingText.color === color ? 'border-primary scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={editingText.color}
                onChange={(e) => updateText(editingText.id, { color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Add to Timeline */}
          <button
            onClick={() => addToTimeline(editingText)}
            className="w-full py-2 bg-brand-green text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Add to Timeline
          </button>
        </div>
      )}

      {/* Text List */}
      {textOverlays.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Texts</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {textOverlays.map((text) => (
                <motion.div
                  key={text.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => {
                    setSelectedText(text.id);
                    setEditingText(text);
                  }}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all flex items-center gap-3 ${
                    selectedText === text.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Move className="w-4 h-4 text-gray-400 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate"
                      style={{
                        fontFamily: text.fontFamily,
                        fontWeight: text.fontWeight,
                        fontStyle: text.fontStyle,
                        color: text.color === '#ffffff' ? '#1f2937' : text.color,
                      }}
                    >
                      {text.text}
                    </p>
                    <span className="text-xs text-gray-400">{text.fontFamily} • {text.fontSize}px</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToTimeline(text);
                    }}
                    className="p-1.5 hover:bg-green-100 rounded text-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteText(text.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextPanel;
