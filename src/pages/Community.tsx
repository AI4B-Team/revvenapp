import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import { ZoomIn, ZoomOut } from 'lucide-react';

const Community = () => {
  const [zoomLevel, setZoomLevel] = useState(4);

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
              
              {/* Zoom Control */}
              <div className="flex items-center gap-3 px-4 py-2">
                <button
                  onClick={() => setZoomLevel(Math.min(6, zoomLevel + 1))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom out (show more images)"
                >
                  <ZoomOut size={20} />
                </button>
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-32 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
                <button
                  onClick={() => setZoomLevel(Math.max(3, zoomLevel - 1))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom in (show fewer images)"
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>
            
            <CreationsGallery type="community" columnsPerRow={zoomLevel} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
