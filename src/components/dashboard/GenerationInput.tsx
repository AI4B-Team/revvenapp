import { Image, Image as ImageIcon, Sparkles, MoreHorizontal, MoreVertical, ChevronDown, User, ChevronRight, Flame, Zap, Video, Gift, FileText, Loader2, Upload, X, Shuffle, Share2, Check, Calendar, LayoutList, Play, Pause, Pencil, MessageCircle, Film, RefreshCw, Presentation, BookOpen, Mic, Bot, AudioLines, Heart, Package, Clapperboard, Captions, RatioIcon, Plus, Trash2, Move, Layers, Music, ArrowRightLeft, Copy, FileAudio, Send, Palette, Code, Search, LayoutGrid, Box, Brush, Link, Hash } from 'lucide-react';
import UGCCharacterBox from './UGCCharacterBox';
import AudioUploadModal from './AudioUploadModal';
import StoryboardSceneEditor from './StoryboardSceneEditor';
import PhotoshootThemeSelector from './PhotoshootThemeSelector';
import VideoToVideoModal from './VideoToVideoModal';
import TranscribeConfirmModal from './TranscribeConfirmModal';
import AudioLibraryModal from './AudioLibraryModal';
import MusicSamplesSection from './MusicSamplesSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useResizableTextarea } from '@/hooks/useResizableTextarea';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
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
  onAudioModeChange?: (mode: string) => void;
  externalPrompt?: string | null;
  onExternalPromptUsed?: () => void;
  externalAnimateMode?: string | null;
  onExternalAnimateModeUsed?: () => void;
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

const GenerationInput = ({ selectedType, onCharactersClick, onCharactersSelect, selectedCharacters = [], onReferencesClick, onReferencesSelect, selectedReferences = [], isCharacterReference, onGenerationStart, externalStartingFrame, onContentTypeChange, onSocialGenerate, onAudioModeChange, externalPrompt, onExternalPromptUsed, externalAnimateMode, onExternalAnimateModeUsed }: GenerationInputProps) => {
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
  const [contentDays, setContentDays] = useState(30);
  
  // Animate mode dropdown state (Video)
  const [selectedAnimateMode, setSelectedAnimateMode] = useState('Animate');
  const [isAnimateModeDropdownOpen, setIsAnimateModeDropdownOpen] = useState(false);
  
  // Create mode dropdown state (Image)
  const [selectedCreateMode, setSelectedCreateMode] = useState('Create');
  
  // Audio mode dropdown state
  const [selectedAudioMode, setSelectedAudioModeInternal] = useState('Voiceover');
  const [isAudioModeDropdownOpen, setIsAudioModeDropdownOpen] = useState(false);
  const [isCreateModeDropdownOpen, setIsCreateModeDropdownOpen] = useState(false);
  
  // Wrapper to notify parent of audio mode changes
  const setSelectedAudioMode = (mode: string) => {
    setSelectedAudioModeInternal(mode);
    onAudioModeChange?.(mode);
  };
  
  // Audio voiceover voice selection state
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState<string>('Roger');
  const [selectedVoiceoverName, setSelectedVoiceoverName] = useState<string>('Roger');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [isVoiceoverPopoverOpen, setIsVoiceoverPopoverOpen] = useState(false);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio model selection state
  const [selectedAudioModel, setSelectedAudioModel] = useState('eleven_multilingual_v2');
  const [isAudioModelPopoverOpen, setIsAudioModelPopoverOpen] = useState(false);
  
  // Audio voiceover settings state
  const [voiceoverLanguage, setVoiceoverLanguage] = useState('English');
  const [voiceoverAccent, setVoiceoverAccent] = useState('American');
  const [voiceoverSpeed, setVoiceoverSpeed] = useState('Normal');
  const [voiceoverTone, setVoiceoverTone] = useState('Neutral');
  const [isLanguagePopoverOpen, setIsLanguagePopoverOpen] = useState(false);
  const [isAccentPopoverOpen, setIsAccentPopoverOpen] = useState(false);
  const [isSpeedPopoverOpen, setIsSpeedPopoverOpen] = useState(false);
  const [isTonePopoverOpen, setIsTonePopoverOpen] = useState(false);
  
  // Sound Effects mode state
  const [sfxDuration, setSfxDuration] = useState<number | undefined>(undefined);
  const [sfxLoop, setSfxLoop] = useState(false);
  const [sfxPromptInfluence, setSfxPromptInfluence] = useState(0.3);
  const [sfxOutputFormat, setSfxOutputFormat] = useState('mp3_44100_128');
  const [isSfxDurationPopoverOpen, setIsSfxDurationPopoverOpen] = useState(false);
  const [isSfxFormatPopoverOpen, setIsSfxFormatPopoverOpen] = useState(false);
  const [isSfxInfluencePopoverOpen, setIsSfxInfluencePopoverOpen] = useState(false);
  
  // Music mode state
  const [musicModel, setMusicModel] = useState<'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5'>('V4');
  const [musicCustomMode, setMusicCustomMode] = useState(false);
  const [musicInstrumental, setMusicInstrumental] = useState(true);
  const [musicStyle, setMusicStyle] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicLyrics, setMusicLyrics] = useState('');
  const [vocalGender, setVocalGender] = useState<'m' | 'f'>('f');
  const [isMusicModelPopoverOpen, setIsMusicModelPopoverOpen] = useState(false);
  const [selectedMusicSample, setSelectedMusicSample] = useState<{ id: string; genre: string } | null>(null);
  const [isEnhancingLyrics, setIsEnhancingLyrics] = useState(false);
  
  // Transcribe mode state
  const [transcribeAudio, setTranscribeAudio] = useState<{ name: string; duration: number | string; url?: string; base64?: string } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribedText, setIsTranscribedText] = useState(false);
  const [showTranscribeConfirmModal, setShowTranscribeConfirmModal] = useState(false);
  const [isAudioSelectModalOpen, setIsAudioSelectModalOpen] = useState(false);
  const [isPlayingTranscribePreview, setIsPlayingTranscribePreview] = useState(false);
  const [isHoveringAudioIcon, setIsHoveringAudioIcon] = useState(false);
  const transcribePreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Revoice mode state
  const [revoiceAudio, setRevoiceAudio] = useState<{ name: string; file: File; duration?: number; url?: string; id?: string } | null>(null);
  const [revoiceTargetLanguage, setRevoiceTargetLanguage] = useState('Spanish');
  const [revoiceSourceLanguage, setRevoiceSourceLanguage] = useState('auto');
  const [isRevoicing, setIsRevoicing] = useState(false);
  const [isTargetLanguagePopoverOpen, setIsTargetLanguagePopoverOpen] = useState(false);
  const [isSourceLanguagePopoverOpen, setIsSourceLanguagePopoverOpen] = useState(false);
  const [isRevoiceRecording, setIsRevoiceRecording] = useState(false);
  const revoiceMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const revoiceAudioChunksRef = useRef<Blob[]>([]);
  // Revoice voice selection state
  const [revoiceVoiceId, setRevoiceVoiceId] = useState<string>('Roger');
  const [revoiceVoiceName, setRevoiceVoiceName] = useState<string>('Roger');
  const [isRevoiceVoicePopoverOpen, setIsRevoiceVoicePopoverOpen] = useState(false);
  const [revoicePreviewLoading, setRevoicePreviewLoading] = useState<string | null>(null);
  const [revoicePreviewPlaying, setRevoicePreviewPlaying] = useState<string | null>(null);
  const revoicePreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  // Revoice audio history state
  const [savedRevoiceAudio, setSavedRevoiceAudio] = useState<{ id: string; url: string; name: string; duration?: number }[]>([]);
  const [isLoadingRevoiceAudio, setIsLoadingRevoiceAudio] = useState(false);
  const [isRevoiceAudioPopoverOpen, setIsRevoiceAudioPopoverOpen] = useState(false);
  const [isUploadingRevoiceAudio, setIsUploadingRevoiceAudio] = useState(false);
  const [playingRevoiceHistoryId, setPlayingRevoiceHistoryId] = useState<string | null>(null);
  const revoiceHistoryAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // UGC mode selected button state
  const [selectedUGCButton, setSelectedUGCButton] = useState<string | null>(null);
  
  // UGC separate text fields for script and scene
  const [ugcScriptText, setUgcScriptText] = useState('');
  const [ugcSceneText, setUgcSceneText] = useState('');
  
  // Story mode separate text field for scene
  const [storySceneText, setStorySceneText] = useState('');
  const [selectedStoryButton, setSelectedStoryButton] = useState<string | null>(null);
  
  // Story mode multi-scene support with custom duration per scene
  const [storyScenes, setStoryScenes] = useState<{ scene: string; duration: number }[]>([{ scene: '', duration: 10 }]);
  const [storyDuration, setStoryDuration] = useState<'10' | '15' | '25'>('10');
  
  // Story mode reference image (mutually exclusive with character)
  const [storyReferenceImage, setStoryReferenceImage] = useState<{ url: string; name: string; id?: string } | null>(null);
  const [isUploadingStoryReference, setIsUploadingStoryReference] = useState(false);
  
  // Story mode scene mode (Auto vs Manual)
  const [storySceneMode, setStorySceneMode] = useState<'Auto' | 'Manual'>('Auto');
  const [isStorySceneModeDropdownOpen, setIsStorySceneModeDropdownOpen] = useState(false);
  
  // UGC audio URL for speech-to-video generation (optional - backend can auto-generate)
  const [ugcAudioUrl, setUgcAudioUrl] = useState<string | null>(null);
  
  // UGC voice settings for auto-generation
  const [ugcVoiceSettings, setUgcVoiceSettings] = useState<{ voice: string; stability: number; similarity_boost: number; style: number; speed: number; use_speaker_boost: boolean } | null>(null);
  
  // UGC model selection (Wan Avatar, Kling Avatar, or Infinitalk)
  const [ugcModel, setUgcModel] = useState<'wan-speech-to-video' | 'kling-ai-avatar' | 'infinitalk'>('kling-ai-avatar');
  
  // Audio upload modal state
  const [isAudioUploadModalOpen, setIsAudioUploadModalOpen] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<{ name: string; duration: number; url: string; type: 'uploaded' | 'recorded' } | null>(null);
  
  // Video-To-Video modal state
  const [isVideoToVideoModalOpen, setIsVideoToVideoModalOpen] = useState(false);
  const [selectedV2VVideo, setSelectedV2VVideo] = useState<{ url: string; name: string; duration?: number } | null>(null);
  
  // UGC product and style reference images
  const [ugcProductImage, setUgcProductImage] = useState<{ url: string; name: string; id?: string } | null>(null);
  const [ugcStyleImage, setUgcStyleImage] = useState<{ url: string; name: string } | null>(null);
  const [isUploadingUgcProduct, setIsUploadingUgcProduct] = useState(false);
  const [isUploadingUgcStyle, setIsUploadingUgcStyle] = useState(false);
  
  // Recast mode state - requires video and character
  const [recastVideo, setRecastVideo] = useState<{ url: string; name: string; id?: string; duration?: number } | null>(null);
  const [isUploadingRecastVideo, setIsUploadingRecastVideo] = useState(false);
  const [recastResolution, setRecastResolution] = useState<'480p' | '580p' | '720p'>('480p');
  const [recastModel, setRecastModel] = useState<'animate-move' | 'animate-replace'>('animate-replace');
  
  // Video history for Recast
  const [savedVideos, setSavedVideos] = useState<{ id: string; url: string; name: string; duration?: number }[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  
  // Product history
  const [savedProducts, setSavedProducts] = useState<{ id: string; url: string; name: string }[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Reference image history for Story mode
  const [savedReferenceImages, setSavedReferenceImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [isLoadingReferenceImages, setIsLoadingReferenceImages] = useState(false);
  const [isStoryReferencePopoverOpen, setIsStoryReferencePopoverOpen] = useState(false);
  
  // Cloned voices for voiceover
  const [clonedVoices, setClonedVoices] = useState<{ id: string; name: string; elevenlabs_voice_id: string }[]>([]);
  const [isLoadingClonedVoices, setIsLoadingClonedVoices] = useState(false);
  const [selectedClonedVoice, setSelectedClonedVoice] = useState<{ id: string; name: string; elevenlabs_voice_id: string } | null>(null);
  const [deletingClonedVoiceId, setDeletingClonedVoiceId] = useState<string | null>(null);
  
  const animateModes = [
    { value: 'Animate', label: 'Animate', icon: Play },
    { value: 'Draw', label: 'Draw', icon: Pencil },
    { value: 'Lip-Sync', label: 'Lip-Sync', icon: MessageCircle },
    { value: 'Motion-Sync', label: 'Motion-Sync', icon: Move },
    { value: 'Avatar Video', label: 'Avatar', icon: User },
    { value: 'UGC', label: 'UGC', icon: Video },
    { value: 'Recast', label: 'Recast', icon: RefreshCw },
    { value: 'VSL', label: 'VSL', icon: Film },
    { value: 'Story', label: 'Story', icon: BookOpen },
    { value: 'Podcast', label: 'Podcast', icon: Mic },
    { value: 'Presentation', label: 'Presentation', icon: Presentation },
  ];
  
  const createModes = [
    { value: 'Create', label: 'Create', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-100' },
    { value: 'Batch', label: 'Batch', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-100' },
    { value: 'Draw', label: 'Draw', icon: Pencil, color: 'text-orange-500', bg: 'bg-orange-100' },
    { value: 'Swap', label: 'Swap', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-100' },
    { value: 'Photoshoot', label: 'Photoshoot', icon: Image, color: 'text-red-500', bg: 'bg-red-100' },
  ];
  
  const audioModes = [
    { value: 'Voiceover', label: 'Voiceover', icon: Mic },
    { value: 'Clone', label: 'Clone', icon: User },
    { value: 'Revoice', label: 'Revoice', icon: RefreshCw },
    { value: 'Transcribe', label: 'Transcribe', icon: Captions },
    { value: 'Sound Effects', label: 'Sound Effects', icon: AudioLines },
    { value: 'Music', label: 'Music', icon: Music },
  ];
  
  // Voice library for Audio Voiceover mode (using KIE.AI voice names, not ElevenLabs UUIDs)
  const voiceoverLibrary = [
    { id: 'Rachel', name: 'Rachel', gender: 'Female' },
    { id: 'Aria', name: 'Aria', gender: 'Female' },
    { id: 'Roger', name: 'Roger', gender: 'Male' },
    { id: 'Sarah', name: 'Sarah', gender: 'Female' },
    { id: 'Laura', name: 'Laura', gender: 'Female' },
    { id: 'Charlie', name: 'Charlie', gender: 'Male' },
    { id: 'George', name: 'George', gender: 'Male' },
    { id: 'Callum', name: 'Callum', gender: 'Male' },
    { id: 'River', name: 'River', gender: 'Neutral' },
    { id: 'Liam', name: 'Liam', gender: 'Male' },
    { id: 'Charlotte', name: 'Charlotte', gender: 'Female' },
    { id: 'Alice', name: 'Alice', gender: 'Female' },
    { id: 'Matilda', name: 'Matilda', gender: 'Female' },
    { id: 'Will', name: 'Will', gender: 'Male' },
    { id: 'Jessica', name: 'Jessica', gender: 'Female' },
    { id: 'Eric', name: 'Eric', gender: 'Male' },
    { id: 'Chris', name: 'Chris', gender: 'Male' },
    { id: 'Brian', name: 'Brian', gender: 'Male' },
    { id: 'Daniel', name: 'Daniel', gender: 'Male' },
    { id: 'Lily', name: 'Lily', gender: 'Female' },
    { id: 'Bill', name: 'Bill', gender: 'Male' },
  ];
  
  // Resizable prompt box (both directions)
  // Keep a consistent default width across all categories (matches the widest prompt box design).
  const DEFAULT_PROMPT_WIDTH = 1440;

  const { height: promptHeight, width: promptWidth, isResizing, handleResizeStart, setHeight: setPromptHeight } = useResizableTextarea({
    minHeight: 80,
    maxHeight: 600,
    initialHeight: 100,
    minWidth: DEFAULT_PROMPT_WIDTH,
    initialWidth: DEFAULT_PROMPT_WIDTH,
    maxWidth: 1920,
    resizeDirection: 'both',
  });

  // Speech recognition for mic button
  const handleSpeechResult = useCallback((transcript: string) => {
    setPrompt(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening, cancelListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(prompt);
    }
  };
  
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
    { value: 'sora-2-i2v', label: 'Sora 2', description: 'Image-to-video, 10-15s duration' },
    { value: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people' },
    { value: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo' },
    { value: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound' },
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
    'ideogram-character': ['1:1', '16:9', '9:16', '4:3'],
    'z-image': ['1:1', '4:3', '3:4', '16:9', '9:16']
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
  const activeReferences = isVideoMode ? (selectedAnimateMode === 'Story' ? selectedReferences : videoModeState.references) : (isAudioMode || isDesignMode || isContentMode || isAppsMode || isDocumentMode ? [] : selectedReferences);
  
  // Determine if we should show character and reference displays
  const shouldHideCharacterAndReference = isDesignMode || isContentMode || isAppsMode || isDocumentMode;
  const shouldShowCharacters = !shouldHideCharacterAndReference && !isVideoMode;
  // Show references in image mode and Story mode (video)
  const shouldShowReferences = !shouldHideCharacterAndReference && !isAudioMode && (!isVideoMode || (isVideoMode && selectedAnimateMode === 'Story'));

  // Sync external props to image mode state only when in image mode
  useEffect(() => {
    if (!isVideoMode && !isAudioMode && !isDesignMode && !isContentMode && !isAppsMode && !isDocumentMode) {
      setImageModeState({
        characters: selectedCharacters,
        references: selectedReferences
      });
    }
  }, [selectedCharacters, selectedReferences, isVideoMode, isAudioMode, isDesignMode, isContentMode, isAppsMode, isDocumentMode]);

  // Fetch saved products on mount
  useEffect(() => {
    const fetchSavedProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_products')
          .select('id, url, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setSavedProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchSavedProducts();
  }, []);

  // Fetch saved social posts on mount and check for active jobs
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    
    const formatPost = (post: any) => ({
      id: post.id,
      title: post.title,
      platform: post.platform,
      date: new Date(post.scheduled_date),
      status: post.status,
      type: post.type || 'post',
      caption: post.caption || '',
      hashtags: post.hashtags || [],
      accountName: post.account_name || 'Your Brand',
      accountHandle: post.account_handle || '@yourbrand',
      videoScript: post.video_script || null,
      imageUrl: post.image_url || undefined,
      carouselImages: post.carousel_images || null,
    });

    const fetchSavedSocialPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Check for any active generation jobs first
        const { data: activeJobs } = await supabase
          .from('social_content_jobs')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'processing'])
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (activeJobs && activeJobs.length > 0) {
          const activeJob = activeJobs[0];
          console.log('Found active job:', activeJob.id);
          setIsGeneratingContent(true);
          setShowSocialButtons(false);
          
          // Resume polling for this job
          pollInterval = setInterval(async () => {
            try {
              const { data: job } = await supabase
                .from('social_content_jobs')
                .select('*')
                .eq('id', activeJob.id)
                .single();

              if (!job) return;

              // Fetch all posts for the user
              const { data: posts } = await supabase
                .from('social_posts')
                .select('*')
                .eq('user_id', user.id)
                .order('scheduled_date', { ascending: true });

              if (posts) {
                setGeneratedContent(posts.map(formatPost));
              }

              if (job.status === 'completed') {
                if (pollInterval) clearInterval(pollInterval);
                setIsGeneratingContent(false);
              } else if (job.status === 'failed') {
                if (pollInterval) clearInterval(pollInterval);
                setIsGeneratingContent(false);
                setShowSocialButtons(true);
              }
            } catch (pollError) {
              console.error('Polling error:', pollError);
            }
          }, 2000);
          
          return;
        }
        
        // No active jobs, just fetch existing posts
        const { data, error } = await supabase
          .from('social_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setGeneratedContent(data.map(formatPost));
          setShowSocialButtons(false);
        }
      } catch (error) {
        console.error('Error fetching social posts:', error);
      }
    };
    
    fetchSavedSocialPosts();
    
    // Set up realtime subscription for social posts
    const channel = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts',
        },
        async (payload) => {
          console.log('New social post inserted:', payload);
          const newPost = formatPost(payload.new);
          setGeneratedContent(prev => {
            // Avoid duplicates
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [...prev, newPost].sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          });
        }
      )
      .subscribe();
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch saved videos for Recast on mount
  useEffect(() => {
    const fetchSavedVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_videos')
          .select('id, url, name, duration')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setSavedVideos(data || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    
    fetchSavedVideos();
  }, []);

  // Fetch saved reference images on mount
  useEffect(() => {
    const fetchSavedReferenceImages = async () => {
      setIsLoadingReferenceImages(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('reference_images')
          .select('id, image_url, original_filename')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        setSavedReferenceImages((data || []).map(img => ({
          id: img.id,
          url: img.image_url,
          name: img.original_filename || 'Reference'
        })));
      } catch (error) {
        console.error('Error fetching reference images:', error);
      } finally {
        setIsLoadingReferenceImages(false);
      }
    };
    
    fetchSavedReferenceImages();
  }, []);

  // Fetch cloned voices on mount
  useEffect(() => {
    const fetchClonedVoices = async () => {
      setIsLoadingClonedVoices(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_voices')
          .select('id, name, elevenlabs_voice_id')
          .eq('user_id', user.id)
          .eq('type', 'cloned')
          .not('elevenlabs_voice_id', 'is', null)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setClonedVoices((data || []).map(v => ({
          id: v.id,
          name: v.name,
          elevenlabs_voice_id: v.elevenlabs_voice_id || ''
        })));
      } catch (error) {
        console.error('Error fetching cloned voices:', error);
      } finally {
        setIsLoadingClonedVoices(false);
      }
    };
    
    fetchClonedVoices();
  }, []);

  // Fetch saved revoice audio on mount
  useEffect(() => {
    const fetchSavedRevoiceAudio = async () => {
      setIsLoadingRevoiceAudio(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_voices')
          .select('id, url, name, duration')
          .eq('user_id', user.id)
          .eq('type', 'revoice_source')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        setSavedRevoiceAudio((data || []).map(v => ({
          id: v.id,
          url: v.url,
          name: v.name,
          duration: v.duration || undefined
        })));
      } catch (error) {
        console.error('Error fetching revoice audio:', error);
      } finally {
        setIsLoadingRevoiceAudio(false);
      }
    };
    
    fetchSavedRevoiceAudio();
  }, []);

  // Handle external prompt (e.g., from transcript "Use" button)
  useEffect(() => {
    if (externalPrompt) {
      // Check if we're in Avatar Video or Lip-Sync mode (either from external or already set)
      const isAvatarMode = selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync' || 
                           externalAnimateMode === 'Avatar Video' || externalAnimateMode === 'Lip-Sync';
      
      if (isAvatarMode && isVideoMode) {
        // For Avatar Video, truncate to 180 char limit and set as script
        const truncatedScript = externalPrompt.substring(0, 180);
        setUgcScriptText(truncatedScript);
        if (externalPrompt.length > 180) {
          toast({
            title: "Script loaded (truncated)",
            description: `Script truncated to 180 characters. Original was ${externalPrompt.length} characters.`,
          });
        } else {
          toast({
            title: "Script loaded",
            description: "Your transcript has been loaded as a script for Avatar Video.",
          });
        }
      } else {
        setPrompt(externalPrompt);
        // Expand the prompt box to accommodate longer text
        const lineCount = externalPrompt.split('\n').length;
        const estimatedHeight = Math.min(500, Math.max(200, lineCount * 24 + 80));
        setPromptHeight(estimatedHeight);
        toast({
          title: "Transcript loaded",
          description: "Your transcript has been loaded into the prompt box.",
        });
      }
      // Notify parent that we've used the external prompt
      onExternalPromptUsed?.();
    }
  }, [externalPrompt, externalAnimateMode, selectedAnimateMode, isVideoMode, onExternalPromptUsed]);

  // Auto-set model to "auto" when Image mode "Create" is selected
  useEffect(() => {
    if (!isVideoMode && !isAudioMode && !isDesignMode && !isContentMode && !isAppsMode && !isDocumentMode) {
      // We're in Image mode
      if (selectedCreateMode === 'Create') {
        setSelectedModel('auto');
      }
    }
  }, [selectedCreateMode, isVideoMode, isAudioMode, isDesignMode, isContentMode, isAppsMode, isDocumentMode]);

  // Delete cloned voice handler
  const handleDeleteClonedVoice = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingClonedVoiceId(voiceId);
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', voiceId);

      if (error) throw error;
      
      setClonedVoices(prev => prev.filter(v => v.id !== voiceId));
      if (selectedClonedVoice?.id === voiceId) {
        setSelectedClonedVoice(null);
      }
      
      toast({
        title: "Voice deleted",
        description: "The cloned voice has been removed.",
      });
    } catch (error) {
      console.error('Error deleting cloned voice:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingClonedVoiceId(null);
    }
  };

  // Delete revoice audio from history
  const handleDeleteRevoiceAudio = async (audioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', audioId);

      if (error) throw error;
      
      setSavedRevoiceAudio(prev => prev.filter(a => a.id !== audioId));
      if (revoiceAudio?.id === audioId) {
        setRevoiceAudio(null);
      }
      
      toast({
        title: "Audio deleted",
        description: "Audio removed from history.",
      });
    } catch (error) {
      console.error('Error deleting revoice audio:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete audio.",
        variant: "destructive",
      });
    }
  };

  // Play/pause revoice audio from history
  const handlePlayRevoiceHistory = (audio: { id: string; url: string; name: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (playingRevoiceHistoryId === audio.id) {
      // Stop playing
      if (revoiceHistoryAudioRef.current) {
        revoiceHistoryAudioRef.current.pause();
        revoiceHistoryAudioRef.current.currentTime = 0;
      }
      setPlayingRevoiceHistoryId(null);
    } else {
      // Stop any currently playing audio
      if (revoiceHistoryAudioRef.current) {
        revoiceHistoryAudioRef.current.pause();
      }
      
      // Play new audio
      const audioElement = new Audio(audio.url);
      audioElement.onended = () => {
        setPlayingRevoiceHistoryId(null);
        revoiceHistoryAudioRef.current = null;
      };
      audioElement.onerror = () => {
        toast({
          title: "Playback error",
          description: "Could not play this audio file",
          variant: "destructive",
        });
        setPlayingRevoiceHistoryId(null);
        revoiceHistoryAudioRef.current = null;
      };
      audioElement.play();
      revoiceHistoryAudioRef.current = audioElement;
      setPlayingRevoiceHistoryId(audio.id);
    }
  };
  const handleRevoiceAudioUpload = async (file: File, duration?: number) => {
    setIsUploadingRevoiceAudio(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      // Upload to Cloudinary via edge function
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-audio', {
        body: {
          audioData: base64,
          filename: file.name,
          contentType: file.type || 'audio/mpeg',
        },
      });

      if (uploadError) throw uploadError;
      if (!uploadData?.url) throw new Error('Upload failed');

      // Save to database
      const { data: savedAudio, error: dbError } = await supabase
        .from('user_voices')
        .insert({
          user_id: user.id,
          name: file.name,
          url: uploadData.url,
          duration: duration || uploadData.duration || 0,
          type: 'revoice_source',
          status: 'completed',
          cloudinary_public_id: uploadData.publicId || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setSavedRevoiceAudio(prev => [{
        id: savedAudio.id,
        url: uploadData.url,
        name: file.name,
        duration: duration || uploadData.duration
      }, ...prev]);

      // Set as current selection (need to fetch the file for generation)
      setRevoiceAudio({
        name: file.name,
        file: file,
        duration: duration || uploadData.duration,
        url: uploadData.url,
        id: savedAudio.id,
      });

      toast({
        title: "Audio saved",
        description: "Audio added to your library",
      });
    } catch (error) {
      console.error('Error uploading revoice audio:', error);
      toast({
        title: "Upload failed",
        description: "Failed to save audio to library",
        variant: "destructive",
      });
    } finally {
      setIsUploadingRevoiceAudio(false);
    }
  };

  // Select audio from history for revoice
  const handleSelectRevoiceAudioFromHistory = async (audio: { id: string; url: string; name: string; duration?: number }) => {
    try {
      // Fetch the audio file from URL
      const response = await fetch(audio.url);
      const blob = await response.blob();
      const file = new File([blob], audio.name, { type: blob.type || 'audio/mpeg' });
      
      setRevoiceAudio({
        name: audio.name,
        file: file,
        duration: audio.duration,
        url: audio.url,
        id: audio.id,
      });
      
      setIsRevoiceAudioPopoverOpen(false);
    } catch (error) {
      console.error('Error loading audio from history:', error);
      toast({
        title: "Load failed",
        description: "Failed to load audio from history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isVideoMode && selectedAnimateMode === 'Story') {
      const hasValidScene = storyScenes.some(s => s.scene.trim().length >= 10);
      const hasCharacter = videoModeState.characters.length > 0;
      const hasRefImage = !!storyReferenceImage;
      console.log('Story Mode Debug:', {
        storyScenes: storyScenes.map(s => ({ scene: s.scene, length: s.scene.trim().length })),
        hasValidScene,
        hasCharacter,
        hasRefImage,
        storyReferenceImage,
        videoModeCharacters: videoModeState.characters,
        isDisabled: !hasValidScene || (!hasCharacter && !hasRefImage)
      });
    }
  }, [isVideoMode, selectedAnimateMode, storyScenes, videoModeState.characters, storyReferenceImage]);

  // Track if we've applied an external animate mode this session
  const hasAppliedExternalAnimateMode = useRef(false);

  // Reset animate mode to 'Animate' when entering video mode (unless external mode was applied)
  useEffect(() => {
    if (isVideoMode && !externalAnimateMode && !hasAppliedExternalAnimateMode.current) {
      setSelectedAnimateMode('Animate');
    }
  }, [isVideoMode, externalAnimateMode]);

  // Handle external animate mode
  useEffect(() => {
    if (externalAnimateMode && isVideoMode) {
      console.log('Setting external animate mode:', externalAnimateMode);
      setSelectedAnimateMode(externalAnimateMode);
      hasAppliedExternalAnimateMode.current = true;
      onExternalAnimateModeUsed?.();
    }
  }, [externalAnimateMode, isVideoMode, onExternalAnimateModeUsed]);

  // Reset the ref when leaving video mode
  useEffect(() => {
    if (!isVideoMode) {
      hasAppliedExternalAnimateMode.current = false;
    }
  }, [isVideoMode]);

  // Clear transcribed text highlight when switching away from Transcribe mode
  // Also clear prompt when entering Transcribe mode
  useEffect(() => {
    if (!(isAudioMode && selectedAudioMode === 'Transcribe')) {
      setIsTranscribedText(false);
    } else {
      // Clear prompt when entering Transcribe mode
      setPrompt('');
    }
  }, [isAudioMode, selectedAudioMode]);

  // Story mode: Auto-sync prompt to first scene description
  useEffect(() => {
    if (isVideoMode && selectedAnimateMode === 'Story' && prompt.trim()) {
      setStoryScenes(prev => {
        // Only update if the first scene is empty
        if (prev.length > 0 && prev[0].scene === '') {
          const updated = [...prev];
          updated[0] = { ...updated[0], scene: prompt.trim() };
          return updated;
        }
        return prev;
      });
    }
  }, [prompt, isVideoMode, selectedAnimateMode]);

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
  
  // Sync characters for Avatar Video, Lip-Sync, and Recast modes (no frame population)
  useEffect(() => {
    if (!isVideoMode) return;
    if (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync' || selectedAnimateMode === 'Recast') {
      setVideoModeState(prev => ({
        ...prev,
        characters: selectedCharacters,
        references: selectedReferences
      }));
    }
  }, [isVideoMode, selectedAnimateMode, selectedCharacters, selectedReferences]);

  useEffect(() => {
    if (!isVideoMode) return;
    
    // Skip frame auto-population in Avatar Video, Lip-Sync, and Recast modes - character is only for API, not frames
    if (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync' || selectedAnimateMode === 'Recast') {
      return;
    }
    
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
  }, [isVideoMode, selectedCharacters, selectedReferences, selectedAnimateMode]);
  
  // Voice preview function for Audio Voiceover mode
  const playVoiceoverPreview = async (voiceId: string) => {
    // If clicking the same voice that's playing, stop it
    if (playingVoiceId === voiceId && voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      voiceoverAudioRef.current = null;
      setPlayingVoiceId(null);
      return;
    }

    // Stop any currently playing audio
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      voiceoverAudioRef.current = null;
    }
    setPlayingVoiceId(null);
    setLoadingVoiceId(voiceId);

    try {
      // Find the voice name from the voiceover library or cloned voices
      const standardVoice = voiceoverLibrary.find(v => v.id === voiceId);
      const clonedVoice = clonedVoices.find(v => v.elevenlabs_voice_id === voiceId);
      const voiceName = standardVoice?.name || clonedVoice?.name || voiceId;
      const previewText = `Hi, I am ${voiceName}, welcome to Revven.`;
      
      const { data, error } = await supabase.functions.invoke('generate-voice-preview', {
        body: {
          text: previewText,
          voice: voiceId,
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          speed: 1,
          use_speaker_boost: true,
        }
      });

      if (error) throw error;

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        voiceoverAudioRef.current = audio;

        audio.onended = () => {
          setPlayingVoiceId(null);
          voiceoverAudioRef.current = null;
        };

        audio.onerror = () => {
          setPlayingVoiceId(null);
          voiceoverAudioRef.current = null;
        };

        await audio.play();
        setPlayingVoiceId(voiceId);
      }
    } catch (error) {
      console.error('Error generating voice preview:', error);
      toast({
        title: "Preview failed",
        description: "Could not generate voice preview",
        variant: "destructive",
      });
    } finally {
      setLoadingVoiceId(null);
    }
  };
  
  const handleGenerate = async () => {
    // Handle Content mode - never fall through to image generation
    if (isContentMode) {
      if (!showSocialButtons) {
        // Already generated content, regenerate option
        toast({
          title: "Content already generated",
          description: "Your 30-day content plan is displayed in the calendar below.",
        });
        return;
      }
      
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
      
      // Generate content plan using AI in background
      setIsGeneratingContent(true);
      setGeneratedContent([]); // Clear existing content
      setShowSocialButtons(false); // Hide platform selection immediately
      
      toast({
        title: "Generating AI content plan",
        description: `Creating ${contentDays} days of content. You can navigate away - generation continues in background.`,
      });
      
      try {
        // Start background generation job
        const { data, error } = await supabase.functions.invoke('generate-social-content', {
          body: {
            prompt: prompt.trim(),
            platforms: selectedPlatforms,
            days: contentDays,
            goal: contentGoal,
            language: contentLanguage,
          }
        });

        if (error) throw error;
        
        if (!data?.jobId) {
          throw new Error('No job ID returned');
        }

        const jobId = data.jobId;
        console.log('Started background job:', jobId);

        // Poll for job completion and new posts
        const pollInterval = setInterval(async () => {
          try {
            // Check job status
            const { data: job } = await supabase
              .from('social_content_jobs')
              .select('*')
              .eq('id', jobId)
              .single();

            if (!job) return;

            // Fetch all posts for the user
            const { data: posts } = await supabase
              .from('social_posts')
              .select('*')
              .order('scheduled_date', { ascending: true });

            if (posts) {
              const formattedPosts = posts.map(post => ({
                id: post.id,
                title: post.title,
                platform: post.platform,
                date: new Date(post.scheduled_date),
                status: post.status,
                type: post.type || 'post',
                caption: post.caption || '',
                hashtags: post.hashtags || [],
                accountName: post.account_name || 'Your Brand',
                accountHandle: post.account_handle || '@yourbrand',
                videoScript: post.video_script,
                imageUrl: post.image_url,
                carouselImages: post.carousel_images,
              }));
              setGeneratedContent(formattedPosts);
            }

            // Check if job is complete
            if (job.status === 'completed') {
              clearInterval(pollInterval);
              setIsGeneratingContent(false);
              toast({
                title: "Content plan generated & saved!",
                description: `Created ${job.generated_posts} AI-powered posts for ${contentDays} days`,
              });
            } else if (job.status === 'failed') {
              clearInterval(pollInterval);
              setIsGeneratingContent(false);
              toast({
                title: "Generation failed",
                description: job.error_message || "Failed to generate content plan.",
                variant: "destructive",
              });
              setShowSocialButtons(true);
            }
          } catch (pollError) {
            console.error('Polling error:', pollError);
          }
        }, 2000); // Poll every 2 seconds

        // Store interval ID for cleanup
        const cleanup = () => clearInterval(pollInterval);
        window.addEventListener('beforeunload', cleanup, { once: true });

      } catch (error: any) {
        console.error('Error starting content generation:', error);
        toast({
          title: "Generation failed",
          description: error.message || "Failed to start content generation. Please try again.",
          variant: "destructive",
        });
        setShowSocialButtons(true);
        setIsGeneratingContent(false);
      }
      
      return;
    }

    // In Avatar Video or Lip-Sync mode, check ugcScriptText; in Recast mode, no prompt required; in Story mode, scenes can replace prompt
    const isAvatarOrLipSync = isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync');
    const effectivePrompt = isAvatarOrLipSync ? ugcScriptText : prompt;
    // Story mode: requires image (character OR reference) + (scenes OR prompt)
    const hasValidStoryScenes = storyScenes.some(s => s.scene.trim().length > 0);
    const hasStoryImage = isVideoMode && (videoModeState.characters.length > 0 || storyReferenceImage || videoModeState.startingFrame);
    const hasStoryContent = hasValidStoryScenes || prompt.trim().length > 0;
    const isStoryModeValid = selectedAnimateMode === 'Story' && hasStoryImage && hasStoryContent;
    
    // Story mode validation: must have image (character OR reference) + (scenes OR prompt)
    if (selectedAnimateMode === 'Story') {
      if (!hasStoryImage) {
        toast({
          title: "Image required",
          description: "Please select a character or upload a reference image for your Story video",
          variant: "destructive",
        });
        return;
      }
      if (!hasStoryContent) {
        toast({
          title: "Content required",
          description: "Please add scene descriptions or enter a prompt",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Recast mode doesn't require a prompt text - only video and character image
    // Skip prompt validation for Recast, Story, and Transcribe modes
    const isTranscribeMode = isAudioMode && selectedAudioMode === 'Transcribe';
    const isRevoiceMode = isAudioMode && selectedAudioMode === 'Revoice';
    if (selectedAnimateMode !== 'Recast' && selectedAnimateMode !== 'Story' && !isTranscribeMode && !isRevoiceMode && !effectivePrompt.trim()) {
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

    // VIDEO MODE: Generate video
    if (isVideoMode) {
      // For UGC mode, do not lock the Generate button with a spinner
      if (selectedAnimateMode !== 'UGC') {
        setIsGenerating(true);
      }
      onGenerationStart?.();
      
      try {
        // UGC MODE: First create image with Nano Banana Pro (product + character), then generate video
        if (selectedAnimateMode === 'UGC') {
          // Validate required inputs for UGC mode
          if (!currentCharacters.length) {
            toast({
              title: "Character required",
              description: "Please select a character for your UGC video",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          if (!ugcProductImage) {
            toast({
              title: "Product image required",
              description: "Please upload a product image for your UGC video",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          if (!prompt.trim()) {
            toast({
              title: "Prompt required",
              description: "Please describe how you want to combine the product and character",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }

          console.log("UGC Mode: Starting async video generation...");
          
          // Get the authenticated user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Get character details
          const primaryCharacter = currentCharacters[0];
          const characterImageUrl = primaryCharacter?.image_url || primaryCharacter?.image;
          
          // Build reference images array: product image + character image + optional style reference
          const referenceImages: string[] = [];
          if (ugcProductImage?.url) referenceImages.push(ugcProductImage.url);
          if (characterImageUrl) referenceImages.push(characterImageUrl);
          if (ugcStyleImage?.url) referenceImages.push(ugcStyleImage.url);

          // Build explicit combining prompt for UGC
          const ugcCombiningPrompt = `Create a product showcase image that combines these elements: 
Use the person/character from the character reference to appear in the image. 
Feature the product from the product reference, having the person hold, display, or showcase it naturally. 
${ugcStyleImage?.url ? 'Apply the visual style and aesthetic from the style reference.' : ''}
Scene/style instructions: ${prompt.trim()}. 
Make it look like a natural, professional product showcase or UGC-style promotional image with the character prominently featuring the product.`;

          // Start UGC video generation in the backend (async - no polling)
          // The backend will handle the image generation and video creation
          const videoRequestBody: any = { 
            prompt: prompt.trim(),
            ugcPrompt: ugcCombiningPrompt,
            referenceImages: referenceImages,
            model: videoModel,
            aspectRatio: videoAspectRatio === 'Auto' ? '16:9' : videoAspectRatio,
            duration: videoDuration,
            userId: user.id,
            characterId: primaryCharacter?.id || null,
            characterName: primaryCharacter?.name || 'Unknown',
            characterBio: primaryCharacter?.bio || '',
            characterImageUrl: characterImageUrl || '',
            isUgcMode: true, // Flag for backend to handle UGC workflow
          };

          const { data: videoData, error: videoError } = await supabase.functions.invoke('generate-veo-video', {
            body: videoRequestBody
          });

          if (videoError) throw videoError;

          toast({
            title: "UGC video generating!",
            description: "Your video is being created. Check Creations to see progress.",
          });

          console.log("UGC video generation started:", videoData);
          
          // Clear UGC state after successful generation start
          setUgcProductImage(null);
          setUgcStyleImage(null);
          setPrompt('');
          
          setIsGenerating(false);
          return;
        }

        // RECAST MODE: Use wan/2-2-animate-move model with video + character image
        if (selectedAnimateMode === 'Recast') {
          // Validate required inputs for Recast mode
          if (!recastVideo) {
            toast({
              title: "Video required",
              description: "Please upload a video for Recast",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          
          // Use selectedCharacters prop directly for Recast mode character validation
          const recastCharacters = selectedCharacters.length > 0 ? selectedCharacters : currentCharacters;
          if (!recastCharacters.length) {
            toast({
              title: "Character required",
              description: "Please select a character for Recast",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }

          // Get character image URL from the selected character
          const characterImageUrl = recastCharacters[0].avatar || recastCharacters[0].image_url || recastCharacters[0].image;
          if (!characterImageUrl) {
            toast({
              title: "Character image required",
              description: "Selected character must have an image",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }

          console.log("Recast Mode: Starting video generation with wan/2-2-animate-move...");
          
          // Get the authenticated user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Call the generate-video edge function with Recast-specific parameters
          const recastRequestBody = {
            videoUrl: recastVideo.url,
            imageUrl: characterImageUrl,
            resolution: recastResolution,
            recastModel: recastModel,
            userId: user.id,
            isRecast: true
          };

          const { data: recastData, error: recastError } = await supabase.functions.invoke('generate-video', {
            body: recastRequestBody
          });

          if (recastError) throw recastError;

          toast({
            title: "Recast video generating!",
            description: "Your Recast video is being created. This may take a few minutes.",
          });

          console.log("Recast video generation started:", recastData);
          
          // Clear Recast state after successful generation
          setRecastVideo(null);
          
          setIsGenerating(false);
          return;
        }

        // STORY MODE: Use sora-2-pro-storyboard model with shots array
        if (selectedAnimateMode === 'Story') {
          // Validate: scenes must have meaningful content (at least 10 characters)
          const validScenes = storyScenes.filter(s => s.scene.trim().length >= 10);
          const shortScenes = storyScenes.filter(s => s.scene.trim().length > 0 && s.scene.trim().length < 10);
          
          // Warn about short scenes that will be ignored
          if (shortScenes.length > 0) {
            toast({
              title: "Short scenes ignored",
              description: "Scene descriptions must be at least 10 characters. Short scenes were removed.",
              variant: "default",
            });
          }
          
          // Case 1: Scenes + Image = valid (multi-scene storyboard)
          // Case 2: Prompt + Image = valid (single scene from prompt)
          // Case 3: Prompt only = valid (single scene video)
          if (validScenes.length === 0 && (!prompt.trim() || prompt.trim().length < 10)) {
            toast({
              title: "Content required",
              description: "Please add scene descriptions (min 10 characters) or enter a detailed prompt",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }

          console.log("Story Mode: Starting video generation with sora-2-pro-storyboard...");
          
          // Get the authenticated user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Get image URL: character OR reference image (mutually exclusive)
          const storyImageUrl = currentCharacters.length > 0 
            ? (currentCharacters[0].avatar || currentCharacters[0].image_url || currentCharacters[0].image)
            : storyReferenceImage?.url || videoModeState.startingFrame?.preview || null;

          // Build shots array from scene inputs or prompt
          let shots: { Scene: string; duration: number }[] = [];
          const isPromptValid = prompt.trim().length >= 10;
          
          // If there are valid scenes from the scene inputs, use those
          if (validScenes.length > 0) {
            shots = validScenes.map(s => ({
              Scene: s.scene.trim(),
              duration: s.duration
            }));
          } else if (isPromptValid) {
            // No valid scenes - use prompt as the single scene with FULL duration
            shots.push({
              Scene: prompt.trim(),
              duration: parseInt(storyDuration)
            });
          }

          // Call the generate-video edge function with Story-specific parameters
          const storyRequestBody = {
            isStory: true,
            userId: user.id,
            shots: shots,
            nFrames: storyDuration,
            aspectRatio: videoAspectRatio === 'portrait' ? 'portrait' : 'landscape',
            imageUrls: storyImageUrl ? [storyImageUrl] : undefined
          };

          const { data: storyData, error: storyError } = await supabase.functions.invoke('generate-video', {
            body: storyRequestBody
          });

          if (storyError) throw storyError;

          toast({
            title: "Story video generating!",
            description: "Your storyboard video is being created. This may take a few minutes.",
          });

          console.log("Story video generation started:", storyData);
          
          // Clear Story state after successful generation
          setStoryScenes([{ scene: '', duration: 7.5 }]);
          
          setIsGenerating(false);
          return;
        }

        // Check if Avatar Video or Lip-Sync mode requires audio
        // Avatar Video and Lip-Sync modes require character and script
        if (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') {
          if (!currentCharacters.length) {
            toast({
              title: "Character required",
              description: `Please select a character for your ${selectedAnimateMode}`,
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
        
        // Use selected UGC model for Avatar Video mode
        const effectiveModel = selectedAnimateMode === 'Avatar Video' ? ugcModel : videoModel;

        // Build request body
        const requestBody: any = { 
          prompt: selectedAnimateMode === 'Avatar Video' ? ugcScriptText.trim() : prompt.trim(),
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

        // For Avatar Video mode, pass voice settings for auto-generation (or use existing audioUrl if preview was generated or audio was uploaded)
        if (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') {
          // Priority: 1. Uploaded/recorded audio, 2. Voice preview audio, 3. Auto-generate from voice settings
          if (uploadedAudio?.url) {
            // Use uploaded or recorded audio
            requestBody.audioUrl = uploadedAudio.url;
          } else if (ugcAudioUrl) {
            // Use pre-generated voice preview audio
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
          description: `Your ${selectedAnimateMode === 'Avatar Video' ? 'Avatar' : ''} video is being created with ${ugcModel === 'kling-ai-avatar' ? 'Kling Avatar' : 'Wan Avatar'}. This may take a few minutes.`,
        });

        console.log("Video generation started:", data);
        
        // Clear Avatar Video state after successful generation
        if (selectedAnimateMode === 'Avatar Video') {
          setUgcAudioUrl(null);
          setUploadedAudio(null);
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

    // AUDIO MODE: Handle different audio modes
    if (isAudioMode) {
      // TRANSCRIBE MODE: Transcribe audio to text
      if (selectedAudioMode === 'Transcribe') {
        if (!transcribeAudio) {
          toast({
            title: "Audio required",
            description: "Please upload or record audio to transcribe",
            variant: "destructive",
          });
          return;
        }

        setIsTranscribing(true);
        onGenerationStart?.();

        try {
          console.log("Starting transcription...");
          
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: {
              audioBase64: transcribeAudio.base64 || undefined,
              audioUrl: transcribeAudio.url || undefined,
              filename: transcribeAudio.name,
              contentType: 'audio/mpeg',
            }
          });

          if (error) throw error;
 
          if (data?.text) {
            setPrompt(data.text);
            setIsTranscribedText(true);
 
            try {
              // Save transcribed audio to history
              console.log('[TRANSCRIBE DEBUG] Starting save, transcribeAudio:', transcribeAudio);
              const { data: { user } } = await supabase.auth.getUser();
              console.log('[TRANSCRIBE DEBUG] User:', user?.id);
              if (user) {
                let audioUrl = transcribeAudio?.url;
                let audioDuration: number = 0;
                
                // Parse duration - handle both number and string formats
                const rawDuration = transcribeAudio?.duration;
                console.log('[TRANSCRIBE DEBUG] Raw duration:', rawDuration, 'type:', typeof rawDuration);
                if (typeof rawDuration === 'number') {
                  audioDuration = rawDuration;
                } else if (typeof rawDuration === 'string') {
                  const parts = rawDuration.split(':');
                  if (parts.length === 2) {
                    audioDuration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                  } else if (parts.length === 3) {
                    audioDuration = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
                  } else {
                    audioDuration = parseFloat(rawDuration) || 0;
                  }
                }
                console.log('[TRANSCRIBE DEBUG] Parsed duration:', audioDuration);
                
                // If we have base64 data (regular upload), upload to Cloudinary first
                if (transcribeAudio?.base64) {
                  console.log('[TRANSCRIBE DEBUG] Has base64, uploading to Cloudinary...');
                  const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-audio', {
                    body: {
                      audioData: transcribeAudio.base64,
                      filename: transcribeAudio.name,
                      contentType: transcribeAudio.base64.split(';')[0].replace('data:', '') || 'audio/mp4',
                    },
                  });

                  if (!uploadError && uploadData?.url) {
                    audioUrl = uploadData.url;
                    audioDuration = uploadData.duration || audioDuration;
                    console.log('[TRANSCRIBE DEBUG] Upload success, url:', audioUrl);
                  } else {
                    console.log('[TRANSCRIBE DEBUG] Upload error:', uploadError);
                  }
                }
                
                // Save to database if we have a URL (either from YouTube or uploaded)
                console.log('[TRANSCRIBE DEBUG] Final audioUrl:', audioUrl);
                if (audioUrl) {
                  const insertData = {
                    user_id: user.id,
                    name: transcribeAudio?.name || 'Transcription',
                    duration: audioDuration,
                    url: audioUrl,
                    type: 'transcription',
                    status: 'completed',
                    prompt: data.text,
                  };
                  console.log('[TRANSCRIBE DEBUG] Inserting:', insertData);
                  const { error: insertError } = await supabase.from('user_voices').insert(insertData);
                  if (insertError) {
                    console.error('[TRANSCRIBE DEBUG] Insert error:', insertError);
                  } else {
                    console.log('[TRANSCRIBE DEBUG] Insert success!');
                  }
                } else {
                  console.log('[TRANSCRIBE DEBUG] No audioUrl, skipping insert');
                }
              }
            } catch (historyError) {
              console.error('Failed to save transcription history:', historyError);
            }
 
            toast({
              title: "Transcription complete!",
              description: "The text has been added to the prompt box",
            });
          } else {
            throw new Error("No transcription text received");
          }
          
          // Clear the audio after successful transcription
          setTranscribeAudio(null);
          
        } catch (error: any) {
          console.error("Transcription error:", error);
          toast({
            title: "Transcription failed",
            description: error.message || "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsTranscribing(false);
        }
        return;
      }

      // SOUND EFFECTS MODE: Generate sound effect
      if (selectedAudioMode === 'Sound Effects') {
        if (!prompt.trim()) {
          toast({
            title: "Description required",
            description: "Please describe the sound effect you want to generate",
            variant: "destructive",
          });
          return;
        }

        onGenerationStart?.();
        const promptText = prompt.trim();

        // Get user first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate sound effects",
            variant: "destructive",
          });
          return;
        }

        // Insert processing record immediately so it appears in gallery
        const { data: pendingRecord, error: insertError } = await supabase.from('user_voices').insert({
          user_id: user.id,
          name: promptText.substring(0, 50) + (promptText.length > 50 ? '...' : ''),
          url: '',
          duration: sfxDuration || 5,
          type: 'sound_effect',
          status: 'processing',
          prompt: promptText,
        }).select().single();

        if (insertError) {
          console.error("Error creating pending record:", insertError);
          toast({
            title: "Error",
            description: "Failed to start sound effect generation",
            variant: "destructive",
          });
          return;
        }

        // Generate sound effect asynchronously (non-blocking)
        (async () => {
          try {
            console.log("Starting sound effect generation...");
            
            const { data, error } = await supabase.functions.invoke('generate-sound-effect', {
              body: {
                text: promptText,
                duration_seconds: sfxDuration,
                loop: sfxLoop,
                prompt_influence: sfxPromptInfluence,
                output_format: sfxOutputFormat,
              }
            });

            if (error) throw error;

            if (data?.audioUrl) {
              // Update the record with completed status and URL
              const { error: updateError } = await supabase.from('user_voices')
                .update({
                  url: data.audioUrl,
                  status: 'completed',
                })
                .eq('id', pendingRecord.id);
              
              if (updateError) {
                console.error("Error updating sound effect:", updateError);
              }
              
              toast({
                title: "Sound effect generated!",
                description: "Your audio is ready and saved to gallery",
              });
            } else {
              throw new Error("No audio URL received");
            }
            
          } catch (error: any) {
            console.error("Sound effect generation error:", error);
            // Update record to error status
            await supabase.from('user_voices')
              .update({ status: 'error' })
              .eq('id', pendingRecord.id);
            
            toast({
              title: "Generation failed",
              description: error.message || "Failed to generate sound effect. Please try again.",
              variant: "destructive",
            });
          }
        })();

        return;
      }

      // MUSIC MODE: Generate music (non-blocking with webhook callback)
      if (selectedAudioMode === 'Music') {
        if (!prompt.trim()) {
          toast({
            title: "Description required",
            description: "Please describe the music you want to generate",
            variant: "destructive",
          });
          return;
        }

        // Validate custom mode requirements
        if (musicCustomMode) {
          if (!musicStyle.trim()) {
            toast({
              title: "Style required",
              description: "Please enter a music style",
              variant: "destructive",
            });
            return;
          }
          if (!musicTitle.trim()) {
            toast({
              title: "Title required",
              description: "Please enter a title for your music track",
              variant: "destructive",
            });
            return;
          }
        }

        // Validate lyrics required when With Vocals is selected
        if (!musicInstrumental && !musicLyrics.trim()) {
          toast({
            title: "Lyrics required",
            description: "Please add lyrics for vocal music generation",
            variant: "destructive",
          });
          return;
        }

        onGenerationStart?.();
        const promptText = prompt.trim();
        const lyricsText = musicLyrics.trim();

        // Get user first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate music",
            variant: "destructive",
          });
          return;
        }

        // Insert processing record immediately so it appears in gallery
        const { data: pendingRecord, error: insertError } = await supabase.from('user_voices').insert({
          user_id: user.id,
          name: musicCustomMode && musicTitle ? musicTitle.substring(0, 50) : (lyricsText || promptText).substring(0, 50) + ((lyricsText || promptText).length > 50 ? '...' : ''),
          url: '',
          duration: 30, // Default estimate
          type: 'music',
          status: 'processing',
          prompt: !musicInstrumental && lyricsText ? lyricsText : promptText,
        }).select().single();

        if (insertError) {
          console.error("Error creating pending record:", insertError);
          toast({
            title: "Error",
            description: "Failed to start music generation",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Music generation started",
          description: "Your track is being created. This may take a few minutes.",
        });

        // Generate music asynchronously (non-blocking)
        (async () => {
          try {
            console.log("Starting music generation...");
            
            // When vocals + lyrics are provided, we need customMode=true for KIE.AI to sing the lyrics
            const hasLyricsWithVocals = !musicInstrumental && musicLyrics.trim().length > 0;
            const effectiveCustomMode = musicCustomMode || hasLyricsWithVocals;
            
            // Auto-extract title from lyrics if not manually set (looks for "Song Title:" pattern)
            let effectiveTitle = musicTitle;
            if (hasLyricsWithVocals && !musicTitle) {
              const titleMatch = musicLyrics.match(/Song Title:\s*["']?([^"'\n]+)["']?/i);
              effectiveTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Song';
            }
            
            // Auto-set style if not manually set when using vocals
            let effectiveStyle = musicStyle;
            if (hasLyricsWithVocals && !musicStyle) {
              effectiveStyle = promptText.trim() || 'Pop, Contemporary, Emotional';
            }
            
            const requestBody: Record<string, unknown> = {
              prompt: hasLyricsWithVocals ? musicLyrics : promptText,
              customMode: effectiveCustomMode,
              instrumental: musicInstrumental,
              model: musicModel,
              recordId: pendingRecord.id,
            };

            // Add style and title when in custom mode (required by KIE.AI for vocals)
            if (effectiveCustomMode) {
              requestBody.style = effectiveStyle;
              requestBody.title = effectiveTitle;
            }

            // Add vocal gender when not instrumental
            if (!musicInstrumental) {
              requestBody.vocalGender = vocalGender;
            }

            const { data, error } = await supabase.functions.invoke('generate-music', {
              body: requestBody,
            });

            if (error) throw error;

            if (!data?.success) {
              throw new Error(data?.error || "Music generation failed");
            }

            console.log("Music generation task created:", data.taskId);
            
          } catch (error: any) {
            console.error("Music generation error:", error);
            // Update record to error status
            await supabase.from('user_voices')
              .update({ status: 'error' })
              .eq('id', pendingRecord.id);
            
            toast({
              title: "Generation failed",
              description: error.message || "Failed to generate music. Please try again.",
              variant: "destructive",
            });
          }
        })();

        return;
      }

      // CLONE MODE: Generate TTS using selected cloned voice
      if (selectedAudioMode === 'Clone') {
        if (!selectedClonedVoice) {
          toast({
            title: "Voice required",
            description: "Please select a cloned voice from My Cloned Voices",
            variant: "destructive",
          });
          return;
        }
        
        if (!prompt.trim()) {
          toast({
            title: "Script required",
            description: "Please enter the text you want to convert to speech",
            variant: "destructive",
          });
          return;
        }

        onGenerationStart?.();
        const promptText = prompt.trim();

        try {
          console.log("Starting TTS with cloned voice:", selectedClonedVoice.name);
          
          const speedMap: Record<string, number> = {
            'Very Slow': 0.7,
            'Slow': 0.85,
            'Normal': 1.0,
            'Fast': 1.1,
            'Very Fast': 1.19
          };
          const speed = speedMap[voiceoverSpeed] || 1.0;

          const { data, error } = await supabase.functions.invoke('generate-voiceover', {
            body: {
              text: promptText,
              voice: selectedClonedVoice.elevenlabs_voice_id,
              voiceName: selectedClonedVoice.name,
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              speed,
              use_speaker_boost: true,
            }
          });

          if (error) throw error;

          toast({
            title: "Voiceover generating!",
            description: `Using your cloned voice "${selectedClonedVoice.name}"`,
          });
          
        } catch (error: any) {
          console.error("Clone voice TTS error:", error);
          toast({
            title: "Generation failed",
            description: error.message || "Failed to generate audio. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // REVOICE MODE: Translate audio to another language (non-blocking)
      if (selectedAudioMode === 'Revoice') {
        if (!revoiceAudio) {
          toast({
            title: "Audio required",
            description: "Please upload an audio file to translate",
            variant: "destructive",
          });
          return;
        }

        onGenerationStart?.();

        try {
          console.log("Starting revoice/dubbing (non-blocking)...", {
            targetLanguage: revoiceTargetLanguage,
            sourceLanguage: revoiceSourceLanguage,
            fileName: revoiceAudio.name,
          });
          
          // Map language names to ISO codes for ElevenLabs
          const languageCodeMap: Record<string, string> = {
            'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
            'Italian': 'it', 'Portuguese': 'pt', 'Polish': 'pl', 'Turkish': 'tr',
            'Russian': 'ru', 'Dutch': 'nl', 'Czech': 'cs', 'Arabic': 'ar',
            'Chinese': 'zh', 'Japanese': 'ja', 'Hindi': 'hi', 'Korean': 'ko',
            'Indonesian': 'id', 'Filipino': 'fil', 'Malay': 'ms', 'Tamil': 'ta',
            'Vietnamese': 'vi', 'Thai': 'th', 'Swedish': 'sv', 'Norwegian': 'no',
            'Danish': 'da', 'Finnish': 'fi', 'Romanian': 'ro', 'Hungarian': 'hu',
            'Greek': 'el', 'Hebrew': 'he', 'Ukrainian': 'uk', 'Croatian': 'hr',
            'Slovak': 'sk', 'Bulgarian': 'bg',
          };
          
          const targetCode = languageCodeMap[revoiceTargetLanguage] || revoiceTargetLanguage.toLowerCase().slice(0, 2);
          const sourceCode = revoiceSourceLanguage === 'auto' ? 'auto' : (languageCodeMap[revoiceSourceLanguage] || revoiceSourceLanguage.toLowerCase().slice(0, 2));
          
          const formData = new FormData();
          formData.append('audio', revoiceAudio.file);
          formData.append('target_language', targetCode);
          formData.append('source_language', sourceCode);
          formData.append('name', revoiceAudio.name.replace(/\.[^/.]+$/, '')); // Remove extension
          
          // Get user session for auth
          const { data: { session } } = await supabase.auth.getSession();
          const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

          // Fire and forget - don't wait for response
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/revoice-audio`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
            body: formData,
          }).then(async (response) => {
            const data = await response.json();
            if (!response.ok || !data.success) {
              console.error("Revoice background error:", data.error);
            }
          }).catch(err => {
            console.error("Revoice fetch error:", err);
          });

          toast({
            title: "Translation started!",
            description: "Check Creations for progress. You can generate more translations.",
          });

          // Don't clear revoiceAudio - keep it for reuse
          
        } catch (error: any) {
          console.error("Revoice error:", error);
          toast({
            title: "Translation failed",
            description: error.message || "Failed to start translation. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // VOICEOVER MODE: Generate voiceover (non-blocking)
      if (!prompt.trim()) {
        toast({
          title: "Script required",
          description: "Please enter the text you want to convert to speech",
          variant: "destructive",
        });
        return;
      }

      onGenerationStart?.();
      const promptText = prompt.trim();

      try {
        console.log("Starting async audio generation...");
        
        // Map speed setting to numeric value
        const speedMap: Record<string, number> = {
          'Very Slow': 0.7,
          'Slow': 0.85,
          'Normal': 1.0,
          'Fast': 1.1,
          'Very Fast': 1.19
        };
        const speed = speedMap[voiceoverSpeed] || 1.0;

        // Call async generation - returns immediately
        const { data, error } = await supabase.functions.invoke('generate-voiceover', {
          body: {
            text: promptText,
            voice: selectedVoiceoverId,
            voiceName: selectedVoiceoverName,
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            speed,
            use_speaker_boost: true,
          }
        });

        if (error) throw error;

        toast({
          title: "Voiceover generating!",
          description: "Your audio is being created and will appear in the gallery",
        });
        
      } catch (error: any) {
        console.error("Audio generation error:", error);
        toast({
          title: "Generation failed",
          description: error.message || "Failed to start audio generation. Please try again.",
          variant: "destructive",
        });
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

  // Get current text to enhance based on mode
  const getCurrentTextToEnhance = (): { text: string; setter: (text: string) => void; maxLength?: number } => {
    const isAvatarOrLipSync = isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync');
    const isStoryMode = isVideoMode && selectedAnimateMode === 'Story';
    
    if (isAvatarOrLipSync) {
      if (selectedUGCButton === 'Scene') {
        return { text: ugcSceneText, setter: setUgcSceneText };
      }
      return { text: ugcScriptText, setter: setUgcScriptText, maxLength: 180 };
    }
    
    if (isStoryMode && selectedStoryButton === 'Scene') {
      return { text: storySceneText, setter: setStorySceneText };
    }
    
    return { text: prompt, setter: setPrompt };
  };

  const handleEnhancePrompt = async (fast = false) => {
    const { text, setter, maxLength } = getCurrentTextToEnhance();
    
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to enhance",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      console.log("Enhancing text...");
      
      // Determine mode for the enhancer
      const isMusicMode = selectedType === 'Audio' && selectedAudioMode === 'Music';
      // Music mode always uses 'music' for style descriptions (lyrics are enhanced separately)
      
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { 
          prompt: text.trim(),
          fast: fast,
          maxLength: maxLength,
          mode: isMusicMode ? 'music' : 'image',
          musicWithVocals: isMusicMode ? !musicInstrumental : false
        }
      });

      if (error) throw error;

      if (data.enhancedPrompt) {
        let enhanced = data.enhancedPrompt;
        // Respect max length if specified
        if (maxLength && enhanced.length > maxLength) {
          enhanced = enhanced.substring(0, maxLength);
        }
        setter(enhanced);
        toast({
          title: "Text enhanced!",
          description: fast ? "Quick enhancement complete" : "Your text has been improved with AI",
        });
        console.log("Enhanced text:", enhanced);
      }
      
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance text",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleLyricsEnhance = async (isAutoPrompt = false) => {
    setIsEnhancingLyrics(true);
    
    try {
      const themePrompt = isAutoPrompt 
        ? (prompt.trim() || 'an inspirational song about rising above challenges and finding inner strength')
        : musicLyrics;
      
      if (!themePrompt.trim()) {
        toast({
          title: isAutoPrompt ? "Theme required" : "Lyrics required",
          description: isAutoPrompt ? "Please enter a theme or description for the lyrics" : "Please enter lyrics to enhance",
          variant: "destructive",
        });
        setIsEnhancingLyrics(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { 
          prompt: themePrompt.trim(),
          mode: isAutoPrompt ? 'lyrics' : 'lyrics-enhance'
        }
      });

      if (error) throw error;

      if (data.enhancedPrompt) {
        const maxLength = musicModel === 'V4' ? 3000 : 5000;
        let enhanced = data.enhancedPrompt;
        if (enhanced.length > maxLength) {
          enhanced = enhanced.substring(0, maxLength);
        }
        setMusicLyrics(enhanced);
        toast({
          title: isAutoPrompt ? "Lyrics generated!" : "Lyrics enhanced!",
          description: isAutoPrompt ? "AI has created lyrics based on your theme" : "Your lyrics have been improved",
        });
      }
      
    } catch (error) {
      console.error("Lyrics enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to process lyrics",
        variant: "destructive",
      });
    } finally {
      setIsEnhancingLyrics(false);
    }
  };

  const handleAutoPrompt = async () => {
    setIsEnhancing(true);
    try {
      // Check if we're in Avatar Video mode
      const isUGCMode = isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync');
      
      // Get active characters and references based on content type
      const currentCharacters = isVideoMode ? videoModeState.characters : activeCharacters;
      const currentReferences = isVideoMode ? videoModeState.references : activeReferences;
      
      // Collect character and reference image URLs
      const characterImages = currentCharacters.map(char => char.image_url || char.image).filter(Boolean);
      const referenceImages = currentReferences.map(ref => ref.image_url || ref.url || ref.preview).filter(Boolean);

      // If in video mode, also include frame images
      if (isVideoMode && !isUGCMode) {
        if (videoModeState.startingFrame?.preview) {
          referenceImages.push(videoModeState.startingFrame.preview);
        }
        if (videoModeState.endingFrame?.preview) {
          referenceImages.push(videoModeState.endingFrame.preview);
        }
      }

      // Determine content type with specific mode for better prompt generation
      let contentType = selectedType;
      let specificMode = '';
      
      if (isVideoMode) {
        contentType = 'video';
        specificMode = selectedAnimateMode || 'Animate';
        if (isUGCMode) {
          contentType = 'ugc';
        }
      } else if (selectedType === 'Image') {
        contentType = 'image';
        specificMode = selectedCreateMode || 'Create';
      } else if (selectedType === 'Audio') {
        contentType = 'audio';
        specificMode = selectedAudioMode || 'Voiceover';
      } else if (selectedType === 'Design') {
        contentType = 'design';
      } else if (selectedType === 'Content') {
        contentType = 'content';
      }

      // Check if music mode with vocals enabled
      const isMusicWithVocals = selectedType === 'Audio' && selectedAudioMode === 'Music' && !musicInstrumental;

      const { data, error } = await supabase.functions.invoke('generate-prompt-suggestion', {
        body: { 
          contentType,
          specificMode,
          characterImages,
          referenceImages,
          musicWithVocals: isMusicWithVocals
        }
      });

      if (error) throw error;
      if (data?.suggestion) {
        // In UGC mode, populate the script text; otherwise populate the prompt
        if (isUGCMode) {
          setUgcScriptText(data.suggestion);
          toast({
            title: "Script generated",
            description: "A creative voice script has been generated for your Avatar Video.",
          });
        } else {
          setPrompt(data.suggestion);
          const hasImages = characterImages.length > 0 || referenceImages.length > 0;
          // Content mode specific toast
          if (selectedType === 'Content') {
            toast({
              title: "Topic generated!",
              description: "A creative content theme has been suggested. Click Generate to create your calendar!",
            });
          } else {
            toast({
              title: "Prompt generated",
              description: hasImages 
                ? "A creative prompt based on your selected images has been generated."
                : "A creative prompt has been generated for you.",
            });
          }
        }
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

        // Append the uploaded reference to existing references
        if (onReferencesSelect && data?.referenceImage) {
          const currentRefs = selectedReferences || [];
          onReferencesSelect([...currentRefs, data.referenceImage]);
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

  // UGC Product image upload handler
  const handleUgcProductUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingUgcProduct(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

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

        const imageUrl = data?.referenceImage?.image_url;
        const cloudinaryPublicId = data?.referenceImage?.cloudinary_public_id;

        // Save to database
        const { data: savedProduct, error: dbError } = await supabase
          .from('user_products')
          .insert({
            user_id: user.id,
            name: file.name,
            url: imageUrl,
            cloudinary_public_id: cloudinaryPublicId
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update local state
        setSavedProducts(prev => [{ id: savedProduct.id, url: imageUrl, name: file.name }, ...prev]);
        setUgcProductImage({
          id: savedProduct.id,
          url: imageUrl,
          name: file.name
        });

        toast({
          title: "Success",
          description: "Product image saved",
        });
        setIsUploadingUgcProduct(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading product:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload product image",
        variant: "destructive",
      });
      setIsUploadingUgcProduct(false);
    }
  };

  // Delete saved product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('user_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setSavedProducts(prev => prev.filter(p => p.id !== productId));
      
      // Clear selection if deleted product was selected
      if (ugcProductImage?.id === productId) {
        setUgcProductImage(null);
      }

      toast({
        title: "Deleted",
        description: "Product removed from library",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // UGC Style reference image upload handler
  const handleUgcStyleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingUgcStyle(true);
    try {
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

        setUgcStyleImage({
          url: data?.referenceImage?.image_url,
          name: file.name
        });

        toast({
          title: "Success",
          description: "Style reference uploaded",
        });
        setIsUploadingUgcStyle(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading style:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload style reference",
        variant: "destructive",
      });
      setIsUploadingUgcStyle(false);
    }
  };

  // Delete video from Recast history
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('user_videos')
        .delete()
        .eq('id', videoId);
        
      if (error) throw error;
      
      setSavedVideos(prev => prev.filter(v => v.id !== videoId));
      
      // Clear selection if deleted video was selected
      if (recastVideo?.id === videoId) {
        setRecastVideo(null);
      }
      
      toast({
        title: "Video deleted",
        description: "Video removed from history",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  // Recast video upload handler with duration validation
  const handleRecastVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, MOV, MKV)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check video duration (max 25 seconds)
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(videoUrl);
      const duration = video.duration;
      
      if (duration > 25) {
        toast({
          title: "Video too long",
          description: `Video duration is ${Math.round(duration)}s. Maximum allowed is 25 seconds.`,
          variant: "destructive",
        });
        return;
      }

      // Duration is valid, proceed with upload
      setIsUploadingRecastVideo(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async () => {
          const base64 = reader.result as string;

          // Use dedicated video upload function (not image upload)
          const { data, error } = await supabase.functions.invoke('upload-video', {
            body: {
              video: base64,
              filename: file.name,
              duration: Math.round(duration)
            }
          });

          if (error) throw error;

          const uploadedVideoUrl = data?.video?.url;
          const cloudinaryPublicId = data?.video?.cloudinary_public_id;

          // Save to user_videos table
          const { data: savedVideo, error: saveError } = await supabase
            .from('user_videos')
            .insert({
              user_id: user.id,
              name: file.name,
              url: uploadedVideoUrl,
              cloudinary_public_id: cloudinaryPublicId,
              duration: Math.round(duration)
            })
            .select()
            .single();

          if (saveError) {
            console.error('Error saving video to history:', saveError);
          } else {
            // Add to local state
            setSavedVideos(prev => [{ id: savedVideo.id, url: uploadedVideoUrl, name: file.name, duration: Math.round(duration) }, ...prev]);
          }

          setRecastVideo({
            id: savedVideo?.id,
            url: uploadedVideoUrl,
            name: file.name,
            duration: Math.round(duration)
          });

          toast({
            title: "Success",
            description: `Video uploaded (${Math.round(duration)}s)`,
          });
          setIsUploadingRecastVideo(false);
        };

        reader.onerror = () => {
          throw new Error('Failed to read file');
        };
      } catch (error) {
        console.error('Error uploading recast video:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload video",
          variant: "destructive",
        });
        setIsUploadingRecastVideo(false);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      toast({
        title: "Invalid video",
        description: "Could not read video file",
        variant: "destructive",
      });
    };

    video.src = videoUrl;
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
    <div className="mx-auto mb-12 transition-all duration-300 w-full" style={{ maxWidth: 'calc(100% - 2rem)' }}>
      <div className="bg-background border-2 border-emerald-500 rounded-xl p-6 shadow-lg min-h-[180px]">
        <div className="flex items-start gap-3 mb-6" style={{ minHeight: promptHeight }}>
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <div className="flex flex-col items-start gap-2">
                {isVideoMode ? (
                  <>
                    {/* Video Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setIsVideoToVideoModalOpen(true)}
                          className="p-1.5 transition hover:opacity-70"
                        >
                          <Video size={20} strokeWidth={2.5} className="text-brand-red" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Video-To-Video</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Additional Video Mode Icons */}
                    {(selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-1.5 transition hover:opacity-70">
                              <Bot size={20} strokeWidth={2.5} className="text-violet-500" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border-black text-white">
                            <p>Script Agent</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => setIsAudioUploadModalOpen(true)}
                              className="p-1.5 transition hover:opacity-70"
                            >
                              <AudioLines size={20} strokeWidth={2.5} className={uploadedAudio ? 'text-emerald-500' : 'text-orange-500'} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border-black text-white">
                            <p>Upload Audio</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </>
                ) : isAudioMode ? (
                  <>
                    {/* Audio Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => selectedAudioMode === 'Transcribe' ? setIsAudioSelectModalOpen(true) : undefined}
                          className="p-1.5 transition hover:opacity-70"
                        >
                          <Music size={20} strokeWidth={2.5} className="text-brand-green" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Audio</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second (except in Transcribe mode) */}
                    {selectedAudioMode !== 'Transcribe' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={handleAutoPrompt}
                            disabled={isEnhancing}
                            className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isEnhancing ? (
                              <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                            ) : (
                              <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-black text-white">
                          <p>Auto Prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                ) : isDesignMode ? (
                  <>
                    {/* Design Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 transition hover:opacity-70">
                          <Palette size={20} strokeWidth={2.5} className="text-brand-yellow" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Design</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : isContentMode ? (
                  <>
                    {/* Content Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 transition hover:opacity-70">
                          <Calendar size={20} strokeWidth={2.5} className="text-brand-purple" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Content</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : isDocumentMode ? (
                  <>
                    {/* Document Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 transition hover:opacity-70">
                          <FileText size={20} strokeWidth={2.5} className="text-brand-blue" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Document</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : isAppsMode ? (
                  <>
                    {/* Apps Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 transition hover:opacity-70">
                          <Code size={20} strokeWidth={2.5} className="text-brand-red" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Apps</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    {/* Image Category Icon - Always First */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setIsImageToPromptModalOpen(true)}
                          className="p-1.5 transition hover:opacity-70"
                        >
                          <Image size={20} strokeWidth={2.5} className="text-brand-blue" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Image-To-Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Auto Prompt - Always Second */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="p-1.5 transition hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnhancing ? (
                            <Loader2 size={20} strokeWidth={2.5} className="text-emerald-500 animate-spin" />
                          ) : (
                            <Shuffle size={20} strokeWidth={2.5} className="text-emerald-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-black text-white">
                        <p>Auto Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="flex-1 relative" style={{ height: promptHeight }}>
            {/* Transcribe mode - Show transcription output area instead of prompt input */}
            {isAudioMode && selectedAudioMode === 'Transcribe' ? (
              <div className="w-full h-full flex flex-col p-4 min-h-[100px]">
                {prompt ? (
                  <>
                    <div className="flex-1 overflow-auto min-h-[60px] mb-3">
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap text-left">{prompt}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-border shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(prompt);
                          toast({
                            title: "Copied!",
                            description: "Transcribed text copied to clipboard",
                          });
                        }}
                        className="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition text-foreground text-sm flex items-center gap-2"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                      <button
                        onClick={() => setPrompt('')}
                        className="px-3 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 transition text-destructive text-sm flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Upload or record audio to transcribe</p>
                )}
              </div>
            ) : (
              <>
                <textarea 
                  value={
                    isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync')
                      ? (selectedUGCButton === 'Scene' ? ugcSceneText : ugcScriptText) 
                      : isVideoMode && selectedAnimateMode === 'Story'
                        ? (selectedStoryButton === 'Scene' ? storySceneText : prompt)
                        : prompt
                  }
                  onChange={(e) => {
                    if (isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync')) {
                      if (selectedUGCButton === 'Scene') {
                        setUgcSceneText(e.target.value);
                      } else {
                        setUgcScriptText(e.target.value);
                      }
                    } else if (isVideoMode && selectedAnimateMode === 'Story') {
                      if (selectedStoryButton === 'Scene') {
                        setStorySceneText(e.target.value);
                      } else {
                        setPrompt(e.target.value);
                      }
                    } else {
                      setPrompt(e.target.value);
                    }
                  }}
                  disabled={isGenerating || (isVideoMode && selectedAnimateMode === 'Story' && selectedStoryButton !== 'Scene')}
                  maxLength={isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') && selectedUGCButton !== 'Scene' ? 180 : undefined}
                  className={`w-full h-full text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground disabled:opacity-50 pr-8 ${isTranscribedText && prompt ? 'text-violet-400' : 'text-foreground'}`}
                  placeholder={
                    isContentMode 
                      ? "Describe the theme or topic for your content plan..." 
                      : (isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync'))
                        ? (selectedUGCButton === 'Scene' ? 'Describe the scene (e.g., "Unboxing a package on the couch")' : 'Write what you want your character to say...(e.g., "Hey there! This product changed my life!")') 
                        : (isVideoMode && selectedAnimateMode === 'Story')
                          ? 'Upload References. Describe your vision. We\'ll create the scenes (e.g., Product reveal with smooth motion, premium feel, confident tone)'
                          : (isVideoMode && selectedAnimateMode === 'UGC') 
                            ? 'Describe what you want (e.g., "Make this product in the style of the reference image and create a promotional video")' 
                            : "Describe what you want to create..."
                  }
                />
                {/* Character count warning for Avatar Video and Lip-Sync mode */}
                {isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') && selectedUGCButton !== 'Scene' && (
                  <div className={`absolute bottom-2 right-10 text-xs ${
                    ugcScriptText.length > 180 ? 'text-destructive font-medium' : 
                    ugcScriptText.length > 150 ? 'text-orange-500' : 'text-muted-foreground'
                  }`}>
                    {ugcScriptText.length}/180
                    {ugcScriptText.length > 180 && <span className="ml-1">⚠️ Limit exceeded</span>}
                  </div>
                )}
                {/* Auto-suggest button for Content mode */}
                {isContentMode && !prompt.trim() && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleAutoPrompt}
                          disabled={isEnhancing}
                          className="absolute bottom-3 right-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-pulse hover:animate-none"
                        >
                          {isEnhancing ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              Suggest Topic
                            </>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Generate a creative content topic idea</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
            <ResizeHandle 
              onResizeStart={handleResizeStart} 
              isResizing={isResizing}
              variant="subtle"
            />
            {isResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
          </div>
        </div>

        {/* UGC Character Box - Show in Avatar Video and Lip-Sync mode when a character is selected */}
        {isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') && videoModeState.characters.length > 0 && (
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

        {/* UGC Mode - Display Product and Character Images side by side */}
        {isVideoMode && selectedAnimateMode === 'UGC' && (ugcProductImage || videoModeState.characters.length > 0) && (
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            {/* Character Image */}
            {videoModeState.characters.length > 0 && (
              <div className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-brand-green">
                  <img 
                    src={videoModeState.characters[0].image_url || videoModeState.characters[0].image} 
                    alt={videoModeState.characters[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => onCharactersSelect?.([])}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-center mt-1 text-muted-foreground truncate max-w-[128px]">
                  {videoModeState.characters[0].name}
                </p>
              </div>
            )}

            {/* Swap Button - Only show when both character and product are selected */}
            {videoModeState.characters.length > 0 && ugcProductImage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      // Swap character and product by converting product to character and vice versa
                      const currentCharacter = videoModeState.characters[0];
                      const currentProduct = ugcProductImage;
                      
                      // Set product image as character
                      onCharactersSelect?.([{
                        id: currentProduct.id || 'product-as-character',
                        name: currentProduct.name || 'Product',
                        image_url: currentProduct.url,
                        image: currentProduct.url,
                        bio: ''
                      }]);
                      
                      // Set character as product
                      setUgcProductImage({
                        url: currentCharacter.image_url || currentCharacter.image,
                        name: currentCharacter.name,
                        id: currentCharacter.id
                      });
                    }}
                    className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition"
                  >
                    <ArrowRightLeft size={16} className="text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Swap</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Product Image */}
            {ugcProductImage && (
              <div className="relative group">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-brand-yellow">
                  <img 
                    src={ugcProductImage.url} 
                    alt={ugcProductImage.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setUgcProductImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                >
                  <X size={14} />
                </button>
                <p className="text-xs text-center mt-1 text-muted-foreground truncate max-w-[128px]">
                  Product
                </p>
              </div>
            )}
          </div>
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

        {/* Video Animation Frames - Show only when frames exist, hidden in Avatar Video, Lip-Sync, UGC, Recast, and Story modes */}
        {isVideoMode && (videoModeState.startingFrame || videoModeState.endingFrame) && !((selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') && videoModeState.characters.length > 0) && selectedAnimateMode !== 'Recast' && selectedAnimateMode !== 'UGC' && selectedAnimateMode !== 'Story' && (
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

        {/* Recast Mode Frame Display - Shows selected character as the frame to apply */}
        {isVideoMode && selectedAnimateMode === 'Recast' && (
          <div className="mb-6 mt-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Character</span>
                <div 
                  onClick={onCharactersClick}
                  className={`w-32 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    selectedCharacters && selectedCharacters.length > 0 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-muted-foreground/30 hover:border-primary/50 bg-muted/20'
                  }`}
                >
                  {selectedCharacters && selectedCharacters.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedCharacters[0].image || selectedCharacters[0].image_url || selectedCharacters[0].avatar}
                        alt={selectedCharacters[0].name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCharactersSelect?.([]);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                        <span className="text-xs text-white font-medium truncate block">{selectedCharacters[0].name}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center px-2">Click to select character</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex items-center gap-3 flex-nowrap min-w-0 overflow-x-auto pb-1">
            {isVideoMode ? (
              <>
                {/* Video Mode Controls */}
                <TooltipProvider>
                  {/* Animate Mode Dropdown */}
                  <Popover open={isAnimateModeDropdownOpen} onOpenChange={setIsAnimateModeDropdownOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <button className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80">
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

                  {(selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') ? (
                    <>
                      {/* Avatar Video / Lip-Sync Mode Controls - Same model dropdown for both */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-orange text-pill-orange-text hover:opacity-80">
                            <Video size={14} />
                            {ugcModel === 'kling-ai-avatar' ? 'Kling Avatar' : ugcModel === 'infinitalk' ? 'Infinitalk' : 'Wan Avatar'}
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
                              <div className="text-xs text-muted-foreground">Speech-to-video with lip sync (max 15s)</div>
                            </button>
                            <button 
                              onClick={() => setUgcModel('kling-ai-avatar')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                ugcModel === 'kling-ai-avatar' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium flex items-center gap-2">
                                Kling Avatar
                              </div>
                              <div className="text-xs text-muted-foreground">Pro avatar with audio sync (max 15s)</div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Audio duration warning for all Avatar Video models */}
                      {uploadedAudio?.duration && uploadedAudio.duration > 15 && (
                        <span className="text-red-500 text-xs font-medium">
                          ⚠️ Audio too long ({Math.round(uploadedAudio.duration)}s &gt; 15s)
                        </span>
                      )}
                      <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-gray text-pill-gray-text hover:opacity-80">
                        <Film size={14} />
                        Style
                      </button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => onCharactersClick?.()}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <User size={14} />
                            Character
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select Character</p>
                        </TooltipContent>
                      </Tooltip>

                      <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-gray text-pill-gray-text hover:opacity-80">
                        <Heart size={14} />
                        Emotion
                      </button>

                      <button 
                        onClick={() => setSelectedUGCButton(selectedUGCButton === 'Scene' ? null : 'Scene')}
                        className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          ugcSceneText.trim().length > 0 
                            ? 'bg-pill-green text-pill-green-text' 
                            : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}
                      >
                        <Clapperboard size={14} />
                        Scene
                      </button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== '16:9' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
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
                  ) : selectedAnimateMode === 'UGC' ? (
                    <>
                      {/* UGC Mode Controls - with Product button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoModel !== 'veo3_fast'
                              ? 'bg-pill-orange text-pill-orange-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            <Video size={14} />
                            {videoModel === 'veo3'
                              ? 'Veo 3.1 Quality'
                              : videoModel === 'kling-2.6'
                                ? 'Kling 2.6'
                                : 'Veo 3.1 Fast'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setVideoModel('veo3_fast')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                videoModel === 'veo3_fast' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium">Veo 3.1 Fast</div>
                              <div className="text-xs text-muted-foreground">Quick video generation</div>
                            </button>
                            <button 
                              onClick={() => setVideoModel('veo3')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                videoModel === 'veo3' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium">Veo 3.1 Quality</div>
                              <div className="text-xs text-muted-foreground">Higher quality output</div>
                            </button>
                            <button 
                              onClick={() => setVideoModel('kling-2.6')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${
                                videoModel === 'kling-2.6' ? 'bg-secondary' : ''
                              }`}
                            >
                              <div className="font-medium">Kling 2.6</div>
                              <div className="text-xs text-muted-foreground">Image-to-video with sound</div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => onCharactersClick?.()}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <User size={14} />
                            Character
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select Character</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Product Image Upload with History */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            ugcProductImage 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {isUploadingUgcProduct ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Package size={14} />
                            )}
                            {ugcProductImage ? 'Product ✓' : 'Product'}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 bg-background border-border z-50">
                          <div className="space-y-3">
                            
                            {/* Upload New */}
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Upload New</p>
                              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary transition">
                                <Upload size={16} className="text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Click to upload</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleUgcProductUpload}
                                />
                              </label>
                            </div>

                            {/* Saved Products */}
                            {savedProducts.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">My Products</p>
                                {isLoadingProducts ? (
                                  <div className="flex justify-center py-2">
                                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                                    {savedProducts.map((product) => (
                                      <div 
                                        key={product.id} 
                                        className={`relative group cursor-pointer rounded-md overflow-hidden ${
                                          ugcProductImage?.id === product.id ? 'ring-2 ring-emerald-500' : ''
                                        }`}
                                        onClick={() => setUgcProductImage({ id: product.id, url: product.url, name: product.name })}
                                      >
                                        <img src={product.url} alt={product.name} className="w-full h-16 object-cover" />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProduct(product.id);
                                          }}
                                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>


                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== '16:9' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
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
                  ) : selectedAnimateMode === 'Recast' ? (
                    <>
                      {/* Recast Mode Controls - Model Selector */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-orange text-pill-orange-text hover:opacity-80">
                            <Video size={14} />
                            {recastModel === 'animate-move' ? 'Animate Move' : 'Animate Replace'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setRecastModel('animate-move')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${recastModel === 'animate-move' ? 'bg-secondary' : ''}`}
                            >
                              <div className="font-medium">Animate Move</div>
                              <div className="text-xs text-muted-foreground">Move/animate elements in video</div>
                            </button>
                            <button 
                              onClick={() => setRecastModel('animate-replace')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${recastModel === 'animate-replace' ? 'bg-secondary' : ''}`}
                            >
                              <div className="font-medium">Animate Replace</div>
                              <div className="text-xs text-muted-foreground">Replace character with image</div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Video Upload */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            recastVideo 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {isUploadingRecastVideo ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Video size={14} />
                            )}
                            {recastVideo ? 'Video ✓' : 'Video'}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 bg-background border-border z-50">
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Upload Video</p>
                            <p className="text-xs text-muted-foreground">MP4, MOV, or MKV • Max 10MB • Max 25 sec</p>
                            
                            {recastVideo && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Current Selection</p>
                                <div className="relative flex items-center gap-2 p-2 bg-muted rounded-md">
                                  <Video size={16} className="text-muted-foreground" />
                                  <span className="text-xs truncate flex-1">{recastVideo.name}</span>
                                  {recastVideo.duration && (
                                    <span className="text-xs text-muted-foreground">{recastVideo.duration}s</span>
                                  )}
                                  <button 
                                    onClick={() => setRecastVideo(null)}
                                    className="bg-red-500 text-white rounded-full p-1"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Upload New */}
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Upload New</p>
                              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary transition">
                                <Upload size={16} className="text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Click to upload</span>
                                <input 
                                  type="file" 
                                  accept="video/mp4,video/quicktime,video/x-matroska" 
                                  className="hidden" 
                                  onChange={handleRecastVideoUpload}
                                />
                              </label>
                            </div>

                            {/* Saved Videos */}
                            {savedVideos.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">My Videos</p>
                                {isLoadingVideos ? (
                                  <div className="flex justify-center py-2">
                                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                    {savedVideos.map((video) => {
                                      // Generate Cloudinary video thumbnail URL
                                      // Format: /video/upload/so_0,w_80,h_60,c_fill,f_jpg/...
                                      const thumbnailUrl = video.url
                                        .replace('/video/upload/', '/video/upload/so_0,w_80,h_60,c_fill,f_jpg/')
                                      
                                      return (
                                        <div 
                                          key={video.id} 
                                          className={`relative group cursor-pointer rounded-md overflow-hidden transition ${
                                            recastVideo?.id === video.id ? 'ring-2 ring-emerald-500' : 'hover:ring-1 hover:ring-border'
                                          }`}
                                          onClick={() => setRecastVideo({ id: video.id, url: video.url, name: video.name, duration: video.duration })}
                                        >
                                          <img 
                                            src={thumbnailUrl} 
                                            alt={video.name}
                                            className="w-full h-12 object-cover bg-muted"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                          <div className="hidden w-full h-12 bg-muted flex items-center justify-center">
                                            <Video size={16} className="text-muted-foreground" />
                                          </div>
                                          {video.duration && (
                                            <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded">
                                              {video.duration}s
                                            </span>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteVideo(video.id);
                                            }}
                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Character Selection for Recast */}
                      <button 
                        onClick={onCharactersClick}
                        className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          selectedCharacters.length > 0 
                            ? 'bg-pill-green text-pill-green-text' 
                            : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}
                      >
                        {selectedCharacters.length > 0 ? (
                          <>
                            <img 
                              src={selectedCharacters[0].image || selectedCharacters[0].image_url || selectedCharacters[0].avatar} 
                              alt={selectedCharacters[0].name} 
                              className="w-5 h-5 rounded-full object-cover" 
                            />
                            <span className="max-w-[80px] truncate">{selectedCharacters[0].name}</span>
                          </>
                        ) : (
                          <>
                            <User size={14} />
                            Character
                          </>
                        )}
                      </button>

                      {/* Resolution Selector */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            recastResolution !== '480p' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {recastResolution}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setRecastResolution('480p')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${recastResolution === '480p' ? 'bg-secondary' : ''}`}
                            >
                              480p
                            </button>
                            <button 
                              onClick={() => setRecastResolution('580p')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${recastResolution === '580p' ? 'bg-secondary' : ''}`}
                            >
                              580p
                            </button>
                            <button 
                              onClick={() => setRecastResolution('720p')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${recastResolution === '720p' ? 'bg-secondary' : ''}`}
                            >
                              720p
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Frame Button - Shows selected character as frame */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={onCharactersClick}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              selectedCharacters.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <ImageIcon size={14} />
                            Frame
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select Frame Image</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : selectedAnimateMode === 'Story' ? (
                    <>
                      {/* Story Mode Controls - uses sora-2-pro-storyboard */}
                      <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-orange text-pill-orange-text hover:opacity-80">
                        <Video size={14} />
                        Sora Storyboard
                      </button>

                      {/* Character button - disabled if reference is selected */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              if (storyReferenceImage) {
                                toast({
                                  title: "Clear reference first",
                                  description: "You can use either a character OR a reference image, not both.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              onCharactersClick?.();
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : storyReferenceImage
                                  ? 'bg-pill-gray/50 text-pill-gray-text/50 cursor-not-allowed'
                                  : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <User size={14} />
                            Character
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{storyReferenceImage ? 'Clear reference to select character' : 'Select Character'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Reference button - opens modal like image section */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              if (videoModeState.characters.length > 0) {
                                toast({
                                  title: "Clear character first",
                                  description: "You can use either a character OR reference images, not both.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              onReferencesClick?.();
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              selectedReferences.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : videoModeState.characters.length > 0
                                  ? 'bg-pill-gray/50 text-pill-gray-text/50 cursor-not-allowed'
                                  : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <ImageIcon size={14} />
                            Reference {selectedReferences.length > 0 && `(${selectedReferences.length})`}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{videoModeState.characters.length > 0 ? 'Clear character to add references' : 'Add up to 10 reference images'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Scenes dropdown - Auto/Manual */}
                      <DropdownMenu open={isStorySceneModeDropdownOpen} onOpenChange={setIsStorySceneModeDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              storySceneMode === 'Manual'
                                ? 'bg-pill-green text-pill-green-text' 
                                : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
                          >
                            <Clapperboard size={14} />
                            Scenes: {storySceneMode}
                            <ChevronDown size={14} className={`transition-transform ${isStorySceneModeDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-36 bg-background border-border">
                          <DropdownMenuItem
                            onClick={() => setStorySceneMode('Auto')}
                            className={storySceneMode === 'Auto' ? 'bg-secondary' : ''}
                          >
                            Auto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStorySceneMode('Manual')}
                            className={storySceneMode === 'Manual' ? 'bg-secondary' : ''}
                          >
                            Manual
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-gray text-pill-gray-text hover:opacity-80">
                            {storyDuration}s
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-36 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setStoryDuration('10')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${storyDuration === '10' ? 'bg-secondary' : ''}`}
                            >
                              10 seconds
                            </button>
                            <button 
                              onClick={() => setStoryDuration('15')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${storyDuration === '15' ? 'bg-secondary' : ''}`}
                            >
                              15 seconds
                            </button>
                            <button 
                              onClick={() => setStoryDuration('25')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${storyDuration === '25' ? 'bg-secondary' : ''}`}
                            >
                              25 seconds
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== 'landscape' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            <RatioIcon size={14} />
                            {videoAspectRatio === 'portrait' ? 'Portrait' : 'Landscape'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-background border-border z-50">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setVideoAspectRatio('landscape')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2 ${videoAspectRatio === 'landscape' ? 'bg-secondary' : ''}`}
                            >
                              <div className="w-5 h-3 border-2 border-current"></div>
                              Landscape
                            </button>
                            <button 
                              onClick={() => setVideoAspectRatio('portrait')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2 ${videoAspectRatio === 'portrait' ? 'bg-secondary' : ''}`}
                            >
                              <div className="w-3 h-5 border-2 border-current"></div>
                              Portrait
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
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoModel !== 'veo3_fast' 
                              ? 'bg-pill-orange text-pill-orange-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            <Video size={14} />
                            {videoModels.find(m => m.value === videoModel)?.label || 'Veo 3.1 Fast'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50 max-h-80 overflow-y-auto">
                          <div className="space-y-1">
                            {videoModels
                              .filter((model) => {
                                // Podcast mode: only Veo 3 and Kling 2.6
                                if (selectedAnimateMode === 'Podcast') {
                                  return ['veo3', 'veo3_fast', 'kling-2.6'].includes(model.value);
                                }
                                // Draw mode: only Veo 3 models
                                if (selectedAnimateMode === 'Draw') {
                                  return ['veo3', 'veo3_fast'].includes(model.value);
                                }
                                // UGC mode: Veo 3 and Kling 2.6
                                if (selectedAnimateMode === 'UGC') {
                                  return ['veo3', 'veo3_fast', 'kling-2.6'].includes(model.value);
                                }
                                // Story mode: only Sora 2 Pro
                                if (selectedAnimateMode === 'Story') {
                                  return model.value === 'sora-2-pro';
                                }
                                // Recast mode: only Wan models
                                if (selectedAnimateMode === 'Recast') {
                                  return ['wan-2.5', 'wan-2.2'].includes(model.value);
                                }
                                // Avatar Video and Lip-Sync: Kling Avatar and Wan Avatar are handled separately
                                if (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync') {
                                  return false; // Avatar Video/Lip-Sync has its own model selector
                                }
                                // All other modes: show all models
                                return true;
                              })
                              .map((model) => (
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
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              videoModeState.characters.length > 0 
                                ? 'bg-pill-green text-pill-green-text' 
                                : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}
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
                        className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          videoModeState.references.length > 0 || videoModeState.startingFrame || videoModeState.endingFrame
                            ? 'bg-pill-green text-pill-green-text' 
                            : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}
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
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoAspectRatio !== '16:9' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
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
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            videoDuration !== '10' 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
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
                          <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-gray text-pill-gray-text hover:opacity-80">
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
              <div className="flex flex-col gap-2">
                {/* Audio Preview Row (shows ABOVE the buttons) */}
                {selectedAudioMode === 'Transcribe' && transcribeAudio && (
                  <div 
                    className="flex items-center gap-2 bg-secondary/80 rounded-xl px-3 py-1.5 group w-fit"
                    onMouseEnter={() => setIsHoveringAudioIcon(true)}
                    onMouseLeave={() => setIsHoveringAudioIcon(false)}
                  >
                    <div 
                      className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden flex-shrink-0"
                      onClick={() => {
                        if (isPlayingTranscribePreview) {
                          transcribePreviewAudioRef.current?.pause();
                          setIsPlayingTranscribePreview(false);
                        } else {
                          if (!transcribePreviewAudioRef.current) {
                            transcribePreviewAudioRef.current = new Audio(transcribeAudio.url);
                            transcribePreviewAudioRef.current.onended = () => setIsPlayingTranscribePreview(false);
                          }
                          transcribePreviewAudioRef.current.play();
                          setIsPlayingTranscribePreview(true);
                        }
                      }}
                    >
                      <AudioLines size={16} className={`text-white transition ${isHoveringAudioIcon ? 'opacity-30' : 'opacity-100'}`} />
                      <div className={`absolute inset-0 flex items-center justify-center transition ${isHoveringAudioIcon ? 'opacity-100' : 'opacity-0'}`}>
                        {isPlayingTranscribePreview ? (
                          <Pause size={14} className="text-white" />
                        ) : (
                          <Play size={14} className="text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <span className="text-sm font-medium text-foreground max-w-32 truncate">
                      {transcribeAudio.name}
                    </span>

                    <button
                      onClick={() => {
                        transcribePreviewAudioRef.current?.pause();
                        setIsPlayingTranscribePreview(false);
                        setTranscribeAudio(null);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                      aria-label="Remove audio"
                    >
                      <X size={14} className="text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                )}

                {/* Buttons Row */}
                <div className="flex items-center gap-2 min-w-[600px]">
                  {/* Audio Mode Dropdown */}
                  <DropdownMenu open={isAudioModeDropdownOpen} onOpenChange={setIsAudioModeDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80">
                        {(() => {
                          const mode = audioModes.find(m => m.value === selectedAudioMode);
                          const Icon = mode?.icon || Mic;
                          return <Icon size={14} />;
                        })()}
                        {selectedAudioMode}
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-background border-border z-50">
                      {audioModes.map((mode) => (
                        <DropdownMenuItem
                          key={mode.value}
                          onClick={() => {
                            setSelectedAudioMode(mode.value);
                            setIsAudioModeDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2 ${selectedAudioMode === mode.value ? 'text-primary font-medium' : ''}`}
                        >
                          <mode.icon size={16} />
                          {mode.label}
                          {selectedAudioMode === mode.value && <Check size={14} className="ml-auto" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Transcribe Mode Controls */}
                  {selectedAudioMode === 'Transcribe' && (
                    <>
                      {/* ElevenLabs Model Indicator */}
                      <div className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text cursor-default">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        ElevenLabs
                      </div>
                      
                      {/* Upload Audio Button */}
                      <button 
                        onClick={() => setIsAudioSelectModalOpen(true)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap hover:opacity-80 ${
                          transcribeAudio ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        }`}
                      >
                        <Upload size={14} />
                        {transcribeAudio ? 'Audio Added' : 'Upload Audio'}
                      </button>
                      
                      {/* Menu Icon */}
                      <button className="text-muted-foreground hover:text-foreground transition bg-muted rounded-lg p-2">
                        <MoreVertical size={16} />
                      </button>
                    </>
                  )}

                  {/* Sound Effects Mode Controls */}
                  {selectedAudioMode === 'Sound Effects' && (
                    <>
                      {/* Duration Selector */}
                      <Popover open={isSfxDurationPopoverOpen} onOpenChange={setIsSfxDurationPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            sfxDuration !== undefined ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {sfxDuration !== undefined ? `${sfxDuration}s` : 'Duration'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-background border-border z-50 p-3">
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Duration (0.5-22 seconds)</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0.5"
                                max="22"
                                step="0.5"
                                value={sfxDuration ?? 5}
                                onChange={(e) => setSfxDuration(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-green"
                              />
                              <span className="text-sm font-medium w-12 text-right">{sfxDuration ?? 'Auto'}s</span>
                            </div>
                            <button
                              onClick={() => {
                                setSfxDuration(undefined);
                                setIsSfxDurationPopoverOpen(false);
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition"
                            >
                              Auto (optimal)
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Loop Toggle */}
                      <button
                        onClick={() => setSfxLoop(!sfxLoop)}
                        className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          sfxLoop ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}
                      >
                        <RefreshCw size={14} />
                        {sfxLoop ? 'Loop On' : 'Loop'}
                      </button>

                      {/* Prompt Influence */}
                      <Popover open={isSfxInfluencePopoverOpen} onOpenChange={setIsSfxInfluencePopoverOpen}>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            sfxPromptInfluence !== 0.3 ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            Influence: {Math.round(sfxPromptInfluence * 100)}%
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 bg-background border-border z-50 p-3">
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">How closely to follow the prompt (0-100%)</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={sfxPromptInfluence}
                                onChange={(e) => setSfxPromptInfluence(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-green"
                              />
                              <span className="text-sm font-medium w-12 text-right">{Math.round(sfxPromptInfluence * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>More variation</span>
                              <span>More precise</span>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Output Format */}
                      <Popover open={isSfxFormatPopoverOpen} onOpenChange={setIsSfxFormatPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            sfxOutputFormat !== 'mp3_44100_128' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {sfxOutputFormat.split('_')[0].toUpperCase()}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50 max-h-72 overflow-y-auto">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground mb-2 px-2">Output Format</p>
                            {[
                              { value: 'mp3_44100_128', label: 'MP3 128kbps (Default)' },
                              { value: 'mp3_44100_192', label: 'MP3 192kbps (High Quality)' },
                              { value: 'mp3_44100_64', label: 'MP3 64kbps' },
                              { value: 'mp3_44100_32', label: 'MP3 32kbps' },
                              { value: 'wav_44100', label: 'WAV 44.1kHz' },
                              { value: 'pcm_44100', label: 'PCM 44.1kHz' },
                              { value: 'pcm_24000', label: 'PCM 24kHz' },
                              { value: 'pcm_16000', label: 'PCM 16kHz' },
                              { value: 'opus_48000_128', label: 'Opus 128kbps' },
                              { value: 'opus_48000_64', label: 'Opus 64kbps' },
                            ].map((format) => (
                              <button 
                                key={format.value}
                                onClick={() => {
                                  setSfxOutputFormat(format.value);
                                  setIsSfxFormatPopoverOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${sfxOutputFormat === format.value ? 'bg-brand-green/10 font-medium' : ''}`}
                              >
                                {format.label}
                                {sfxOutputFormat === format.value && <Check size={14} className="text-brand-green" />}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}

                  {/* Music Mode Controls */}
                  {selectedAudioMode === 'Music' ? (
                    <>
                    {/* Music Mode Controls */}
                    {/* Model Selector */}
                    <Popover open={isMusicModelPopoverOpen} onOpenChange={setIsMusicModelPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80">
                          <Music size={14} />
                          {musicModel}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 bg-background border-border z-50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground mb-2 px-2">Model Version</p>
                          {(['V5', 'V4_5PLUS', 'V4_5ALL', 'V4_5', 'V4'] as const).map((model) => (
                            <button 
                              key={model}
                              onClick={() => {
                                setMusicModel(model);
                                setIsMusicModelPopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${musicModel === model ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              <span>
                                {model === 'V5' && 'V5 (Best)'}
                                {model === 'V4_5PLUS' && 'V4.5+ (Rich)'}
                                {model === 'V4_5ALL' && 'V4.5 All'}
                                {model === 'V4_5' && 'V4.5 (Fast)'}
                                {model === 'V4' && 'V4 (Basic)'}
                              </span>
                              {musicModel === model && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Instrumental Toggle */}
                    <button
                      onClick={() => setMusicInstrumental(!musicInstrumental)}
                      className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                        musicInstrumental ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                      } hover:opacity-80`}
                    >
                      {musicInstrumental ? '🎹 Instrumental' : '🎤 With Vocals'}
                    </button>

                    {/* Vocal Gender & Lyrics (only when With Vocals is selected) */}
                    {!musicInstrumental && (
                      <>
                        {/* Vocal Gender Selector */}
                        <div className="flex items-center gap-1 bg-pill-gray rounded-full p-0.5">
                          <button
                            onClick={() => setVocalGender('f')}
                            className={`px-3 py-1 rounded-full text-sm transition whitespace-nowrap ${
                              vocalGender === 'f' ? 'bg-pill-green text-pill-green-text' : 'text-pill-gray-text hover:text-foreground'
                            }`}
                          >
                            👩 Female
                          </button>
                          <button
                            onClick={() => setVocalGender('m')}
                            className={`px-3 py-1 rounded-full text-sm transition whitespace-nowrap ${
                              vocalGender === 'm' ? 'bg-pill-green text-pill-green-text' : 'text-pill-gray-text hover:text-foreground'
                            }`}
                          >
                            👨 Male
                          </button>
                        </div>

                        {/* Lyrics Input */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              musicLyrics ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                            } hover:opacity-80`}>
                              <FileText size={14} />
                              {musicLyrics ? 'Lyrics ✓' : 'Add Lyrics'}
                              <ChevronDown size={14} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 bg-background border-border z-50 p-3">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Enter your song lyrics (max {musicModel === 'V4' ? '3000' : '5000'} characters)</p>
                                <div className="flex items-center gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleLyricsEnhance(true)}
                                          disabled={isEnhancingLyrics}
                                          className="p-1.5 rounded-md bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition disabled:opacity-50"
                                        >
                                          {isEnhancingLyrics ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Auto-generate lyrics from theme</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleLyricsEnhance(false)}
                                          disabled={isEnhancingLyrics || !musicLyrics.trim()}
                                          className="p-1.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition disabled:opacity-50"
                                        >
                                          {isEnhancingLyrics ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Enhance existing lyrics</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <textarea
                                value={musicLyrics}
                                onChange={(e) => setMusicLyrics(e.target.value)}
                                placeholder="Write your lyrics here or use ✨ to auto-generate..."
                                className="w-full px-3 py-2 text-sm bg-secondary rounded-md border-none outline-none resize-none min-h-[200px]"
                                maxLength={musicModel === 'V4' ? 3000 : 5000}
                              />
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">{musicLyrics.length}/{musicModel === 'V4' ? '3000' : '5000'}</p>
                                {musicLyrics && (
                                  <button
                                    onClick={() => setMusicLyrics('')}
                                    className="text-xs text-red-400 hover:text-red-300"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* Custom Mode Toggle */}
                    <button
                      onClick={() => setMusicCustomMode(!musicCustomMode)}
                      className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                        musicCustomMode ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                      } hover:opacity-80`}
                    >
                      {musicCustomMode ? '⚙️ Custom' : 'Custom'}
                    </button>

                    {/* Style input (only in custom mode) */}
                    {musicCustomMode && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            musicStyle ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {musicStyle || 'Style'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50 p-3">
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Music Style</p>
                            <input
                              type="text"
                              value={musicStyle}
                              onChange={(e) => setMusicStyle(e.target.value)}
                              placeholder="Enter style..."
                              className="w-full px-3 py-2 text-sm bg-secondary rounded-md border-none outline-none"
                              maxLength={musicModel === 'V4' ? 200 : 1000}
                            />
                            <div className="flex flex-wrap gap-1">
                              {['Jazz', 'Classical', 'Electronic', 'Pop', 'Rock', 'Hip-hop', 'Ambient', 'Cinematic', 'Folk', 'Reggae', 'Urban', 'Disco', 'Ethnic', 'Country', 'R&B', 'Blues'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setMusicStyle(s)}
                                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Title input (only in custom mode) */}
                    {musicCustomMode && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            musicTitle ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}>
                            {musicTitle ? musicTitle.substring(0, 15) + (musicTitle.length > 15 ? '...' : '') : 'Title'}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-background border-border z-50 p-3">
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Track Title (max 80 characters)</p>
                            <input
                              type="text"
                              value={musicTitle}
                              onChange={(e) => setMusicTitle(e.target.value)}
                              placeholder="Enter title..."
                              className="w-full px-3 py-2 text-sm bg-secondary rounded-md border-none outline-none"
                              maxLength={80}
                            />
                            <p className="text-xs text-muted-foreground text-right">{musicTitle.length}/80</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </>
                ) : selectedAudioMode === 'Clone' ? (
                  <>
                    {/* Clone Mode - Show button to open Audio Modal */}
                    <button
                      onClick={() => setIsAudioUploadModalOpen(true)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-violet-500 text-white hover:bg-violet-600"
                    >
                      <Mic size={14} />
                      Clone Voice
                    </button>
                    
                    {/* My Cloned Voices Button with Popover - for selection */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                          selectedClonedVoice 
                            ? 'bg-violet-500 text-white' 
                            : 'bg-violet-500/10 border border-violet-500/30 text-violet-500 hover:bg-violet-500/20'
                        }`}>
                          <Copy size={14} />
                          {selectedClonedVoice ? selectedClonedVoice.name : 'Select Voice'}
                          {!selectedClonedVoice && clonedVoices.length > 0 && (
                            <span className="bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded-full">{clonedVoices.length}</span>
                          )}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-background border-border z-50 p-0">
                        <div className="p-4 border-b border-border">
                          <h3 className="font-semibold text-sm">My Cloned Voices</h3>
                          <p className="text-xs text-muted-foreground mt-1">Select a voice for TTS generation</p>
                        </div>
                        <div className="p-3 max-h-64 overflow-y-auto">
                          {isLoadingClonedVoices ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 size={20} className="animate-spin text-muted-foreground" />
                            </div>
                          ) : clonedVoices.length > 0 ? (
                            <div className="space-y-2">
                              {clonedVoices.map((voice) => (
                                <div 
                                  key={voice.id}
                                  onClick={() => setSelectedClonedVoice(voice)}
                                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                                    selectedClonedVoice?.id === voice.id 
                                      ? 'bg-violet-500/20 border border-violet-500' 
                                      : 'bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {selectedClonedVoice?.id === voice.id ? (
                                      <Check size={14} className="text-violet-500" />
                                    ) : (
                                      <Copy size={14} className="text-violet-500" />
                                    )}
                                    <span className="text-sm font-medium">{voice.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playVoiceoverPreview(voice.elevenlabs_voice_id);
                                      }}
                                      disabled={loadingVoiceId !== null}
                                      className="p-2 rounded-full hover:bg-violet-500/20 transition"
                                    >
                                      {loadingVoiceId === voice.elevenlabs_voice_id ? (
                                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                      ) : playingVoiceId === voice.elevenlabs_voice_id ? (
                                        <div className="w-3 h-3 rounded-sm bg-brand-red" />
                                      ) : (
                                        <Play size={14} className="text-violet-500" />
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteClonedVoice(voice.id, e)}
                                      disabled={deletingClonedVoiceId === voice.id}
                                      className="p-2 rounded-full hover:bg-red-500/20 transition"
                                    >
                                      {deletingClonedVoiceId === voice.id ? (
                                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                      ) : (
                                        <Trash2 size={14} className="text-red-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Copy size={24} className="mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">No cloned voices yet</p>
                              <p className="text-xs text-muted-foreground mt-1">Clone a voice first</p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : selectedAudioMode === 'Revoice' ? (
                  <>
                {/* Revoice Mode Controls - Upload audio, record, and select target language */}
                    
                    {/* Audio Selection Popover with History */}
                    {revoiceAudio ? (
                      <button 
                        onClick={() => setRevoiceAudio(null)}
                        className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80"
                      >
                        <AudioLines size={14} />
                        <span className="max-w-24 truncate">{revoiceAudio.name}</span>
                        {revoiceAudio.duration && <span className="text-xs opacity-75">({revoiceAudio.duration}s)</span>}
                        <X size={14} />
                      </button>
                    ) : (
                      <Popover open={isRevoiceAudioPopoverOpen} onOpenChange={setIsRevoiceAudioPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-gray text-pill-gray-text hover:opacity-80">
                            <Upload size={14} />
                            Audio
                            {savedRevoiceAudio.length > 0 && (
                              <span className="bg-brand-green text-primary text-xs px-1.5 py-0.5 rounded-full">{savedRevoiceAudio.length}</span>
                            )}
                            <ChevronDown size={14} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-background border-border z-50 p-0">
                          <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-sm">Audio Source</h3>
                            <p className="text-xs text-muted-foreground mt-1">Upload, record, or select from history</p>
                          </div>
                          
                          {/* Upload and Record buttons */}
                          <div className="p-3 flex gap-2 border-b border-border">
                            <label className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 cursor-pointer">
                              {isUploadingRevoiceAudio ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Upload size={14} />
                              )}
                              Upload
                              <input 
                                type="file" 
                                accept="audio/*,video/mp4" 
                                className="hidden"
                                disabled={isUploadingRevoiceAudio}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Get audio duration first
                                    const audio = new Audio();
                                    audio.src = URL.createObjectURL(file);
                                    audio.onloadedmetadata = async () => {
                                      const duration = Math.round(audio.duration);
                                      URL.revokeObjectURL(audio.src);
                                      // Upload and save to history
                                      await handleRevoiceAudioUpload(file, duration);
                                      setIsRevoiceAudioPopoverOpen(false);
                                    };
                                    audio.onerror = async () => {
                                      // For video files, duration might not load
                                      await handleRevoiceAudioUpload(file);
                                      setIsRevoiceAudioPopoverOpen(false);
                                    };
                                  }
                                }}
                              />
                            </label>
                            
                            <button
                              onClick={async () => {
                                if (isRevoiceRecording) {
                                  // Stop recording
                                  if (revoiceMediaRecorderRef.current) {
                                    revoiceMediaRecorderRef.current.stop();
                                    setIsRevoiceRecording(false);
                                  }
                                } else {
                                  // Start recording
                                  try {
                                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                    const preferredMimeType =
                                      MediaRecorder.isTypeSupported('audio/mp4')
                                        ? 'audio/mp4'
                                        : MediaRecorder.isTypeSupported('audio/ogg')
                                          ? 'audio/ogg'
                                          : 'audio/webm';

                                    const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMimeType });
                                    revoiceMediaRecorderRef.current = mediaRecorder;
                                    revoiceAudioChunksRef.current = [];
                                    
                                    mediaRecorder.ondataavailable = (event) => {
                                      if (event.data.size > 0) {
                                        revoiceAudioChunksRef.current.push(event.data);
                                      }
                                    };
                                    
                                    mediaRecorder.onstop = async () => {
                                      const mimeType = mediaRecorder.mimeType || preferredMimeType;
                                      const extension = mimeType.includes('mp4')
                                        ? 'mp4'
                                        : mimeType.includes('ogg')
                                          ? 'ogg'
                                          : 'webm';
                                      
                                      const audioBlob = new Blob(revoiceAudioChunksRef.current, { type: mimeType });
                                      const audioFile = new File([audioBlob], `Recording_${Date.now()}.${extension}`, { type: mimeType });
                                      
                                      // Get duration
                                      const audioUrl = URL.createObjectURL(audioBlob);
                                      const audio = new Audio(audioUrl);
                                      audio.onloadedmetadata = async () => {
                                        const duration = Math.round(audio.duration);
                                        URL.revokeObjectURL(audioUrl);
                                        // Upload and save to history
                                        await handleRevoiceAudioUpload(audioFile, duration);
                                        setIsRevoiceAudioPopoverOpen(false);
                                      };
                                      audio.onerror = async () => {
                                        await handleRevoiceAudioUpload(audioFile);
                                        setIsRevoiceAudioPopoverOpen(false);
                                      };
                                      
                                      // Stop all tracks
                                      stream.getTracks().forEach(track => track.stop());
                                    };
                                    
                                    mediaRecorder.start();
                                    setIsRevoiceRecording(true);
                                  } catch (error) {
                                    console.error('Error accessing microphone:', error);
                                    toast({
                                      title: "Microphone access denied",
                                      description: "Please allow microphone access to record audio",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                                isRevoiceRecording 
                                  ? 'bg-brand-red text-white animate-pulse' 
                                  : 'bg-secondary hover:bg-secondary/80'
                              }`}
                            >
                              <Mic size={14} />
                              {isRevoiceRecording ? 'Stop' : 'Record'}
                            </button>
                          </div>
                          
                          {/* Audio History */}
                          <div className="p-3 max-h-64 overflow-y-auto">
                            <p className="text-xs text-muted-foreground mb-2 px-1">History</p>
                            {isLoadingRevoiceAudio ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 size={20} className="animate-spin text-muted-foreground" />
                              </div>
                            ) : savedRevoiceAudio.length > 0 ? (
                              <div className="space-y-2">
                                {savedRevoiceAudio.map((audio) => (
                                  <div 
                                    key={audio.id}
                                    onClick={() => handleSelectRevoiceAudioFromHistory(audio)}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition bg-secondary/50 hover:bg-secondary"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <button
                                        onClick={(e) => handlePlayRevoiceHistory(audio, e)}
                                        className="p-1.5 rounded-full bg-brand-green/20 hover:bg-brand-green/30 transition flex-shrink-0"
                                      >
                                        {playingRevoiceHistoryId === audio.id ? (
                                          <Pause size={12} className="text-brand-green" />
                                        ) : (
                                          <Play size={12} className="text-brand-green ml-0.5" />
                                        )}
                                      </button>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{audio.name}</p>
                                        {audio.duration && (
                                          <p className="text-xs text-muted-foreground">{audio.duration}s</p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => handleDeleteRevoiceAudio(audio.id, e)}
                                      className="p-2 rounded-full hover:bg-red-500/20 transition flex-shrink-0"
                                    >
                                      <Trash2 size={14} className="text-red-500" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <AudioLines size={24} className="mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No saved audio yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Upload or record to save</p>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Source Language */}
                    <Popover open={isSourceLanguagePopoverOpen} onOpenChange={setIsSourceLanguagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          revoiceSourceLanguage !== 'auto' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}>
                          From: {revoiceSourceLanguage === 'auto' ? 'Auto' : revoiceSourceLanguage}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          <button 
                            onClick={() => {
                              setRevoiceSourceLanguage('auto');
                              setIsSourceLanguagePopoverOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${revoiceSourceLanguage === 'auto' ? 'bg-brand-green/10 font-medium' : ''}`}
                          >
                            Auto Detect
                            {revoiceSourceLanguage === 'auto' && <Check size={14} className="text-brand-green" />}
                          </button>
                          {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Dutch', 'Polish', 'Turkish'].map((lang) => (
                            <button 
                              key={lang}
                              onClick={() => {
                                setRevoiceSourceLanguage(lang);
                                setIsSourceLanguagePopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${revoiceSourceLanguage === lang ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {lang}
                              {revoiceSourceLanguage === lang && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Target Language */}
                    <Popover open={isTargetLanguagePopoverOpen} onOpenChange={setIsTargetLanguagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className="px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80">
                          <ArrowRightLeft size={14} />
                          To: {revoiceTargetLanguage}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {['Spanish', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Dutch', 'Polish', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian'].map((lang) => (
                            <button 
                              key={lang}
                              onClick={() => {
                                setRevoiceTargetLanguage(lang);
                                setIsTargetLanguagePopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${revoiceTargetLanguage === lang ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {lang}
                              {revoiceTargetLanguage === lang && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Duration indicator */}
                    {revoiceAudio?.duration && (
                      <span className="px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground">
                        {revoiceAudio.duration}s
                      </span>
                    )}
                  </>
                ) : selectedAudioMode === 'Voiceover' ? (
                  <>
                    {/* Voiceover Mode Controls */}
                    <Popover open={isAudioModelPopoverOpen} onOpenChange={setIsAudioModelPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 whitespace-nowrap bg-pill-green text-pill-green-text hover:opacity-80">
                          {selectedAudioModel === 'eleven_turbo_v2_5' ? 'Eleven Turbo v2.5' : 'Eleven Multilingual v2'}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 bg-background border-border z-50">
                        <div className="space-y-1">
                          <button 
                            onClick={() => {
                              setSelectedAudioModel('eleven_turbo_v2_5');
                              setIsAudioModelPopoverOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${selectedAudioModel === 'eleven_turbo_v2_5' ? 'bg-brand-green/10 text-foreground font-medium' : ''}`}
                          >
                            Eleven Turbo v2.5
                            {selectedAudioModel === 'eleven_turbo_v2_5' && <Check size={14} className="text-brand-green" />}
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAudioModel('eleven_multilingual_v2');
                              setIsAudioModelPopoverOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${selectedAudioModel === 'eleven_multilingual_v2' ? 'bg-brand-green/10 text-foreground font-medium' : ''}`}
                          >
                            Eleven Multilingual v2
                            {selectedAudioModel === 'eleven_multilingual_v2' && <Check size={14} className="text-brand-green" />}
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={isVoiceoverPopoverOpen} onOpenChange={setIsVoiceoverPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button 
                          className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                            selectedVoiceoverId 
                              ? 'bg-pill-green text-pill-green-text' 
                              : 'bg-pill-gray text-pill-gray-text'
                          } hover:opacity-80`}
                        >
                          <Mic size={14} />
                          {selectedVoiceoverName || 'Voice'}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 bg-background border-border z-50 p-3 max-h-80 overflow-y-auto">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground mb-2">Select a voice for your voiceover</p>
                          
                          {/* Standard Voices */}
                          {voiceoverLibrary.map((voice) => (
                            <div 
                              key={voice.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                                selectedVoiceoverId === voice.id ? 'bg-brand-green/10 border border-brand-green/30' : 'hover:bg-secondary'
                              }`}
                              onClick={() => {
                                setSelectedVoiceoverId(voice.id);
                                setSelectedVoiceoverName(voice.name);
                                setIsVoiceoverPopoverOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/20 flex items-center justify-center">
                                  <User size={14} className="text-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{voice.name}</p>
                                  <p className="text-xs text-muted-foreground">{voice.gender}</p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVoiceoverPreview(voice.id);
                                }}
                                disabled={loadingVoiceId !== null}
                                className="p-1.5 rounded-full hover:bg-secondary transition"
                              >
                                {loadingVoiceId === voice.id ? (
                                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                ) : playingVoiceId === voice.id ? (
                                  <div className="w-3 h-3 rounded-sm bg-brand-red" />
                                ) : (
                                  <Play size={14} className="text-brand-green" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={isLanguagePopoverOpen} onOpenChange={setIsLanguagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          voiceoverLanguage !== 'English' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}>
                          {voiceoverLanguage}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1">
                          {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'].map((lang) => (
                            <button 
                              key={lang}
                              onClick={() => {
                                setVoiceoverLanguage(lang);
                                setIsLanguagePopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${voiceoverLanguage === lang ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {lang}
                              {voiceoverLanguage === lang && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={isAccentPopoverOpen} onOpenChange={setIsAccentPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          voiceoverAccent !== 'American' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}>
                          {voiceoverAccent}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1">
                          {['American', 'British', 'Australian', 'Irish', 'Scottish', 'Indian', 'South African', 'Neutral'].map((accent) => (
                            <button 
                              key={accent}
                              onClick={() => {
                                setVoiceoverAccent(accent);
                                setIsAccentPopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${voiceoverAccent === accent ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {accent}
                              {voiceoverAccent === accent && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={isSpeedPopoverOpen} onOpenChange={setIsSpeedPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          voiceoverSpeed !== 'Normal' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}>
                          {voiceoverSpeed}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1">
                          {['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'].map((speed) => (
                            <button 
                              key={speed}
                              onClick={() => {
                                setVoiceoverSpeed(speed);
                                setIsSpeedPopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${voiceoverSpeed === speed ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {speed}
                              {voiceoverSpeed === speed && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={isTonePopoverOpen} onOpenChange={setIsTonePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-2 whitespace-nowrap ${
                          voiceoverTone !== 'Neutral' ? 'bg-pill-green text-pill-green-text' : 'bg-pill-gray text-pill-gray-text'
                        } hover:opacity-80`}>
                          {voiceoverTone}
                          <ChevronDown size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-background border-border z-50">
                        <div className="space-y-1">
                          {['Neutral', 'Friendly', 'Professional', 'Enthusiastic', 'Calm', 'Serious', 'Playful'].map((tone) => (
                            <button 
                              key={tone}
                              onClick={() => {
                                setVoiceoverTone(tone);
                                setIsTonePopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${voiceoverTone === tone ? 'bg-brand-green/10 font-medium' : ''}`}
                            >
                              {tone}
                              {voiceoverTone === tone && <Check size={14} className="text-brand-green" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : null}
                </div>
              </div>
            ) : isDesignMode ? (
              <>
                {/* Design Mode Controls */}
                {/* Type Dropdown - First */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <BookOpen size={16} className="text-brand-blue" />
                        Brochure
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <User size={16} className="text-brand-purple" />
                        Business Card
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <ImageIcon size={16} className="text-brand-green" />
                        Cover
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <FileText size={16} className="text-brand-yellow" />
                        Flyer
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <LayoutList size={16} className="text-brand-red" />
                        Infographic
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Gift size={16} className="text-brand-pink" />
                        Invitation
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Sparkles size={16} className="text-brand-blue" />
                        Logo
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Presentation size={16} className="text-brand-green" />
                        Poster
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Film size={16} className="text-brand-red" />
                        Thumbnail
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Model Dropdown */}
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
                  <PopoverContent className="w-[420px] p-0 bg-background border-border z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-secondary rounded-lg transition group">
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

                {/* Create Dropdown */}
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
                  <PopoverContent className="w-48 bg-background border-border z-50 max-h-80 overflow-y-auto">
                    <div className="space-y-1">
                      {['Engagement', 'Awareness', 'Traffic', 'Followers', 'Community', 'Education', 'Entertainment', 'Authority', 'Leads', 'Sales'].map((goal) => (
                        <button 
                          key={goal}
                          onClick={() => setContentGoal(goal)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition ${contentGoal === goal ? 'bg-secondary' : ''}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Language Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      contentLanguage !== 'English' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-muted hover:bg-muted/80'
                    }`}>
                      {(() => {
                        const langFlags: Record<string, string> = {
                          'English': '🇺🇸', 'Spanish': '🇪🇸', 'French': '🇫🇷', 'German': '🇩🇪', 'Portuguese': '🇵🇹',
                          'Bengali': '🇧🇩', 'Italian': '🇮🇹', 'Chinese': '🇨🇳', 'Japanese': '🇯🇵', 'Korean': '🇰🇷',
                          'Arabic': '🇸🇦', 'Hindi': '🇮🇳', 'Russian': '🇷🇺', 'Dutch': '🇳🇱', 'Polish': '🇵🇱',
                          'Turkish': '🇹🇷', 'Vietnamese': '🇻🇳', 'Thai': '🇹🇭', 'Indonesian': '🇮🇩', 'Malay': '🇲🇾',
                          'Swedish': '🇸🇪', 'Norwegian': '🇳🇴', 'Danish': '🇩🇰', 'Finnish': '🇫🇮', 'Greek': '🇬🇷',
                          'Czech': '🇨🇿', 'Romanian': '🇷🇴', 'Hungarian': '🇭🇺', 'Ukrainian': '🇺🇦', 'Hebrew': '🇮🇱',
                          'Swahili': '🇰🇪', 'Tagalog': '🇵🇭', 'Tamil': '🇮🇳', 'Telugu': '🇮🇳', 'Urdu': '🇵🇰',
                          'Persian': '🇮🇷', 'Catalan': '🇪🇸', 'Croatian': '🇭🇷', 'Slovak': '🇸🇰', 'Bulgarian': '🇧🇬'
                        };
                        return langFlags[contentLanguage] || '🌐';
                      })()}{' '}
                      {contentLanguage}
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-background border-border z-50 p-0">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search Languages..."
                          className="w-full pl-7 pr-3 py-1.5 text-sm bg-muted rounded-md border-none outline-none focus:ring-2 focus:ring-emerald-500"
                          onChange={(e) => {
                            const searchInput = e.target.parentElement?.parentElement?.nextElementSibling;
                            if (searchInput) {
                              const buttons = searchInput.querySelectorAll('button');
                              const query = e.target.value.toLowerCase();
                              buttons.forEach((btn) => {
                                const text = btn.textContent?.toLowerCase() || '';
                                (btn as HTMLElement).style.display = text.includes(query) ? 'flex' : 'none';
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                      {[
                        { name: 'English', flag: '🇺🇸' },
                        { name: 'Spanish', flag: '🇪🇸' },
                        { name: 'French', flag: '🇫🇷' },
                        { name: 'German', flag: '🇩🇪' },
                        { name: 'Portuguese', flag: '🇵🇹' },
                        { name: 'Italian', flag: '🇮🇹' },
                        { name: 'Dutch', flag: '🇳🇱' },
                        { name: 'Russian', flag: '🇷🇺' },
                        { name: 'Chinese', flag: '🇨🇳' },
                        { name: 'Japanese', flag: '🇯🇵' },
                        { name: 'Korean', flag: '🇰🇷' },
                        { name: 'Arabic', flag: '🇸🇦' },
                        { name: 'Hindi', flag: '🇮🇳' },
                        { name: 'Bengali', flag: '🇧🇩' },
                        { name: 'Turkish', flag: '🇹🇷' },
                        { name: 'Vietnamese', flag: '🇻🇳' },
                        { name: 'Thai', flag: '🇹🇭' },
                        { name: 'Indonesian', flag: '🇮🇩' },
                        { name: 'Malay', flag: '🇲🇾' },
                        { name: 'Polish', flag: '🇵🇱' },
                        { name: 'Ukrainian', flag: '🇺🇦' },
                        { name: 'Greek', flag: '🇬🇷' },
                        { name: 'Czech', flag: '🇨🇿' },
                        { name: 'Romanian', flag: '🇷🇴' },
                        { name: 'Hungarian', flag: '🇭🇺' },
                        { name: 'Swedish', flag: '🇸🇪' },
                        { name: 'Norwegian', flag: '🇳🇴' },
                        { name: 'Danish', flag: '🇩🇰' },
                        { name: 'Finnish', flag: '🇫🇮' },
                        { name: 'Hebrew', flag: '🇮🇱' },
                        { name: 'Persian', flag: '🇮🇷' },
                        { name: 'Urdu', flag: '🇵🇰' },
                        { name: 'Tamil', flag: '🇮🇳' },
                        { name: 'Telugu', flag: '🇮🇳' },
                        { name: 'Tagalog', flag: '🇵🇭' },
                        { name: 'Swahili', flag: '🇰🇪' },
                        { name: 'Croatian', flag: '🇭🇷' },
                        { name: 'Slovak', flag: '🇸🇰' },
                        { name: 'Bulgarian', flag: '🇧🇬' },
                        { name: 'Catalan', flag: '🇪🇸' }
                      ].map((lang) => (
                        <button 
                          key={lang.name}
                          onClick={() => setContentLanguage(lang.name)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2 ${contentLanguage === lang.name ? 'bg-secondary' : ''}`}
                        >
                          <span>{lang.flag}</span>
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Days Selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Calendar size={14} />
                      {contentDays} Days
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-background border-border z-50 p-4">
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-foreground">Content Duration</p>
                      <p className="text-xs text-muted-foreground">Select how many days of content to generate</p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[7, 14, 21, 30, 60, 90].map((days) => (
                          <button
                            key={days}
                            onClick={() => setContentDays(days)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              contentDays === days 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                            }`}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Custom Days</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setContentDays(Math.max(1, contentDays - 1))}
                            className="w-10 h-10 flex items-center justify-center bg-muted hover:bg-muted/80 rounded-lg text-foreground font-bold text-lg transition"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={contentDays}
                            onChange={(e) => setContentDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                            className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-center border-none outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Enter days..."
                          />
                          <button
                            onClick={() => setContentDays(Math.min(365, contentDays + 1))}
                            className="w-10 h-10 flex items-center justify-center bg-muted hover:bg-muted/80 rounded-lg text-foreground font-bold text-lg transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        ≈ {selectedPlatforms.length > 0 ? selectedPlatforms.length * contentDays : contentDays} Posts Will Be Generated
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : isDocumentMode ? (
              <>
                {/* Document Mode Controls */}
                {/* Type Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition flex items-center gap-2 whitespace-nowrap">
                      Type
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-background border-border z-50">
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <BookOpen size={16} className="text-brand-blue" />
                        Ebook
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <FileText size={16} className="text-brand-purple" />
                        Whitepaper
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <LayoutList size={16} className="text-brand-green" />
                        Report
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Presentation size={16} className="text-brand-yellow" />
                        Business Plan
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <Package size={16} className="text-brand-red" />
                        Handbook
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <FileText size={16} className="text-brand-blue" />
                        Proposal
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <LayoutList size={16} className="text-brand-pink" />
                        Case Study
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center gap-2">
                        <FileText size={16} className="text-brand-green" />
                        Cover Letter
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Model Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Gemini Pro
                      <ChevronDown size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 bg-background border-border z-50" align="start">
                    <div className="space-y-1 p-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-secondary rounded-lg transition group">
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
              </>
            ) : (
              <>
                {/* Image Mode Controls */}
                {/* Type Dropdown - shows selected mode or "Type" */}
                <Popover open={isCreateModeDropdownOpen} onOpenChange={setIsCreateModeDropdownOpen}>
                  <PopoverTrigger asChild>
                    {(() => {
                      const mode = createModes.find(m => m.value === selectedCreateMode);
                      const isTypeSelected = selectedCreateMode !== 'Create';
                      return (
                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                          isTypeSelected 
                            ? `${mode?.bg || 'bg-slate-100'} ${mode?.color || 'text-slate-600'}` 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}>
                          {isTypeSelected ? (
                            <>
                              {(() => {
                                const IconComponent = mode?.icon || Sparkles;
                                return <IconComponent size={16} />;
                              })()}
                              <span>{selectedCreateMode}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCreateMode('Create');
                                }}
                                className="ml-1 p-0.5 hover:opacity-70 rounded"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <LayoutGrid size={16} className="text-slate-500" />
                              <span>Type</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 bg-background border-border z-50" align="start">
                    <div className="grid grid-cols-4 gap-2">
                      {createModes.map((mode) => {
                        const IconComponent = mode.icon;
                        return (
                          <button
                            key={mode.value}
                            onClick={() => {
                              setSelectedCreateMode(mode.value);
                              setIsCreateModeDropdownOpen(false);
                            }}
                            className={`text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition flex items-center gap-2 ${
                              selectedCreateMode === mode.value ? 'bg-secondary' : ''
                            }`}
                          >
                            <IconComponent size={16} className={mode.color} />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Only show separator and other buttons when a type is selected */}
                {selectedCreateMode !== 'Create' && (
                  <>
                    {/* Vertical separator */}
                    <div className="w-px h-8 bg-slate-200 mx-2 flex-shrink-0" />

            {/* Model Dropdown - Show "11 Labs" static pill in Transcribe mode */}
            {isAudioMode && selectedAudioMode === 'Transcribe' ? (
              <div className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap bg-violet-500/20 text-violet-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-violet-500">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                ElevenLabs
              </div>
            ) : (
            <Popover open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button className={`px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-sm font-medium ${
                      selectedModel === 'auto' && selectedCreateMode === 'Create'
                        ? 'bg-emerald-100 text-emerald-600' 
                        : selectedModel !== 'auto' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}>
                      <Box size={16} />
                      <span>{selectedModel === 'auto' ? 'Auto' : selectedModel}</span>
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Model</TooltipContent>
              </Tooltip>
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
                  
                  {/* Z-Image - text-to-image only, hidden when reference/character selected */}
                  {!hasImageReference && selectedCreateMode !== 'Swap' && selectedCreateMode !== 'Photoshoot' && selectedCreateMode !== 'Draw' && (
                  <button
                    onClick={() => { setSelectedModel('z-image'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
                      selectedModel === 'z-image' ? 'bg-brand-green/10' : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">Z</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-foreground text-sm">Z-Image</span>
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] px-1.5 py-0 h-4">NEW</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Hyper-realistic text-to-image generation</p>
                      </div>
                    </div>
                  </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            )}
            
            {/* Style Icon Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsStylesModalOpen(true)}
                  className={`p-2.5 rounded-full transition ${
                    selectedStyle 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
                >
                  <Brush size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Style</TooltipContent>
            </Tooltip>
            
            {/* Character Icon Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onCharactersClick}
                  className={`p-2.5 rounded-full transition ${
                    activeCharacters.length > 0 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
                >
                  <User size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Character</TooltipContent>
            </Tooltip>
            
            {/* Reference Icon Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onReferencesClick}
                  className={`p-2.5 rounded-full transition ${
                    activeReferences.length > 0 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
                >
                  <Link size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Reference</TooltipContent>
            </Tooltip>
            
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
            
            {/* Ratio Icon Button */}
            <Popover open={isAspectRatioDropdownOpen} onOpenChange={setIsAspectRatioDropdownOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button className={`p-2.5 rounded-full transition ${
                      selectedAspectRatio !== '1:1' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}>
                      <Copy size={18} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Ratio</TooltipContent>
              </Tooltip>
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
            {/* Number Icon Button */}
            <Popover open={isNumberOfImagesDropdownOpen} onOpenChange={setIsNumberOfImagesDropdownOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button className={`p-2.5 rounded-full transition ${
                      numberOfImages !== 1 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}>
                      <Hash size={18} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Number</TooltipContent>
              </Tooltip>
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
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end flex-nowrap shrink-0">
            <Popover>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button 
                        disabled={isEnhancing || !getCurrentTextToEnhance().text.trim() || (isAudioMode && selectedAudioMode === 'Transcribe')}
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
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black border-black text-white">
                    <p>Enhance Prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-56 bg-background border-border z-50">
                <div className="space-y-1">
                  <button 
                    onClick={() => handleEnhancePrompt(true)}
                    disabled={isEnhancing || !getCurrentTextToEnhance().text.trim() || (isAudioMode && selectedAudioMode === 'Transcribe')}
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
                    disabled={isEnhancing || !getCurrentTextToEnhance().text.trim() || (isAudioMode && selectedAudioMode === 'Transcribe')}
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
            
            {/* Mic Button with Speech Recognition */}
            {isSupported && (
              isListening ? (
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => {
                          cancelListening();
                          setPrompt('');
                        }}
                        className="p-1.5 rounded-lg transition-colors bg-red-50 hover:bg-red-100"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Cancel</TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-[2px] px-2">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-red-400 rounded-full origin-center"
                        style={{
                          height: '16px',
                          animation: 'audioWave 0.6s ease-in-out infinite',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleMicClick}
                        className="p-1.5 rounded-lg transition-colors bg-green-50 hover:bg-green-100"
                      >
                        <Check size={16} className="text-green-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Done</TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleMicClick}
                      className="p-2.5 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                    >
                      <Mic size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Speak</TooltipContent>
                </Tooltip>
              )
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleGenerate}
                    disabled={
                      isGenerating || isTranscribing || isRevoicing ||
                      (isAudioMode && selectedAudioMode === 'Transcribe'
                        ? !transcribeAudio
                        : isAudioMode && selectedAudioMode === 'Clone'
                          ? false // Clone mode opens modal, no validation needed
                          : isAudioMode && selectedAudioMode === 'Revoice'
                            ? !revoiceAudio
                            : isAudioMode && selectedAudioMode === 'Music' && !musicInstrumental
                              ? !musicLyrics.trim() // Lyrics required for With Vocals mode
                              : isVideoMode && (selectedAnimateMode === 'Avatar Video' || selectedAnimateMode === 'Lip-Sync')
                                ? (!ugcScriptText.trim() || selectedCharacters.length === 0 || (uploadedAudio?.duration && uploadedAudio.duration > 15) || ugcScriptText.length > 180)
                                : isVideoMode && selectedAnimateMode === 'UGC'
                                  ? (!prompt.trim() || selectedCharacters.length === 0 || !ugcProductImage)
                                  : isVideoMode && selectedAnimateMode === 'Story'
                                    ? (storySceneMode === 'Auto' 
                                        ? !prompt.trim() // Auto mode just needs a prompt
                                        : (!storyScenes.some(s => s.scene.trim().length >= 10) || (videoModeState.characters.length === 0 && selectedReferences.length === 0) || Math.abs(storyScenes.reduce((sum, s) => sum + s.duration, 0) - parseInt(storyDuration)) > 0.5))
                                    : !prompt.trim()
                      )
                    }
                    className="px-6 py-2.5 bg-brand-green hover:opacity-90 text-primary rounded-lg font-semibold flex items-center gap-2 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating || isTranscribing || isRevoicing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isTranscribing ? 'Transcribing...' : isRevoicing ? 'Translating...' : 'Generating...'}
                      </>
                    ) : isAudioMode && selectedAudioMode === 'Transcribe' ? (
                      <>
                        <Send className="h-4 w-4" />
                        Transcribe
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Generate For Free!
                      </>
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

      {/* Storyboard Scene Editor - Only visible when Story is selected in Video mode AND Manual mode */}
      {isVideoMode && selectedAnimateMode === 'Story' && storySceneMode === 'Manual' && (
        <div className="w-full mt-4">
          <StoryboardSceneEditor />
        </div>
      )}

      {/* Photoshoot Theme Selector - Only visible when Photoshoot is selected in Image mode */}
      {!isVideoMode && !isAudioMode && !isDesignMode && !isContentMode && !isAppsMode && !isDocumentMode && selectedCreateMode === 'Photoshoot' && (
        <div className="w-full mt-4">
          <PhotoshootThemeSelector />
        </div>
      )}

      {/* Music Samples Section - Only visible when Music is selected in Audio mode */}
      {isAudioMode && selectedAudioMode === 'Music' && (
        <MusicSamplesSection 
          isVisible={true}
          onSampleSelect={(sample) => {
            if (sample) {
              setSelectedMusicSample({ id: sample.id, genre: sample.genre });
              setMusicStyle(sample.genre);
              setPrompt(sample.promptText);
            } else {
              setSelectedMusicSample(null);
              setMusicStyle('');
              setPrompt('');
            }
          }}
          selectedSampleId={selectedMusicSample?.id}
        />
      )}

      {/* Social Platform Selection - Only visible when Social is selected in Content mode */}
      {isContentMode && showSocialButtons && (
        <div className="mt-6 p-6 bg-card rounded-xl border-2 border-border shadow-sm" style={{ width: '100vw', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
          <p className="text-foreground font-semibold mb-6 text-center text-xl">
            Choose Your Platforms To Generate {contentDays} Days Of Content For Each One
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-nowrap overflow-x-auto pb-2">
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
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected • {selectedPlatforms.length * contentDays} posts will be generated
            </p>
          )}
        </div>
      )}

      {/* Content Calendar */}
      {isContentMode && (
        <div style={{ width: '100vw', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
          <SocialContentCalendar 
            generatedContent={generatedContent}
            isGenerating={isGeneratingContent}
            onDeletePost={async (postId) => {
              // Delete from database
              try {
                const { error } = await supabase
                  .from('social_posts')
                  .delete()
                  .eq('id', postId);
                
                if (error) {
                  console.error('Error deleting post:', error);
                  toast({
                    title: "Delete failed",
                    description: "Failed to delete post. Please try again.",
                    variant: "destructive",
                  });
                  return;
                }
              } catch (err) {
                console.error('Error deleting post:', err);
              }
              
              // Update local state
              setGeneratedContent(prev => prev.filter(post => post.id !== postId));
            }}
            onDeleteAllPosts={async () => {
              // Delete all posts from database for this user
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const { error } = await supabase
                    .from('social_posts')
                    .delete()
                    .eq('user_id', user.id);
                  
                  if (error) {
                    console.error('Error deleting all posts:', error);
                    toast({
                      title: "Delete failed",
                      description: "Failed to delete posts. Please try again.",
                      variant: "destructive",
                    });
                    return;
                  }
                }
              } catch (err) {
                console.error('Error deleting all posts:', err);
              }
              
              setGeneratedContent([]);
              setShowSocialButtons(true); // Show platform selection again
            }}
            onUpdatePost={async (updatedPost) => {
              // Update in database
              try {
                const { error } = await supabase
                  .from('social_posts')
                  .update({
                    caption: updatedPost.caption,
                    hashtags: updatedPost.hashtags,
                    title: updatedPost.title,
                    video_script: updatedPost.videoScript ? JSON.parse(JSON.stringify(updatedPost.videoScript)) : null,
                  })
                  .eq('id', updatedPost.id);
                
                if (error) {
                  console.error('Error updating post:', error);
                  toast({
                    title: "Update failed",
                    description: "Failed to save changes. Please try again.",
                    variant: "destructive",
                  });
                  return;
                }
              } catch (err) {
                console.error('Error updating post:', err);
              }
              
              // Update local state
              setGeneratedContent(prev => prev.map(post => 
                post.id === updatedPost.id ? updatedPost : post
              ));
            }}
          />
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
        onClose={() => {
          setIsAudioUploadModalOpen(false);
          // Refresh cloned voices after closing modal (user may have cloned a new voice)
          (async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              
              const { data, error } = await supabase
                .from('user_voices')
                .select('id, name, elevenlabs_voice_id')
                .eq('user_id', user.id)
                .eq('type', 'cloned')
                .not('elevenlabs_voice_id', 'is', null)
                .order('created_at', { ascending: false });
                
              if (!error && data) {
                setClonedVoices(data.map(v => ({
                  id: v.id,
                  name: v.name,
                  elevenlabs_voice_id: v.elevenlabs_voice_id || ''
                })));
              }
            } catch (error) {
              console.error('Error refreshing cloned voices:', error);
            }
          })();
        }}
        onUseAudio={(audio) => {
          setUploadedAudio(audio);
          setIsAudioUploadModalOpen(false);
        }}
        mode={selectedAudioMode === 'Clone' ? 'clone' : 'all'}
      />

      {/* Video-To-Video Modal */}
      <VideoToVideoModal
        isOpen={isVideoToVideoModalOpen}
        onClose={() => setIsVideoToVideoModalOpen(false)}
        onVideoSelect={(video) => {
          setSelectedV2VVideo(video);
          toast({
            title: "Video selected",
            description: `${video.name} selected for Video-To-Video generation`,
          });
        }}
      />

      {/* Transcribe Confirm Modal */}
      <TranscribeConfirmModal
        isOpen={showTranscribeConfirmModal}
        onClose={() => setShowTranscribeConfirmModal(false)}
        audioFile={transcribeAudio}
        onTranscribe={async (numSpeakers) => {
          setShowTranscribeConfirmModal(false);
          // Trigger transcription
          if (transcribeAudio?.base64 || transcribeAudio?.url) {
            setIsTranscribing(true);
            try {
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: {
                  audioBase64: transcribeAudio.base64 ? (transcribeAudio.base64.split(',')[1] || transcribeAudio.base64) : undefined,
                  audioUrl: transcribeAudio.url || undefined,
                  filename: transcribeAudio.name,
                  contentType: 'audio/mpeg',
                },
              });
              if (error) throw error;
              if (data?.text) {
                setPrompt(data.text);
                setIsTranscribedText(true);
                
                // Save transcription to database
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    let audioUrl = transcribeAudio?.url;
                    let audioDuration: number = 0;
                    
                    // Parse duration - handle both number and string formats
                    const rawDuration = transcribeAudio?.duration;
                    if (typeof rawDuration === 'number') {
                      audioDuration = rawDuration;
                    } else if (typeof rawDuration === 'string') {
                      const parts = rawDuration.split(':');
                      if (parts.length === 2) {
                        audioDuration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                      } else if (parts.length === 3) {
                        audioDuration = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
                      } else {
                        audioDuration = parseFloat(rawDuration) || 0;
                      }
                    }
                    
                    // If we have base64 data, upload to Cloudinary first
                    if (transcribeAudio?.base64 && !audioUrl) {
                      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-audio', {
                        body: {
                          audioData: transcribeAudio.base64,
                          filename: transcribeAudio.name,
                          contentType: transcribeAudio.base64.split(';')[0].replace('data:', '') || 'audio/mp4',
                        },
                      });
                      if (!uploadError && uploadData?.url) {
                        audioUrl = uploadData.url;
                        audioDuration = uploadData.duration || audioDuration;
                      }
                    }
                    
                    // Save to database if we have a URL
                    if (audioUrl) {
                      const { error: insertError } = await supabase.from('user_voices').insert({
                        user_id: user.id,
                        name: transcribeAudio?.name || 'Transcription',
                        duration: audioDuration,
                        url: audioUrl,
                        type: 'transcription',
                        status: 'completed',
                        prompt: data.text,
                      });
                      if (insertError) {
                        console.error('Failed to save transcription:', insertError);
                      }
                    }
                  }
                } catch (saveError) {
                  console.error('Failed to save transcription history:', saveError);
                }
                
                toast({ title: "Transcription complete" });
                setTranscribeAudio(null);
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast({ title: "Transcription failed", variant: "destructive" });
            } finally {
              setIsTranscribing(false);
            }
          }
        }}
        onRemoveAudio={() => setTranscribeAudio(null)}
        onBackToLibrary={() => setIsAudioSelectModalOpen(true)}
        isTranscribing={isTranscribing}
      />

      {/* Audio Library Modal for Transcribe */}
      <AudioLibraryModal
        isOpen={isAudioSelectModalOpen}
        onClose={() => setIsAudioSelectModalOpen(false)}
        onSelect={(audio) => {
          setTranscribeAudio({
            name: audio.name,
            duration: audio.duration,
            url: audio.url,
            base64: audio.base64 || '',
          });
          setIsAudioSelectModalOpen(false);
          // Show confirm modal after selection
          setTimeout(() => setShowTranscribeConfirmModal(true), 100);
        }}
      />
    </div>
  );
};

export default GenerationInput;
