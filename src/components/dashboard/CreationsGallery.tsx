import { useState } from 'react';
import { 
  Play, Star, Bookmark, Heart, Download, Edit, RefreshCw, 
  Share2, X, Copy, Check, Image as ImageIcon
} from 'lucide-react';

interface GalleryProps {
  type: 'creations' | 'community';
}

const CreationsGallery = ({ type }: GalleryProps) => {
  const [likedItems, setLikedItems] = useState(new Set());
  const [savedItems, setSavedItems] = useState(new Set());
  const [featuredItems, setFeaturedItems] = useState(new Set());
  const [shareModalOpen, setShareModalOpen] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Creations gallery items
  const creationsData = [
    {
      id: 1,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
      title: 'Northern Lights',
      creator: { name: 'Sarah Chen', avatar: 'SC' }
    },
    {
      id: 2,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      title: 'Mountain Vista',
      creator: { name: 'Alex Rivera', avatar: 'AR' }
    },
    {
      id: 3,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      title: 'Forest Path',
      creator: { name: 'Maya Patel', avatar: 'MP' }
    },
    {
      id: 4,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      title: 'Sunset Drive',
      creator: { name: 'Jordan Lee', avatar: 'JL' }
    },
    {
      id: 5,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      title: 'Mountain Range',
      creator: { name: 'Sam Taylor', avatar: 'ST' }
    },
    {
      id: 6,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=800',
      title: 'Ocean Sunset',
      creator: { name: 'Chris Anderson', avatar: 'CA' }
    },
    {
      id: 7,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      title: 'City Lights',
      creator: { name: 'Taylor Kim', avatar: 'TK' }
    },
    {
      id: 8,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      title: 'Night Drive',
      creator: { name: 'Morgan Davis', avatar: 'MD' }
    }
  ];

  // Community gallery items - different images
  const communityData = [
    {
      id: 9,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
      title: 'Desert Road',
      creator: { name: 'James Wilson', avatar: 'JW' }
    },
    {
      id: 10,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      title: 'Lake Paradise',
      creator: { name: 'Emma Stone', avatar: 'ES' }
    },
    {
      id: 11,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      title: 'Misty Mountains',
      creator: { name: 'David Park', avatar: 'DP' }
    },
    {
      id: 12,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
      title: 'Tropical Beach',
      creator: { name: 'Lisa Ray', avatar: 'LR' }
    },
    {
      id: 13,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
      title: 'Winter Woods',
      creator: { name: 'Mark Johnson', avatar: 'MJ' }
    },
    {
      id: 14,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
      title: 'Alpine Valley',
      creator: { name: 'Sophie Chen', avatar: 'SC' }
    },
    {
      id: 15,
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800',
      title: 'Urban Sunset',
      creator: { name: 'Ryan Cooper', avatar: 'RC' }
    },
    {
      id: 16,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800',
      title: 'Canyon Drive',
      creator: { name: 'Nina Patel', avatar: 'NP' }
    }
  ];

  const items = type === 'creations' ? creationsData : communityData;

  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: number) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFeatured = (id: number) => {
    setFeaturedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = (id: number) => {
    setShareModalOpen(id);
    setCopiedLink(false);
  };

  const copyShareLink = (id: number) => {
    const link = `${window.location.origin}/creation/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const socialPlatforms = [
    { name: 'Twitter', icon: '𝕏', color: 'hover:bg-gray-900' },
    { name: 'Facebook', icon: 'f', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: '📷', color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-700' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Image/Video */}
            <div className="relative aspect-auto">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-auto object-cover"
              />

              {/* Media Type Badge - Top Left */}
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.type === 'video' ? (
                  <>
                    <Play size={14} className="text-white" fill="white" />
                    <span className="text-white text-xs font-semibold uppercase">Video</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} className="text-white" />
                    <span className="text-white text-xs font-semibold uppercase">Image</span>
                  </>
                )}
              </div>

              {/* Top Right Actions - Always visible on hover */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Featured Star */}
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className={`w-9 h-9 rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                    featuredItems.has(item.id)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-black/70 text-white hover:bg-yellow-500'
                  }`}
                  title="Feature"
                >
                  <Star size={18} fill={featuredItems.has(item.id) ? 'currentColor' : 'none'} />
                </button>

                {/* Save Bookmark */}
                <button
                  onClick={() => toggleSave(item.id)}
                  className={`w-9 h-9 rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                    savedItems.has(item.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-black/70 text-white hover:bg-blue-500'
                  }`}
                  title="Save"
                >
                  <Bookmark size={18} fill={savedItems.has(item.id) ? 'currentColor' : 'none'} />
                </button>

                {/* Like Heart */}
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`w-9 h-9 rounded-lg backdrop-blur-sm flex items-center justify-center transition-all ${
                    likedItems.has(item.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-black/70 text-white hover:bg-red-500'
                  }`}
                  title="Like"
                >
                  <Heart size={18} fill={likedItems.has(item.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Creator Info - Bottom Left */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {item.creator.avatar}
                </div>
                <span className="text-white text-sm font-medium bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">
                  {item.creator.name}
                </span>
              </div>
            </div>

            {/* Action Buttons - Bottom */}
            <div className="p-3 bg-white border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between gap-2">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Recreate"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Recreate</span>
                </button>
                
                <button 
                  onClick={() => handleShare(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShareModalOpen(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">Share Creation</h3>

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
                    value={`${window.location.origin}/creation/${shareModalOpen}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={() => copyShareLink(shareModalOpen)}
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
    </div>
  );
};

export default CreationsGallery;
