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
      const imageData = await handleImageUpload(file);
      if (imageData) await generatePrompt(imageData);
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
      const imageData = await handleImageUpload(file);
      if (imageData) await generatePrompt(imageData);
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
          <div className="px-6 pt-6 pb-4 border-b border-[#1a1a1a] flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Image-To-Prompt</h1>
              <p className="text-muted-foreground text-sm">Upload An Image For An Instant Prompt</p>
            </div>
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search References"
                className="pl-10 bg-[#0f0f0f] border-[#1a1a1a] text-white"
              />
            </div>
          </div>

          {/* Content - 2-column layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Gallery (2/3 width) - Darker background #1e293b */}
            <div className="flex-[2] flex flex-col h-full overflow-hidden p-6 bg-[#1e293b]">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="bg-transparent border-0 mb-4 justify-start gap-6 p-0">
                    <TabsTrigger 
                      value="creations" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                      <span className="text-white">Creations</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stock" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4 text-white" />
                      <span className="text-white">Stock</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="community" 
                      className="bg-transparent data-[state=active]:bg-transparent border-0 data-[state=active]:shadow-none flex items-center gap-2"
                    >
                      <Users className="h-4 w-4 text-white" />
                      <span className="text-white">Community</span>
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

            {/* RIGHT PANEL - Starts at top */}
            <div className="flex-1 border-l border-gray-800 flex flex-col bg-black">
              
              {/* UPLOAD SECTION - Large, fills space */}
              <div className="flex-[2] flex items-center justify-center p-8 pt-6">
                  <div 
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700'
                    }`}
                  >
                    {uploadedImage ? (
                      <div className="relative w-full h-full p-4">
                        <img
                          src={uploadedImage.preview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                          onClick={() => {
                            clearImage();
                            setSelectedFromGallery(null);
                          }}
                          className="absolute top-6 right-6 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center px-8">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center">
                          <Upload size={40} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload Image</h3>
                        <p className="text-sm text-gray-400 mb-6">Drag & drop or click to browse</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-colors"
                        >
                          Choose File
                        </button>
                        <p className="text-xs text-gray-500 mt-4">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

              {/* ANALYZE BUTTON */}
              <div className="px-8 pb-6">
                  <button
                    onClick={() => generatePrompt()}
                    disabled={!uploadedImage || isGenerating}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                      uploadedImage && !isGenerating
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Image'
                    )}
                  </button>
                </div>

              {/* PROMPT PREVIEW SECTION - Large, scrollable */}
              <div className="flex-[2] px-8 pb-6 flex items-center justify-center">
                  {generatedPrompt ? (
                    <div className="w-full h-full bg-gray-900/40 rounded-xl p-6 overflow-y-auto border border-gray-800 relative">
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute top-4 right-4 z-10 p-1.5 bg-white hover:bg-gray-100 rounded-md transition"
                        title="Copy prompt"
                      >
                        <Copy className="h-3 w-3 text-black" />
                      </button>
                      <Textarea
                        value={generatedPrompt}
                        onChange={(e) => updatePrompt(e.target.value)}
                        className="w-full h-full resize-none bg-transparent border-0 text-gray-300 text-sm placeholder:text-gray-600 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl">
                      <p className="text-gray-600 text-sm text-center px-8">
                        The Image Prompt Will Appear Here
                      </p>
                    </div>
                  )}
                </div>

              {/* USE BUTTON */}
              <div className="px-8 pb-8">
                  <button
                    onClick={handleUsePrompt}
                    disabled={!generatedPrompt?.trim()}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                      generatedPrompt?.trim()
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Use
                  </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
