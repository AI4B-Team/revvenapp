import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar from '@/components/dashboard/FilterToolbar';

const Community = () => {
  const [zoom, setZoom] = useState(50);
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-5xl font-bold">COMMUNITY</h1>
              <FilterToolbar zoom={zoom} onZoomChange={setZoom} />
            </div>
            
            <CreationsGallery type="community" columnsPerRow={zoomLevel} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
