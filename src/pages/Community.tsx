import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar, { type FilterState } from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';

const Community = () => {
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="flex-shrink-0">
          <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-white">
          {/* Header - Sticky */}
          <div className="px-4 md:px-8 py-4 md:py-6 bg-white sticky top-0 z-40 border-b border-border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">COMMUNITY</h1>
                <p className="text-muted-foreground text-sm md:text-base">Explore creations from the community</p>
              </div>
              <FilterToolbar zoom={zoom} onZoomChange={setZoom} onFiltersChange={setFilters} />
            </div>
          </div>
          
          <div className="px-4 md:px-8 py-4 md:py-8">

            {/* Gallery Content */}
            <CreationsGallery type="community" columnsPerRow={zoomLevel} filters={filters} />
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
