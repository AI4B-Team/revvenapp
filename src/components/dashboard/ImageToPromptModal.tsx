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
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">Image-To-Prompt</h1>
                <p className="text-muted-foreground text-sm mb-3">Upload An Image For An Instant Prompt</p>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search References"
                    className="pl-10 bg-[#0f0f0f] border-[#1a1a1a] text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content - 2-column layout */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
              {/* Left: Gallery (2/3 width) - Darker background #1e293b */}
              <div className="lg:col-span-2 flex flex-col h-full overflow-hidden p-6 pr-0 bg-[#1e293b]">
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

              {/* Right: Upload & Prompt - Full Height */}
              <div className="w-[480px] border-l border-gray-800 flex flex-col bg-[#0a0a0a] h-full">
                
                {/* TOP SECTION: Upload Area (Takes up available space) */}
                <div className="flex-1 p-8 min-h-0">
                  <div 
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
                      dragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {uploadedImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={uploadedImage.preview} 
                          alt="Selected"
                          className="w-full h-full object-contain" 
                        />
                        <button 
                          onClick={() => {
                            clearImage();
                            setSelectedFromGallery(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-800 flex items-center justify-center">
                          <Upload size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
                        <p className="text-sm text-gray-400 mb-4">Drag & drop or click to browse</p>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition"
                        >
                          Choose File
                        </button>
                        <p className="text-xs text-gray-500 mt-3">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/gif" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* MIDDLE SECTION 1: Analyze Button */}
                {uploadedImage && !generatedPrompt && !isGenerating && (
                  <div className="px-8 pb-6">
                    <button
                      onClick={generatePrompt}
                      disabled={isGenerating}
                      className="w-full py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition"
                    >
                      Analyze Image
                    </button>
                  </div>
                )}

                {/* MIDDLE SECTION 2: Prompt Preview (Takes up available space) */}
                <div className="flex-1 px-8 pb-6 min-h-[150px]">
                  <div className="h-full flex items-center justify-center relative">
                    {isGenerating ? (
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Analyzing image...</p>
                      </div>
                    ) : generatedPrompt ? (
                      <>
                        <button
                          onClick={handleCopyPrompt}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-white hover:bg-gray-100 rounded-md transition"
                          title="Copy prompt"
                        >
                          <Copy className="h-3 w-3 text-black" />
                        </button>
                        <Textarea
                          value={generatedPrompt}
                          onChange={(e) => updatePrompt(e.target.value)}
                          placeholder="The Image Prompt Will Appear Here"
                          className="w-full h-full resize-none bg-gray-900/50 border-gray-700 text-gray-300 text-sm placeholder:text-gray-600 pr-12"
                        />
                      </>
                    ) : (
                      <p className="text-gray-600 text-sm">The Image Prompt Will Appear Here</p>
                    )}
                  </div>
                </div>

                {/* BOTTOM SECTION: Use Button */}
                <div className="px-8 pb-8">
                  <button
                    onClick={handleUsePrompt}
                    disabled={!canUsePrompt || !generatedPrompt}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      generatedPrompt && canUsePrompt
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
