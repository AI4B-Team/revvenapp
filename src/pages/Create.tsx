import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LayoutGrid, SlidersHorizontal, Search } from 'lucide-react';
import { useReferenceImages } from '@/hooks/useReferenceImages';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ContentTypeSelector from '@/components/dashboard/ContentTypeSelector';
import GenerationInput from '@/components/dashboard/GenerationInput';
import ActionButtons from '@/components/dashboard/ActionButtons';
import ToolCard from '@/components/dashboard/ToolCard';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import AudioCreationsGallery from '@/components/dashboard/AudioCreationsGallery';
import AudioPlayerBar from '@/components/dashboard/AudioPlayerBar';
import AudioDetailsModal from '@/components/dashboard/AudioDetailsModal';
import type { AudioTrack } from '@/components/dashboard/AudioCreationsGallery';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import ReferencesModal from '@/components/dashboard/ReferencesModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import FilterToolbar from '@/components/dashboard/FilterToolbar';
import ImageEditingCanvas from '@/components/dashboard/ImageEditingCanvas';
import CollectionsView from '@/components/dashboard/CollectionsView';
import SocialContentCalendar from '@/components/dashboard/SocialContentCalendar';
import { socialPlatforms } from '@/components/dashboard/SocialIcons';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Import collection images
import ceoBossBabe from '@/assets/collections/ceo-boss-babe.jpg';
import luxuryLifestyle from '@/assets/collections/luxury-lifestyle.jpg';
import streetFashion from '@/assets/collections/street-fashion.jpg';
import runwayInspired from '@/assets/collections/runway-inspired.jpg';
import wellness from '@/assets/collections/wellness.jpg';
import home from '@/assets/collections/home.jpg';
import cafe from '@/assets/collections/cafe.jpg';
import office from '@/assets/collections/office.jpg';
import gym from '@/assets/collections/gym.jpg';
import beach from '@/assets/collections/beach.jpg';
import pool from '@/assets/collections/pool.jpg';
import redCarpet from '@/assets/collections/red-carpet.jpg';
import restaurant from '@/assets/collections/restaurant.jpg';
import resort from '@/assets/collections/resort.jpg';
import nature from '@/assets/collections/nature.jpg';
import springBloom from '@/assets/collections/spring-bloom.jpg';
import summerHeat from '@/assets/collections/summer-heat.jpg';
import autumnAesthetic from '@/assets/collections/autumn-aesthetic.jpg';
import winterWonderland from '@/assets/collections/winter-wonderland.jpg';
import casualChic from '@/assets/collections/casual-chic.jpg';
import corporate from '@/assets/collections/corporate.jpg';
import activewear from '@/assets/collections/activewear.jpg';
import beachwear from '@/assets/collections/beachwear.jpg';

