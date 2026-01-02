import { useState } from 'react';
import { X, Plus, Sparkles, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  { id: 'grad-13', colors: ['#3b82f6', '#2563eb'] },
  { id: 'grad-14', colors: ['#2563eb', '#1d4ed8'] },
  { id: 'grad-15', colors: ['#1e3a8a', '#1e40af'] },
  { id: 'grad-16', colors: ['#0f766e', '#115e59'] },
  { id: 'grad-17', colors: ['#10b981', '#059669'] },
  { id: 'grad-18', colors: ['#22c55e', '#16a34a'] },
  { id: 'grad-19', colors: ['#84cc16', '#65a30d'] },
  { id: 'grad-20', colors: ['#a3e635', '#84cc16'] },
];

const LAYOUT_STYLES = [
  { id: 'single-column', name: 'Single column no image', preview: 'single' },
  { id: 'double-column', name: 'Double column no image', preview: 'double' },
  { id: 'double-column-img', name: 'Double column with image', preview: 'double-img' },
  { id: 'single-column-img', name: 'Single column with image', preview: 'single-img' },
];

const PAGE_FORMATS = [
  { id: 'custom', name: 'Custom', width: 800, height: 1131 },
  { id: 'a4', name: 'A4', width: 595, height: 842 },
  { id: 'letter', name: 'Letter', width: 612, height: 792 },
  { id: 'social', name: 'Social Media', width: 1080, height: 1080 },
  { id: 'presentation', name: 'Presentation', width: 1920, height: 1080 },
];

