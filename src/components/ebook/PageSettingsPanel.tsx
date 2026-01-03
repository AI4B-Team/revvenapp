import { useState, useCallback, useRef } from 'react';
import { X, Link2, ChevronDown, ChevronUp, FileText, Monitor, Share2, Image, LayoutGrid, Sparkles, Plus, Maximize2, Palette, Brush, SlidersHorizontal, Square, CircleDot, Layers, RotateCw, Lock, Unlock, Info, Pipette } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

type SectionType = 'size' | 'style' | 'border' | 'background' | null;

const PageSettingsPanel = ({ pageNumber, onClose, onSettingsChange }: PageSettingsPanelProps) => {
  const [openSection, setOpenSection] = useState<SectionType>(null);
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
  
  // Color picker popover state
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // HSB color picker state
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [alpha, setAlpha] = useState(100);
  
  // Refs for drag handling
  const satBrightRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'satBright' | 'hue' | 'alpha' | null>(null);
  
  // Theme colors for the color picker
  const THEME_COLORS = [
    ['#2563eb', '#1f2937', '#374151', '#ffffff', '#14b8a6', '#0d9488', '#06b6d4', '#22c55e'],
    ['#bfdbfe', '#d1d5db', '#d1d5db', '#e5e7eb', '#99f6e4', '#a7f3d0', '#a5f3fc', '#bbf7d0'],
    ['#93c5fd', '#9ca3af', '#9ca3af', '#d1d5db', '#5eead4', '#6ee7b7', '#67e8f9', '#86efac'],
    ['#60a5fa', '#6b7280', '#6b7280', '#9ca3af', '#2dd4bf', '#34d399', '#22d3ee', '#4ade80'],
    ['#3b82f6', '#4b5563', '#4b5563', '#6b7280', '#14b8a6', '#10b981', '#06b6d4', '#22c55e'],
    ['#2563eb', '#374151', '#374151', '#4b5563', '#0d9488', '#059669', '#0891b2', '#16a34a'],
  ];
  
  const STANDARD_COLORS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#22c55e', '#3b82f6', '#a855f7'];
  const [recentColors, setRecentColors] = useState<string[]>(['#ef4444', '#f97316']);

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

  // Convert HSB to HEX
  const hsbToHex = useCallback((h: number, s: number, b: number): string => {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const bNorm = b / 100;
    
    let r, g, bl;
    const i = Math.floor(hNorm * 6);
    const f = hNorm * 6 - i;
    const p = bNorm * (1 - sNorm);
    const q = bNorm * (1 - f * sNorm);
    const t = bNorm * (1 - (1 - f) * sNorm);
    
    switch (i % 6) {
      case 0: r = bNorm; g = t; bl = p; break;
      case 1: r = q; g = bNorm; bl = p; break;
      case 2: r = p; g = bNorm; bl = t; break;
      case 3: r = p; g = q; bl = bNorm; break;
      case 4: r = t; g = p; bl = bNorm; break;
      case 5: r = bNorm; g = p; bl = q; break;
      default: r = 0; g = 0; bl = 0;
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
  }, []);

  // Convert HEX to HSB
  const hexToHsb = useCallback((hex: string): { h: number; s: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, b: 100 };
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : (d / max) * 100;
    const br = max * 100;
    
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    
    return { h, s, b: br };
  }, []);

  // Get pure hue color
  const getHueColor = useCallback((h: number): string => {
    return hsbToHex(h, 100, 100);
  }, [hsbToHex]);

  // Handle saturation/brightness picker interaction
  const handleSatBrightInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!satBrightRef.current) return;
    const rect = satBrightRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newSat = (x / rect.width) * 100;
    const newBright = 100 - (y / rect.height) * 100;
    
    setSaturation(newSat);
    setBrightness(newBright);
    
    const newColor = hsbToHex(hue, newSat, newBright);
    setBackgroundColor(newColor);
    setHexInput(newColor.toUpperCase());
  }, [hue, hsbToHex]);

  // Handle hue slider interaction
  const handleHueInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newHue = (y / rect.height) * 360;
    setHue(newHue);
    
    const newColor = hsbToHex(newHue, saturation, brightness);
    setBackgroundColor(newColor);
    setHexInput(newColor.toUpperCase());
  }, [saturation, brightness, hsbToHex]);

  // Handle alpha slider interaction
  const handleAlphaInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newAlpha = 100 - (y / rect.height) * 100;
    setAlpha(newAlpha);
    setBgOpacity(Math.round(newAlpha));
  }, []);

  // Mouse down handlers
  const handleSatBrightMouseDown = (e: React.MouseEvent) => {
    isDragging.current = 'satBright';
    handleSatBrightInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current === 'satBright') {
        handleSatBrightInteraction(e);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    isDragging.current = 'hue';
    handleHueInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current === 'hue') {
        handleHueInteraction(e);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    isDragging.current = 'alpha';
    handleAlphaInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current === 'alpha') {
        handleAlphaInteraction(e);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color);
    setHexInput(color.toUpperCase());
    setSelectedGradient(null);
    
    // Update HSB values from hex
    if (color !== 'transparent') {
      const hsb = hexToHsb(color);
      setHue(hsb.h);
      setSaturation(hsb.s);
      setBrightness(hsb.b);
    }
    
    // Add to recent colors if not already there
    if (!recentColors.includes(color) && color !== 'transparent') {
      setRecentColors(prev => [color, ...prev.slice(0, 6)]);
    }
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
      case 'style': return LayoutGrid;
      case 'border': return Square;
      case 'background': return Palette;
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
        <div className="px-3 py-3 bg-gray-50 flex-shrink-0 flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-gray-800">Page Number</label>
          <Input
            type="text"
            value={pageNumber}
            readOnly
            className="h-8 text-sm bg-white w-20"
          />
        </div>
        
        {/* Divider */}
        <div className="border-b border-gray-200" />
        
        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto">

          {/* Size Section - Now Collapsible */}
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
                      <SelectItem value="custom" className="justify-center">Custom</SelectItem>
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
                        {/* + button first - opens color picker popover */}
                        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                          <PopoverTrigger asChild>
                            <button 
                              className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                                showColorPicker 
                                  ? 'border-teal-500 text-teal-500' 
                                  : 'border-gray-300 text-gray-400 hover:border-gray-400'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="left" align="start" className="w-80 p-4">
                            {/* Solid/Gradient Tabs */}
                            <div className="flex gap-1 mb-4">
                              <button
                                onClick={() => setColorType('solid')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded border transition-all ${
                                  colorType === 'solid' 
                                    ? 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                }`}
                              >
                                <Palette className="w-4 h-4" />
                                Solid
                              </button>
                              <button
                                onClick={() => setColorType('gradient')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded border transition-all ${
                                  colorType === 'gradient' 
                                    ? 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                }`}
                              >
                                <Square className="w-4 h-4" />
                                Gradient
                              </button>
                            </div>
                            
                            {colorType === 'solid' && (
                              <>
                                {/* No Fill Option */}
                                <button 
                                  onClick={() => handleColorSelect('transparent')}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded border mb-3 transition-all ${
                                    backgroundColor === 'transparent' 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="w-5 h-5 rounded border border-gray-300 bg-white relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-full h-0.5 bg-red-400 rotate-45" />
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-700">No Fill</span>
                                </button>
                                
                                {/* Theme Colors */}
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium text-gray-700">Theme Colors</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Colors from your design theme</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <button className="text-sm text-teal-500 hover:text-teal-600">Edit</button>
                                  </div>
                                  <div className="space-y-1">
                                    {THEME_COLORS.map((row, rowIdx) => (
                                      <div key={rowIdx} className="flex gap-1">
                                        {row.map((color, colIdx) => (
                                          <button
                                            key={`${rowIdx}-${colIdx}`}
                                            onClick={() => {
                                              handleColorSelect(color);
                                              setShowColorPicker(false);
                                            }}
                                            className={`w-8 h-8 rounded transition-all ${
                                              backgroundColor === color 
                                                ? 'ring-2 ring-blue-500 ring-offset-1' 
                                                : 'hover:scale-110'
                                            }`}
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Standard Colors */}
                                <div className="mb-3">
                                  <div className="flex items-center gap-1 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Standard Colors</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Common colors</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="flex gap-1.5">
                                    {STANDARD_COLORS.map((color, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          handleColorSelect(color);
                                          setShowColorPicker(false);
                                        }}
                                        className={`w-8 h-8 rounded transition-all ${
                                          backgroundColor === color 
                                            ? 'ring-2 ring-blue-500 ring-offset-1' 
                                            : 'hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Recently Used */}
                                {recentColors.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-1 mb-2">
                                      <span className="text-sm font-medium text-gray-700">Recently Used</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Your recently used colors</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="flex gap-1.5">
                                      {recentColors.map((color, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => {
                                            handleColorSelect(color);
                                            setShowColorPicker(false);
                                          }}
                                          className={`w-8 h-8 rounded transition-all ${
                                            backgroundColor === color 
                                              ? 'ring-2 ring-blue-500 ring-offset-1' 
                                              : 'hover:scale-110'
                                          }`}
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Divider */}
                                <div className="border-t border-gray-200 my-3" />
                                
                                {/* Color Gradient Picker with Sliders */}
                                <div className="flex gap-2 mb-3">
                                  {/* Saturation/Brightness Picker */}
                                  <div 
                                    ref={satBrightRef}
                                    className="relative flex-1 h-32 rounded-lg overflow-hidden cursor-crosshair"
                                    onMouseDown={handleSatBrightMouseDown}
                                  >
                                    {/* Base color layer - uses pure hue */}
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        background: getHueColor(hue)
                                      }}
                                    />
                                    {/* White gradient overlay (left to right) */}
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        background: 'linear-gradient(to right, #fff, transparent)'
                                      }}
                                    />
                                    {/* Black gradient overlay (top to bottom) */}
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        background: 'linear-gradient(to bottom, transparent, #000)'
                                      }}
                                    />
                                    {/* Selection circle */}
                                    <div 
                                      className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                                      style={{ 
                                        left: `${saturation}%`, 
                                        top: `${100 - brightness}%`,
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Hue Slider */}
                                  <div 
                                    ref={hueRef}
                                    className="relative w-5 h-32 rounded-full overflow-hidden cursor-pointer"
                                    onMouseDown={handleHueMouseDown}
                                  >
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        background: 'linear-gradient(to bottom, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)'
                                      }}
                                    />
                                    {/* Hue selector */}
                                    <div 
                                      className="absolute left-1/2 w-5 h-3 border-2 border-white rounded-sm shadow-md pointer-events-none"
                                      style={{ 
                                        top: `${(hue / 360) * 100}%`,
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Alpha/Opacity Slider */}
                                  <div 
                                    ref={alphaRef}
                                    className="relative w-5 h-32 rounded-full overflow-hidden cursor-pointer"
                                    onMouseDown={handleAlphaMouseDown}
                                  >
                                    {/* Checkered background for transparency */}
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                        backgroundSize: '6px 6px',
                                        backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                                      }}
                                    />
                                    {/* Color to transparent gradient */}
                                    <div 
                                      className="absolute inset-0"
                                      style={{
                                        background: `linear-gradient(to bottom, ${hsbToHex(hue, saturation, brightness)}, transparent)`
                                      }}
                                    />
                                    {/* Alpha selector */}
                                    <div 
                                      className="absolute left-1/2 w-5 h-3 border-2 border-white rounded-sm shadow-md pointer-events-none"
                                      style={{ 
                                        top: `${100 - alpha}%`,
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                {/* HEX Input Row */}
                                <div className="flex items-center gap-2">
                                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                                    <Pipette className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <Select defaultValue="hex">
                                    <SelectTrigger className="w-20 h-8 text-xs bg-gray-100 border-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hex">HEX</SelectItem>
                                      <SelectItem value="rgb">RGB</SelectItem>
                                      <SelectItem value="hsl">HSL</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="text"
                                    value={hexInput}
                                    onChange={(e) => {
                                      setHexInput(e.target.value);
                                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                        handleColorSelect(e.target.value);
                                      }
                                    }}
                                    className="flex-1 h-8 text-xs bg-gray-100 border-0"
                                  />
                                  <div className="px-3 py-1.5 bg-gray-100 rounded text-sm text-gray-600 min-w-[52px] text-center">
                                    {bgOpacity}%
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {colorType === 'gradient' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-4 gap-2">
                                  {GRADIENTS.map((gradient) => (
                                    <button
                                      key={gradient.id}
                                      onClick={() => {
                                        handleGradientSelect(gradient.id);
                                        setShowColorPicker(false);
                                      }}
                                      className={`w-full aspect-square rounded-lg transition-all ${
                                        selectedGradient === gradient.id 
                                          ? 'ring-2 ring-blue-500 ring-offset-1' 
                                          : 'hover:scale-105'
                                      }`}
                                      style={{
                                        background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
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
                      
                      {/* Recently Used Colors */}
                      {recentColors.length > 0 && (
                        <div className="flex gap-1.5 items-center">
                          <span className="text-xs text-gray-500 whitespace-nowrap">Recent:</span>
                          {recentColors.slice(0, 6).map((color, idx) => (
                            <button
                              key={`recent-main-${idx}`}
                              onClick={() => handleColorSelect(color)}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${
                                backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
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
                              handleColorSelect(e.target.value);
                            }
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="w-20">
                        <span className="text-sm font-semibold text-gray-800 mb-2 block">Opacity</span>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={bgOpacity}
                            onChange={(e) => setBgOpacity(Number(e.target.value))}
                            min={0}
                            max={100}
                            className="h-7 text-xs w-14 pr-6"
                          />
                          <span className="text-xs text-gray-500 -ml-5">%</span>
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
