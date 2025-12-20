import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Monitor, 
  Type, 
  List as ListIcon, 
  AlignLeft, 
  Quote, 
  Hash, 
  AudioLines,
  Captions,
  LayoutGrid,
  Mic,
  Video,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutOption {
  id: string;
  name: string;
  icon: React.ElementType;
  preview?: string;
  variants?: number;
}

interface LayoutPanelProps {
  onLayoutSelect?: (layoutId: string) => void;
  selectedLayout?: string;
  hideHeader?: boolean;
}

const LayoutPanel: React.FC<LayoutPanelProps> = ({
  onLayoutSelect,
  selectedLayout,
  hideHeader = false
}) => {
  const [activeCategory, setActiveCategory] = useState<'speaker' | 'content'>('speaker');

  const speakerLayouts: LayoutOption[] = [
    { id: 'camera', name: 'Camera', icon: Video },
    { id: 'zoom', name: 'Zoom', icon: Users },
    { id: 'screen', name: 'Screen', icon: Monitor, variants: 6 },
    { id: 'media', name: 'Media', icon: LayoutGrid },
    { id: 'multicam', name: 'Multicam', icon: Users },
    { id: 'intro', name: 'Intro', icon: Type },
  ];

  const contentLayouts: LayoutOption[] = [
    { id: 'speaker', name: 'Speaker', icon: User },
    { id: 'captions', name: 'Captions', icon: Captions },
    { id: 'text', name: 'Text', icon: Type, variants: 2 },
    { id: 'list', name: 'List', icon: ListIcon },
    { id: 'paragraph', name: 'Paragraph', icon: AlignLeft },
    { id: 'quote', name: 'Quote', icon: Quote },
    { id: 'big-fact', name: 'Big Fact', icon: Hash },
    { id: 'audiogram', name: 'Audiogram', icon: AudioLines },
  ];

  const currentLayouts = activeCategory === 'speaker' ? speakerLayouts : contentLayouts;

  const handleLayoutClick = (layout: LayoutOption) => {
    onLayoutSelect?.(layout.id);
    toast.success(`Applied ${layout.name} layout`);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header - conditionally rendered */}
      {!hideHeader && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Layouts</span>
          </div>
          <button className="text-xs text-gray-500 hover:text-gray-700">
            ···
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveCategory('speaker')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeCategory === 'speaker' 
              ? 'text-gray-900 border-b-2 border-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Speaker
        </button>
        <button
          onClick={() => setActiveCategory('content')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeCategory === 'content' 
              ? 'text-gray-900 border-b-2 border-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Content
        </button>
      </div>

      {/* Layout Grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {currentLayouts.map((layout) => {
          const Icon = layout.icon;
          const isSelected = selectedLayout === layout.id;
          
          return (
            <button
              key={layout.id}
              onClick={() => handleLayoutClick(layout)}
              className={`relative aspect-[4/3] rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 hover:border-gray-400 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Preview placeholder */}
              <div className="w-12 h-10 rounded bg-gray-200 flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* Label */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-gray-700">{layout.name}</span>
                {layout.variants && (
                  <span className="text-[10px] text-gray-400">{layout.variants} more</span>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Change Layout Pack */}
      <div className="p-3 mt-auto border-t border-gray-100">
        <button 
          onClick={() => toast.success('Opening layout packs...')}
          className="w-full py-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
        >
          Change layout pack
        </button>
      </div>
    </div>
  );
};

export default LayoutPanel;