import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Wand2, Calendar, Users, DollarSign, Heart, Plus, X,
  Mail, Bot, BarChart3, FileText, ClipboardList, FolderKanban,
  Megaphone, Search, Pin, Clock, Star
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

interface AppTab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  path: string;
  badge?: string;
}

const allApps: AppTab[] = [
  { id: 'create', label: 'Create', icon: Wand2, color: 'text-white', bgColor: 'bg-emerald-500', path: '/create' },
  { id: 'inbox', label: 'Inbox', icon: Mail, color: 'text-white', bgColor: 'bg-blue-500', path: '/contacts' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-white', bgColor: 'bg-rose-500', path: '/social-posts' },
  { id: 'leads', label: 'Leads', icon: Users, color: 'text-white', bgColor: 'bg-orange-500', path: '/lead-generation' },
  { id: 'sales', label: 'Sales', icon: DollarSign, color: 'text-white', bgColor: 'bg-emerald-500', path: '/revenue' },
  { id: 'customers', label: 'Customers', icon: Heart, color: 'text-white', bgColor: 'bg-pink-500', path: '/contacts' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-white', bgColor: 'bg-indigo-500', path: '/revenue', badge: 'NEW' },
  { id: 'invoices', label: 'Invoices', icon: FileText, color: 'text-white', bgColor: 'bg-amber-500', path: '/revenue' },
  { id: 'reports', label: 'Reports', icon: ClipboardList, color: 'text-white', bgColor: 'bg-sky-500', path: '/revenue' },
  { id: 'contracts', label: 'Contracts', icon: FileText, color: 'text-white', bgColor: 'bg-teal-500', path: '/revenue' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-white', bgColor: 'bg-violet-500', path: '/apps' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: 'text-white', bgColor: 'bg-red-500', path: '/marketing' },
  { id: 'agents', label: 'Agents', icon: Bot, color: 'text-white', bgColor: 'bg-cyan-500', path: '/automate', badge: 'BETA' },
];

interface AppTabsProps {
  className?: string;
}

const FAVORITES_KEY = 'app-favorites';
const RECENT_KEY = 'app-recent';

const AppTabs = ({ className = '' }: AppTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : ['create', 'inbox', 'calendar', 'leads', 'sales', 'customers'];
  });
  const [recentApps, setRecentApps] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Find current app based on path
  const findCurrentApp = (): AppTab | null => {
    return allApps.find(app => location.pathname === app.path) || null;
  };
  
  const [activeApp, setActiveApp] = useState<AppTab | null>(findCurrentApp);
  
  // Update active app when route changes
  useEffect(() => {
    const currentApp = findCurrentApp();
    setActiveApp(currentApp);
  }, [location.pathname]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Save recent apps to localStorage
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentApps));
  }, [recentApps]);

  const handleAppClick = (app: AppTab) => {
    setActiveApp(app);
    navigate(app.path);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Add to recent apps (max 6, no duplicates)
    setRecentApps(prev => {
      const filtered = prev.filter(id => id !== app.id);
      return [app.id, ...filtered].slice(0, 6);
    });
  };

  const handleCloseTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveApp(null);
    navigate('/apps');
  };

  const toggleFavorite = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const favoriteApps = allApps.filter(app => favorites.includes(app.id));
  const recentAppsList = allApps.filter(app => recentApps.includes(app.id) && !favorites.includes(app.id));
  const trendingApps = allApps.filter(app => ['analytics', 'agents', 'projects', 'marketing', 'reports', 'invoices'].includes(app.id));
  
  const filteredApps = searchQuery 
    ? allApps.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const renderAppButton = (app: AppTab, showPin = false) => {
    const Icon = app.icon;
    const isFavorite = favorites.includes(app.id);
    
    return (
      <button
        key={app.id}
        onClick={() => handleAppClick(app)}
        className="relative flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 transition-colors group"
      >
        {showPin && (
          <button
            onClick={(e) => toggleFavorite(e, app.id)}
            className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200"
          >
            <Star size={12} className={isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
          </button>
        )}
        <div className={`relative w-12 h-12 ${app.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon size={22} className={app.color} />
          {app.badge && (
            <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              app.badge === 'NEW' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
            }`}>
              {app.badge}
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-700">{app.label}</span>
      </button>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Show active app tab if one is selected */}
        {activeApp && (
          <button
            onClick={() => handleAppClick(activeApp)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeApp.bgColor} ${activeApp.color} shadow-sm`}
          >
            <activeApp.icon size={16} />
            <span>{activeApp.label}</span>
            <X 
              size={14} 
              className="ml-1 hover:bg-white/20 rounded-full p-0.5 cursor-pointer"
              onClick={handleCloseTab}
            />
          </button>
        )}

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
                onClick={() => {
                  setIsDropdownOpen(false);
                  setSearchQuery('');
                }}
              />
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl min-w-[360px] z-50 overflow-hidden">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                  {/* Search Results */}
                  {filteredApps ? (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Results ({filteredApps.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {filteredApps.map((app) => renderAppButton(app, true))}
                      </div>
                      {filteredApps.length === 0 && (
                        <p className="text-sm text-slate-500 py-4 text-center">No apps found</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Favorites Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Star size={14} className="text-amber-500" />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Favorites</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {favoriteApps.slice(0, 6).map((app) => renderAppButton(app, true))}
                        </div>
                      </div>

                      {/* Recently Used Section */}
                      {recentAppsList.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recently Used</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {recentAppsList.slice(0, 3).map((app) => renderAppButton(app, true))}
                          </div>
                        </div>
                      )}

                      {/* Trending Section */}
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trending</span>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {trendingApps.slice(0, 6).map((app) => renderAppButton(app, true))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Show More */}
                <div className="p-3 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      navigate('/apps');
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium w-full py-2 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Browse All Apps
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppTabs;
