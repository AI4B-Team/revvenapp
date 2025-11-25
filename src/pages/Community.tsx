import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CreationsGallery from '@/components/dashboard/CreationsGallery';
import FilterToolbar, { type FilterState } from '@/components/dashboard/FilterToolbar';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import CollectionsView from '@/components/dashboard/CollectionsView';
import { Users, FolderOpen } from 'lucide-react';

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

const Community = () => {
  const [zoom, setZoom] = useState(50);
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'community' | 'collections'>('community');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  // Map zoom value (0-100) to columns (3-6)
  const zoomLevel = Math.round(3 + (zoom / 100) * 3);

  // Signature Styles Collections
  const signatureStylesCollections = [
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
  ];

  // Locations Collections
  const locationsCollections = [
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
  ];

  // Seasons Collections
  const seasonsCollections = [
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
  ];

  // Fashion Collections
  const fashionCollections = [
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
  ];

  // Get all collections in a flat array
  const allCollections = [
    ...signatureStylesCollections,
    ...locationsCollections,
    ...seasonsCollections,
    ...fashionCollections,
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="" 
        onTabChange={() => {}}
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">COMMUNITY</h1>
                
                {/* Tab Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('community')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'community'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    All
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('collections');
                      setSelectedCollection(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'collections'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Collections
                  </button>
                </div>
              </div>
              <FilterToolbar zoom={zoom} onZoomChange={setZoom} onFiltersChange={setFilters} />
            </div>

            {/* Tab Content */}
            {activeTab === 'community' && (
              <CreationsGallery type="community" columnsPerRow={zoomLevel} filters={filters} />
            )}
            
            {activeTab === 'collections' && (
              <>
                {selectedCollection ? (
                  // Show selected collection images with gallery functionality
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      {allCollections.find(c => c.id === selectedCollection)?.title}
                    </h2>
                    <CreationsGallery type="community" columnsPerRow={zoomLevel} filters={filters} />
                  </div>
                ) : (
                  // Show collection cards
                  <>
                    <CollectionsView
                      categories={[]}
                      popularTitle="SIGNATURE STYLES"
                      popularSubtitle="For Overall Aesthetic Direction & Mood"
                      popularCollections={signatureStylesCollections}
                      recommendedTitle="LOCATIONS"
                      recommendedSubtitle="For Where The Visuals Or Stories Take Place"
                      recommendedCollections={locationsCollections}
                      onCollectionClick={setSelectedCollection}
                    />
                    <CollectionsView
                      categories={[]}
                      popularTitle="SEASONS"
                      popularSubtitle="Perfect for lifestyle or fashion tie-ins"
                      popularCollections={seasonsCollections}
                      recommendedTitle="FASHION"
                      recommendedSubtitle="To define outfit energy"
                      recommendedCollections={fashionCollections}
                      onCollectionClick={setSelectedCollection}
                    />
                  </>
                )}
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

export default Community;
