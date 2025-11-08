import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { 
  Search, Sparkles, Image, Video, Music, FileText, Code,
  ChevronDown, HelpCircle, Bell, Settings, MoreHorizontal, Bot, FolderOpen, Briefcase,
  UserCircle, Mic, Users, BookOpen, Target, Calendar, MessageSquarePlus, Clock, Edit,
  Globe, Mail, DollarSign, LayoutTemplate, Move, ArrowUpCircle, UserPlus, Volume2, Disc
} from 'lucide-react';
import OnboardingProgress from './OnboardingProgress';
import SearchDialog from './SearchDialog';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAssistantPage?: boolean;
  isMonetizePage?: boolean;
  isAutomatePage?: boolean;
}

const Sidebar = ({ activeTab, onTabChange, isAssistantPage = false, isMonetizePage = false, isAutomatePage = false }: SidebarProps) => {
  const sidebarItems = [
    { icon: <FileText size={18} />, label: 'Dashboard', link: '/' },
    { icon: <Search size={18} />, label: 'Search', shortcut: '⌘F', link: '/' },
    { icon: <Bot size={18} />, label: 'Assistant', link: '/assistant' },
  ];

  const defaultNavItems = [
    { icon: <Users size={18} />, label: 'Contacts', color: 'text-brand-green', link: '/contacts' },
    { icon: <DollarSign size={18} />, label: 'Revenue', color: 'text-brand-yellow', link: '/revenue' },
  ];

  const imageNavItems = [
    { icon: <Edit size={18} />, label: 'Create', color: 'text-brand-yellow' },
    { icon: <Image size={18} />, label: 'Edit', color: 'text-brand-green' },
    { icon: <Video size={18} />, label: 'Upscale', color: 'text-brand-blue' },
    { icon: <FileText size={18} />, label: 'Batch', color: 'text-brand-yellow' },
  ];

  const videoNavItems = [
    { icon: <Video size={18} />, label: 'Lip-Sync', color: 'text-brand-blue' },
    { icon: <Move size={18} />, label: 'Motion-Sync', color: 'text-brand-yellow' },
    { icon: <ArrowUpCircle size={18} />, label: 'Upscale', color: 'text-brand-green' },
  ];

  const audioNavItems = [
    { icon: <Mic size={18} />, label: 'Create Voice', color: 'text-brand-green' },
    { icon: <Disc size={18} />, label: 'Clone Voice', color: 'text-brand-yellow' },
    { icon: <Volume2 size={18} />, label: 'Sound Effects', color: 'text-brand-blue' },
    { icon: <Music size={18} />, label: 'Music', color: 'text-brand-green' },
    { icon: <Mic size={18} />, label: 'Dubbing', color: 'text-brand-yellow' },
  ];

  const assistantNavItems: Array<{ icon: JSX.Element; label: string; color: string; isDropdown?: boolean }> = [];

  const automateNavItems = [
    { 
      icon: <Bot size={18} />, 
      label: 'Agents', 
      color: 'text-brand-blue'
    },
    { 
      icon: <LayoutTemplate size={18} />, 
      label: 'Templates', 
      color: 'text-brand-green'
    },
  ];

  const monetizeNavItems = [
    { 
      icon: <Globe size={18} />, 
      label: 'Sites', 
      color: 'text-brand-blue',
      isDropdown: true,
      subItems: ['Websites', 'Funnels', 'Stores']
    },
    { 
      icon: <Mail size={18} />, 
      label: 'Marketing', 
      color: 'text-brand-green',
      isDropdown: true,
      subItems: ['Emails', 'Social']
    },
    { 
      icon: <DollarSign size={18} />, 
      label: 'Ads', 
      color: 'text-brand-yellow'
    },
  ];

  const navItems: Array<{ icon: JSX.Element; label: string; color: string; isDropdown?: boolean; subItems?: string[]; link?: string }> = 
    isAutomatePage ? automateNavItems :
    isMonetizePage ? monetizeNavItems : 
    isAssistantPage ? assistantNavItems : 
    (activeTab === 'Image' ? imageNavItems : 
     activeTab === 'Video' ? videoNavItems : 
     activeTab === 'Audio' ? audioNavItems :
     defaultNavItems);

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd+F or Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const recentChats = [
    { id: 1, title: 'Design a logo for...', time: '2 hours ago' },
    { id: 2, title: 'Create a character...', time: '5 hours ago' },
    { id: 3, title: 'Write blog content...', time: 'Yesterday' },
    { id: 4, title: 'Generate a video...', time: '2 days ago' },
  ];

  const workspaces = [
    { name: 'Dolmar Workspace', initial: 'D', bgColor: 'bg-brand-green' },
    { name: 'Brian Workspace', initial: 'B', bgColor: 'bg-brand-blue' },
    { name: 'Team Workspace', initial: 'T', bgColor: 'bg-brand-yellow' },
  ];

  return (
    <>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <div className="w-64 bg-sidebar text-sidebar-text flex flex-col">
        {/* Logo */}
      <div className="p-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wider">REVVEN</h1>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 mb-6 relative">
        <button 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 bg-brand-green rounded-lg hover:bg-brand-green/90 transition"
        >
          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-sm font-bold text-primary">
            D
          </div>
          <span className="flex-1 text-left text-sm text-primary font-medium">Dolmar Workspace</span>
          <ChevronDown size={16} className={`transition-transform text-primary ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isWorkspaceOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-brand-green rounded-lg shadow-lg z-50 py-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition text-primary border-b border-primary/20 mb-2">
              <Search size={16} />
              <span className="flex-1 text-left text-sm">Search Projects</span>
            </button>
            {workspaces.map((workspace, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition text-primary"
              >
                <div className={`w-8 h-8 ${workspace.bgColor} rounded flex items-center justify-center text-sm font-bold text-primary`}>
                  {workspace.initial}
                </div>
                <span className="flex-1 text-left text-sm">{workspace.name}</span>
              </button>
            ))}
            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition bg-primary/5 mt-2 border-t border-primary/20 text-primary">
              <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center text-sm font-bold text-primary">
                +
              </div>
              <span className="flex-1 text-left text-sm">Create Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item, idx) => (
          item.label === 'Search' ? (
            <button
              key={idx}
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
            >
              <span className="text-sidebar-muted">
                {item.icon}
              </span>
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-sidebar-muted">{item.shortcut}</span>
              )}
            </button>
          ) : (
            <NavLink
              key={idx}
              to={item.link || '/'}
              end
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
              activeClassName="bg-sidebar-active"
            >
              <span className="text-sidebar-muted">
                {item.icon}
              </span>
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-sidebar-muted">{item.shortcut}</span>
              )}
            </NavLink>
          )
        ))}

        {/* Brand Section */}
        <div className="pt-2">
          <button 
            onClick={() => setIsBrandOpen(!isBrandOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
              isBrandOpen ? 'bg-sidebar-active' : ''
            }`}
          >
            <Briefcase size={18} className="text-sidebar-muted" />
            <span className="flex-1 text-left text-sm">Brand</span>
            <ChevronDown size={18} className={`text-sidebar-muted transition-transform ${isBrandOpen ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          {isBrandOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <UserCircle size={14} />
                <span className="text-sm">Identity</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <Mic size={14} />
                <span className="text-sm">Voice</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <Users size={14} />
                <span className="text-sm">Characters</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <BookOpen size={14} />
                <span className="text-sm">Knowledgebase</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <Target size={14} />
                <span className="text-sm">Campaigns</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text w-full text-left">
                <Calendar size={14} />
                <span className="text-sm">Calendar</span>
              </button>
            </div>
          )}
        </div>

        {/* Library Section */}
        <div className="pt-2">
          <button 
            onClick={() => setIsAssetsOpen(!isAssetsOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
              isAssetsOpen ? 'bg-sidebar-active' : ''
            }`}
          >
            <FolderOpen size={18} className="text-sidebar-muted" />
            <span className="flex-1 text-left text-sm">Library</span>
            <ChevronDown size={18} className={`text-sidebar-muted transition-transform ${isAssetsOpen ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          {isAssetsOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-sidebar-muted rounded"></div>
                <span className="text-sm text-sidebar-muted">Content</span>
                <span className="ml-auto text-xs text-sidebar-muted">48</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-brand-yellow rounded"></div>
                <span className="text-sm text-sidebar-muted">Images</span>
                <span className="ml-auto text-xs text-sidebar-muted">16</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-brand-blue rounded"></div>
                <span className="text-sm text-sidebar-muted">Videos</span>
                <span className="ml-auto text-xs text-sidebar-muted">8</span>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text">
                <span className="text-sm">+ New Folder</span>
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="pt-4 pb-2 px-3">
          <div className="h-px bg-sidebar-hover"></div>
        </div>

        <div className="space-y-1">
          {navItems.map((item, idx) => (
            item.isDropdown ? (
              <div key={idx}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      setOpenDropdowns(prev => ({
                        ...prev,
                        [item.label]: !prev[item.label]
                      }));
                    } else {
                      setIsRecentOpen(!isRecentOpen);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
                    (item.subItems ? openDropdowns[item.label] : isRecentOpen) ? 'bg-sidebar-active' : ''
                  }`}
                >
                  <span className={item.color}>{item.icon}</span>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  <ChevronDown size={18} className={`text-sidebar-muted transition-transform ${
                    (item.subItems ? openDropdowns[item.label] : isRecentOpen) ? 'rotate-0' : '-rotate-90'
                  }`} />
                </button>
                {(item.subItems ? openDropdowns[item.label] : isRecentOpen) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems ? (
                      item.subItems.map((subItem, subIdx) => (
                        <button
                          key={subIdx}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover rounded-lg text-left"
                        >
                          <span className="text-sm">{subItem}</span>
                        </button>
                      ))
                    ) : (
                      recentChats.map((chat) => (
                        <button
                          key={chat.id}
                          className="w-full flex flex-col gap-1 px-3 py-2 text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover rounded-lg text-left"
                        >
                          <span className="text-sm truncate">{chat.title}</span>
                          <span className="text-xs opacity-70">{chat.time}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : item.link ? (
              <NavLink
                key={idx}
                to={item.link}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover`}
                activeClassName="bg-sidebar-active"
              >
                <span className={item.color}>{item.icon}</span>
                <span className="flex-1 text-left text-sm">{item.label}</span>
              </NavLink>
            ) : (
              <button
                key={idx}
                onClick={() => onTabChange(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
                  activeTab === item.label ? 'bg-sidebar-active' : ''
                }`}
              >
                <span className={item.color}>{item.icon}</span>
                <span className="flex-1 text-left text-sm">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </nav>

      {/* Onboarding Progress */}
      <OnboardingProgress />

      {/* Credits Section */}
      <div className="p-4 space-y-3 bg-sidebar">
        <div className="bg-sidebar border-2 border-brand-green rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-sidebar-text">Usage Credits</span>
            <HelpCircle size={14} className="text-sidebar-muted" />
          </div>
          <div className="text-xs text-sidebar-muted mb-2">10000 / 98000 Used</div>
          <div className="w-full bg-sidebar-hover rounded-full h-2 mb-3">
            <div className="bg-brand-green h-2 rounded-full" style={{ width: '10.2%' }}></div>
          </div>
          <div className="text-sm text-brand-green font-semibold mb-3">88000 Credits Remaining</div>
          <button className="w-full bg-brand-green hover:opacity-90 text-primary font-semibold py-2 rounded-lg transition">
            Purchase Extra Credit
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
