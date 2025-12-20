import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Upload,
  Plus,
  X,
  GripVertical,
  Trash2,
  Check,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  selected?: boolean;
}

interface ImagePanelProps {
  onAddToTimeline?: (asset: ImageAsset) => void;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ onAddToTimeline }) => {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ImageAsset = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: event.target?.result as string,
          thumbnail: event.target?.result as string,
        };
        setImages((prev) => [...prev, newImage]);
        toast.success(`Added ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ImageAsset = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: event.target?.result as string,
          thumbnail: event.target?.result as string,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteSelected = () => {
    setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
    toast.success('Images deleted');
  };

  const addToTimeline = (image: ImageAsset) => {
    if (onAddToTimeline) {
      onAddToTimeline(image);
      toast.success(`Added "${image.name}" to timeline`);
    }
  };

  const handleDragStart = (e: React.DragEvent, image: ImageAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'image',
      ...image,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
          <FolderOpen className="w-4 h-4" />
          Library
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected actions */}
      {selectedImages.size > 0 && (
        <div className="flex items-center justify-between mb-3 p-2 bg-violet-50 rounded-lg">
          <span className="text-sm text-violet-700 font-medium">
            {selectedImages.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedImages.forEach((id) => {
                  const img = images.find((i) => i.id === id);
                  if (img) addToTimeline(img);
                });
              }}
              className="p-1.5 hover:bg-violet-100 rounded text-violet-700"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={deleteSelected}
              className="p-1.5 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImages(new Set())}
              className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Images grid or drop zone */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-xl transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'
          }`}
        >
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No Image Assets</h3>
          <p className="text-sm text-gray-500 max-w-[280px] mb-4">
            Drop images here or click upload to add images to your project
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, image)}
                  onClick={() => toggleSelect(image.id)}
                  onDoubleClick={() => addToTimeline(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                    selectedImages.has(image.id)
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToTimeline(image);
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages((prev) => prev.filter((i) => i.id !== image.id));
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  {/* Selection check */}
                  {selectedImages.has(image.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePanel;
