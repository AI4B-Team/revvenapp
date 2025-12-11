import { Image, Sparkles, MoreHorizontal, MoreVertical, ChevronDown, User, ChevronRight, Flame, Zap, Video, Gift, FileText, Loader2, Upload, X, Shuffle, Share2, Check, Calendar, LayoutList, Play, Pencil, MessageCircle, Film, RefreshCw, Presentation, BookOpen, Mic, Bot, AudioLines, Heart, Package, Clapperboard, Captions, RatioIcon } from 'lucide-react';
import UGCCharacterBox from './UGCCharacterBox';
import AudioUploadModal from './AudioUploadModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useResizableTextarea } from '@/hooks/useResizableTextarea';
import ResizeHandle from '@/components/ui/ResizeHandle';
import grokLogo from '@/assets/model-logos/grok.png';
import StylesModal from './StylesModal';
import { ImageToPromptModal } from './ImageToPromptModal';
import VideoFrameBoxes from './VideoFrameBoxes';
import { socialPlatforms, getPlatformIcon } from './SocialIcons';
import SocialContentCalendar from './SocialContentCalendar';

interface GenerationInputProps {
  selectedType: string;
  onCharactersClick?: () => void;
  onCharactersSelect?: (characters: any[]) => void;
  selectedCharacters?: any[];
  onReferencesClick?: () => void;
  onReferencesSelect?: (references: any[]) => void;
  selectedReferences?: any[];
  isCharacterReference?: boolean;
  onGenerationStart?: () => void;
  externalStartingFrame?: { preview: string; name: string } | null;
  onContentTypeChange?: (type: string) => void;
  onSocialGenerate?: (platforms: string[], prompt: string) => void;
}

// Separate state containers for each content type
interface ImageModeState {
  characters: any[];
  references: any[];
}

interface VideoModeState {
  characters: any[];
  references: any[];
  startingFrame: { preview: string; name: string } | null;
  endingFrame: { preview: string; name: string } | null;
}

interface AudioModeState {
  // Audio-specific state can be added here
}

interface DesignModeState {
  // Design-specific state can be added here
}

