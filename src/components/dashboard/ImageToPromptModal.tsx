import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, X, Loader2, Copy } from 'lucide-react';
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

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast.success('Prompt copied to clipboard');
    }
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] bg-[#0a0a0a] border-[#1a1a1a] p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 p-2 bg-background border border-border rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="w-full max-w-7xl mx-auto overflow-y-auto max-h-[calc(85vh-3rem)]">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Image to Prompt
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Upload */}
          <div className="space-y-4 flex flex-col h-[600px]">
            {!uploadedImage ? (
              <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all flex-1 flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#3a3a3a]'
                }`}
              >
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload An Image</h3>
                <div className="text-muted-foreground mb-6 text-center">
                  <p>Drag & Drop Or Click To Browse</p>
                  <p>Upload An Image For An Instant Prompt</p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-muted hover:bg-muted/80 text-black"
                >
                  <Upload className="h-4 w-4 mr-2 text-black" />
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
                  PNG, JPG, WEBP Up To 10MB
                </p>
              </div>
              <Button
                onClick={generatePrompt}
                disabled={!uploadedImage || isGenerating}
                size="sm"
                className="bg-white hover:bg-white/90 text-black w-full flex-shrink-0"
              >
                Analyze Image
              </Button>
              </>
            ) : (
              <>
              <div className="relative rounded-lg overflow-hidden bg-[#0f0f0f] border border-[#1a1a1a] flex-1 flex flex-col">
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 z-10 p-2 bg-black/80 hover:bg-black rounded-full transition"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <img
                  src={uploadedImage.preview}
                  alt="Uploaded"
                  className="w-full h-auto object-contain flex-1"
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
              <Button
                onClick={generatePrompt}
                disabled={!uploadedImage || isGenerating}
                size="sm"
                className="bg-white hover:bg-white/90 text-black w-full flex-shrink-0"
              >
                Analyze Image
              </Button>
              </>
            )}
          </div>

          {/* Right: Generated Prompt */}
          <div className="space-y-4 flex flex-col overflow-hidden h-[600px]">
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {isGenerating ? (
                <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] rounded-lg border border-[#1a1a1a]">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing image...</p>
                  </div>
                </div>
              ) : generatedPrompt ? (
                <>
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-2 right-2 z-10 p-2 bg-muted hover:bg-muted/80 rounded-md transition"
                  >
                    <Copy className="h-4 w-4 text-white" />
                  </button>
                  <Textarea
                    value={generatedPrompt}
                    onChange={(e) => updatePrompt(e.target.value)}
                    placeholder="Generated prompt will appear here..."
                    className="flex-1 resize-none bg-[#0f0f0f] border-[#1a1a1a] text-white min-h-[400px]"
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] rounded-lg border border-[#1a1a1a]">
                  <p className="text-muted-foreground">The Image Prompt Will Appear Here</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4 border-t border-[#1a1a1a] flex-shrink-0">
              <Button
                onClick={handleUsePrompt}
                disabled={!canUsePrompt}
                className="bg-white hover:bg-white/90 text-black px-12 flex-shrink-0"
              >
                Use
              </Button>
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
