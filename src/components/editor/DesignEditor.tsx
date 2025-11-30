import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Sparkles,
  Type,
  Palette,
  Upload,
  Wrench,
  FolderOpen,
  Grid3X3,
  Wand2,
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
  Layers,
  ChevronLeft,
  ChevronDown,
  X,
  Image,
  Video,
  Music,
} from 'lucide-react';
import DesignAgentPanel from './DesignAgentPanel';
import CanvasModePanel from './CanvasModePanel';
import { Message, Suggestion, Creation, CanvasSettings, DEFAULT_CANVAS_SETTINGS } from '@/types/editor';

// Sidebar Navigation Item
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 w-full rounded-lg transition-all duration-200 ${
      active
        ? 'bg-white/10 text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
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
        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
  </button>
);

const DesignEditor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageFromState = location.state?.imageUrl;

  const [activeNavItem, setActiveNavItem] = useState('design');
  const [activeTool, setActiveTool] = useState('select');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm Cora, your Design Agent.\nHow can I help you today?",
    },
    {
      id: '2',
      role: 'assistant',
      content: 'What do you think of this first storyboard frame? Would you like me to make any adjustments before we move on to the second frame?',
      image: imageFromState || undefined,
      isRequest: true,
    },
  ]);

  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      title: 'Wine List',
      subtitle: 'Mimic this effect to genera...',
      thumbnail: '',
    },
    {
      id: '2',
      title: 'Coffee Shop Branding',
      subtitle: 'you are a brand design...',
      thumbnail: '',
    },
    {
      id: '3',
      title: 'Story Board',
      subtitle: 'I NEED A STORY BOARD...',
      thumbnail: '',
    },
  ]);

  const [creations] = useState<Creation[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      thumbnail: '',
      title: `Creation ${i + 1}`,
    }))
  );

  const navItems = [
    { id: 'design', icon: <Layout className="w-5 h-5" />, label: 'Design' },
    { id: 'elements', icon: <Sparkles className="w-5 h-5" />, label: 'Elements' },
    { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
    { id: 'brand', icon: <Palette className="w-5 h-5" />, label: 'Brand' },
    { id: 'uploads', icon: <Upload className="w-5 h-5" />, label: 'Uploads' },
    { id: 'tools', icon: <Wrench className="w-5 h-5" />, label: 'Tools' },
    { id: 'projects', icon: <FolderOpen className="w-5 h-5" />, label: 'Projects' },
    { id: 'apps', icon: <Grid3X3 className="w-5 h-5" />, label: 'Apps' },
    { id: 'magic', icon: <Wand2 className="w-5 h-5" />, label: 'Magic Media' },
  ];

  const canvasTools = [
    { id: 'select', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'crop', icon: <Crop className="w-4 h-4" /> },
    { id: 'brush', icon: <Eraser className="w-4 h-4" /> },
    { id: 'fill', icon: <PaintBucket className="w-4 h-4" /> },
    { id: 'text', icon: <Type className="w-4 h-4" /> },
    { id: 'magic', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'layers', icon: <Layers className="w-4 h-4" /> },
  ];

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
              Editor
            </span>
            <div className="flex items-center gap-1 bg-violet-500/20 px-2 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-xs text-violet-300">Editing</span>
              <ChevronDown className="w-3 h-3 text-violet-300" />
            </div>
          </div>
          
          {/* Undo/Redo & Zoom */}
          <div className="flex items-center gap-2 ml-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-teal-400 hover:text-teal-300 transition-colors">
              <Diamond className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm text-slate-300 min-w-[50px] text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Section - Media Type Tabs */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-white font-medium">
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          <span className="text-slate-600">|</span>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
          <span className="text-slate-600">|</span>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Music className="w-4 h-4" />
            <span>Audio</span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors">
            DB Ads
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <nav className="w-16 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col py-2 flex-shrink-0">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeNavItem === item.id}
              onClick={() => setActiveNavItem(item.id)}
            />
          ))}
        </nav>

        {/* Design Agent Panel */}
        <DesignAgentPanel
          messages={messages}
          suggestions={suggestions}
          onSendMessage={handleSendMessage}
          userName="Dolmar"
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />

        {/* Canvas Area */}
        <main className="flex-1 bg-slate-950 relative overflow-hidden">
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800 p-1.5 rounded-r-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isPanelCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Canvas Tools */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl rounded-xl p-1.5 shadow-xl border border-slate-800">
            {canvasTools.map((tool) => (
              <CanvasTool
                key={tool.id}
                icon={tool.icon}
                active={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
              />
            ))}
          </div>

          {/* Canvas Content */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div 
              className="relative max-w-2xl w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl overflow-hidden"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {imageFromState ? (
                <img 
                  src={imageFromState} 
                  alt="Editing" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    DIGITAL BABES
                  </h1>
                  <p className="text-2xl text-slate-300 font-semibold mb-8">
                    Create & Monetize<br />Your AI Twin Or Avatar
                  </p>
                  
                  {/* Placeholder for avatars */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-24 h-32 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg"
                      />
                    ))}
                  </div>
                  
                  <button className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                    GET STARTED FREE
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Canvas Mode Panel */}
        <CanvasModePanel
          settings={canvasSettings}
          onSettingsChange={setCanvasSettings}
        />
      </div>

      {/* Bottom Creations Strip */}
      <div className="h-20 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {creations.map((creation) => (
            <button
              key={creation.id}
              className="w-14 h-14 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all"
            >
              {creation.thumbnail ? (
                <img
                  src={creation.thumbnail}
                  alt={creation.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
