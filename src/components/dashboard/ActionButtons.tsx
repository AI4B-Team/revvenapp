import { Clock, AppWindow, Users, Folder, LayoutTemplate, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionButtonsProps {
  activeView: 'tools' | 'creations' | 'templates' | 'community' | 'collections';
  onViewChange: (view: 'tools' | 'creations' | 'templates' | 'community' | 'collections') => void;
  hasSelectedType?: boolean;
  creationsFilter?: 'all' | 'edited' | 'upscaled';
  onCreationsFilterChange?: (filter: 'all' | 'edited' | 'upscaled') => void;
}

const ActionButtons = ({ activeView, onViewChange, hasSelectedType = false, creationsFilter = 'all', onCreationsFilterChange }: ActionButtonsProps) => {
  // Default order: Apps, Creations, Templates, Community, Collections
  // When type selected: Creations, Templates, Community, Collections, Apps
  const buttons = hasSelectedType ? [
    { view: 'creations' as const, icon: Clock, label: 'Creations', hasDropdown: true },
    { view: 'templates' as const, icon: LayoutTemplate, label: 'Templates', hasDropdown: false },
    { view: 'community' as const, icon: Users, label: 'Community', hasDropdown: false },
    { view: 'collections' as const, icon: Folder, label: 'Collections', hasDropdown: false },
    { view: 'tools' as const, icon: AppWindow, label: 'Apps', hasDropdown: false },
  ] : [
    { view: 'tools' as const, icon: AppWindow, label: 'Apps', hasDropdown: false },
    { view: 'creations' as const, icon: Clock, label: 'Creations', hasDropdown: true },
    { view: 'templates' as const, icon: LayoutTemplate, label: 'Templates', hasDropdown: false },
    { view: 'community' as const, icon: Users, label: 'Community', hasDropdown: false },
    { view: 'collections' as const, icon: Folder, label: 'Collections', hasDropdown: false },
  ];

  const getCreationsLabel = () => {
    switch (creationsFilter) {
      case 'edited': return 'Edited';
      case 'upscaled': return 'Upscaled';
      default: return 'Creations';
    }
  };

  return (
    <div className="w-full mt-8 mb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {buttons.map(({ view, icon: Icon, label, hasDropdown }) => (
            hasDropdown ? (
              <div key={view} className="flex items-center">
                <button
                  onClick={() => onViewChange(view)}
                  className={`px-4 py-2 rounded-l-lg flex items-center gap-2 transition ${
                    activeView === view ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{getCreationsLabel()}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`px-2 py-2 rounded-r-lg flex items-center transition border-l ${
                        activeView === view 
                          ? 'bg-primary text-primary-foreground border-primary-foreground/20' 
                          : 'bg-secondary hover:bg-secondary/80 border-border'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
                    <DropdownMenuItem 
                      onClick={() => {
                        onCreationsFilterChange?.('all');
                        onViewChange('creations');
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>All Creations</span>
                      {creationsFilter === 'all' && <Check size={14} className="ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        onCreationsFilterChange?.('edited');
                        onViewChange('creations');
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>Edited</span>
                      {creationsFilter === 'edited' && <Check size={14} className="ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        onCreationsFilterChange?.('upscaled');
                        onViewChange('creations');
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>Upscaled</span>
                      {creationsFilter === 'upscaled' && <Check size={14} className="ml-2" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
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
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
