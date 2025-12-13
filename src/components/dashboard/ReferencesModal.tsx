import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, X, History, Image as ImageIcon, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateFile, createPreviewUrl, MAX_IMAGES } from "@/utils/imageUtils";

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference?: (reference: any) => void;
  onImagesSelect?: (images: any[]) => void;
  selectedReference?: any;
  initialSelectedImages?: any[];
}

const ReferencesModal = ({ isOpen, onClose, onSelectReference, onImagesSelect, selectedReference, initialSelectedImages = [] }: ReferencesModalProps) => {
  const [activeTab, setActiveTab] = useState('history');
  const [references, setReferences] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchReferences();
      // Initialize with existing selected images
      setSelectedImages(initialSelectedImages);
    } else {
      // Clear selections when modal closes
      setSelectedImages([]);
    }
  }, [isOpen, initialSelectedImages]);

  const fetchReferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reference_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add 18 different placeholder images
      const imageIds = [
        '1633356122544-f134324a6cee', '1494790108377-be9c29b29330', '1535713875002-d1d0cf377fde',
        '1560807707-8cc77767d783', '1544005313-94ddf0286df2', '1517841905240-472988babdf9',
        '1539571696357-5a69c17a67c6', '1524504388940-b1c1722653e1', '1488161628813-04466f872be2',
        '1552053831-71594a27632d', '1573164713714-d95e436ab8d6', '1534528741775-53994a69daeb',
        '1507003211169-0a1dd7228f2d', '1506794778202-cad84cf45f1d', '1517423440428-a5a00ad493e8',
        '1502323777036-f29e3972d82f', '1522075469751-3a6694fb2f61', '1529626455594-4ff0802cfb7e'
      ];
      
      const placeholderImages = imageIds.map((imageId, i) => ({
        id: `placeholder-${i}`,
        image_url: `https://images.unsplash.com/photo-${imageId}?w=400&h=400&fit=crop`,
        thumbnail_url: `https://images.unsplash.com/photo-${imageId}?w=400&h=400&fit=crop`,
        original_filename: `Reference ${i + 1}.jpg`,
        user_id: 'placeholder',
        created_at: new Date().toISOString(),
        cloudinary_public_id: null
      }));
      
      setReferences(placeholderImages);
    } catch (error) {
      console.error('Error fetching references:', error);
      toast.error('Failed to load reference images');
    } finally {
      setIsLoading(false);
    }
  };

  const processFiles = async (files: File[]) => {
    const validationResults = files.map(file => ({ file, validation: validateFile(file) }));
    
    const invalidFiles = validationResults.filter(r => !r.validation.valid);
    if (invalidFiles.length > 0) {
      toast.error(invalidFiles[0].validation.error || 'Invalid file');
      return;
    }

    if (uploadedFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploading(true);
    try {
      // Upload each file
      for (const file of files) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const { data, error } = await supabase.functions.invoke('upload-reference-image', {
                body: {
                  image: base64,
                  filename: file.name
                }
              });

              if (error) throw error;

              const newFile = {
                id: data?.referenceImage?.id || `upload-${Date.now()}`,
                file,
                preview: createPreviewUrl(file),
                name: file.name,
                ...data?.referenceImage
              };
              
              setUploadedFiles(prev => [...prev, newFile]);
              resolve(newFile);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });
      }

      toast.success('Images uploaded successfully');
      fetchReferences();
    } catch (error) {
      console.error('Error uploading references:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleImageClick = (image: any) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === image.id);
      if (isSelected) {
        return prev.filter(img => img.id !== image.id);
      }
      // Allow up to 14 images (max supported by Seedream)
      if (prev.length < 14) {
        return [...prev, image];
      }
      toast.error("Maximum 14 images allowed");
      return prev;
    });
  };

  const handleUse = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    // Support both multi-select and single-select modes
    if (onImagesSelect) {
      onImagesSelect(selectedImages);
    } else if (onSelectReference) {
      // Fallback to single selection for backward compatibility
      onSelectReference(selectedImages[0]);
    }
    
    onClose();
  };

  const handleRemoveUpload = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedImages(prev => prev.filter(img => img.id !== fileId));
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reference_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Reference image deleted');
      fetchReferences();
      
      // Deselect if this was the selected reference
      if (selectedReference?.id === id) {
        onSelectReference(null);
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast.error('Failed to delete reference image');
    }
  };

  const filteredReferences = searchQuery
    ? references.filter(ref => 
        ref.original_filename?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : references;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Close Button - Outside Modal */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-background rounded-lg transition-colors border border-border z-[60]"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      {/* Modal */}
      <div 
        className="relative bg-[#1a1f2e] rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">References</h2>
              <p className="text-sm text-gray-400">Upload Or Select An Image</p>
            </div>
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search References"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'history'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                Creations
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'stock'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Stock
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'community'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Community
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'history' && (
              <>
                {/* Upload Area */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">New Uploads</h3>
                    <div className="grid grid-cols-6 gap-4">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                            selectedImages.some(img => img.id === file.id)
                              ? 'border-primary ring-2 ring-primary'
                              : 'border-gray-700 hover:border-green-500'
                          }`}
                          onClick={() => handleImageClick(file)}
                        >
                          <div className="aspect-square">
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Upload className="text-gray-600" size={24} />
                              </div>
                            )}
                          </div>
                          {/* Removed delete button */}
                          {selectedImages.some(img => img.id === file.id) && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              ✓
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white truncate">{file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References Grid */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredReferences.length === 0 && uploadedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <Upload className="h-16 w-16 text-gray-600 mx-auto mb-3" />
                    </div>
                    <p className="text-gray-400 mb-2">No reference images yet</p>
                    <p className="text-sm text-gray-500">Upload your first reference image to get started</p>
                  </div>
                ) : (
                  <div>
                    {filteredReferences.length > 0 && (
                      <>
                        <div className="grid grid-cols-6 gap-4">
                          {filteredReferences.map((reference) => (
                            <div
                              key={reference.id}
                              className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                                selectedImages.some(img => img.id === reference.id) || selectedReference?.id === reference.id
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-gray-700 hover:border-green-500'
                              }`}
                              onClick={() => handleImageClick(reference)}
                            >
                              <div className="aspect-square">
                                <img
                                  src={reference.thumbnail_url || reference.image_url}
                                  alt={reference.original_filename || 'Reference'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Removed delete button */}
                              {(selectedImages.some(img => img.id === reference.id) || selectedReference?.id === reference.id) && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                  ✓
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-xs text-white truncate">
                                  {reference.original_filename || 'Image'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'stock' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Upload className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Stock Images Coming Soon</p>
                <p className="text-sm text-gray-500">Access thousands of professional stock images</p>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Upload className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Community Styles Coming Soon</p>
                <p className="text-sm text-gray-500">Discover and share styles with the community</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Upload Section */}
        <div 
          className="w-[560px] bg-[#151a27] border-l border-gray-800 flex flex-col"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div 
            className={`flex-1 p-6 flex flex-col justify-center transition-colors ${
              isDragging ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
            }`}
          >
            {selectedImages.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-white mb-6 self-start">Selected Images ({selectedImages.length}/14)</h3>
                <div className="grid grid-cols-2 gap-6 justify-items-center items-center max-h-[400px] overflow-y-auto">
                  {selectedImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative rounded-lg overflow-hidden border-2 border-primary"
                      style={{ aspectRatio: '1/1', width: '220px', height: '220px' }}
                    >
                      <img
                        src={image.thumbnail_url || image.image_url || image.preview}
                        alt={image.original_filename || image.name || `Selected ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleImageClick(image)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded transition"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-full text-center cursor-pointer hover:bg-gray-800/30 transition-colors rounded-lg"
              >
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {isDragging ? 'Drop Images Here' : 'Upload Up To 14 Images'}
                </h3>
                <p className="text-gray-400 mb-2">
                  {isDragging 
                    ? 'Release to upload your images' 
                    : 'Click to upload or drag and drop'
                  }
                </p>
                <p className="text-sm text-gray-500">PNG, JPG Or WEBP Up To 10MB</p>
              </div>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="p-6 border-t border-gray-800 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Upload"
              )}
            </Button>
            <Button
              onClick={handleUse}
              disabled={selectedImages.length === 0}
              className="w-full bg-white hover:bg-gray-100 text-black"
            >
              Use
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferencesModal;