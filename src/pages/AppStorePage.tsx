import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { getCatalogApp } from '@/lib/marketplace/catalog';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { mockMembers, mockMarketplaceWorkspace, mockMarketplaceUser } from '@/lib/marketplace/data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Download, 
  DollarSign, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Zap,
  Users,
  Clock,
  Check,
  ExternalLink,
  X
} from 'lucide-react';
import { appRoutes } from '@/lib/marketplace/catalog';

// Mock screenshots for apps - in production these would come from the catalog
const getAppScreenshots = (appId: string): { src: string; title: string }[] => {
  // Generate placeholder screenshots based on app ID
  const colors = ['4F46E5', '059669', 'DC2626', 'D97706', '7C3AED', '2563EB', '0891B2', 'BE185D'];
  return [
    { src: `https://placehold.co/800x500/${colors[0]}/white?text=${encodeURIComponent('Dashboard View')}`, title: 'Dashboard View' },
    { src: `https://placehold.co/800x500/${colors[1]}/white?text=${encodeURIComponent('Editor Interface')}`, title: 'Editor Interface' },
    { src: `https://placehold.co/800x500/${colors[2]}/white?text=${encodeURIComponent('Analytics')}`, title: 'Analytics' },
    { src: `https://placehold.co/800x500/${colors[3]}/white?text=${encodeURIComponent('Settings')}`, title: 'Settings' },
    { src: `https://placehold.co/800x500/${colors[4]}/white?text=${encodeURIComponent('Team View')}`, title: 'Team View' },
    { src: `https://placehold.co/800x500/${colors[5]}/white?text=${encodeURIComponent('Reports')}`, title: 'Reports' },
    { src: `https://placehold.co/800x500/${colors[6]}/white?text=${encodeURIComponent('Integrations')}`, title: 'Integrations' },
    { src: `https://placehold.co/800x500/${colors[7]}/white?text=${encodeURIComponent('Notifications')}`, title: 'Notifications' },
  ];
};

// Extended features with descriptions
const getExtendedFeatures = (appId: string) => [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with instant load times and smooth interactions.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance with industry standards.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time updates and shared workspaces.'
  },
  {
    icon: Clock,
    title: 'Auto-Save',
    description: 'Never lose your work with automatic cloud saving and version history.'
  },
];

// Mock reviews
const mockReviews = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2 days ago',
    title: 'Exactly what I needed!',
    content: 'This app has transformed my workflow. The interface is intuitive and the features are powerful.',
    avatar: 'SM'
  },
  {
    id: '2',
    author: 'James K.',
    rating: 4,
    date: '1 week ago',
    title: 'Great app with minor issues',
    content: 'Overall excellent experience. Would love to see more export options in future updates.',
    avatar: 'JK'
  },
  {
    id: '3',
    author: 'Maria L.',
    rating: 5,
    date: '2 weeks ago',
    title: 'Best in class',
    content: 'I have tried many similar apps but this one stands out. The customer support is also exceptional.',
    avatar: 'ML'
  }
];

const AppStorePage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [screenshotStartIndex, setScreenshotStartIndex] = useState(0);
  const [showInstallPanel, setShowInstallPanel] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const { isInstalled, installApp } = useInstalledApps();
  
  const app = appId ? getCatalogApp(appId) : undefined;
  const screenshots = appId ? getAppScreenshots(appId) : [];
  const extendedFeatures = appId ? getExtendedFeatures(appId) : [];
  const installed = appId ? isInstalled(appId) : false;
  const appRoute = appId ? appRoutes[appId] : undefined;
  
  const visibleCount = 4; // Number of screenshots visible at once

  // Mock users for access control
  const accessUsers = [
    { id: 'all', name: 'Everyone In This Workspace' },
    { id: 'brian', name: 'Brian' },
    { id: 'francis', name: 'Francis' },
    { id: 'rich', name: 'Rich' },
    { id: 'damoi', name: 'Damoi' },
    { id: 'keisha', name: 'Keisha' },
  ];

  const handleInstall = () => {
    if (!appId) return;
    
    const accessMode = selectedUserId === 'all' ? 'all_members' : 'select_users';
    const userIds = selectedUserId === 'all' ? [] : [selectedUserId];
    
    installApp(
      appId,
      mockMarketplaceWorkspace.id,
      mockMarketplaceUser.id,
      accessMode as any,
      userIds,
      []
    );
    toast.success(`${app?.name} installed successfully!`);
    setShowInstallPanel(false);
  };

  const handleResell = () => {
    if (appId) {
      navigate(`/app-license/${appId}`);
    }
  };

  const handleOpen = () => {
    if (appRoute) {
      navigate(appRoute);
    }
  };

  const canScrollLeft = screenshotStartIndex > 0;
  const canScrollRight = screenshotStartIndex + visibleCount < screenshots.length;

  const scrollScreenshotsLeft = () => {
    if (canScrollLeft) {
      setScreenshotStartIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollScreenshotsRight = () => {
    if (canScrollRight) {
      setScreenshotStartIndex(prev => Math.min(screenshots.length - visibleCount, prev + 1));
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % screenshots.length);
  };

  if (!app) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground text-lg">App not found</p>
              <Button onClick={() => navigate('/apps')} variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Apps
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Back Button and Action Buttons Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/apps')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Apps
              </button>
              
              {/* Action Buttons - Top Right */}
              <div className="flex flex-wrap gap-3">
                {installed ? (
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleOpen}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open App
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setShowInstallPanel(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleResell}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Resell
                </Button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              {/* App Icon & Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center text-6xl shadow-lg">
                  {app.icon}
                </div>
              </div>

              {/* App Details */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{app.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{app.description}</p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="capitalize">{app.category}</Badge>
                    {app.isWhitelabelEligible && (
                      <Badge className="bg-primary/10 text-primary border-0">White-Label Ready</Badge>
                    )}
                    {installed && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Installed
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= 4.5 ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                        />
                      ))}
                      <span className="ml-2 font-semibold text-foreground">4.8</span>
                    </div>
                    <span className="text-muted-foreground">2.4K Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Install Panel */}
            {showInstallPanel && (
              <div className="mb-8 p-6 bg-muted/50 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Who Should Have Access?</h3>
                <div className="space-y-3">
                  {accessUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-background border border-transparent hover:bg-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="access-user"
                        value={user.id}
                        checked={selectedUserId === user.id}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary"
                      />
                      <span className="text-foreground font-medium">{user.name}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>NOTE:</strong> You can change access permissions later from the app settings.
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowInstallPanel(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleInstall}
                  >
                    Install App
                  </Button>
                </div>
              </div>
            )}

            {/* Screenshots Carousel - 4 in a row */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">Screenshots</h2>
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={scrollScreenshotsLeft}
                  disabled={!canScrollLeft}
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background border border-border shadow-lg transition-all ${
                    canScrollLeft 
                      ? 'hover:bg-muted cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                
                {/* Screenshots Grid */}
                <div className="overflow-hidden">
                  <div className="grid grid-cols-4 gap-4">
                    {screenshots.slice(screenshotStartIndex, screenshotStartIndex + visibleCount).map((screenshot, index) => (
                      <div 
                        key={screenshotStartIndex + index}
                        onClick={() => openLightbox(screenshotStartIndex + index)}
                        className="relative aspect-video rounded-xl border border-border overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                      >
                        <img
                          src={screenshot.src}
                          alt={screenshot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">{screenshot.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Arrow */}
                <button
                  onClick={scrollScreenshotsRight}
                  disabled={!canScrollRight}
                  className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background border border-border shadow-lg transition-all ${
                    canScrollRight 
                      ? 'hover:bg-muted cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
              
              {/* Indicator dots */}
              <div className="flex gap-2 mt-4 justify-center">
                {Array.from({ length: screenshots.length - visibleCount + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setScreenshotStartIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === screenshotStartIndex 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
                <div className="relative">
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  
                  <img
                    src={screenshots[lightboxIndex]?.src}
                    alt={screenshots[lightboxIndex]?.title}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  
                  {/* Lightbox Navigation */}
                  <button
                    onClick={lightboxPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Caption */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-medium">{screenshots[lightboxIndex]?.title}</span>
                    <span className="text-white/60 ml-2">({lightboxIndex + 1} of {screenshots.length})</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Features Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Features from catalog */}
                {app.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{feature}</span>
                  </div>
                ))}
                
                {/* Extended Features */}
                {extendedFeatures.map((feature, index) => (
                  <div 
                    key={`ext-${index}`}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">About This App</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {app.name} is a powerful tool designed to streamline your workflow and boost productivity. 
                  Built with cutting-edge technology, it offers a seamless experience across all devices.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Whether you're a solo creator or part of a large team, {app.name} adapts to your needs 
                  with its flexible configuration options and intuitive interface. The white-label capability 
                  allows you to customize the experience for your clients, making it perfect for agencies 
                  and resellers.
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Reviews & Ratings</h2>
                <Button variant="ghost" size="sm">
                  See All
                </Button>
              </div>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-8 mb-6 p-6 bg-muted/50 rounded-2xl border border-border">
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground">4.8</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">2,438 Reviews</div>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-4">{rating}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="p-4 bg-background rounded-xl border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {review.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{review.author}</div>
                          <div className="text-xs text-muted-foreground">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* App Info Footer */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium text-foreground capitalize">{app.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Version</div>
                  <div className="font-medium text-foreground">2.4.1</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="font-medium text-foreground">12.8 MB</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                  <div className="font-medium text-foreground">Jan 20, 2026</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Compatibility</div>
                  <div className="font-medium text-foreground">All Devices</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                  <div className="font-medium text-foreground">English, Spanish, +8</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Developer</div>
                  <div className="font-medium text-foreground">REVVEN Inc.</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">White-Label</div>
                  <div className="font-medium text-foreground">{app.isWhitelabelEligible ? 'Available' : 'Not Available'}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppStorePage;
