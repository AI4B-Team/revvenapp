import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import CreationsGallery from '@/components/dashboard/CreationsGallery';

const Create = () => {
  const [activeTab, setActiveTab] = useState('Image');
  const [selectedType, setSelectedType] = useState('Image');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'community'>('tools');
  const [zoomLevel, setZoomLevel] = useState(4);

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

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedType(tab);
      }} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            <h1 className="text-5xl font-bold text-center mb-8">What Would You Like To Create Today?</h1>
            
            <ContentTypeSelector selectedType={selectedType} onTypeChange={(type) => {
              setSelectedType(type);
              setActiveTab(type);
            }} />
            
            <GenerationInput selectedType={selectedType} />
            
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
