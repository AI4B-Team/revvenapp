import React, { useState, useRef } from 'react';
import { Upload, Search, Heart, Check, Trash2, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import FileFormatIcons from '@/components/ui/FileFormatIcons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

interface EditorImagePanelProps {
  onSelectImage?: (imageUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: (filter?: 'all' | 'images' | 'videos') => void;
  uploadedImages?: UploadedImage[];
  onAddToTimeline?: (imageUrl: string, name: string, thumbnail?: string) => void;
  onDeleteImage?: (imageId: string) => void;
  favoriteImageIds?: string[];
  onToggleFavorite?: (imageId: string) => void;
}

const EditorImagePanel: React.FC<EditorImagePanelProps> = ({ 
  onSelectImage, 
  onOpenReferences,
  uploadedImages = [],
  onAddToTimeline,
  onDeleteImage,
  favoriteImageIds = [],
  onToggleFavorite
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorite'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageFavorited = (imageId: string) => {
    return favoriteImageIds.includes(imageId);
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

  const handleImageDragStart = (e: React.DragEvent, image: UploadedImage) => {
    const dragData = JSON.stringify({
      type: 'image',
      url: image.url,
      thumbnail: image.thumbnail || image.url,
      name: image.name,
    });
    e.dataTransfer.setData('application/json', dragData);
    e.dataTransfer.setData('text/plain', dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredImages = uploadedImages.filter(img => {
    const matchesSearch = !searchQuery || img.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'favorite' && isImageFavorited(img.id));
    return matchesSearch && matchesFilter;
  });

  const hasUploadedImages = uploadedImages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search Bar and Upload Button - Only show when files are uploaded */}
      {hasUploadedImages && (
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 border-gray-300 hover:bg-gray-50 flex-shrink-0"
            onClick={() => onOpenReferences?.('images')}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload</span>
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Images"
              className="w-full pl-9 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 placeholder:text-gray-400"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 px-3 py-2 border-gray-300 hover:bg-gray-50 flex-shrink-0 ${
                  filterType !== 'all' ? 'bg-primary/10 border-primary text-primary' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {filterType === 'all' ? 'All' : 'Favorites'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem 
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-primary/10 text-primary' : ''}
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterType('favorite')}
                className={filterType === 'favorite' ? 'bg-primary/10 text-primary' : ''}
              >
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                Favorites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Upload Area - Only show when NO files are uploaded */}
      {!hasUploadedImages && (
        <>
          <div 
            className={`bg-white rounded-xl p-8 text-center transition-all cursor-pointer border-2 border-dashed ${
              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500'
            }`}
            onClick={() => onOpenReferences ? onOpenReferences('images') : fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-emerald-500 mb-1" />
              <span className="text-gray-900 font-semibold text-lg">Click To Upload</span>
              <p className="text-gray-500 text-sm">or, drag and drop a file here</p>
              
              <FileFormatIcons />
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
        </>
      )}

      {/* Uploaded Images Grid */}
      {hasUploadedImages && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
          {filteredImages.map((image) => {
            const isFavorite = isImageFavorited(image.id);
            return (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-grab group bg-gray-100 border-2 border-transparent hover:border-emerald-500 transition-colors"
                draggable
                onDragStart={(e) => handleImageDragStart(e, image)}
              >
                <img
                  src={image.thumbnail || image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  {/* Top actions */}
                  <div className="flex justify-between items-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(image.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        isFavorite 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 hover:bg-white text-gray-700'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage?.(image.id);
                      }}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-red-500 hover:text-white text-gray-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Bottom action - Add to timeline */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToTimeline?.(image.url, image.name, image.thumbnail);
                      toast.success(`Added "${image.name}" to timeline`);
                    }}
                    className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Timeline
                  </button>
                </div>
                
                {/* Image name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-0">
                  <p className="text-white text-xs truncate">{image.name}</p>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorImagePanel;
