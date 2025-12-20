import React, { useState, useRef, useEffect } from 'react';
import { Search, ImageIcon, Upload, Loader2, Plus, Play } from 'lucide-react';
import { toast } from 'sonner';

const PEXELS_API_KEY = 'gXq4NKwHspnNWq4RUUraWlQOrtdgNXHZ0K8mNvT41w6PYQAHTm6RcHIT';

interface PexelsPhoto {
  id: number;
  src: {
    medium: string;
    large: string;
    original: string;
  };
  photographer: string;
  alt: string;
}

interface EditorImagePanelProps {
  onSelectImage?: (imageUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: () => void;
}

const categories = [
  { label: 'Animal', query: 'animal' },
  { label: 'Architecture', query: 'architecture' },
  { label: 'Business', query: 'business' },
  { label: 'Food', query: 'food' },
  { label: 'Nature', query: 'nature' },
  { label: 'Travel', query: 'travel' },
];

const EditorImagePanel: React.FC<EditorImagePanelProps> = ({ onSelectImage, onOpenReferences }) => {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryImages, setCategoryImages] = useState<Record<string, PexelsPhoto[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images for all categories on mount
  useEffect(() => {
    const fetchCategoryImages = async () => {
      setIsLoading(true);
      const results: Record<string, PexelsPhoto[]> = {};
      
      for (const cat of categories) {
        try {
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(cat.query)}&per_page=3`,
            {
              headers: { Authorization: PEXELS_API_KEY },
            }
          );
          if (response.ok) {
            const data = await response.json();
            results[cat.query] = data.photos;
          }
        } catch (error) {
          console.error(`Error fetching ${cat.label} images:`, error);
        }
      }
      
      setCategoryImages(results);
      setIsLoading(false);
    };

    fetchCategoryImages();
  }, []);

  const fetchPhotos = async (query: string, pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${pageNum}`,
        {
          headers: { Authorization: PEXELS_API_KEY },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch photos');

      const data = await response.json();
      setPhotos(prev => append ? [...prev, ...data.photos] : data.photos);
      setHasMore(data.photos.length === 15);
    } catch (error) {
      console.error('Error fetching Pexels photos:', error);
      toast.error('Failed to load stock images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveCategory(searchQuery.trim());
      setPage(1);
      fetchPhotos(searchQuery, 1, false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(activeCategory, nextPage, true);
  };

  const handleCategoryClick = (query: string) => {
    setActiveCategory(query);
    setSearchQuery('');
    setPage(1);
    fetchPhotos(query, 1, false);
  };

  const handlePhotoSelect = (photo: PexelsPhoto) => {
    if (onSelectImage) {
      onSelectImage(photo.src.large, photo.src.medium);
      toast.success('Image added to timeline');
    }
  };

  const handleDragStart = (e: React.DragEvent, photo: PexelsPhoto) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'image',
      url: photo.src.large,
      thumbnail: photo.src.medium,
      name: photo.alt || photo.photographer
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      toast.success(`Uploaded ${file.name}`);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        toast.success(`Uploaded ${file.name}`);
      }
    });
  };

  // Show category view or search results
  const showCategoryView = !activeCategory;

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onOpenReferences ? onOpenReferences() : fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-gray-500" />
          <p className="font-medium text-gray-900">Click to upload</p>
          <p className="text-sm text-gray-500">or drag and drop a file here</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search Stock Images"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showCategoryView ? (
          // Category view with images
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.query}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{cat.label}</h4>
                  <button 
                    onClick={() => handleCategoryClick(cat.query)}
                    className="text-sm text-gray-500 hover:text-primary"
                  >
                    View all &gt;
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(categoryImages[cat.query] || []).map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, photo)}
                      onClick={() => handlePhotoSelect(photo)}
                    >
                      <img
                        src={photo.src.medium}
                        alt={photo.alt || cat.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                  {(!categoryImages[cat.query] || categoryImages[cat.query].length === 0) && (
                    <>
                      <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                      <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                      <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Search results view
          <>
            {isLoading && photos.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No images found</h3>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveCategory('')}
                  className="text-sm text-primary hover:underline mb-2"
                >
                  ← Back to categories
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
                      draggable
                      onDragStart={(e) => handleDragStart(e, photo)}
                      onMouseEnter={() => setHoveredPhoto(photo.id)}
                      onMouseLeave={() => setHoveredPhoto(null)}
                      onClick={() => handlePhotoSelect(photo)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={photo.src.medium}
                          alt={photo.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${
                          hoveredPhoto === photo.id ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && !isLoading && (
                  <button
                    onClick={loadMore}
                    className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Load more images
                  </button>
                )}

                {isLoading && photos.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pexels attribution */}
      <div className="pt-3 border-t border-gray-100 mt-3">
        <p className="text-xs text-gray-400 text-center">
          Images by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pexels</a>
        </p>
      </div>
    </div>
  );
};

export default EditorImagePanel;
