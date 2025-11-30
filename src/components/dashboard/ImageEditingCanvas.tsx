import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Paperclip,
  AtSign,
  RotateCcw,
  RotateCw,
  Diamond,
  Plus,
  Minus,
  Share2,
  MessageSquare,
  BarChart3,
  Crop,
  Eraser,
  PaintBucket,
  MousePointer2,
  Type,
  Wand2,
  Settings2,
  HelpCircle,
  Lock,
  X,
  Image,
  Video,
  Music,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Gift,
  Pencil,
  Layers,
  Upload,
} from 'lucide-react';

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

// Number Selector Button
const NumberButton: React.FC<{
  value: number;
  selected: boolean;
  onClick: () => void;
}> = ({ value, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-0 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      selected
        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white'
    }`}
  >
    {value}
  </button>
);

// Dimension Button
const DimensionButton: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
      selected
        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white border border-transparent'
    }`}
  >
    {label}
  </button>
);

// Canvas Tool Button
const CanvasTool: React.FC<{
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, active, onClick }) => (
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
);

const ImageEditingCanvas: React.FC<ImageEditingCanvasProps> = ({ image, onClose, onSave }) => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('select');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(105);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(image);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [messages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'What do you think of this first storyboard frame? Would you like me to make any adjustments before we move on to the second frame?',
      image: selectedImage,
      isRequest: true,
    },
  ]);

  // Sample creations with real placeholder images - first one matches canvas image
  const baseCreations: Creation[] = [
    { id: '2', thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', title: 'Portrait 1' },
    { id: '3', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop', title: 'Portrait 2' },
    { id: '4', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop', title: 'Portrait 3' },
    { id: '5', thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', title: 'Portrait 4' },
    { id: '6', thumbnail: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop', title: 'Portrait 5' },
    { id: '7', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', title: 'Portrait 6' },
    { id: '8', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', title: 'Portrait 7' },
    { id: '9', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', title: 'Portrait 8' },
    { id: '10', thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', title: 'Portrait 9' },
    { id: '11', thumbnail: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=200&h=200&fit=crop', title: 'Portrait 10' },
  ];
  
  // First creation is the current canvas image
  const creations: Creation[] = selectedImage 
    ? [{ id: '1', thumbnail: selectedImage, title: 'Current' }, ...baseCreations]
    : baseCreations;

  const canvasTools = [
    { id: 'select', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'crop', icon: <Crop className="w-4 h-4" /> },
    { id: 'brush', icon: <Eraser className="w-4 h-4" /> },
    { id: 'fill', icon: <PaintBucket className="w-4 h-4" /> },
    { id: 'text', icon: <Type className="w-4 h-4" /> },
    { id: 'magic', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'layers', icon: <Layers className="w-4 h-4" /> },
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
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    navigate('/create');
  };

  return (
    <div className="h-full w-full bg-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Full-width Editor Toolbar */}
      <div className="h-14 bg-[#2d4a54] flex items-center px-4 gap-4 flex-shrink-0">
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
          <button className="p-2 text-slate-300 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-300 hover:text-white transition-colors">
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors">
            <Diamond className="w-4 h-4" />
          </button>
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

        <div className="flex-1" />

        {/* Media Type Tabs */}
        <div className="flex items-center gap-6">
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

        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors">
            DB Ads
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
          <button className="p-2 text-slate-300 hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-300 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-300 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm text-white transition-colors">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Design Agent Panel - Extended width to align with zoom + button */}
        {!isPanelCollapsed && (
          <div className="w-[440px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 relative">
            {/* Collapse Button - Top Right */}
            <button
              onClick={() => setIsPanelCollapsed(true)}
              className="absolute top-3 right-0 translate-x-1/2 z-20 bg-emerald-500 p-1.5 rounded-lg text-white hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700 tracking-wide whitespace-nowrap">DESIGN AGENT: CORA</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Settings2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Wand2 className="w-4 h-4" />
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
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                          <img src={message.image} alt="Design" className="w-full h-auto" />
                          <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded shadow flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Promo Banner */}
            <div className="mx-4 mb-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-700 font-medium">Get 365 days of FREE Nano Banana Pro!</span>
                </div>
                <button className="text-amber-400 hover:text-amber-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <span className="text-sm text-slate-500">Cora is waiting for your response...</span>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder='Start with an idea, or type "@" to mention'
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-24 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <AtSign className="w-4 h-4" />
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
                <div className="flex items-center justify-between mt-3">
                  <button type="button" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                    <span className="font-medium">Nano Banana</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Collapsed State Toggle */}
        {isPanelCollapsed && (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="absolute top-4 left-0 z-10 bg-white border border-slate-200 p-1.5 rounded-r-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}

        {/* Center Area: Canvas + Creations */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* White Canvas Area */}
          <main className="flex-1 bg-white relative overflow-hidden">
            {/* Canvas Content */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative max-w-lg w-full">
                {/* Canvas Tools - Only visible when image is selected */}
                {isImageSelected && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-lg border border-slate-200 z-10">
                    {canvasTools.map((tool) => (
                      <CanvasTool
                        key={tool.id}
                        icon={tool.icon}
                        active={activeTool === tool.id}
                        onClick={() => setActiveTool(tool.id)}
                      />
                    ))}
                  </div>
                )}

                {selectedImage ? (
                  <div 
                    className={`bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer transition-all ${isImageSelected ? 'border-2 border-emerald-500' : 'border border-slate-200'}`}
                    onClick={() => setIsImageSelected(!isImageSelected)}
                  >
                    <img
                      src={selectedImage}
                      alt="Editing"
                      className="w-full h-auto"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                    />
                  </div>
                ) : (
                  <div
                    className="bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl shadow-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <Upload className="w-10 h-10 text-slate-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-600 mb-2">
                        Upload an Image
                      </h2>
                      <p className="text-slate-400">
                        Click here or drag & drop to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Creations Strip */}
          <div className="h-20 bg-white border-t border-slate-200 flex items-center px-4 flex-shrink-0">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm font-semibold text-slate-700">Creations</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center gap-2">
                {creations.map((creation) => (
                  <button
                    key={creation.id}
                    className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-violet-500 transition-all hover:scale-105"
                    onClick={() => setSelectedImage(creation.thumbnail)}
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

        {/* Right Panel - Canvas Mode (Below header now) */}
        <div className="w-[260px] bg-[#1a2e35] overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-5">
            {/* Canvas Mode Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Canvas Mode</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-500/30 rounded-lg">
                  <Sparkles className="w-4 h-4 text-violet-300" />
                </div>
                <span className="text-sm text-slate-200">Inpaint / Outpaint</span>
              </div>
              <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Change
              </button>
            </div>

            {/* Outpaint Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200">Outpaint</span>
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </div>
              <Toggle
                enabled={canvasSettings.outpaint}
                onChange={(enabled) => setCanvasSettings({ ...canvasSettings, outpaint: enabled })}
              />
            </div>

            {/* Inpaint Strength */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200">Inpaint Strength</span>
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </div>
              <Slider
                value={canvasSettings.inpaintStrength}
                onChange={(value) => setCanvasSettings({ ...canvasSettings, inpaintStrength: value })}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            {/* Number of Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">Number of Images</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <NumberButton
                    key={num}
                    value={num}
                    selected={canvasSettings.numberOfImages === num}
                    onClick={() => setCanvasSettings({ ...canvasSettings, numberOfImages: num })}
                  />
                ))}
              </div>
            </div>

            {/* Image Dimensions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200">Image Dimensions</span>
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['512 × 512', '768 × 768', '512 × 1024', '768 × 1024', '1024 × 768', '1024 × 1024'].map((dim) => (
                  <DimensionButton
                    key={dim}
                    label={dim}
                    selected={canvasSettings.dimensions === dim}
                    onClick={() => setCanvasSettings({ ...canvasSettings, dimensions: dim })}
                  />
                ))}
              </div>
            </div>

            {/* Advanced Controls */}
            <div className="space-y-4">
              <span className="text-sm text-slate-200">Advanced Controls</span>

              {/* Aspect Ratio Lock */}
              <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3">
                <button className="p-2 bg-slate-600 rounded-lg text-slate-300 hover:text-white hover:bg-slate-500 transition-all">
                  <Lock className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-sm text-slate-200 font-medium">{canvasSettings.aspectRatio}</span>
                </div>
              </div>

              {/* Width */}
              <div className="flex items-center gap-3">
                <Slider
                  value={canvasSettings.width}
                  onChange={(value) => setCanvasSettings({ ...canvasSettings, width: value })}
                  min={256}
                  max={2048}
                  showValue={false}
                />
                <div className="flex items-center gap-1 bg-slate-700/30 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-slate-400">W</span>
                  <input
                    type="number"
                    value={canvasSettings.width}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, width: Number(e.target.value) })}
                    className="w-10 bg-transparent text-sm text-slate-200 text-right focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-slate-400">px</span>
                </div>
              </div>

              {/* Height */}
              <div className="flex items-center gap-3">
                <Slider
                  value={canvasSettings.height}
                  onChange={(value) => setCanvasSettings({ ...canvasSettings, height: value })}
                  min={256}
                  max={2048}
                  showValue={false}
                />
                <div className="flex items-center gap-1 bg-slate-700/30 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-slate-400">H</span>
                  <input
                    type="number"
                    value={canvasSettings.height}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, height: Number(e.target.value) })}
                    className="w-10 bg-transparent text-sm text-slate-200 text-right focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-slate-400">px</span>
                </div>
              </div>
            </div>

            {/* Render Density */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200">Render Density</span>
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </div>
              <Slider
                value={canvasSettings.renderDensity}
                onChange={(value) => setCanvasSettings({ ...canvasSettings, renderDensity: value })}
                min={0}
                max={100}
              />
            </div>

            {/* Guidance Scale */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200">Guidance Scale</span>
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </div>
              <Slider
                value={canvasSettings.guidanceScale}
                onChange={(value) => setCanvasSettings({ ...canvasSettings, guidanceScale: value })}
                min={1}
                max={20}
              />
            </div>
          </div>

          {/* Floating Chat Button */}
          <button className="fixed bottom-24 right-8 w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-xl shadow-violet-500/30 hover:bg-violet-400 transition-all hover:scale-105 z-50">
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditingCanvas;
