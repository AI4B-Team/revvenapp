import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Paperclip,
  Mic,
  RotateCcw,
  RotateCw,
  Cloud,
  Check,
  Plus,
  Minus,
  Share2,
  MessageSquare,
  Crop,
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
  History,
  MessageCirclePlus,
  ZoomIn,
  Play,
  Scissors,
  SlidersHorizontal,
  Trash2,
  HelpCircle,
  Paintbrush,
  Download,
  Save,
  Globe,
  ExternalLink,
  Loader2,
  Clock,
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ReferencesModal from './ReferencesModal';
import { useResizableTextarea } from '@/hooks/useResizableTextarea';
import ResizeHandle from '@/components/ui/ResizeHandle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatConversation {
  id: string;
  created_at: string;
  preview: string;
}

interface ImageEditingCanvasProps {
  image?: string;
  onClose: () => void;
  onSave: () => void;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  image?: string;
  isRequest?: boolean;
  isLoading?: boolean;
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
    case 'crop':
      return {
        title: 'Crop',
        settings: [
          { type: 'buttons', label: 'Aspect Ratio', options: ['Free', '1:1', '16:9', '4:3', '3:2'] },
          { type: 'toggle', label: 'Lock Ratio', key: 'lockRatio' },
          { type: 'buttons', label: 'Rotation', options: ['0°', '90°', '180°', '270°'] },
          { type: 'toggle', label: 'Show Grid', key: 'showGrid' },
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

const ImageEditingCanvas: React.FC<ImageEditingCanvasProps> = ({ image, onClose, onSave }) => {
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
  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAttachmentInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Resizable prompt box (both directions)
  const { height: chatInputHeight, width: chatInputWidth, isResizing: isChatResizing, handleResizeStart: handleChatResizeStart } = useResizableTextarea({
    minHeight: 80,
    maxHeight: 200,
    initialHeight: 80,
    minWidth: 250,
    maxWidth: 500,
    resizeDirection: 'both',
  });

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m Cora, your AI design assistant. I can help you edit images, suggest improvements, or generate new images. What would you like to do?',
      isRequest: true,
    },
  ]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from Supabase
  useEffect(() => {
    const loadChatHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('editor_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          image: msg.image_url,
        }));
        setMessages([messages[0], ...loadedMessages]);
      }
    };

    loadChatHistory();
  }, [conversationId]);

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
    { id: 'crop', icon: <Crop className="w-4 h-4" />, tooltip: 'Crop' },
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !attachedImage) || isLoadingChat) return;

    const userMessage = inputValue.trim();
    const imageToSend = attachedImage || selectedImage;
    setInputValue('');
    setAttachedImage(null); // Clear attached image after sending

    // Add user message to chat
    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content: userMessage || 'Image attached',
      image: imageToSend,
    }]);

    // Check if this is an image generation/edit request
    const isImageRequest = userMessage.toLowerCase().includes('generate') || 
                          userMessage.toLowerCase().includes('create') ||
                          userMessage.toLowerCase().includes('make') ||
                          userMessage.toLowerCase().includes('edit') ||
                          userMessage.toLowerCase().includes('change') ||
                          userMessage.toLowerCase().includes('add') ||
                          userMessage.toLowerCase().includes('remove');

    if (isImageRequest && selectedModel === 'Nano Banana') {
      // Image generation/editing with Nano Banana
      setIsGeneratingImage(true);
      setMessages(prev => [...prev, {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: 'Generating image...',
        isLoading: true,
      }]);

      try {
        const { data, error } = await supabase.functions.invoke('editor-generate-image', {
          body: {
            prompt: userMessage,
            sourceImage: imageToSend,
            editInstruction: userMessage,
          }
        });

        // Remove loading message
        setMessages(prev => prev.filter(m => !m.isLoading));

        if (error) throw error;

        if (data.imageUrl) {
          // Save generated image to database
          await saveImageToDatabase(data.imageUrl, imageToSend ? 'edited' : 'creation', userMessage);
          
          // Show generated image in chat only (don't auto-select on canvas)
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.message || 'Here\'s your generated image! It has been saved to your creations.',
            image: data.imageUrl,
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.message || 'I couldn\'t generate an image for that request.',
          }]);
        }
      } catch (error: any) {
        setMessages(prev => prev.filter(m => !m.isLoading));
        console.error('Image generation error:', error);
        toast({
          title: 'Generation Failed',
          description: error.message || 'Failed to generate image',
          variant: 'destructive',
        });
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I couldn\'t generate the image. Please try again.',
        }]);
      } finally {
        setIsGeneratingImage(false);
      }
    } else {
      // Regular chat with AI - use streaming
      setIsLoadingChat(true);
      const streamingMsgId = crypto.randomUUID();
      
      // Add empty assistant message that we'll update with streamed content
      setMessages(prev => [...prev, {
        id: streamingMsgId,
        role: 'assistant',
        content: '',
        isLoading: true,
      }]);

      try {
        const chatHistory = messages.filter(m => !m.isLoading).map(m => ({
          role: m.role,
          content: m.content,
          image: m.image,
        }));
        chatHistory.push({ role: 'user', content: userMessage || 'Image attached', image: imageToSend });

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/editor-chat`;
        
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: chatHistory,
            conversationId,
            imageUrl: imageToSend,
            stream: true,
          }),
        });

        if (!resp.ok || !resp.body) {
          throw new Error('Failed to start stream');
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';
        let fullContent = '';
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          // Process line-by-line as data arrives
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullContent += content;
                // Update the message with new content token by token
                setMessages(prev => prev.map(m => 
                  m.id === streamingMsgId 
                    ? { ...m, content: fullContent, isLoading: true }
                    : m
                ));
              }
            } catch {
              // Incomplete JSON, put it back and wait for more
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split('\n')) {
            if (!raw) continue;
            if (raw.endsWith('\r')) raw = raw.slice(0, -1);
            if (raw.startsWith(':') || raw.trim() === '') continue;
            if (!raw.startsWith('data: ')) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullContent += content;
              }
            } catch { /* ignore */ }
          }
        }

        // Mark message as complete (remove loading state)
        setMessages(prev => prev.map(m => 
          m.id === streamingMsgId 
            ? { ...m, content: fullContent || 'I\'m here to help! What would you like me to do?', isLoading: false }
            : m
        ));

      } catch (error: any) {
        // Remove the streaming message on error
        setMessages(prev => prev.filter(m => m.id !== streamingMsgId));
        console.error('Chat error:', error);
        toast({
          title: 'Chat Error',
          description: error.message || 'Failed to get response',
          variant: 'destructive',
        });
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        }]);
      } finally {
        setIsLoadingChat(false);
      }
    }
  };

  // Start new conversation
  const handleNewChat = () => {
    setConversationId(crypto.randomUUID());
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m Cora, your AI design assistant. I can help you edit images, suggest improvements, or generate new images. What would you like to do?',
      isRequest: true,
    }]);
    toast({
      title: 'New Chat Started',
      description: 'Starting a fresh conversation with Cora',
    });
  };

  // Load chat history
  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingHistory(false);
        return;
      }

      // Get user messages for previews (ascending to get first message per conversation)
      const { data, error } = await supabase
        .from('editor_chat_messages')
        .select('conversation_id, content, created_at, role')
        .eq('user_id', user.id)
        .eq('role', 'user')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by conversation_id and get first user message as preview
      const conversations = new Map<string, ChatConversation>();
      data?.forEach((msg: any) => {
        if (!conversations.has(msg.conversation_id)) {
          conversations.set(msg.conversation_id, {
            id: msg.conversation_id,
            created_at: msg.created_at,
            preview: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
          });
        }
      });

      // Sort by date descending (newest first) and take top 10
      const sortedConversations = Array.from(conversations.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setChatHistory(sortedConversations);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load a specific conversation
  const loadConversation = async (convId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('editor_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          image: msg.image_url,
        }));
        setConversationId(convId);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Hi! I\'m Cora, your AI design assistant. I can help you edit images, suggest improvements, or generate new images. What would you like to do?',
          isRequest: true,
        }, ...loadedMessages]);
        toast({
          title: 'Conversation Loaded',
          description: 'Previous conversation restored',
        });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

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

  // Handle chat attachment upload
  const handleChatAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast({
          title: 'Image Attached',
          description: 'Image ready to send with your message',
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (chatAttachmentInputRef.current) {
      chatAttachmentInputRef.current.value = '';
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
      setSelectedImage(undefined);
      setIsImageSelected(false);
      setActiveTool(null);
      setActiveCreationId(null);
      setImagePosition({ x: 0, y: 0 });
      setCreations(prev => prev.map(c => ({ ...c, isActive: false })));
    } else if (toolId === 'save' && selectedImage) {
      // Save current image to creations
      await saveImageToDatabase(selectedImage, 'edited', 'Edited image');
    } else if (toolId === 'upscale' && selectedImage) {
      // For now, save as upscaled (actual upscaling would require an API call)
      toast({
        title: 'Upscaling',
        description: 'Upscaling image and saving...',
      });
      await saveImageToDatabase(selectedImage, 'upscaled', 'Upscaled image');
    } else {
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

          {/* Centered Media Type Tabs - properly centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button className="flex items-center gap-2 text-white font-medium text-sm">
              <Image className="w-4 h-4" />
              <span>Image</span>
            </button>
            <span className="text-slate-500">|</span>
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            <span className="text-slate-500">|</span>
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <Music className="w-4 h-4" />
              <span>Audio</span>
            </button>
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
              <Share2 className="w-4 h-4" />
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
            {/* Design Agent Panel - sits on top of creations with gap */}
            {!isPanelCollapsed && (
              <div className="flex-shrink-0 bg-slate-50 p-3">
                <div className="w-[440px] h-full bg-white flex flex-col rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-400 overflow-hidden max-h-[calc(100vh-200px)]">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 tracking-wide whitespace-nowrap">Design Agent: Cora</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 transition-colors">
                          <span className="font-medium">{selectedModel}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white border border-slate-200 shadow-lg z-50">
                        <DropdownMenuItem 
                          onClick={() => setSelectedModel('Nano Banana')}
                          className={selectedModel === 'Nano Banana' ? 'bg-emerald-50' : ''}
                        >
                          <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                          Nano Banana (Image Gen)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setSelectedModel('Gemini Flash')}
                          className={selectedModel === 'Gemini Flash' ? 'bg-emerald-50' : ''}
                        >
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                          Gemini Flash (Chat)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleNewChat}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MessageCirclePlus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white"><p>New Chat</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenu onOpenChange={(open) => open && loadChatHistory()}>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                          <History className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-lg z-50 w-64 max-h-80 overflow-y-auto">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chat History</span>
                        </div>
                        {isLoadingHistory ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          </div>
                        ) : chatHistory.length > 0 ? (
                          chatHistory.map((conv) => (
                            <DropdownMenuItem 
                              key={conv.id}
                              onClick={() => loadConversation(conv.id)}
                              className={`flex flex-col items-start gap-1 py-2 cursor-pointer ${conv.id === conversationId ? 'bg-emerald-50' : ''}`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-400">
                                  {new Date(conv.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <span className="text-sm text-slate-700 truncate w-full">{conv.preview}</span>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            No chat history yet
                          </div>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleNewChat} className="text-emerald-600">
                          <MessageCirclePlus className="w-4 h-4 mr-2" />
                          Start New Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      onClick={() => setIsPanelCollapsed(true)}
                      className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors ml-1 relative z-10"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === 'assistant' ? (
                        <div className={`bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100`}>
                          <div className="flex items-center gap-2">
                            {message.isLoading && !message.content ? (
                              <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                            )}
                            <span className="text-xs text-slate-500 font-medium">Cora</span>
                            {message.isLoading && message.content && (
                              <span className="text-xs text-emerald-500">typing...</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {message.content || 'Thinking...'}
                            {message.isLoading && message.content && (
                              <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-0.5 animate-pulse" />
                            )}
                          </p>
                          {message.image && !message.isLoading && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="relative rounded-lg overflow-hidden border border-slate-200 max-w-[180px] cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
                                  onClick={() => handleSelectFromModal(message.image!)}
                                >
                                  <img src={message.image} alt="Generated" className="w-full h-auto" />
                                  <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-white rounded shadow flex items-center justify-center">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-sm" />
                                  </div>
                                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center">
                                    <span className="text-xs font-medium text-white bg-slate-800/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      Click To Apply
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-900 text-white">
                                <p>Click To Apply To Canvas</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-100 ml-8">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <span className="text-[10px] text-white font-bold">U</span>
                            </div>
                            <span className="text-xs text-emerald-600 font-medium">You</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
                          {message.image && (
                            <div className="relative rounded-lg overflow-hidden border border-emerald-200 max-w-[180px]">
                              <img src={message.image} alt="Attached" className="w-full h-auto" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  {/* Attached Image Preview */}
                  {attachedImage && (
                    <div className="mb-2 relative inline-block">
                      <img 
                        src={attachedImage} 
                        alt="Attached" 
                        className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setAttachedImage(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage}>
                    <input
                      type="file"
                      ref={chatAttachmentInputRef}
                      onChange={handleChatAttachment}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="relative" style={{ height: chatInputHeight, ...(chatInputWidth && { width: chatInputWidth }) }}>
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if ((inputValue.trim() || attachedImage) && !isLoadingChat && !isGeneratingImage) {
                              handleSendMessage(e as any);
                            }
                          }
                        }}
                        placeholder={isLoadingChat || isGeneratingImage ? 'Please wait...' : 'Ask Cora to edit or generate images...'}
                        disabled={isLoadingChat || isGeneratingImage}
                        className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-24 text-sm text-slate-700 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none disabled:opacity-50"
                      />
                      <div className="absolute right-2 top-3 flex items-center gap-0.5">
                        <button 
                          type="button" 
                          onClick={() => chatAttachmentInputRef.current?.click()}
                          className={`p-2 transition-colors ${attachedImage ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={handleVoiceRecording}
                          className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <button
                          type="submit"
                          className={`p-2 rounded-lg transition-all ${
                            (inputValue.trim() || attachedImage) && !isLoadingChat && !isGeneratingImage
                              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          disabled={(!inputValue.trim() && !attachedImage) || isLoadingChat || isGeneratingImage}
                        >
                          {isLoadingChat || isGeneratingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <ResizeHandle 
                        onResizeStart={handleChatResizeStart} 
                        isResizing={isChatResizing}
                        variant="subtle"
                      />
                      {isChatResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
                    </div>
                  </form>
                </div>
                </div>
              </div>
            )}

            {/* Collapsed State - canvas background with floating button */}
            {isPanelCollapsed && (
              <div className="flex-shrink-0 bg-slate-50 p-3">
                <div className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-500">
                  <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Design Agent</span>
                  <button
                    onClick={() => setIsPanelCollapsed(false)}
                    className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

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
                        className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all max-w-2xl ${isImageSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : 'border border-slate-200'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImageSelected(true);
                        }}
                      >
                        <img
                          src={selectedImage}
                          alt="Editing"
                          className="w-full h-auto"
                          draggable={false}
                        />
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
