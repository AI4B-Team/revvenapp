import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LayoutGrid, SlidersHorizontal, Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import ReferencesModal from '@/components/dashboard/ReferencesModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import FilterToolbar from '@/components/dashboard/FilterToolbar';
import ImageEditingCanvas from '@/components/dashboard/ImageEditingCanvas';
import CollectionsView from '@/components/dashboard/CollectionsView';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Create = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'community' | 'collections'>('tools');
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  // Separate state for each content type
  const [imageCharacters, setImageCharacters] = useState<any[]>([]);
  const [imageReferences, setImageReferences] = useState<any[]>([]);
  const [videoCharacters, setVideoCharacters] = useState<any[]>([]);
  const [videoReferences, setVideoReferences] = useState<any[]>([]);
  const [audioCharacters, setAudioCharacters] = useState<any[]>([]);
  const [audioReferences, setAudioReferences] = useState<any[]>([]);
  const [designCharacters, setDesignCharacters] = useState<any[]>([]);
  const [designReferences, setDesignReferences] = useState<any[]>([]);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [isCharacterReference, setIsCharacterReference] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [externalStartingFrame, setExternalStartingFrame] = useState<{ preview: string; name: string } | null>(null);
  const [filters, setFilters] = useState({
    contentType: 'All',
    likes: false,
    edits: false,
    upscales: false,
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Reset states when navigating to /create without parameters
  useEffect(() => {
    if (location.pathname === '/create' && !location.search) {
      setActiveTab('');
      setSelectedType('');
      setActiveView('tools');
      setIsEditMode(false);
      setEditingImage(null);
      // Clear all content type states
      setImageCharacters([]);
      setImageReferences([]);
      setVideoCharacters([]);
      setVideoReferences([]);
      setAudioCharacters([]);
      setAudioReferences([]);
      setDesignCharacters([]);
      setDesignReferences([]);
    }
  }, [location]);

  // Fetch and subscribe to generated images
  useEffect(() => {
    const fetchGeneratedImages = async () => {
      const { data } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setGeneratedImages(data);
      }
    };

    fetchGeneratedImages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('generated_images_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_images'
        },
        (payload) => {
          console.log('Generated image update:', payload);
          if (payload.eventType === 'INSERT') {
            setGeneratedImages(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const imageTools = [
    { 
      name: 'Art Blocks', 
      description: 'AI create some art works',
      bgColor: 'bg-tool-blue',
      emoji: '🎨'
    },
    { 
      name: 'Edit', 
      description: 'Edit images with AI',
      bgColor: 'bg-tool-green',
      emoji: '✏️',
      onClick: () => {
        setIsEditMode(true);
        setEditingImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop');
      }
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
    { 
      name: 'AI Influencer', 
      description: 'Create AI-powered influencer content',
      bgColor: 'bg-tool-green',
      emoji: '🤖',
      onClick: () => navigate('/ai-influencer')
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedType(tab);
        }}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <AIPersonaSidebar 
        isOpen={identitySidebarOpen}
        onClose={() => setIdentitySidebarOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        {/* Show Image Editing Canvas when in edit mode */}
        {isEditMode ? (
          <ImageEditingCanvas
            image={editingImage}
            onClose={() => {
              setIsEditMode(false);
              setEditingImage(null);
            }}
            onSave={() => {
              console.log('Saving image...');
              setIsEditMode(false);
              setEditingImage(null);
            }}
          />
        ) : (
          <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            <h1 className="text-5xl font-bold text-center mb-8">What Would You Like To Create Today?</h1>
            
            <ContentTypeSelector selectedType={selectedType} onTypeChange={(type) => {
              setSelectedType(type);
              setActiveTab(type);
              setActiveView('creations');
              setFilters(prev => ({ ...prev, contentType: type }));
            }} />
            
            <GenerationInput 
              selectedType={selectedType}
              onCharactersClick={() => setCharactersModalOpen(true)}
              onCharactersSelect={(characters) => {
                if (selectedType === 'Image') setImageCharacters(characters);
                else if (selectedType === 'Video') setVideoCharacters(characters);
                else if (selectedType === 'Audio') setAudioCharacters(characters);
                else if (selectedType === 'Design') setDesignCharacters(characters);
              }}
              selectedCharacters={
                selectedType === 'Image' ? imageCharacters :
                selectedType === 'Video' ? videoCharacters :
                selectedType === 'Audio' ? audioCharacters :
                selectedType === 'Design' ? designCharacters : []
              }
              onReferencesClick={() => setReferencesModalOpen(true)}
              onReferencesSelect={(references) => {
                if (selectedType === 'Image') setImageReferences(references);
                else if (selectedType === 'Video') setVideoReferences(references);
                else if (selectedType === 'Audio') setAudioReferences(references);
                else if (selectedType === 'Design') setDesignReferences(references);
              }}
              selectedReferences={
                selectedType === 'Image' ? imageReferences :
                selectedType === 'Video' ? videoReferences :
                selectedType === 'Audio' ? audioReferences :
                selectedType === 'Design' ? designReferences : []
              }
              isCharacterReference={isCharacterReference}
              onGenerationStart={() => setActiveView('creations')}
              externalStartingFrame={externalStartingFrame}
              onContentTypeChange={(type) => setSelectedType(type)}
            />
            
            <ActionButtons 
              activeView={activeView} 
              onViewChange={setActiveView}
              hasSelectedType={!!selectedType}
            />
            
            {/* Gallery Views */}
            {activeView === 'creations' && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">CREATIONS</h2>
                  <FilterToolbar 
                    zoom={zoom} 
                    onZoomChange={setZoom}
                    onFiltersChange={setFilters}
                    selectedContentType={filters.contentType}
                  />
                </div>
                <CreationsGallery 
                  type="creations" 
                  columnsPerRow={zoomLevel}
                  filters={filters}
                  onAnimate={(imageUrl) => {
                    setSelectedType('Video');
                    setExternalStartingFrame({
                      preview: imageUrl,
                      name: 'animated-image.jpg'
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
            
            {activeView === 'community' && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">COMMUNITY</h2>
                  <FilterToolbar 
                    zoom={zoom} 
                    onZoomChange={setZoom}
                    onFiltersChange={setFilters}
                    selectedContentType={filters.contentType}
                  />
                </div>
                <CreationsGallery 
                  type="community" 
                  columnsPerRow={zoomLevel}
                  filters={filters}
                />
              </div>
            )}

            {activeView === 'collections' && (
              <CollectionsView
                categories={['All Content', 'AI Images', 'AI Videos', 'Marketing', 'Social Media', 'Product Photos']}
                popularCollections={[
                  {
                    id: '1',
                    title: 'AI Product Photography',
                    totalCount: 127,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Product 1' },
                      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Product 2' },
                      { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', alt: 'Product 3' },
                      { url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400', alt: 'Product 4' },
                    ],
                  },
                  {
                    id: '2',
                    title: 'Social Media Content',
                    totalCount: 89,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', alt: 'Social 1' },
                      { url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', alt: 'Social 2' },
                      { url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400', alt: 'Social 3' },
                      { url: 'https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=400', alt: 'Social 4' },
                    ],
                  },
                  {
                    id: '3',
                    title: 'Marketing Visuals',
                    totalCount: 64,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', alt: 'Marketing 1' },
                      { url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', alt: 'Marketing 2' },
                      { url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400', alt: 'Marketing 3' },
                      { url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', alt: 'Marketing 4' },
                    ],
                  },
                ]}
                recommendedCollections={[
                  {
                    id: '4',
                    title: 'Video Content Library',
                    totalCount: 52,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', alt: 'Video 1' },
                      { url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400', alt: 'Video 2' },
                      { url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400', alt: 'Video 3' },
                      { url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', alt: 'Video 4' },
                    ],
                  },
                  {
                    id: '5',
                    title: 'Digital Avatars',
                    totalCount: 38,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800', alt: 'Avatar 1' },
                      { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', alt: 'Avatar 2' },
                      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', alt: 'Avatar 3' },
                      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', alt: 'Avatar 4' },
                    ],
                  },
                  {
                    id: '6',
                    title: 'Campaign Templates',
                    totalCount: 71,
                    images: [
                      { url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800', alt: 'Template 1' },
                      { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', alt: 'Template 2' },
                      { url: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400', alt: 'Template 3' },
                      { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400', alt: 'Template 4' },
                    ],
                  },
                ]}
              />
            )}
            
            {/* Tools View */}
            {activeView === 'tools' && (
              <div className="w-full">
                {/* Image Apps Section */}
                {(!selectedType || selectedType === 'Image') && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">IMAGE APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">VIDEO APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">AUDIO APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">DESIGN APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">CONTENT APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">APP APPS</h2>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        See All <ChevronRight size={16} />
                      </button>
                    </div>
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
        )}
      </div>

      <DigitalCharactersModal
        isOpen={charactersModalOpen}
        onClose={() => setCharactersModalOpen(false)}
        onSelectCharacter={(character) => {
          if (selectedType === 'Image') {
            setImageCharacters(prev => [...prev, character]);
          }
          else if (selectedType === 'Video') {
            setVideoCharacters(prev => [...prev, character]);
          }
          else if (selectedType === 'Audio') setAudioCharacters(prev => [...prev, character]);
          else if (selectedType === 'Design') setDesignCharacters(prev => [...prev, character]);
        }}
      />

      <ReferencesModal
        isOpen={referencesModalOpen}
        onClose={() => setReferencesModalOpen(false)}
        onImagesSelect={(images) => {
          if (selectedType === 'Image') setImageReferences(prev => [...prev, ...images]);
          else if (selectedType === 'Video') setVideoReferences(prev => [...prev, ...images]);
          else if (selectedType === 'Audio') setAudioReferences(prev => [...prev, ...images]);
          else if (selectedType === 'Design') setDesignReferences(prev => [...prev, ...images]);
          setIsCharacterReference(true);
        }}
      />
    </div>
  );
};

export default Create;
