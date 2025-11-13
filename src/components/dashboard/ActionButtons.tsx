import { Clock, AppWindow, Users, ZoomIn, ZoomOut } from 'lucide-react';

interface ActionButtonsProps {
  activeView: 'tools' | 'creations' | 'community';
  onViewChange: (view: 'tools' | 'creations' | 'community') => void;
  zoomLevel?: number;
  onZoomChange?: (level: number) => void;
}

const ActionButtons = ({ activeView, onViewChange, zoomLevel = 4, onZoomChange }: ActionButtonsProps) => {
  const showZoomControl = activeView === 'creations' || activeView === 'community';
  
  return (
    <>
      <div className="w-full mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewChange('tools')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeView === 'tools' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <AppWindow size={18} />
            <span className="font-medium text-sm">Apps</span>
          </button>
          <button 
            onClick={() => onViewChange('creations')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeView === 'creations' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <Clock size={18} />
            <span className="font-medium text-sm">Creations</span>
          </button>
          <button 
            onClick={() => onViewChange('community')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeView === 'community' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <Users size={18} />
            <span className="font-medium text-sm">Community</span>
          </button>
        </div>

        {/* Zoom Control - Only show for creations/community */}
        {showZoomControl && onZoomChange && (
          <div className="flex items-center gap-3 px-4 py-2">
            <button
              onClick={() => onZoomChange(Math.min(6, zoomLevel + 1))}
              className="text-gray-400 hover:text-white transition-colors"
              title="Zoom out (show more images)"
            >
              <ZoomOut size={20} />
            </button>
            <input
              type="range"
              min="3"
              max="6"
              value={zoomLevel}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <button
              onClick={() => onZoomChange(Math.max(3, zoomLevel - 1))}
              className="text-gray-400 hover:text-white transition-colors"
              title="Zoom in (show fewer images)"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        )}
      </div>
      
      {/* Separator line */}
      <div className="w-full border-t border-border mb-8" />
    </>
  );
};

export default ActionButtons;
