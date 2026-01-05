import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import ImageViewerModal from '@/components/dashboard/ImageViewerModal';
import WorkspacePanel from '@/components/dashboard/WorkspacePanel';
import { creationsData, GalleryItem } from '@/data/creationsData';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'templates' | 'community' | 'collections'>('tools');
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const imageTools = [
    { 
      name: 'Art Blocks', 
      description: 'AI create some art works',
      bgColor: 'bg-tool-blue',
      emoji: '🎨'
    },
    { 
      name: 'Background Remover', 
      description: 'Remove backgrounds',
      bgColor: 'bg-tool-yellow',
      emoji: '✂️'
    },
    { 
      name: 'Image Eraser', 
      description: 'Erase parts of images',
      bgColor: 'bg-tool-blue',
      emoji: '🖼️'
    },
    { 
      name: 'Image Upscaler', 
      description: 'Enhance image quality',
      bgColor: 'bg-tool-yellow',
      emoji: '📸'
    },
    { 
      name: 'Image Enhancer', 
      description: 'Improve image details',
      bgColor: 'bg-tool-blue',
      emoji: '❤️'
    },
    { 
      name: 'Image Colorizer', 
      description: 'Add color to images',
      bgColor: 'bg-tool-gray',
      emoji: '🌹'
    },
  ];

  const videoTools = [
    { 
      name: 'Video Downloader', 
      description: 'Download videos',
      bgColor: 'bg-tool-blue',
      emoji: '📥'
    },
    { 
      name: 'Video Resizer', 
      description: 'Resize video dimensions',
      bgColor: 'bg-tool-pink',
      emoji: '📐'
    },
    { 
      name: 'Motion-Sync', 
      description: 'Sync video motion',
      bgColor: 'bg-tool-yellow',
      emoji: '🎬'
    },
    { 
      name: 'Explainer Video', 
      description: 'Create educational videos',
      bgColor: 'bg-tool-blue',
      emoji: '🎬'
    },
  ];

  const audioTools = [
    { 
      name: 'AI Voice Cloner', 
      description: 'Clone any voice',
      bgColor: 'bg-tool-blue',
      emoji: '🎤'
    },
    { 
      name: 'Transcribe', 
      description: 'Transcribe audio to text',
      bgColor: 'bg-tool-pink',
      emoji: '📝'
    },
    { 
      name: 'AI Voice Changer', 
      description: 'Transform voice style',
      bgColor: 'bg-tool-blue',
      emoji: '🎵'
    },
    { 
      name: 'AI Voiceovers', 
      description: 'Generate voiceovers',
      bgColor: 'bg-tool-yellow',
      emoji: '🎬'
    },
    { 
      name: 'AI Audio Dubber', 
      description: 'Dub audio tracks',
      bgColor: 'bg-tool-blue',
      emoji: '🎧'
    },
    { 
      name: 'AI Noise Remover', 
      description: 'Remove background noise',
      bgColor: 'bg-tool-yellow',
      emoji: '🔇'
    },
  ];

  // Filter creations based on asset filter
  const filteredAssets = assetFilter && assetFilter !== 'all' 
    ? creationsData.filter(item => {
        if (assetFilter === 'images') return item.type === 'image';
        if (assetFilter === 'videos') return item.type === 'video';
        return false;
      })
    : creationsData;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedType(tab);
          setAssetFilter(null);
        }}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onAssetFilterChange={(filter) => {
          setAssetFilter(filter);
          setActiveTab('');
        }}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {identitySidebarOpen && (
        <AIPersonaSidebar 
          isOpen={identitySidebarOpen}
          onClose={() => setIdentitySidebarOpen(false)}
        />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onCreateClick={() => setSelectedType(selectedType || 'Content')} onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-background">
          {assetFilter ? (
            <div className="px-8 py-8">
              <h1 className="text-4xl font-bold mb-2">
                {assetFilter === 'all' ? 'All Assets' : assetFilter.charAt(0).toUpperCase() + assetFilter.slice(1)}
              </h1>
              <p className="text-muted-foreground mb-8">
                {filteredAssets.length} {filteredAssets.length === 1 ? 'item' : 'items'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAssets.map((item) => (
                  <div 
                    key={item.id} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedImage(item)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (activeTab || selectedType) ? (
            <div className="px-8 py-8">
              <h1 className="text-5xl font-bold text-center mb-8">What Would You Like To Create Today?</h1>
              
              <ContentTypeSelector selectedType={selectedType || activeTab} onTypeChange={(type) => {
                setSelectedType(type);
                setActiveTab(type);
              }} />
              
              <GenerationInput 
                selectedType={selectedType || activeTab}
                onCharactersClick={() => setCharactersModalOpen(true)}
              />
              
              <ActionButtons activeView={activeView} onViewChange={setActiveView} />
              
              {/* Image Tools Section */}
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-6">IMAGE TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {imageTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>

                {/* Video Tools Section */}
                <h2 className="text-2xl font-bold mb-6">VIDEO TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                  {videoTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>

                {/* Audio Tools Section */}
                <h2 className="text-2xl font-bold mb-6">AUDIO TOOLS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {audioTools.map((tool, idx) => (
                    <ToolCard key={idx} {...tool} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <WorkspacePanel />
          )}
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)} 
      />

      {selectedImage && (
        <ImageViewerModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Index;
