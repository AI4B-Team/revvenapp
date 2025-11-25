import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar, { type FilterState } from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import CollectionsView from '@/components/dashboard/CollectionsView';
import { Users, FolderOpen } from 'lucide-react';

const Community = () => {
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'community' | 'collections'>('community');
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">COMMUNITY</h1>
                
                {/* Tab Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('community')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'community'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Community
                  </button>
                  <button
                    onClick={() => setActiveTab('collections')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'collections'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Collections
                  </button>
                </div>
              </div>
              <FilterToolbar zoom={zoom} onZoomChange={setZoom} onFiltersChange={setFilters} />
            </div>

            {/* Tab Content */}
            {activeTab === 'community' && (
              <CreationsGallery type="community" columnsPerRow={zoomLevel} filters={filters} />
            )}
            
            {activeTab === 'collections' && (
              <CollectionsView
                categories={['All Content', 'Popular', 'Trending', 'Recent', 'Favorites']}
                popularCollections={[
                  {
                    id: 'community-1',
                    title: 'Community Favorites',
                    totalCount: 234,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', alt: 'Favorite 1' },
                      { url: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=400', alt: 'Favorite 2' },
                      { url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400', alt: 'Favorite 3' },
                      { url: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400', alt: 'Favorite 4' },
                    ],
                  },
                  {
                    id: 'community-2',
                    title: 'Trending Designs',
                    totalCount: 156,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', alt: 'Design 1' },
                      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'Design 2' },
                      { url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400', alt: 'Design 3' },
                      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400', alt: 'Design 4' },
                    ],
                  },
                  {
                    id: 'community-3',
                    title: 'Creator Showcase',
                    totalCount: 98,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800', alt: 'Showcase 1' },
                      { url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400', alt: 'Showcase 2' },
                      { url: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=400', alt: 'Showcase 3' },
                      { url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400', alt: 'Showcase 4' },
                    ],
                  },
                ]}
                recommendedCollections={[
                  {
                    id: 'community-4',
                    title: 'Weekly Highlights',
                    totalCount: 145,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', alt: 'Highlight 1' },
                      { url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400', alt: 'Highlight 2' },
                      { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', alt: 'Highlight 3' },
                      { url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400', alt: 'Highlight 4' },
                    ],
                  },
                  {
                    id: 'community-5',
                    title: 'Inspiration Board',
                    totalCount: 187,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800', alt: 'Inspiration 1' },
                      { url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400', alt: 'Inspiration 2' },
                      { url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400', alt: 'Inspiration 3' },
                      { url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400', alt: 'Inspiration 4' },
                    ],
                  },
                  {
                    id: 'community-6',
                    title: 'Top Rated Collection',
                    totalCount: 213,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800', alt: 'Top 1' },
                      { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', alt: 'Top 2' },
                      { url: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=400', alt: 'Top 3' },
                      { url: 'https://images.unsplash.com/photo-1604537529586-27d218c1a62e?w=400', alt: 'Top 4' },
                    ],
                  },
                ]}
              />
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
    </div>
  );
};

export default Community;
