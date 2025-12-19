import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar, { type FilterState } from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { AssetFolderGrid, type AssetFolder, type FolderType } from '@/components/dashboard/AssetFolders';
import { creationsData } from '@/data/creationsData';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Assets = () => {
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'folders' | 'gallery'>('folders');
  const [currentFolderType, setCurrentFolderType] = useState<FolderType | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  
  // Asset counts from database
  const [imageCounts, setImageCounts] = useState({ images: 0, videos: 0 });

  // Fetch real counts from database
  useEffect(() => {
    const fetchCounts = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      // Count images
      const { count: imageCount } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id);

      // Count videos
      const { count: videoCount } = await supabase
        .from('ai_videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id);

      setImageCounts({
        images: (imageCount || 0) + creationsData.filter(item => item.type === 'image').length,
        videos: (videoCount || 0) + creationsData.filter(item => item.type === 'video').length
      });
    };

    fetchCounts();
  }, []);

  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  // Create folders with actual counts
  const [folders, setFolders] = useState<AssetFolder[]>([]);

  useEffect(() => {
    const defaultFolders: AssetFolder[] = [
      { 
        id: 'photos', 
        name: 'Photos', 
        fileCount: imageCounts.images, 
        type: 'photos', 
        lastModified: new Date(), 
        color: 'blue', 
        isFavorite: false 
      },
      { 
        id: 'videos', 
        name: 'Videos', 
        fileCount: imageCounts.videos, 
        type: 'videos', 
        lastModified: new Date(), 
        color: 'blue', 
        isFavorite: false 
      },
      { 
        id: 'music', 
        name: 'Music', 
        fileCount: 0, 
        type: 'music', 
        lastModified: new Date(), 
        color: 'blue', 
        isFavorite: false 
      },
      { 
        id: 'documents', 
        name: 'Documents', 
        fileCount: 0, 
        type: 'documents', 
        lastModified: new Date(), 
        color: 'blue', 
        isFavorite: false 
      },
    ];
    setFolders(defaultFolders);
  }, [imageCounts]);

  const handleCreateFolder = () => {
    const newFolder: AssetFolder = {
      id: Date.now().toString(),
      name: 'New Folder',
      fileCount: 0,
      type: 'default',
      lastModified: new Date(),
      color: 'blue',
      isFavorite: false,
    };
    setFolders([...folders, newFolder]);
  };

  const handleOpenFolder = (folderId: string, folderType: FolderType) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentFolderType(folderType);
      setCurrentFolderName(folder.name);
      setCurrentView('gallery');
      
      // Set content type filter based on folder type
      if (folderType === 'photos') {
        setFilters(prev => ({ ...prev, contentType: 'Image' } as FilterState));
      } else if (folderType === 'videos') {
        setFilters(prev => ({ ...prev, contentType: 'Video' } as FilterState));
      }
    }
  };

  const handleBackToFolders = () => {
    setCurrentView('folders');
    setCurrentFolderType(null);
    setCurrentFolderName('');
    setFilters(undefined);
  };

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
        
        <main className="flex-1 overflow-auto bg-background">
          <div className="px-8 py-8">
            {currentView === 'folders' ? (
              <AssetFolderGrid
                folders={folders}
                onFoldersChange={setFolders}
                onCreateFolder={handleCreateFolder}
                onOpenFolder={handleOpenFolder}
              />
            ) : (
              <>
                {/* Back button and folder title */}
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToFolders}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">{currentFolderName}</h1>
                    <p className="text-muted-foreground">
                      {currentFolderType === 'photos' ? 'All your images' : 
                       currentFolderType === 'videos' ? 'All your videos' : 
                       'Folder contents'}
                    </p>
                  </div>
                </div>

                {/* Filter toolbar */}
                <div className="flex items-center justify-end mb-8">
                  <FilterToolbar zoom={zoom} onZoomChange={setZoom} onFiltersChange={setFilters} />
                </div>

                {/* Creations Gallery */}
                <CreationsGallery type="creations" columnsPerRow={zoomLevel} filters={filters} />
              </>
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
