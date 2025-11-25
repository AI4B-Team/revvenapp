import React, { useState, useRef } from 'react';
import { 
  Wand2, Image as ImageIcon, Type, Crop, Paintbrush, Eraser, 
  Hand, Layers, Trash2, Copy, Download, Save, Undo2, Redo2,
  Mic, Send, Upload, Sparkles, Palette, Sun, Contrast, 
  Sliders, Scissors, Move, ZoomIn, MessageSquare, Settings,
  Star, Folder, Eye, EyeOff, Lock, Unlock, MoreVertical, X
} from 'lucide-react';

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
  const [editHistory, setEditHistory] = useState<ImageData[]>(
    image ? [{ id: Date.now(), url: image, name: 'image', timestamp: new Date().toISOString() }] : []
  );
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(image ? 0 : -1);
  const [savedCreations, setSavedCreations] = useState<ImageData[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Right panel tabs
  const [activeRightTab, setActiveRightTab] = useState<'adjust' | 'filters' | 'effects'>('adjust');
  
  // Adjustment values
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    sharpness: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">REVVEN Edit Canvas</h1>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-2 ml-8">
            <button
              onClick={handleUndo}
              disabled={currentHistoryIndex <= 0}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={currentHistoryIndex >= editHistory.length - 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 ml-4 pl-4 border-l border-border">
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'select' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Select"
            >
              <Hand className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'crop' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('crop')}
              title="Crop"
            >
              <Crop className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'brush' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('brush')}
              title="Brush"
            >
              <Paintbrush className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'eraser' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('eraser')}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'text' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('text')}
              title="Text"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${activeTool === 'wand' ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setActiveTool('wand')}
              title="Magic Wand"
            >
              <Wand2 className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg hover:bg-muted transition-colors`}
              title="Layers"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => selectedImage && saveToCreations(selectedImage)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save to Creations
          </button>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Chat */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/50">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-foreground">AI Assistant</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tell me what you'd like to edit</p>
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-background border-b border-border">
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Change image
              </button>
              <button className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition-colors flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Change colors
              </button>
              <button className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                <Type className="w-4 h-4" />
                Change text
              </button>
              <button className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Change caption
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start a conversation</p>
                <p className="text-xs mt-1">Ask me to edit your image</p>
              </div>
            ) : (
              chatMessages.map((message) => (
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
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center gap-2 p-2 border border-border rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI to edit something..."
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-muted'
                }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="flex-1 flex items-center justify-center p-8">
            {selectedImage ? (
              <div className="relative bg-background rounded-lg shadow-lg max-w-full max-h-full">
                <img
                  src={selectedImage.url}
                  alt="Editing canvas"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start by adding an image
                </h3>
                <p className="text-muted-foreground mb-6">
                  Upload an image or select from your history
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
                    Select from History
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
          <div className="w-80 border-l border-border flex flex-col bg-background">
            {/* Tabs */}
            <div className="flex border-b border-border">
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

      {/* Bottom History Panel */}
      <div className="h-32 border-t border-border bg-background">
        <div className="h-full flex items-center gap-3 px-6 overflow-x-auto">
          <div className="flex items-center gap-2 pr-4 border-r border-border">
            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">Edit History</h3>
          </div>
          
          {editHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No edits yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {editHistory.map((item, index) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditingCanvas;
