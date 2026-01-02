import { useState } from 'react';
import { X, Link2, ChevronDown, ChevronUp, FileText, Monitor, Share2, Image, LayoutGrid, Sparkles, Plus, Maximize2, Palette, Brush, SlidersHorizontal, Square, CircleDot, Layers, RotateCw, Lock, Unlock, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageSettingsPanelProps {
  pageNumber: number;
  onClose: () => void;
  onSettingsChange?: (settings: PageSettings) => void;
}

interface PageSettings {
  backgroundColor: string;
  backgroundPattern: string | null;
  backgroundGradient: string | null;
  borderType: string;
  borderStyle: string;
  borderSize: string;
  borderColor: string;
  layoutStyle: string;
  pageWidth: number;
  pageHeight: number;
  pageOrientation: 'portrait' | 'landscape';
  pageFormat: string;
}

const PROJECT_COLORS = ['transparent', '#ffffff', '#f3f4f6', '#9ca3af', '#1f2937', '#0d9488', '#06b6d4', '#14b8a6'];

const PATTERNS = [
  { id: 'none', name: 'None' },
  { id: 'waves', name: 'Waves' },
  { id: 'waves-soft', name: 'Soft Waves' },
  { id: 'diagonal-waves', name: 'Diagonal Waves' },
  { id: 'scallops', name: 'Scallops' },
  { id: 'scallops-soft', name: 'Soft Scallops' },
  { id: 'lines', name: 'Lines' },
  { id: 'grid', name: 'Grid' },
  { id: 'bricks', name: 'Bricks' },
  { id: 'chevron', name: 'Chevron' },
  { id: 'geometric-star', name: 'Geometric Star' },
  { id: 'plus-grid', name: 'Plus Grid' },
  { id: 'dots', name: 'Dots' },
  { id: 'circles', name: 'Circles' },
  { id: 'diamonds', name: 'Diamonds' },
  { id: 'hexagons', name: 'Hexagons' },
];

const GRADIENTS = [
  { id: 'grad-1', colors: ['#f0f9ff', '#e0f2fe'] },
  { id: 'grad-2', colors: ['#e0f2fe', '#bae6fd'] },
  { id: 'grad-3', colors: ['#bae6fd', '#7dd3fc'] },
  { id: 'grad-4', colors: ['#7dd3fc', '#38bdf8'] },
  { id: 'grad-5', colors: ['#a5f3fc', '#67e8f9'] },
  { id: 'grad-6', colors: ['#67e8f9', '#22d3ee'] },
  { id: 'grad-7', colors: ['#99f6e4', '#5eead4'] },
  { id: 'grad-8', colors: ['#5eead4', '#2dd4bf'] },
  { id: 'grad-9', colors: ['#a5b4fc', '#818cf8'] },
  { id: 'grad-10', colors: ['#818cf8', '#6366f1'] },
  { id: 'grad-11', colors: ['#c4b5fd', '#a78bfa'] },
  { id: 'grad-12', colors: ['#a78bfa', '#8b5cf6'] },
];

const LAYOUT_STYLES = [
  { id: 'single-column', name: 'Single Column No Image', preview: 'single' },
  { id: 'double-column', name: 'Double Column No Image', preview: 'double' },
  { id: 'double-column-img', name: 'Double Column With Image', preview: 'double-img' },
  { id: 'single-column-img', name: 'Single Column With Image', preview: 'single-img' },
];

// Page format categories
const PAGE_FORMAT_CATEGORIES = [
  {
    label: 'Document',
    formats: [
      { id: 'letter', name: 'Letter', dimensions: '8.5×11inch', width: 816, height: 1056 },
      { id: 'a4', name: 'A4', dimensions: '210×297mm', width: 595, height: 842 },
      { id: 'a3', name: 'A3', dimensions: '297×420mm', width: 842, height: 1191 },
      { id: 'a5', name: 'A5', dimensions: '148×210mm', width: 420, height: 595 },
    ]
  },
  {
    label: 'Screen Sizes',
    formats: [
      { id: '16:9-widescreen', name: '16:9 Widescreen', dimensions: '1024×576px', width: 1024, height: 576 },
      { id: '4:3', name: '4:3', dimensions: '800×600px', width: 800, height: 600 },
    ]
  },
  {
    label: 'Social Media',
    formats: [
      { id: 'instagram-post', name: 'Instagram Post', dimensions: '1080×1080px', width: 1080, height: 1080, icon: 'instagram' },
      { id: 'instagram-tall', name: 'Instagram Post (Tall)', dimensions: '1080×1350px', width: 1080, height: 1350, icon: 'instagram' },
      { id: 'instagram-story', name: 'Instagram Story', dimensions: '1080×1920px', width: 1080, height: 1920, icon: 'instagram' },
      { id: 'instagram-ads', name: 'Instagram Ads', dimensions: '1080×1080px', width: 1080, height: 1080, icon: 'instagram' },
      { id: 'facebook-post', name: 'Facebook Post', dimensions: '1200×630px', width: 1200, height: 630, icon: 'facebook' },
      { id: 'facebook-landscape', name: 'Facebook Post (Landscape)', dimensions: '940×788px', width: 940, height: 788, icon: 'facebook' },
      { id: 'facebook-cover', name: 'Facebook Cover', dimensions: '820×312px', width: 820, height: 312, icon: 'facebook' },
      { id: 'facebook-ads', name: 'Facebook Ads', dimensions: '1080×1080px', width: 1080, height: 1080, icon: 'facebook' },
      { id: 'linkedin-post', name: 'LinkedIn Post', dimensions: '1104×736px', width: 1104, height: 736, icon: 'linkedin' },
      { id: 'linkedin-carousel', name: 'LinkedIn Carousel', dimensions: '1200×1500px', width: 1200, height: 1500, icon: 'linkedin' },
      { id: 'linkedin-header', name: 'LinkedIn Header', dimensions: '1584×396px', width: 1584, height: 396, icon: 'linkedin' },
      { id: 'linkedin-ads', name: 'LinkedIn Ads', dimensions: '1080×1080px', width: 1080, height: 1080, icon: 'linkedin' },
      { id: 'youtube-banner', name: 'Youtube Banner', dimensions: '2560×1440px', width: 2560, height: 1440, icon: 'youtube' },
      { id: 'youtube-thumbnail', name: 'Youtube Thumbnail', dimensions: '1280×720px', width: 1280, height: 720, icon: 'youtube' },
      { id: 'twitter-post', name: 'Twitter Post', dimensions: '1024×512px', width: 1024, height: 512, icon: 'twitter' },
      { id: 'twitter-header', name: 'Twitter Header', dimensions: '1500×500px', width: 1500, height: 500, icon: 'twitter' },
    ]
  },
  {
    label: 'Banner',
    formats: [
      { id: 'blog', name: 'Blog', dimensions: '1024×576px', width: 1024, height: 576 },
      { id: 'email', name: 'Email', dimensions: '600×200px', width: 600, height: 200 },
      { id: 'twitch-banner', name: 'Twitch Banner', dimensions: '1920×480px', width: 1920, height: 480 },
    ]
  },
  {
    label: 'Wallpaper',
    formats: [
      { id: 'desktop', name: 'Desktop', dimensions: '1920×1080px', width: 1920, height: 1080 },
      { id: 'phone', name: 'Phone', dimensions: '1080×1920px', width: 1080, height: 1920 },
    ]
  },
];

type SectionType = 'size' | 'shape' | 'style' | 'border' | 'background' | 'transform' | 'shadow' | null;

const PageSettingsPanel = ({ pageNumber, onClose, onSettingsChange }: PageSettingsPanelProps) => {
  const [openSection, setOpenSection] = useState<SectionType>('size');
  const [backgroundTab, setBackgroundTab] = useState<'color' | 'pattern' | 'image'>('color');
  const [colorType, setColorType] = useState<'solid' | 'gradient'>('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [borderType, setBorderType] = useState('no-border');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderSize, setBorderSize] = useState('1px');
  const [borderColor, setBorderColor] = useState('#e5e7eb');
  const [selectedLayout, setSelectedLayout] = useState('single-column');
  const [hexInput, setHexInput] = useState('#FFFFFF');
  const [bgOpacity, setBgOpacity] = useState(100);
  
  // Page Size state
  const [pageFormat, setPageFormat] = useState('custom');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageWidth, setPageWidth] = useState(800);
  const [pageHeight, setPageHeight] = useState(1131);
  const [linkDimensions, setLinkDimensions] = useState(false);
  const [resizeContent, setResizeContent] = useState(true);

  // Shape Settings state
  const [shapeBackgroundColor, setShapeBackgroundColor] = useState('#2563eb');
  const [radiusEnabled, setRadiusEnabled] = useState(false);
  const [radiusLocked, setRadiusLocked] = useState(true);
  const [radiusTopLeft, setRadiusTopLeft] = useState(10);
  const [radiusTopRight, setRadiusTopRight] = useState(10);
  const [radiusBottomLeft, setRadiusBottomLeft] = useState(10);
  const [radiusBottomRight, setRadiusBottomRight] = useState(10);
  
  // Multi-Page Sync state
  const [multiPageSync, setMultiPageSync] = useState(false);
  const [syncMode, setSyncMode] = useState<'all' | 'custom'>('all');
  const [customPageRange, setCustomPageRange] = useState('1-5');
  const [showPageRangeModal, setShowPageRangeModal] = useState(false);
  const [tempPageRange, setTempPageRange] = useState('');
  
  // Transform state
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Shadow state
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#6b7280');
  const [shadowX, setShadowX] = useState(4);
  const [shadowY, setShadowY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(2);

  const toggleSection = (section: SectionType) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  const getFormatDisplayName = () => {
    if (pageFormat === 'custom') {
      return 'Custom';
    }
    for (const category of PAGE_FORMAT_CATEGORIES) {
      const format = category.formats.find(f => f.id === pageFormat);
      if (format) {
        return `${format.name} - ${format.dimensions}`;
      }
    }
    return 'Custom';
  };
  
  const handleFormatChange = (formatId: string) => {
    setPageFormat(formatId);
    if (formatId === 'custom') return;
    
    for (const category of PAGE_FORMAT_CATEGORIES) {
      const format = category.formats.find(f => f.id === formatId);
      if (format) {
        if (pageOrientation === 'portrait') {
          setPageWidth(format.width);
          setPageHeight(format.height);
        } else {
          setPageWidth(format.height);
          setPageHeight(format.width);
        }
        break;
      }
    }
  };
  
  const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
    setPageOrientation(orientation);
    const tempWidth = pageWidth;
    setPageWidth(pageHeight);
    setPageHeight(tempWidth);
  };
  
  const handleWidthChange = (value: number) => {
    setPageWidth(value);
    if (linkDimensions) {
      const ratio = pageHeight / pageWidth;
      setPageHeight(Math.round(value * ratio));
    }
    setPageFormat('custom');
  };
  
  const handleHeightChange = (value: number) => {
    setPageHeight(value);
    if (linkDimensions) {
      const ratio = pageWidth / pageHeight;
      setPageWidth(Math.round(value * ratio));
    }
    setPageFormat('custom');
  };

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color);
    setHexInput(color.toUpperCase());
    setSelectedGradient(null);
  };

  const handleGradientSelect = (gradientId: string) => {
    setSelectedGradient(gradientId);
    setColorType('gradient');
  };
  
  const handleRadiusChange = (corner: 'tl' | 'tr' | 'bl' | 'br', value: number) => {
    if (radiusLocked) {
      setRadiusTopLeft(value);
      setRadiusTopRight(value);
      setRadiusBottomLeft(value);
      setRadiusBottomRight(value);
    } else {
      switch (corner) {
        case 'tl': setRadiusTopLeft(value); break;
        case 'tr': setRadiusTopRight(value); break;
        case 'bl': setRadiusBottomLeft(value); break;
        case 'br': setRadiusBottomRight(value); break;
      }
    }
  };
  
  const handleEditPageRange = () => {
    setTempPageRange(customPageRange);
    setShowPageRangeModal(true);
  };
  
  const handleConfirmPageRange = () => {
    setCustomPageRange(tempPageRange);
    setShowPageRangeModal(false);
  };

  const renderPatternPreview = (patternId: string) => {
    const patternStyles: Record<string, string> = {
      'none': 'bg-white border border-gray-300 relative overflow-hidden',
      'waves': 'bg-white',
      'lines': 'bg-white',
      'grid': 'bg-white',
      'dots': 'bg-white',
    };

    return (
      <div
        className={`w-full h-full rounded border ${selectedPattern === patternId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} ${patternStyles[patternId] || 'bg-gray-50'}`}
        style={{
          backgroundImage: patternId === 'lines' ? 'repeating-linear-gradient(0deg, transparent, transparent 3px, #e5e7eb 3px, #e5e7eb 4px)' :
                          patternId === 'grid' ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' :
                          patternId === 'dots' ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)' :
                          patternId === 'waves' ? 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'20\' viewBox=\'0 0 40 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q10 0 20 10 T40 10\' fill=\'none\' stroke=\'%23d1d5db\' stroke-width=\'1\'/%3E%3C/svg%3E")' :
                          'none',
          backgroundSize: patternId === 'lines' ? '100% 8px' :
                          patternId === 'grid' ? '8px 8px' :
                          patternId === 'dots' ? '6px 6px' :
                          patternId === 'waves' ? '40px 20px' :
                          'auto',
        }}
      >
        {patternId === 'none' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gray-300 rotate-45 origin-center" style={{ width: '141%', marginLeft: '-20%' }} />
          </div>
        )}
      </div>
    );
  };

  const getSectionIcon = (section: SectionType) => {
    switch (section) {
      case 'size': return Maximize2;
      case 'shape': return CircleDot;
      case 'style': return LayoutGrid;
      case 'border': return Square;
      case 'background': return Palette;
      case 'transform': return RotateCw;
      case 'shadow': return Layers;
      default: return FileText;
    }
  };

  const SectionHeader = ({ title, section, isOpen }: { title: string; section: SectionType; isOpen: boolean }) => {
    const Icon = getSectionIcon(section);
    return (
      <button
        onClick={() => toggleSection(section)}
        className={`w-full flex items-center justify-between px-3 py-2 transition-colors border-b border-gray-200 ${
          isOpen 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-gray-600'}`} />
          <span className={`font-semibold text-base ${isOpen ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
    );
  };

  return (
    <TooltipProvider>
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-white" />
            <span className="font-semibold text-white text-base">Page Settings</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors">
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Page Number - Always visible at top, inline */}
        <div className="px-3 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-gray-800">Page Number</label>
          <Input
            type="text"
            value={pageNumber}
            readOnly
            className="h-8 text-sm bg-white w-20"
          />
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Size Section - Collapsible */}
          <div>
            <SectionHeader title="Size" section="size" isOpen={openSection === 'size'} />
            {openSection === 'size' && (
              <div className="p-3 space-y-3 border-b border-gray-200">
                {/* Resize by Format */}
                <div>
                  <span className="text-sm font-semibold text-gray-800 mb-2 block">Resize By Format</span>
                  <Select value={pageFormat} onValueChange={handleFormatChange}>
                    <SelectTrigger className="h-9 text-sm font-medium justify-center border-2 border-gray-400">
                      <SelectValue>{getFormatDisplayName()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="custom" className="justify-center">Format</SelectItem>
                      {PAGE_FORMAT_CATEGORIES.map((category) => (
                        <SelectGroup key={category.label}>
                          <SelectLabel className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1.5">
                            {category.label}
                          </SelectLabel>
                          {category.formats.map((format) => (
                            <SelectItem key={format.id} value={format.id} className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {format.id.includes('instagram') && <span className="text-pink-500">📷</span>}
                                {format.id.includes('facebook') && <span className="text-blue-600">f</span>}
                                {format.id.includes('linkedin') && <span className="text-blue-700">in</span>}
                                {format.id.includes('youtube') && <span className="text-red-600">▶</span>}
                                {format.id.includes('twitter') && <span className="text-sky-500">𝕏</span>}
                                {!format.id.includes('instagram') && !format.id.includes('facebook') && !format.id.includes('linkedin') && !format.id.includes('youtube') && !format.id.includes('twitter') && (
                                  <FileText className="w-3 h-3 text-gray-400" />
                                )}
                                <span>{format.name}</span>
                                <span className="text-gray-400 ml-1">- {format.dimensions}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Orientation */}
                <div>
                  <span className="text-sm font-semibold text-gray-800 mb-2 block">Orientation</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOrientationChange('portrait')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded border transition-all ${
                        pageOrientation === 'portrait' 
                          ? 'bg-teal-500 text-white border-teal-500' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-2 h-4 border rounded-[2px] ${pageOrientation === 'portrait' ? 'border-white' : 'border-gray-400'}`} />
                      Portrait
                    </button>
                    <button
                      onClick={() => handleOrientationChange('landscape')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded border transition-all ${
                        pageOrientation === 'landscape' 
                          ? 'bg-teal-500 text-white border-teal-500' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-2 border rounded-[2px] ${pageOrientation === 'landscape' ? 'border-white' : 'border-gray-400'}`} />
                      Landscape
                    </button>
                  </div>
                </div>
                
                {/* Custom Size - W and H in fields */}
                <span className="text-sm font-semibold text-gray-800 mb-1 block">Custom Size</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">W</span>
                    <Input
                      type="number"
                      value={pageWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="h-8 text-xs pl-7 pr-2"
                    />
                  </div>
                  <button 
                    onClick={() => setLinkDimensions(!linkDimensions)}
                    className={`p-1.5 rounded transition-colors ${linkDimensions ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">H</span>
                    <Input
                      type="number"
                      value={pageHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="h-8 text-xs pl-7 pr-2"
                    />
                  </div>
                </div>
                
                {/* Resize Content */}
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="resize-content" 
                    checked={resizeContent}
                    onCheckedChange={(checked) => setResizeContent(checked as boolean)}
                  />
                  <label htmlFor="resize-content" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Resize Content
                  </label>
                </div>
                
                {/* Confirm Button */}
                <Button className="w-full h-8 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-sm">
                  Confirm
                </Button>
              </div>
            )}
          </div>

          {/* Shape Settings Section */}
          <div>
            <SectionHeader title="Shape Settings" section="shape" isOpen={openSection === 'shape'} />
            {openSection === 'shape' && (
              <div className="p-3 space-y-4 border-b border-gray-200">
                {/* Background Color */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Background Color</span>
                  <button
                    className="w-10 h-7 rounded border border-gray-300"
                    style={{ backgroundColor: shapeBackgroundColor }}
                  />
                </div>
                
                {/* Radius */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Radius</span>
                    <Switch
                      checked={radiusEnabled}
                      onCheckedChange={setRadiusEnabled}
                    />
                  </div>
                  
                  {radiusEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between relative">
                        {/* Left side - Top Left and Bottom Left */}
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 border-l-2 border-t-2 border-gray-400 rounded-tl" />
                            <Input
                              type="number"
                              value={radiusTopLeft}
                              onChange={(e) => handleRadiusChange('tl', Number(e.target.value))}
                              className="h-8 text-xs pl-7 pr-2 w-20"
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 border-l-2 border-b-2 border-gray-400 rounded-bl" />
                            <Input
                              type="number"
                              value={radiusBottomLeft}
                              onChange={(e) => handleRadiusChange('bl', Number(e.target.value))}
                              className="h-8 text-xs pl-7 pr-2 w-20"
                            />
                          </div>
                        </div>
                        
                        {/* Center - Lock/Unlock button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRadiusLocked(!radiusLocked)}
                              className="p-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                            >
                              {radiusLocked ? (
                                <Lock className="w-3 h-3 text-gray-600" />
                              ) : (
                                <Unlock className="w-3 h-3 text-gray-600" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{radiusLocked ? 'Unconstrain proportions' : 'Constrain proportions'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Right side - Top Right and Bottom Right */}
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-t-2 border-gray-400 rounded-tr" />
                            <Input
                              type="number"
                              value={radiusTopRight}
                              onChange={(e) => handleRadiusChange('tr', Number(e.target.value))}
                              className="h-8 text-xs pl-7 pr-2 w-20"
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-400 rounded-br" />
                            <Input
                              type="number"
                              value={radiusBottomRight}
                              onChange={(e) => handleRadiusChange('br', Number(e.target.value))}
                              className="h-8 text-xs pl-7 pr-2 w-20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Multi-Page Sync */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-800">Multi-Page Sync</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sync this element across multiple pages</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={multiPageSync}
                      onCheckedChange={setMultiPageSync}
                    />
                  </div>
                  
                  {multiPageSync && (
                    <div className="space-y-2 pl-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="syncMode"
                          checked={syncMode === 'all'}
                          onChange={() => setSyncMode('all')}
                          className="text-cyan-500"
                        />
                        <span className="text-xs text-gray-600">All Pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="syncMode"
                          checked={syncMode === 'custom'}
                          onChange={() => setSyncMode('custom')}
                          className="text-cyan-500"
                        />
                        <span className="text-xs text-cyan-500">Custom Range</span>
                      </label>
                      
                      {syncMode === 'custom' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={handleEditPageRange}
                        >
                          Edit Page Range
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Opacity */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">Opacity</span>
                  <div className="flex-1">
                    <Slider
                      value={[opacity]}
                      onValueChange={(v) => setOpacity(v[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                      rangeClassName="bg-emerald-500"
                      thumbClassName="border-emerald-500"
                    />
                  </div>
                  <Input
                    type="number"
                    value={opacity}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value)));
                      setOpacity(val);
                    }}
                    className="h-7 text-xs w-14"
                    min={0}
                    max={100}
                  />
                </div>
                
                {/* Rotation */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">Rotation</span>
                  <div className="flex-1">
                    <Slider
                      value={[rotation]}
                      onValueChange={(v) => setRotation(v[0])}
                      max={360}
                      min={-360}
                      step={1}
                      className="w-full"
                      rangeClassName="bg-emerald-500"
                      thumbClassName="border-emerald-500"
                    />
                  </div>
                  <Input
                    type="number"
                    value={rotation}
                    onChange={(e) => {
                      const val = Math.min(360, Math.max(-360, Number(e.target.value)));
                      setRotation(val);
                    }}
                    className="h-7 text-xs w-14"
                    min={-360}
                    max={360}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shadow Section */}
          <div>
            <SectionHeader title="Shadow" section="shadow" isOpen={openSection === 'shadow'} />
            {openSection === 'shadow' && (
              <div className="p-3 space-y-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-800">Shadow</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add a drop shadow to the element</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={shadowEnabled}
                    onCheckedChange={setShadowEnabled}
                  />
                </div>
                
                {shadowEnabled && (
                  <div className="space-y-3">
                    {/* Color */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">Color</span>
                      <button
                        className="w-10 h-7 rounded border border-gray-300"
                        style={{ backgroundColor: shadowColor }}
                      />
                    </div>
                    
                    {/* X */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">X</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Slider
                            value={[shadowX]}
                            onValueChange={(v) => setShadowX(v[0])}
                            max={50}
                            min={-50}
                            step={1}
                            className="w-full"
                            rangeClassName="bg-emerald-500"
                            thumbClassName="border-emerald-500"
                          />
                        </div>
                        <Input
                          type="number"
                          value={shadowX}
                          onChange={(e) => setShadowX(Number(e.target.value))}
                          className="h-7 text-xs w-14"
                        />
                      </div>
                    </div>
                    
                    {/* Y */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">Y</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Slider
                            value={[shadowY]}
                            onValueChange={(v) => setShadowY(v[0])}
                            max={50}
                            min={-50}
                            step={1}
                            className="w-full"
                            rangeClassName="bg-emerald-500"
                            thumbClassName="border-emerald-500"
                          />
                        </div>
                        <Input
                          type="number"
                          value={shadowY}
                          onChange={(e) => setShadowY(Number(e.target.value))}
                          className="h-7 text-xs w-14"
                        />
                      </div>
                    </div>
                    
                    {/* Blur */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">Blur</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Slider
                            value={[shadowBlur]}
                            onValueChange={(v) => setShadowBlur(v[0])}
                            max={50}
                            min={0}
                            step={1}
                            className="w-full"
                            rangeClassName="bg-emerald-500"
                            thumbClassName="border-emerald-500"
                          />
                        </div>
                        <Input
                          type="number"
                          value={shadowBlur}
                          onChange={(e) => setShadowBlur(Number(e.target.value))}
                          className="h-7 text-xs w-14"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Style Section - Collapsible */}
          <div>
            <SectionHeader title="Style" section="style" isOpen={openSection === 'style'} />
            {openSection === 'style' && (
              <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedLayout(style.id)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        selectedLayout === style.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-gray-100 rounded mb-1 flex items-center justify-center overflow-hidden">
                        {style.preview === 'single' && (
                          <div className="w-full h-full p-1.5 flex flex-col gap-0.5">
                            <div className="h-1.5 w-1/2 bg-cyan-400 rounded-sm" />
                            <div className="flex-1 space-y-0.5">
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-0.5 w-3/4 bg-gray-300" />
                            </div>
                          </div>
                        )}
                        {style.preview === 'double' && (
                          <div className="w-full h-full p-1.5 flex gap-1">
                            <div className="flex-1 space-y-0.5">
                              <div className="h-1 w-3/4 bg-cyan-400 rounded-sm" />
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-0.5 w-full bg-gray-300" />
                            </div>
                            <div className="flex-1 space-y-0.5 pt-2">
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-0.5 w-full bg-gray-300" />
                            </div>
                          </div>
                        )}
                        {style.preview === 'double-img' && (
                          <div className="w-full h-full p-1.5 flex gap-1">
                            <div className="flex-1 space-y-0.5">
                              <div className="h-1 w-3/4 bg-cyan-400 rounded-sm" />
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-6 w-full bg-gradient-to-br from-green-200 to-green-300 rounded-sm mt-1" />
                            </div>
                            <div className="flex-1 space-y-0.5 pt-2">
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-6 w-full bg-gradient-to-br from-blue-200 to-blue-300 rounded-sm mt-1" />
                            </div>
                          </div>
                        )}
                        {style.preview === 'single-img' && (
                          <div className="w-full h-full p-1.5 flex gap-1">
                            <div className="w-1/3 h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-sm" />
                            <div className="flex-1 space-y-0.5">
                              <div className="h-1 w-3/4 bg-cyan-400 rounded-sm" />
                              <div className="h-0.5 w-full bg-gray-300" />
                              <div className="h-0.5 w-full bg-gray-300" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 leading-tight block text-center">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Border Section - Collapsible */}
          <div>
            <SectionHeader title="Border" section="border" isOpen={openSection === 'border'} />
            {openSection === 'border' && (
              <div className="p-3 space-y-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800 mb-2 block">Type</span>
                    <Select value={borderType} onValueChange={setBorderType}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-border">No Border</SelectItem>
                        <SelectItem value="all">All Sides</SelectItem>
                        <SelectItem value="top-bottom">Top & Bottom</SelectItem>
                        <SelectItem value="left-right">Left & Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 mb-2 block">Style</span>
                    <Select value={borderStyle} onValueChange={setBorderStyle}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800 mb-2 block">Size</span>
                    <Select value={borderSize} onValueChange={setBorderSize}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1px">1px</SelectItem>
                        <SelectItem value="2px">2px</SelectItem>
                        <SelectItem value="3px">3px</SelectItem>
                        <SelectItem value="4px">4px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 mb-2 block">Color</span>
                    <div className="flex items-center gap-1">
                      <button
                        className="w-7 h-7 rounded border border-gray-300"
                        style={{ backgroundColor: borderColor }}
                      />
                      <Input
                        type="text"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="h-7 text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Background Section - Collapsible */}
          <div>
            <SectionHeader title="Background" section="background" isOpen={openSection === 'background'} />
            {openSection === 'background' && (
              <div className="p-3 space-y-3 border-b border-gray-200">
                {/* Color/Pattern/Image Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setBackgroundTab('color')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded border transition-all ${
                      backgroundTab === 'color' 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Color
                  </button>
                  <button
                    onClick={() => setBackgroundTab('pattern')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded border transition-all ${
                      backgroundTab === 'pattern' 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Pattern
                  </button>
                  <button
                    onClick={() => setBackgroundTab('image')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded border transition-all ${
                      backgroundTab === 'image' 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Image
                  </button>
                </div>

                {backgroundTab === 'color' && (
                  <div className="space-y-3">
                    {/* Color Swatches - 2 rows of 8 */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        {/* + button first */}
                        <button className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
                          <Plus className="w-3 h-3" />
                        </button>
                        {PROJECT_COLORS.slice(0, 7).map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleColorSelect(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{
                              backgroundColor: color === 'transparent' ? 'transparent' : color,
                              backgroundImage: color === 'transparent'
                                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)'
                                : 'none',
                              backgroundSize: color === 'transparent' ? '6px 6px' : 'auto',
                              backgroundPosition: color === 'transparent' ? '0 0, 3px 3px' : 'auto',
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {PROJECT_COLORS.slice(7).map((color, idx) => (
                          <button
                            key={idx + 7}
                            onClick={() => handleColorSelect(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{
                              backgroundColor: color === 'transparent' ? 'transparent' : color,
                              backgroundImage: color === 'transparent'
                                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)'
                                : 'none',
                              backgroundSize: color === 'transparent' ? '6px 6px' : 'auto',
                              backgroundPosition: color === 'transparent' ? '0 0, 3px 3px' : 'auto',
                            }}
                          />
                        ))}
                        {/* Additional colors for second row */}
                        {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((color, idx) => (
                          <button
                            key={`extra-${idx}`}
                            onClick={() => handleColorSelect(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* HEX Input */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-800 mb-2 block">HEX</span>
                        <Input
                          type="text"
                          value={hexInput}
                          onChange={(e) => {
                            setHexInput(e.target.value);
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              setBackgroundColor(e.target.value);
                            }
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="w-16">
                        <span className="text-sm font-semibold text-gray-800 mb-2 block">Opacity</span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={bgOpacity}
                            onChange={(e) => setBgOpacity(Number(e.target.value))}
                            min={0}
                            max={100}
                            className="h-7 text-xs w-12"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {backgroundTab === 'pattern' && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => setSelectedPattern(pattern.id)}
                        className="aspect-square"
                      >
                        {renderPatternPreview(pattern.id)}
                      </button>
                    ))}
                  </div>
                )}

                {backgroundTab === 'image' && (
                  <div className="space-y-3">
                    <button className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex flex-col items-center gap-2">
                      <Image className="w-6 h-6" />
                      <span className="text-xs">Click to upload image</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Page Range Modal */}
      <Dialog open={showPageRangeModal} onOpenChange={setShowPageRangeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page Range</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Please edit the page range"
              value={tempPageRange}
              onChange={(e) => setTempPageRange(e.target.value)}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">For example: 1, 3-5, 10</span>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPageRangeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPageRange} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default PageSettingsPanel;