const GenerationInput = ({ selectedType, onCharactersClick, onCharactersSelect, selectedCharacters = [], onReferencesClick, onReferencesSelect, selectedReferences = [], isCharacterReference, onGenerationStart, externalStartingFrame, onContentTypeChange, onSocialGenerate }: GenerationInputProps) => {
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
  const [isImageToPromptModalOpen, setIsImageToPromptModalOpen] = useState(false);
  
  // Social content mode state
  const [showSocialButtons, setShowSocialButtons] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentType, setContentType] = useState('Social');
  const [contentGoal, setContentGoal] = useState('Engagement');
  const [contentLanguage, setContentLanguage] = useState('English');
  const [contentTabView, setContentTabView] = useState<'calendar' | 'plan'>('calendar');
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
  // Animate mode dropdown state (Video)
  const [selectedAnimateMode, setSelectedAnimateMode] = useState('Animate');
  const [isAnimateModeDropdownOpen, setIsAnimateModeDropdownOpen] = useState(false);
  
  // Create mode dropdown state (Image)
  const [selectedCreateMode, setSelectedCreateMode] = useState('Create');
  const [isCreateModeDropdownOpen, setIsCreateModeDropdownOpen] = useState(false);
  
  // UGC mode selected button state
  const [selectedUGCButton, setSelectedUGCButton] = useState<string | null>(null);
  
  // UGC separate text fields for script and scene
  const [ugcScriptText, setUgcScriptText] = useState('');
  const [ugcSceneText, setUgcSceneText] = useState('');
  
  // UGC audio URL for speech-to-video generation (optional - backend can auto-generate)
  const [ugcAudioUrl, setUgcAudioUrl] = useState<string | null>(null);
  
  // UGC voice settings for auto-generation
  const [ugcVoiceSettings, setUgcVoiceSettings] = useState<{ voice: string; stability: number; similarity_boost: number; style: number; speed: number; use_speaker_boost: boolean } | null>(null);
  
  // UGC model selection (Wan Avatar or Kling Avatar)
  const [ugcModel, setUgcModel] = useState<'wan-speech-to-video' | 'kling-ai-avatar'>('wan-speech-to-video');
  
  // Audio upload modal state
  const [isAudioUploadModalOpen, setIsAudioUploadModalOpen] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<{ name: string; duration: number; url: string; type: 'uploaded' | 'recorded' } | null>(null);
  
  const animateModes = [
    { value: 'Animate', label: 'Animate', icon: Play },
    { value: 'Draw', label: 'Draw', icon: Pencil },
    { value: 'Talking', label: 'Talking', icon: MessageCircle },
    { value: 'UGC', label: 'UGC', icon: Video },
    { value: 'Recast', label: 'Recast', icon: RefreshCw },
    { value: 'VSL', label: 'VSL', icon: Film },
    { value: 'Story', label: 'Story', icon: BookOpen },
    { value: 'Podcast', label: 'Podcast', icon: Mic },
    { value: 'Presentation', label: 'Presentation', icon: Presentation },
  ];
  
  const createModes = [
    { value: 'Create', label: 'Create', icon: Sparkles },
    { value: 'Draw', label: 'Draw', icon: Pencil },
    { value: 'Swap', label: 'Swap', icon: RefreshCw },
    { value: 'Photoshoot', label: 'Photoshoot', icon: Image },
  ];
  
  // Resizable prompt box (both directions)
  const { height: promptHeight, width: promptWidth, isResizing, handleResizeStart } = useResizableTextarea({
    minHeight: 80,
    maxHeight: 400,
    initialHeight: 100,
    minWidth: 1100,
    maxWidth: 1600,
    resizeDirection: 'both',
  });
  
  // Isolated state for each content type
  const [imageModeState, setImageModeState] = useState<ImageModeState>({
    characters: [],
    references: []
  });
  
  const [videoModeState, setVideoModeState] = useState<VideoModeState>({
    characters: [],
    references: [],
    startingFrame: null,
    endingFrame: null
  });
  
  const [audioModeState, setAudioModeState] = useState<AudioModeState>({});
  const [designModeState, setDesignModeState] = useState<DesignModeState>({});
  
  // Video mode specific state
  const [videoModel, setVideoModel] = useState('veo3_fast');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState('10');
  const [videoQuality, setVideoQuality] = useState('1080p');
  
  // Video model options
  const videoModels = [
    { value: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation' },
    { value: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output' },
    { value: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard (no people photos)' },
    { value: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people' },
    { value: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo' },
    { value: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video (800 char limit)' },
    { value: 'wan-2.2', label: 'Wan 2.2', description: 'Text or image-to-video, turbo' },
    { value: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'Image-to-video, high quality' },
    { value: 'bytedance-v1', label: 'Bytedance V1', description: 'Image-to-video, fast' },
  ];
  
  const { toast } = useToast();
  
  // Define models that support image-to-image generation
  const img2imgModels = [
    'auto',
    'flux-pro',
    'flux-max',
    'gpt-4o-image',
    'seedream-4',
    'seedream-4.5',
    'nano-banana',
    'nano-banana-pro',
    'ideogram-character',
  ];

  const hasImageReference = selectedReferences.length > 0 || selectedCharacters.length > 0 || !!isCharacterReference;
  
  // Define supported aspect ratios for each model
  const modelAspectRatios: Record<string, string[]> = {
    'auto': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'flux-pro': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'flux-max': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'gpt-4o-image': ['1:1', '3:2', '2:3'], // Native support only
    'qwen': ['1:1', '16:9', '9:16', '4:3', '3:4'],
    'seedream-4': ['1:1', '16:9', '9:16', '4:3', '3:2', '21:9'],
    'seedream-4.5': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'seedream': ['1:1', '16:9', '9:16', '4:3', '3:4'], // Seedream 3.0: square, square_hd, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9
    'grok': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'nano-banana': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
    'nano-banana-pro': ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'],
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
  const isAppsMode = selectedType === 'Apps';
  const isDocumentMode = selectedType === 'Document';
  
  // Get current state based on content type
  const getCurrentCharacters = () => {
    if (isVideoMode) return videoModeState.characters;
    return imageModeState.characters;
  };
  
  const getCurrentReferences = () => {
    if (isVideoMode) return videoModeState.references;
    return imageModeState.references;
  };
  
  // Use isolated state instead of props when in specific modes
  const activeCharacters = isVideoMode ? videoModeState.characters : (isAudioMode || isDesignMode || isContentMode || isAppsMode || isDocumentMode ? [] : selectedCharacters);
  const activeReferences = isVideoMode ? videoModeState.references : (isAudioMode || isDesignMode || isContentMode || isAppsMode || isDocumentMode ? [] : selectedReferences);
  
  // Determine if we should show character and reference displays
  const shouldHideCharacterAndReference = isDesignMode || isContentMode || isAppsMode || isDocumentMode;
  const shouldShowCharacters = !shouldHideCharacterAndReference && !isVideoMode;
  const shouldShowReferences = !shouldHideCharacterAndReference && !isVideoMode && !isAudioMode;

  // Sync external props to image mode state only when in image mode
  useEffect(() => {
    if (!isVideoMode && !isAudioMode && !isDesignMode && !isContentMode && !isAppsMode && !isDocumentMode) {
      setImageModeState({
        characters: selectedCharacters,
        references: selectedReferences
      });
    }
  }, [selectedCharacters, selectedReferences, isVideoMode, isAudioMode, isDesignMode, isContentMode, isAppsMode, isDocumentMode]);

  // Reset animate mode to 'Animate' when entering video mode
  useEffect(() => {
    if (isVideoMode) {
      setSelectedAnimateMode('Animate');
    }
  }, [isVideoMode]);

  // Auto-select valid model when entering Swap, Photoshoot, or Draw mode
  useEffect(() => {
    // Swap mode: allows nano-banana-pro and seedream-4
    // Photoshoot mode: only allows nano-banana-pro
    // Draw mode: allows nano-banana-pro, nano-banana, seedream-4, seedream-4.5
    const drawModeModels = ['nano-banana-pro', 'nano-banana', 'seedream-4', 'seedream-4.5'];
    if (selectedCreateMode === 'Swap' && !['nano-banana-pro', 'seedream-4'].includes(selectedModel)) {
      setSelectedModel('nano-banana-pro');
    } else if (selectedCreateMode === 'Photoshoot' && selectedModel !== 'nano-banana-pro') {
      setSelectedModel('nano-banana-pro');
    } else if (selectedCreateMode === 'Draw' && !drawModeModels.includes(selectedModel)) {
      setSelectedModel('nano-banana-pro');
    }
  }, [selectedCreateMode]);

  // Handle external starting frame (e.g., from Animate button in modal)
  // Use a ref to track external frame so it persists across other useEffect resets
  const externalFrameRef = useRef<{ preview: string; name: string } | null>(null);
  
  // Track if we've already processed this external frame
  const processedExternalFrameRef = useRef<string | null>(null);
  
  useEffect(() => {
    console.log('External frame effect:', { 
      externalStartingFrame, 
      isVideoMode, 
      alreadyProcessed: processedExternalFrameRef.current,
      selectedType 
    });
    
    // Only process if we have an external frame, we're in video mode, and we haven't already processed this frame
    if (externalStartingFrame && isVideoMode && processedExternalFrameRef.current !== externalStartingFrame.preview) {
      console.log('Processing external frame:', externalStartingFrame);
      processedExternalFrameRef.current = externalStartingFrame.preview;
      externalFrameRef.current = externalStartingFrame;
      setVideoModeState(prev => {
        console.log('Setting videoModeState, prev:', prev);
        // If start frame already has an image, put new one in end frame
        if (prev.startingFrame) {
          return {
            ...prev,
            endingFrame: externalStartingFrame
          };
        }
        // Otherwise put in start frame
        return {
          ...prev,
          startingFrame: externalStartingFrame
        };
      });
    }
  }, [externalStartingFrame, isVideoMode, selectedType]);
  
  // Video mode: Track which frame to populate next
  const framePopulateIntentRef = useRef<'start' | 'end' | null>(null);
  
  useEffect(() => {
    if (!isVideoMode) return;
    
    const totalImages = selectedCharacters.length + selectedReferences.length;
    
    setVideoModeState(prev => {
      // If all images removed, clear everything UNLESS there's an external frame
      if (totalImages === 0) {
        framePopulateIntentRef.current = null;
        // Preserve external starting frame if set
        if (externalFrameRef.current) {
          return {
            characters: [],
            references: [],
            startingFrame: externalFrameRef.current,
            endingFrame: null
          };
        }
        return {
          characters: [],
          references: [],
          startingFrame: null,
          endingFrame: null
        };
      }
      
      // Auto-populate frames based on intent or if both are empty
      if (!prev.startingFrame && !prev.endingFrame) {
        // Initial population - both frames empty
        if (totalImages === 1) {
          const firstImage = selectedCharacters[0] || selectedReferences[0];
          const imageUrl = firstImage.image_url || firstImage.image || firstImage.thumbnail_url || firstImage.preview;
          const imageName = firstImage.name || firstImage.original_filename || 'image.jpg';
          
          framePopulateIntentRef.current = null;
          return {
            characters: selectedCharacters,
            references: selectedReferences,
            startingFrame: { preview: imageUrl, name: imageName },
            endingFrame: null
          };
        } else {
          const firstImage = selectedCharacters[0] || selectedReferences[0];
          const secondImage = selectedCharacters[1] || (selectedCharacters.length === 1 ? selectedReferences[0] : selectedReferences[1]);
          
          const firstUrl = firstImage.image_url || firstImage.image || firstImage.thumbnail_url || firstImage.preview;
          const firstName = firstImage.name || firstImage.original_filename || 'image.jpg';
          const secondUrl = secondImage?.image_url || secondImage?.image || secondImage?.thumbnail_url || secondImage?.preview;
          const secondName = secondImage?.name || secondImage?.original_filename || 'image.jpg';
          
          framePopulateIntentRef.current = null;
          return {
            characters: selectedCharacters,
            references: selectedReferences,
            startingFrame: { preview: firstUrl, name: firstName },
            endingFrame: secondUrl ? { preview: secondUrl, name: secondName } : null
          };
        }
      }
      
      // Populate specific frame based on intent
      if (framePopulateIntentRef.current === 'end' && !prev.endingFrame && totalImages > 0) {
        const allImages = [...selectedCharacters, ...selectedReferences];
        // Find an image that's not already used in the start frame
        let imageToUse = allImages[allImages.length - 1]; // Default to latest
        
        if (prev.startingFrame) {
          const differentImage = allImages.find(img => {
            const imgUrl = img.image_url || img.image || img.thumbnail_url || img.preview;
            return imgUrl !== prev.startingFrame?.preview;
          });
          if (differentImage) {
            imageToUse = differentImage;
          }
        }
        
        const imageUrl = imageToUse.image_url || imageToUse.image || imageToUse.thumbnail_url || imageToUse.preview;
        const imageName = imageToUse.name || imageToUse.original_filename || 'image.jpg';
        framePopulateIntentRef.current = null;
        return {
          ...prev,
          characters: selectedCharacters,
          references: selectedReferences,
          endingFrame: { preview: imageUrl, name: imageName }
        };
      }
      
      if (framePopulateIntentRef.current === 'start' && !prev.startingFrame && totalImages > 0) {
        const allImages = [...selectedCharacters, ...selectedReferences];
        // Find an image that's not already used in the end frame
        let imageToUse = allImages[allImages.length - 1]; // Default to latest
        
        if (prev.endingFrame) {
          const differentImage = allImages.find(img => {
            const imgUrl = img.image_url || img.image || img.thumbnail_url || img.preview;
            return imgUrl !== prev.endingFrame?.preview;
          });
          if (differentImage) {
            imageToUse = differentImage;
          }
        }
        
        const imageUrl = imageToUse.image_url || imageToUse.image || imageToUse.thumbnail_url || imageToUse.preview;
        const imageName = imageToUse.name || imageToUse.original_filename || 'image.jpg';
        framePopulateIntentRef.current = null;
        return {
          ...prev,
          characters: selectedCharacters,
          references: selectedReferences,
          startingFrame: { preview: imageUrl, name: imageName }
        };
      }
      
      // Just update arrays without touching frames
      return {
        ...prev,
        characters: selectedCharacters,
        references: selectedReferences
      };
    });
  }, [isVideoMode, selectedCharacters, selectedReferences]);
  
  const handleGenerate = async () => {
    // Handle social content generation
    if (isContentMode && showSocialButtons) {
      if (selectedPlatforms.length === 0) {
        toast({
          title: "Platforms required",
          description: "Please select at least one social platform",
          variant: "destructive",
        });
        return;
      }
      if (!prompt.trim()) {
        toast({
          title: "Prompt required",
          description: "Please describe the theme or topic for your content plan",
          variant: "destructive",
        });
        return;
      }
      // Call the social generate callback
      onSocialGenerate?.(selectedPlatforms, prompt.trim());
      return;
    }

    // In UGC mode, check ugcScriptText; otherwise check prompt
    const effectivePrompt = (isVideoMode && selectedAnimateMode === 'UGC') ? ugcScriptText : prompt;
    if (!effectivePrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    // Use active state based on content type
    const currentCharacters = isVideoMode ? videoModeState.characters : activeCharacters;
    const currentReferences = isVideoMode ? videoModeState.references : activeReferences;

    // VIDEO MODE: Generate video using Veo 3.1
    if (isVideoMode) {
      setIsGenerating(true);
      onGenerationStart?.();
      
      try {
        // Check if UGC mode requires audio
        // UGC mode requires character and script
        if (selectedAnimateMode === 'UGC') {
          if (!currentCharacters.length) {
            toast({
              title: "Character required",
              description: "Please select a character for your UGC video",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          if (!ugcScriptText.trim()) {
            toast({
              title: "Script required",
              description: "Please write what you want your character to say",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
        }
        
        console.log("Starting video generation...");
        
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Collect image URLs from characters, references, and frames
        const imageUrls: string[] = [];
        
        // Add character images
        currentCharacters.forEach(char => {
          const imgUrl = char.image_url || char.image;
          if (imgUrl) imageUrls.push(imgUrl);
        });
        
        // Add reference images
        currentReferences.forEach(ref => {
          const imgUrl = ref.image_url || ref.thumbnail_url;
          if (imgUrl) imageUrls.push(imgUrl);
        });
        
        // Add frame images in order (start, then end)
        if (videoModeState.startingFrame?.preview) {
          imageUrls.push(videoModeState.startingFrame.preview);
        }
        if (videoModeState.endingFrame?.preview) {
          imageUrls.push(videoModeState.endingFrame.preview);
        }

        const primaryCharacter = currentCharacters.length > 0 ? currentCharacters[0] : null;
        
        // Use selected UGC model for UGC mode
        const effectiveModel = selectedAnimateMode === 'UGC' ? ugcModel : videoModel;

        // Build request body
        const requestBody: any = { 
          prompt: selectedAnimateMode === 'UGC' ? ugcScriptText.trim() : prompt.trim(),
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          model: effectiveModel,
          aspectRatio: videoAspectRatio,
          duration: videoDuration,
          userId: user.id,
          characterId: primaryCharacter?.id || null,
          characterName: primaryCharacter?.name || 'Unknown',
          characterBio: primaryCharacter?.bio || '',
          characterImageUrl: primaryCharacter?.image_url || primaryCharacter?.image || ''
        };

        // For UGC mode, pass voice settings for auto-generation (or use existing audioUrl if preview was generated)
        if (selectedAnimateMode === 'UGC') {
          if (ugcAudioUrl) {
            // Use pre-generated audio if available
            requestBody.audioUrl = ugcAudioUrl;
          } else if (ugcVoiceSettings) {
            // Pass voice settings for backend to generate audio
            requestBody.voiceSettings = {
              ...ugcVoiceSettings,
              text: ugcScriptText.trim()
            };
          }
        }

        const { data, error } = await supabase.functions.invoke('generate-veo-video', {
          body: requestBody
        });

        if (error) throw error;

        toast({
          title: "Video generating!",
          description: `Your ${selectedAnimateMode === 'UGC' ? 'UGC' : ''} video is being created with ${ugcModel === 'kling-ai-avatar' ? 'Kling Avatar' : 'Wan Avatar'}. This may take a few minutes.`,
        });

        console.log("Video generation started:", data);
        
        // Clear UGC state after successful generation
        if (selectedAnimateMode === 'UGC') {
          setUgcAudioUrl(null);
        }
      } catch (error) {
        console.error("Video generation error:", error);
        toast({
          title: "Generation failed",
          description: error.message || "Failed to generate video",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // IMAGE MODE: Generate image (existing logic)
    // Check if Ideogram requires mask when a reference image is used
    if (selectedModel === 'ideogram' && currentReferences.length > 0 && !maskImage) {
      toast({
        title: "Mask required",
        description: "Ideogram Edit requires a mask image. Please upload a mask.",
        variant: "destructive",
      });
      return;
    }

    // Ideogram Character model ALWAYS needs a reference image.
    if (selectedModel === 'ideogram-character' && currentCharacters.length === 0 && currentReferences.length === 0) {
      toast({
        title: "Reference required",
        description: "Ideogram Character needs a character or reference image. Please select one first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    onGenerationStart?.();
    
    try {
      console.log("Starting image generation...");
      
      // Use first character if multiple are selected
      const primaryCharacter = currentCharacters.length > 0 ? currentCharacters[0] : null;
      
      // Build reference images array from all selected references
      const referenceImageUrls = currentReferences
        .map(ref => ref.image_url || ref.thumbnail_url || ref.url || ref.preview)
        .filter(Boolean) as string[];
      
      // Combine character images + reference images into single array
      const characterImageUrls = currentCharacters
        .map(char => char.image_url || char.image)
        .filter(Boolean) as string[];
      
      const allReferenceImages = [...characterImageUrls, ...referenceImageUrls];
      
      console.log('Reference images for generation:', allReferenceImages.length, allReferenceImages);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: prompt.trim(),
          aspectRatio: selectedAspectRatio,
          model: selectedModel,
          numberOfImages: numberOfImages,
          character: primaryCharacter ? {
            id: primaryCharacter.id,
            name: primaryCharacter.name,
            image: primaryCharacter.image_url || primaryCharacter.image
          } : null,
          // Pass combined character + reference images as array
          referenceImages: allReferenceImages,
          // Keep single referenceImage for backward compatibility (first image from combined array)
          referenceImage: allReferenceImages.length > 0 ? allReferenceImages[0] : null,
          characterImage: primaryCharacter ? (primaryCharacter.image_url || primaryCharacter.image) : null,
          maskImage: maskImage
        }
      });

      if (error) throw error;

      toast({
        title: `${numberOfImages} ${numberOfImages === 1 ? 'image' : 'images'} generating!`,
        description: "Your images are being created and will appear in the gallery shortly",
      });

      console.log("Generated image:", data.image);
      
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

  const handleAutoPrompt = async () => {
    setIsEnhancing(true);
    try {
      // Get active characters and references based on content type
      const currentCharacters = isVideoMode ? videoModeState.characters : activeCharacters;
      const currentReferences = isVideoMode ? videoModeState.references : activeReferences;
      
      // Collect character and reference image URLs
      const characterImages = currentCharacters.map(char => char.image_url || char.image).filter(Boolean);
      const referenceImages = currentReferences.map(ref => ref.image_url || ref.url || ref.preview).filter(Boolean);

      // If in video mode, also include frame images
      if (isVideoMode) {
        if (videoModeState.startingFrame?.preview) {
          referenceImages.push(videoModeState.startingFrame.preview);
        }
        if (videoModeState.endingFrame?.preview) {
          referenceImages.push(videoModeState.endingFrame.preview);
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-prompt-suggestion', {
        body: { 
          contentType: selectedType,
          characterImages,
          referenceImages
        }
      });

      if (error) throw error;
      if (data?.suggestion) {
        setPrompt(data.suggestion);
        const hasImages = characterImages.length > 0 || referenceImages.length > 0;
        toast({
          title: "Prompt generated",
          description: hasImages 
            ? "A creative prompt based on your selected images has been generated."
            : "A creative prompt has been generated for you.",
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
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
        if (onReferencesSelect && data?.referenceImage) {
          onReferencesSelect([data.referenceImage]);
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
                  selectedAnimateMode === 'UGC' ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={handleAutoPrompt}
                            disabled={isEnhancing}
                            className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isEnhancing ? (
                              <Loader2 size={18} className="text-muted-foreground animate-spin" />
                            ) : (
                              <Shuffle size={18} className="text-muted-foreground" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-black">
                          <p>Auto Prompt</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition">
                            <Bot size={18} className="text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-black">
                          <p>Script Agent</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => setIsAudioUploadModalOpen(true)}
                            className={`rounded-lg p-2 transition ${
                              uploadedAudio 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <AudioLines size={18} className={uploadedAudio ? 'text-white' : 'text-muted-foreground'} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-black">
                          <p>Upload Audio</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <button className="bg-muted/50 rounded-lg p-2">
                        <Video size={18} className="text-muted-foreground" />
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={handleAutoPrompt}
                            disabled={isEnhancing}
                            className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isEnhancing ? (
                              <Loader2 size={18} className="text-muted-foreground animate-spin" />
                            ) : (
                              <Shuffle size={18} className="text-muted-foreground" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-black">
                          <p>Auto Prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )
                ) : isAudioMode ? (
                  <button className="bg-muted/50 rounded-lg p-2">
                    <Sparkles size={18} className="text-muted-foreground" />
                  </button>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setIsImageToPromptModalOpen(true)}
                          className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition"
                        >
                          <Image size={18} className="text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black">
                        <p>Image-To-Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={18} className="text-muted-foreground animate-spin" />
                          ) : (
                            <Shuffle size={18} className="text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1 relative" style={{ height: promptHeight, ...(promptWidth && { width: promptWidth }) }}>
            <textarea 
              value={isVideoMode && selectedAnimateMode === 'UGC' ? (selectedUGCButton === 'Scene' ? ugcSceneText : ugcScriptText) : prompt}
              onChange={(e) => {
                if (isVideoMode && selectedAnimateMode === 'UGC') {
                  if (selectedUGCButton === 'Scene') {
                    setUgcSceneText(e.target.value);
                  } else {
                    setUgcScriptText(e.target.value);
                  }
                } else {
                  setPrompt(e.target.value);
                }
              }}
              disabled={isGenerating}
              className="w-full h-full text-foreground text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50 pr-8"
              placeholder={isContentMode ? "Describe the theme or topic for your content plan..." : (isVideoMode && selectedAnimateMode === 'UGC') ? (selectedUGCButton === 'Scene' ? 'Describe the scene (e.g., "Unboxing a package on the couch")' : 'Write what you want your character to say...(e.g., "Hey there! This product changed my life!")') : "Describe what you want to create..."}
            />
            <ResizeHandle 
              onResizeStart={handleResizeStart} 
              isResizing={isResizing}
              variant="subtle"
            />
            {isResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
          </div>
        </div>

        {/* UGC Character Box - Show only in UGC mode when a character is selected */}
        {isVideoMode && selectedAnimateMode === 'UGC' && videoModeState.characters.length > 0 && (
          <UGCCharacterBox
            character={videoModeState.characters[0]}
            script={ugcScriptText}
            onDelete={() => {
              onCharactersSelect?.([]);
              setUgcAudioUrl(null);
              setUgcVoiceSettings(null);
            }}
            onAudioGenerated={(audioUrl) => {
              setUgcAudioUrl(audioUrl);
              toast({
                title: "Audio preview ready",
                description: "Voice preview generated. Click Generate to create your UGC video.",
              });
            }}
            onVoiceSettingsChange={(settings) => {
              setUgcVoiceSettings(settings);
            }}
          />
        )}

        {/* Character & Reference Images Display - Hidden in video mode and certain content types */}
        {(shouldShowCharacters && activeCharacters.length > 0) || (shouldShowReferences && activeReferences.length > 0) || shouldShowReferences ? (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            {/* Character Images */}
            {shouldShowCharacters && activeCharacters.map((character, index) => (
              <div key={`character-${index}`} className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                  <img 
                    src={character.image_url || character.image} 
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    const updatedCharacters = activeCharacters.filter((_, i) => i !== index);
                    onCharactersSelect?.(updatedCharacters);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-center mt-1 text-muted-foreground truncate max-w-[128px]">
                  {character.name}
                </p>
              </div>
            ))}

            {/* Reference Images */}
            {shouldShowReferences && activeReferences.map((reference, index) => (
              <div key={reference.id} className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                  <img 
                    src={reference.image_url || reference.thumbnail_url || reference.preview} 
                    alt={reference.original_filename || reference.name || "Reference"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    const updatedReferences = activeReferences.filter((_, i) => i !== index);
                    onReferencesSelect?.(updatedReferences);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-center mt-1 text-muted-foreground truncate max-w-[128px]">
                  @pic{index + 1}
                </p>
              </div>
            ))}
            
            {/* Add Reference Image Button - Show only when character or reference is already selected */}
            {shouldShowReferences && (activeCharacters.length > 0 || activeReferences.length > 0) && (
              <div className="relative group">
                <button
                  onClick={onReferencesClick}
                  className="w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition">
                    <Upload size={20} className="text-muted-foreground group-hover:text-primary transition" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition font-medium">
                    Add Image
                  </span>
                </button>
                <p className="text-xs text-center mt-1 text-muted-foreground truncate max-w-[128px] opacity-0">
                  .
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Video Animation Frames - Show only when frames exist, hidden in UGC mode when character is selected */}
        {isVideoMode && (videoModeState.startingFrame || videoModeState.endingFrame) && !(selectedAnimateMode === 'UGC' && videoModeState.characters.length > 0) && (
          <div className="mb-6 mt-6">
            <VideoFrameBoxes
              startingFrame={videoModeState.startingFrame}
              endingFrame={videoModeState.endingFrame}
              onStartingFrameChange={(frame) => {
                if (!frame) {
                  // Clearing start frame - also clear external frame ref and from parent if it matches
                  externalFrameRef.current = null;
                  const updatedChars = videoModeState.characters.slice(1);
                  const updatedRefs = videoModeState.references.length > 0 && videoModeState.characters.length === 0 
                    ? videoModeState.references.slice(1) 
                    : videoModeState.references;
                  onCharactersSelect?.(updatedChars);
                  onReferencesSelect?.(updatedRefs);
                }
                setVideoModeState(prev => ({ ...prev, startingFrame: frame }));
              }}
              onEndingFrameChange={(frame) => {
                if (!frame) {
                  // Clearing end frame - remove the second item
                  const updatedChars = videoModeState.characters.length > 1 
                    ? videoModeState.characters.slice(0, 1)
                    : videoModeState.characters;
                  const updatedRefs = videoModeState.characters.length <= 1 && videoModeState.references.length > 0
                    ? []
                    : videoModeState.references;
                  onCharactersSelect?.(updatedChars);
                  onReferencesSelect?.(updatedRefs);
                }
                setVideoModeState(prev => ({ ...prev, endingFrame: frame }));
              }}
              onSwap={() => {
                setVideoModeState(prev => {
                  // Handle all swap cases in a single state update
                  if (prev.startingFrame && prev.endingFrame) {
                    // Both exist, swap them
                    return {
                      ...prev,
                      startingFrame: prev.endingFrame,
                      endingFrame: prev.startingFrame
                    };
                  } else if (prev.startingFrame && !prev.endingFrame) {
                    // Only start frame exists, move to end frame
                    return {
                      ...prev,
                      startingFrame: null,
                      endingFrame: prev.startingFrame
                    };
                  } else if (!prev.startingFrame && prev.endingFrame) {
                    // Only end frame exists, move to start frame
                    return {
                      ...prev,
                      startingFrame: prev.endingFrame,
                      endingFrame: null
                    };
                  }
                  return prev;
                });
              }}
              onStartingFrameUploadClick={() => {
                framePopulateIntentRef.current = 'start';
                onReferencesClick?.();
              }}
              onEndingFrameUploadClick={() => {
                framePopulateIntentRef.current = 'end';
                onReferencesClick?.();
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-nowrap">
            {isVideoMode ? (
              <>
                {/* Video Mode Controls */}
                <TooltipProvider>
                  {/* Animate Mode Dropdown */}
                  <Popover open={isAnimateModeDropdownOpen} onOpenChange={setIsAnimateModeDropdownOpen}>
                    <PopoverTrigger asChild>
                      <button className="px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white">
                        {(() => {
                          const mode = animateModes.find(m => m.value === selectedAnimateMode);
                          const IconComponent = mode?.icon || Play;
                          return <IconComponent size={14} />;
                        })()}
                        {selectedAnimateMode}
                        <ChevronDown size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-2 bg-background border-border z-50" align="start">
                      <div className="space-y-1">
                        {animateModes.map((mode) => {
                          const IconComponent = mode.icon;
                          return (
                            <button
                              key={mode.value}
                              onClick={() => {
                                setSelectedAnimateMode(mode.value);
                                setIsAnimateModeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition flex items-center gap-2 ${
                                selectedAnimateMode === mode.value ? 'bg-secondary' : ''
                              }`}
                            >
                              <IconComponent size={16} />
                              {mode.label}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {selectedAnimateMode === 'UGC' ? (
                    <>
                      {/* UGC Mode Controls - Model dropdown for Wan/Kling Avatar */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                            <Video size={14} />
                            {ugcModel === 'kling-ai-avatar' ? 'Kling Avatar' : 'Wan Avatar'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setUgcModel('wan-speech-to-video')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                ugcModel === 'wan-speech-to-video' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium">Wan Avatar</div>
                              <div className="text-xs text-muted-foreground">Speech-to-video with lip sync</div>
                            </button>
                            <button 
                              onClick={() => setUgcModel('kling-ai-avatar')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                ugcModel === 'kling-ai-avatar' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium flex items-center gap-2">
                                Kling Avatar
                                <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">Pro avatar with audio sync</div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                        <Film size={14} />
                        Style
                      </button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => onCharactersClick?.()}
                            className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                          >
                            <User size={14} />
                            Character
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select Character</p>
                        </TooltipContent>
                      </Tooltip>

                      <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                        <Heart size={14} />
                        Emotion
                      </button>

                      <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                        <Package size={14} />
                        Product
                      </button>

                      <button 
                        onClick={() => setSelectedUGCButton(selectedUGCButton === 'Scene' ? null : 'Scene')}
                        className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          ugcSceneText.trim().length > 0 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Clapperboard size={14} />
                        Scene
                      </button>

                      <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                        <Captions size={14} />
                        Captions
                      </button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== '16:9' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}>
                            <RatioIcon size={14} />
                            {videoAspectRatio}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setVideoAspectRatio('16:9')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-5 h-3 border-2 border-current"></div>
                              16:9 Landscape
                            </button>
                            <button 
                              onClick={() => setVideoAspectRatio('9:16')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-3 h-5 border-2 border-current"></div>
                              9:16 Portrait
                            </button>
                            <button 
                              onClick={() => setVideoAspectRatio('Auto')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-4 h-4 border-2 border-current"></div>
                              Auto
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  ) : (
                    <>
                      {/* Standard Video Mode Controls */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoModel !== 'veo3_fast' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}>
                            <Video size={14} />
                            {videoModels.find(m => m.value === videoModel)?.label || 'Veo 3.1 Fast'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-background border-border z-50">
                          <div className="space-y-1">
                            {videoModels.map((model) => (
                              <button 
                                key={model.value}
                                onClick={() => setVideoModel(model.value)}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                  videoModel === model.value ? 'bg-secondary' : ''
                                }`}
                              >
                                <div className="font-medium">{model.label}</div>
                                <div className="text-xs text-muted-foreground">{model.description}</div>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              // Open character selector and update video mode state
                              onCharactersClick?.();
                            }}
                            className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <User size={14} />
                            Character
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select Character</p>
                        </TooltipContent>
                      </Tooltip>

                      <button
                        onClick={() => {
                          // Open reference selector and update video mode state
                          onReferencesClick?.();
                        }}
                        className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          videoModeState.references.length > 0 || videoModeState.startingFrame || videoModeState.endingFrame
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Upload size={14} />
                        Reference
                        {videoModeState.references.length > 0 && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-medium">
                            {videoModeState.references.length}
                          </span>
                        )}
                      </button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== '16:9' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}>
                            {videoAspectRatio}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setVideoAspectRatio('16:9')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-5 h-3 border-2 border-current"></div>
                              16:9 Landscape
                            </button>
                            <button 
                              onClick={() => setVideoAspectRatio('9:16')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-3 h-5 border-2 border-current"></div>
                              9:16 Portrait
                            </button>
                            <button 
                              onClick={() => setVideoAspectRatio('Auto')}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2"
                            >
                              <div className="w-4 h-4 border-2 border-current"></div>
                              Auto
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoDuration !== '10' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}>
                            {videoDuration} sec
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setVideoDuration('10')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${videoDuration === '10' ? 'bg-secondary' : ''}`}
                            >
                              10 seconds
                            </button>
                            <button 
                              onClick={() => setVideoDuration('15')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${videoDuration === '15' ? 'bg-secondary' : ''}`}
                            >
                              15 seconds
                            </button>
                            <button 
                              onClick={() => setVideoDuration('25')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${videoDuration === '25' ? 'bg-secondary' : ''}`}
                            >
                              25 seconds
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

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
                    </>
                  )}
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
                  className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                    selectedCharacters.length > 0 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
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
                {/* Type Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      contentType === 'Social' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-muted hover:bg-muted/80'
                    }`}>
                      Type: {contentType}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setContentType('Social'); setShowSocialButtons(true); }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentType === 'Social' ? 'bg-secondary' : ''}`}
                      >
                        Social
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Goal Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      contentGoal !== 'Engagement' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-muted hover:bg-muted/80'
                    }`}>
                      Goal: {contentGoal}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button 
                        onClick={() => setContentGoal('Engagement')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === 'Engagement' ? 'bg-secondary' : ''}`}
                      >
                        Engagement
                      </button>
                      <button 
                        onClick={() => setContentGoal('Authority')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === 'Authority' ? 'bg-secondary' : ''}`}
                      >
                        Authority
                      </button>
                      <button 
                        onClick={() => setContentGoal('Followers')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === 'Followers' ? 'bg-secondary' : ''}`}
                      >
                        Followers
                      </button>
                      <button 
                        onClick={() => setContentGoal('Leads')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === 'Leads' ? 'bg-secondary' : ''}`}
                      >
                        Leads
                      </button>
                      <button 
                        onClick={() => setContentGoal('Sales')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === 'Sales' ? 'bg-secondary' : ''}`}
                      >
                        Sales
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Language Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      contentLanguage !== 'English' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-muted hover:bg-muted/80'
                    }`}>
                      Language: {contentLanguage}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button 
                        onClick={() => setContentLanguage('English')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'English' ? 'bg-secondary' : ''}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Spanish')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Spanish' ? 'bg-secondary' : ''}`}
                      >
                        Spanish
                      </button>
                      <button 
                        onClick={() => setContentLanguage('French')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'French' ? 'bg-secondary' : ''}`}
                      >
                        French
                      </button>
                      <button 
                        onClick={() => setContentLanguage('German')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'German' ? 'bg-secondary' : ''}`}
                      >
                        German
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Portuguese')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Portuguese' ? 'bg-secondary' : ''}`}
                      >
                        Portuguese
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Italian')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Italian' ? 'bg-secondary' : ''}`}
                      >
                        Italian
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Chinese')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Chinese' ? 'bg-secondary' : ''}`}
                      >
                        Chinese
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Japanese')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Japanese' ? 'bg-secondary' : ''}`}
                      >
                        Japanese
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Arabic')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Arabic' ? 'bg-secondary' : ''}`}
                      >
                        Arabic
                      </button>
                      <button 
                        onClick={() => setContentLanguage('Hindi')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentLanguage === 'Hindi' ? 'bg-secondary' : ''}`}
                      >
                        Hindi
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                {/* Image Mode Controls */}
                {/* Create Mode Dropdown */}
                <Popover open={isCreateModeDropdownOpen} onOpenChange={setIsCreateModeDropdownOpen}>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white">
                      {(() => {
                        const mode = createModes.find(m => m.value === selectedCreateMode);
                        const IconComponent = mode?.icon || Sparkles;
                        return <IconComponent size={14} />;
                      })()}
                      {selectedCreateMode}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-2 bg-background border-border z-50" align="start">
                    <div className="space-y-1">
                      {createModes.map((mode) => {
                        const IconComponent = mode.icon;
                        return (
                          <button
                            key={mode.value}
                            onClick={() => {
                              setSelectedCreateMode(mode.value);
                              setIsCreateModeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition flex items-center gap-2 ${
                              selectedCreateMode === mode.value ? 'bg-secondary' : ''
                            }`}
                          >
                            <IconComponent size={16} />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

            <Popover open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
              <PopoverTrigger asChild>
                    <button className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                      selectedModel !== 'auto' 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}>
                      {selectedReferences.length > 0 && (
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
                      {(selectedModel === 'seedream-4' || selectedModel === 'seedream' || selectedModel === 'seedream-4.5') && (
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
                      {selectedModel === 'seedream-4.5' && 'Seedream 4.5'}
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
                  {/* Swap/Photoshoot/Draw mode models - restricted selection */}
                  {(selectedCreateMode === 'Swap' || selectedCreateMode === 'Photoshoot' || selectedCreateMode === 'Draw') && (
                    <div className="px-4 py-2 bg-orange-500/10 rounded-lg mb-2">
                      <p className="text-xs font-medium text-orange-600">
                        {selectedCreateMode === 'Swap' ? 'Face Swap Mode' : selectedCreateMode === 'Photoshoot' ? 'Photoshoot Mode' : 'Draw Mode'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Only compatible models are available</p>
                    </div>
                  )}
                  
                  {(selectedReferences.length > 0 || selectedCharacters.length > 0) && selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && (
                    <div className="px-4 py-2 bg-primary/10 rounded-lg mb-2">
                      <p className="text-xs font-medium text-primary">Image-to-Image Mode Active</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Only models supporting img-to-img are shown</p>
                    </div>
                  )}
                  
                  {/* Auto - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('auto')) && (
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

                  {/* Flux Pro - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('flux-pro')) && (
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

                  {/* Flux Max - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('flux-max')) && (
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

                  {/* GPT-4o Image - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('gpt-4o-image')) && (
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

                  {/* Seedream 4.0 - Available in Swap and Draw modes */}
                  {(selectedCreateMode === 'Swap' || selectedCreateMode === 'Draw' || (selectedCreateMode !== 'Photoshoot' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('seedream-4')))) && (
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
                          {selectedCreateMode === 'Swap' && (
                            <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4">SWAP</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">ByteDance's next-gen 2K model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Seedream 4.5 - Available in Draw mode or IMG2IMG with references */}
                  {(selectedCreateMode === 'Draw' || (selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && (selectedReferences.length > 0 || selectedCharacters.length > 0))) && (
                  <button
                    onClick={() => {
                      handleModelChange('seedream-4.5');
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-hover rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Seedream 4.5</span>
                          <Badge className="bg-brand-blue text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">IMG2IMG</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">ByteDance's 4K edit model (up to 12 refs)</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Seedream 3.0 - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('seedream')) && (
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

                  {/* Qwen Image - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('qwen')) && (
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

                  {/* Nano Banana - Available in Draw mode */}
                  {(selectedCreateMode === 'Draw' || (selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('nano-banana')))) && (
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

                  {/* Nano Banana Pro - Always visible, available in Swap/Photoshoot/Draw mode */}
                  {(selectedCreateMode === 'Swap' || selectedCreateMode === 'Photoshoot' || selectedCreateMode === 'Draw' || ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('nano-banana-pro'))) && (
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
                          {(selectedCreateMode === 'Swap' || selectedCreateMode === 'Photoshoot' || selectedCreateMode === 'Draw') && (
                            <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4">{selectedCreateMode === 'Swap' ? 'SWAP' : selectedCreateMode === 'Photoshoot' ? 'PHOTO' : 'DRAW'}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Advanced Gemini 2.5 Image Model</p>
                      </div>
                    </div>
                  </button>
                  )}

                  {/* Ideogram V3 Edit - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('ideogram')) && (
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

                  {/* Ideogram Character - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('ideogram-character')) && (
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

                  {/* Grok Imagine - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('grok')) && (
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

                  {/* Imagen 4 Ultra - hidden in Swap/Photoshoot/Draw mode */}
                  {selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && ((selectedReferences.length === 0 && selectedCharacters.length === 0) || img2imgModels.includes('imagen-ultra')) && (
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
              className={`px-4 py-1.5 rounded-md text-sm transition whitespace-nowrap flex items-center gap-2 ${
                selectedStyle 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {selectedStyle ? selectedStyle.name : 'Style'}
            </button>
            
            <button 
              onClick={onCharactersClick}
              className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                activeCharacters.length > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <User size={14} />
              Character
            </button>
            
            <button
              onClick={onReferencesClick}
              className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                activeReferences.length > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Upload size={14} />
              Reference
              {activeReferences.length > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-medium">
                  {activeReferences.length}
                </span>
              )}
            </button>
            
            {/* Mask Upload Button - Only show for Ideogram Edit when reference is selected */}
            {selectedModel === 'ideogram' && selectedReferences.length > 0 && (
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
                <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                  selectedAspectRatio !== '1:1' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}>
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
                <TooltipContent className="bg-black border-black">
                  <p>Enhance Prompt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || (selectedAnimateMode === 'UGC' ? !ugcScriptText.trim() : !prompt.trim())}
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

      {/* Social Platform Selection - Only visible when Social is selected in Content mode */}
      {isContentMode && showSocialButtons && (
        <div className="mt-6 p-6 bg-card rounded-xl border border-border">
          <p className="text-foreground font-semibold mb-6 text-center text-xl">
            Choose Your Platforms To Generate 30 Days Of Content For Each One
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                if (selectedPlatforms.length === socialPlatforms.length) {
                  setSelectedPlatforms([]);
                } else {
                  setSelectedPlatforms(socialPlatforms.map(p => p.id));
                }
              }}
              className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${
                selectedPlatforms.length === socialPlatforms.length
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {selectedPlatforms.length === socialPlatforms.length ? 'Deselect All' : 'Select All'}
            </button>

            {socialPlatforms.map(platform => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const IconComponent = platform.Icon;
              
              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setSelectedPlatforms(prev => 
                          prev.includes(platform.id) 
                            ? prev.filter(id => id !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                      className={`relative p-4 rounded-2xl transition-all border-2 ${
                        isSelected
                          ? 'bg-card shadow-lg border-emerald-500'
                          : 'bg-muted/50 hover:bg-muted border-transparent hover:border-emerald-500'
                      }`}
                    >
                      <IconComponent className="w-10 h-10" />
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{platform.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          {selectedPlatforms.length > 0 && (
            <p className="text-base text-muted-foreground mt-4 text-center">
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected • {selectedPlatforms.length * 30} posts will be generated
            </p>
          )}

          {/* Calendar/Plan Tabs */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setContentTabView('calendar')}
              className={`px-5 py-2.5 rounded-xl text-base font-medium flex items-center gap-2 transition-all ${
                contentTabView === 'calendar'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Calendar size={18} />
              Calendar
            </button>
            <button
              onClick={() => setContentTabView('plan')}
              className={`px-5 py-2.5 rounded-xl text-base font-medium flex items-center gap-2 transition-all ${
                contentTabView === 'plan'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <LayoutList size={18} />
              Plan
            </button>
          </div>
        </div>
      )}

      {/* Content Calendar */}
      {isContentMode && contentTabView === 'calendar' && (
        <SocialContentCalendar 
          generatedContent={generatedContent}
          isGenerating={isGeneratingContent}
        />
      )}

      {/* Plan View - Placeholder */}
      {isContentMode && contentTabView === 'plan' && (
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden mt-8 p-8">
          <div className="text-center">
            <LayoutList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Content Plan View</h3>
            <p className="text-muted-foreground">View and organize your content strategy here.</p>
          </div>
        </div>
      )}

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

      {/* Image to Prompt Modal */}
      <ImageToPromptModal
        isOpen={isImageToPromptModalOpen}
        onClose={() => setIsImageToPromptModalOpen(false)}
        onPromptGenerated={(generatedPrompt) => {
          setPrompt(generatedPrompt);
        }}
      />

      {/* Audio Upload Modal */}
      <AudioUploadModal
        isOpen={isAudioUploadModalOpen}
        onClose={() => setIsAudioUploadModalOpen(false)}
        onUseAudio={(audio) => {
          setUploadedAudio(audio);
          setIsAudioUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default GenerationInput;
