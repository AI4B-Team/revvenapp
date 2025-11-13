import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';

const Create = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'community'>('tools');
  const [zoomLevel, setZoomLevel] = useState(4);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);

  // Reset states when navigating to /create without parameters
  useEffect(() => {
    if (location.pathname === '/create' && !location.search) {
      setActiveTab('');
      setSelectedType('');
    }
  }, [location]);

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
      name: 'AI Transcriber', 
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

  const designTools = [
    { 
      name: 'Logo Designer', 
      description: 'Create brand logos',
      bgColor: 'bg-tool-blue',
      emoji: '🎨'
    },
    { 
      name: 'Banner Creator', 
      description: 'Design social banners',
      bgColor: 'bg-tool-yellow',
      emoji: '🖼️'
    },
    { 
      name: 'Flyer Maker', 
      description: 'Create marketing flyers',
      bgColor: 'bg-tool-green',
      emoji: '📄'
    },
    { 
      name: 'Poster Designer', 
      description: 'Design custom posters',
      bgColor: 'bg-tool-blue',
      emoji: '🎭'
    },
    { 
      name: 'Infographic Builder', 
      description: 'Create infographics',
      bgColor: 'bg-tool-pink',
      emoji: '📊'
    },
    { 
      name: 'Presentation Maker', 
      description: 'Design presentations',
      bgColor: 'bg-tool-yellow',
      emoji: '📺'
    },
  ];

  const contentTools = [
    { 
      name: 'Blog Writer', 
      description: 'Generate blog posts',
      bgColor: 'bg-tool-green',
      emoji: '✍️'
    },
    { 
      name: 'Social Posts', 
      description: 'Create social content',
      bgColor: 'bg-tool-blue',
      emoji: '📱'
    },
    { 
      name: 'Email Generator', 
      description: 'Write email campaigns',
      bgColor: 'bg-tool-yellow',
      emoji: '📧'
    },
    { 
      name: 'Ad Copy Writer', 
      description: 'Generate ad copy',
      bgColor: 'bg-tool-pink',
      emoji: '💡'
    },
    { 
      name: 'Script Writer', 
      description: 'Create video scripts',
      bgColor: 'bg-tool-blue',
      emoji: '🎬'
    },
    { 
      name: 'SEO Optimizer', 
      description: 'Optimize for search',
      bgColor: 'bg-tool-green',
      emoji: '🔍'
    },
  ];

  const appTools = [
    { 
      name: 'Website Builder', 
      description: 'Build custom websites',
      bgColor: 'bg-tool-blue',
      emoji: '🌐'
    },
    { 
      name: 'Landing Page', 
      description: 'Create landing pages',
      bgColor: 'bg-tool-yellow',
      emoji: '📄'
    },
    { 
      name: 'Form Builder', 
      description: 'Design custom forms',
      bgColor: 'bg-tool-green',
      emoji: '📋'
    },
    { 
      name: 'Chat Bot', 
      description: 'Build AI chatbots',
      bgColor: 'bg-tool-blue',
      emoji: '🤖'
    },
    { 
      name: 'API Builder', 
      description: 'Create custom APIs',
      bgColor: 'bg-tool-pink',
      emoji: '⚡'
    },
    { 
      name: 'Automation Flow', 
      description: 'Build workflows',
      bgColor: 'bg-tool-yellow',
      emoji: '🔄'
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedType(tab);
        }}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
      />

      {identitySidebarOpen && (
        <AIPersonaSidebar 
          isOpen={identitySidebarOpen}
          onClose={() => setIdentitySidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            <h1 className="text-5xl font-bold text-center mb-8">What Would You Like To Create Today?</h1>
            
            <ContentTypeSelector selectedType={selectedType} onTypeChange={(type) => {
              setSelectedType(type);
              setActiveTab(type);
            }} />
            
            <GenerationInput 
              selectedType={selectedType}
              onCharactersClick={() => setCharactersModalOpen(true)}
            />
            
            <ActionButtons 
              activeView={activeView} 
              onViewChange={setActiveView}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />
            
            {/* Gallery Views */}
            {activeView === 'creations' && (
              <div className="mb-12">
                <CreationsGallery type="creations" columnsPerRow={zoomLevel} />
              </div>
            )}
            
            {activeView === 'community' && (
              <div className="mb-12">
                <CreationsGallery type="community" columnsPerRow={zoomLevel} />
              </div>
            )}
            
            {/* Tools View */}
            {activeView === 'tools' && (
              <div className="max-w-6xl mx-auto">
                {/* Image Apps Section */}
                {(!selectedType || selectedType === 'Image') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">IMAGE APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                      {imageTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}

                {/* Video Apps Section */}
                {(!selectedType || selectedType === 'Video') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">VIDEO APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                      {videoTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}

                {/* Audio Apps Section */}
                {(!selectedType || selectedType === 'Audio') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">AUDIO APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                      {audioTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}

                {/* Design Apps Section */}
                {(!selectedType || selectedType === 'Design') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">DESIGN APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                      {designTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}

                {/* Content Apps Section */}
                {(!selectedType || selectedType === 'Content') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">CONTENT APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                      {contentTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}

                {/* App Apps Section */}
                {(!selectedType || selectedType === 'Apps') && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">APP APPS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {appTools.map((tool, idx) => (
                        <ToolCard key={idx} {...tool} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <DigitalCharactersModal
        isOpen={charactersModalOpen}
        onClose={() => setCharactersModalOpen(false)}
        onSelectCharacter={(character) => {
          console.log('Selected character:', character);
        }}
      />
    </div>
  );
};

export default Create;
