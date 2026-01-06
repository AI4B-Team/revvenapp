import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Pencil, Image, Calendar, Users, DollarSign, Heart, Plus, X,
  Sparkles, Video, Music, FileText, Globe, Bot, LayoutTemplate
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
  { id: 'leads', label: 'Leads', icon: Users, color: 'text-white', bgColor: 'bg-violet-500', path: '/lead-generation' },
  { id: 'sales', label: 'Sales', icon: DollarSign, color: 'text-white', bgColor: 'bg-orange-500', path: '/revenue' },
  { id: 'customers', label: 'Customers', icon: Heart, color: 'text-white', bgColor: 'bg-pink-500', path: '/contacts' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-white', bgColor: 'bg-blue-500', path: '/social-posts' },
  { id: 'websites', label: 'Websites', icon: Globe, color: 'text-white', bgColor: 'bg-indigo-500', path: '/websites' },
  { id: 'agents', label: 'Agents', icon: Bot, color: 'text-white', bgColor: 'bg-cyan-500', path: '/automate' },
];

interface AppTabsProps {
  className?: string;
}

const AppTabs = ({ className = '' }: AppTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openTabs, setOpenTabs] = useState<AppTab[]>(() => {
    // Initialize with current app based on path
    const currentApp = availableApps.find(app => location.pathname === app.path);
    return currentApp ? [currentApp] : [availableApps[0]];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const currentApp = availableApps.find(app => location.pathname === app.path);
    return currentApp?.id || 'create';
  });

  const handleTabClick = (tab: AppTab) => {
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (openTabs.length === 1) return; // Don't close last tab
    
    const newTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(newTabs);
    
    // If closing active tab, switch to another
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      navigate(newTabs[0].path);
    }
  };

  const handleAddTab = (app: AppTab) => {
    if (!openTabs.find(t => t.id === app.id)) {
      setOpenTabs([...openTabs, app]);
    }
    setActiveTabId(app.id);
    navigate(app.path);
  };

  const unopenedApps = availableApps.filter(app => !openTabs.find(t => t.id === app.id));

  return (
    <TooltipProvider delayDuration={100}>
      <div className={`flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 ${className}`}>
        {/* Icon buttons for quick access */}
        <div className="flex items-center gap-1 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                <Pencil size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                <Image size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Image</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                <Calendar size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Calendar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                <Users size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Contacts</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                <DollarSign size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Revenue</TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Open tabs */}
        <div className="flex items-center gap-2">
          {openTabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? `${tab.bgColor} ${tab.color} shadow-md` 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {openTabs.length > 1 && (
                  <X 
                    size={14} 
                    className={`ml-1 ${isActive ? 'hover:bg-white/20' : 'hover:bg-slate-200'} rounded-full p-0.5 cursor-pointer`}
                    onClick={(e) => handleCloseTab(e, tab.id)}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Favorites / Quick access */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
              <Heart size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Favorites</TooltipContent>
        </Tooltip>

        {/* Add app button */}
        {unopenedApps.length > 0 && (
          <div className="relative group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400">
                  <Plus size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Add App</TooltipContent>
            </Tooltip>
            
            {/* Dropdown for adding apps */}
            <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {unopenedApps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleAddTab(app)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className={`w-8 h-8 ${app.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon size={16} className={app.color} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{app.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AppTabs;
