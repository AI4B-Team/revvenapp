import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, ChevronRight, ChevronDown, SlidersHorizontal, Search, ZoomIn, ZoomOut, Star, Store
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import AppCard from '@/components/dashboard/AppCard';
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
  const [activeTab, setActiveTab] = useState<'apps' | 'marketplace'>('apps');
  const [installModalApp, setInstallModalApp] = useState<MarketplaceApp | null>(null);
  
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
      description: 'Your all-in-one AI content creation studio',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
      badge: 'HOT',
      badgeColor: 'bg-yellow-500',
      onClick: () => navigate('/create')
    },
    {
      id: 1,
      name: 'Video Face Swap',
      description: 'Best-in-class face swapping technology for any video',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Recast',
      description: 'Industry-leading character swap for any video in seconds',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 3,
      name: 'Transitions',
      description: 'Create seamless transitions between any shots effortlessly',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 4,
      name: 'Face Swap',
      description: 'The best instant AI face swap technology for photos',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    },
    {
      id: 5,
      name: 'AI Upscaler',
      description: 'Enhance video and image quality to 4K resolution instantly',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      badge: 'HOT',
      badgeColor: 'bg-red-500'
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Background Remover',
      description: 'Remove backgrounds instantly',
      icon: '✂️',
      color: 'bg-yellow-500'
    },
    {
      id: 2,
      name: 'Video Resizer',
      description: 'Resize videos for any platform',
      icon: '📐',
      color: 'bg-pink-500'
    },
    {
      id: 3,
      name: 'Logo Designer',
      description: 'Create stunning brand logos',
      icon: '🎨',
      color: 'bg-blue-500'
    },
    {
      id: 4,
      name: 'Blog Writer',
      description: 'Generate engaging blog posts',
      icon: '✍️',
      color: 'bg-green-500'
    }
  ];

  // App data with thumbnails
  const imageApps = [
    { name: 'Art Blocks', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop', timestamp: '00:30' },
    { name: 'Edit', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/edit') },
    { name: 'Background Remover', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/background-remover') },
    { name: 'Image Eraser', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop' },
    { name: 'Image Upscaler', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/image-upscaler') },
    { name: 'Image Enhancer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=400&h=300&fit=crop', onClick: () => navigate('/image-enhancer') },
    { name: 'Image Colorizer', category: 'Image Tools', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop', badge: 'AI' },
  ];

  const videoApps = [
    { name: 'Sessions', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/sessions') },
    { name: 'Video Downloader', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/video-downloader') },
    { name: 'Video Resizer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop', timestamp: '01:32' },
    { name: 'Motion-Sync', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop', badge: 'AI' },
    { name: 'Explainer Video', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop', timestamp: '02:00', onClick: () => navigate('/explainer-video') },
    { name: 'AI Influencer', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/ai-influencer') },
    { name: 'Viral Shorts', category: 'Video Tools', thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop', badge: 'HOT', onClick: () => navigate('/viral-shorts') },
  ];

  const audioApps = [
    { name: 'AI Voice Cloner', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/voice-cloner') },
    { name: 'Transcribe', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/transcribe') },
    { name: 'AI Voice Changer', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/voice-changer') },
    { name: 'AI Voiceovers', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/voiceovers') },
    { name: 'AI Audio Dubber', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/audio-dubber') },
    { name: 'AI Noise Remover', category: 'Audio Tools', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/noise-remover') },
  ];

  const designApps = [
    { name: 'Logo Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop', badge: 'AI' },
    { name: 'Banner Creator', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop' },
    { name: 'Flyer Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop' },
    { name: 'Poster Designer', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop' },
    { name: 'Infographic Builder', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'AI' },
    { name: 'Presentation Maker', category: 'Design Tools', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop' },
  ];

  const contentApps = [
    { name: 'Article', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/article') },
    { name: 'Job Newsletter', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/newsletter') },
    { name: 'Blog Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/blog-writer') },
    { name: 'Social Posts', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/social-posts') },
    { name: 'Email Generator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/email-generator') },
    { name: 'Ad Copy Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/ad-copy-writer') },
    { name: 'Script Writer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/script-writer') },
    { name: 'SEO Optimizer', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/seo-optimizer') },
    { name: 'Ebook Creator', category: 'Content Tools', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/ebook-creator') },
  ];

  const toolsApps = [
    { name: 'Digital Spy', category: 'Content Intelligence', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/digital-spy') },
    { name: 'Inbox', category: 'Communication', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/inbox') },
    { name: 'Investor Calculator', category: 'Real Estate', thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/investor-calculator') },
    { name: 'AI Responder', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/ai-responder') },
    { name: 'Master Closer', category: 'Sales Tools', thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/master-closer') },
    { name: 'Editor', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop', badge: 'PRO', onClick: () => navigate('/edit') },
    { name: 'Versus', category: 'LLM Tool', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', badge: 'LLM', onClick: () => navigate('/versus') },
    { name: 'Forms', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/forms') },
    { name: 'Signature', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', badge: 'NEW', onClick: () => navigate('/signature') },
    { name: 'Prompt Lab', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop', badge: 'AI' },
    { name: 'Model Benchmark', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
    { name: 'AI Story', category: 'Tools', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop', badge: 'AI', onClick: () => navigate('/ai-story') },
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
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 hover:bg-muted transition">
                    <span className="text-sm text-foreground">All</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <SlidersHorizontal size={18} className="text-muted-foreground" />
                  </button>
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <Search size={18} className="text-muted-foreground" />
                  </button>
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <ZoomIn size={18} className="text-muted-foreground" />
                  </button>
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <ZoomOut size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg mb-6">
                A full suite of intelligent AI Apps to help you create like a pro.
              </p>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'apps' | 'marketplace')}>
                <TabsList className="bg-muted">
                  <TabsTrigger value="apps" className="gap-2">
                    <Play size={14} />
                    My Apps
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="gap-2">
                    <Store size={14} />
                    Marketplace
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            {activeTab === 'apps' ? (
              <div className="w-full space-y-16">
                
                {/* Trending Section */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">TRENDING</h2>
                      <p className="text-muted-foreground">The hottest AI effects right now</p>
                    </div>
                    <button 
                      onClick={() => setExpandedSections({ ...expandedSections, trending: !expandedSections.trending })}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
                    >
                      See All
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {trendingApps.map((app) => {
                      const appId = resolveAppId(app.name);
                      const favorited = isFavorite(appId);
                      const installed = isInstalled(appId);
                      return (
                        <div
                          key={app.id}
                          className="group relative bg-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary transition-all border border-border"
                        >
                          <div className="relative aspect-[4/3]">
                            <img
                              src={app.image}
                              alt={app.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {app.badge && (
                              <div className={`absolute top-4 left-4 ${app.badgeColor} text-black font-bold text-xs px-3 py-1 rounded-full`}>
                                {app.badge}
                              </div>
                            )}
                            {installed && (
                              <div className="absolute top-4 right-4 bg-primary text-primary-foreground font-bold text-xs px-3 py-1 rounded-full">
                                INSTALLED
                              </div>
                            )}
                            {/* Star Favorite Overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(appId);
                              }}
                              className={`absolute bottom-3 right-3 p-1.5 rounded-full transition-all ${
                                favorited 
                                  ? 'bg-amber-500 text-white' 
                                  : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                              } hover:scale-110`}
                            >
                              <Star size={14} className={favorited ? 'fill-current' : ''} />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 text-foreground">{app.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{app.description}</p>
                            {installed ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  className="flex-1"
                                  onClick={() => openInstalledApp(app.name)}
                                >
                                  <Play size={14} className="mr-1" />
                                  Open
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleActivateApp(appId)}
                                >
                                  Activate
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => openInstallForAppName(app.name)}
                              >
                                <Play size={16} fill="currentColor" className="mr-2" />
                                Install
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Top Picks Section */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold mb-2">TOP PICKS FOR YOU</h2>
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
                      const appId = app.name.toLowerCase().replace(/\s+/g, '-');
                      const favorited = isFavorite(appId);
                      return (
                        <div
                          key={app.id}
                          className="group relative bg-card rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-border"
                        >
                          {/* Star Favorite Overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(appId);
                            }}
                            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                              favorited 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100'
                            } hover:scale-110`}
                          >
                            <Star size={14} className={favorited ? 'fill-current' : ''} />
                          </button>
                          <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                            {app.icon}
                          </div>
                          <h3 className="font-bold mb-1 text-foreground">{app.name}</h3>
                          <p className="text-muted-foreground text-sm">{app.description}</p>
                        </div>
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
              /* Marketplace Tab */
              <div className="w-full">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sampleMarketplaceApps.length} apps available for white-label
                  </p>
                  {!hasLicense && (
                    <Button variant="outline" size="sm">
                      🔓 Upgrade for White-Label
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sampleMarketplaceApps.map((app) => {
                    const installed = isInstalled(app.id);
                    return (
                      <div 
                        key={app.id}
                        className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow duration-200"
                      >
                        {/* Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">{app.icon}</div>
                          {app.isWhitelabelEligible && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                              {hasLicense ? '✓' : '🔒'}
                              <span>White-label</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-foreground mb-2">{app.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.description}</p>

                        {/* Features */}
                        <ul className="space-y-1 mb-4">
                          {app.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center">
                              <span className="text-primary mr-2">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {/* Action Buttons */}
                        {installed ? (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleOpenApp(`/${app.id}`, app.id)}
                            >
                              <Play size={14} className="mr-1" />
                              Open
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleActivateApp(app.id)}
                            >
                              Activate
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => setInstallModalApp(app)}
                          >
                            Install
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
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
