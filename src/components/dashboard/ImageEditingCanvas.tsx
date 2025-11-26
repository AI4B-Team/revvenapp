import React, { useState, useRef } from 'react';
import { 
  Wand2, Image as ImageIcon, Type, Crop, Paintbrush, Eraser, 
  Hand, Layers, Trash2, Copy, Download, Save, Undo2, Redo2,
  Mic, Send, Upload, Sparkles, Palette, Sun, Contrast, 
  Sliders, Scissors, Move, ZoomIn, MessageSquare, Settings,
  Star, Folder, Eye, EyeOff, Lock, Unlock, MoreVertical, X, ZoomOut, Home, User, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReferencesModal from './ReferencesModal';

interface ImageEditingCanvasProps {
  image?: string;
  onClose: () => void;
  onSave: () => void;
}

interface ImageData {
  id: number;
  url: string;
  name: string;
  timestamp: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  sharpness: number;
}

const ImageEditingCanvas: React.FC<ImageEditingCanvasProps> = ({ image, onClose, onSave }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(
    image ? { id: Date.now(), url: image, name: 'image', timestamp: new Date().toISOString() } : null
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Placeholder images for edit history
  const placeholderImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=400&fit=crop&brightness=1.2'
  ];
  
  const [editHistory, setEditHistory] = useState<ImageData[]>(
    image ? [
      { id: Date.now(), url: image, name: 'image', timestamp: new Date().toISOString() },
      ...placeholderImages.map((url, i) => ({
        id: Date.now() + i + 1,
        url,
        name: `edit-${i + 1}`,
        timestamp: new Date().toISOString()
      }))
    ] : []
  );
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(image ? 0 : -1);
  const [savedCreations, setSavedCreations] = useState<ImageData[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Right panel tabs
  const [activeRightTab, setActiveRightTab] = useState<'adjust' | 'filters' | 'effects'>('effects');
  
  // Adjustment values
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    sharpness: 0
  });

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isReferencesModalOpen, setIsReferencesModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ImageData = {
          id: Date.now(),
          url: reader.result as string,
          name: file.name,
          timestamp: new Date().toISOString()
        };
        setSelectedImage(newImage);
        setEditHistory([newImage]);
        setCurrentHistoryIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle images selected from references modal
  const handleImagesSelect = (images: any[]) => {
    if (images.length > 0) {
      const firstImage = images[0];
      const newImage: ImageData = {
        id: Date.now(),
        url: firstImage.image_url || firstImage.preview || firstImage.url,
        name: firstImage.original_filename || firstImage.name || 'Reference Image',
        timestamp: new Date().toISOString()
      };
      setSelectedImage(newImage);
      setEditHistory([newImage]);
      setCurrentHistoryIndex(0);
    }
  };

  // Handle chat message
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        text: chatInput,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: Date.now() + 1,
          text: "I'll help you with that! Processing your request...",
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 500);
    }
  };

  // Handle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Save to creations
  const saveToCreations = (imageData: ImageData) => {
    if (!savedCreations.find(c => c.id === imageData.id)) {
      setSavedCreations([...savedCreations, imageData]);
    }
  };

  // Undo/Redo
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setSelectedImage(editHistory[currentHistoryIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < editHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setSelectedImage(editHistory[currentHistoryIndex + 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Top Toolbar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Edit Canvas</h1>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-2 ml-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleUndo}
                    disabled={currentHistoryIndex <= 0}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Undo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleRedo}
                    disabled={currentHistoryIndex >= editHistory.length - 1}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Redo2 className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Center Quick Action Icons */}
        <div className="flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'select' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('select')}
                >
                  <Hand className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Select</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'crop' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('crop')}
                >
                  <Crop className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Crop</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'brush' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('brush')}
                >
                  <Paintbrush className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Brush</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'eraser' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('eraser')}
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Eraser</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'text' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('text')}
                >
                  <Type className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Add Text</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'wand' ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setActiveTool('wand')}
                >
                  <Wand2 className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Magic Wand</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className={`p-2 rounded-lg hover:bg-muted transition-colors`}>
                  <Layers className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Layers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div></div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Export Image</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => selectedImage && saveToCreations(selectedImage)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save To Creations
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Save To Creations</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content Area - adjusted for Edit History */}
      <div className="flex-1 flex overflow-hidden" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Chat */}
        {!isChatMinimized && (
        <div className="w-96 border-r-2 border-gray-400 flex flex-col bg-muted/50">
          {/* Chat Header - Model Selector with Minimize Button */}
          <div className="p-4 border-b border-border bg-background flex items-center gap-2">
            <Select defaultValue="flux-2">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flux-2">FLUX 2</SelectItem>
                <SelectItem value="nano-banana">Nano Banana</SelectItem>
                <SelectItem value="gpt-image">GPT-4o Image</SelectItem>
                <SelectItem value="flux-pro">Flux Pro</SelectItem>
                <SelectItem value="seedream">Seedream V4</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsChatMinimized(true)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Minimize Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Chat Messages or Cora Profile */}
          <div className="flex-1 overflow-y-auto">
            {chatMessages.length > 0 ? (
              <div className="p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mb-4 flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h4 className="font-semibold text-foreground text-lg mb-1">Cora</h4>
                <p className="text-sm text-muted-foreground mb-6">Designer</p>
                <div className="space-y-2">
                  <p className="text-base font-medium text-foreground">Start A Conversation</p>
                  <p className="text-sm text-muted-foreground">I'll Help Edit Your Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border border-border rounded-full focus-within:border-primary/40 transition-colors">
              <button className="p-1 hover:bg-muted rounded-md transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Cora To Edit Something..."
                className="flex-1 outline-none text-sm bg-transparent placeholder:text-muted-foreground"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleRecording}
                      className={`p-1 rounded-md transition-colors ${
                        isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-muted'
                      }`}
                    >
                      <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white">Voice Input</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-6 w-px bg-border"></div>
              <Select defaultValue="flux-2">
                <SelectTrigger className="w-[120px] border-0 bg-transparent hover:bg-muted focus:ring-0 focus:ring-offset-0 text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux-2">FLUX 2</SelectItem>
                  <SelectItem value="nano-banana">Nano Banana</SelectItem>
                  <SelectItem value="gpt-image">GPT-4o Image</SelectItem>
                  <SelectItem value="flux-pro">Flux Pro</SelectItem>
                  <SelectItem value="seedream">Seedream V4</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <Send className="w-5 h-5 text-white" fill="white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white">Send Message</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        )}

        {/* Minimized Chat Toggle Button */}
        {isChatMinimized && (
          <div className="w-12 border-r-2 border-gray-400 flex items-start justify-center pt-4 bg-muted/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsChatMinimized(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Show Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
          <div 
            className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {selectedImage ? (
              <>
                <div 
                  className="relative cursor-move select-none"
                  style={{
                    transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    maxWidth: '500px',
                    maxHeight: '400px'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={selectedImage.url}
                    alt="Editing canvas"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    draggable={false}
                  />
                </div>
                
                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleZoomIn}
                          className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white">Zoom In</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleZoomOut}
                          className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white">Zoom Out</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleResetView}
                          className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                        >
                          <Home className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white">Reset View</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start By Adding An Image
                </h3>
                <p className="text-muted-foreground mb-6">
                  Upload An Image Or Select From Your History
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </button>
                  <button className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors">
                    Select From History
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Editing Tools */}
        {showRightPanel && (
          <div className="w-80 border-l-2 border-gray-400 flex flex-col bg-background">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveRightTab('effects')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeRightTab === 'effects'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Effects
              </button>
              <button
                onClick={() => setActiveRightTab('adjust')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeRightTab === 'adjust'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Adjust
              </button>
              <button
                onClick={() => setActiveRightTab('filters')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeRightTab === 'filters'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Filters
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeRightTab === 'adjust' && (
                <div className="space-y-6">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Brightness</label>
                      </div>
                      <span className="text-xs text-muted-foreground">{adjustments.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.brightness}
                      onChange={(e) => setAdjustments({...adjustments, brightness: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Contrast className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Contrast</label>
                      </div>
                      <span className="text-xs text-muted-foreground">{adjustments.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.contrast}
                      onChange={(e) => setAdjustments({...adjustments, contrast: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Saturation</label>
                      </div>
                      <span className="text-xs text-muted-foreground">{adjustments.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.saturation}
                      onChange={(e) => setAdjustments({...adjustments, saturation: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Temperature</label>
                      <span className="text-xs text-muted-foreground">{adjustments.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={adjustments.temperature}
                      onChange={(e) => setAdjustments({...adjustments, temperature: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Sharpness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Sharpness</label>
                      <span className="text-xs text-muted-foreground">{adjustments.sharpness}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.sharpness}
                      onChange={(e) => setAdjustments({...adjustments, sharpness: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <button className="w-full px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
                    Reset All
                  </button>
                </div>
              )}

              {activeRightTab === 'filters' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Original', 'Vivid', 'Dramatic', 'B&W', 'Vintage', 'Warm', 'Cool', 'Sepia'].map((filter) => (
                    <button
                      key={filter}
                      className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 hover:ring-2 hover:ring-primary transition-all flex items-center justify-center text-sm font-medium"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}

              {activeRightTab === 'effects' && (
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scissors className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Remove Background</span>
                    </div>
                  </button>
                  <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ZoomIn className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Upscale</span>
                    </div>
                  </button>
                  <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">AI Enhance</span>
                    </div>
                  </button>
                  <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wand2 className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Magic Fill</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Bottom History Panel - Extends full width under chat */}
      <div className="absolute bottom-0 left-0 right-0 h-32 border-t border-border bg-background">
        {/* History Content */}
        <div className="flex items-center gap-3 px-6 h-full overflow-x-auto">
          <div className="flex items-center gap-2 pr-4 border-r border-border">
            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">Edit History</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {/* New Image Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsReferencesModalOpen(true)}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground">New Image</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Add New Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* History thumbnails */}
            {editHistory.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No edits yet</p>
              </div>
            ) : (
              editHistory.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer ${
                    index === currentHistoryIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setCurrentHistoryIndex(index);
                    setSelectedImage(item);
                  }}
                >
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.url}
                      alt={`History ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                      Original
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveToCreations(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-background rounded-lg shadow-lg"
                    >
                      <Star className="w-4 h-4 text-yellow-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* References Modal */}
      <ReferencesModal
        isOpen={isReferencesModalOpen}
        onClose={() => setIsReferencesModalOpen(false)}
        onImagesSelect={handleImagesSelect}
      />
    </div>
  );
};

export default ImageEditingCanvas;
