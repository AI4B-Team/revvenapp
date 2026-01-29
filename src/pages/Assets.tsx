import { useState, useEffect } from 'react';
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
  const [currentView, setCurrentView] = useState<'folders' | 'gallery'>('folders');
  const [currentFolderType, setCurrentFolderType] = useState<FolderType | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  
  // Filter state management
  const [selectedContentType, setSelectedContentType] = useState<string>('All');
  const [filters, setFilters] = useState<FilterState>({
    contentType: 'All',
    likes: false,
    edits: false,
    upscales: false,
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  
  // Asset counts from database
  const [assetCounts, setAssetCounts] = useState({
    images: 0,
    videos: 0,
    music: 0,
    documents: 0
  });

  // Fetch real counts from database
  useEffect(() => {
    const fetchCounts = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const userId = session.session.user.id;

      // Count images
      const { count: imageCount } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Count videos (ai_videos + autoyt_videos + explainer_videos)
      const { count: aiVideoCount } = await supabase
        .from('ai_videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: autoytVideoCount } = await supabase
        .from('autoyt_videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: explainerVideoCount } = await supabase
        .from('explainer_videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Count music/audio (user_voices + audio_app_usage)
      const { count: voicesCount } = await supabase
        .from('user_voices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: audioAppCount } = await supabase
        .from('audio_app_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Count documents (business_plans + proposals + case_studies + cover_letters + handbooks)
      const { count: businessPlansCount } = await supabase
        .from('business_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: proposalsCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: caseStudiesCount } = await supabase
        .from('case_studies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: coverLettersCount } = await supabase
        .from('cover_letters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: handbooksCount } = await supabase
        .from('handbooks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: whitepapersCount } = await supabase
        .from('whitepapers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Also count from static data
      const staticImages = creationsData.filter(item => item.type === 'image').length;
      const staticVideos = creationsData.filter(item => item.type === 'video').length;

      setAssetCounts({
        images: (imageCount || 0) + staticImages,
        videos: (aiVideoCount || 0) + (autoytVideoCount || 0) + (explainerVideoCount || 0) + staticVideos,
        music: (voicesCount || 0) + (audioAppCount || 0),
        documents: (businessPlansCount || 0) + (proposalsCount || 0) + (caseStudiesCount || 0) + (coverLettersCount || 0) + (handbooksCount || 0) + (whitepapersCount || 0)
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
        fileCount: assetCounts.images, 
        type: 'photos', 
        lastModified: new Date(), 
        color: 'blue', 
        isFavorite: false 
      },
      { 
        id: 'videos', 
        name: 'Videos', 
        fileCount: assetCounts.videos, 
        type: 'videos', 
        lastModified: new Date(), 
        color: 'purple', 
        isFavorite: false 
      },
      { 
        id: 'music', 
        name: 'Music & Audio', 
        fileCount: assetCounts.music, 
        type: 'music', 
        lastModified: new Date(), 
        color: 'green', 
        isFavorite: false 
      },
      { 
        id: 'documents', 
        name: 'Documents', 
        fileCount: assetCounts.documents, 
        type: 'documents', 
        lastModified: new Date(), 
        color: 'orange', 
        isFavorite: false 
      },
    ];
    setFolders(defaultFolders);
  }, [assetCounts]);

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
      let contentType = 'All';
      if (folderType === 'photos') {
        contentType = 'Image';
      } else if (folderType === 'videos') {
        contentType = 'Video';
      } else if (folderType === 'music') {
        contentType = 'Audio';
      } else if (folderType === 'documents') {
        contentType = 'Document';
      }
      
      setSelectedContentType(contentType);
      setFilters(prev => ({ 
        ...prev, 
        contentType: contentType 
      }));
    }
  };

  const handleBackToFolders = () => {
    setCurrentView('folders');
    setCurrentFolderType(null);
    setCurrentFolderName('');
    setSelectedContentType('All');
    setFilters({
      contentType: 'All',
      likes: false,
      edits: false,
      upscales: false,
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedContentType(newFilters.contentType);
  };

  const handleContentTypeChange = (type: string) => {
    setSelectedContentType(type);
    setFilters(prev => ({ ...prev, contentType: type }));
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
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
                        {currentFolderType === 'photos' ? `${assetCounts.images} images` : 
                         currentFolderType === 'videos' ? `${assetCounts.videos} videos` : 
                         currentFolderType === 'music' ? `${assetCounts.music} audio files` :
                         currentFolderType === 'documents' ? `${assetCounts.documents} documents` :
                         'Folder contents'}
                      </p>
                    </div>
                  </div>

                  {/* Filter toolbar */}
                  <FilterToolbar 
                    zoom={zoom} 
                    onZoomChange={setZoom} 
                    onFiltersChange={handleFiltersChange}
                    selectedContentType={selectedContentType}
                    onContentTypeChange={handleContentTypeChange}
                  />
                </div>

                {/* Creations Gallery */}
                <CreationsGallery 
                  type="creations" 
                  columnsPerRow={zoomLevel} 
                  filters={filters} 
                />
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
