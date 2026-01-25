import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, ChevronRight, Store
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
  const [zoom, setZoom] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appFilters, setAppFilters] = useState<AppFilterState | undefined>(undefined);
  
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
      name: 'REAL Creator',
      category: 'Video Tools',
      description: 'Your all-in-one AI content creation studio',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
      badge: 'HOT',
      onClick: () => navigate('/create')
    },
    {
      id: 1,
      name: 'Video Face Swap',
      category: 'Video Tools',
      description: 'Best-in-class face swapping technology for any video',
      thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop',
      badge: 'NEW',
    },
    {
      id: 2,
      name: 'Recast',
      category: 'Video Tools',
      description: 'Industry-leading character swap for any video in seconds',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
      badge: 'HOT',
    },
    {
      id: 3,
      name: 'Transitions',
      category: 'Video Tools',
      description: 'Create seamless transitions between any shots effortlessly',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      badge: 'NEW',
    },
    {
      id: 4,
      name: 'Face Swap',
      category: 'Image Tools',
      description: 'The best instant AI face swap technology for photos',
      thumbnail: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=400&fit=crop',
      badge: 'NEW',
    },
    {
      id: 5,
      name: 'AI Upscaler',
      category: 'Image Tools',
      description: 'Enhance video and image quality to 4K resolution instantly',
      thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      badge: 'HOT',
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Background Remover',
      category: 'Image Tools',
      description: 'Remove backgrounds from images instantly',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      badge: 'HOT',
      onClick: () => navigate('/background-remover')
    },
    {
      id: 2,
      name: 'Video Resizer',
      category: 'Video Tools',
      description: 'Resize videos for any social platform',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
      badge: 'NEW',
    },
    {
      id: 3,
      name: 'Logo Designer',
      category: 'Design Tools',
      description: 'Create stunning brand logos with AI',
      thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop',
      badge: 'HOT',
    },
    {
      id: 4,
      name: 'Blog Writer',
      category: 'Content Tools',
      description: 'Generate engaging blog posts with AI',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
      badge: 'NEW',
      onClick: () => navigate('/blog-writer')
    }
  ];

  const imageApps = [
    { name: 'Art Blocks', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop', badge: 'NEW' },
    { name: 'Edit', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/edit') },
    { name: 'Background Remover', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/background-remover') },
    { name: 'Image Eraser', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop' },
    { name: 'Image Upscaler', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/image-upscaler') },
    { name: 'Image Enhancer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=400&h=300&fit=crop', onClick: () => navigate('/image-enhancer') },
    { name: 'Image Colorizer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop', badge: 'NEW' },
  ];

  const videoApps = [
    { name: 'Sessions', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/sessions') },
    { name: 'Video Downloader', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/video-downloader') },
    { name: 'Video Resizer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop' },
    { name: 'Motion-Sync', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop', badge: 'NEW' },
    { name: 'Explainer Video', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop', onClick: () => navigate('/explainer-video') },
    { name: 'AI Influencer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/ai-influencer') },
    { name: 'Viral Shorts', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/viral-shorts') },
  ];

  const audioApps = [
    { name: 'AI Voice Cloner', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/voice-cloner') },
    { name: 'Transcribe', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/transcribe') },
    { name: 'AI Voice Changer', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop', onClick: () => navigate('/voice-changer') },
    { name: 'AI Voiceovers', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/voiceovers') },
    { name: 'AI Audio Dubber', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop', onClick: () => navigate('/audio-dubber') },
    { name: 'AI Noise Remover', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/noise-remover') },
  ];

  const designApps = [
    { name: 'Logo Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop', badge: 'HOT' },
    { name: 'Banner Creator', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', badge: 'NEW' },
    { name: 'Flyer Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop' },
    { name: 'Poster Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop' },
    { name: 'Infographic Builder', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'NEW' },
    { name: 'Presentation Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop' },
  ];

  const contentApps = [
    { name: 'Article', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/article') },
    { name: 'Job Newsletter', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/newsletter') },
    { name: 'Blog Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/blog-writer') },
    { name: 'Social Posts', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', onClick: () => navigate('/social-posts') },
    { name: 'Email Generator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/email-generator') },
    { name: 'Ad Copy Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', onClick: () => navigate('/ad-copy-writer') },
    { name: 'Script Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=300&fit=crop', onClick: () => navigate('/script-writer') },
    { name: 'SEO Optimizer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/seo-optimizer') },
    { name: 'Ebook Creator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', onClick: () => navigate('/ebook-creator') },
  ];

  const toolsApps = [
    { name: 'Digital Spy', category: 'Content Intelligence', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/digital-spy') },
    { name: 'Inbox', category: 'Communication', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/inbox') },
    { name: 'Investor Calculator', category: 'Real Estate', thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/investor-calculator') },
    { name: 'AI Responder', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/ai-responder') },
    { name: 'Master Closer', category: 'Sales Tools', thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/master-closer') },
    { name: 'Editor', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop', onClick: () => navigate('/edit') },
    { name: 'Versus', category: 'LLM Tool', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/versus') },
    { name: 'Forms', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/forms') },
    { name: 'Signature', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/signature') },
    { name: 'Prompt Lab', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop' },
    { name: 'Model Benchmark', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
    { name: 'AI Story', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/ai-story') },
    { name: 'Lead Generation', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/lead-generation') },
  ];

  // Marketplace apps for the "Marketplace" tab
  const hasLicense = mockMarketplaceWorkspace.plan === 'apps_license';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        isAutomatePage
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="px-8 py-12 border-b border-border">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">
                  <span className="text-primary">APPS</span>
                </h1>
                
                {/* Filter Controls */}
                <AppsFilterToolbar 
                  zoom={zoom}
                  onZoomChange={setZoom}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onFiltersChange={setAppFilters}
                />
              </div>
              
              <p className="text-muted-foreground text-lg mb-6">
                A full suite of intelligent AI Apps to help you create, monetize, and automate.
              </p>
              
              {/* Tabs below description */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'apps' | 'marketplace')}>
                <TabsList className="bg-muted">
                  <TabsTrigger value="marketplace" className="gap-2">
                    <Store size={14} />
                    Marketplace
                  </TabsTrigger>
                  <TabsTrigger value="apps" className="gap-2">
                    <Play size={14} />
                    My Apps
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
                      <p className="text-muted-foreground">The hottest AI apps right now</p>
                    </div>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, trending: !expandedSections.trending })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {trendingApps.map((app) => {
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
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          onClick={app.onClick}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Top Picks Section */}
                <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 -mx-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">TOP PICKS FOR YOU</h2>
                      <p className="text-muted-foreground text-sm">Handpicked apps just for you</p>
                    </div>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, topPicks: !expandedSections.topPicks })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topPicks.map((app) => {
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
                          appId={appId}
                          isInstalled={installed}
                          onInstall={!installed ? () => openInstallForAppName(app.name) : undefined}
                          onOpen={installed ? () => openInstalledApp(app.name) : undefined}
                          onActivate={installed ? () => handleActivateApp(appId) : undefined}
                          onClick={app.onClick}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {imageApps.map((app, idx) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {videoApps.map((app, idx) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {audioApps.map((app, idx) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {designApps.map((app, idx) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {contentApps.map((app, idx) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {toolsApps.map((app, idx) => {
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
                  
                  const installedApps = uniqueApps.filter(app => {
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {installedApps.map((app, idx) => {
                          const appId = resolveAppId(app.name);
                          const description = 'description' in app ? (app.description as string) : '';
                          const onClick = 'onClick' in app ? (app.onClick as (() => void) | undefined) : undefined;
                          return (
                            <AppCard
                              key={idx}
                              name={app.name}
                              category={app.category}
                              thumbnail={app.thumbnail}
                              description={description || ''}
                              badge={app.badge}
                              appId={appId}
                              isInstalled={true}
                              onOpen={() => openInstalledApp(app.name)}
                              onActivate={() => handleActivateApp(appId)}
                              onClick={onClick}
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