const PageSettingsPanel = ({ pageNumber, onClose, onSettingsChange }: PageSettingsPanelProps) => {
  const [backgroundTab, setBackgroundTab] = useState<'color' | 'pattern'>('color');
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
  const [opacity, setOpacity] = useState(100);
  
  // Page Size state
  const [pageFormat, setPageFormat] = useState('custom');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageWidth, setPageWidth] = useState(800);
  const [pageHeight, setPageHeight] = useState(1131);
  const [linkDimensions, setLinkDimensions] = useState(false);
  const [resizeContent, setResizeContent] = useState(true);
  
  const handleFormatChange = (formatId: string) => {
    setPageFormat(formatId);
    const format = PAGE_FORMATS.find(f => f.id === formatId);
    if (format && formatId !== 'custom') {
      if (pageOrientation === 'portrait') {
        setPageWidth(format.width);
        setPageHeight(format.height);
      } else {
        setPageWidth(format.height);
        setPageHeight(format.width);
      }
    }
  };
  
  const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
    setPageOrientation(orientation);
    // Swap dimensions
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

  const renderPatternPreview = (patternId: string) => {
    const patternStyles: Record<string, string> = {
      'none': 'bg-white border border-gray-300 relative overflow-hidden',
      'waves': 'bg-white',
      'waves-soft': 'bg-white',
      'diagonal-waves': 'bg-white',
      'scallops': 'bg-white',
      'scallops-soft': 'bg-white',
      'lines': 'bg-white',
      'grid': 'bg-white',
      'bricks': 'bg-white',
      'chevron': 'bg-white',
      'geometric-star': 'bg-white',
      'plus-grid': 'bg-white',
      'dots': 'bg-white',
      'circles': 'bg-white',
      'diamonds': 'bg-white',
      'hexagons': 'bg-white',
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

  return (
    <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="font-semibold text-gray-900 text-sm">Page Settings</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Page Number */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Page Number</label>
          <Input
            type="text"
            value={pageNumber}
            readOnly
            className="h-8 text-sm bg-gray-50"
          />
        </div>
        
        {/* Page Size Section */}
        <div className="border-t border-gray-100 pt-3">
          <label className="text-xs font-semibold text-gray-900 mb-2 block">Page Size</label>
          
          {/* Resize by Format */}
          <div className="mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Resize by Format</span>
            <Select value={pageFormat} onValueChange={handleFormatChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_FORMATS.map((format) => (
                  <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Portrait/Landscape Toggle */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => handleOrientationChange('portrait')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded border transition-all ${
                pageOrientation === 'portrait' 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className={`w-2.5 h-3.5 border rounded-sm ${pageOrientation === 'portrait' ? 'border-white' : 'border-gray-400'}`} />
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
              <div className={`w-3.5 h-2.5 border rounded-sm ${pageOrientation === 'landscape' ? 'border-white' : 'border-gray-400'}`} />
              Landscape
            </button>
          </div>
          
          {/* Custom Size */}
          <div className="mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Custom Size</span>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 mb-0.5 block">Width</span>
                <Input
                  type="number"
                  value={pageWidth}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="h-7 text-xs"
                />
              </div>
              <button 
                onClick={() => setLinkDimensions(!linkDimensions)}
                className={`mt-4 p-1.5 rounded transition-colors ${linkDimensions ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 mb-0.5 block">Height</span>
                <Input
                  type="number"
                  value={pageHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="h-7 text-xs"
                />
              </div>
              <span className="mt-4 text-xs text-gray-500">px</span>
            </div>
          </div>
          
          {/* Others */}
          <div className="mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Others</span>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="resize-content" 
                checked={resizeContent}
                onCheckedChange={(checked) => setResizeContent(checked as boolean)}
              />
              <label htmlFor="resize-content" className="text-xs text-gray-700 cursor-pointer">
                Resize Content
              </label>
            </div>
          </div>
          
          {/* Resize Button */}
          <Button className="w-full h-8 bg-teal-500 hover:bg-teal-600 text-white text-xs">
            Resize this Visual
          </Button>
        </div>

        {/* Style Section */}
        <div className="border-t border-gray-100 pt-3">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Style</label>
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
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-full bg-gray-300" />
                      </div>
                    </div>
                  )}
                  {style.preview === 'double' && (
                    <div className="w-full h-full p-1.5 flex gap-1">
                      <div className="flex-1 space-y-0.5">
                        <div className="h-1 w-3/4 bg-cyan-400 rounded-sm" />
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-2/3 bg-gray-300" />
                      </div>
                      <div className="flex-1 space-y-0.5 pt-2">
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-3/4 bg-gray-300" />
                      </div>
                    </div>
                  )}
                  {style.preview === 'double-img' && (
                    <div className="w-full h-full p-1.5 flex gap-1">
                      <div className="flex-1 space-y-0.5">
                        <div className="h-1 w-3/4 bg-cyan-400 rounded-sm" />
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-0.5 w-full bg-gray-300" />
                        <div className="h-6 w-full bg-gradient-to-br from-green-200 to-green-300 rounded-sm mt-1" />
                      </div>
                      <div className="flex-1 space-y-0.5 pt-2">
                        <div className="h-0.5 w-full bg-gray-300" />
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
                        <div className="h-0.5 w-2/3 bg-gray-300" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-600 leading-tight block text-center">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Section */}
        <div className="border-t border-gray-100 pt-3">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Background</label>
          
          {/* Color/Pattern Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setBackgroundTab('color')}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                backgroundTab === 'color' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setBackgroundTab('pattern')}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                backgroundTab === 'pattern' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pattern
            </button>
          </div>

          {backgroundTab === 'color' && (
            <div className="space-y-3">
              {/* Solid/Gradient Toggle */}
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded">
                <button
                  onClick={() => setColorType('solid')}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                    colorType === 'solid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setColorType('gradient')}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                    colorType === 'gradient' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Gradient
                </button>
              </div>

              {colorType === 'solid' && (
                <>
                  {/* Project Colors */}
                  <div>
                    <span className="text-[10px] text-gray-500 mb-1.5 block">Project Colors</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PROJECT_COLORS.map((color, idx) => (
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
                      <button className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Brand Kit */}
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-fill your brand colors
                  </button>

                  {/* HEX Input */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-500 mb-1 block">HEX</span>
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
                      <span className="text-[10px] text-gray-500 mb-1 block">Opacity</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          min={0}
                          max={100}
                          className="h-7 text-xs w-12"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {colorType === 'gradient' && (
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                  {GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.id}
                      onClick={() => handleGradientSelect(gradient.id)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        selectedGradient === gradient.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {backgroundTab === 'pattern' && (
            <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
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
        </div>

        {/* Border Section */}
        <div className="border-t border-gray-100 pt-3">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Border</label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500 mb-1 block">Type</span>
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
                <span className="text-[10px] text-gray-500 mb-1 block">Style</span>
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
                <span className="text-[10px] text-gray-500 mb-1 block">Size</span>
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
                <span className="text-[10px] text-gray-500 mb-1 block">Color</span>
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
        </div>
      </div>
    </div>
  );
};

export default PageSettingsPanel;
