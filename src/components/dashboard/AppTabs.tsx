import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Wand2, Calendar, Users, DollarSign, Heart, Plus, X,
  Mail, Bot, BarChart3, FileText, ClipboardList, FolderKanban,
  Megaphone, Search, Pin, Clock, Star, Video, Image, Music,
  Mic, BookOpen, Download, Eraser, Sparkles, Volume2, ArrowUpCircle,
  Globe, FileEdit, Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { useFavoriteApps } from '@/hooks/useFavoriteApps';

interface AppTab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  path: string;
  badge?: string;
}

export const allApps: AppTab[] = [
  { id: 'create', label: 'Create', icon: Wand2, color: 'text-white', bgColor: 'bg-emerald-500', path: '/create' },
  { id: 'editor', label: 'Editor', icon: FileEdit, color: 'text-white', bgColor: 'bg-purple-500', path: '/edit' },
  { id: 'sessions', label: 'Sessions', icon: Video, color: 'text-white', bgColor: 'bg-blue-500', path: '/sessions' },
  { id: 'ai-influencer', label: 'AI Influencer', icon: Users, color: 'text-white', bgColor: 'bg-violet-500', path: '/ai-influencer' },
  { id: 'ai-story', label: 'AI Story', icon: BookOpen, color: 'text-white', bgColor: 'bg-amber-500', path: '/ai-story' },
  { id: 'viral-shorts', label: 'Viral Shorts', icon: Zap, color: 'text-white', bgColor: 'bg-red-500', path: '/viral-shorts' },
  { id: 'voiceovers', label: 'Voiceovers', icon: Mic, color: 'text-white', bgColor: 'bg-cyan-500', path: '/voiceovers' },
  { id: 'voice-cloner', label: 'Voice Cloner', icon: Volume2, color: 'text-white', bgColor: 'bg-purple-500', path: '/voice-cloner' },
  { id: 'voice-changer', label: 'Voice Changer', icon: Music, color: 'text-white', bgColor: 'bg-pink-500', path: '/voice-changer' },
  { id: 'transcribe', label: 'Transcribe', icon: FileText, color: 'text-white', bgColor: 'bg-indigo-500', path: '/transcribe' },
  { id: 'audio-dubber', label: 'Audio Dubber', icon: Globe, color: 'text-white', bgColor: 'bg-teal-500', path: '/audio-dubber' },
  { id: 'noise-remover', label: 'Noise Remover', icon: Eraser, color: 'text-white', bgColor: 'bg-slate-500', path: '/noise-remover' },
  { id: 'background-remover', label: 'Background Remover', icon: Image, color: 'text-white', bgColor: 'bg-rose-500', path: '/background-remover' },
  { id: 'image-enhancer', label: 'Image Enhancer', icon: Sparkles, color: 'text-white', bgColor: 'bg-orange-500', path: '/image-enhancer' },
  { id: 'image-upscaler', label: 'Image Upscaler', icon: ArrowUpCircle, color: 'text-white', bgColor: 'bg-lime-600', path: '/image-upscaler' },
  { id: 'video-downloader', label: 'Video Downloader', icon: Download, color: 'text-white', bgColor: 'bg-sky-500', path: '/video-downloader' },
  { id: 'explainer-video', label: 'Explainer Video', icon: Video, color: 'text-white', bgColor: 'bg-fuchsia-500', path: '/explainer-video' },
  { id: 'ebook-creator', label: 'Ebook Creator', icon: BookOpen, color: 'text-white', bgColor: 'bg-amber-600', path: '/ebook-creator' },
  { id: 'blog-writer', label: 'Blog Writer', icon: FileEdit, color: 'text-white', bgColor: 'bg-green-500', path: '/blog-writer' },
  { id: 'social-posts', label: 'Social Posts', icon: Calendar, color: 'text-white', bgColor: 'bg-blue-600', path: '/social-posts' },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, color: 'text-white', bgColor: 'bg-red-600', path: '/newsletter' },
  { id: 'ad-copy-writer', label: 'Ad Copy Writer', icon: Megaphone, color: 'text-white', bgColor: 'bg-yellow-500', path: '/ad-copy-writer' },
  { id: 'script-writer', label: 'Script Writer', icon: FileText, color: 'text-white', bgColor: 'bg-violet-600', path: '/script-writer' },
  { id: 'email-generator', label: 'Email Generator', icon: Mail, color: 'text-white', bgColor: 'bg-cyan-600', path: '/email-generator' },
  { id: 'seo-optimizer', label: 'SEO Optimizer', icon: Search, color: 'text-white', bgColor: 'bg-emerald-600', path: '/seo-optimizer' },
  { id: 'lead-generation', label: 'Lead Generation', icon: Users, color: 'text-white', bgColor: 'bg-blue-700', path: '/lead-generation' },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot, color: 'text-white', bgColor: 'bg-purple-600', path: '/ai-agents' },
  { id: 'versus', label: 'Versus', icon: Zap, color: 'text-white', bgColor: 'bg-orange-600', path: '/versus' },
];

interface AppTabsProps {
  className?: string;
}

const RECENT_KEY = 'app-recent';
const OPEN_TABS_KEY = 'app-open-tabs';

const AppTabs = ({ className = '' }: AppTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, toggleFavorite } = useFavoriteApps();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentApps, setRecentApps] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    const saved = localStorage.getItem(OPEN_TABS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Find current app based on path
  const findCurrentApp = (): AppTab | null => {
    return allApps.find(app => location.pathname === app.path) || null;
  };
  
  const [activeAppId, setActiveAppId] = useState<string | null>(() => {
    const currentApp = findCurrentApp();
    return currentApp?.id || null;
  });
  
  // Update active app when route changes
  useEffect(() => {
    const currentApp = findCurrentApp();
    if (currentApp) {
      setActiveAppId(currentApp.id);
      // Add to open tabs if not already there
      setOpenTabs(prev => {
        if (!prev.includes(currentApp.id)) {
          return [...prev, currentApp.id];
        }
        return prev;
      });
    }
  }, [location.pathname]);

  // Save recent apps to localStorage
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentApps));
  }, [recentApps]);

  // Save open tabs to localStorage
  useEffect(() => {
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(openTabs));
  }, [openTabs]);

  const handleAppClick = (app: AppTab) => {
    setActiveAppId(app.id);
    // Add to open tabs if not already there (append to the right)
    setOpenTabs(prev => {
      if (!prev.includes(app.id)) {
        return [...prev, app.id];
      }
      return prev;
    });
    navigate(app.path);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Add to recent apps (max 6, no duplicates)
    setRecentApps(prev => {
      const filtered = prev.filter(id => id !== app.id);
      return [app.id, ...filtered].slice(0, 6);
    });
  };

  const handleCloseTab = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(id => id !== appId));
    
    // If closing the active tab, navigate to the previous tab or dashboard
    if (appId === activeAppId) {
      const remainingTabs = openTabs.filter(id => id !== appId);
      if (remainingTabs.length > 0) {
        const lastTab = remainingTabs[remainingTabs.length - 1];
        const app = allApps.find(a => a.id === lastTab);
        if (app) {
          setActiveAppId(app.id);
          navigate(app.path);
        }
      } else {
        setActiveAppId(null);
        navigate('/dashboard');
      }
    }
  };

  const handleTabClick = (app: AppTab) => {
    setActiveAppId(app.id);
    navigate(app.path);
  };

  const handleToggleFavorite = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    toggleFavorite(appId);
  };

  const favoriteApps = allApps.filter(app => favorites.includes(app.id));
  const recentAppsList = allApps.filter(app => recentApps.includes(app.id) && !favorites.includes(app.id));
  const trendingApps = allApps.filter(app => !favorites.includes(app.id));
  
  const filteredApps = searchQuery 
    ? allApps.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  // Get open tab apps in order
  const openTabApps = openTabs.map(id => allApps.find(app => app.id === id)).filter(Boolean) as AppTab[];

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
            onClick={(e) => handleToggleFavorite(e, app.id)}
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
        {/* Render all open tabs */}
        {openTabApps.map((app) => {
          const isActive = app.id === activeAppId;
          const Icon = app.icon;
          
          if (isActive) {
            // Active tab: colored pill with label
            return (
              <button
                key={app.id}
                onClick={() => handleTabClick(app)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${app.bgColor} ${app.color} shadow-sm`}
              >
                <Icon size={16} />
                <span>{app.label}</span>
                <X 
                  size={14} 
                  className="ml-1 hover:bg-white/20 rounded p-0.5 cursor-pointer"
                  onClick={(e) => handleCloseTab(e, app.id)}
                />
              </button>
            );
          } else {
            // Inactive tab: icon-only square button
            return (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleTabClick(app)}
                    className="relative p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors text-slate-500 group"
                  >
                    <Icon size={18} />
                    <button
                      onClick={(e) => handleCloseTab(e, app.id)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-200 hover:bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{app.label}</TooltipContent>
              </Tooltip>
            );
          }
        })}

        {/* Add app button with dropdown */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
              >
                <Plus size={18} strokeWidth={2.5} />
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
                      placeholder="Search Apps"
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
