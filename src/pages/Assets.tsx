import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar, { type FilterState } from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { Sparkles, Users, FolderOpen } from 'lucide-react';

const Assets = () => {
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'creations' | 'community' | 'collections'>('creations');
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onAssetFilterChange={setAssetFilter}
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
                <h1 className="text-3xl font-bold mb-4">ASSETS</h1>
                
                {/* Tab Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('creations')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'creations'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Creations
                  </button>
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
            {activeTab === 'creations' && (
              <CreationsGallery type="creations" columnsPerRow={zoomLevel} filters={filters} />
            )}
            
            {activeTab === 'community' && (
              <CreationsGallery type="community" columnsPerRow={zoomLevel} filters={filters} />
            )}
            
            {activeTab === 'collections' && (
              <div className="text-center py-12 text-muted-foreground">
                Collections coming soon
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
    </div>
  );
};

export default Assets;
