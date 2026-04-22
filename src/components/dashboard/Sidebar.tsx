import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, Sparkles, Image, Video, Music, FileText, Code,
  ChevronDown, HelpCircle, Bell, Settings, MoreHorizontal, Bot, FolderOpen, Briefcase, HardDrive,
  UserCircle, Mic, Users, BookOpen, Target, Calendar, MessageSquarePlus, Clock, Edit,
  Globe, Mail, DollarSign, LayoutTemplate, Move, ArrowUpCircle, UserPlus, Volume2, Disc, MoreVertical,
  PanelLeftClose, PanelLeftOpen, LayoutGrid, Palette, Film, Package, FileBarChart, Send, Share2, Download, Maximize2, Home, AppWindow, Folder, ChevronRight, Shield, Check, Plus, Trash2
} from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';
import { useUserRole } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import OnboardingProgress from './OnboardingProgress';
import ProjectSelector from './ProjectSelector';
import { creationsData } from '@/data/creationsData';
import { useBrand } from '@/contexts/BrandContext';
import { useSpace } from '@/contexts/SpaceContext';

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
  onAIVAPanelToggle?: () => void;
  isAIVAPanelOpen?: boolean;
  forceCollapsed?: boolean;
}

const Sidebar = ({ activeTab = '', onTabChange, isAssistantPage = false, isMonetizePage = false, isAutomatePage = false, onCharactersClick, onIdentityClick, onAssetFilterChange, onCollapseChange, onEditClick, collapsed, defaultCollapsed, onAIVAPanelToggle, isAIVAPanelOpen, forceCollapsed }: SidebarProps) => {
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

  // Define app pages where AIVA should open as a side panel
  const appPages = [
    '/create',
    '/edit',
    '/video-downloader',
    '/versus',
    '/transcribe',
    '/voice-cloner',
    '/voice-changer',
    '/voiceovers',
    '/audio-dubber',
    '/noise-remover',
    '/background-remover',
    '/image-upscaler',
    '/image-enhancer',
    '/blog-writer',
    '/social-posts',
    '/email-generator',
    '/ad-copy-writer',
    '/script-writer',
    '/seo-optimizer',
    '/ebook-creator',
    '/explainer-video',
    '/viral-shorts',
    '/ai-story',
    '/lead-generation',
    '/newsletter',
  ];
  
  // Check if on app detail or white-label page (e.g., /apps/some-app-id or /apps/some-app-id/license)
  const isAppDetailPage = location.pathname.startsWith('/apps/') && location.pathname !== '/apps';
  
  const isInsideApp = appPages.some(path => location.pathname.startsWith(path)) || isAppDetailPage;

  // Calculate next month's first day for credit refill
  const getNextRefillDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const { isAdminOrModerator } = useUserRole();
  
  const sidebarItems = [
    { icon: <Home size={18} />, label: 'Dashboard', link: '/dashboard' },
    { icon: <Sparkles size={18} className="text-brand-yellow" />, label: 'AIVA', link: '/assistant', isAIVA: true },
  ];

  const dashboardNavItems: Array<{ icon: JSX.Element; label: string; color: string; link: string }> = [];

  const createNavItems: Array<{ icon: JSX.Element; label: string; color: string }> = [];

  const imageNavItems = [
    { icon: <Image size={18} />, label: 'Editor', color: 'text-brand-green', link: '/edit' },
  ];

  const videoNavItems = [
    { icon: <Film size={18} />, label: 'Editor', color: 'text-brand-green', link: '/edit', editorTab: 'video' },
  ];

  const audioNavItems = [
    { icon: <UserCircle size={18} />, label: 'Voices', color: 'text-brand-blue' },
  ];

  const designNavItems: Array<{ icon: JSX.Element; label: string; color: string }> = [];

  const contentNavItems: Array<{ icon: JSX.Element; label: string; color: string }> = [];

  const assistantNavItems: Array<{ icon: JSX.Element; label: string; color: string; isDropdown?: boolean }> = [];

  const automateNavItems: Array<{ icon: JSX.Element; label: string; color: string; link?: string }> = [];

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

  const [isCollapsed, setIsCollapsed] = useState<boolean>(forceCollapsed ?? collapsed ?? defaultCollapsed ?? true);
  const [userExpandedSidebar, setUserExpandedSidebar] = useState(false);

  useEffect(() => {
    // Only apply forceCollapsed if user hasn't manually expanded
    if (forceCollapsed && !userExpandedSidebar) {
      setIsCollapsed(true);
    } else if (typeof collapsed === "boolean" && !userExpandedSidebar) {
      setIsCollapsed(collapsed);
    }
  }, [collapsed, forceCollapsed, userExpandedSidebar]);

  // Handler for user-initiated expand
  const handleExpandSidebar = () => {
    setUserExpandedSidebar(true);
    setIsCollapsed(false);
  };

  // Reset user override when navigating away from force-collapsed pages
  useEffect(() => {
    if (!forceCollapsed) {
      setUserExpandedSidebar(false);
    }
  }, [forceCollapsed]);

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [renamingBrandId, setRenamingBrandId] = useState<string | null>(null);
  const [renameBrandValue, setRenameBrandValue] = useState('');
  
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('');
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Close brand dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandsDropdownOpen(false);
        setBrandSearchQuery('');
      }
    };

    if (isBrandsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBrandsDropdownOpen]);

  // Use brand context
  const { 
    brands, 
    selectedBrand, 
    setSelectedBrand, 
    updateBrand,
    deleteBrand,
    addBrand,
    isCreatingNewBrand, 
    setIsCreatingNewBrand,
    draftBrand 
  } = useBrand();

  // State for delete confirmation
  const [brandToDelete, setBrandToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // State for quick brand creation
  const [isCreatingQuickBrand, setIsCreatingQuickBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const handleRenameBrand = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setRenamingBrandId(brandId);
      setRenameBrandValue(brand.name);
    }
  };

  const confirmRenameBrand = () => {
    if (renamingBrandId && renameBrandValue.trim()) {
      updateBrand(renamingBrandId, { 
        name: renameBrandValue.trim(),
        initial: renameBrandValue.trim().charAt(0).toUpperCase()
      });
      setRenamingBrandId(null);
      setRenameBrandValue('');
    }
  };

  const cancelRenameBrand = () => {
    setRenamingBrandId(null);
    setRenameBrandValue('');
  };

  const handleDeleteBrand = (brand: { id: string; name: string }) => {
    setBrandToDelete(brand);
  };

  const confirmDeleteBrand = () => {
    if (brandToDelete) {
      deleteBrand(brandToDelete.id);
      setBrandToDelete(null);
    }
  };

  const handleQuickCreateBrand = () => {
    if (newBrandName.trim()) {
      const bgColors = ['bg-brand-pink', 'bg-brand-blue', 'bg-brand-yellow', 'bg-brand-green', 'bg-brand-purple'];
      const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
      
      const newBrand = {
        id: Date.now().toString(),
        name: newBrandName.trim(),
        initial: newBrandName.trim().charAt(0).toUpperCase(),
        bgColor: randomColor,
        isComplete: false,
        incompleteSection: 'identity'
      };
      
      addBrand(newBrand);
      setNewBrandName('');
      setIsCreatingQuickBrand(false);
      setIsBrandsDropdownOpen(false);
    }
  };

  const cancelQuickCreateBrand = () => {
    setNewBrandName('');
    setIsCreatingQuickBrand(false);
  };

  // Use space context
  const {
    spaces,
    selectedSpace,
    setSelectedSpace,
    isCreatingNewSpace,
    setIsCreatingNewSpace,
    draftSpace,
  } = useSpace();
  
  // Display brand - show draft brand name if creating new, otherwise selected brand
  const displayBrand = isCreatingNewBrand && draftBrand?.name 
    ? { 
        name: draftBrand.name, 
        initial: draftBrand.name.charAt(0).toUpperCase(), 
        bgColor: 'bg-brand-green',
        isComplete: false 
      }
    : selectedBrand;

  // Display space - show draft space name if creating new, otherwise selected space
  const displaySpace = isCreatingNewSpace && draftSpace?.name
    ? {
        name: draftSpace.name,
        initial: draftSpace.name.charAt(0).toUpperCase(),
        bgColor: draftSpace.bgColor || 'bg-brand-green',
      }
    : selectedSpace;
  
  const handleSpaceSelect = (space: typeof spaces[0]) => {
    setSelectedSpace(space);
    setIsWorkspaceOpen(false);
    setSpaceSearchQuery('');
  };
  
  const handleBrandSelect = (brand: typeof brands[0]) => {
    setSelectedBrand(brand);
    setIsBrandsDropdownOpen(false);
    setBrandSearchQuery('');
    
    // If brand profile is incomplete, navigate to brand page with the incomplete section
    if (!brand.isComplete && brand.incompleteSection) {
      navigate(`/brand?section=${brand.incompleteSection}&incomplete=true`);
    }
  };
  
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

  // workspaces is now managed by SpaceContext - removed static array

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
        <div className="p-4 relative flex items-center gap-3 flex-shrink-0">
          {/* Logo Icon - always visible, clickable to expand sidebar when collapsed or go to home when expanded */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isCollapsed ? (
                  <button
                    onClick={handleExpandSidebar}
                    className="flex-shrink-0 mx-auto hover:opacity-80 transition"
                  >
                    <RevvenLogo size={40} />
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex-shrink-0 hover:opacity-80 transition"
                  >
                    <RevvenLogo size={40} />
                  </Link>
                )}
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Expand Menu</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          {!isCollapsed && (
            <>
              <Link to="/" className="hover:opacity-80 transition cursor-pointer flex items-center">
                <h1 className="text-2xl font-bold tracking-wider leading-none">REVVEN</h1>
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-2 hover:bg-sidebar-hover rounded-lg transition ml-auto"
                    >
                      <PanelLeftClose size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Collapse Sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>

      {/* Workspace/Space Selector */}
      {isCollapsed ? (
        <div className="px-4 mb-2 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setUserExpandedSidebar(true);
                    setIsCollapsed(false);
                    setTimeout(() => setIsWorkspaceOpen(true), 100);
                  }}
                  className="w-full flex items-center justify-center py-2.5 hover:bg-sidebar-hover rounded-lg transition"
                >
                  <LayoutGrid size={18} className="text-sidebar-muted" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{displaySpace?.name || 'Workspace'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="px-4 mb-2 relative flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5 px-3">
            <LayoutGrid size={10} className="text-sidebar-muted" />
            <span className="text-[10px] font-medium text-sidebar-muted uppercase tracking-wider">Workspace</span>
          </div>
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-brand-green rounded-lg hover:bg-brand-green/90 transition"
          >
            <span className="flex-1 text-left text-sm text-primary font-medium">
              {displaySpace?.name || 'Select Space'}
            </span>
            <ChevronDown size={16} className={`transition-transform text-primary ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
          </button>
        
          {isWorkspaceOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-sidebar border border-border rounded-lg shadow-xl z-50 py-3">
              {/* Search Field */}
              <div className="px-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-hover rounded-lg border border-border">
                  <Search size={14} className="text-sidebar-muted" />
                  <input 
                    type="text" 
                    placeholder="Search Spaces" 
                    value={spaceSearchQuery}
                    onChange={(e) => setSpaceSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-sm bg-transparent text-sidebar-text placeholder:text-sidebar-muted outline-none"
                  />
                </div>
              </div>
              
              {/* Space List */}
              <div className="py-2 max-h-48 overflow-y-auto">
                {spaces
                  .filter((space) => space.name.toLowerCase().includes(spaceSearchQuery.toLowerCase()))
                  .map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSpaceSelect(space);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-sidebar-hover transition cursor-pointer group ${
                      selectedSpace?.id === space.id ? 'bg-sidebar-active' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${space.bgColor} rounded flex items-center justify-center text-sm font-bold text-white`}>
                        {space.initial}
                      </div>
                      <span className="text-sm text-sidebar-text">{space.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSpace?.id === space.id && <Check size={14} className="text-brand-green" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="p-1 hover:bg-sidebar-active rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} className="text-sidebar-muted" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-sidebar border-border">
                          <DropdownMenuItem 
                            className="text-sidebar-text hover:bg-sidebar-hover focus:bg-sidebar-hover"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsWorkspaceOpen(false);
                              setSpaceSearchQuery('');
                              navigate('/space-settings');
                            }}
                          >
                            <Edit size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem 
                            className="text-destructive hover:bg-sidebar-hover focus:bg-sidebar-hover cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add space delete functionality
                              setIsWorkspaceOpen(false);
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Create New Space Button */}
              <div className="px-3 pt-2 border-t border-border">
                <button 
                  onClick={() => {
                    setIsWorkspaceOpen(false);
                    setSpaceSearchQuery('');
                    setIsCreatingNewSpace(true);
                    navigate('/space-settings?new=true');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green/90 rounded-lg transition text-primary font-medium text-sm"
                >
                  <Plus size={16} />
                  <span>Create New Space</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brands Dropdown */}
      {isCollapsed ? (
        <div className="px-4 mb-2 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setUserExpandedSidebar(true);
                    setIsCollapsed(false);
                    setTimeout(() => setIsBrandsDropdownOpen(true), 100);
                  }}
                  className="w-full flex items-center justify-center py-2.5 hover:bg-sidebar-hover rounded-lg transition"
                >
                  <Palette size={18} className="text-sidebar-muted" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{displayBrand?.name || 'Brand'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div ref={brandDropdownRef} className="px-4 mb-4 relative flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5 px-3">
            <Palette size={10} className="text-sidebar-muted" />
            <span className="text-[10px] font-medium text-sidebar-muted uppercase tracking-wider">Brand</span>
          </div>
          <div className="w-full flex items-center gap-3 px-3 py-2 border-2 border-brand-green rounded-lg hover:bg-sidebar-hover transition">
            {/* Brand name - navigates to brand profile */}
            <button 
              onClick={() => navigate('/brand')}
              className="flex flex-col flex-1 text-left"
            >
              <span className="text-sm font-medium hover:text-brand-green transition">
                {displayBrand?.name || 'Brands'}
              </span>
              {displayBrand && !displayBrand.isComplete && (
                <span className="text-xs text-brand-yellow">Profile incomplete</span>
              )}
            </button>
            {/* Caret - toggles dropdown */}
            <button
              onClick={() => setIsBrandsDropdownOpen(!isBrandsDropdownOpen)}
              className="p-1.5 hover:bg-sidebar-active rounded-md transition"
            >
              <ChevronDown size={16} className={`transition-transform text-sidebar-muted ${isBrandsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        
          {isBrandsDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-sidebar border border-border rounded-lg shadow-lg z-50 py-2">
              <div className="flex items-center gap-3 px-3 py-2 border-b border-border mb-2">
                <Search size={16} className="text-sidebar-muted" />
                <input
                  type="text"
                  placeholder="Search Brands"
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent text-sidebar-text placeholder:text-sidebar-muted outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {brands
                .filter((brand) => brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase()))
                .map((brand, idx) => (
                <div
                  key={brand.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover transition text-sidebar-text group ${selectedBrand?.id === brand.id ? 'bg-sidebar-active' : ''}`}
                >
                  <button
                    type="button"
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (renamingBrandId !== brand.id) {
                        handleBrandSelect(brand);
                      }
                    }}
                  >
                    <div className={`w-8 h-8 ${brand.bgColor} rounded flex items-center justify-center text-sm font-bold text-white relative`}>
                      {brand.initial}
                      {!brand.isComplete && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-yellow rounded-full border-2 border-sidebar" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      {renamingBrandId === brand.id ? (
                        <input
                          type="text"
                          value={renameBrandValue}
                          onChange={(e) => setRenameBrandValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmRenameBrand();
                            if (e.key === 'Escape') cancelRenameBrand();
                          }}
                          onBlur={confirmRenameBrand}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="text-sm bg-sidebar-hover text-sidebar-text px-2 py-1 rounded border border-border outline-none focus:border-brand-green w-full"
                        />
                      ) : (
                        <>
                          <span className="text-sm block">{brand.name}</span>
                          {!brand.isComplete && (
                            <span className="text-xs text-brand-yellow">Incomplete</span>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    {selectedBrand?.id === brand.id && (
                      <Check size={16} className="text-brand-green" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1.5 hover:bg-sidebar-active rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} className="text-sidebar-muted" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 bg-sidebar border-border">
                        <DropdownMenuItem 
                          className="text-sidebar-text hover:bg-sidebar-hover focus:bg-sidebar-hover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameBrand(brand.id);
                          }}
                        >
                          <Edit size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="text-destructive hover:bg-sidebar-hover focus:bg-sidebar-hover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBrand({ id: brand.id, name: brand.name });
                          }}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {/* Quick Create Brand */}
              <div className="mt-2 border-t border-border pt-2">
                {isCreatingQuickBrand ? (
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center text-sm font-bold text-primary">
                      {newBrandName.trim() ? newBrandName.trim().charAt(0).toUpperCase() : '+'}
                    </div>
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickCreateBrand();
                        if (e.key === 'Escape') cancelQuickCreateBrand();
                      }}
                      onBlur={() => {
                        if (newBrandName.trim()) {
                          handleQuickCreateBrand();
                        } else {
                          cancelQuickCreateBrand();
                        }
                      }}
                      autoFocus
                      placeholder="Enter brand name..."
                      className="flex-1 text-sm bg-sidebar-hover text-sidebar-text px-2 py-1 rounded border border-border outline-none focus:border-brand-green"
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsCreatingQuickBrand(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-hover transition text-sidebar-text"
                  >
                    <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center text-sm font-bold text-primary">
                      +
                    </div>
                    <span className="flex-1 text-left text-sm">Create New Brand</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Selector */}
      <ProjectSelector isCollapsed={isCollapsed} />

      {/* Main Navigation */}
      <nav className="px-4 space-y-1">
        {sidebarItems.map((item, idx) => {
          // AIVA item: opens panel when inside an app, navigates when not
          if ((item as any).isAIVA && isInsideApp) {
            const button = (
              <button
                key={idx}
                onClick={onAIVAPanelToggle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${isAIVAPanelOpen ? 'bg-sidebar-active' : ''}`}
              >
                <span className="text-sidebar-muted">
                  {item.icon}
                </span>
                {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
              </button>
            );
            
            return isCollapsed ? (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : button;
          }
          
          const navLink = (
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
              {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </NavLink>
          );
          
          return isCollapsed ? (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : navLink;
        })}

        {/* Library Section */}
        <div className="pt-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/assets"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover`}
                    activeClassName="bg-sidebar-active"
                  >
                    <span className="text-sidebar-muted">
                      <FolderOpen size={18} />
                    </span>
                    {!isCollapsed && <span className="flex-1 text-left text-sm">Assets</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Assets</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NavLink
              to="/assets"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover`}
              activeClassName="bg-sidebar-active"
            >
              <span className="text-sidebar-muted">
                <FolderOpen size={18} />
              </span>
              <span className="flex-1 text-left text-sm">Assets</span>
            </NavLink>
          )}
        </div>

        {/* Apps Link */}
        <div className="pt-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/apps"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
                    activeClassName="bg-sidebar-active"
                  >
                    <span className="text-sidebar-muted">
                      <AppWindow size={18} />
                    </span>
                    {!isCollapsed && <span className="flex-1 text-left text-sm">Apps</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Apps</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NavLink
              to="/apps"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
              activeClassName="bg-sidebar-active"
            >
              <span className="text-sidebar-muted">
                <AppWindow size={18} />
              </span>
              <span className="flex-1 text-left text-sm">Apps</span>
            </NavLink>
          )}
        </div>

        {/* Community Link */}
        <div className="pt-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/community"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
                    activeClassName="bg-sidebar-active"
                  >
                    <span className="text-sidebar-muted">
                      <Users size={18} />
                    </span>
                    {!isCollapsed && <span className="flex-1 text-left text-sm">Community</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Community</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NavLink
              to="/community"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
              activeClassName="bg-sidebar-active"
            >
              <span className="text-sidebar-muted">
                <Users size={18} />
              </span>
              <span className="flex-1 text-left text-sm">Community</span>
            </NavLink>
          )}
        </div>


        {/* Separator */}
        <div className="pt-4 pb-2 px-3">
          <div className="h-px bg-sidebar-hover"></div>
        </div>

        <div className="space-y-1">
          {navItems.map((item, idx) => {
            if (item.isDropdown) {
              const dropdownButton = (
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
                >
                  <span className={item.color}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
                  {!isCollapsed && <ChevronDown size={18} className={`text-sidebar-muted transition-transform ${
                    (item.subItems ? openDropdowns[item.label] : isRecentOpen) ? 'rotate-0' : '-rotate-90'
                  }`} />}
                </button>
              );

              return (
                <div key={idx}>
                  {isCollapsed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>{dropdownButton}</TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : dropdownButton}
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
              );
            }
            
            if (item.link) {
              const linkButton = (
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
                >
                  <span className={item.color}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
                </button>
              );

              return isCollapsed ? (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : linkButton;
            }
            
            const actionButton = (
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
              >
                <span className={item.color}>{item.icon}</span>
                {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
              </button>
            );

            return isCollapsed ? (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>{actionButton}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : actionButton;
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        {/* Onboarding Progress */}
        {!isCollapsed && <OnboardingProgress />}

        {/* Drive Link - anchored at the very bottom */}
        <div className="px-3 pb-3 pt-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/drive"
                    className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
                    activeClassName="bg-sidebar-active"
                  >
                    <span className="text-sidebar-muted">
                      <HardDrive size={18} />
                    </span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Drive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NavLink
              to="/drive"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover"
              activeClassName="bg-sidebar-active"
            >
              <span className="text-sidebar-muted">
                <HardDrive size={18} />
              </span>
              <span className="flex-1 text-left text-sm">Drive</span>
            </NavLink>
          )}
        </div>
      </div>

      </div>

      {/* Delete Brand Confirmation Dialog */}
      <AlertDialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <AlertDialogContent className="bg-sidebar border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sidebar-text">Delete Brand</AlertDialogTitle>
            <AlertDialogDescription className="text-sidebar-muted space-y-2">
              <p>Are you sure you want to delete <strong className="text-sidebar-text">"{brandToDelete?.name}"</strong>?</p>
              <p className="text-destructive">This action cannot be undone. All brand data including identity settings, voice configurations, and associated content will be permanently removed.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-sidebar-hover text-sidebar-text border-border hover:bg-sidebar-active">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
