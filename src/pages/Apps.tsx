import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Store, LayoutGrid, Grid3X3, List,
  FolderOpen, Target, Video, Camera, User, Sparkles, Mic, PenTool, Edit3, Search, Layers, Bot,
  ChevronUp, ChevronDown, Plus
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import AppCard from '@/components/dashboard/AppCard';
import AppsFilterToolbar, { type AppFilterState } from '@/components/dashboard/AppsFilterToolbar';
import { useFavoriteApps } from '@/hooks/useFavoriteApps';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { InstallModal } from '@/components/marketplace';
import { sampleMarketplaceApps, mockMembers, mockTeams, mockMarketplaceWorkspace, mockMarketplaceUser } from '@/lib/marketplace/data';
import { MarketplaceApp } from '@/lib/marketplace/types';
import { appRoutes, getCatalogApp, resolveAppId } from '@/lib/marketplace/catalog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper to add app to open tabs and navigate
const addToOpenTabs = (appId: string, navigate: ReturnType<typeof useNavigate>) => {
  const OPEN_TABS_KEY = 'app-open-tabs';
  const saved = localStorage.getItem(OPEN_TABS_KEY);
  const openTabs = saved ? JSON.parse(saved) : ['create'];
  
  if (!openTabs.includes(appId)) {
    openTabs.push(appId);
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(openTabs));
  }
};

