import { useState, useRef } from 'react';
import { 
  MousePointer2, Type, Square, Circle, Image as ImageIcon, 
  Minus, Undo2, Redo2, ZoomIn, ZoomOut, Hand, Layers, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered,
  Trash2, Copy, ClipboardPaste, Lock, Unlock, Eye, EyeOff,
  ChevronUp, ChevronDown, RotateCcw, FlipHorizontal, FlipVertical,
  Grid3X3, Ruler, Download, Upload, Maximize, Minimize,
  Plus, Check, X, Sparkles, Palette, SlidersHorizontal, Replace, Crop,
  Move, RotateCw, Scale, ArrowUpToLine, ArrowDownToLine, ArrowUpDown,
  Wand2, Filter, Droplet, Eraser, PenTool, MoreHorizontal, GripVertical
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  locked?: boolean;
  rotation?: number;
  isPlaceholder?: boolean;
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

const COVER_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop';

const SUGGESTED_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
];

// Sample elements for different page types
const createCoverElements = (): CanvasElement[] => [
  {
    id: 'cover-image',
    type: 'image',
    x: 0,
    y: 0,
    width: 100,
    height: 45,
    src: COVER_IMAGE
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
];

const createTocElements = (): CanvasElement[] => [
  {
    id: 'toc-header',
    type: 'text',
    x: 10,
    y: 8,
    width: 80,
    height: 8,
    content: 'TABLE OF CONTENTS',
    fontSize: 24,
    fontFamily: 'Georgia',
    textColor: '#1a1a2e'
  },
  {
    id: 'toc-line',
    type: 'shape',
    x: 10,
    y: 18,
    width: 20,
    height: 1,
    fill: '#0891b2',
    stroke: 'transparent',
    shapeType: 'rectangle'
  },
  {
    id: 'toc-item1',
    type: 'text',
    x: 10,
    y: 25,
    width: 80,
    height: 5,
    content: '01. Executive Summary .......................... 3',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item2',
    type: 'text',
    x: 10,
    y: 32,
    width: 80,
    height: 5,
    content: '02. Market Analysis .............................. 5',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item3',
    type: 'text',
    x: 10,
    y: 39,
    width: 80,
    height: 5,
    content: '03. Investment Strategy ........................ 8',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item4',
    type: 'text',
    x: 10,
    y: 46,
    width: 80,
    height: 5,
    content: '04. Financial Projections ..................... 12',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item5',
    type: 'text',
    x: 10,
    y: 53,
    width: 80,
    height: 5,
    content: '05. Risk Assessment ............................ 16',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item6',
    type: 'text',
    x: 10,
    y: 60,
    width: 80,
    height: 5,
    content: '06. Implementation Timeline ................. 20',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item7',
    type: 'text',
    x: 10,
    y: 67,
    width: 80,
    height: 5,
    content: '07. Team & Expertise ........................... 24',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: 'toc-item8',
    type: 'text',
    x: 10,
    y: 74,
    width: 80,
    height: 5,
    content: '08. Conclusion .................................... 28',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#374151'
  }
];

const createChapterElements = (chapterNum: number, title: string): CanvasElement[] => [
  {
    id: `chapter${chapterNum}-header-bg`,
    type: 'shape',
    x: 0,
    y: 0,
    width: 100,
    height: 25,
    fill: '#0d4f4f',
    stroke: 'transparent',
    shapeType: 'rectangle'
  },
  {
    id: `chapter${chapterNum}-number`,
    type: 'text',
    x: 10,
    y: 8,
    width: 30,
    height: 10,
    content: chapterNum.toString().padStart(2, '0'),
    fontSize: 48,
    fontFamily: 'Georgia',
    textColor: '#ffffff'
  },
  {
    id: `chapter${chapterNum}-title`,
    type: 'text',
    x: 10,
    y: 28,
    width: 80,
    height: 8,
    content: title,
    fontSize: 22,
    fontFamily: 'Georgia',
    textColor: '#1a1a2e'
  },
  {
    id: `chapter${chapterNum}-intro`,
    type: 'text',
    x: 10,
    y: 40,
    width: 80,
    height: 15,
    content: 'This section provides a comprehensive overview of our strategic approach, detailing key methodologies and expected outcomes for stakeholders. We analyze market trends and provide actionable insights.',
    fontSize: 11,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: `chapter${chapterNum}-body1`,
    type: 'text',
    x: 10,
    y: 58,
    width: 38,
    height: 20,
    content: 'Our research indicates significant growth potential in emerging markets. The data suggests a 15% increase in investor confidence over the past quarter.',
    fontSize: 10,
    fontFamily: 'Georgia',
    textColor: '#374151'
  },
  {
    id: `chapter${chapterNum}-image`,
    type: 'image',
    x: 52,
    y: 58,
    width: 38,
    height: 25,
    src: `https://images.unsplash.com/photo-${chapterNum === 1 ? '1460925895917-afdab827c52f' : chapterNum === 2 ? '1507679799987-c73779587ccf' : '1551288049-bebda4e38f71'}?w=600&auto=format&fit=crop`
  },
  {
    id: `chapter${chapterNum}-caption`,
    type: 'text',
    x: 52,
    y: 84,
    width: 38,
    height: 4,
    content: 'Figure ' + chapterNum + '.1 - Market Analysis Overview',
    fontSize: 9,
    fontFamily: 'Georgia',
    textColor: '#6b7280'
  }
];

const createBackCoverElements = (): CanvasElement[] => [
  {
    id: 'back-bg',
    type: 'shape',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: '#0d4f4f',
    stroke: 'transparent',
    shapeType: 'rectangle'
  },
  {
    id: 'back-logo',
    type: 'text',
    x: 35,
    y: 40,
    width: 30,
    height: 10,
    content: 'ESCROW',
    fontSize: 28,
    fontFamily: 'Georgia',
    textColor: '#ffffff'
  },
  {
    id: 'back-tagline',
    type: 'text',
    x: 25,
    y: 52,
    width: 50,
    height: 6,
    content: 'Investment Excellence Since 2010',
    fontSize: 12,
    fontFamily: 'Georgia',
    textColor: '#94a3b8'
  },
  {
    id: 'back-contact',
    type: 'text',
    x: 30,
    y: 80,
    width: 40,
    height: 10,
    content: 'www.escrow-investment.com\ncontact@escrow.com',
    fontSize: 10,
    fontFamily: 'Georgia',
    textColor: '#94a3b8'
  }
];

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
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(true);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  
  // Drag state for element movement
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
  const [isRotatingDrag, setIsRotatingDrag] = useState(false);
  const [rotateStart, setRotateStart] = useState<{ angle: number; elementRotation: number } | null>(null);
  
  // Track page elements state per page
  const [pageElementsState, setPageElementsState] = useState<Record<string, CanvasElement[]>>({});
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomFit = () => setZoom(100);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];
  
  // Get page elements - use stored state or generate default
  const getPageElements = (page: Page): CanvasElement[] => {
    if (pageElementsState[page.id]) {
      return pageElementsState[page.id];
    }
    
    switch (page.type) {
      case 'cover':
        return createCoverElements();
      case 'toc':
        return createTocElements();
      case 'back':
        return createBackCoverElements();
      default:
        const pageIndex = pages.findIndex(p => p.id === page.id);
        const chapterNum = pages.slice(0, pageIndex).filter(p => p.type === 'chapter').length + 1;
        return createChapterElements(chapterNum, page.title || 'Chapter ' + chapterNum);
    }
  };

  const currentPageElements = getPageElements(selectedPage);
  const currentElement = currentPageElements.find(el => el.id === selectedElement);

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    setPageElementsState(prev => {
      const pageElements = prev[selectedPageId] || currentPageElements;
      return {
        ...prev,
        [selectedPageId]: pageElements.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        )
      };
    });
  };

  const deleteElement = (elementId: string) => {
    const element = currentPageElements.find(el => el.id === elementId);
    const isCoverOrChapterImage = element?.type === 'image' && 
      (element.id.includes('cover') || element.id.includes('chapter'));
    
    if (isCoverOrChapterImage) {
      // Replace with placeholder
      setPageElementsState(prev => {
        const pageElements = prev[selectedPageId] || currentPageElements;
        return {
          ...prev,
          [selectedPageId]: pageElements.map(el => 
            el.id === elementId ? { ...el, src: undefined, isPlaceholder: true } : el
          )
        };
      });
    } else {
      setPageElementsState(prev => {
        const pageElements = prev[selectedPageId] || currentPageElements;
        return {
          ...prev,
          [selectedPageId]: pageElements.filter(el => el.id !== elementId)
        };
      });
    }
    setSelectedElement(null);
    toast.success('Element deleted');
  };

  const toggleLock = (elementId: string) => {
    const element = currentPageElements.find(el => el.id === elementId);
    if (element) {
      updateElement(elementId, { locked: !element.locked });
      toast.success(element.locked ? 'Element unlocked' : 'Element locked');
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = currentPageElements.find(el => el.id === elementId);
    if (!element?.locked) {
      setSelectedElement(elementId);
    } else {
      toast.info('Element is locked. Unlock it first.');
    }
  };

  // Handle move handle mouse down
  const handleMoveStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const element = currentPageElements.find(el => el.id === elementId);
    if (element && !element.locked) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elementX: element.x,
        elementY: element.y
      });
      setSelectedElement(elementId);
    }
  };

  // Handle rotate handle mouse down
  const handleRotateStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const element = currentPageElements.find(el => el.id === elementId);
    if (element && !element.locked && pageCanvasRef.current) {
      const rect = pageCanvasRef.current.getBoundingClientRect();
      const centerX = rect.left + (element.x + element.width / 2) * rect.width / 100;
      const centerY = rect.top + (element.y + element.height / 2) * rect.height / 100;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      setIsRotatingDrag(true);
      setRotateStart({
        angle,
        elementRotation: element.rotation || 0
      });
      setSelectedElement(elementId);
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart && selectedElement && pageCanvasRef.current) {
      const rect = pageCanvasRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / rect.width * 100;
      const deltaY = (e.clientY - dragStart.y) / rect.height * 100;
      
      updateElement(selectedElement, {
        x: Math.max(0, Math.min(100 - (currentElement?.width || 0), dragStart.elementX + deltaX)),
        y: Math.max(0, Math.min(100 - (currentElement?.height || 0), dragStart.elementY + deltaY))
      });
    }
    
    if (isRotatingDrag && rotateStart && selectedElement && pageCanvasRef.current) {
      const element = currentPageElements.find(el => el.id === selectedElement);
      if (element) {
        const rect = pageCanvasRef.current.getBoundingClientRect();
        const centerX = rect.left + (element.x + element.width / 2) * rect.width / 100;
        const centerY = rect.top + (element.y + element.height / 2) * rect.height / 100;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = angle - rotateStart.angle;
        
        updateElement(selectedElement, {
          rotation: rotateStart.elementRotation + deltaAngle
        });
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
    if (isRotatingDrag) {
      setIsRotatingDrag(false);
      setRotateStart(null);
    }
  };

  const handleEditWithAI = (elementId: string) => {
    setEditingElement(elementId);
    setEditModalOpen(true);
  };

  const handleSubmitEdit = () => {
    if (editPrompt.trim()) {
      toast.success('AI is processing your edit: ' + editPrompt);
      setEditModalOpen(false);
      setEditPrompt('');
      setEditingElement(null);
    }
  };

  const selectSuggestedImage = (elementId: string, imageSrc: string) => {
    updateElement(elementId, { src: imageSrc, isPlaceholder: false });
    toast.success('Image selected');
  };

  // Get cover image for thumbnail
  const getCoverImageSrc = () => {
    const coverPage = pages.find(p => p.type === 'cover');
    if (coverPage) {
      const coverElements = pageElementsState[coverPage.id] || createCoverElements();
      const coverImage = coverElements.find(el => el.type === 'image');
      return coverImage?.src || COVER_IMAGE;
    }
    return COVER_IMAGE;
  };

  // Contextual toolbar based on selected element type - BLACK TOOLBAR
  const renderContextualToolbar = () => {
    if (!currentElement) return null;

    return (
      <div className="bg-gray-900 rounded-lg shadow-2xl flex items-center gap-1 px-3 py-2 whitespace-nowrap">
        {currentElement.type === 'image' && (
          <>
            <button 
              onClick={() => toast.info('Replace image')}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2"
            >
              <Replace className="w-4 h-4" />
              Replace
            </button>
            <button 
              onClick={() => handleEditWithAI(currentElement.id)}
              className="px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 rounded flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Edit Image
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Square className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Border Style</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Crop className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Crop</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Filter className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Filters</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Link2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Add Link</p></TooltipContent>
            </Tooltip>
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Alt text
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-1">
                  Layers
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-gray-800 border-gray-700" align="center">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowUpToLine className="w-4 h-4" /> Move to Front
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronUp className="w-4 h-4" /> Move Forward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronDown className="w-4 h-4" /> Move Backward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowDownToLine className="w-4 h-4" /> Move to Back
                </button>
              </PopoverContent>
            </Popover>
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Align
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Flip</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'shape' && (
          <>
            <button 
              onClick={() => toast.info('Replace shape')}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2"
            >
              <Replace className="w-4 h-4" />
              Replace
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Square className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Border Style</p></TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1.5 rounded hover:bg-gray-700 flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-gray-300" />
                  <div 
                    className="w-4 h-4 rounded border border-gray-500"
                    style={{ backgroundColor: currentElement.fill || '#ffffff' }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-gray-800 border-gray-700" align="center">
                <p className="text-xs font-medium text-gray-300 mb-2">Fill Color</p>
                <input 
                  type="color" 
                  value={currentElement.fill || '#ffffff'}
                  onChange={(e) => updateElement(currentElement.id, { fill: e.target.value })}
                  className="w-32 h-8 cursor-pointer"
                />
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Border Width</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Opacity</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Link2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Add Link</p></TooltipContent>
            </Tooltip>
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Alt text
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-1">
                  Layers
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-gray-800 border-gray-700" align="center">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowUpToLine className="w-4 h-4" /> Move to Front
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronUp className="w-4 h-4" /> Move Forward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronDown className="w-4 h-4" /> Move Backward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowDownToLine className="w-4 h-4" /> Move to Back
                </button>
              </PopoverContent>
            </Popover>
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Align
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Flip</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'text' && (
          <>
            {/* Font selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 min-w-[100px]">
                  <Type className="w-4 h-4" />
                  {currentElement.fontFamily || 'Inter'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-gray-800 border-gray-700" align="start">
                {FONTS.map(font => (
                  <button 
                    key={font}
                    onClick={() => updateElement(currentElement.id, { fontFamily: font })}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            {/* Heading style */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
                  Heading 1
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1 bg-gray-800 border-gray-700" align="center">
                <button className="w-full text-left px-3 py-2 text-2xl text-gray-200 hover:bg-gray-700 rounded">Heading 1</button>
                <button className="w-full text-left px-3 py-2 text-xl text-gray-200 hover:bg-gray-700 rounded">Heading 2</button>
                <button className="w-full text-left px-3 py-2 text-lg text-gray-200 hover:bg-gray-700 rounded">Heading 3</button>
                <button className="w-full text-left px-3 py-2 text-base text-gray-200 hover:bg-gray-700 rounded">Body</button>
              </PopoverContent>
            </Popover>
            {/* Font size controls */}
            <div className="flex items-center gap-1 px-1">
              <button 
                onClick={() => updateElement(currentElement.id, { fontSize: Math.max(8, (currentElement.fontSize || 16) - 2) })}
                className="p-1.5 rounded text-gray-300 hover:bg-gray-700"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm text-white min-w-[30px] text-center">{currentElement.fontSize || 16}</span>
              <button 
                onClick={() => updateElement(currentElement.id, { fontSize: Math.min(96, (currentElement.fontSize || 16) + 2) })}
                className="p-1.5 rounded text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            {/* Text formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Bold className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Bold</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Italic className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Italic</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Underline className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Underline</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            {/* Alignment */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <AlignLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Align Left</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <AlignCenter className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Align Center</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <List className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Bullet List</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <ListOrdered className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Numbered List</p></TooltipContent>
            </Tooltip>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            {/* Effects & Color */}
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Effects
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1.5 rounded hover:bg-gray-700 flex items-center gap-1">
                  <Palette className="w-4 h-4 text-gray-300" />
                  <div 
                    className="w-4 h-4 rounded border border-gray-500"
                    style={{ backgroundColor: currentElement.textColor || '#000000' }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-gray-800 border-gray-700" align="center">
                <p className="text-xs font-medium text-gray-300 mb-2">Text Color</p>
                <input 
                  type="color" 
                  value={currentElement.textColor || '#000000'}
                  onChange={(e) => updateElement(currentElement.id, { textColor: e.target.value })}
                  className="w-32 h-8 cursor-pointer"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
                  Layers
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-gray-800 border-gray-700" align="center">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowUpToLine className="w-4 h-4" /> Move to Front
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronUp className="w-4 h-4" /> Move Forward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ChevronDown className="w-4 h-4" /> Move Backward
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded">
                  <ArrowDownToLine className="w-4 h-4" /> Move to Back
                </button>
              </PopoverContent>
            </Popover>
            <button className="px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Align
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-300 hover:bg-gray-700 hover:text-red-400"
                >
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
      cursor: element.locked ? 'not-allowed' : (isMoving && isSelected ? 'move' : 'pointer'),
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    };

    if (element.type === 'image') {
      // Check if this is a placeholder
      if (element.isPlaceholder || !element.src) {
        return (
          <div
            key={element.id}
            onClick={(e) => handleElementClick(e, element.id)}
            style={baseStyle}
            className="bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4"
          >
            <p className="text-xs text-gray-500 mb-3 text-center">Select an image</p>
            <div className="flex gap-2">
              {SUGGESTED_IMAGES.map((imgSrc, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSuggestedImage(element.id, imgSrc);
                  }}
                  className="w-12 h-12 rounded border-2 border-transparent hover:border-emerald-500 overflow-hidden transition-all"
                >
                  <img src={imgSrc} alt={`Suggestion ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div
          key={element.id}
          onClick={(e) => handleElementClick(e, element.id)}
          style={baseStyle}
          className={`transition-all group/image ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
        >
          <img 
            src={element.src} 
            alt="Element" 
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover/image:opacity-100">
            <button 
              onClick={(e) => { e.stopPropagation(); toast.info('Replace image'); }}
              className="px-3 py-1.5 bg-white rounded-md shadow-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <Replace className="w-3.5 h-3.5" />
              Replace
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleEditWithAI(element.id); }}
              className="px-3 py-1.5 bg-white rounded-md shadow-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              className="px-3 py-1.5 bg-white rounded-md shadow-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
          {isSelected && (
            <>
              {/* Selection handles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize" />
              {/* Lock icon - inside top right, not overlapping corners */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLock(element.id); }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-sm flex items-center justify-center shadow-sm"
              >
                {element.locked ? <Unlock className="w-3 h-3 text-white" /> : <Lock className="w-3 h-3 text-white" />}
              </button>
              {/* Rotation and Move handles */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div 
                  onMouseDown={(e) => handleMoveStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-move flex items-center justify-center shadow-sm hover:bg-blue-50 active:bg-blue-100"
                >
                  <Move className="w-3 h-3 text-blue-500" />
                </div>
                <div 
                  onMouseDown={(e) => handleRotateStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab flex items-center justify-center shadow-sm hover:bg-blue-50 active:bg-blue-100"
                >
                  <RotateCw className="w-3 h-3 text-blue-500" />
                </div>
              </div>
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
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-se-resize" />
              {/* Lock icon - inside top right */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLock(element.id); }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-sm flex items-center justify-center shadow-sm"
              >
                {element.locked ? <Unlock className="w-3 h-3 text-white" /> : <Lock className="w-3 h-3 text-white" />}
              </button>
              {/* Rotation and Move handles */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div 
                  onMouseDown={(e) => handleMoveStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-red-500 rounded-full cursor-move flex items-center justify-center shadow-sm hover:bg-red-50 active:bg-red-100"
                >
                  <Move className="w-3 h-3 text-red-500" />
                </div>
                <div 
                  onMouseDown={(e) => handleRotateStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-red-500 rounded-full cursor-grab flex items-center justify-center shadow-sm hover:bg-red-50 active:bg-red-100"
                >
                  <RotateCw className="w-3 h-3 text-red-500" />
                </div>
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
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-n-resize" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-w-resize" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize" />
              {/* Lock icon - inside top right */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLock(element.id); }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-sm flex items-center justify-center shadow-sm z-10"
              >
                {element.locked ? <Unlock className="w-3 h-3 text-white" /> : <Lock className="w-3 h-3 text-white" />}
              </button>
              {/* Rotation and Move handles */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div 
                  onMouseDown={(e) => handleMoveStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-move flex items-center justify-center shadow-sm hover:bg-blue-50 active:bg-blue-100"
                >
                  <Move className="w-3 h-3 text-blue-500" />
                </div>
                <div 
                  onMouseDown={(e) => handleRotateStart(e, element.id)}
                  className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab flex items-center justify-center shadow-sm hover:bg-blue-50 active:bg-blue-100"
                >
                  <RotateCw className="w-3 h-3 text-blue-500" />
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  // Render page thumbnail with actual content
  const renderPageThumbnail = (page: Page) => {
    const elements = getPageElements(page);
    const coverImg = page.type === 'cover' ? elements.find(el => el.type === 'image')?.src : null;

    if (page.type === 'cover') {
      return (
        <div className="absolute inset-0">
          {coverImg ? (
            <img src={coverImg} alt="Cover" className="w-full h-1/2 object-cover" />
          ) : (
            <div className="w-full h-1/2 bg-gradient-to-br from-emerald-500 to-teal-600" />
          )}
          <div className="absolute bottom-1 left-1 right-1 text-[4px] font-bold text-gray-800 truncate">
            {bookTitle || 'STRATEGIC'}
          </div>
        </div>
      );
    }

    if (page.type === 'toc') {
      return (
        <div className="p-1">
          <div className="text-[4px] font-bold text-gray-800 mb-0.5">Contents</div>
          <div className="space-y-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-0.5 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      );
    }

    if (page.type === 'back') {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center">
          <span className="text-[5px] font-bold text-white">ESCROW</span>
        </div>
      );
    }

    // Chapter pages
    const chapterImg = elements.find(el => el.type === 'image')?.src;
    return (
      <div className="absolute inset-0">
        <div className="h-1/4 bg-gradient-to-br from-teal-700 to-teal-900" />
        <div className="p-1">
          <div className="text-[4px] font-bold text-gray-800 truncate">{page.title}</div>
          {chapterImg && (
            <div className="mt-0.5 h-1/3">
              <img src={chapterImg} alt="" className="w-full h-full object-cover rounded-sm" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative h-full">
        {/* AI Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Edit with AI
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Describe how you want to modify this image:
              </p>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., Make the image brighter, add a warm filter, remove the background..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Canvas Controls - Inside Canvas Area */}

        {/* Main Canvas Area */}
        <div className="flex-1 flex min-h-0">
          {/* Canvas Container with Rulers */}
          <div className="flex-1 flex flex-col min-h-0">
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

            <div className="flex-1 flex min-h-0">
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

              {/* Canvas - scrollable with page closer to top */}
              <div 
                ref={canvasRef}
                className="flex-1 flex flex-col items-center pt-2 pb-8 overflow-auto relative"
                style={{ backgroundColor: '#e5e7eb' }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Contextual Black Toolbar - sticky at top center, doesn't overlap */}
                {selectedElement && (
                  <div className="sticky top-4 z-50 flex justify-center mb-4">
                    {renderContextualToolbar()}
                  </div>
                )}

                {/* Bottom Right Vertical Controls - Undo/Redo and Zoom */}
                <div className="fixed bottom-24 right-64 z-40 flex flex-col gap-2">
                  {/* Undo/Redo */}
                  <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => toast.info('Undo')}
                          disabled={!canUndo}
                          className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs"><p>Undo (⌘Z)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => toast.info('Redo')}
                          disabled={!canRedo}
                          className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs"><p>Redo (⌘⇧Z)</p></TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="flex flex-col items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleZoomOut}
                          className="p-2 rounded text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs"><p>Zoom Out</p></TooltipContent>
                    </Tooltip>
                    <button 
                      onClick={handleZoomFit}
                      className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                    >
                      {zoom}%
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleZoomIn}
                          className="p-2 rounded text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs"><p>Zoom In</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                {/* All Pages in Canvas - scrollable */}
                <div className="flex flex-col items-center gap-8 py-4">
                  {pages.map((page, pageIndex) => {
                    const pageElements = getPageElements(page);
                    const isSelected = page.id === selectedPageId;
                    
                    return (
                      <div key={page.id} className="relative">
                        {/* Page Label */}
                        <div className="absolute -top-6 left-0 text-xs font-medium text-gray-500">
                          Page {pageIndex + 1} - {page.title}
                        </div>
                        
                        {/* Page Canvas */}
                        <div 
                          ref={isSelected ? pageCanvasRef : undefined}
                          onClick={(e) => {
                            onPageSelect(page.id);
                            if (e.target === e.currentTarget) {
                              setSelectedElement(null);
                            }
                          }}
                          className={`bg-white shadow-xl relative flex-shrink-0 overflow-visible cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                          style={{
                            width: `${(8.5 * 72 * zoom) / 100}px`,
                            height: `${(11 * 72 * zoom) / 100}px`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                            minWidth: `${8.5 * 72}px`,
                            minHeight: `${11 * 72}px`,
                          }}
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
                          <div className="absolute inset-0 overflow-visible">
                            {isSelected 
                              ? currentPageElements.map(el => renderCanvasElement(el))
                              : pageElements.map(el => (
                                <div 
                                  key={el.id}
                                  className="absolute pointer-events-none"
                                  style={{
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    width: `${el.width}%`,
                                    height: `${el.height}%`,
                                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                                  }}
                                >
                                  {el.type === 'image' && el.src && (
                                    <img src={el.src} alt="" className="w-full h-full object-cover" />
                                  )}
                                  {el.type === 'shape' && (
                                    <div className="w-full h-full" style={{ backgroundColor: el.fill }} />
                                  )}
                                  {el.type === 'text' && (
                                    <div 
                                      className="w-full h-full"
                                      style={{
                                        fontFamily: el.fontFamily,
                                        fontSize: `${el.fontSize}px`,
                                        color: el.textColor,
                                        lineHeight: 1.2,
                                        whiteSpace: 'pre-wrap',
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                </div>
                              ))
                            }
                          </div>

                          {/* Page Number */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                            {pageIndex + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Page Navigator (Right Side) */}
          <div className="w-48 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">Pages</span>
              <button 
                onClick={() => toast.success('Add page')}
                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {pages.map((page, index) => (
                <div 
                  key={page.id}
                  className="flex items-start gap-2"
                >
                  {/* Page Number on the left */}
                  <span className={`text-xs font-medium mt-1 min-w-[16px] text-right ${
                    selectedPageId === page.id ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  
                  {/* Page Thumbnail */}
                  <button
                    onClick={() => onPageSelect(page.id)}
                    onMouseEnter={() => setHoveredPageId(page.id)}
                    onMouseLeave={() => setHoveredPageId(null)}
                    className={`flex-1 group relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPageId === page.id 
                        ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200' 
                        : hoveredPageId === page.id
                          ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                          : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="aspect-[8.5/11] bg-white flex items-center justify-center relative">
                      {renderPageThumbnail(page)}
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 p-1 ${
                      page.type === 'back' ? 'bg-teal-900/80' : 'bg-white/90'
                    }`}>
                      <p className={`text-[8px] truncate ${
                        page.type === 'back' ? 'text-white' : 'text-gray-600'
                      }`}>
                        {page.title}
                      </p>
                    </div>
                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.info('Duplicate page'); }}
                        className="p-0.5 rounded bg-white/90 hover:bg-white shadow-sm"
                      >
                        <Copy className="w-2.5 h-2.5 text-gray-600" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.info('Delete page'); }}
                        className="p-0.5 rounded bg-white/90 hover:bg-white shadow-sm"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-red-500" />
                      </button>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookCanvasEditor;
