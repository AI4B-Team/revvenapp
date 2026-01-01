import { useEffect, useState, useRef } from 'react';
import { 
  MousePointer2, Type, Square, Circle, Image as ImageIcon, 
  Minus, Undo2, Redo2, ZoomIn, ZoomOut, Hand, Layers, ChevronLeft, ChevronRight, 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, Link as LinkIcon, Smartphone, Monitor } from 'lucide-react';
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
  type: 'cover' | 'toc' | 'chapter' | 'chapter-page' | 'back';
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
  strokeWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
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

// Page action icons for the vertical toolbar
const PAGE_ACTIONS = [
  { id: 'add', icon: Plus, label: 'Add New Page' },
  { id: 'duplicate', icon: Copy, label: 'Duplicate Page' },
  { id: 'lock', icon: Lock, label: 'Lock Page' },
  { id: 'delete', icon: Trash2, label: 'Delete Page' },
  { id: 'moveUp', icon: ChevronUp, label: 'Move Page Up' },
  { id: 'moveDown', icon: ChevronDown, label: 'Move Page Down' },
  { id: 'settings', icon: SlidersHorizontal, label: 'Page Settings' },
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
  // Stock images strip at the top of each chapter page
  ...Array.from({ length: 3 }, (_, idx) => ({
    id: `chapter${chapterNum}-stock-${idx + 1}`,
    type: 'image' as const,
    x: 52 + idx * 16,
    y: 3,
    width: 14,
    height: 18,
    src: SUGGESTED_IMAGES[(chapterNum - 1 + idx) % SUGGESTED_IMAGES.length]
  })),
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
    width: 80,
    height: 20,
    content: 'Our research indicates significant growth potential in emerging markets. The data suggests a 15% increase in investor confidence over the past quarter.',
    fontSize: 10,
    fontFamily: 'Georgia',
    textColor: '#374151'
  }
];

