import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateFile, createPreviewUrl, MAX_IMAGES } from "@/utils/imageUtils";

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (reference: any) => void;
  selectedReference?: any;
}

const ReferencesModal = ({ isOpen, onClose, onSelectReference, selectedReference }: ReferencesModalProps) => {
  const [activeTab, setActiveTab] = useState('history');
  const [references, setReferences] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchReferences();
    }
  }, [isOpen]);

  const fetchReferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reference_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferences(data || []);
    } catch (error) {
      console.error('Error fetching references:', error);
      toast.error('Failed to load reference images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
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

  const handleImageClick = (image: any) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === image.id);
      if (isSelected) {
        return prev.filter(img => img.id !== image.id);
      }
      if (prev.length < MAX_IMAGES) {
        return [...prev, image];
      }
      return prev;
    });
  };

  const handleUse = () => {
    if (selectedImages.length > 0) {
      onSelectReference(selectedImages[0]); // For now, use first selected
      onClose();
    }
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
        className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'history'
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('my-styles')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'my-styles'
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Styles
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Styles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600"
              />
            </div>

            {/* Upload Button */}
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
              className="bg-white text-black hover:bg-gray-200 font-medium"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              + New Style
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">New Uploads</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                      selectedImages.some(img => img.id === file.id)
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-700 hover:border-gray-600'
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUpload(file.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-white" />
                    </button>
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
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-white text-black hover:bg-gray-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>
          ) : (
            <div>
              {filteredReferences.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Your References</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredReferences.map((reference) => (
                      <div
                        key={reference.id}
                        className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                          selectedImages.some(img => img.id === reference.id) || selectedReference?.id === reference.id
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-gray-700 hover:border-gray-600'
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(reference.id);
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
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
        </div>

        {/* Footer */}
        {(selectedImages.length > 0 || uploadedFiles.length > 0) && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              onClick={handleUse}
              disabled={selectedImages.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Use Selected
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencesModal;