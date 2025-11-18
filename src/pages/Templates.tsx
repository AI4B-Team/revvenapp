import { useState } from 'react';
import { 
  Play, ChevronRight, ChevronDown, SlidersHorizontal, Search, ZoomIn, ZoomOut
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';

const Templates = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Content');

  const trendingAutomations = [
    {
      id: 1,
      name: 'Content Automation',
      description: 'Automatically generate and publish content across all platforms',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Social Media Manager',
      description: 'Auto-schedule, post, and respond to all social interactions',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 3,
      name: 'Email Campaign Bot',
      description: 'Create, personalize, and send email campaigns automatically',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
      badge: 'TOP',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 4,
      name: 'SEO Optimizer',
      description: 'Automatically optimize content and track rankings 24/7',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      badge: 'NEW',
      badgeColor: 'bg-green-500'
    },
    {
      id: 5,
      name: 'Sales Lead Bot',
      description: 'Automatically qualify and follow-up with leads instantly',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop',
      badge: 'HOT',
      badgeColor: 'bg-red-500'
    }
  ];

  const topPicks = [
    {
      id: 1,
      name: 'Auto-Responder',
      description: 'Reply to messages instantly',
      icon: '💬',
      color: 'bg-yellow-500'
    },
    {
      id: 2,
      name: 'Content Scheduler',
      description: 'Schedule posts in advance',
      icon: '📅',
      color: 'bg-pink-500'
    },
    {
      id: 3,
      name: 'Analytics Bot',
      description: 'Track metrics automatically',
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      id: 4,
      name: 'Lead Qualifier',
      description: 'Score and qualify leads',
      icon: '🎯',
      color: 'bg-green-500'
    }
  ];


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isAutomatePage
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="px-8 py-12 border-b border-border">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">
                  <span className="text-primary">AUTOMATE</span>
                </h1>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-3">
                  {/* All Dropdown */}
                  <button className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 hover:bg-muted transition">
                    <span className="text-sm text-foreground">All</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>

                  {/* Controls Dropdown */}
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <SlidersHorizontal size={18} className="text-muted-foreground" />
                  </button>

                  {/* Search Dropdown */}
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <Search size={18} className="text-muted-foreground" />
                  </button>

                  {/* Zoom In */}
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <ZoomIn size={18} className="text-muted-foreground" />
                  </button>

                  {/* Zoom Out */}
                  <button className="p-2 border border-border rounded-lg hover:bg-muted transition">
                    <ZoomOut size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg">
                Automate your business with intelligent AI agents that work 24/7
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-12">
            <div className="w-full space-y-16">
              
              {/* Trending Section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                  <button className="text-primary hover:text-primary/80 text-sm flex items-center gap-2">
                    View More <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {trendingAutomations.map((automation) => (
                    <div 
                      key={automation.id} 
                      className="group cursor-pointer overflow-hidden rounded-xl border border-border hover:border-primary/50 transition bg-card"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img 
                          src={automation.image} 
                          alt={automation.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={`absolute top-3 left-3 px-2 py-1 ${automation.badgeColor} text-white text-xs font-bold rounded`}>
                          {automation.badge}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition">
                              <Play size={16} fill="currentColor" />
                              <span className="text-sm font-medium">Try Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition">
                          {automation.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {automation.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Picks Section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Top Picks For You</h2>
                  <button className="text-primary hover:text-primary/80 text-sm flex items-center gap-2">
                    View More <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {topPicks.map((pick) => (
                    <div 
                      key={pick.id}
                      className="group cursor-pointer p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card hover:shadow-lg"
                    >
                      <div className={`w-12 h-12 ${pick.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                        {pick.icon}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition">
                        {pick.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pick.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <DigitalCharactersModal 
        isOpen={charactersModalOpen}
        onClose={() => setCharactersModalOpen(false)}
      />
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen}
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default Templates;
