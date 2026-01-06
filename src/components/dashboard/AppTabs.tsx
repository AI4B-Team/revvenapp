import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, Calendar, Users, DollarSign, Heart, Plus, X,
  Mail, Bot
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface AppTab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  path: string;
}

const availableApps: AppTab[] = [
  { id: 'create', label: 'Create', icon: Sparkles, color: 'text-white', bgColor: 'bg-emerald-500', path: '/create' },
  { id: 'inbox', label: 'Inbox', icon: Mail, color: 'text-white', bgColor: 'bg-blue-500', path: '/contacts' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-white', bgColor: 'bg-rose-500', path: '/social-posts' },
  { id: 'leads', label: 'Leads', icon: Users, color: 'text-white', bgColor: 'bg-orange-500', path: '/lead-generation' },
  { id: 'sales', label: 'Sales', icon: DollarSign, color: 'text-white', bgColor: 'bg-emerald-500', path: '/revenue' },
  { id: 'customers', label: 'Customers', icon: Heart, color: 'text-white', bgColor: 'bg-pink-500', path: '/contacts' },
  { id: 'agents', label: 'Agents', icon: Bot, color: 'text-white', bgColor: 'bg-cyan-500', path: '/automate' },
];

// Fixed icon buttons that always show (for quick access to favorites)
const quickAccessApps = availableApps.slice(0, 6);

interface AppTabsProps {
  className?: string;
}

const AppTabs = ({ className = '' }: AppTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Find current app based on path
  const findCurrentApp = () => {
    return availableApps.find(app => location.pathname === app.path) || availableApps[0];
  };
  
  const [activeApp, setActiveApp] = useState<AppTab>(findCurrentApp);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Update active app when route changes
  useEffect(() => {
    const currentApp = findCurrentApp();
    setActiveApp(currentApp);
  }, [location.pathname]);

  const handleAppClick = (app: AppTab) => {
    setActiveApp(app);
    navigate(app.path);
    setIsDropdownOpen(false);
  };

  const handleCloseTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close current tab - navigate to apps page or default
    navigate('/apps');
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Icon buttons for quick access - show as inactive icons */}
        {quickAccessApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp.id === app.id;
          
          if (isActive) {
            // Show expanded tab with label and close button
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${app.bgColor} ${app.color} shadow-sm`}
              >
                <Icon size={16} />
                <span>{app.label}</span>
                <X 
                  size={14} 
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 cursor-pointer"
                  onClick={handleCloseTab}
                />
              </button>
            );
          }
          
          // Show as icon-only button
          return (
            <Tooltip key={app.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleAppClick(app)}
                  className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500"
                >
                  <Icon size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{app.label}</TooltipContent>
            </Tooltip>
          );
        })}

        {/* Favorites heart button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-400">
              <Heart size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Favorites</TooltipContent>
        </Tooltip>

        {/* Add app button with dropdown */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-400"
              >
                <Plus size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add App</TooltipContent>
          </Tooltip>
          
          {/* Dropdown for adding apps */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl py-4 px-4 min-w-[320px] z-50">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Favorites</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {availableApps.slice(0, 6).map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-12 h-12 ${app.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon size={22} className={app.color} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{app.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trending</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableApps.slice(0, 6).map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={`trending-${app.id}`}
                        onClick={() => handleAppClick(app)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-12 h-12 ${app.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon size={22} className={app.color} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{app.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <button className="flex items-center gap-2 text-emerald-500 text-sm font-medium mt-4 hover:text-emerald-600">
                  <Plus size={16} />
                  Show More
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppTabs;
