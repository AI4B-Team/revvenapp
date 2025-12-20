import React, { useState } from 'react';
import { Plus, Type, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: string;
  style?: string;
  preview: string;
}

interface TextTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const textCategories = ['All', 'Simple', 'Title', 'Lower Third', 'Other'];

const simpleStyles: TextStyle[] = [
  { id: '1', name: 'Title', fontFamily: 'font-bold', fontWeight: '700', preview: 'Title' },
  { id: '2', name: 'Simple', fontFamily: 'font-normal', fontWeight: '400', preview: 'Simple' },
  { id: '3', name: 'Cursive', fontFamily: 'font-serif italic', fontWeight: '400', preview: 'Cursive' },
  { id: '4', name: 'Serif', fontFamily: 'font-serif', fontWeight: '400', preview: 'Serif' },
  { id: '5', name: 'Typewriter', fontFamily: 'font-mono', fontWeight: '400', preview: 'Typewriter' },
  { id: '6', name: 'Bold', fontFamily: 'font-black', fontWeight: '900', preview: 'bold' },
];

const titleStyles: TextStyle[] = [
  { id: 't1', name: 'Bold Traditional', fontFamily: 'font-bold', fontWeight: '700', preview: 'bold', style: 'Traditional' },
  { id: 't2', name: 'Editorial Classic', fontFamily: 'font-serif', fontWeight: '400', preview: 'Editorial', style: 'Classic' },
  { id: 't3', name: 'Modern Bauhaus', fontFamily: 'font-sans', fontWeight: '300', preview: 'Modern', style: 'Bauhaus' },
  { id: 't4', name: 'Elegant Light', fontFamily: 'font-light', fontWeight: '300', preview: 'Elegant', style: 'Light' },
  { id: 't5', name: 'Signature Industrial', fontFamily: 'font-mono', fontWeight: '600', preview: 'Signature', style: 'INDUSTRIAL' },
  { id: 't6', name: 'Reliable Typewriter', fontFamily: 'font-mono', fontWeight: '700', preview: 'RELIABLE', style: 'Typewriter' },
];

const lowerThirdStyles: TextStyle[] = [
  { id: 'l1', name: 'Clean Bar', fontFamily: 'font-sans', fontWeight: '500', preview: 'Speaker Name' },
  { id: 'l2', name: 'Gradient Stripe', fontFamily: 'font-bold', fontWeight: '700', preview: 'Title Here' },
  { id: 'l3', name: 'Minimal Line', fontFamily: 'font-light', fontWeight: '300', preview: 'Subtitle' },
];

const socialTemplates: TextTemplate[] = [
  { id: 's1', name: 'Discord', icon: '💬', color: 'bg-indigo-600' },
  { id: 's2', name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
  { id: 's3', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 's4', name: 'TikTok', icon: '♪', color: 'bg-black' },
  { id: 's5', name: 'YouTube', icon: '▶', color: 'bg-red-600' },
  { id: 's6', name: 'Twitter', icon: '𝕏', color: 'bg-gray-900' },
];

const EditorTextPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleAddText = () => {
    toast.success('Text added to timeline');
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    toast.success('Style applied');
  };

  const showCategory = (category: string) => {
    return activeCategory === 'All' || activeCategory === category;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Add Text Button */}
      <button
        onClick={handleAddText}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors mb-4"
      >
        <Type className="w-5 h-5" />
        Add Text
      </button>

      {/* Brand Kit Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="font-semibold text-gray-900">Brand Kit Styles and Templates</h4>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Drag and drop to add styles to Brand Kit</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {textCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Simple Styles */}
      {showCategory('Simple') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Simple</h4>
            <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {simpleStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`aspect-[4/3] rounded-xl flex items-center justify-center transition-all border-2 ${
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className={`text-lg ${style.fontFamily}`} style={{ fontWeight: style.fontWeight }}>
                  {style.preview}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title Styles */}
      {showCategory('Title') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Title</h4>
            <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {titleStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`aspect-[4/3] rounded-xl flex flex-col items-center justify-center p-2 transition-all border-2 ${
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className={`text-base ${style.fontFamily} leading-tight`} style={{ fontWeight: style.fontWeight }}>
                  {style.preview}
                </span>
                {style.style && (
                  <span className="text-[10px] text-gray-500 mt-1">{style.style}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lower Third */}
      {showCategory('Lower Third') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Lower Third</h4>
            <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {lowerThirdStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`aspect-[4/3] rounded-xl flex items-end justify-start p-2 transition-all border-2 bg-gray-800 ${
                  selectedStyle === style.id
                    ? 'border-primary'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="bg-white/90 px-2 py-1 rounded">
                  <span className={`text-xs text-gray-900 ${style.fontFamily}`} style={{ fontWeight: style.fontWeight }}>
                    {style.preview}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      {showCategory('Other') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Templates</h4>
            <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {socialTemplates.map((template) => (
              <button
                key={template.id}
                className="aspect-video rounded-xl bg-gray-900 flex items-end justify-start p-2 hover:ring-2 hover:ring-primary transition-all relative overflow-hidden"
              >
                <div className={`${template.color} px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-1`}>
                  <span>{template.icon}</span>
                  @username
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorTextPanel;
