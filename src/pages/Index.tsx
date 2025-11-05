import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [selectedType, setSelectedType] = useState('Image');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const imageTools = [
    { 
      name: 'Art Blocks', 
      description: 'AI create some art works',
      bgColor: 'bg-tool-blue',
      emoji: '🎨'
    },
    { 
      name: 'AI Background Remover', 
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 lg:mb-8 text-foreground">What Would You Like To Create Today?</h1>
          
          <ContentTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />
          
          <GenerationInput />
          
          <ActionButtons />
          
          {/* Image Tools Section */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-foreground">IMAGE TOOLS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4 mb-8 lg:mb-12">
              {imageTools.map((tool, idx) => (
                <ToolCard key={idx} {...tool} />
              ))}
            </div>

            {/* Audio Tools Section */}
            <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-foreground">AUDIO TOOLS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4 pb-8 lg:pb-12">
              {audioTools.map((tool, idx) => (
                <ToolCard key={idx} {...tool} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
