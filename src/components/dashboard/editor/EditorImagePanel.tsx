import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import FileFormatIcons from '@/components/ui/FileFormatIcons';

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface EditorImagePanelProps {
  onSelectImage?: (imageUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: () => void;
  generatedImages?: GeneratedImage[];
}

const EditorImagePanel: React.FC<EditorImagePanelProps> = ({ onSelectImage, onOpenReferences, generatedImages: externalImages }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch generated images from database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: images, error } = await supabase
          .from('generated_images')
          .select('id, prompt, image_url, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching images:', error);
          setIsLoading(false);
          return;
        }

        setGeneratedImages(images || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setIsLoading(false);
      }
    };

    fetchImages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('editor-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_images'
        },
        () => {
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Use external images if provided, otherwise use fetched images
  const displayImages = externalImages || generatedImages;

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

  const handleImageClick = (image: GeneratedImage) => {
    if (image.image_url && onSelectImage) {
      onSelectImage(image.image_url, image.image_url);
      toast.success('Image selected');
    }
  };

  const hasImages = displayImages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Show images grid if we have images */}
      {hasImages && (
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageClick(image)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors ${
                  image.status === 'pending' || image.status === 'processing' 
                    ? 'border-yellow-400 bg-gray-100' 
                    : image.status === 'completed' && image.image_url
                      ? 'border-transparent hover:border-primary'
                      : 'border-red-300 bg-red-50'
                }`}
              >
                {image.status === 'pending' || image.status === 'processing' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-green mb-2" />
                    <span className="text-xs text-gray-500">Generating...</span>
                  </div>
                ) : image.image_url ? (
                  <>
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-white text-xs line-clamp-2">{image.prompt}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                    <ImageIcon className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-xs text-red-500">Failed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasImages && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Click To Upload Section */}
      <div 
        className={`bg-white rounded-xl p-8 text-center transition-all cursor-pointer border-2 border-dashed ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500'
        }`}
        onClick={() => onOpenReferences ? onOpenReferences() : fileInputRef.current?.click()}
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
    </div>
  );
};

export default EditorImagePanel;
