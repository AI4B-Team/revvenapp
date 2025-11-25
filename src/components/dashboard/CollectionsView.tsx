import React, { useState } from 'react';
import { 
  Play, Bookmark, Heart, Download, Edit, RefreshCw, 
  Share2, X, Copy, Check, Image as ImageIcon, Trash2,
  Video, Film, Mic, Users
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

/**
 * REVVEN Collections Page Component
 * Pinterest-style collection layout for organizing and displaying content collections
 * 
 * Features:
 * - Horizontal scrolling category tags
 * - Grid-based collection cards
 * - Image thumbnail previews with count indicators
 * - Expandable collection detail view with full gallery
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
  subtitle?: string;
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
const CollectionCard: React.FC<{ collection: Collection; onClick: () => void }> = ({ collection, onClick }) => {
  const displayImages = collection.images.slice(0, 4);
  const remainingCount = collection.totalCount - displayImages.length;

  return (
    <div className="group cursor-pointer" onClick={onClick}>
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

// Gallery Image Card Component with Icon Overlays
const GalleryImageCard: React.FC<{ image: CollectionImage; columnsPerRow: number }> = ({ image, columnsPerRow }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const getIconSize = () => {
    switch(columnsPerRow) {
      case 3: return { button: 'w-10 h-10', icon: 20, badge: 'px-3 py-1.5', badgeIcon: 16, text: 'text-sm', avatar: 'w-9 h-9', gap: 'gap-2' };
      case 4: return { button: 'w-9 h-9', icon: 18, badge: 'px-3 py-1.5', badgeIcon: 14, text: 'text-xs', avatar: 'w-8 h-8', gap: 'gap-2' };
      case 5: return { button: 'w-8 h-8', icon: 16, badge: 'px-2 py-1', badgeIcon: 12, text: 'text-xs', avatar: 'w-7 h-7', gap: 'gap-1.5' };
      case 6: return { button: 'w-7 h-7', icon: 14, badge: 'px-2 py-1', badgeIcon: 10, text: 'text-xs', avatar: 'w-6 h-6', gap: 'gap-1' };
      default: return { button: 'w-9 h-9', icon: 18, badge: 'px-3 py-1.5', badgeIcon: 14, text: 'text-xs', avatar: 'w-8 h-8', gap: 'gap-2' };
    }
  };

  const sizes = getIconSize();

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.alt || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download image",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    window.location.href = `/create?editImage=${encodeURIComponent(image.url)}`;
  };

  const handleRecreate = () => {
    toast({
      title: "Recreating...",
      description: "Feature coming soon",
    });
  };

  const handleShare = () => {
    setShareModalOpen(true);
    setCopiedLink(false);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/collection/${image.alt}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAnimate = (type: 'video' | 'speak' | 'ugc') => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} animation`,
      description: `${type} animation feature coming soon`,
    });
  };

  const socialPlatforms = [
    { name: 'Twitter', icon: '𝕏', color: 'hover:bg-gray-900' },
    { name: 'Facebook', icon: 'f', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: '📷', color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-700' }
  ];

  return (
    <>
      <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden cursor-pointer">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          
          {/* Media Type Badge - Top Left */}
          <div className={`absolute top-3 left-3 ${sizes.badge} bg-black/70 backdrop-blur-sm rounded-lg flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <ImageIcon size={sizes.badgeIcon} className="text-white" />
            <span className={`text-white ${sizes.text} font-semibold uppercase`}>Image</span>
          </div>

          {/* Top Right Actions */}
          <TooltipProvider>
            <div className={`absolute top-3 right-3 flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
              {/* Save Bookmark */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSaved(!isSaved);
                    }}
                    className={`${sizes.button} rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-blue-500 text-white'
                        : 'bg-black/70 text-white hover:bg-blue-500'
                    }`}
                  >
                    <Bookmark size={sizes.icon} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Save</p>
                </TooltipContent>
              </Tooltip>

              {/* Like Heart */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                    className={`${sizes.button} rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                      isLiked
                        ? 'bg-red-500 text-white'
                        : 'bg-black/70 text-white hover:bg-red-500'
                    }`}
                  >
                    <Heart size={sizes.icon} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>

              {/* Download */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                  >
                    <Download size={sizes.icon} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete - Hidden for collection images */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-red-500 flex items-center justify-center transition-all`}
                  >
                    <Trash2 size={sizes.icon} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Action Icons - Bottom Right */}
          <TooltipProvider>
            <div className={`absolute bottom-3 right-3 flex items-center ${sizes.gap} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                  >
                    <Edit size={sizes.icon} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecreate();
                    }}
                    className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                  >
                    <RefreshCw size={sizes.icon} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Recreate</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 flex items-center justify-center transition-all`}
                  >
                    <Share2 size={sizes.icon} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>

              {/* Animate Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className={`${sizes.button} rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-purple-500 flex items-center justify-center transition-all`}
                      >
                        <Video size={sizes.icon} />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-black">
                    <p>Animate</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent 
                  className="bg-black border-gray-800 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem 
                    onClick={() => handleAnimate('video')}
                    className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                  >
                    <Film className="mr-2 h-4 w-4" />
                    <span>Video</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAnimate('speak')}
                    className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    <span>Speak</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAnimate('ugc')}
                    className="cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>UGC</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShareModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">Share Image</h3>

              {/* Social Platforms */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    className={`aspect-square bg-gray-100 ${platform.color} text-gray-700 hover:text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-colors p-4`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/collection/${image.alt}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      copiedLink
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Collections Section Component
const CollectionsSection: React.FC<CollectionsSectionProps & { onCollectionClick: (collection: Collection) => void }> = ({
  title,
  subtitle,
  collections,
  onCollectionClick,
}) => {
  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {title} <span className="text-base font-normal text-muted-foreground">| Curated By: Vicki Ravelle</span>
        </h2>
        {subtitle && (
          <p className="text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <CollectionCard 
            key={collection.id} 
            collection={collection}
            onClick={() => onCollectionClick(collection)}
          />
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
  const [expandedCollection, setExpandedCollection] = useState<Collection | null>(null);

  const getGridCols = () => {
    return 'lg:grid-cols-4';
  };

  if (expandedCollection) {
    // Expanded Collection View
    return (
      <div className="min-h-screen bg-background">
        <div className="py-8 space-y-8">
          {/* Collection Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {expandedCollection.title} <span className="text-base font-normal text-muted-foreground">| Curated By: Vicki Ravelle</span>
            </h2>
            <p className="text-base text-muted-foreground">{expandedCollection.totalCount} images</p>
          </div>

          {/* Gallery Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${getGridCols()} gap-4`}>
            {expandedCollection.images.map((image, index) => (
              <GalleryImageCard 
                key={index} 
                image={image} 
                columnsPerRow={4}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Collections List View
  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 space-y-0">
        {/* Popular Collections */}
        <CollectionsSection
          title={popularTitle}
          subtitle={popularSubtitle}
          collections={popularCollections}
          onCollectionClick={setExpandedCollection}
        />

        {/* Recommended Collections */}
        <CollectionsSection
          title={recommendedTitle}
          subtitle={recommendedSubtitle}
          collections={recommendedCollections}
          onCollectionClick={setExpandedCollection}
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
