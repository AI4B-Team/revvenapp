import { Clock, AppWindow, Users } from 'lucide-react';

interface ActionButtonsProps {
  activeView: 'tools' | 'creations' | 'community';
  onViewChange: (view: 'tools' | 'creations' | 'community') => void;
}

const ActionButtons = ({ activeView, onViewChange }: ActionButtonsProps) => {
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
      </div>
      
      {/* Separator line */}
      <div className="w-full border-t border-border mb-8" />
    </>
  );
};

export default ActionButtons;
