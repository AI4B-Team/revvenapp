import { Image, Sparkles, MoreHorizontal, MoreVertical, ChevronDown, User, ChevronRight, Flame, Zap, Video, Dices, Gift, FileText, Loader2, Upload, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import grokLogo from '@/assets/model-logos/grok.png';
import StylesModal from './StylesModal';

interface GenerationInputProps {
  selectedType: string;
  onCharactersClick?: () => void;
  onCharacterSelect?: (character: any) => void;
  selectedCharacter?: any;
  onReferencesClick?: () => void;
  onReferenceSelect?: (reference: any) => void;
  selectedReference?: any;
  isCharacterReference?: boolean;
}

const GenerationInput = ({ selectedType, onCharactersClick, onCharacterSelect, selectedCharacter, onReferencesClick, onReferenceSelect, selectedReference, isCharacterReference }: GenerationInputProps) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [isUploadingMask, setIsUploadingMask] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isStylesModalOpen, setIsStylesModalOpen] = useState(false);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAspectRatioDropdownOpen, setIsAspectRatioDropdownOpen] = useState(false);
  const [isNumberOfImagesDropdownOpen, setIsNumberOfImagesDropdownOpen] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Define models that support image-to-image generation
  const img2imgModels = [
    'auto',
    'flux-pro',
    'flux-max',
    'gpt-4o-image',
    'seedream-4',
    'nano-banana',
    'nano-banana-pro',
    'ideogram-character',
  ];

  const hasImageReference = !!selectedReference || !!selectedCharacter || !!isCharacterReference;
  
  // Define supported aspect ratios for each model
  const modelAspectRatios: Record<string, string[]> = {
    'auto': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'flux-pro': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'flux-max': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'gpt-4o-image': ['1:1', '3:2', '2:3'], // Native support only
    'qwen': ['1:1', '16:9', '9:16', '4:3', '3:4'],
    'seedream-4': ['1:1', '16:9', '9:16', '4:3', '3:2', '21:9'],
    'seedream': ['1:1', '16:9', '9:16', '4:3', '3:4'], // Seedream 3.0: square, square_hd, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9
    'grok': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'nano-banana': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'imagen-ultra': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'ideogram': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'ideogram-character': ['1:1', '16:9', '9:16', '4:3']
  };
  
  // Get available aspect ratios for the selected model
  const availableAspectRatios = modelAspectRatios[selectedModel] || modelAspectRatios['auto'];
  
  // Auto-adjust aspect ratio when model changes if current ratio is not supported
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    const newAvailableRatios = modelAspectRatios[newModel] || modelAspectRatios['auto'];
    if (!newAvailableRatios.includes(selectedAspectRatio)) {
      // Default to 1:1 if current ratio not supported
      setSelectedAspectRatio('1:1');
      toast({
        title: "Aspect ratio adjusted",
        description: `${selectedAspectRatio} is not supported by this model. Switched to 1:1.`,
      });
    }
  };
  
  const isVideoMode = selectedType === 'Video';
  const isAudioMode = selectedType === 'Audio';
  const isDesignMode = selectedType === 'Design';
  const isContentMode = selectedType === 'Content';
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    // Check if Ideogram requires mask when a reference image is used
    if (selectedModel === 'ideogram' && selectedReference && !maskImage) {
      toast({
        title: "Mask required",
        description: "Ideogram Edit requires a mask image. Please upload a mask.",
        variant: "destructive",
      });
      return;
    }

    // Ideogram Character model ALWAYS needs a reference image.
    // Since referenceImage is derived from either the selected character
    // or the manual reference image, enforce that one of them is present
    // before calling the edge function to avoid 500 errors.
    if (selectedModel === 'ideogram-character' && !selectedCharacter && !selectedReference) {
      toast({
        title: "Reference required",
        description: "Ideogram Character needs a character or reference image. Please select one first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("Starting image generation...");
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: prompt.trim(),
          aspectRatio: selectedAspectRatio,
          model: selectedModel,
          numberOfImages: numberOfImages,
          character: selectedCharacter ? {
            id: selectedCharacter.id,
            name: selectedCharacter.name,
            image: selectedCharacter.image_url || selectedCharacter.image
          } : null,
          // Use character image as reference if character is selected, otherwise use direct reference
          referenceImage: selectedCharacter 
            ? (selectedCharacter.image_url || selectedCharacter.image)
            : (selectedReference ? selectedReference.image_url : null),
          characterImage: selectedCharacter ? (selectedCharacter.image_url || selectedCharacter.image) : null,
          maskImage: maskImage
        }
      });

      if (error) throw error;

      toast({
        title: `${numberOfImages} ${numberOfImages === 1 ? 'image' : 'images'} generating!`,
        description: "Your images are being created and will appear in the gallery shortly",
      });

      console.log("Generated image:", data.image);
      
      // Keep prompt in the input field after generation
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = async (fast = false) => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to enhance",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      console.log("Enhancing prompt...");
      
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { 
          prompt: prompt.trim(),
          fast: fast
        }
      });

      if (error) throw error;

      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Prompt enhanced!",
          description: fast ? "Quick enhancement complete" : "Your prompt has been improved with AI",
        });
        console.log("Enhanced prompt:", data.enhancedPrompt);
      }
      
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleReferenceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingReference(true);
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

        toast({
          title: "Success",
          description: "Reference image uploaded successfully",
        });

        // Auto-select the uploaded reference
        if (onReferenceSelect && data?.referenceImage) {
          onReferenceSelect(data.referenceImage);
        }
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading reference:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload reference image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingReference(false);
    }
  };

  const handleMaskUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Mask image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingMask(true);
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

        toast({
          title: "Success",
          description: "Mask image uploaded successfully",
        });

        // Store mask URL
        setMaskImage(data?.referenceImage?.image_url || null);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading mask:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload mask image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMask(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingImage(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const base64Image = e.target?.result as string;
          resolve(base64Image);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;
      
      console.log("Analyzing image with AI...");
      
      const { data, error } = await supabase.functions.invoke('image-to-prompt', {
        body: { 
          imageBase64: base64Image
        }
      });

      if (error) throw error;

      if (data.prompt) {
        setPrompt(data.prompt);
        toast({
          title: "Prompt generated!",
          description: "AI has analyzed your image and created a prompt",
        });
        console.log("Generated prompt from image:", data.prompt);
      }
      
    } catch (error) {
      console.error("Image analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Analysis failed",
        description: errorMessage || "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };
  
  return (
    <div className="w-fit min-w-[768px] max-w-[90vw] mx-auto mb-12 transition-all duration-300">
      <div className="bg-background border-2 border-border rounded-xl p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <div className="flex flex-col items-start gap-2">
                {isVideoMode ? (
                  <button className="bg-muted/50 rounded-lg p-2">
                    <Video size={18} className="text-muted-foreground" />
                  </button>
                ) : isAudioMode ? (
                  <button className="bg-muted/50 rounded-lg p-2">
                    <Sparkles size={18} className="text-muted-foreground" />
                  </button>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition cursor-pointer">
                          {isAnalyzingImage ? (
                            <Loader2 size={18} className="text-muted-foreground animate-spin" />
                          ) : (
                            <Image size={18} className="text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isAnalyzingImage}
                            className="hidden"
                          />
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Image-To-Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => handleEnhancePrompt(false)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={18} className="text-muted-foreground animate-spin" />
                          ) : (
                            <Dices size={18} className="text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Auto Enhance Prompt with AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full text-foreground text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50"
              rows={3}
              placeholder="Describe what you want to create..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-nowrap">
            {isVideoMode ? (
              <>
                {/* Video Mode Controls */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                            <Video size={14} />
                            Veo 3 Fast
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              Veo 3 Fast
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              Veo 3 Standard
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Model</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={onCharactersClick}
                        className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          selectedCharacter 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <User size={14} />
                        {selectedCharacter ? selectedCharacter.name : 'Character'}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{selectedCharacter ? `Selected: ${selectedCharacter.name}` : 'Select Character'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {selectedReference ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap"
                      onClick={() => onReferenceSelect(null)}
                    >
                      <Upload size={14} />
                      Reference Selected
                      <X size={14} />
                    </Button>
                  ) : (
                    <Button
                      onClick={onReferencesClick}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Upload size={14} />
                      References
                    </Button>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            16:9
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-5 h-3 border-2 border-current"></div>
                              16:9 Landscape
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-3 h-5 border-2 border-current"></div>
                              9:16 Portrait
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-current"></div>
                              1:1 Square
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aspect Ratio</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            4 sec
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              4 seconds
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              8 seconds
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              12 seconds
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duration</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            1080p
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              1080p
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              720p
                            </button>
                            <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                              4K
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quality</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition bg-muted/50 rounded-lg p-2">
                        <MoreVertical size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance Prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : isAudioMode ? (
              <>
                {/* Audio Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      Model
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Eleven Turbo v2.5
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Eleven Multilingual v2
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <button 
                  onClick={onCharactersClick}
                  className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap"
                >
                  <User size={14} />
                  Character
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Language
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        English
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Spanish
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        French
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Accent
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        American
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        British
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Australian
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Speed
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Normal
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Fast
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Slow
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Tone
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Neutral
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Friendly
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Professional
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition bg-muted/50 rounded-lg p-2">
                        <MoreVertical size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance Prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : isDesignMode ? (
              <>
                {/* Design Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Nano Banana
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-foreground text-sm">Auto</span>
                              <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">AI picks what's best</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Brochure
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Cover
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Flyer
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Infographic
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Invitation
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Logo
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Poster
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Thumbnail
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Create
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-background border-border z-50 p-2">
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Flame size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-base">Start With A Template</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-base">Build With AI</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-base">Start With A File</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isContentMode ? (
              <>
                {/* Content Mode Controls */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Nano Banana
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-foreground text-sm">Auto</span>
                              <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">AI picks what's best</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Article
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        eBook
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Presentation
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                        Social
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                {/* Image Mode Controls */}
            <Popover open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
              <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      {selectedReference && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mr-1">IMG2IMG</Badge>
                      )}
                      {selectedModel === 'auto' && (
                        <Zap size={14} className="text-brand-blue" />
                      )}
                      {selectedModel === 'grok' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                      {selectedModel === 'gpt-4o-image' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {(selectedModel === 'flux-pro' || selectedModel === 'flux-max') && (
                        <Sparkles size={14} className={selectedModel === 'flux-pro' ? 'text-purple-500' : 'text-indigo-600'} />
                      )}
                      {(selectedModel === 'seedream-4' || selectedModel === 'seedream') && (
                        <div className="w-3.5 h-3.5 bg-gradient-to-br from-brand-red to-brand-yellow rounded flex items-center justify-center">
                          <span className="text-white font-bold text-[8px]">S</span>
                        </div>
                      )}
                      {selectedModel === 'qwen' && (
                        <div className="w-3.5 h-3.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-[8px]">Q</span>
                        </div>
                      )}
                      {selectedModel === 'nano-banana' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {(selectedModel === 'ideogram' || selectedModel === 'ideogram-character') && (
                        <Image size={14} className="text-blue-500" />
                      )}
                      {selectedModel === 'grok' && (
                        <img src="/lovable-uploads/model-logos/grok.png" alt="Grok" className="w-4 h-4" />
                      )}
                      {selectedModel === 'imagen-ultra' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {selectedModel === 'gpt-4o-image' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                      {selectedModel === 'auto' && 'Auto'}
                      {selectedModel === 'grok' && 'Grok Imagine'}
                      {selectedModel === 'gpt-4o-image' && 'GPT-4o Image'}
                      {selectedModel === 'flux-pro' && 'Flux Pro'}
                      {selectedModel === 'flux-max' && 'Flux Max'}
                      {selectedModel === 'seedream-4' && 'Seedream 4.0'}
                      {selectedModel === 'seedream' && 'Seedream 3.0'}
                      {selectedModel === 'qwen' && 'Qwen Image'}
                      {selectedModel === 'nano-banana' && 'Nano Banana'}
                      {selectedModel === 'nano-banana-pro' && 'Nano Banana Pro'}
                      {selectedModel === 'ideogram' && 'Ideogram V3 Edit'}
                      {selectedModel === 'ideogram-character' && 'Ideogram Character'}
                      {selectedModel === 'imagen-ultra' && 'Imagen 4 Ultra'}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0 bg-white border-sidebar-hover z-50 max-h-[400px] overflow-y-auto" align="start">
                <div className="space-y-1 p-2">
                  {(selectedReference || selectedCharacter) && (
                    <div className="px-4 py-2 bg-primary/10 rounded-lg mb-2">
                      <p className="text-xs font-medium text-primary">Image-to-Image Mode Active</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Only models supporting img-to-img are shown</p>
                    </div>
                  )}
                  
                  {/* Auto */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('auto')) && (
                    <button 
                      onClick={() => {
                        handleModelChange('auto');
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-foreground text-sm">Auto</span>
                            <Badge className="bg-brand-green text-primary text-[10px] px-1.5 py-0 h-4">SUGGESTED</Badge>
                            {img2imgModels.includes('auto') && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">AI picks what's best</p>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Flux Pro */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('flux-pro')) && (
                  <button 
                    onClick={() => {
                      handleModelChange('flux-pro');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Flux Pro</span>
                          {img2imgModels.includes('flux-pro') && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Balanced performance and quality</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Flux Max */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('flux-max')) && (
                  <button 
                    onClick={() => {
                      handleModelChange('flux-max');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Flux Max</span>
                          <Badge className="bg-brand-purple text-primary text-[10px] px-1.5 py-0 h-4">PREMIUM</Badge>
                          {img2imgModels.includes('flux-max') && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Enhanced quality for complex scenes</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* GPT-4o Image */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('gpt-4o-image')) && (
                  <button 
                    onClick={() => {
                      handleModelChange('gpt-4o-image');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">GPT-4o Image</span>
                          <Badge className="bg-brand-blue text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                          {img2imgModels.includes('gpt-4o-image') && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">OpenAI's advanced image model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Seedream 4.0 */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('seedream-4')) && (
                  <button
                    onClick={() => {
                      handleModelChange('seedream-4');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Seedream 4.0</span>
                          <Badge className="bg-brand-blue text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">ByteDance's next-gen 2K model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Seedream 3.0 */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('seedream')) && (
                  <button 
                    onClick={() => {
                      handleModelChange('seedream');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Seedream 3.0</span>
                        </div>
                        <p className="text-xs text-muted-foreground">ByteDance's reliable SD model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Qwen Image */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('qwen')) && (
                  <button 
                    onClick={() => {
                      handleModelChange('qwen');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Qwen Image</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Alibaba's multilingual model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('nano-banana')) && (
                  <button
                    onClick={() => {
                      handleModelChange('nano-banana');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Nano Banana</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Gemini 2.5 Flash Image Preview</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('nano-banana-pro')) && (
                  <button
                    onClick={() => {
                      handleModelChange('nano-banana-pro');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Nano Banana Pro</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Advanced Gemini 2.5 Image Model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Ideogram V3 Edit */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('ideogram')) && (
                  <button
                    onClick={() => {
                      handleModelChange('ideogram');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Ideogram V3 Edit</span>
                          {img2imgModels.includes('ideogram') && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Inpainting with mask editing</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Ideogram Character */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('ideogram-character')) && (
                  <button
                    onClick={() => {
                      handleModelChange('ideogram-character');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Ideogram Character</span>
                          {img2imgModels.includes('ideogram-character') && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Character-consistent generation</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Grok Imagine */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('grok')) && (
                  <button
                    onClick={() => {
                      handleModelChange('grok');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img src={grokLogo} alt="Grok" className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Grok Imagine</span>
                        </div>
                        <p className="text-xs text-muted-foreground">X.AI's powerful text-to-image model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Imagen 4 Ultra */}
                  {((!selectedReference && !selectedCharacter) || img2imgModels.includes('imagen-ultra')) && (
                  <button
                    onClick={() => {
                      handleModelChange('imagen-ultra');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Imagen 4 Ultra</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0 h-4">ULTRA</Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Google's most advanced image model</p>
                      </div>
                    </div>
                  </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <button
              onClick={() => setIsStylesModalOpen(true)}
              className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition whitespace-nowrap flex items-center gap-2"
            >
              {selectedStyle ? selectedStyle.name : 'Style'}
            </button>
            
            {selectedCharacter ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap"
                      onClick={() => onCharacterSelect?.(null)}
                    >
                      {selectedCharacter?.image_url && (
                        <img 
                          src={selectedCharacter.image_url} 
                          alt="Character"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      Character Selected
                      <X size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-0 border-0 bg-transparent">
                    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
                      <div className="w-64 h-80 relative">
                        <img 
                          src={selectedCharacter.image_url} 
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 bg-gray-800">
                        <p className="text-white font-semibold text-sm">{selectedCharacter.name}</p>
                        {selectedCharacter.bio && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{selectedCharacter.bio}</p>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button 
                onClick={onCharactersClick}
                className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap"
              >
                <User size={14} />
                Character
              </button>
            )}
            
            {selectedReference ? (
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap"
                onClick={() => onReferenceSelect(null)}
              >
                {selectedReference?.image_url && (
                  <img 
                    src={selectedReference.image_url} 
                    alt="Preview"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                Reference Selected
                <X size={14} />
              </Button>
            ) : (
              <Button
                onClick={onReferencesClick}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Upload size={14} />
                References
              </Button>
            )}
            
            {/* Mask Upload Button - Only show for Ideogram Edit when reference is selected */}
            {selectedModel === 'ideogram' && selectedReference && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={maskImage ? "default" : "secondary"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Upload size={14} />
                    {maskImage ? 'Mask Uploaded' : 'Upload Mask'}
                    <ChevronDown size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-background border-border z-50 p-4">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload a mask image where black areas will be edited and white areas preserved
                    </p>
                    <div className="border-2 border-dashed border-primary/50 bg-muted/20 rounded-lg p-4 text-center hover:border-primary hover:bg-muted/40 transition-colors">
                      <input
                        type="file"
                        id="mask-upload"
                        accept="image/*"
                        onChange={handleMaskUpload}
                        className="hidden"
                        disabled={isUploadingMask}
                      />
                      <label
                        htmlFor="mask-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {isUploadingMask ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <Upload className="h-8 w-8 text-primary" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                          {isUploadingMask ? 'Uploading...' : 'Upload mask image'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </label>
                    </div>
                    
                    {maskImage && (
                      <Button
                        onClick={() => setMaskImage(null)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Clear Mask
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <Popover open={isAspectRatioDropdownOpen} onOpenChange={setIsAspectRatioDropdownOpen}>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                  {selectedAspectRatio}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-background border-border z-50">
                <div className="space-y-1">
                  {availableAspectRatios.includes('1:1') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('1:1');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-current"></div>
                      <span className="flex-1">1:1 Square</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('16:9') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('16:9');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-5 h-3 border-2 border-current"></div>
                      <span className="flex-1">16:9 Landscape</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('9:16') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('9:16');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-3 h-5 border-2 border-current"></div>
                      <span className="flex-1">9:16 Portrait</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('4:3') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('4:3');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-5 h-4 border-2 border-current"></div>
                      <span className="flex-1">4:3 Standard</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('3:4') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('3:4');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-4 h-5 border-2 border-current"></div>
                      <span className="flex-1">3:4 Portrait</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('3:2') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('3:2');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-5 h-3.5 border-2 border-current"></div>
                      <span className="flex-1">3:2 Classic</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('2:3') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('2:3');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-3.5 h-5 border-2 border-current"></div>
                      <span className="flex-1">2:3 Portrait</span>
                    </button>
                  )}
                  {availableAspectRatios.includes('21:9') && (
                    <button 
                      onClick={() => {
                        setSelectedAspectRatio('21:9');
                        setIsAspectRatioDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                    >
                      <div className="w-6 h-3 border-2 border-current"></div>
                      <span className="flex-1">21:9 Ultrawide</span>
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={isNumberOfImagesDropdownOpen} onOpenChange={setIsNumberOfImagesDropdownOpen}>
              <PopoverTrigger asChild>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap">
                  {numberOfImages} {numberOfImages === 1 ? 'Image' : 'Images'}
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-background border-border z-50">
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      setNumberOfImages(1);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    1 Image
                  </button>
                  <button 
                    onClick={() => {
                      setNumberOfImages(2);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    2 Images
                  </button>
                  <button 
                    onClick={() => {
                      setNumberOfImages(3);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    3 Images
                  </button>
                  <button 
                    onClick={() => {
                      setNumberOfImages(4);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    4 Images
                  </button>
                  <button 
                    onClick={() => {
                      setNumberOfImages(5);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    5 Images
                  </button>
                  <button 
                    onClick={() => {
                      setNumberOfImages(6);
                      setIsNumberOfImagesDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                  >
                    6 Images
                  </button>
                </div>
              </PopoverContent>
            </Popover>
                <button className="text-muted-foreground hover:text-foreground transition bg-muted rounded-lg p-2">
                  <MoreVertical size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 ml-12">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        disabled={isEnhancing || !prompt.trim()}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium flex items-center gap-2 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnhancing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        AI
                        <ChevronDown size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 bg-background border-border z-50">
                      <div className="space-y-1">
                        <button 
                          onClick={() => handleEnhancePrompt(true)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-brand-yellow" />
                            <div>
                              <div className="font-medium">Fast Enhance</div>
                              <div className="text-xs text-muted-foreground">Quick improvement</div>
                            </div>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleEnhancePrompt(false)}
                          disabled={isEnhancing || !prompt.trim()}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-brand-purple" />
                            <div>
                              <div className="font-medium">Deep Enhance</div>
                              <div className="text-xs text-muted-foreground">Detailed refinement</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enhance Prompt with AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="px-6 py-2.5 bg-brand-green hover:opacity-90 text-primary rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate For Free!"
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-brand-green rounded flex items-center justify-center flex-shrink-0">
                      <Gift size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-2">Generate FREE: 5 Images, 1 Video</p>
                      <p className="text-xs leading-relaxed">
                        Create for FREE today!<br />
                        Design your first AI images at no cost,<br />
                        and instantly transform them into video.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Styles Modal */}
      <StylesModal
        isOpen={isStylesModalOpen}
        onClose={() => setIsStylesModalOpen(false)}
        onSelectStyle={(style) => {
          setSelectedStyle(style);
          setIsStylesModalOpen(false);
        }}
        selectedStyle={selectedStyle}
      />
    </div>
  );
};

export default GenerationInput;
