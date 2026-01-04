import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuilderPanelProps {
  type: 'video' | 'document' | null;
  subType: string | null;
}

const BuilderPanel = ({ type, subType }: BuilderPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scenes, setScenes] = useState([{ id: 1, content: '' }]);

  // Only show for specific combinations
  const shouldShow = 
    (type === 'video' && subType === 'story') ||
    (type === 'document' && subType === 'ebook');

  if (!shouldShow) return null;

  const label = type === 'video' ? `Scenes (${scenes.length})` : `Chapters (${scenes.length})`;
  const itemLabel = type === 'video' ? 'Scene' : 'Chapter';

  const addScene = () => {
    setScenes([...scenes, { id: scenes.length + 1, content: '' }]);
  };

  return (
    <div className="w-full border-t border-border bg-muted/30 rounded-b-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        {label}
        <ChevronDown size={16} className={cn("transition-transform", isExpanded && "rotate-180")} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {scenes.map((scene, index) => (
            <div key={scene.id} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                {index + 1}
              </div>
              <input
                type="text"
                placeholder={`${itemLabel} ${index + 1} description...`}
                value={scene.content}
                onChange={(e) => {
                  const updated = [...scenes];
                  updated[index].content = e.target.value;
                  setScenes(updated);
                }}
                className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          ))}
          <button onClick={addScene} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus size={14} />
            Add {itemLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuilderPanel;