const Create = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeView, setActiveView] = useState<'tools' | 'creations' | 'templates' | 'community' | 'collections'>('tools');
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  // Separate state for each content type
  const [imageCharacters, setImageCharacters] = useState<any[]>([]);
  const [videoCharacters, setVideoCharacters] = useState<any[]>([]);
  const [audioCharacters, setAudioCharacters] = useState<any[]>([]);
  const [designCharacters, setDesignCharacters] = useState<any[]>([]);
  
  // Use the useReferenceImages hook for each content type
  const imageRefs = useReferenceImages();
  const videoRefs = useReferenceImages();
  const audioRefs = useReferenceImages();
  const designRefs = useReferenceImages();
  
  // Get current refs based on selected type
  const getCurrentRefs = () => {
    const effectiveType = selectedType || 'Image';
    if (effectiveType === 'Image') return imageRefs;
    if (effectiveType === 'Video') return videoRefs;
    if (effectiveType === 'Audio') return audioRefs;
    if (effectiveType === 'Design') return designRefs;
    return imageRefs;
  };
  
  const currentRefs = getCurrentRefs();
  const [isCharacterReference, setIsCharacterReference] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Check for image to edit from navigation state or URL params
  useEffect(() => {
    const state = location.state as { editImage?: string; animateImage?: string } | null;
    const params = new URLSearchParams(location.search);
    const imageUrl = state?.editImage || params.get('editImage');
    const animateUrl = state?.animateImage || params.get('animateImage');
    
    console.log('Create.tsx navigation state:', { state, animateUrl, imageUrl });
    
    if (imageUrl) {
      setIsEditMode(true);
      setEditingImage(imageUrl);
      setActiveTab('Image');
    }
    
    if (animateUrl) {
      console.log('Setting up video mode with animate URL:', animateUrl);
      setSelectedType('Video');
      setActiveTab('Video');
      setExternalStartingFrame({
        preview: animateUrl,
        name: 'animated-image.jpg'
      });
      setActiveView('creations');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [externalStartingFrame, setExternalStartingFrame] = useState<{ preview: string; name: string } | null>(null);
  const [socialGeneratedContent, setSocialGeneratedContent] = useState<any[]>([]);
  const [isSocialGenerating, setIsSocialGenerating] = useState(false);
  const [showSocialCalendar, setShowSocialCalendar] = useState(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<AudioTrack | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioDetailsModalOpen, setAudioDetailsModalOpen] = useState(false);
  const [audioDetailsItem, setAudioDetailsItem] = useState<any>(null);
  const toggleAudioPlayRef = useRef<(() => void) | null>(null);
  const [selectedAudioMode, setSelectedAudioMode] = useState('Voiceover');
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

  // Track if this is the initial mount
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Reset states only on initial mount when navigating to /create without parameters or state
  useEffect(() => {
    const state = location.state as { editImage?: string; animateImage?: string } | null;
    const hasNavigationState = state?.editImage || state?.animateImage;
    
    if (!hasInitialized && location.pathname === '/create' && !location.search && !hasNavigationState) {
      setActiveTab('');
      setSelectedType('');
      setActiveView('tools');
      setIsEditMode(false);
      setEditingImage(null);
      // Clear all content type states
      setImageCharacters([]);
      imageRefs.clearAll();
      setVideoCharacters([]);
      videoRefs.clearAll();
      setAudioCharacters([]);
      audioRefs.clearAll();
      setDesignCharacters([]);
      designRefs.clearAll();
      setHasInitialized(true);
    } else if (!hasInitialized && hasNavigationState) {
      // Mark as initialized if we have navigation state
      setHasInitialized(true);
    }
  }, [hasInitialized, location.pathname, location.search, location.state]);

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
        onEditClick={() => {
          setIsEditMode(true);
          setEditingImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop');
        }}
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
              selectedType={selectedType || 'Image'}
              onCharactersClick={() => setCharactersModalOpen(true)}
              onCharactersSelect={(characters) => {
                const effectiveType = selectedType || 'Image';
                if (effectiveType === 'Image') setImageCharacters(characters);
                else if (effectiveType === 'Video') setVideoCharacters(characters);
                else if (effectiveType === 'Audio') setAudioCharacters(characters);
                else if (effectiveType === 'Design') setDesignCharacters(characters);
              }}
              selectedCharacters={
                (selectedType === 'Image' || selectedType === '') ? imageCharacters :
                selectedType === 'Video' ? videoCharacters :
                selectedType === 'Audio' ? audioCharacters :
                selectedType === 'Design' ? designCharacters : imageCharacters
              }
              onReferencesClick={() => currentRefs.openModal()}
              onReferencesSelect={(references) => {
                currentRefs.handleImagesSelect(references);
              }}
              selectedReferences={currentRefs.selectedImages}
              isCharacterReference={isCharacterReference}
              onGenerationStart={() => setActiveView('creations')}
              externalStartingFrame={externalStartingFrame}
              onContentTypeChange={(type) => setSelectedType(type)}
              onAudioModeChange={setSelectedAudioMode}
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
                  <h2 className="text-2xl font-bold">
                    {selectedType === 'Audio' ? 'AUDIO CREATIONS' : 'CREATIONS'}
                  </h2>
                  <FilterToolbar 
                    zoom={zoom} 
                    onZoomChange={setZoom}
                    onFiltersChange={setFilters}
                    selectedContentType={filters.contentType}
                    onContentTypeChange={(type) => setFilters(prev => ({ ...prev, contentType: type }))}
                  />
                </div>
                {selectedType === 'Audio' ? (
                  <AudioCreationsGallery 
                    columnsPerRow={zoomLevel}
                    onTrackSelect={(track, index, tracks) => {
                      setSelectedAudioTrack(track);
                      setCurrentTrackIndex(index);
                      setAudioTracks(tracks);
                      setIsAudioPlaying(true);
                    }}
                    onPauseToggle={() => toggleAudioPlayRef.current?.()}
                    currentPlayingId={selectedAudioTrack?.id}
                    isAudioPlaying={isAudioPlaying}
                    audioModeFilter={selectedAudioMode}
                  />
                ) : (
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
                )}
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
                    onContentTypeChange={(type) => setFilters(prev => ({ ...prev, contentType: type }))}
                  />
                </div>
                <CreationsGallery 
                  type="community" 
                  columnsPerRow={zoomLevel}
                  filters={filters}
                />
              </div>
            )}

            {activeView === 'templates' && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">TEMPLATES</h2>
                  <FilterToolbar 
                    zoom={zoom} 
                    onZoomChange={setZoom}
                    onFiltersChange={setFilters}
                    selectedContentType={filters.contentType}
                    onContentTypeChange={(type) => setFilters(prev => ({ ...prev, contentType: type }))}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[
                    { name: 'Product Showcase', category: 'E-commerce', emoji: '🛍️' },
                    { name: 'Social Story', category: 'Social Media', emoji: '📱' },
                    { name: 'Brand Promo', category: 'Marketing', emoji: '🎯' },
                    { name: 'Tutorial Video', category: 'Education', emoji: '📚' },
                    { name: 'Testimonial', category: 'Social Proof', emoji: '⭐' },
                    { name: 'Behind The Scenes', category: 'Lifestyle', emoji: '🎬' },
                    { name: 'Before & After', category: 'Transformation', emoji: '✨' },
                    { name: 'Unboxing', category: 'Reviews', emoji: '📦' },
                    { name: 'Day In My Life', category: 'Lifestyle', emoji: '☀️' },
                    { name: 'Q&A Session', category: 'Engagement', emoji: '💬' },
                    { name: 'Product Demo', category: 'E-commerce', emoji: '🎥' },
                    { name: 'Motivational', category: 'Inspiration', emoji: '💪' },
                  ].map((template, idx) => (
                    <div 
                      key={idx}
                      className="group relative bg-secondary rounded-xl p-6 hover:bg-secondary/80 transition cursor-pointer border border-border hover:border-primary"
                    >
                      <div className="text-4xl mb-4">{template.emoji}</div>
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Use</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'collections' && (
              <>
                <CollectionsView
                  categories={[]}
                  popularTitle="SIGNATURE STYLES"
                  popularSubtitle="For Overall Aesthetic Direction & Mood"
                  popularCollections={[
                    {
                      id: 'ceo-boss-babe',
                      title: 'CEO / Boss Babe',
                      totalCount: 156,
                      images: [
                        { url: ceoBossBabe, alt: 'CEO Boss Babe' },
                        { url: ceoBossBabe, alt: 'CEO Boss Babe 2' },
                        { url: ceoBossBabe, alt: 'CEO Boss Babe 3' },
                        { url: ceoBossBabe, alt: 'CEO Boss Babe 4' },
                      ],
                    },
                    {
                      id: 'luxury-lifestyle',
                      title: 'Luxury Lifestyle',
                      totalCount: 243,
                      images: [
                        { url: luxuryLifestyle, alt: 'Luxury Lifestyle' },
                        { url: luxuryLifestyle, alt: 'Luxury Lifestyle 2' },
                        { url: luxuryLifestyle, alt: 'Luxury Lifestyle 3' },
                        { url: luxuryLifestyle, alt: 'Luxury Lifestyle 4' },
                      ],
                    },
                    {
                      id: 'street-fashion',
                      title: 'Street Fashion',
                      totalCount: 189,
                      images: [
                        { url: streetFashion, alt: 'Street Fashion' },
                        { url: streetFashion, alt: 'Street Fashion 2' },
                        { url: streetFashion, alt: 'Street Fashion 3' },
                        { url: streetFashion, alt: 'Street Fashion 4' },
                      ],
                    },
                    {
                      id: 'runway-inspired',
                      title: 'Runway Inspired',
                      totalCount: 134,
                      images: [
                        { url: runwayInspired, alt: 'Runway Inspired' },
                        { url: runwayInspired, alt: 'Runway Inspired 2' },
                        { url: runwayInspired, alt: 'Runway Inspired 3' },
                        { url: runwayInspired, alt: 'Runway Inspired 4' },
                      ],
                    },
                    {
                      id: 'wellness',
                      title: 'Wellness',
                      totalCount: 198,
                      images: [
                        { url: wellness, alt: 'Wellness' },
                        { url: wellness, alt: 'Wellness 2' },
                        { url: wellness, alt: 'Wellness 3' },
                        { url: wellness, alt: 'Wellness 4' },
                      ],
                    },
                  ]}
                  recommendedTitle="LOCATIONS"
                  recommendedSubtitle="For Where The Visuals Or Stories Take Place"
                  recommendedCollections={[
                    {
                      id: 'home',
                      title: 'Home',
                      totalCount: 312,
                      images: [
                        { url: home, alt: 'Home' },
                        { url: home, alt: 'Home 2' },
                        { url: home, alt: 'Home 3' },
                        { url: home, alt: 'Home 4' },
                      ],
                    },
                    {
                      id: 'cafe',
                      title: 'Café',
                      totalCount: 267,
                      images: [
                        { url: cafe, alt: 'Café' },
                        { url: cafe, alt: 'Café 2' },
                        { url: cafe, alt: 'Café 3' },
                        { url: cafe, alt: 'Café 4' },
                      ],
                    },
                    {
                      id: 'office',
                      title: 'Office',
                      totalCount: 198,
                      images: [
                        { url: office, alt: 'Office' },
                        { url: office, alt: 'Office 2' },
                        { url: office, alt: 'Office 3' },
                        { url: office, alt: 'Office 4' },
                      ],
                    },
                    {
                      id: 'gym',
                      title: 'Gym',
                      totalCount: 176,
                      images: [
                        { url: gym, alt: 'Gym' },
                        { url: gym, alt: 'Gym 2' },
                        { url: gym, alt: 'Gym 3' },
                        { url: gym, alt: 'Gym 4' },
                      ],
                    },
                    {
                      id: 'beach',
                      title: 'Beach',
                      totalCount: 421,
                      images: [
                        { url: beach, alt: 'Beach' },
                        { url: beach, alt: 'Beach 2' },
                        { url: beach, alt: 'Beach 3' },
                        { url: beach, alt: 'Beach 4' },
                      ],
                    },
                    {
                      id: 'pool',
                      title: 'Pool',
                      totalCount: 289,
                      images: [
                        { url: pool, alt: 'Pool' },
                        { url: pool, alt: 'Pool 2' },
                        { url: pool, alt: 'Pool 3' },
                        { url: pool, alt: 'Pool 4' },
                      ],
                    },
                    {
                      id: 'red-carpet',
                      title: 'Red Carpet',
                      totalCount: 143,
                      images: [
                        { url: redCarpet, alt: 'Red Carpet' },
                        { url: redCarpet, alt: 'Red Carpet 2' },
                        { url: redCarpet, alt: 'Red Carpet 3' },
                        { url: redCarpet, alt: 'Red Carpet 4' },
                      ],
                    },
                    {
                      id: 'restaurant',
                      title: 'Restaurant',
                      totalCount: 234,
                      images: [
                        { url: restaurant, alt: 'Restaurant' },
                        { url: restaurant, alt: 'Restaurant 2' },
                        { url: restaurant, alt: 'Restaurant 3' },
                        { url: restaurant, alt: 'Restaurant 4' },
                      ],
                    },
                    {
                      id: 'resort',
                      title: 'Resort',
                      totalCount: 356,
                      images: [
                        { url: resort, alt: 'Resort' },
                        { url: resort, alt: 'Resort 2' },
                        { url: resort, alt: 'Resort 3' },
                        { url: resort, alt: 'Resort 4' },
                      ],
                    },
                    {
                      id: 'nature',
                      title: 'Nature',
                      totalCount: 487,
                      images: [
                        { url: nature, alt: 'Nature' },
                        { url: nature, alt: 'Nature 2' },
                        { url: nature, alt: 'Nature 3' },
                        { url: nature, alt: 'Nature 4' },
                      ],
                    },
                  ]}
                />
                <CollectionsView
                  categories={[]}
                  popularTitle="SEASONS"
                  popularSubtitle="Perfect for lifestyle or fashion tie-ins"
                  popularCollections={[
                    {
                      id: 'spring-bloom',
                      title: 'Spring Bloom',
                      totalCount: 298,
                      images: [
                        { url: springBloom, alt: 'Spring Bloom' },
                        { url: springBloom, alt: 'Spring Bloom 2' },
                        { url: springBloom, alt: 'Spring Bloom 3' },
                        { url: springBloom, alt: 'Spring Bloom 4' },
                      ],
                    },
                    {
                      id: 'summer-heat',
                      title: 'Summer Heat',
                      totalCount: 412,
                      images: [
                        { url: summerHeat, alt: 'Summer Heat' },
                        { url: summerHeat, alt: 'Summer Heat 2' },
                        { url: summerHeat, alt: 'Summer Heat 3' },
                        { url: summerHeat, alt: 'Summer Heat 4' },
                      ],
                    },
                    {
                      id: 'autumn-aesthetic',
                      title: 'Autumn Aesthetic',
                      totalCount: 276,
                      images: [
                        { url: autumnAesthetic, alt: 'Autumn Aesthetic' },
                        { url: autumnAesthetic, alt: 'Autumn Aesthetic 2' },
                        { url: autumnAesthetic, alt: 'Autumn Aesthetic 3' },
                        { url: autumnAesthetic, alt: 'Autumn Aesthetic 4' },
                      ],
                    },
                    {
                      id: 'winter-wonderland',
                      title: 'Winter Wonderland',
                      totalCount: 324,
                      images: [
                        { url: winterWonderland, alt: 'Winter Wonderland' },
                        { url: winterWonderland, alt: 'Winter Wonderland 2' },
                        { url: winterWonderland, alt: 'Winter Wonderland 3' },
                        { url: winterWonderland, alt: 'Winter Wonderland 4' },
                      ],
                    },
                  ]}
                  recommendedTitle="FASHION"
                  recommendedSubtitle="To define outfit energy"
                  recommendedCollections={[
                    {
                      id: 'casual-chic',
                      title: 'Casual Chic',
                      totalCount: 267,
                      images: [
                        { url: casualChic, alt: 'Casual Chic' },
                        { url: casualChic, alt: 'Casual Chic 2' },
                        { url: casualChic, alt: 'Casual Chic 3' },
                        { url: casualChic, alt: 'Casual Chic 4' },
                      ],
                    },
                    {
                      id: 'corporate',
                      title: 'Corporate',
                      totalCount: 198,
                      images: [
                        { url: corporate, alt: 'Corporate' },
                        { url: corporate, alt: 'Corporate 2' },
                        { url: corporate, alt: 'Corporate 3' },
                        { url: corporate, alt: 'Corporate 4' },
                      ],
                    },
                    {
                      id: 'activewear',
                      title: 'Activewear',
                      totalCount: 234,
                      images: [
                        { url: activewear, alt: 'Activewear' },
                        { url: activewear, alt: 'Activewear 2' },
                        { url: activewear, alt: 'Activewear 3' },
                        { url: activewear, alt: 'Activewear 4' },
                      ],
                    },
                    {
                      id: 'beachwear',
                      title: 'Beachwear',
                      totalCount: 312,
                      images: [
                        { url: beachwear, alt: 'Beachwear' },
                        { url: beachwear, alt: 'Beachwear 2' },
                        { url: beachwear, alt: 'Beachwear 3' },
                        { url: beachwear, alt: 'Beachwear 4' },
                      ],
                    },
                  ]}
                />
              </>
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
          const effectiveType = selectedType || 'Image';
          if (effectiveType === 'Image') {
            setImageCharacters(prev => [...prev, character]);
          }
          else if (effectiveType === 'Video') {
            // Replace character instead of adding for Video mode (Recast uses single character)
            setVideoCharacters([character]);
          }
          else if (effectiveType === 'Audio') setAudioCharacters(prev => [...prev, character]);
          else if (effectiveType === 'Design') setDesignCharacters(prev => [...prev, character]);
        }}
      />

      <ReferencesModal
        isOpen={currentRefs.isModalOpen}
        onClose={() => currentRefs.closeModal()}
        initialSelectedImages={currentRefs.selectedImages}
        onImagesSelect={(images) => {
          currentRefs.handleImagesSelect(images);
          setIsCharacterReference(true);
        }}
      />

      {/* Audio Player Bar - only show in Audio section */}
      {selectedType === 'Audio' && selectedAudioTrack && (
        <AudioPlayerBar 
          track={selectedAudioTrack}
          tracks={audioTracks}
          currentIndex={currentTrackIndex}
          onNext={() => {
            if (audioTracks.length === 0) return;
            const nextIndex = (currentTrackIndex + 1) % audioTracks.length;
            setSelectedAudioTrack(audioTracks[nextIndex]);
            setCurrentTrackIndex(nextIndex);
          }}
          onPrevious={() => {
            if (audioTracks.length === 0) return;
            const prevIndex = currentTrackIndex === 0 ? audioTracks.length - 1 : currentTrackIndex - 1;
            setSelectedAudioTrack(audioTracks[prevIndex]);
            setCurrentTrackIndex(prevIndex);
          }}
          onClose={() => {
            setSelectedAudioTrack(null);
            setIsAudioPlaying(false);
          }}
          onTrackChange={(index) => {
            setSelectedAudioTrack(audioTracks[index]);
            setCurrentTrackIndex(index);
          }}
          onPlayStateChange={setIsAudioPlaying}
          onShowDetails={(track) => {
            setAudioDetailsItem({
              id: track.id,
              name: track.name,
              url: track.url,
              duration: track.duration,
              type: track.type,
              created_at: (track as any).created_at || new Date().toISOString(),
              prompt: (track as any).prompt || ''
            });
            setAudioDetailsModalOpen(true);
          }}
          registerTogglePlay={(fn) => { toggleAudioPlayRef.current = fn; }}
        />
      )}
      
      {/* Audio Details Modal */}
      <AudioDetailsModal
        isOpen={audioDetailsModalOpen}
        onClose={() => {
          setAudioDetailsModalOpen(false);
          setAudioDetailsItem(null);
        }}
        audioItem={audioDetailsItem}
        onTitleUpdate={(id, newTitle) => {
          setAudioTracks(prev => prev.map(track => 
            track.id === id ? { ...track, name: newTitle } : track
          ));
          if (audioDetailsItem?.id === id) {
            setAudioDetailsItem((prev: any) => prev ? { ...prev, name: newTitle } : null);
          }
        }}
      />
    </div>
  );
};

export default Create;
