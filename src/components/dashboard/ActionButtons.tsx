import { Clock, AppWindow, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  activeView: 'tools' | 'creations' | 'community';
  onViewChange: (view: 'tools' | 'creations' | 'community') => void;
}

const ActionButtons = ({ activeView, onViewChange }: ActionButtonsProps) => {
  return (
    <div className="w-full mt-12 mb-8">
      <div className="flex gap-4">
        <Button 
          onClick={() => onViewChange('tools')}
          variant="ghost"
          className={`px-6 py-3 rounded-lg transition-colors ${
            activeView === 'tools' 
              ? 'bg-foreground text-background hover:bg-foreground/90' 
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <AppWindow className="w-4 h-4 mr-2" />
          Apps
        </Button>
        <Button 
          onClick={() => onViewChange('creations')}
          variant="ghost"
          className={`px-6 py-3 rounded-lg transition-colors ${
            activeView === 'creations'
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Creations
        </Button>
        <Button 
          onClick={() => onViewChange('community')}
          variant="ghost"
          className={`px-6 py-3 rounded-lg transition-colors ${
            activeView === 'community'
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Community
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
