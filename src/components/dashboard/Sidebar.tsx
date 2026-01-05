import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, Sparkles, Image, Video, Music, FileText, Code,
  ChevronDown, HelpCircle, Bell, Settings, MoreHorizontal, Bot, FolderOpen, Briefcase,
  UserCircle, Mic, Users, BookOpen, Target, Calendar, MessageSquarePlus, Clock, Edit,
  Globe, Mail, DollarSign, LayoutTemplate, Move, ArrowUpCircle, UserPlus, Volume2, Disc, MoreVertical,
  PanelLeftClose, PanelLeftOpen, LayoutGrid, Palette, Film, Package, FileBarChart, Send, Share2, Download, Maximize2, Home, AppWindow, Folder, ChevronRight, Shield, Check, Plus
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OnboardingProgress from './OnboardingProgress';
import ProjectSelector from './ProjectSelector';
import { creationsData } from '@/data/creationsData';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isAssistantPage?: boolean;
  isMonetizePage?: boolean;
  isAutomatePage?: boolean;
  onCharactersClick?: () => void;
  onIdentityClick?: () => void;
  onAssetFilterChange?: (filter: string | null) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  onEditClick?: () => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
}

const Sidebar = ({ activeTab = '', onTabChange, isAssistantPage = false, isMonetizePage = false, isAutomatePage = false, onCharactersClick, onIdentityClick, onAssetFilterChange, onCollapseChange, onEditClick, collapsed, defaultCollapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const isContactsPage = location.pathname === '/contacts';
  const isRevenuePage = location.pathname === '/revenue';
  const isOnboardingPage = location.pathname === '/onboarding';
  const isCommunityPage = location.pathname === '/community';
  const isToolsPage = location.pathname === '/tools';
  const isIntegrationsPage = location.pathname === '/integrations';
  const isAssetsPage = location.pathname === '/assets';
  const isBrandPage = location.pathname.startsWith('/brand');
  const isSettingsPage = location.pathname === '/account';
  const isEditPage = location.pathname === '/edit';
  const isEbookEditorPage = location.pathname.startsWith('/ebook-creator/new');

  // Calculate next month's first day for credit refill
  const getNextRefillDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const { isAdminOrModerator } = useUserRole();
  
  const sidebarItems = [
    { icon: <Home size={18} />, label: 'Dashboard', link: '/dashboard' },
    { icon: <Sparkles size={18} className="text-brand-yellow" />, label: 'AIVA', link: '/assistant' },
    ...(isAdminOrModerator ? [{ icon: <Shield size={18} />, label: 'Admin Panel', link: '/manage' }] : []),
  ];

  const dashboardNavItems: Array<{ icon: JSX.Element; label: string; color: string; link: string }> = [];

  const createNavItems = [
    { icon: <Image size={18} />, label: 'Image', color: 'text-brand-blue' },
    { icon: <Video size={18} />, label: 'Video', color: 'text-brand-red' },
    { icon: <Music size={18} />, label: 'Audio', color: 'text-brand-green' },
    { icon: <Palette size={18} />, label: 'Design', color: 'text-brand-yellow' },
    { icon: <FileText size={18} />, label: 'Content', color: 'text-brand-green' },
  ];

  const imageNavItems = [
    { icon: <Image size={18} />, label: 'Editor', color: 'text-brand-green', link: '/edit' },
  ];

  const videoNavItems = [
    { icon: <Film size={18} />, label: 'Editor', color: 'text-brand-green', link: '/edit', editorTab: 'video' },
  ];

  const audioNavItems = [
    { icon: <UserCircle size={18} />, label: 'Voices', color: 'text-brand-blue' },
  ];

  const designNavItems = [
    { icon: <Sparkles size={18} />, label: 'Create', color: 'text-brand-green' },
    { icon: <Edit size={18} />, label: 'Edit', color: 'text-brand-blue' },
  ];

  const contentNavItems = [
    { icon: <FileText size={18} />, label: 'Create', color: 'text-brand-green' },
    { icon: <Edit size={18} />, label: 'Edit', color: 'text-brand-blue' },
  ];

  const assistantNavItems: Array<{ icon: JSX.Element; label: string; color: string; isDropdown?: boolean }> = [];

  const automateNavItems = [
    { 
      icon: <AppWindow size={18} />, 
      label: 'Apps', 
      color: 'text-brand-yellow',
      link: '/apps'
    },
    { 
      icon: <Bot size={18} />, 
      label: 'Agents', 
      color: 'text-brand-blue',
      link: '/automate'
    },
    { 
      icon: <LayoutTemplate size={18} />, 
      label: 'Templates', 
      color: 'text-brand-green',
      link: '/templates'
    },
  ];

  const monetizeNavItems = [
    { 
      icon: <Download size={18} />, 
      label: 'Products', 
      color: 'text-brand-blue',
      link: '/products'
    },
    { 
      icon: <Globe size={18} />, 
      label: 'Sites', 
      color: 'text-brand-red',
      isDropdown: true,
      subItems: [
        { label: 'Websites', icon: <Globe size={14} /> },
        { label: 'Funnels', icon: <Move size={14} /> },
        { label: 'Stores', icon: <Package size={14} /> }
      ]
    },
    { 
      icon: <Mail size={18} />, 
      label: 'Marketing', 
      color: 'text-brand-green',
      link: '/marketing'
    },
    { 
      icon: <DollarSign size={18} />, 
      label: 'Revenue', 
      color: 'text-brand-yellow',
      link: '/revenue'
    },
    { 
      icon: <Users size={18} />, 
      label: 'Contacts', 
      color: 'text-brand-blue',
      link: '/contacts'
    },
    { 
      icon: <FileBarChart size={18} />, 
      label: 'Reports', 
      color: 'text-brand-green',
      link: '/monetize'
    },
  ];

  const navItems: Array<{ icon: JSX.Element; label: string; color: string; isDropdown?: boolean; subItems?: string[]; link?: string }> = 
    isOnboardingPage ? [] :
    isCommunityPage ? [] :
    isToolsPage ? [] :
    isIntegrationsPage ? [] :
    isAssetsPage ? [] :
    isBrandPage ? [] :
    isSettingsPage ? [] :
    isEbookEditorPage ? [] :
    isEditPage ? imageNavItems :
    isAutomatePage ? automateNavItems :
    isMonetizePage ? monetizeNavItems : 
    isAssistantPage ? assistantNavItems :
    isDashboard || isContactsPage || isRevenuePage ? dashboardNavItems :
    (activeTab === 'Image' ? imageNavItems : 
     activeTab === 'Video' ? videoNavItems : 
     activeTab === 'Audio' ? audioNavItems :
     activeTab === 'Design' ? designNavItems :
     activeTab === 'Content' ? contentNavItems :
     createNavItems);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed ?? defaultCollapsed ?? false);

  useEffect(() => {
    if (typeof collapsed === "boolean") setIsCollapsed(collapsed);
  }, [collapsed]);

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const brandProfiles = [
    { name: 'Xalina Voss', initial: 'X', bgColor: 'bg-brand-pink' },
    { name: 'Lifestyle Brand', initial: 'L', bgColor: 'bg-brand-blue' },
    { name: 'Fitness Pro', initial: 'F', bgColor: 'bg-brand-yellow' },
  ];
  
  // Notify parent component when collapse state changes
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
    const width = isCollapsed ? "4rem" : "16rem";
    document.documentElement.style.setProperty("--app-sidebar-width", width);
  }, [isCollapsed, onCollapseChange]);
  
  // Initialize dropdown state based on current page
  const isSitesPage = location.pathname === '/websites' || location.pathname === '/funnels' || location.pathname === '/store';
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    'Sites': isSitesPage
  });


  // Keep Sites dropdown open when on any sites sub-page
  useEffect(() => {
    if (isSitesPage) {
      setOpenDropdowns(prev => ({
        ...prev,
        'Sites': true
      }));
    }
  }, [isSitesPage]);

  // Calculate asset counts from creationsData
  const assetCounts = useMemo(() => {
    const images = creationsData.filter(item => item.type === 'image').length;
    const videos = creationsData.filter(item => item.type === 'video').length;
    const all = creationsData.length;
    
    return {
      all,
      favorites: 0, // Placeholder for future implementation
      content: 0, // Placeholder for future implementation
      images,
      videos,
      audio: 0, // Placeholder for future implementation
      designs: 0, // Placeholder for future implementation
    };
  }, []);

  const recentChats = [
    { id: 1, title: 'Design a logo for...', time: '2 hours ago' },
    { id: 2, title: 'Create a character...', time: '5 hours ago' },
    { id: 3, title: 'Write blog content...', time: 'Yesterday' },
    { id: 4, title: 'Generate a video...', time: '2 days ago' },
  ];

  const workspaces = [
    { name: "Dolmar's Space", initial: 'D', bgColor: 'bg-brand-green' },
    { name: "Brian's Space", initial: 'B', bgColor: 'bg-brand-blue' },
    { name: 'Team Space', initial: 'T', bgColor: 'bg-brand-yellow' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          !isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCollapsed(true)}
      />
      
      <div className={`${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 translate-x-0'} bg-sidebar text-sidebar-text flex flex-col h-screen transition-all duration-300 fixed left-0 top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-gray-800 z-50`}>
        {/* Logo & Collapse Toggle */}
        <div className="p-6 relative flex items-center justify-center flex-shrink-0">
          {!isCollapsed && (
            <Link to="/" className="hover:opacity-80 transition cursor-pointer">
              <h1 className="text-2xl font-bold tracking-wider">REVVEN</h1>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 hover:bg-sidebar-hover rounded-lg transition ${isCollapsed ? 'mx-auto' : 'absolute right-4'}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

      {/* Workspace Selector */}
      {!isCollapsed && (
        <div className="px-4 mb-2 relative flex-shrink-0">
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-brand-green rounded-lg hover:bg-brand-green/90 transition"
          >
            <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-sm font-bold text-primary">
              B
            </div>
            <span className="flex-1 text-left text-sm text-primary font-medium">Brian's Space</span>
            <ChevronDown size={16} className={`transition-transform text-primary ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
          </button>
        
          {isWorkspaceOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-[#1e1e1e] rounded-lg shadow-xl z-50 py-3 border border-gray-800">
              {/* Search Field */}
              <div className="px-3 pb-3 border-b border-gray-700">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] rounded-lg border border-gray-700">
                  <Search size={14} className="text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search Spaces" 
                    className="flex-1 text-sm bg-transparent text-gray-300 placeholder:text-gray-500 outline-none"
                  />
                </div>
              </div>
              
              {/* Space List */}
              <div className="py-2">
                {workspaces.map((workspace, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-200">{workspace.name}</span>
                      {idx === 0 && <Check size={14} className="text-brand-green" />}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} className="text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 bg-[#2a2a2a] border-gray-700">
                        <DropdownMenuItem className="text-gray-200 hover:bg-white/10 focus:bg-white/10">
                          Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-200 hover:bg-white/10 focus:bg-white/10">
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              
              {/* Create New Space Button */}
              <div className="px-3 pt-2 border-t border-gray-700">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green/90 rounded-lg transition text-primary font-medium text-sm">
                  <Plus size={16} />
                  <span>Create New Space</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brands Dropdown */}
      {!isCollapsed && (
        <div className="px-4 mb-4 relative flex-shrink-0">
          <button 
            onClick={() => setIsBrandsDropdownOpen(!isBrandsDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 border-2 border-brand-green rounded-lg hover:bg-sidebar-hover transition"
          >
            <div className="w-8 h-8 bg-brand-pink rounded flex items-center justify-center text-sm font-bold text-white">
              X
            </div>
            <span className="flex-1 text-left text-sm font-medium">Digital Influencer</span>
            <ChevronDown size={16} className={`transition-transform text-sidebar-muted ${isBrandsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        
          {isBrandsDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-sidebar border border-border rounded-lg shadow-lg z-50 py-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover transition text-sidebar-text border-b border-border mb-2">
                <Search size={16} />
                <span className="flex-1 text-left text-sm">Search Brands</span>
              </button>
              {brandProfiles.map((brand, idx) => (
                <div
                  key={idx}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover transition text-sidebar-text group cursor-pointer"
                >
                  <div className={`w-8 h-8 ${brand.bgColor} rounded flex items-center justify-center text-sm font-bold text-white`}>
                    {brand.initial}
                  </div>
                  <span className="flex-1 text-left text-sm">{brand.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-sidebar-active rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} className="text-sidebar-muted" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      <DropdownMenuItem onClick={() => navigate('/brand')}>
                        <Edit size={14} className="mr-2" />
                        Edit Brand
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings size={14} className="mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              <button 
                onClick={() => navigate('/brand')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover transition mt-2 border-t border-border text-sidebar-text"
              >
                <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center text-sm font-bold text-primary">
                  +
                </div>
                <span className="flex-1 text-left text-sm">Create New Brand</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Project Selector */}
      <ProjectSelector isCollapsed={isCollapsed} />

      {/* Main Navigation */}
      <nav className="px-4 space-y-1">
        {sidebarItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.link || '/'}
            end
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
            activeClassName="bg-sidebar-active"
            title={item.label}
          >
            <span className="text-sidebar-muted">
              {item.icon}
            </span>
            {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
          </NavLink>
        ))}

        {/* Library Section */}
        <div className="pt-2">
          <NavLink
            to="/assets"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover`}
            activeClassName="bg-sidebar-active"
            title="Assets"
          >
            <span className="text-sidebar-muted">
              <FolderOpen size={18} />
            </span>
            {!isCollapsed && <span className="flex-1 text-left text-sm">Assets</span>}
          </NavLink>
        </div>

        {/* Community Link */}
        <div className="pt-2">
          <NavLink
            to="/community"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
            activeClassName="bg-sidebar-active"
            title="Community"
          >
            <span className="text-sidebar-muted">
              <Users size={18} />
            </span>
            {!isCollapsed && <span className="flex-1 text-left text-sm">Community</span>}
          </NavLink>
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
                      // Navigate to websites when Sites is clicked
                      if (item.label === 'Sites') {
                        navigate('/websites');
                      }
                    } else {
                      setIsRecentOpen(!isRecentOpen);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
                    (item.subItems ? openDropdowns[item.label] : isRecentOpen) ? 'bg-sidebar-active' : ''
                  }`}
                  title={item.label}
                >
                  <span className={item.color}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
                  {!isCollapsed && <ChevronDown size={18} className={`text-sidebar-muted transition-transform ${
                    (item.subItems ? openDropdowns[item.label] : isRecentOpen) ? 'rotate-0' : '-rotate-90'
                  }`} />}
                </button>
                {(item.subItems ? openDropdowns[item.label] : isRecentOpen) && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems ? (
                      item.subItems.map((subItem: any, subIdx: number) => {
                        const getSubItemLink = () => {
                          if (subItem.label === 'Websites') return '/websites';
                          if (subItem.label === 'Funnels') return '/funnels';
                          if (subItem.label === 'Stores') return '/store';
                          return null;
                        };
                        
                        const link = getSubItemLink();
                        
                        return link ? (
                          <NavLink
                            key={subIdx}
                            to={link}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover rounded-lg text-left"
                            activeClassName="bg-sidebar-active text-sidebar-text"
                          >
                            {typeof subItem === 'object' && subItem.icon ? (
                              <>
                                {subItem.icon}
                                <span className="text-sm">{subItem.label}</span>
                              </>
                            ) : (
                              <span className="text-sm">{typeof subItem === 'string' ? subItem : subItem.label}</span>
                            )}
                          </NavLink>
                        ) : (
                          <button
                            key={subIdx}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover rounded-lg text-left"
                          >
                            {typeof subItem === 'object' && subItem.icon ? (
                              <>
                                {subItem.icon}
                                <span className="text-sm">{subItem.label}</span>
                              </>
                            ) : (
                              <span className="text-sm">{typeof subItem === 'string' ? subItem : subItem.label}</span>
                            )}
                          </button>
                        );
                      })
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
              <button
                key={idx}
                onClick={() => {
                  if ((item as any).editorTab) {
                    navigate(item.link, { state: { editorTab: (item as any).editorTab } });
                  } else {
                    navigate(item.link);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover`}
                title={item.label}
              >
                <span className={item.color}>{item.icon}</span>
                {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
              </button>
            ) : (
              <button
                key={idx}
                onClick={() => {
                  // Special handling for Edit button in Image section
                  if (item.label === 'Edit' && activeTab === 'Image' && onEditClick) {
                    onEditClick();
                  } else {
                    onTabChange(item.label);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
                  activeTab === item.label ? 'bg-sidebar-active' : ''
                }`}
                title={item.label}
              >
                <span className={item.color}>{item.icon}</span>
                {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
              </button>
            )
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        {/* Onboarding Progress */}
        {!isCollapsed && <OnboardingProgress />}

        {/* Credits Section */}
        {!isCollapsed && (
          <div className="p-4 space-y-3 bg-sidebar">
          <div className="bg-sidebar border-2 border-brand-green rounded-lg p-3">
            <TooltipProvider>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-sidebar-text">Usage Credits</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-sidebar-muted cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your monthly credits will be refilled on {getNextRefillDate()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
        )}
      </div>
      </div>
    </>
  );
};

export default Sidebar;