// Chapter title page - full page image with chapter title overlay
const createChapterPageElements = (chapterNum: number, title: string): CanvasElement[] => [
  {
    id: `chapterpage${chapterNum}-bg-image`,
    type: 'image',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    src: SUGGESTED_IMAGES[(chapterNum - 1) % SUGGESTED_IMAGES.length]
  },
  {
    id: `chapterpage${chapterNum}-overlay`,
    type: 'shape',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: 'rgba(0, 0, 0, 0.5)',
    stroke: 'transparent',
    shapeType: 'rectangle'
  },
  {
    id: `chapterpage${chapterNum}-number`,
    type: 'text',
    x: 10,
    y: 40,
    width: 80,
    height: 10,
    content: `CHAPTER ${chapterNum}`,
    fontSize: 18,
    fontFamily: 'Georgia',
    textColor: '#ffffff'
  },
  {
    id: `chapterpage${chapterNum}-title`,
    type: 'text',
    x: 10,
    y: 48,
    width: 80,
    height: 15,
    content: title,
    fontSize: 36,
    fontFamily: 'Georgia',
    textColor: '#ffffff'
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
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  
  // Page settings state
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [pageFormat, setPageFormat] = useState('Custom');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageWidth, setPageWidth] = useState(800);
  const [pageHeight, setPageHeight] = useState(1131.37);
  const [resizeContent, setResizeContent] = useState(true);
  const [linkDimensions, setLinkDimensions] = useState(true);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  // Drag state for element movement
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
  const [isRotatingDrag, setIsRotatingDrag] = useState(false);
  const [rotateStart, setRotateStart] = useState<{ angle: number; elementRotation: number } | null>(null);
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ 
    x: number; y: number; 
    elementX: number; elementY: number; 
    elementWidth: number; elementHeight: number 
  } | null>(null);
  
  // Track page elements state per page
  const [pageElementsState, setPageElementsState] = useState<Record<string, CanvasElement[]>>({});
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomFit = () => setZoom(100);

  // Scroll to page when selected from sidebar
  const scrollToPage = (pageId: string) => {
    const pageElement = pageRefs.current[pageId];
    if (pageElement && canvasRef.current) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      case 'chapter-page': {
        // Extract chapter number from title like "Executive Summary" or "Chapter 1: Executive Summary"
        const pageIndex = pages.findIndex(p => p.id === page.id);
        const chapterPageNum = pages.slice(0, pageIndex + 1).filter(p => p.type === 'chapter-page').length;
        return createChapterPageElements(chapterPageNum, page.title || 'Chapter ' + chapterPageNum);
      }
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

  // Handle resize handle mouse down
  const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    const element = currentPageElements.find(el => el.id === elementId);
    if (element && !element.locked) {
      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        elementX: element.x,
        elementY: element.y,
        elementWidth: element.width,
        elementHeight: element.height
      });
      setSelectedElement(elementId);
    }
  };

  // Handle pointer/mouse move for dragging and resizing
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDragging && dragStart && selectedElement && pageCanvasRef.current) {
      const rect = pageCanvasRef.current.getBoundingClientRect();
      const deltaX = (clientX - dragStart.x) / rect.width * 100;
      const deltaY = (clientY - dragStart.y) / rect.height * 100;

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
        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        const deltaAngle = angle - rotateStart.angle;

        updateElement(selectedElement, {
          rotation: rotateStart.elementRotation + deltaAngle
        });
      }
    }

    // Handle resizing
    if (isResizing && resizeStart && resizeHandle && selectedElement && pageCanvasRef.current) {
      const rect = pageCanvasRef.current.getBoundingClientRect();
      const deltaX = (clientX - resizeStart.x) / rect.width * 100;
      const deltaY = (clientY - resizeStart.y) / rect.height * 100;

      let newX = resizeStart.elementX;
      let newY = resizeStart.elementY;
      let newWidth = resizeStart.elementWidth;
      let newHeight = resizeStart.elementHeight;

      const minSize = 5; // minimum 5% size

      // Handle different resize handles
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(minSize, resizeStart.elementWidth + deltaX);
      }
      if (resizeHandle.includes('w')) {
        const widthChange = Math.min(deltaX, resizeStart.elementWidth - minSize);
        newX = resizeStart.elementX + widthChange;
        newWidth = resizeStart.elementWidth - widthChange;
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(minSize, resizeStart.elementHeight + deltaY);
      }
      if (resizeHandle.includes('n')) {
        const heightChange = Math.min(deltaY, resizeStart.elementHeight - minSize);
        newY = resizeStart.elementY + heightChange;
        newHeight = resizeStart.elementHeight - heightChange;
      }

      // Clamp to canvas bounds
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newWidth = Math.min(100 - newX, newWidth);
      newHeight = Math.min(100 - newY, newHeight);

      updateElement(selectedElement, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  // Ensure interactions continue even when the cursor leaves the canvas
  useEffect(() => {
    if (!isDragging && !isRotatingDrag && !isResizing) return;

    const onMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onUp = () => handleMouseUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [
    isDragging,
    isRotatingDrag,
    isResizing,
    dragStart,
    rotateStart,
    resizeStart,
    resizeHandle,
    selectedElement,
    currentElement,
    currentPageElements,
  ]);

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
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setResizeStart(null);
    }
  };

  // Handle file upload for images
  const handleImageUpload = (elementId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-element-id', elementId);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const elementId = e.target.getAttribute('data-element-id');
    if (file && elementId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateElement(elementId, { src: dataUrl, isPlaceholder: false });
        toast.success('Image uploaded');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
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

  // Contextual toolbar based on selected element type - LIGHT TOOLBAR
  const renderContextualToolbar = () => {
    if (!currentElement) return null;

    // Color picker popover component
    const ColorPickerPopover = ({ 
      label, 
      value, 
      onChange, 
      isBorder = false 
    }: { 
      label: string; 
      value: string; 
      onChange: (color: string) => void;
      isBorder?: boolean;
    }) => {
      const projectColors = ['transparent', '#ffffff', '#1a1a2e', '#3b5998', '#b8c4d4', '#e0e7ef'];
      
      return (
        <PopoverContent className="w-72 p-4 bg-white border border-gray-200 shadow-lg" align="start" sideOffset={8}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Project Colors</span>
            <button onClick={() => {}} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            {projectColors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => onChange(color)}
                className={`w-8 h-8 rounded-full border-2 ${value === color ? 'border-blue-500' : 'border-gray-200'}`}
                style={{ 
                  backgroundColor: color === 'transparent' ? 'transparent' : color,
                  backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                  backgroundSize: color === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : 'auto'
                }}
              >
                {color === 'transparent' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-red-500 rotate-45 absolute" />
                  </div>
                )}
              </button>
            ))}
            <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Brand Kit</p>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
              <Sparkles className="w-4 h-4" />
              Auto-Fill Your Brand Colors
            </button>
          </div>
          
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">HEX</label>
              <input 
                type="text" 
                value={value.toUpperCase()}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-gray-500 mb-1 block">Opacity</label>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value="100"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Droplet className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 h-6 rounded-lg" style={{
              background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'
            }}>
              <input 
                type="range" 
                className="w-full h-full opacity-0 cursor-pointer"
                min="0" 
                max="360"
              />
            </div>
          </div>
          
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3" style={{
            background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${value})`
          }}>
            <div 
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md"
              style={{ left: '80%', top: '20%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="w-4 h-4" />
              <span>Good Contrast</span>
            </div>
            <span className="text-gray-400 ml-auto">19.42:1</span>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </PopoverContent>
      );
    };

    // Border width popover with slider
    const BorderWidthPopover = () => (
      <PopoverContent className="w-56 p-3 bg-white border border-gray-200 shadow-lg" align="center" sideOffset={8}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Width</span>
          <Slider 
            defaultValue={[currentElement.strokeWidth || 0]} 
            max={20} 
            step={1}
            onValueChange={(val) => updateElement(currentElement.id, { strokeWidth: val[0] })}
            className="flex-1"
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 min-w-[50px] justify-center">
            {currentElement.strokeWidth || 0}px
          </div>
        </div>
      </PopoverContent>
    );

    // Border style popover
    const BorderStylePopover = () => (
      <PopoverContent className="w-36 p-1 bg-white border border-gray-200 shadow-lg" align="center" sideOffset={8}>
        <button 
          onClick={() => updateElement(currentElement.id, { borderStyle: 'solid' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          <div className="w-8 h-0 border-t-2 border-gray-800" />
          <span className="text-blue-600">Solid</span>
        </button>
        <button 
          onClick={() => updateElement(currentElement.id, { borderStyle: 'dashed' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          <div className="w-8 h-0 border-t-2 border-dashed border-gray-800" />
          <span>Dashed</span>
        </button>
        <button 
          onClick={() => updateElement(currentElement.id, { borderStyle: 'dotted' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          <div className="w-8 h-0 border-t-2 border-dotted border-gray-800" />
          <span>Dotted</span>
        </button>
      </PopoverContent>
    );

    // Align popover with full alignment options
    const AlignPopover = () => (
      <PopoverContent className="w-64 p-3 bg-white border border-gray-200 shadow-lg" align="center" sideOffset={8}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Align To</span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <ArrowUpToLine className="w-4 h-4" />
            <span className="text-xs">Top</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-xs">Middle</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <ArrowDownToLine className="w-4 h-4" />
            <span className="text-xs">Bottom</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <AlignLeft className="w-4 h-4" />
            <span className="text-xs">Left</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <AlignCenter className="w-4 h-4" />
            <span className="text-xs">Center</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600">
            <AlignRight className="w-4 h-4" />
            <span className="text-xs">Right</span>
          </button>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Distribute</span>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-100 rounded">
              <GripVertical className="w-4 h-4" />
              <span>Vertically</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-100 rounded">
              <Minus className="w-4 h-4 rotate-90" />
              <span>Horizontally</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    );

    // Layers popover with keyboard shortcuts
    const LayersPopover = () => (
      <PopoverContent className="w-56 p-1 bg-white border border-gray-200 shadow-lg" align="center" sideOffset={8}>
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          <div className="flex items-center gap-2">
            <ArrowUpToLine className="w-4 h-4" /> 
            <span>Move To Front</span>
          </div>
          <span className="text-xs text-gray-400">ctrl + shift + &gt;</span>
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          <div className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4" /> 
            <span>Move Forward</span>
          </div>
          <span className="text-xs text-gray-400">ctrl + &gt;</span>
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" /> 
            <span>Move Backwards</span>
          </div>
          <span className="text-xs text-gray-400">ctrl + &lt;</span>
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4" /> 
            <span>Move To Back</span>
          </div>
          <span className="text-xs text-gray-400">ctrl + shift + &lt;</span>
        </button>
      </PopoverContent>
    );

    // Shape picker grid for Replace
    const ShapePickerPopover = () => {
      const shapes = [
        'square', 'rounded-square', 'circle', 'oval', 'semicircle', 'arc', 'ring', 'image-frame',
        'triangle', 'right-triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'decagon', 'star',
        'moon', 'clover', 'cross', 'chevron-right', 'chevron-down', 'arrow-right', 'lightning', 'leaf',
        'heart', 'droplet', 'arrow-curved', 'banner', 'parallelogram', 'trapezoid', 'badge', 'cloud',
        'chat-bubble', 'thought-bubble', 'callout', 'explosion', 'rectangle', 'rounded-rect', 'pill', 'cylinder',
        'corner', 'bracket', 'wave', 'zigzag', 'puzzle', 'gear', 'blob', 'splat',
        'frame', 'polaroid', 'ribbon', 'scroll', 'flag', 'bookmark', 'tag', 'price-tag',
        'sunburst', 'chain', 'pattern', 'chevrons', 'dots-h', 'dots-grid', 'circles', 'flowers'
      ];
      
      return (
        <PopoverContent className="w-72 p-3 bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto" align="start" sideOffset={8}>
          <div className="grid grid-cols-8 gap-1">
            {shapes.map((shape, idx) => (
              <button 
                key={idx}
                onClick={() => toast.info(`Selected ${shape} shape`)}
                className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 hover:border-gray-300"
              >
                <Square className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>
        </PopoverContent>
      );
    };

    // Link popover for adding URLs
    const LinkPopover = () => {
      const [linkUrl, setLinkUrl] = useState('https://');
      
      return (
        <PopoverContent className="w-64 p-2 bg-white border border-gray-200 shadow-lg" align="center" sideOffset={8}>
          <div className="flex items-center gap-2">
            <Input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              className="flex-1 h-9 text-sm border-gray-200"
            />
            <Button
              onClick={() => {
                if (linkUrl && linkUrl !== 'https://') {
                  toast.success(`Link applied: ${linkUrl}`);
                }
              }}
              className="h-9 px-4 bg-teal-500 hover:bg-teal-600 text-white text-sm"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 px-2 py-1.5 whitespace-nowrap">
        {currentElement.type === 'image' && (
          <>
            <button 
              onClick={() => toast.info('Replace image')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded flex items-center gap-2"
            >
              Replace
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Fill Color */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-5 h-5 rounded border border-gray-300"
                        style={{ backgroundColor: currentElement.fill || '#dc2525' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Color Fill</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <ColorPickerPopover 
                label="Fill Color" 
                value={currentElement.fill || '#dc2525'} 
                onChange={(color) => updateElement(currentElement.id, { fill: color })}
              />
            </Popover>
            
            {/* Border Color */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-5 h-5 rounded border-2"
                        style={{ borderColor: currentElement.stroke || '#dc2525', backgroundColor: 'transparent' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Color</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <ColorPickerPopover 
                label="Border Color" 
                value={currentElement.stroke || '#dc2525'} 
                onChange={(color) => updateElement(currentElement.id, { stroke: color })}
                isBorder
              />
            </Popover>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Droplet className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Transparency</p></TooltipContent>
            </Tooltip>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Crop className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Crop</p></TooltipContent>
            </Tooltip>
            
            {/* Border Style */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlignJustify className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Style</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <BorderStylePopover />
            </Popover>
            
            {/* Border Width */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Minus className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Width</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <BorderWidthPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link2 className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Add Link</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <LinkPopover />
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Layers
                </button>
              </PopoverTrigger>
              <LayersPopover />
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Align
                </button>
              </PopoverTrigger>
              <AlignPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'shape' && (
          <>
            {/* Replace with shape picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded flex items-center gap-2">
                  Replace
                </button>
              </PopoverTrigger>
              <ShapePickerPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Fill Color */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-5 h-5 rounded border border-gray-300"
                        style={{ backgroundColor: currentElement.fill || '#ffffff' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Color Fill</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <ColorPickerPopover 
                label="Fill Color" 
                value={currentElement.fill || '#ffffff'} 
                onChange={(color) => updateElement(currentElement.id, { fill: color })}
              />
            </Popover>
            
            {/* Border Color */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-5 h-5 rounded border-2"
                        style={{ borderColor: currentElement.stroke || '#dc2525', backgroundColor: 'transparent' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Color</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <ColorPickerPopover 
                label="Border Color" 
                value={currentElement.stroke || '#dc2525'} 
                onChange={(color) => updateElement(currentElement.id, { stroke: color })}
                isBorder
              />
            </Popover>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Droplet className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Transparency</p></TooltipContent>
            </Tooltip>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Border Style */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlignJustify className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Style</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <BorderStylePopover />
            </Popover>
            
            {/* Border Width */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Minus className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Border Width</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <BorderWidthPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link2 className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Add Link</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <LinkPopover />
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Layers
                </button>
              </PopoverTrigger>
              <LayersPopover />
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Align
                </button>
              </PopoverTrigger>
              <AlignPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {currentElement.type === 'text' && (
          <>
            {/* Font selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 text-sm text-gray-700 border border-gray-200 hover:bg-gray-50 rounded flex items-center gap-2 min-w-[100px]">
                  <Type className="w-4 h-4" />
                  {currentElement.fontFamily || 'Inter'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-white border border-gray-200 shadow-lg" align="start">
                {FONTS.map(font => (
                  <button 
                    key={font}
                    onClick={() => updateElement(currentElement.id, { fontFamily: font })}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            
            {/* Font size controls */}
            <div className="flex items-center gap-1 px-1">
              <button 
                onClick={() => updateElement(currentElement.id, { fontSize: Math.max(8, (currentElement.fontSize || 16) - 2) })}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm text-gray-700 min-w-[30px] text-center">{currentElement.fontSize || 16}</span>
              <button 
                onClick={() => updateElement(currentElement.id, { fontSize: Math.min(96, (currentElement.fontSize || 16) + 2) })}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Text Color */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-5 h-5 rounded border border-gray-300"
                        style={{ backgroundColor: currentElement.textColor || '#000000' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Text Color</p></TooltipContent>
                  </Tooltip>
                </button>
              </PopoverTrigger>
              <ColorPickerPopover 
                label="Text Color" 
                value={currentElement.textColor || '#000000'} 
                onChange={(color) => updateElement(currentElement.id, { textColor: color })}
              />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Text formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Bold className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Bold</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Italic className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Italic</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Underline className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Underline</p></TooltipContent>
            </Tooltip>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Alignment */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <AlignLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Align Left</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <AlignCenter className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Align Center</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <AlignRight className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Align Right</p></TooltipContent>
            </Tooltip>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Layers
                </button>
              </PopoverTrigger>
              <LayersPopover />
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  Align
                </button>
              </PopoverTrigger>
              <AlignPopover />
            </Popover>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => toggleLock(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100"
                >
                  {currentElement.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>{currentElement.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded text-gray-600 hover:bg-gray-100">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Duplicate</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => deleteElement(currentElement.id)}
                  className="p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    );
  };

  const renderCanvasElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;
    const isHovered = hoveredElement === element.id && !isSelected;
    const selectionBorderColor = element.type === 'shape' ? '#dc2626' : '#3b82f6';
    
    // Get element type label
    const getTypeLabel = () => {
      switch (element.type) {
        case 'image': return 'Image';
        case 'text': return 'Text';
        case 'shape': return 'Shape';
        default: return 'Element';
      }
    };
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      cursor: element.locked ? 'not-allowed' : (isMoving && isSelected ? 'move' : 'pointer'),
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    };
    
    // Hover label component
    const HoverLabel = () => (
      isHovered && (
        <div className="absolute -top-6 left-0 bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-sm shadow-sm z-30 whitespace-nowrap">
          {getTypeLabel()}
        </div>
      )
    );

    if (element.type === 'image') {
      // Check if this is a placeholder
      if (element.isPlaceholder || !element.src) {
        return (
          <div
            key={element.id}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
            style={baseStyle}
            className={`bg-gray-100 border-2 border-dashed flex flex-col items-center justify-center p-4 ${
              isHovered ? 'border-yellow-400' : 'border-gray-300'
            }`}
          >
            <HoverLabel />
            <p className="text-xs text-gray-500 mb-3 text-center">Select an image</p>
            <div className="flex gap-2 mb-3">
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageUpload(element.id);
              }}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded hover:bg-emerald-600 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>
        );
      }

      return (
        <div
          key={element.id}
          onClick={(e) => handleElementClick(e, element.id)}
          onMouseEnter={() => setHoveredElement(element.id)}
          onMouseLeave={() => setHoveredElement(null)}
          style={baseStyle}
          className={`transition-all group/image ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${isHovered ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <HoverLabel />
          <img 
            src={element.src} 
            alt="Element" 
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover/image:opacity-100">
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                updateElement(element.id, { src: undefined, isPlaceholder: true });
              }}
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
              {/* Selection handles with resize functionality */}
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-n-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-w-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-20" />
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
          onMouseEnter={() => setHoveredElement(element.id)}
          onMouseLeave={() => setHoveredElement(null)}
          style={{
            ...baseStyle,
            backgroundColor: element.fill,
            border: element.stroke !== 'transparent' ? `2px solid ${element.stroke}` : 'none',
            boxShadow: isSelected ? `0 0 0 2px ${selectionBorderColor}` : isHovered ? '0 0 0 2px #facc15' : 'none',
          }}
          className="transition-all"
        >
          <HoverLabel />
          {isSelected && (
            <>
              {/* Selection handles with resize functionality */}
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-nw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-n-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-ne-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-w-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-e-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-sw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-s-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-500 rounded-full cursor-se-resize z-20" />
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
          onMouseEnter={() => setHoveredElement(element.id)}
          onMouseLeave={() => setHoveredElement(null)}
          style={{
            ...baseStyle,
            fontFamily: element.fontFamily,
            fontSize: `${element.fontSize}px`,
            color: element.textColor,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
          }}
          className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isHovered ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <HoverLabel />
          {element.content}
          {isSelected && (
            <>
              {/* Selection handles with resize functionality */}
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-n-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-w-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize z-20" />
              <div onMouseDown={(e) => handleResizeStart(e, element.id, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-20" />
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

    // Chapter title pages - full image with overlay
    if (page.type === 'chapter-page') {
      const chapterImg = elements.find(el => el.type === 'image')?.src;
      return (
        <div className="absolute inset-0">
          {chapterImg && (
            <img src={chapterImg} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[5px] font-bold text-white text-center px-1">{page.title}</span>
          </div>
        </div>
      );
    }

    // Chapter content pages
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
                {/* Hidden file input for image uploads */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Controls moved to parent title bar */}
                
                {/* All Pages in Canvas - scrollable */}
                <div className="flex flex-col items-center gap-8 py-4">
                  {pages.map((page, pageIndex) => {
                    const pageElements = getPageElements(page);
                    const isSelected = page.id === selectedPageId;
                    const isCurrentPageWithSelection = isSelected && selectedElement;
                    
                    return (
                      <div 
                        key={page.id} 
                        ref={(el) => { pageRefs.current[page.id] = el; }}
                        className="relative flex flex-col items-center"
                      >
                        {/* Contextual Black Toolbar - appears above page label when element selected on this page */}
                        {isCurrentPageWithSelection && (
                          <div className="flex justify-center mb-3">
                            {renderContextualToolbar()}
                          </div>
                        )}
                        
                        {/* Page Label */}
                        <div className="mb-2 text-xs font-medium text-gray-500">
                          {page.type === 'cover' 
                            ? `Cover Page - ${page.title}`
                            : page.type === 'chapter-page'
                            ? `Chapter Page - ${page.title}`
                            : `Page ${pageIndex + 1} - ${page.title}`
                          }
                        </div>
                        
                        {/* Page Canvas with Vertical Toolbar */}
                        <div className="flex items-start gap-2">
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
                              width: `${8.5 * 72}px`,
                              height: `${11 * 72}px`,
                              transform: `scale(${zoom / 100})`,
                              transformOrigin: 'top center',
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
                          
                          {/* Vertical Page Actions Toolbar */}
                          <div 
                            className="flex flex-col gap-1 pt-2"
                            style={{
                              transform: `scale(${zoom / 100})`,
                              transformOrigin: 'top left',
                            }}
                          >
                            {PAGE_ACTIONS.map((action) => {
                              const Icon = action.icon;
                              
                              // Settings button with popover
                              if (action.id === 'settings') {
                                return (
                                  <Popover key={action.id} open={pageSettingsOpen} onOpenChange={setPageSettingsOpen}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                          <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-md border transition-all border-gray-200 bg-white text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
                                          >
                                            <Icon className="w-4 h-4" />
                                          </button>
                                        </PopoverTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="text-xs">
                                        <p>{action.label}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <PopoverContent side="left" align="start" className="w-64 p-4 bg-white shadow-xl border border-gray-200">
                                      <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900 text-sm">Page Size</h3>
                                        
                                        {/* Resize by Format */}
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Resize By Format</label>
                                          <Select value={pageFormat} onValueChange={(val) => {
                                            setPageFormat(val);
                                            if (val === 'A4') {
                                              setPageWidth(595);
                                              setPageHeight(842);
                                            } else if (val === 'US Letter') {
                                              setPageWidth(612);
                                              setPageHeight(792);
                                            } else if (val === 'A5') {
                                              setPageWidth(420);
                                              setPageHeight(595);
                                            }
                                          }}>
                                            <SelectTrigger className="w-full h-9 text-sm">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Custom">Custom</SelectItem>
                                              <SelectItem value="A4">A4</SelectItem>
                                              <SelectItem value="A5">A5</SelectItem>
                                              <SelectItem value="US Letter">US Letter</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          
                                          {/* Orientation Toggle */}
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => {
                                                setPageOrientation('portrait');
                                                if (pageWidth > pageHeight) {
                                                  const temp = pageWidth;
                                                  setPageWidth(pageHeight);
                                                  setPageHeight(temp);
                                                }
                                              }}
                                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                                                pageOrientation === 'portrait'
                                                  ? 'bg-teal-600 text-white'
                                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              }`}
                                            >
                                              <Smartphone className="w-3 h-3" />
                                              Portrait
                                            </button>
                                            <button
                                              onClick={() => {
                                                setPageOrientation('landscape');
                                                if (pageHeight > pageWidth) {
                                                  const temp = pageHeight;
                                                  setPageHeight(pageWidth);
                                                  setPageWidth(temp);
                                                }
                                              }}
                                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                                                pageOrientation === 'landscape'
                                                  ? 'bg-teal-600 text-white'
                                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              }`}
                                            >
                                              <Monitor className="w-3 h-3" />
                                              Landscape
                                            </button>
                                          </div>
                                        </div>
                                        
                                        {/* Custom Size */}
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Custom Size</label>
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                              <label className="text-[10px] text-gray-500 mb-0.5 block">Width</label>
                                              <Input
                                                type="number"
                                                value={pageWidth}
                                                onChange={(e) => {
                                                  const newWidth = parseFloat(e.target.value);
                                                  setPageWidth(newWidth);
                                                  if (linkDimensions) {
                                                    setPageHeight(newWidth * (pageHeight / pageWidth));
                                                  }
                                                  setPageFormat('Custom');
                                                }}
                                                className="h-8 text-sm"
                                              />
                                            </div>
                                            <button
                                              onClick={() => setLinkDimensions(!linkDimensions)}
                                              className={`mt-4 p-1.5 rounded transition-all ${
                                                linkDimensions
                                                  ? 'bg-teal-100 text-teal-600'
                                                  : 'bg-gray-100 text-gray-400'
                                              }`}
                                            >
                                              <LinkIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex-1">
                                              <label className="text-[10px] text-gray-500 mb-0.5 block">Height</label>
                                              <Input
                                                type="number"
                                                value={pageHeight.toFixed(2)}
                                                onChange={(e) => {
                                                  const newHeight = parseFloat(e.target.value);
                                                  setPageHeight(newHeight);
                                                  if (linkDimensions) {
                                                    setPageWidth(newHeight * (pageWidth / pageHeight));
                                                  }
                                                  setPageFormat('Custom');
                                                }}
                                                className="h-8 text-sm"
                                              />
                                            </div>
                                            <div className="flex flex-col items-center mt-4">
                                              <span className="text-xs text-gray-500">px</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Others */}
                                        <div className="space-y-2">
                                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Others</label>
                                          <div className="flex items-center gap-2">
                                            <Checkbox
                                              id="resize-content"
                                              checked={resizeContent}
                                              onCheckedChange={(checked) => setResizeContent(checked as boolean)}
                                              className="h-4 w-4 border-teal-500 data-[state=checked]:bg-teal-500"
                                            />
                                            <label htmlFor="resize-content" className="text-sm text-gray-700 flex items-center gap-1">
                                              Resize Content
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs max-w-48">
                                                  Scale all content proportionally when resizing the page
                                                </TooltipContent>
                                              </Tooltip>
                                            </label>
                                          </div>
                                        </div>
                                        
                                        {/* Resize Button */}
                                        <Button
                                          onClick={() => {
                                            toast.success(`Page resized to ${pageWidth.toFixed(0)} × ${pageHeight.toFixed(0)} px`);
                                            setPageSettingsOpen(false);
                                          }}
                                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                        >
                                          Resize this Visual
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                );
                              }
                              
                              return (
                                <Tooltip key={action.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        switch (action.id) {
                                          case 'add':
                                            toast.success('Add New Page');
                                            break;
                                          case 'duplicate':
                                            toast.success('Duplicate Page');
                                            break;
                                          case 'lock':
                                            toast.success('Lock Page');
                                            break;
                                          case 'delete':
                                            toast.success('Delete Page');
                                            break;
                                          case 'moveUp':
                                            toast.success('Move Page Up');
                                            break;
                                          case 'moveDown':
                                            toast.success('Move Page Down');
                                            break;
                                        }
                                      }}
                                      className={`p-1.5 rounded-md border transition-all ${
                                        action.id === 'delete' 
                                          ? 'border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500' 
                                          : 'border-gray-200 bg-white text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600'
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="text-xs">
                                    <p>{action.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
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
          <div className={`bg-white border-l border-gray-200 flex flex-col flex-shrink-0 relative transition-all duration-300 ${rightPanelCollapsed ? 'w-0 overflow-hidden' : 'w-48'}`}>
            {/* Toggle Arrow - positioned on middle left border */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="absolute top-1/2 -translate-y-1/2 -left-3 z-50 w-6 h-12 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{rightPanelCollapsed ? 'Show pages' : 'Hide pages'}</p>
              </TooltipContent>
            </Tooltip>
            
            {!rightPanelCollapsed && (
              <>
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
                    onClick={() => {
                      onPageSelect(page.id);
                      scrollToPage(page.id);
                    }}
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
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookCanvasEditor;
