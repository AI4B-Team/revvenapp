import React from 'react';

/**
 * REVVEN Collections Page Component
 * Pinterest-style collection layout for organizing and displaying content collections
 * 
 * Features:
 * - Horizontal scrolling category tags
 * - Grid-based collection cards
 * - Image thumbnail previews with count indicators
 * - Fully responsive design
 * - REVVEN green branding
 */

// Type definitions
interface CollectionImage {
  url: string;
  alt: string;
}

interface Collection {
  id: string;
  title: string;
  images: CollectionImage[];
  totalCount: number;
  category?: string;
}

interface CollectionsSectionProps {
  title: string;
  collections: Collection[];
}

interface CollectionsPageProps {
  categories?: string[];
  popularCollections: Collection[];
  recommendedCollections: Collection[];
  popularTitle?: string;
  popularSubtitle?: string;
  recommendedTitle?: string;
  recommendedSubtitle?: string;
}

// Collection Card Component
const CollectionCard: React.FC<{ collection: Collection }> = ({ collection }) => {
  const displayImages = collection.images.slice(0, 4);
  const remainingCount = collection.totalCount - displayImages.length;

  return (
    <div className="group cursor-pointer">
      {/* Card Container */}
      <div className="space-y-2">
        {/* Main Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <img
            src={displayImages[0]?.url || '/api/placeholder/400/300'}
            alt={displayImages[0]?.alt || collection.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-3 gap-2">
          {displayImages.slice(1, 4).map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Count overlay on last thumbnail */}
              {index === 2 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-2xl font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Collection Title */}
        <h3 className="text-xl font-semibold text-foreground mt-3 group-hover:text-primary transition-colors">
          {collection.title}
        </h3>
      </div>
    </div>
  );
};

// Collections Section Component
const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  title,
  collections,
}) => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-8">
        {title} <span className="text-base font-normal text-muted-foreground">| Curated By: Vicki Ravelle</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
};

// Category Tags Component
const CategoryTags: React.FC<{ categories: string[] }> = ({ categories }) => {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  return (
    <div className="mb-12">
      <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === category
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Collections Page Component
const CollectionsPage: React.FC<CollectionsPageProps> = ({
  categories = [],
  popularCollections,
  recommendedCollections,
  popularTitle = "Popular Collections",
  popularSubtitle = "",
  recommendedTitle = "Recommended For You",
  recommendedSubtitle = "",
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        {/* Popular Collections */}
        <CollectionsSection
          title={popularSubtitle ? `${popularTitle} | ${popularSubtitle}` : popularTitle}
          collections={popularCollections}
        />

        {/* Recommended Collections */}
        <CollectionsSection
          title={recommendedSubtitle ? `${recommendedTitle} | ${recommendedSubtitle}` : recommendedTitle}
          collections={recommendedCollections}
        />
      </div>

    </div>
  );
};

export default CollectionsPage;

// Example usage with sample data
export const CollectionsPageExample = () => {
  const sampleCategories = [
    'Cozy Sweater',
    'Knit Sweater',
    'Knitted Sweater',
    'Sweater',
    'Winter Fashion',
    'Autumn Vibes',
  ];

  const samplePopularCollections: Collection[] = [
    {
      id: '1',
      title: 'AI Product Photography',
      totalCount: 127,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Product shot 1' },
        { url: '/api/placeholder/400/400', alt: 'Product shot 2' },
        { url: '/api/placeholder/400/400', alt: 'Product shot 3' },
        { url: '/api/placeholder/400/400', alt: 'Product shot 4' },
      ],
    },
    {
      id: '2',
      title: 'Digital Avatar Scenes',
      totalCount: 87,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Avatar scene 1' },
        { url: '/api/placeholder/400/400', alt: 'Avatar scene 2' },
        { url: '/api/placeholder/400/400', alt: 'Avatar scene 3' },
        { url: '/api/placeholder/400/400', alt: 'Avatar scene 4' },
      ],
    },
    {
      id: '3',
      title: 'Marketing Visuals 🎨',
      totalCount: 64,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Marketing visual 1' },
        { url: '/api/placeholder/400/400', alt: 'Marketing visual 2' },
        { url: '/api/placeholder/400/400', alt: 'Marketing visual 3' },
        { url: '/api/placeholder/400/400', alt: 'Marketing visual 4' },
      ],
    },
  ];

  const sampleRecommendedCollections: Collection[] = [
    {
      id: '4',
      title: 'Social Media Content 📱',
      totalCount: 21,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Social media 1' },
        { url: '/api/placeholder/400/400', alt: 'Social media 2' },
        { url: '/api/placeholder/400/400', alt: 'Social media 3' },
        { url: '/api/placeholder/400/400', alt: 'Social media 4' },
      ],
    },
    {
      id: '5',
      title: 'Business Automation',
      totalCount: 94,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Automation 1' },
        { url: '/api/placeholder/400/400', alt: 'Automation 2' },
        { url: '/api/placeholder/400/400', alt: 'Automation 3' },
        { url: '/api/placeholder/400/400', alt: 'Automation 4' },
      ],
    },
    {
      id: '6',
      title: 'Content Templates',
      totalCount: 31,
      images: [
        { url: '/api/placeholder/800/600', alt: 'Template 1' },
        { url: '/api/placeholder/400/400', alt: 'Template 2' },
        { url: '/api/placeholder/400/400', alt: 'Template 3' },
        { url: '/api/placeholder/400/400', alt: 'Template 4' },
      ],
    },
  ];

  return (
    <CollectionsPage
      categories={sampleCategories}
      popularCollections={samplePopularCollections}
      recommendedCollections={sampleRecommendedCollections}
    />
  );
};
