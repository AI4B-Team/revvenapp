import { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Play, Grid3x3, Grid2x2 } from 'lucide-react';
import { creationsData, communityData } from '@/data/creationsData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Assets = () => {
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(4);

  // Combine creations and community data
  const allAssets = useMemo(() => [...creationsData, ...communityData], []);

  // Filter assets by type
  const filteredAssets = useMemo(() => {
    if (!assetFilter) return allAssets;
    if (assetFilter === 'images') return allAssets.filter(item => item.type === 'image');
    if (assetFilter === 'videos') return allAssets.filter(item => item.type === 'video');
    return allAssets;
  }, [allAssets, assetFilter]);

  // Organize by media type
  const organizedAssets = useMemo(() => {
    return {
      all: allAssets,
      images: allAssets.filter(item => item.type === 'image'),
      videos: allAssets.filter(item => item.type === 'video'),
    };
  }, [allAssets]);

  const renderGallery = (items: typeof allAssets) => {
    const columns = zoomLevel;
    
    return (
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-card rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Video Play Button Overlay */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Play size={20} fill="currentColor" className="text-primary-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-2 text-foreground truncate">{item.title}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {item.creator.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{item.creator.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onAssetFilterChange={setAssetFilter} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-background">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Assets</h1>
                <p className="text-muted-foreground">
                  {assetFilter === 'images' && `${organizedAssets.images.length} images`}
                  {assetFilter === 'videos' && `${organizedAssets.videos.length} videos`}
                  {!assetFilter && `${organizedAssets.all.length} total assets`}
                </p>
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(3)}
                  className={`p-2 rounded-lg transition ${
                    zoomLevel === 3 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
                  }`}
                  title="Large thumbnails"
                >
                  <Grid2x2 size={20} />
                </button>
                <button
                  onClick={() => setZoomLevel(4)}
                  className={`p-2 rounded-lg transition ${
                    zoomLevel === 4 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
                  }`}
                  title="Medium thumbnails"
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setZoomLevel(6)}
                  className={`p-2 rounded-lg transition ${
                    zoomLevel === 6 ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
                  }`}
                  title="Small thumbnails"
                >
                  <Grid3x3 size={16} />
                </button>
              </div>
            </div>

            {/* Display assets based on filter or show all organized by type */}
            {assetFilter ? (
              <div className="mb-12">
                {renderGallery(filteredAssets)}
              </div>
            ) : (
              <div className="space-y-12">
                {/* All Creations */}
                <section>
                  <h2 className="text-2xl font-bold mb-6">All Creations</h2>
                  {renderGallery(organizedAssets.all)}
                </section>

                {/* Images */}
                {organizedAssets.images.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Images ({organizedAssets.images.length})</h2>
                    {renderGallery(organizedAssets.images)}
                  </section>
                )}

                {/* Videos */}
                {organizedAssets.videos.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Videos ({organizedAssets.videos.length})</h2>
                    {renderGallery(organizedAssets.videos)}
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Assets;
