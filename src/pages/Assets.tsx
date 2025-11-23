import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Assets = () => {
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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
              <h1 className="text-3xl font-bold">ASSETS</h1>
              <FilterToolbar zoom={zoom} onZoomChange={setZoom} />
            </div>

            <Tabs defaultValue="creations" className="w-full">
              <TabsList>
                <TabsTrigger value="creations">Creations</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="creations">
                <CreationsGallery type="creations" columnsPerRow={zoomLevel} />
              </TabsContent>
              
              <TabsContent value="community">
                <div className="text-center py-12 text-muted-foreground">
                  Community content coming soon
                </div>
              </TabsContent>
              
              <TabsContent value="collections">
                <div className="text-center py-12 text-muted-foreground">
                  Collections coming soon
                </div>
              </TabsContent>
            </Tabs>
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