const Apps = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'apps' | 'marketplace'>('marketplace');
  const [installModalApp, setInstallModalApp] = useState<MarketplaceApp | null>(null);
  const [zoom, setZoom] = useState(40);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appFilters, setAppFilters] = useState<AppFilterState | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  const { isFavorite, toggleFavorite } = useFavoriteApps();
  const { isInstalled, installApp } = useInstalledApps();

  const handleInstall = async (
    accessMode: string,
    userIds: string[],
    teamIds: string[]
  ) => {
    if (installModalApp) {
      installApp(
        installModalApp.id,
        mockMarketplaceWorkspace.id,
        mockMarketplaceUser.id,
        accessMode as 'all_members' | 'select_users' | 'select_teams',
        userIds,
        teamIds
      );
      toast.success(`${installModalApp.name} installed successfully`);
      setInstallModalApp(null);
    }
  };

  const handleOpenApp = (appPath: string, appId: string) => {
    addToOpenTabs(appId, navigate);
    navigate(appPath);
  };

  const openInstalledApp = (appName: string) => {
    const appId = resolveAppId(appName);
    const path = appRoutes[appId];
    if (!path) {
      toast.error('This app does not have a route configured yet.');
      return;
    }
    addToOpenTabs(appId, navigate);
    navigate(path);
  };

  const openInstallForAppName = (appName: string) => {
    const appId = resolveAppId(appName);
    setInstallModalApp(getCatalogApp(appId));
  };

  const handleActivateApp = (appId: string) => {
    navigate(`/app-license/${appId}`);
  };

  const trendingApps = [
    {
      id: 0,
      name: 'Creator Vault',
      category: 'Content Tools',
      description: 'Your curated library of premium content collections',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      badge: 'HOT',
      icon: <FolderOpen size={16} className="text-primary" />,
      rating: 4.9,
      onClick: () => navigate('/creator-vault')
    },
    {
      id: 1,
      name: 'Master Closer',
      category: 'Sales Tools',
      description: 'AI-powered sales closing assistant',
      thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&h=400&fit=crop',
      badge: 'HOT',
      icon: <Target size={16} className="text-primary" />,
      rating: 4.8,
      onClick: () => navigate('/master-closer')
    },
    {
      id: 2,
      name: 'Viral Shorts',
      category: 'Video Tools',
      description: 'Create viral short-form video content',
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop',
      badge: 'HOT',
      icon: <Video size={16} className="text-primary" />,
      rating: 4.7,
      onClick: () => navigate('/viral-shorts')
    },
    {
      id: 3,
      name: 'Sessions',
      category: 'Video Tools',
      description: 'Record and manage video sessions effortlessly',
      thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop',
      badge: 'NEW',
      icon: <Camera size={16} className="text-primary" />,
      rating: 4.6,
      onClick: () => navigate('/sessions')
    },
    {
      id: 4,
      name: 'Digital Influencer',
      category: 'Video Tools',
      description: 'Generate AI-powered influencer content',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop',
      badge: 'HOT',
      icon: <User size={16} className="text-primary" />,
      rating: 4.9,
      onClick: () => navigate('/ai-influencer')
    },
    {
      id: 5,
      name: 'Resizer',
      category: 'Image Tools',
      description: 'Resize images and videos for any platform',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
      badge: 'HOT',
      icon: <Layers size={16} className="text-primary" />,
      rating: 4.7,
      onClick: () => navigate('/resizer')
    },
  ];

  const topPicks = [
    {
      id: 1,
      name: 'REAL Creator',
      category: 'Video Tools',
      description: 'Your all-in-one AI content creation studio',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      badge: 'HOT',
      icon: <Sparkles size={16} className="text-primary" />,
      rating: 4.9,
      onClick: () => navigate('/create'),
      preInstalled: true,
    },
    {
      id: 2,
      name: 'Agents',
      category: 'Automation Tools',
      description: 'Create and deploy AI agents to automate workflows',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      badge: 'NEW',
      icon: <Bot size={16} className="text-primary" />,
      rating: 4.8,
      onClick: () => navigate('/automate'),
      preInstalled: true,
    },
    {
      id: 3,
      name: 'Ghost Ink',
      category: 'Content Tools',
      description: 'AI ghostwriting for articles, blogs, and ebooks',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
      badge: 'NEW',
      icon: <PenTool size={16} className="text-primary" />,
      rating: 4.7,
      preInstalled: true,
    },
    {
      id: 4,
      name: 'Editor',
      category: 'Tools',
      description: 'Professional image, video, and audio editor',
      thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
      badge: 'HOT',
      icon: <Edit3 size={16} className="text-primary" />,
      rating: 4.8,
      onClick: () => navigate('/edit'),
      preInstalled: true,
    },
    {
      id: 5,
      name: 'Digital Spy',
      category: 'Content Intelligence',
      description: 'Competitor social intelligence and content insights',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      badge: 'NEW',
      icon: <Search size={16} className="text-primary" />,
      rating: 4.6,
      onClick: () => navigate('/digital-spy'),
      preInstalled: true,
    },
    {
      id: 6,
      name: 'Transcribe',
      category: 'Audio Tools',
      description: 'Convert speech to text with high accuracy',
      thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
      badge: 'NEW',
      icon: <Mic size={16} className="text-primary" />,
      rating: 4.8,
      onClick: () => navigate('/transcribe'),
      preInstalled: true,
    }
  ];

  const imageApps = [
    { name: 'Art Blocks', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.5 },
    { name: 'Edit', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/edit') },
    { name: 'Background Remover', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.9, onClick: () => navigate('/background-remover') },
    { name: 'Image Eraser', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop', rating: 4.4 },
    { name: 'Image Upscaler', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.7, onClick: () => navigate('/image-upscaler') },
    { name: 'Image Enhancer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=400&h=300&fit=crop', rating: 4.6, onClick: () => navigate('/image-enhancer') },
    { name: 'Image Colorizer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.3 },
  ];

  const videoApps = [
    { name: 'Sessions', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/sessions') },
    { name: 'Video Downloader', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/video-downloader') },
    { name: 'Video Resizer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop', rating: 4.3 },
    { name: 'Motion-Sync', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.5 },
    { name: 'Explainer Video', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop', rating: 4.7, onClick: () => navigate('/explainer-video') },
    { name: 'Digital Influencer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.9, onClick: () => navigate('/ai-influencer') },
    { name: 'Viral Shorts', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.7, onClick: () => navigate('/viral-shorts') },
  ];

  const audioApps = [
    { name: 'AI Voice Cloner', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/voice-cloner') },
    { name: 'Transcribe', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.7, onClick: () => navigate('/transcribe') },
    { name: 'AI Voice Changer', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop', rating: 4.5, onClick: () => navigate('/voice-changer') },
    { name: 'AI Voiceovers', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/voiceovers') },
    { name: 'AI Audio Dubber', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop', rating: 4.4, onClick: () => navigate('/audio-dubber') },
    { name: 'AI Noise Remover', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.7, onClick: () => navigate('/noise-remover') },
  ];

  const designApps = [
    { name: 'Logo Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.6 },
    { name: 'Banner Creator', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.5 },
    { name: 'Flyer Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop', rating: 4.4 },
    { name: 'Poster Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop', rating: 4.3 },
    { name: 'Infographic Builder', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.7 },
    { name: 'Presentation Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', rating: 4.5 },
  ];

  const contentApps = [
    { name: 'Article', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/article') },
    { name: 'Job Newsletter', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/newsletter') },
    { name: 'Blog Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.7, onClick: () => navigate('/blog-writer') },
    { name: 'Social Posts', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', rating: 4.5, onClick: () => navigate('/social-posts') },
    { name: 'Email Generator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/email-generator') },
    { name: 'Ad Copy Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', rating: 4.4, onClick: () => navigate('/ad-copy-writer') },
    { name: 'Script Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=300&fit=crop', rating: 4.5, onClick: () => navigate('/script-writer') },
    { name: 'SEO Optimizer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.7, onClick: () => navigate('/seo-optimizer') },
    { name: 'Ebook Creator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', rating: 4.6, onClick: () => navigate('/ebook-creator') },
  ];

  const toolsApps = [
    { name: 'Digital Spy', category: 'Content Intelligence', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/digital-spy') },
    { name: 'Inbox', category: 'Communication', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.5, onClick: () => navigate('/inbox') },
    { name: 'Investor Calculator', category: 'Real Estate', thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.7, onClick: () => navigate('/investor-calculator') },
    { name: 'AI Responder', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/ai-responder') },
    { name: 'Master Closer', category: 'Sales Tools', thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.8, onClick: () => navigate('/master-closer') },
    { name: 'Editor', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop', rating: 4.8, onClick: () => navigate('/edit') },
    { name: 'Versus', category: 'LLM Tool', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/versus') },
    { name: 'Forms', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.5, onClick: () => navigate('/forms') },
    { name: 'Signature', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.4, onClick: () => navigate('/signature') },
    { name: 'Prompt Lab', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop', rating: 4.3 },
    { name: 'Model Benchmark', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', rating: 4.4 },
    { name: 'AI Story', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop', badge: 'HOT', rating: 4.7, onClick: () => navigate('/ai-story') },
    { name: 'Lead Generation', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', badge: 'NEW', rating: 4.6, onClick: () => navigate('/lead-generation') },
  ];

  // Marketplace apps for the "Marketplace" tab
  const hasLicense = mockMarketplaceWorkspace.plan === 'apps_license';

  // Calculate grid columns based on zoom level (0-100)
  // zoom 0 = 7 cols (smallest), zoom 100 = 2 cols (largest)
  const getGridCols = () => {
    if (zoom <= 15) return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7';
    if (zoom <= 30) return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6';
    if (zoom <= 50) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    if (zoom <= 70) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    if (zoom <= 85) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2';
  };

  // Get number of visible columns based on zoom (for slicing apps)
  const getVisibleColumns = () => {
    if (zoom <= 15) return 7;
    if (zoom <= 30) return 6;
    if (zoom <= 50) return 5;
    if (zoom <= 70) return 4;
    if (zoom <= 85) return 3;
    return 2;
  };

  // Filter apps based on current filters
  const filterApps = <T extends { name: string; category: string; badge?: string }>(apps: T[]): T[] => {
    if (!appFilters) return apps;
    
    return apps.filter(app => {
      // Search filter
      if (appFilters.searchQuery) {
        const query = appFilters.searchQuery.toLowerCase();
        if (!app.name.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Category filter
      if (appFilters.category && appFilters.category !== 'All') {
        const categoryMap: { [key: string]: string[] } = {
          'Image': ['Image Tools', 'Image Tool'],
          'Video': ['Video Tools', 'Video Tool'],
          'Audio': ['Audio Tools', 'Audio Tool'],
          'Design': ['Design Tools', 'Design Tool'],
          'Content': ['Content Tools', 'Content Tool', 'Content Intelligence'],
          'Tools': ['Tools', 'Tool', 'LLM Tool', 'Communication', 'Real Estate', 'Sales Tools', 'Sales Tool']
        };
        const allowedCategories = categoryMap[appFilters.category] || [];
        if (!allowedCategories.includes(app.category)) {
          return false;
        }
      }
      
      // Trending filter
      if (appFilters.trending && app.badge?.toUpperCase() !== 'HOT') {
        return false;
      }
      
      // Favorites filter
      if (appFilters.favorites) {
        const appId = resolveAppId(app.name);
        if (!isFavorite(appId)) {
          return false;
        }
      }
      
      // Recently added filter
      if (appFilters.recentlyAdded && app.badge?.toUpperCase() !== 'NEW') {
        return false;
      }
      
      return true;
    });
  };

  // Check if any filters are active
  const hasActiveFilters = appFilters && (
    appFilters.searchQuery || 
    (appFilters.category && appFilters.category !== 'All') ||
    appFilters.trending ||
    appFilters.favorites ||
    appFilters.recentlyAdded
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        isAutomatePage
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="flex-shrink-0">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Header Section - Sticky */}
          <div className="px-8 py-6 border-b border-border bg-background sticky top-0 z-40 shadow-sm">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">
                    <span className="text-primary">APPS</span>
                  </h1>
                  {/* Collapse/Expand Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {isHeaderCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isHeaderCollapsed ? 'Expand Section' : 'Collapse Section'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Filter Controls + View Toggle */}
                <div className="flex items-center gap-3">
                  <AppsFilterToolbar 
                    zoom={zoom}
                    onZoomChange={setZoom}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onFiltersChange={setAppFilters}
                  />
                  
                  {/* View Toggle */}
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                          >
                            <Grid3X3 size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Grid View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                          >
                            <List size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>List View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              
              {/* Collapsible content */}
              {!isHeaderCollapsed && (
                <>
                  <p className="text-muted-foreground text-lg mb-6">
                    A full suite of intelligent AI Apps to help you create, monetize, and automate.
                  </p>
                  
                  {/* Tab Buttons - Separated */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                          activeTab === 'marketplace'
                            ? 'bg-foreground text-background shadow-md'
                            : 'bg-white text-muted-foreground hover:bg-gray-50 border border-border'
                        }`}
                      >
                        <Store size={14} />
                        Marketplace
                      </button>
                      <button
                        onClick={() => setActiveTab('apps')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                          activeTab === 'apps'
                            ? 'bg-foreground text-background shadow-md'
                            : 'bg-white text-muted-foreground hover:bg-gray-50 border border-border'
                        }`}
                      >
                        <LayoutGrid size={14} />
                        My Apps
                      </button>
                    </div>
                    
                    {/* Create App Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => navigate('/app-builder')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                          >
                            <Plus size={14} />
                            Create App
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Build & Publish Your Own App For Internal Use Or Resale</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            {activeTab === 'marketplace' ? (
              <div className="w-full space-y-16">
                
                {/* Trending Section */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">TRENDING</h2>
                      <p className="text-muted-foreground">The Hottest AI Apps Right Now</p>
                    </div>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, trending: !expandedSections.trending })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      {expandedSections.trending ? 'Show Less' : 'See All'}
                      <ChevronRight size={18} className={expandedSections.trending ? 'rotate-90' : ''} />
                    </button>
                  </div>

                  <div className={viewMode === 'list' ? 'flex flex-col gap-3' : `grid ${getGridCols()} gap-4`}>
                    {filterApps(expandedSections.trending ? trendingApps : trendingApps.slice(0, getVisibleColumns())).map((app) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={app.id}
                          name={app.name}
                          category={app.category}
                          thumbnail={app.thumbnail}
                          description={app.description}
                          badge={app.badge}
                          icon={app.icon}
                          rating={app.rating}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          onClick={app.onClick}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Top Picks Section */}
                <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 -mx-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">RECOMMENDED FOR YOU</h2>
                      <p className="text-muted-foreground">Handpicked Apps Just For You - Ready To Use</p>
                    </div>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, recommended: !expandedSections.recommended })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      {expandedSections.recommended ? 'Show Less' : 'See All'}
                      <ChevronRight size={18} className={expandedSections.recommended ? 'rotate-90' : ''} />
                    </button>
                  </div>

                  <div className={viewMode === 'list' ? 'flex flex-col gap-3' : `grid ${getGridCols()} gap-4`}>
                    {filterApps(expandedSections.recommended ? topPicks : topPicks.slice(0, getVisibleColumns())).map((app) => {
                      const appId = resolveAppId(app.name);
                      // Top picks are pre-installed for new users
                      const installed = app.preInstalled || isInstalled(appId);
                      return (
                        <AppCard
                          key={app.id}
                          name={app.name}
                          category={app.category}
                          thumbnail={app.thumbnail}
                          description={app.description}
                          badge={app.badge}
                          icon={app.icon}
                          rating={app.rating}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => {
                            if (app.onClick) {
                              app.onClick();
                            } else {
                              openInstalledApp(app.name);
                            }
                          } : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          onClick={app.onClick}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Image Apps */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">IMAGE APPS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, imageApps: !expandedSections.imageApps })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(imageApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Video Apps */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">VIDEO APPS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, videoApps: !expandedSections.videoApps })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(videoApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Audio Apps */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">AUDIO APPS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, audioApps: !expandedSections.audioApps })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(audioApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Design Apps */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">DESIGN APPS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, designApps: !expandedSections.designApps })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(designApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Content Apps */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">CONTENT APPS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, contentApps: !expandedSections.contentApps })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(contentApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Tools */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">TOOLS</h2>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, tools: !expandedSections.tools })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={viewMode === 'list' ? 'flex flex-col gap-3 mb-12' : `grid ${getGridCols()} gap-4 mb-12`}>
                    {filterApps(toolsApps).slice(0, 10).map((app, idx) => {
                      const appId = resolveAppId(app.name);
                      const installed = isInstalled(appId);
                      return (
                        <AppCard
                          key={idx}
                          {...app}
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : (
              /* My Apps Tab - Only installed apps */
              <div className="w-full">
                {(() => {
                  // Combine all apps and filter only installed ones
                  const allApps = [
                    ...trendingApps.map(app => ({ ...app, category: app.category })),
                    ...topPicks.map(app => ({ ...app, category: app.category })),
                    ...imageApps,
                    ...videoApps,
                    ...audioApps,
                    ...designApps,
                    ...contentApps,
                    ...toolsApps,
                  ];
                  
                  // Remove duplicates by name and filter only installed
                  const uniqueApps = allApps.reduce((acc, app) => {
                    if (!acc.find(a => a.name === app.name)) {
                      acc.push(app);
                    }
                    return acc;
                  }, [] as typeof allApps);
                  
                  // Apply filters and then check if installed
                  const filteredApps = filterApps(uniqueApps);
                  const installedApps = filteredApps.filter(app => {
                    const appId = resolveAppId(app.name);
                    return isInstalled(appId);
                  });
                  
                  if (installedApps.length === 0) {
                    return (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold mb-2">No Apps Installed Yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Browse the Marketplace to discover and install apps.
                        </p>
                        <Button onClick={() => setActiveTab('marketplace')}>
                          <Store size={16} className="mr-2" />
                          Browse Marketplace
                        </Button>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {installedApps.length} app{installedApps.length !== 1 ? 's' : ''} installed
                        </p>
                      </div>
                      <div className={viewMode === 'list' ? 'flex flex-col gap-3' : `grid ${getGridCols()} gap-4`}>
                        {installedApps.map((app, idx) => {
                          const appId = resolveAppId(app.name);
                          const description = 'description' in app ? (app.description as string) : '';
                          const onClick = 'onClick' in app ? (app.onClick as (() => void) | undefined) : undefined;
                          const rating = 'rating' in app ? (app.rating as number) : 0;
                          return (
                            <AppCard
                              key={idx}
                              name={app.name}
                              category={app.category}
                              thumbnail={app.thumbnail}
                              description={description || ''}
                              badge={app.badge}
                              rating={rating}
                              appId={appId}
                              isInstalled={true}
                              onOpen={() => openInstalledApp(app.name)}
                              onActivate={() => handleActivateApp(appId)}
                              onClick={onClick}
                              viewMode={viewMode}
                            />
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />

      {/* Install Modal */}
      {installModalApp && (
        <InstallModal
          isOpen={!!installModalApp}
          onClose={() => setInstallModalApp(null)}
          app={installModalApp}
          members={mockMembers}
          teams={mockTeams}
          onInstall={handleInstall}
        />
      )}
    </div>
  );
};

export default Apps;
