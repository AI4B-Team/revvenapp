import { Clock, AppWindow, Users, Folder } from 'lucide-react';

interface ActionButtonsProps {
  activeView: 'tools' | 'creations' | 'community' | 'collections';
  onViewChange: (view: 'tools' | 'creations' | 'community' | 'collections') => void;
  hasSelectedType?: boolean;
}

const ActionButtons = ({ activeView, onViewChange, hasSelectedType = false }: ActionButtonsProps) => {
  // Default order: Apps, Creations, Community, Collections
  // When type selected: Creations, Community, Collections, Apps
  const buttons = hasSelectedType ? [
    { view: 'creations' as const, icon: Clock, label: 'Creations' },
    { view: 'community' as const, icon: Users, label: 'Community' },
    { view: 'collections' as const, icon: Folder, label: 'Collections' },
    { view: 'tools' as const, icon: AppWindow, label: 'Apps' },
  ] : [
    { view: 'tools' as const, icon: AppWindow, label: 'Apps' },
    { view: 'creations' as const, icon: Clock, label: 'Creations' },
    { view: 'community' as const, icon: Users, label: 'Community' },
    { view: 'collections' as const, icon: Folder, label: 'Collections' },
  ];

  return (
    <div className="w-full mt-8 mb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {buttons.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeView === view ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
