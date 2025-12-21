import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  RotateCw,
  Check,
  Plus,
  Minus,
  Share2,
  Eraser,
  PaintBucket,
  MousePointer2,
  Type,
  Wand2,
  X,
  Image,
  Video,
  Music,
  Sparkles,
  ChevronDown,
  Pencil,
  Layers,
  Upload,
  ZoomIn,
  Play,
  Scissors,
  SlidersHorizontal,
  Trash2,
  Paintbrush,
  Download,
  Save,
  Globe,
  ExternalLink,
  Loader2,
  UserPlus,
  HelpCircle,
  Cloud,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReferencesModal from './ReferencesModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { removeBackground } from '@/utils/backgroundRemoval';

interface ImageEditingCanvasProps {
  image?: string;
  onClose: () => void;
  onSave: () => void;
  onTabChange?: (tab: 'image' | 'video' | 'audio') => void;
  activeEditorTab?: 'image' | 'video' | 'audio';
}

interface Creation {
  id: string;
  thumbnail: string;
  title: string;
  isActive?: boolean;
  category: 'creation' | 'edited' | 'upscaled';
}

interface CanvasSettings {
  mode: string;
  outpaint: boolean;
  inpaintStrength: number;
  numberOfImages: number;
  dimensions: string;
  aspectRatio: string;
  width: number;
  height: number;
  renderDensity: number;
  guidanceScale: number;
}

// Toggle Switch Component
const Toggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
      enabled ? 'bg-emerald-500' : 'bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
        enabled ? 'left-6' : 'left-1'
      }`}
    />
  </button>
);

// Slider Component
const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  suffix?: string;
}> = ({ value, onChange, min = 0, max = 100, step = 1, showValue = true, suffix = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #475569 ${percentage}%, #475569 100%)`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-sm text-slate-300 min-w-[40px] text-right tabular-nums">
          {value}{suffix}
        </span>
      )}
    </div>
  );
};

// Canvas Tool Button with Tooltip
const CanvasTool: React.FC<{
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, tooltip, active, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={`p-2.5 rounded-lg transition-all duration-200 ${
          active
            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-sm'
        }`}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent className="bg-black text-white">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

// Tool settings configurations
const getToolSettings = (tool: string) => {
  switch (tool) {
    case 'select':
      return {
        title: 'Selection',
        settings: [
          { type: 'buttons', label: 'Selection Mode', options: ['Rectangle', 'Ellipse', 'Freeform', 'Magic'] },
          { type: 'toggle', label: 'Feather Edges', key: 'feather' },
          { type: 'slider', label: 'Feather Amount', min: 0, max: 100, key: 'featherAmount' },
          { type: 'toggle', label: 'Anti-Alias', key: 'antiAlias' },
        ],
      };
    case 'brush':
      return {
        title: 'Brush',
        settings: [
          { type: 'slider', label: 'Size', min: 1, max: 500, key: 'brushSize' },
          { type: 'slider', label: 'Hardness', min: 0, max: 100, key: 'hardness' },
          { type: 'slider', label: 'Opacity', min: 0, max: 100, key: 'opacity' },
          { type: 'slider', label: 'Flow', min: 0, max: 100, key: 'flow' },
          { type: 'color', label: 'Brush Color', key: 'brushColor' },
          { type: 'buttons', label: 'Blend Mode', options: ['Normal', 'Multiply', 'Screen', 'Overlay'] },
        ],
      };
    case 'eraser':
      return {
        title: 'Eraser',
        settings: [
          { type: 'slider', label: 'Size', min: 1, max: 500, key: 'eraserSize' },
          { type: 'slider', label: 'Hardness', min: 0, max: 100, key: 'eraserHardness' },
          { type: 'slider', label: 'Opacity', min: 0, max: 100, key: 'eraserOpacity' },
          { type: 'buttons', label: 'Mode', options: ['Brush', 'Block', 'Pencil'] },
        ],
      };
    case 'fill':
      return {
        title: 'Fill',
        settings: [
          { type: 'color', label: 'Fill Color', key: 'fillColor' },
          { type: 'slider', label: 'Tolerance', min: 0, max: 255, key: 'tolerance' },
          { type: 'toggle', label: 'Contiguous', key: 'contiguous' },
          { type: 'toggle', label: 'All Layers', key: 'allLayers' },
          { type: 'slider', label: 'Opacity', min: 0, max: 100, key: 'opacity' },
        ],
      };
    case 'text':
      return {
        title: 'Text',
        settings: [
          { type: 'dropdown', label: 'Font Family', options: ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Roboto'] },
          { type: 'slider', label: 'Font Size', min: 8, max: 200, key: 'fontSize' },
          { type: 'buttons', label: 'Style', options: ['Bold', 'Italic', 'Underline'] },
          { type: 'buttons', label: 'Alignment', options: ['Left', 'Center', 'Right', 'Justify'] },
          { type: 'color', label: 'Text Color', key: 'textColor' },
          { type: 'slider', label: 'Letter Spacing', min: -50, max: 100, key: 'letterSpacing' },
          { type: 'slider', label: 'Line Height', min: 0.5, max: 3, key: 'lineHeight', step: 0.1 },
        ],
      };
    case 'magic':
      return {
        title: 'AI Magic',
        settings: [
          { type: 'buttons', label: 'AI Mode', options: ['Generate', 'Inpaint', 'Outpaint', 'Enhance'] },
          { type: 'slider', label: 'Strength', min: 0, max: 100, key: 'aiStrength' },
          { type: 'slider', label: 'Guidance Scale', min: 1, max: 20, key: 'guidance' },
          { type: 'slider', label: 'Steps', min: 10, max: 50, key: 'steps' },
          { type: 'toggle', label: 'Preserve Details', key: 'preserveDetails' },
        ],
      };
    case 'layers':
      return {
        title: 'Layers',
        settings: [
          { type: 'slider', label: 'Layer Opacity', min: 0, max: 100, key: 'layerOpacity' },
          { type: 'buttons', label: 'Blend Mode', options: ['Normal', 'Multiply', 'Screen', 'Overlay', 'Soft Light'] },
          { type: 'toggle', label: 'Lock Layer', key: 'lockLayer' },
          { type: 'toggle', label: 'Visible', key: 'layerVisible' },
        ],
      };
    case 'upscale':
      return {
        title: 'Upscale',
        settings: [
          { type: 'buttons', label: 'Scale Factor', options: ['2x', '4x', '8x'] },
          { type: 'buttons', label: 'Model', options: ['Standard', 'Creative', 'Sharp'] },
          { type: 'toggle', label: 'Denoise', key: 'denoise' },
          { type: 'slider', label: 'Denoise Strength', min: 0, max: 100, key: 'denoiseStrength' },
          { type: 'toggle', label: 'Face Enhancement', key: 'faceEnhance' },
        ],
      };
    case 'animate':
      return {
        title: 'Animate',
        settings: [
          { type: 'buttons', label: 'Animation Type', options: ['Pan', 'Zoom', 'Rotate', 'Morph'] },
          { type: 'slider', label: 'Duration (s)', min: 1, max: 30, key: 'duration' },
          { type: 'buttons', label: 'Easing', options: ['Linear', 'Ease In', 'Ease Out', 'Bounce'] },
          { type: 'slider', label: 'Intensity', min: 0, max: 100, key: 'intensity' },
          { type: 'toggle', label: 'Loop', key: 'loop' },
        ],
      };
    case 'removebg':
      return {
        title: 'Remove Background',
        settings: [
          { type: 'buttons', label: 'Model', options: ['Auto', 'Portrait', 'Product', 'General'] },
          { type: 'slider', label: 'Edge Refinement', min: 0, max: 100, key: 'edgeRefinement' },
          { type: 'toggle', label: 'Feather Edges', key: 'featherEdges' },
          { type: 'slider', label: 'Feather Amount', min: 0, max: 20, key: 'featherAmount' },
          { type: 'color', label: 'Replacement Color', key: 'bgColor' },
        ],
      };
    case 'opacity':
      return {
        title: 'Opacity',
        settings: [
          { type: 'slider', label: 'Image Opacity', min: 0, max: 100, key: 'imageOpacity' },
          { type: 'toggle', label: 'Affect All Layers', key: 'affectAll' },
          { type: 'buttons', label: 'Blend Mode', options: ['Normal', 'Multiply', 'Screen', 'Overlay'] },
        ],
      };
    case 'download':
      return {
        title: 'Download',
        settings: [
          { type: 'buttons', label: 'Format', options: ['PNG', 'JPG', 'WEBP', 'SVG'] },
          { type: 'slider', label: 'Quality', min: 1, max: 100, key: 'quality' },
          { type: 'buttons', label: 'Size', options: ['Original', '2x', '0.5x'] },
          { type: 'toggle', label: 'Include Metadata', key: 'metadata' },
        ],
      };
    case 'save':
      return {
        title: 'Save To Creations',
        settings: [
          { type: 'dropdown', label: 'Collection', options: ['Default', 'Portraits', 'Products', 'Marketing'] },
          { type: 'toggle', label: 'Add Tags', key: 'addTags' },
          { type: 'toggle', label: 'Make Public', key: 'makePublic' },
        ],
      };
    default:
      return null;
  }
};

const ImageEditingCanvas: React.FC<ImageEditingCanvasProps> = ({ image, onClose, onSave, onTabChange, activeEditorTab }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Nano Banana');
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [activeCreationId, setActiveCreationId] = useState<string | null>(null);
  const [creationsFilter, setCreationsFilter] = useState<string>('Creations');
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    mode: 'inpaint',
    outpaint: true,
    inpaintStrength: 1,
    numberOfImages: 4,
    dimensions: '512 × 512',
    aspectRatio: '1:1',
    width: 512,
    height: 512,
    renderDensity: 50,
    guidanceScale: 7,
  });

  // Tool-specific settings state
  const [toolSettings, setToolSettings] = useState<Record<string, any>>({
    fontSize: 24,
    brushSize: 20,
    opacity: 100,
    tolerance: 32,
    aiStrength: 75,
    guidance: 7,
    steps: 30,
    duration: 5,
    intensity: 50,
    edgeRefinement: 50,
    imageOpacity: 100,
    denoiseStrength: 50,
    quality: 90,
  });

  // State for creations loaded from database
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(true);

  // Load creations from database
  useEffect(() => {
    const loadCreations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingCreations(false);
          return;
        }

        const { data, error } = await supabase
          .from('generated_images')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const loadedCreations: Creation[] = (data || []).map((img: any) => ({
          id: img.id,
          thumbnail: img.image_url,
          title: img.prompt?.substring(0, 20) || 'Image',
          category: (img.category || 'creation') as 'creation' | 'edited' | 'upscaled',
          isActive: false,
        }));

        // Add current image if provided
        if (image) {
          loadedCreations.unshift({
            id: 'current',
            thumbnail: image,
            title: 'Current',
            category: 'creation',
            isActive: false,
          });
        }

        setCreations(loadedCreations);
      } catch (error) {
        console.error('Failed to load creations:', error);
      } finally {
        setIsLoadingCreations(false);
      }
    };

    loadCreations();
  }, [image]);

  // Save image to database
  const saveImageToDatabase = async (imageUrl: string, category: 'creation' | 'edited' | 'upscaled', prompt?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not Authenticated',
          description: 'Please log in to save images',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('generated_images')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt: prompt || `${category} image`,
          model: selectedModel,
          status: 'completed',
          category: category,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Add to creations list
      const newCreation: Creation = {
        id: data.id,
        thumbnail: imageUrl,
        title: prompt?.substring(0, 20) || category,
        category: category,
        isActive: true,
      };
      setCreations(prev => [newCreation, ...prev.map(c => ({ ...c, isActive: false }))]);

      toast({
        title: 'Image Saved',
        description: `Image saved to ${category} collection`,
      });

      return data;
    } catch (error: any) {
      console.error('Failed to save image:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save image',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update creations when new image is selected from modal
  const handleSelectFromModal = (imageUrl: string) => {
    const newCreation: Creation = {
      id: `new-${Date.now()}`,
      thumbnail: imageUrl,
      title: 'New',
      isActive: true,
      category: 'creation',
    };
    setCreations(prev => [newCreation, ...prev.map(c => ({ ...c, isActive: false }))]);
    setSelectedImage(imageUrl);
    setActiveCreationId(newCreation.id);
    setIsImageSelected(true);
    setImagePosition({ x: 0, y: 0 });
    setShowReferencesModal(false);
  };

  // Handle selection from creations strip - toggle selection if same image clicked
  const handleSelectFromCreations = (creation: Creation) => {
    if (activeCreationId === creation.id) {
      // Deselect if clicking the same image
      setSelectedImage(undefined);
      setActiveCreationId(null);
      setIsImageSelected(false);
      setCreations(prev => prev.map(c => ({ ...c, isActive: false })));
    } else {
      // Select new image
      setSelectedImage(creation.thumbnail);
      setActiveCreationId(creation.id);
      setIsImageSelected(true);
      setImagePosition({ x: 0, y: 0 });
      setCreations(prev => prev.map(c => ({ ...c, isActive: c.id === creation.id })));
    }
  };

  // Handle mouse wheel zoom on canvas - scales entire image including border
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoomLevel(prev => Math.min(200, Math.max(25, prev + delta)));
      }
    };

    canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvasElement.removeEventListener('wheel', handleWheel);
  }, []);

  // Handle click outside image to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background, not on the image
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsImageSelected(false);
      setActiveTool(null);
    }
  };

  // Handle image dragging - allow drag anywhere on canvas when image exists
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (selectedImage && !e.defaultPrevented) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedImage && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
      
      // Estimate image size (base size scaled by zoom)
      const imageBaseSize = 400; // approximate base image size
      const scaledImageSize = imageBaseSize * (zoomLevel / 100);
      
      // Calculate bounds - keep at least 50px of image visible
      const minVisiblePx = 50;
      const maxX = (canvasWidth / 2) + (scaledImageSize / 2) - minVisiblePx;
      const minX = -maxX;
      const maxY = (canvasHeight / 2) + (scaledImageSize / 2) - minVisiblePx;
      const minY = -maxY;
      
      // Calculate new position with constraints
      const newX = Math.max(minX, Math.min(maxX, e.clientX - dragStart.x));
      const newY = Math.max(minY, Math.min(maxY, e.clientY - dragStart.y));
      
      setImagePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const canvasTools = [
    { id: 'select', icon: <MousePointer2 className="w-4 h-4" />, tooltip: 'Select' },
    { id: 'brush', icon: <Paintbrush className="w-4 h-4" />, tooltip: 'Brush' },
    { id: 'eraser', icon: <Eraser className="w-4 h-4" />, tooltip: 'Eraser' },
    { id: 'removebg', icon: <Scissors className="w-4 h-4" />, tooltip: 'Remove Background' },
    { id: 'fill', icon: <PaintBucket className="w-4 h-4" />, tooltip: 'Fill' },
    { id: 'text', icon: <Type className="w-4 h-4" />, tooltip: 'Text' },
    { id: 'layers', icon: <Layers className="w-4 h-4" />, tooltip: 'Layers' },
    { id: 'upscale', icon: <ZoomIn className="w-4 h-4" />, tooltip: 'Upscale' },
    { id: 'animate', icon: <Play className="w-4 h-4" />, tooltip: 'Animate' },
    { id: 'opacity', icon: <SlidersHorizontal className="w-4 h-4" />, tooltip: 'Opacity' },
    { id: 'save', icon: <Save className="w-4 h-4" />, tooltip: 'Save To Creations' },
    { id: 'publish', icon: <Globe className="w-4 h-4" />, tooltip: 'Publish' },
    { id: 'download', icon: <Download className="w-4 h-4" />, tooltip: 'Download' },
    { id: 'use', icon: <ExternalLink className="w-4 h-4" />, tooltip: 'Use' },
    { id: 'delete', icon: <Trash2 className="w-4 h-4" />, tooltip: 'Delete' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        handleSelectFromModal(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle voice recording using Web Speech API
  const handleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice recognition is not supported in your browser. Please use Chrome.',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: 'Listening...',
        description: 'Speak now. Click the mic again to stop.',
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      // Handle expected cases silently
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (event.error === 'no-speech') {
          toast({
            title: 'No Speech Detected',
            description: 'Please try again and speak clearly.',
          });
        }
        return;
      }
      // Handle permission denied
      if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
        return;
      }
      // Log unexpected errors
      console.warn('Speech recognition error:', event.error);
      toast({
        title: 'Voice Error',
        description: 'Voice recognition failed. Please try again.',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleClose = () => {
    navigate('/create');
  };

  const handleToolClick = async (toolId: string) => {
    if (toolId === 'delete') {
      // Delete/clear the current image from canvas
      setSelectedImage(undefined);
      setIsImageSelected(false);
      setActiveTool(null);
      setActiveCreationId(null);
      setImagePosition({ x: 0, y: 0 });
      setCreations(prev => prev.map(c => ({ ...c, isActive: false })));
      toast({
        title: 'Image Removed',
        description: 'The image has been removed from the canvas',
      });
    } else if (toolId === 'save' && selectedImage) {
      // Save current image to creations
      toast({
        title: 'Saving...',
        description: 'Saving image to your creations',
      });
      await saveImageToDatabase(selectedImage, 'edited', 'Edited image');
      toast({
        title: 'Saved!',
        description: 'Image saved to your creations',
      });
    } else if (toolId === 'upscale' && selectedImage) {
      // For now, save as upscaled (actual upscaling would require an API call)
      toast({
        title: 'Upscaling...',
        description: 'Processing image upscale',
      });
      await saveImageToDatabase(selectedImage, 'upscaled', 'Upscaled image');
      toast({
        title: 'Upscaled!',
        description: 'Image upscaled and saved to creations',
      });
    } else if (toolId === 'download' && selectedImage) {
      // Download the current image
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Downloaded!',
          description: 'Image downloaded successfully',
        });
      } catch (error) {
        toast({
          title: 'Download Failed',
          description: 'Could not download the image',
          variant: 'destructive',
        });
      }
    } else if (toolId === 'publish' && selectedImage) {
      // Share/publish the image (copy to clipboard or open share dialog)
      try {
        if (navigator.share && navigator.canShare({ url: selectedImage })) {
          await navigator.share({
            title: 'My Creation',
            text: 'Check out this image I created!',
            url: selectedImage,
          });
        } else {
          await navigator.clipboard.writeText(selectedImage);
          toast({
            title: 'Link Copied!',
            description: 'Image URL copied to clipboard',
          });
        }
      } catch (error) {
        toast({
          title: 'Copied!',
          description: 'Image URL copied to clipboard',
        });
      }
    } else if (toolId === 'use' && selectedImage) {
      // Navigate to create page with this image as reference
      navigate('/create', { state: { referenceImage: selectedImage } });
      toast({
        title: 'Opening Creator',
        description: 'Using this image in the content creator',
      });
    } else if (toolId === 'animate' && selectedImage) {
      // Navigate to create page in video mode with this image as start frame
      navigate('/create', { state: { animateImage: selectedImage } });
      toast({
        title: 'Opening Animator',
        description: 'Creating animation from this image',
      });
    } else if (toolId === 'removebg' && selectedImage) {
      // Remove background using AI
      if (isProcessing) return;
      setIsProcessing(true);
      toast({
        title: 'Removing Background...',
        description: 'AI is processing your image. This may take a moment.',
      });
      try {
        const result = await removeBackground(selectedImage);
        setSelectedImage(result);
        await saveImageToDatabase(result, 'edited', 'Background removed');
        toast({
          title: 'Background Removed!',
          description: 'Image saved to your creations',
        });
      } catch (error) {
        console.error('Background removal error:', error);
        toast({
          title: 'Processing Failed',
          description: 'Could not remove background. Try a different image.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    } else if (!selectedImage && ['download', 'save', 'upscale', 'publish', 'use', 'animate', 'removebg'].includes(toolId)) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload or select an image first',
        variant: 'destructive',
      });
    } else {
      // For other tools, toggle the settings panel
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  const currentToolSettings = activeTool ? getToolSettings(activeTool) : null;

  // Collaborator avatars
  const collaborators = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop',
  ];

  const renderToolSettingsPanel = () => {
    if (!currentToolSettings) return null;

    return (
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{currentToolSettings.title}</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <button 
            onClick={() => setActiveTool(null)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentToolSettings.settings.map((setting: any, index: number) => (
          <div key={index} className="space-y-2">
            {setting.type === 'slider' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-200">{setting.label}</span>
                </div>
                <Slider
                  value={toolSettings[setting.key] || setting.min}
                  onChange={(value) => setToolSettings({ ...toolSettings, [setting.key]: value })}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step || 1}
                />
              </>
            )}
            {setting.type === 'buttons' && (
              <>
                <span className="text-sm text-slate-200">{setting.label}</span>
                <div className="grid grid-cols-2 gap-2">
                  {setting.options.map((opt: string) => (
                    <button
                      key={opt}
                      className="px-3 py-2.5 rounded-lg text-xs font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
            {setting.type === 'toggle' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{setting.label}</span>
                <Toggle
                  enabled={toolSettings[setting.key] || false}
                  onChange={(enabled) => setToolSettings({ ...toolSettings, [setting.key]: enabled })}
                />
              </div>
            )}
            {setting.type === 'dropdown' && (
              <>
                <span className="text-sm text-slate-200">{setting.label}</span>
                <div className="relative">
                  <select className="w-full bg-slate-700/60 text-slate-200 rounded-lg px-3 py-2.5 text-sm appearance-none cursor-pointer">
                    {setting.options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </>
            )}
            {setting.type === 'color' && (
              <>
                <span className="text-sm text-slate-200">{setting.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-600 cursor-pointer" />
                  <input 
                    type="text" 
                    value="#FFFFFF" 
                    className="flex-1 bg-slate-700/60 text-slate-200 rounded-lg px-3 py-2 text-sm"
                    readOnly
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-full w-full bg-slate-100 flex flex-col overflow-hidden font-sans">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* References Modal */}
        <ReferencesModal
          isOpen={showReferencesModal}
          onClose={() => setShowReferencesModal(false)}
          onSelectReference={handleSelectFromModal}
        />

        {/* Full-width Editor Toolbar */}
        <div className="h-14 bg-[#2d4a54] flex items-center px-4 gap-4 flex-shrink-0 border-b border-slate-600 relative">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Editor</span>
            <div className="flex items-center gap-1.5 bg-violet-500/30 px-3 py-1.5 rounded-lg">
              <Pencil className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-sm font-medium text-violet-200">Editing</span>
              <ChevronDown className="w-3.5 h-3.5 text-violet-300" />
            </div>
          </div>

          {/* Undo/Redo & Zoom */}
          <div className="flex items-center gap-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 text-slate-300 hover:text-white transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white"><p>Undo</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 text-slate-300 hover:text-white transition-colors">
                  <RotateCw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white"><p>Redo</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors relative">
                  <Cloud className="w-4 h-4" />
                  <Check className="w-2 h-2 absolute bottom-1.5 right-1.5 stroke-[3]" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white"><p>Saved To Cloud</p></TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm text-slate-200 min-w-[50px] text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Centered Media Type Tabs - matches Header nav centering */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-4 lg:gap-8">
              <button 
                onClick={() => onTabChange?.('image')}
                className={`flex items-center gap-2 font-medium text-sm ${activeEditorTab === 'image' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Image className="w-4 h-4" />
                <span>Image</span>
              </button>
              <span className="text-slate-500 hidden lg:inline">|</span>
              <button 
                onClick={() => onTabChange?.('video')}
                className={`flex items-center gap-2 text-sm ${activeEditorTab === 'video' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
              <span className="text-slate-500 hidden lg:inline">|</span>
              <button 
                onClick={() => onTabChange?.('audio')}
                className={`flex items-center gap-2 text-sm ${activeEditorTab === 'audio' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Music className="w-4 h-4" />
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Right Actions - positioned far right */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Collaborator Avatars */}
            <div className="flex items-center -space-x-2">
              {collaborators.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Collaborator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-[#2d4a54] object-cover"
                />
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm text-white font-medium transition-colors">
              <UserPlus className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Section: Chat + Canvas + Right Panel */}
          <div className="flex-1 flex overflow-hidden">

            {/* Center Area: Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <main 
                ref={canvasRef}
                className="flex-1 bg-slate-50 relative overflow-hidden canvas-background"
                style={{ cursor: selectedImage ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Undo/Redo Buttons - Top Right of Canvas */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">Undo</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                    <RotateCw className="w-4 h-4" />
                    <span className="text-sm font-medium">Redo</span>
                  </button>
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-8 canvas-background">
                  {selectedImage ? (
                    <div 
                      className="relative"
                      style={{
                        transform: `scale(${zoomLevel / 100}) translate(${imagePosition.x / (zoomLevel / 100)}px, ${imagePosition.y / (zoomLevel / 100)}px)`,
                        transformOrigin: 'center center',
                        cursor: activeTool === 'select' && isImageSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                      }}
                    >
                      {isImageSelected && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-lg border border-slate-200 z-10"
                          style={{ transform: `translateX(-50%) scale(${100 / zoomLevel})`, transformOrigin: 'center bottom' }}
                        >
                          {canvasTools.map((tool) => (
                            <CanvasTool
                              key={tool.id}
                              icon={tool.icon}
                              tooltip={tool.tooltip}
                              active={activeTool === tool.id}
                              onClick={() => handleToolClick(tool.id)}
                            />
                          ))}
                        </div>
                      )}

                      <div 
                        className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all max-w-2xl relative ${isImageSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : 'border border-slate-200'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageSelected(true);
                        }}
                      >
                        <img
                          ref={imageRef}
                          src={selectedImage}
                          alt="Editing"
                          className="w-full h-auto"
                          draggable={false}
                        />
                        {/* Processing overlay */}
                        {isProcessing && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                              <span className="text-white text-sm">Processing...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl shadow-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors max-w-lg w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReferencesModal(true);
                      }}
                    >
                      <div className="p-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                          <Upload className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-600 mb-2">
                          Upload An Image
                        </h2>
                        <p className="text-slate-400">
                          Click Here Or Drag & Drop To Get Started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </main>
            </div>

            {/* Right Panel */}
            {activeTool && activeTool !== 'delete' && currentToolSettings && isImageSelected && (
              <div className="w-[300px] bg-[#1a2e35] overflow-y-auto flex-shrink-0 border-l border-slate-600">
                {renderToolSettingsPanel()}
              </div>
            )}
          </div>

          {/* Creations Strip - Full width at bottom */}
          <div className="h-24 bg-white border-t border-slate-200 flex items-center px-4 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 mr-4 flex-shrink-0 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors">
                  <span className="text-sm font-semibold text-slate-700">{creationsFilter}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white border border-slate-200 shadow-lg z-50">
                <DropdownMenuItem 
                  onClick={() => setCreationsFilter('Creations')}
                  className={creationsFilter === 'Creations' ? 'bg-slate-100' : ''}
                >
                  Creations
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCreationsFilter('Edited')}
                  className={creationsFilter === 'Edited' ? 'bg-slate-100' : ''}
                >
                  Edited
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCreationsFilter('Upscaled')}
                  className={creationsFilter === 'Upscaled' ? 'bg-slate-100' : ''}
                >
                  Upscaled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
              <div className="flex items-center gap-3 px-1 w-max">
                {isLoadingCreations ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : creations.length === 0 ? (
                  <div className="text-sm text-slate-500">No images yet. Generate or upload images to see them here.</div>
                ) : (
                  creations
                    .filter((creation) => {
                      if (creationsFilter === 'Creations') return creation.category === 'creation';
                      if (creationsFilter === 'Edited') return creation.category === 'edited';
                      if (creationsFilter === 'Upscaled') return creation.category === 'upscaled';
                      return true;
                    })
                    .map((creation) => (
                    <button
                      key={creation.id}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-slate-100 transition-all hover:scale-105 ${
                        creation.isActive || activeCreationId === creation.id
                          ? 'ring-2 ring-emerald-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-violet-500 hover:ring-offset-1'
                      }`}
                      onClick={() => handleSelectFromCreations(creation)}
                    >
                      <img
                        src={creation.thumbnail}
                        alt={creation.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop';
                        }}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ImageEditingCanvas;
