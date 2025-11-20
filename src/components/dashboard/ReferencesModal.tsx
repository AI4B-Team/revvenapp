import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (reference: any) => void;
  selectedReference?: any;
}

const ReferencesModal = ({ isOpen, onClose, onSelectReference, selectedReference }: ReferencesModalProps) => {
  const [references, setReferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;

        const { data, error } = await supabase.functions.invoke('upload-reference-image', {
          body: {
            image: base64,
            filename: file.name
          }
        });

        if (error) throw error;

        toast.success('Reference image uploaded');
        fetchReferences();
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading reference:', error);
      toast.error('Failed to upload reference image');
    } finally {
      setIsUploading(false);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reference Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              id="reference-upload"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="reference-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {isUploading ? 'Uploading...' : 'Click to upload reference image'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
            </label>
          </div>

          {/* References Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reference images yet</p>
              <p className="text-sm">Upload your first reference image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {references.map((reference) => (
                <div
                  key={reference.id}
                  className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    selectedReference?.id === reference.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    onSelectReference(reference);
                    onClose();
                  }}
                >
                  <img
                    src={reference.thumbnail_url || reference.image_url}
                    alt={reference.original_filename}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(reference.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedReference?.id === reference.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferencesModal;