import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ReferencesModal from './ReferencesModal';

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
}

interface Creation {
  id: string;
  thumbnail: string;
  title: string;
  isActive?: boolean;
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
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(image);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Nano Banana');
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [activeCreationId, setActiveCreationId] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const [messages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'What do you think of this first storyboard frame? Would you like me to make any adjustments before we move on to the second frame?',
      image: selectedImage,
      isRequest: true,
    },
  ]);

  // Sample creations with diverse real images - nature, cars, houses, animals, portraits
  const baseCreations: Creation[] = [
    { id: '2', thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', title: 'Portrait 1' },
    { id: '3', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', title: 'Mountain' },
    { id: '4', thumbnail: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=200&fit=crop', title: 'Sports Car' },
    { id: '5', thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop', title: 'Modern House' },
    { id: '6', thumbnail: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&h=200&fit=crop', title: 'Lion' },
    { id: '7', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', title: 'Portrait 2' },
    { id: '8', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&fit=crop', title: 'Lake' },
    { id: '9', thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop', title: 'Luxury Car' },
    { id: '10', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', title: 'Villa' },
    { id: '11', thumbnail: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=200&h=200&fit=crop', title: 'Turtle' },
    { id: '12', thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop', title: 'Forest' },
    { id: '13', thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=200&fit=crop', title: 'BMW' },
    { id: '14', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop', title: 'Mansion' },
    { id: '15', thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop', title: 'Dogs' },
    { id: '16', thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop', title: 'Cat' },
    { id: '17', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop', title: 'Foggy Forest' },
    { id: '18', thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&h=200&fit=crop', title: 'Porsche' },
    { id: '19', thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop', title: 'Beach House' },
    { id: '20', thumbnail: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop', title: 'Golden Retriever' },
    { id: '21', thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c036bc6d05?w=200&h=200&fit=crop', title: 'Owl' },
    { id: '22', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop', title: 'Sunlit Forest' },
    { id: '23', thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop', title: 'Classic Car' },
    { id: '24', thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&h=200&fit=crop', title: 'Luxury Villa' },
    { id: '25', thumbnail: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=200&h=200&fit=crop', title: 'Elephant' },
    { id: '26', thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop', title: 'Snowy Peak' },
    { id: '27', thumbnail: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=200&h=200&fit=crop', title: 'Ferrari' },
    { id: '28', thumbnail: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&h=200&fit=crop', title: 'Suburban Home' },
    { id: '29', thumbnail: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=200&h=200&fit=crop', title: 'Peacock' },
    { id: '30', thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop', title: 'Portrait 3' },
    { id: '31', thumbnail: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=200&h=200&fit=crop', title: 'Waterfall' },
    { id: '32', thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=200&h=200&fit=crop', title: 'Lamborghini' },
    { id: '33', thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=200&fit=crop', title: 'Pool House' },
    { id: '34', thumbnail: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop', title: 'Sea Turtle' },
    { id: '35', thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=200&h=200&fit=crop', title: 'Starry Sky' },
    { id: '36', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', title: 'Jellyfish' },
    { id: '37', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', title: 'Portrait 4' },
    { id: '38', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop', title: 'Beach' },
    { id: '39', thumbnail: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&h=200&fit=crop', title: 'Race Car' },
    { id: '40', thumbnail: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=200&h=200&fit=crop', title: 'Cottage' },
    { id: '41', thumbnail: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop', title: 'Hamster' },
    { id: '42', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=200&fit=crop', title: 'Sunbeams' },
    { id: '43', thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop', title: 'Corvette' },
    { id: '44', thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop', title: 'Modern Villa' },
    { id: '45', thumbnail: 'https://images.unsplash.com/photo-1474314243412-cd4a79f02c6a?w=200&h=200&fit=crop', title: 'Flamingo' },
    { id: '46', thumbnail: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=200&h=200&fit=crop', title: 'Rock Formation' },
    { id: '47', thumbnail: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=200&h=200&fit=crop', title: 'Aurora' },
    { id: '48', thumbnail: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=200&h=200&fit=crop', title: 'Audi' },
    { id: '49', thumbnail: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=200&h=200&fit=crop', title: 'Farmhouse' },
    { id: '50', thumbnail: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200&h=200&fit=crop', title: 'Labrador' },
    { id: '51', thumbnail: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&h=200&fit=crop', title: 'Pug' },
    { id: '52', thumbnail: 'https://images.unsplash.com/photo-1462275646964-a0e3571f4f5f?w=200&h=200&fit=crop', title: 'Vintage Car' },
    { id: '53', thumbnail: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=200&h=200&fit=crop', title: 'Lake House' },
    { id: '54', thumbnail: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=200&h=200&fit=crop', title: 'Parrot' },
    { id: '55', thumbnail: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=200&h=200&fit=crop', title: 'Canyon' },
    { id: '56', thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop', title: 'Mercedes' },
    { id: '57', thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop', title: 'Apartment' },
  ];
  
  // Build creations list with current image first if exists
  const [creations, setCreations] = useState<Creation[]>(() => {
    if (selectedImage) {
      return [{ id: '1', thumbnail: selectedImage, title: 'Current', isActive: true }, ...baseCreations];
    }
    return baseCreations;
  });

  // Update creations when new image is selected from modal
  const handleSelectFromModal = (imageUrl: string) => {
    const newCreation: Creation = {
      id: `new-${Date.now()}`,
      thumbnail: imageUrl,
      title: 'New',
      isActive: true,
    };
    setCreations(prev => [newCreation, ...prev.map(c => ({ ...c, isActive: false }))]);
    setSelectedImage(imageUrl);
    setActiveCreationId(newCreation.id);
    setIsImageSelected(true);
    setImagePosition({ x: 0, y: 0 });
    setShowReferencesModal(false);
  };

  // Handle selection from creations strip
  const handleSelectFromCreations = (creation: Creation) => {
    setSelectedImage(creation.thumbnail);
    setActiveCreationId(creation.id);
    setIsImageSelected(true);
    setImagePosition({ x: 0, y: 0 });
    setCreations(prev => prev.map(c => ({ ...c, isActive: c.id === creation.id })));
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

  // Handle image dragging with select tool
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' && isImageSelected) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && activeTool === 'select') {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
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
    { id: 'magic', icon: <Wand2 className="w-4 h-4" />, tooltip: 'AI Magic' },
    { id: 'layers', icon: <Layers className="w-4 h-4" />, tooltip: 'Layers' },
    { id: 'upscale', icon: <ZoomIn className="w-4 h-4" />, tooltip: 'Upscale' },
    { id: 'animate', icon: <Play className="w-4 h-4" />, tooltip: 'Animate' },
    { id: 'opacity', icon: <SlidersHorizontal className="w-4 h-4" />, tooltip: 'Opacity' },
    { id: 'download', icon: <Download className="w-4 h-4" />, tooltip: 'Download' },
    { id: 'save', icon: <Save className="w-4 h-4" />, tooltip: 'Save To Creations' },
    { id: 'delete', icon: <Trash2 className="w-4 h-4" />, tooltip: 'Delete' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log('Sending:', inputValue);
      setInputValue('');
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

  const handleClose = () => {
    navigate('/create');
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === 'delete') {
      setSelectedImage(undefined);
      setIsImageSelected(false);
      setActiveTool(null);
      setActiveCreationId(null);
      setImagePosition({ x: 0, y: 0 });
      setCreations(prev => prev.map(c => ({ ...c, isActive: false })));
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
                <div className="w-[440px] h-full bg-white flex flex-col rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-400">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 tracking-wide whitespace-nowrap">Design Agent: Cora</span>
                    <div className="relative">
                      <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 transition-colors">
                        <span className="font-medium">{selectedModel}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                          <MessageCirclePlus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white"><p>New Chat</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                          <History className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white"><p>History</p></TooltipContent>
                    </Tooltip>
                    <button
                      onClick={() => setIsPanelCollapsed(true)}
                      className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors ml-1 relative z-10"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.isRequest && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400 font-medium">Request</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
                          {message.image && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 max-w-[180px]">
                              <img src={message.image} alt="Design" className="w-full h-auto" />
                              <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-white rounded shadow flex items-center justify-center">
                                <div className="w-2 h-2 bg-slate-800 rounded-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendMessage}>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Cora to edit something..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-24 text-sm text-slate-700 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button
                          type="submit"
                          className={`p-2 rounded-lg transition-all ${
                            inputValue.trim()
                              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          disabled={!inputValue.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
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
                onClick={handleCanvasClick}
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
                        onMouseDown={handleImageMouseDown}
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
            <div className="flex items-center gap-2 mr-4 flex-shrink-0">
              <span className="text-sm font-semibold text-slate-700">Creations</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
              <div className="flex items-center gap-3 px-1 w-max">
                {creations.map((creation) => (
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
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ImageEditingCanvas;
