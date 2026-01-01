import { useState, useRef } from 'react';
import { 
  MousePointer2, Type, Square, Circle, Image as ImageIcon, 
  Minus, Undo2, Redo2, ZoomIn, ZoomOut, Hand, Layers, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered,
  Trash2, Copy, ClipboardPaste, Lock, Unlock, Eye, EyeOff,
  ChevronUp, ChevronDown, RotateCcw, FlipHorizontal, FlipVertical,
  Grid3X3, Ruler, Download, Upload, Maximize, Minimize,
  Plus, Check, X, Sparkles, Palette, SlidersHorizontal
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
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleZoomFit = () => setZoom(100);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
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

          {/* Font Controls (when text tool selected) */}
          {(activeTool === 'text' || activeTool === 'select') && (
            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-7 px-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 min-w-[100px] text-left truncate">
                    {selectedFont}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1 max-h-60 overflow-y-auto" align="start">
                  {FONTS.map(font => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                        selectedFont === font ? 'bg-emerald-50 text-emerald-600' : ''
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-7 px-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 min-w-[50px]">
                    {fontSize}px
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-24 p-1 max-h-48 overflow-y-auto" align="start">
                  {FONT_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                        fontSize === size ? 'bg-emerald-50 text-emerald-600' : ''
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs"><p>Bold (⌘B)</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs"><p>Italic (⌘I)</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs"><p>Underline (⌘U)</p></TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-0.5 ml-1">
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
            </div>
          )}

          {/* Color Controls */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 rounded hover:bg-gray-100 flex items-center gap-1">
                      <div 
                        className="w-5 h-5 rounded border border-gray-300 shadow-inner"
                        style={{ backgroundColor: fillColor }}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <p className="text-xs font-medium text-gray-600 mb-2">Fill Color</p>
                    <input 
                      type="color" 
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                      className="w-32 h-8 cursor-pointer"
                    />
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Fill Color</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 rounded hover:bg-gray-100 flex items-center gap-1">
                      <div 
                        className="w-5 h-5 rounded border-2 shadow-inner"
                        style={{ borderColor: strokeColor, backgroundColor: 'transparent' }}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <p className="text-xs font-medium text-gray-600 mb-2">Stroke Color</p>
                    <input 
                      type="color" 
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-32 h-8 cursor-pointer"
                    />
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Stroke Color</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Arrange Controls */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Bring Forward</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Send Backward</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                  <Layers className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Layers</p></TooltipContent>
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
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Container with Rulers */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Horizontal Ruler */}
            {showRulers && (
              <div className="h-5 bg-gray-50 border-b border-gray-200 flex items-end">
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

            <div className="flex-1 flex overflow-hidden">
              {/* Vertical Ruler */}
              {showRulers && (
                <div className="w-5 bg-gray-50 border-r border-gray-200 relative">
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

              {/* Canvas */}
              <div 
                ref={canvasRef}
                className="flex-1 overflow-auto flex items-start justify-center p-2 pt-2"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                {/* Page Canvas - 8.5x11 aspect ratio */}
                <div 
                  className="bg-white shadow-2xl relative"
                  style={{
                    width: `${(8.5 * 72 * zoom) / 100}px`,
                    height: `${(11 * 72 * zoom) / 100}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
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

                  {/* Sample Content */}
                  <div className="absolute inset-0 p-12 flex flex-col">
                    {selectedPage?.type === 'cover' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-500 to-teal-600 -m-12 p-12">
                        <h1 className="text-4xl font-bold text-white mb-4">{bookTitle || 'Your eBook Title'}</h1>
                        <p className="text-xl text-white/80">A Comprehensive Guide</p>
                        <div className="mt-auto">
                          <p className="text-sm text-white/60">By Author Name</p>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                    {pages.findIndex(p => p.id === selectedPageId) + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Navigator (Right Side) */}
          <div className="w-40 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Pages</span>
              <button 
                onClick={() => toast.success('Add page')}
                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
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
