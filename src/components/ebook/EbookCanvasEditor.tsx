import { useState, useRef } from 'react';
import { 
  MousePointer2, Type, Square, Circle, Image as ImageIcon, 
  Minus, Undo2, Redo2, ZoomIn, ZoomOut, Hand, Layers, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered,
  Trash2, Copy, ClipboardPaste, Lock, Unlock, Eye, EyeOff,
  ChevronUp, ChevronDown, RotateCcw, FlipHorizontal, FlipVertical,
  Grid3X3, Ruler, Download, Upload, Maximize, Minimize,
  Plus, Check, X, Sparkles, Palette, SlidersHorizontal, Replace, Crop
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  type: 'cover' | 'toc' | 'chapter' | 'back';
  thumbnail?: string;
}

interface CanvasElement {
  id: string;
  type: 'image' | 'shape' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fill?: string;
  stroke?: string;
  shapeType?: 'rectangle' | 'circle';
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
}

interface EbookCanvasEditorProps {
  pages: Page[];
  selectedPageId: string;
  onPageSelect: (id: string) => void;
  bookTitle: string;
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Pan (H)', shortcut: 'H' },
  { id: 'text', icon: Type, label: 'Text (T)', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle (O)', shortcut: 'O' },
  { id: 'line', icon: Minus, label: 'Line (L)', shortcut: 'L' },
  { id: 'image', icon: ImageIcon, label: 'Image (I)', shortcut: 'I' },
];

const FONTS = [
  'Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 
  'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Georgia'
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

const EbookCanvasEditor = ({ 
  pages, 
  selectedPageId, 
  onPageSelect,
  bookTitle 
}: EbookCanvasEditorProps) => {
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sample canvas elements for the cover
  const [canvasElements] = useState<CanvasElement[]>([
    {
      id: 'cover-image',
      type: 'image',
      x: 0,
      y: 0,
      width: 100,
      height: 45,
      src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop'
    },
    {
      id: 'title-box',
      type: 'shape',
      x: 8,
      y: 38,
      width: 55,
      height: 35,
      fill: '#ffffff',
      stroke: 'transparent',
      shapeType: 'rectangle'
    },
    {
      id: 'title-text',
      type: 'text',
      x: 12,
      y: 44,
      width: 47,
      height: 25,
      content: 'STRATEGIC\nINVESTMENT',
      fontSize: 28,
      fontFamily: 'Georgia',
      textColor: '#1a1a2e'
    },
    {
      id: 'subtitle-text',
      type: 'text',
      x: 12,
      y: 72,
      width: 47,
      height: 10,
      content: 'BASIC BUSINESS PROPOSAL',
      fontSize: 14,
      fontFamily: 'Georgia',
      textColor: '#0891b2'
    }
  ]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomFit = () => setZoom(100);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];
  const currentElement = canvasElements.find(el => el.id === selectedElement);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  // Contextual toolbar based on selected element type
  const renderContextualToolbar = () => {
    if (!currentElement) return null;

    return (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center gap-1 px-2 py-1.5">
        {currentElement.type === 'image' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toast.info('Replace image')}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5"
                >
                  <Replace className="w-3.5 h-3.5" />
                  Replace
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Replace Image</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toast.info('Edit image')}
                  className="px-3 py-1.5 text-xs font-medium hover:bg-gray-100 rounded flex items-center gap-1.5"
                >
                  Edit Image
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Edit Image</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Square className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Crop</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Crop className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Mask</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Link2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Link</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Alt text</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Add alt text</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Layers</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Layer order</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Align</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Alignment</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Lock className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Lock</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'shape' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toast.info('Replace shape')}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1.5"
                >
                  <Replace className="w-3.5 h-3.5" />
                  Replace
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Replace Shape</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Square className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Rectangle</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Circle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Circle</p></TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100 flex items-center gap-1">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300 shadow-inner"
                    style={{ backgroundColor: currentElement.fill || '#ffffff' }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="center">
                <p className="text-xs font-medium text-gray-600 mb-2">Fill Color</p>
                <input 
                  type="color" 
                  value={currentElement.fill || '#ffffff'}
                  onChange={(e) => toast.info(`Fill: ${e.target.value}`)}
                  className="w-32 h-8 cursor-pointer"
                />
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Minus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Border</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Alt text</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Add alt text</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Layers</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Layer order</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Align</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Alignment</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Lock className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Lock</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'text' && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100 flex items-center gap-1">
                  <span className="text-lg font-serif">A</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <p className="text-xs font-medium text-gray-600 mb-2">Text Color</p>
                <input 
                  type="color" 
                  value={currentElement.textColor || '#000000'}
                  onChange={(e) => toast.info(`Color: ${e.target.value}`)}
                  className="w-32 h-8 cursor-pointer"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-7 px-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 min-w-[90px] text-left truncate">
                  {currentElement.fontFamily || 'Georgia'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 max-h-60 overflow-y-auto" align="start">
                {FONTS.map(font => (
                  <button
                    key={font}
                    onClick={() => toast.info(`Font: ${font}`)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-7 px-2 text-xs font-medium hover:bg-gray-100 rounded flex items-center gap-1">
                  Heading 1
                  <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1" align="start">
                {['Heading 1', 'Heading 2', 'Heading 3', 'Body', 'Caption'].map(style => (
                  <button
                    key={style}
                    onClick={() => toast.info(`Style: ${style}`)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100"
                  >
                    {style}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <div className="flex items-center border border-gray-200 rounded">
              <button className="p-1.5 hover:bg-gray-100 border-r border-gray-200">
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 text-xs font-medium min-w-[32px] text-center">
                {currentElement.fontSize || 28}
              </span>
              <button className="p-1.5 hover:bg-gray-100 border-l border-gray-200">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Bold</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Italic</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Underline</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Align Left</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Align Center</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs"><p>Align Right</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <List className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Bullet List</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Numbered List</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Effects</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Text Effects</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>AI Effects</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Link</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Layers</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Layer order</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-2 py-1 text-xs hover:bg-gray-100 rounded">Align</button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Alignment</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Lock className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Lock</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    );
  };

  const renderCanvasElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;
    const selectionBorderColor = element.type === 'shape' ? '#dc2626' : '#3b82f6';
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      cursor: 'pointer',
    };

    if (element.type === 'image') {
      return (
        <div
          key={element.id}
          onClick={(e) => handleElementClick(e, element.id)}
          style={baseStyle}
          className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
        >
          <img 
            src={element.src} 
            alt="Cover" 
            className="w-full h-full object-cover"
            draggable={false}
          />
          {isSelected && (
            <>
              {/* Selection handles */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-se-resize" />
            </>
          )}
        </div>
      );
    }

    if (element.type === 'shape') {
      return (
        <div
          key={element.id}
          onClick={(e) => handleElementClick(e, element.id)}
          style={{
            ...baseStyle,
            backgroundColor: element.fill,
            border: element.stroke !== 'transparent' ? `2px solid ${element.stroke}` : 'none',
            boxShadow: isSelected ? `0 0 0 2px ${selectionBorderColor}` : 'none',
          }}
          className="transition-all"
        >
          {isSelected && (
            <>
              {/* Selection handles */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-red-500 rounded-full cursor-se-resize" />
              {/* Lock icon */}
              <div className="absolute -top-1 -right-1 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </>
          )}
        </div>
      );
    }

    if (element.type === 'text') {
      return (
        <div
          key={element.id}
          onClick={(e) => handleElementClick(e, element.id)}
          style={{
            ...baseStyle,
            fontFamily: element.fontFamily,
            fontSize: `${element.fontSize}px`,
            color: element.textColor,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
          }}
          className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
          {element.content}
          {isSelected && (
            <>
              {/* Selection handles */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-se-resize" />
              {/* Rotation and move handles */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <RotateCcw className="w-3 h-3 text-gray-600" />
                </button>
                <button className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">
        {/* Contextual Toolbar */}
        {renderContextualToolbar()}

        {/* Canvas Toolbar */}
        <div className="h-10 bg-white border-b border-gray-200 flex items-center px-2 gap-1 flex-shrink-0">
          {/* Tool Selection */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
            {TOOLS.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTool(tool.id)}
                    className={`p-1.5 rounded transition-colors ${
                      activeTool === tool.id 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toast.info('Undo')}
                  disabled={!canUndo}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Undo (⌘Z)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toast.info('Redo')}
                  disabled={!canRedo}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Redo (⌘⇧Z)</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded transition-colors ${
                    showGrid ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Toggle Grid</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowRulers(!showRulers)}
                  className={`p-1.5 rounded transition-colors ${
                    showRulers ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Ruler className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Toggle Rulers</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleZoomOut}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Zoom Out</p></TooltipContent>
            </Tooltip>
            <button 
              onClick={handleZoomFit}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded min-w-[50px]"
            >
              {zoom}%
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleZoomIn}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Zoom In</p></TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Canvas Container with Rulers */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Horizontal Ruler */}
            {showRulers && (
              <div className="h-5 bg-gray-50 border-b border-gray-200 flex items-end flex-shrink-0">
                <div className="w-5 h-full bg-gray-100 border-r border-gray-200" />
                <div className="flex-1 relative">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute bottom-0 text-[8px] text-gray-400"
                      style={{ left: `${i * 50}px` }}
                    >
                      <div className="h-2 w-px bg-gray-300" />
                      <span className="absolute -left-2 -top-3">{i * 50}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Vertical Ruler */}
              {showRulers && (
                <div className="w-5 bg-gray-50 border-r border-gray-200 relative flex-shrink-0">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute right-0 text-[8px] text-gray-400 flex items-center"
                      style={{ top: `${i * 50}px` }}
                    >
                      <span className="absolute -top-1 -left-4 rotate-90 origin-right">{i * 50}</span>
                      <div className="w-2 h-px bg-gray-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Canvas - no scrolling when content fits */}
              <div 
                ref={canvasRef}
                className="flex-1 flex items-center justify-center p-4"
                style={{ backgroundColor: '#e5e7eb' }}
                onClick={handleCanvasClick}
              >
                {/* Page Canvas - 8.5x11 aspect ratio */}
                <div 
                  className="bg-white shadow-2xl relative flex-shrink-0"
                  style={{
                    width: `${(8.5 * 72 * zoom) / 100}px`,
                    height: `${(11 * 72 * zoom) / 100}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                    minWidth: `${8.5 * 72}px`,
                    minHeight: `${11 * 72}px`,
                  }}
                  onClick={handleCanvasClick}
                >
                  {/* Grid Overlay */}
                  {showGrid && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                  )}

                  {/* Canvas Content */}
                  {selectedPage?.type === 'cover' ? (
                    // Cover page with editable elements
                    <div className="absolute inset-0">
                      {canvasElements.map(renderCanvasElement)}
                    </div>
                  ) : (
                    // Chapter pages
                    <div className="absolute inset-0 p-12 flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">{selectedPage?.title || 'Chapter Title'}</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                      </p>
                    </div>
                  )}

                  {/* Page Number */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                    {pages.findIndex(p => p.id === selectedPageId) + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Navigator (Right Side) */}
          <div className="w-40 bg-white border-l border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">Pages</span>
              <button 
                onClick={() => toast.success('Add page')}
                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => onPageSelect(page.id)}
                  className={`w-full group relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPageId === page.id 
                      ? 'border-emerald-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Page Thumbnail */}
                  <div 
                    className="aspect-[8.5/11] bg-white flex items-center justify-center relative"
                  >
                    {page.type === 'cover' ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-2">
                        <span className="text-[6px] text-white font-medium text-center leading-tight truncate">
                          {bookTitle || 'Cover'}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 p-1.5">
                        <div className="h-1 w-2/3 bg-gray-200 rounded mb-1" />
                        <div className="space-y-0.5">
                          <div className="h-0.5 w-full bg-gray-100 rounded" />
                          <div className="h-0.5 w-full bg-gray-100 rounded" />
                          <div className="h-0.5 w-3/4 bg-gray-100 rounded" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-medium text-gray-500 bg-white/80 px-1 rounded">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookCanvasEditor;
