import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useImageToPrompt } from '@/hooks/useImageToPrompt';
import { toast } from 'sonner';

interface ImageToPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptGenerated: (prompt: string) => void;
}

export const ImageToPromptModal = ({ isOpen, onClose, onPromptGenerated }: ImageToPromptModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    uploadedImage,
    generatedPrompt,
    isGenerating,
    error,
    handleImageUpload,
    generatePrompt,
    clearImage,
    updatePrompt,
    canUsePrompt,
    promptLength
  } = useImageToPrompt();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const success = await handleImageUpload(file);
      if (success) await generatePrompt();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await handleImageUpload(file);
      if (success) await generatePrompt();
    }
  };

  const handleUsePrompt = () => {
    if (canUsePrompt) {
      onPromptGenerated(generatedPrompt);
      toast.success('Prompt added to input');
      onClose();
    }
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] bg-[#0a0a0a] border-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Image to Prompt
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Left: Image Upload */}
          <div className="space-y-4 overflow-y-auto">
            {!uploadedImage ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#3a3a3a]'
                }`}
              >
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload an Image</h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-muted hover:bg-muted/80"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Supports: JPG, PNG, WEBP, GIF (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-[#0f0f0f] border border-[#1a1a1a]">
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 z-10 p-2 bg-black/80 hover:bg-black rounded-full transition"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <img
                  src={uploadedImage.preview}
                  alt="Uploaded"
                  className="w-full h-auto object-contain max-h-[500px]"
                />
                <div className="p-4 border-t border-[#1a1a1a]">
                  <p className="text-sm text-muted-foreground truncate">
                    {uploadedImage.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Generated Prompt */}
          <div className="space-y-4 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Generated Prompt</h3>
                {generatedPrompt && (
                  <span className={`text-xs ${promptLength > 1024 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {promptLength} / 1024
                  </span>
                )}
              </div>

              {isGenerating ? (
                <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] rounded-lg border border-[#1a1a1a]">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing image...</p>
                  </div>
                </div>
              ) : generatedPrompt ? (
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => updatePrompt(e.target.value)}
                  placeholder="Generated prompt will appear here..."
                  className="flex-1 resize-none bg-[#0f0f0f] border-[#1a1a1a] text-white min-h-[400px]"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] rounded-lg border border-[#1a1a1a]">
                  <p className="text-muted-foreground">Upload an image to generate a prompt</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#1a1a1a]">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUsePrompt}
                disabled={!canUsePrompt}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Use Prompt
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
