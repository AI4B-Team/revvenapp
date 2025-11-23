import React, { useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, X, Loader2, Copy, Search, Sparkles, Image as ImageIcon, Users } from 'lucide-react';
import { useImageToPrompt } from '@/hooks/useImageToPrompt';
import { toast } from 'sonner';
import { creationsData, communityData } from '@/data/creationsData';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ImageToPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptGenerated: (prompt: string) => void;
}

export const ImageToPromptModal = ({ isOpen, onClose, onPromptGenerated }: ImageToPromptModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFromGallery, setSelectedFromGallery] = useState<string | null>(null);

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
      setSelectedFromGallery(null);
      const success = await handleImageUpload(file);
      if (success) await generatePrompt();
    }
  };

  const handleGalleryImageSelect = async (imageUrl: string) => {
    setSelectedFromGallery(imageUrl);
    clearImage();
    
    // Convert URL to file for processing
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'gallery-image.jpg', { type: blob.type });
      const success = await handleImageUpload(file);
      if (success) await generatePrompt();
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const currentData = activeTab === 'creations' ? creationsData : activeTab === 'community' ? communityData : creationsData;
  const filteredImages = currentData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <DialogContent className="max-w-[90vw] h-[85vh] bg-[#0a0a0a] border-[#1a1a1a] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h1 className="text-2xl font-bold text-white">Image-To-Prompt</h1>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search References"
                  className="pl-10 bg-[#0f0f0f] border-[#1a1a1a] text-white"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Upload An Image For An Instant Prompt</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
              {/* Left: Gallery (2/3 width) */}
              <div className="lg:col-span-2 flex flex-col h-full overflow-hidden p-6 pr-0">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="bg-transparent border-0 mb-4 justify-start gap-6 p-0">
                    <TabsTrigger 
                      value="creations" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none text-white data-[state=inactive]:text-white flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                      Creations
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stock" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none text-white data-[state=inactive]:text-white flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4 text-white" />
                      Stock
                    </TabsTrigger>
                    <TabsTrigger 
                      value="community" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none text-white data-[state=inactive]:text-white flex items-center gap-2"
                    >
                      <Users className="h-4 w-4 text-white" />
                      Community
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="flex-1 overflow-y-auto mt-0">
                    <div className="grid grid-cols-6 gap-3">
                      {filteredImages.slice(0, 18).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleGalleryImageSelect(item.thumbnail)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            selectedFromGallery === item.thumbnail
                              ? 'border-primary'
                              : 'border-transparent hover:border-[#2a2a2a]'
                          }`}
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right: Upload & Prompt (1/3 width) */}
              <div className="flex flex-col h-full bg-[#0f0f0f] border-l border-[#1a1a1a] p-6">
                {/* Upload Area */}
                {!uploadedImage ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all flex flex-col items-center justify-center mb-4 ${
                      dragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Drag & drop or click to browse
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="bg-muted hover:bg-muted/80 text-black"
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
                    <p className="text-xs text-muted-foreground mt-3">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-[#1a1a1a] mb-4">
                    <button
                      onClick={() => {
                        clearImage();
                        setSelectedFromGallery(null);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/80 hover:bg-black rounded-full transition"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    <img
                      src={uploadedImage.preview}
                      alt="Selected"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Analyze Button */}
                {uploadedImage && !generatedPrompt && !isGenerating && (
                  <Button
                    onClick={generatePrompt}
                    disabled={isGenerating}
                    size="sm"
                    className="bg-white hover:bg-white/90 text-black w-full mb-4"
                  >
                    Analyze Image
                  </Button>
                )}

                {/* Generated Prompt */}
                <div className="flex-1 flex flex-col overflow-hidden relative mb-4">
                  {isGenerating ? (
                    <div className="flex-1 flex items-center justify-center rounded-lg border border-[#1a1a1a]">
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Analyzing...</p>
                      </div>
                    </div>
                  ) : generatedPrompt ? (
                    <>
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-muted hover:bg-muted/80 rounded-md transition"
                      >
                        <Copy className="h-3 w-3 text-white" />
                      </button>
                      <Textarea
                        value={generatedPrompt}
                        onChange={(e) => updatePrompt(e.target.value)}
                        placeholder="Generated prompt..."
                        className="flex-1 resize-none border-[#1a1a1a] text-white text-sm"
                      />
                    </>
                  ) : (
                    <div className="flex-1 rounded-lg border border-[#1a1a1a]" />
                  )}
                </div>

                {/* Use Button */}
                <Button
                  onClick={handleUsePrompt}
                  disabled={!canUsePrompt || !generatedPrompt}
                  className="bg-white hover:bg-white/90 text-black w-full"
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
