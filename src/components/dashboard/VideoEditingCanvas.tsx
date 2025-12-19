import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Image,
  Music,
  Mic,
  Headphones,
  Type,
  ArrowLeftRight,
  Sparkles,
  BarChart3,
  Undo,
  Redo,
  Trash2,
  Scissors,
  CircleDot,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronDown,
  Plus,
  Send,
  Video,
  Upload,
  FolderOpen,
  Volume2,
  VolumeX,
  Wand2,
  MessageSquare,
  X,
  Diamond,
  Layers,
  Copy,
  MoreHorizontal,
  GripVertical,
  Bot,
  User,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Heart,
  Download,
  Search,
  Minus,
  Star,
  Box,
  Scan,
  LayoutGrid,
  ImageIcon,
  AudioLines,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  thumbnail?: string;
  color?: string;
  waveform?: number[];
  caption?: string;
}

interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  clips: TimelineClip[];
  muted?: boolean;
  locked?: boolean;
}

interface Speaker {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VideoEditingCanvasProps {
  video?: string;
  onClose?: () => void;
  onSave?: () => void;
  onTabChange?: (tab: 'image' | 'video' | 'audio') => void;
  activeEditorTab?: 'image' | 'video' | 'audio';
}

// Generate random waveform data
function generateWaveform(points: number): number[] {
  return Array.from({ length: points }, () => Math.random() * 0.8 + 0.2);
}

// Main Video Editor Component
const VideoEditingCanvas: React.FC<VideoEditingCanvasProps> = ({
  video,
  onClose,
  onSave,
  onTabChange,
  activeEditorTab,
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('script');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(78);
  const [zoom, setZoom] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [projectTitle, setProjectTitle] = useState('DIGITAL BABES VSL');
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm LEXI, your AI video assistant. I can help you edit your video, suggest improvements, generate scripts, or answer questions about your project. What would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
  // Script content
  const [scriptContent, setScriptContent] = useState(`I'm going to tell you something shocking. I'm not real. I wasn't born. I don't have a past. I don't even exist, and yet I show up online. I create content. I build influence. I help my creators share ideas, promote products, and grow a brand without them ever needing to step in front of the camera.

Hi, my name is Vicki Revelle and I'm what's called a digital babe. I was created because my creator didn't want to be on camera every day post endless selfies or dance on TikTok, feel pushy or salesy, burnout, chasing trends, or sacrifice their privacy just to be seen. Let's be real. Not everyone wants to be the face of their brand.

Not everyone wants to share their personal life online. Not everyone has the time or energy to create endless content, and yet without a consistent presence, your brand fades away. That's the trap most creators and entrepreneurs fall into, but there's a smarter way forward. That's where Digital Babes come in.`);

  // Speakers (now called Characters)
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: '1', name: 'Vicki Revelle', color: '#10B981', avatar: '' }
  ]);

  // Video settings
  const [videoType, setVideoType] = useState('Img2Vid');
  const [consistency, setConsistency] = useState('AIV Consistent');
  const [aspectRatio, setAspectRatio] = useState('Landscape');
  const [clipDuration, setClipDuration] = useState('5s');
  const [clipCount, setClipCount] = useState(1);
  const [promptText, setPromptText] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Sample visuals for the Visuals tab
  const [visualAssets] = useState([
    { id: '1', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: false },
    { id: '2', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: false },
    { id: '3', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: false },
    { id: '4', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: false },
    { id: '5', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: true },
    { id: '6', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: true },
    { id: '7', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: true },
    { id: '8', name: 'AI Video', thumbnail: '/placeholder.svg', inUse: false },
  ]);

  // Selected tool for the toolbar
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('Automatic Ratio');

  // Timeline tracks with combined audio/text
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'video-1',
      type: 'video',
      name: 'Video 1',
      clips: [
        { id: 'clip-1', type: 'video', name: 'Intro', startTime: 0, duration: 5, thumbnail: '/placeholder.svg' },
        { id: 'clip-2', type: 'video', name: 'Vicki Close-up', startTime: 5, duration: 8, thumbnail: '/placeholder.svg' },
        { id: 'clip-3', type: 'video', name: 'Product Shot', startTime: 13, duration: 6, thumbnail: '/placeholder.svg' },
        { id: 'clip-4', type: 'video', name: 'Testimonial', startTime: 19, duration: 10, thumbnail: '/placeholder.svg' },
        { id: 'clip-5', type: 'video', name: 'Demo Sequence', startTime: 29, duration: 12, thumbnail: '/placeholder.svg' },
        { id: 'clip-6', type: 'video', name: 'CTA Scene', startTime: 41, duration: 8, thumbnail: '/placeholder.svg' },
        { id: 'clip-7', type: 'video', name: 'Brand Outro', startTime: 49, duration: 7, thumbnail: '/placeholder.svg' },
        { id: 'clip-8', type: 'video', name: 'End Card', startTime: 56, duration: 6, thumbnail: '/placeholder.svg' },
      ]
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Audio',
      clips: [
        { id: 'audio-clip-1', type: 'audio', name: 'Intro VO', startTime: 0, duration: 5, waveform: generateWaveform(100), caption: "I'm going to tell you something shocking. I'm not real." },
        { id: 'audio-clip-2', type: 'audio', name: 'Origin', startTime: 5, duration: 8, waveform: generateWaveform(160), caption: "I wasn't born. I don't have a past. I don't even exist, and yet I show up online." },
        { id: 'audio-clip-3', type: 'audio', name: 'Purpose', startTime: 13, duration: 6, waveform: generateWaveform(120), caption: "I create content. I build influence. I help my creators share ideas." },
        { id: 'audio-clip-4', type: 'audio', name: 'Introduction', startTime: 19, duration: 10, waveform: generateWaveform(200), caption: "Hi, my name is Vicki Revelle and I'm what's called a digital babe." },
        { id: 'audio-clip-5', type: 'audio', name: 'Problem', startTime: 29, duration: 12, waveform: generateWaveform(240), caption: "Not everyone wants to be the face of their brand. Not everyone wants to share their personal life online." },
        { id: 'audio-clip-6', type: 'audio', name: 'Solution', startTime: 41, duration: 8, waveform: generateWaveform(160), caption: "That's the trap most creators fall into, but there's a smarter way forward." },
        { id: 'audio-clip-7', type: 'audio', name: 'CTA', startTime: 49, duration: 7, waveform: generateWaveform(140), caption: "That's where Digital Babes come in. Let us be your virtual presence." },
        { id: 'audio-clip-8', type: 'audio', name: 'Outro', startTime: 56, duration: 6, waveform: generateWaveform(120), caption: "Start your journey today. Visit digitalbabes.ai" },
      ]
    }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Playback controls
  const togglePlayback = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, [currentTime]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 5);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, [currentTime, duration]);

  // Handle timeline scrubbing with smooth animation
  const handleTimelineSeek = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, []);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      toast.success('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      toast.success('Redone');
    }
  };

  // Delete selected clip
  const deleteSelectedClip = () => {
    if (selectedClip) {
      setTracks(tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.id !== selectedClip)
      })));
      setSelectedClip(null);
      toast.success('Clip deleted');
    }
  };

  // Cut clip at playhead
  const cutClip = () => {
    if (!selectedClip) return;
    
    setTracks(tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === selectedClip);
      if (clipIndex === -1) return track;
      
      const clip = track.clips[clipIndex];
      const cutPoint = currentTime - clip.startTime;
      
      if (cutPoint <= 0 || cutPoint >= clip.duration) return track;
      
      const newClips = [...track.clips];
      const firstHalf = { ...clip, duration: cutPoint };
      const secondHalf = { 
        ...clip, 
        id: `${clip.id}-split`,
        startTime: clip.startTime + cutPoint,
        duration: clip.duration - cutPoint
      };
      
      newClips.splice(clipIndex, 1, firstHalf, secondHalf);
      return { ...track, clips: newClips };
    }));
    toast.success('Clip split');
  };

  // Handle timeline click with smooth scrubbing
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = Math.min(Math.max(0, percentage * duration * zoom), duration);
    handleTimelineSeek(newTime);
  }, [duration, zoom, handleTimelineSeek]);

  // Handle timeline drag for smooth scrubbing
  const [isDragging, setIsDragging] = useState(false);
  
  const handleTimelineMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineClick(e);
  }, [handleTimelineClick]);

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = Math.min(Math.max(0, percentage * duration * zoom), duration);
    handleTimelineSeek(newTime);
  }, [isDragging, duration, zoom, handleTimelineSeek]);

  const handleTimelineMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle chat submit
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(chatInput),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('cut') || lowerInput.includes('trim')) {
      return "To cut your video, position the playhead where you want to split, select the clip, then click the scissors icon or press 'C'. You can also drag the edges of clips to trim them.";
    }
    if (lowerInput.includes('add') || lowerInput.includes('music') || lowerInput.includes('audio')) {
      return "To add music, click the Music tab in the left panel. You can browse your library, upload new tracks, or use our AI-generated music. Simply drag any audio to the timeline.";
    }
    if (lowerInput.includes('text') || lowerInput.includes('title') || lowerInput.includes('caption')) {
      return "Click the Text tab to add titles, captions, or subtitles. Choose from our templates or create custom text. You can style fonts, colors, and animations in the properties panel.";
    }
    if (lowerInput.includes('export') || lowerInput.includes('render') || lowerInput.includes('download')) {
      return "When you're ready to export, click the Export button in the top right. You can choose resolution (up to 4K), format (MP4, MOV, WebM), and quality settings. Premium users get priority rendering.";
    }
    return "I can help you with video editing, adding effects, generating scripts, or optimizing your content for different platforms. What specific aspect would you like to work on?";
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Tab configuration matching screenshots
  const tabs = [
    { id: 'script', icon: ScrollText, label: 'Script' },
    { id: 'visuals', icon: Image, label: 'Visuals' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'voice', icon: Mic, label: 'Voiceovers' },
    { id: 'sfx', icon: Headphones, label: 'Sound Effects' },
    { id: 'text', icon: Type, label: 'Captions' },
    { id: 'transitions', icon: ArrowLeftRight, label: 'Transitions' },
    { id: 'effects', icon: Sparkles, label: 'Effects' },
    { id: 'analytics', icon: BarChart3, label: 'Procedural Visualizers' }
  ];

  // Render waveform for audio clips
  const renderWaveform = (clip: TimelineClip, width: number) => {
    if (!clip.waveform) return null;
    const barCount = Math.floor(width / 3);
    const step = Math.max(1, Math.floor(clip.waveform.length / barCount));
    
    return (
      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-end justify-evenly px-1">
        {Array.from({ length: barCount }).map((_, i) => {
          const amplitude = clip.waveform?.[i * step] || 0.5;
          return (
            <div
              key={i}
              className="w-0.5 bg-gray-500/60"
              style={{ height: `${amplitude * 100}%` }}
            />
          );
        })}
      </div>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'script':
        return (
          <div className="flex flex-col h-full">
            {/* Project Title */}
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-xl font-bold w-full bg-transparent border-none outline-none mb-4 text-gray-900"
            />

            {/* Characters Section (was Speakers) */}
            <div className="mb-4">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
                Add Character
              </button>
              
              {/* Character Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${speaker.color}20`, color: speaker.color }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: speaker.color }}
                    />
                    {speaker.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Script Content - Full height */}
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="w-full flex-1 min-h-[400px] p-3 bg-gray-50 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-gray-200"
              placeholder="Enter your script here..."
            />
          </div>
        );

      case 'visuals':
      case 'music':
      case 'voice':
      case 'sfx':
      case 'text':
      case 'transitions':
      case 'effects':
      case 'analytics':
        return (
          <>
            {/* Upload and Search Row */}
            <div className="flex items-center gap-2 mb-4">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by description, mode..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                All Assets
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {visualAssets.map((asset) => (
                <div key={asset.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-500" />
                  </div>
                  {asset.inUse && (
                    <div className="absolute top-1 right-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                      In Use
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                    <span className="text-white text-xs">{asset.name}</span>
                  </div>
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1 bg-black/50 rounded hover:bg-black/70">
                      <Heart className="w-3 h-3 text-white" />
                    </button>
                    <button className="p-1 bg-black/50 rounded hover:bg-black/70">
                      <Download className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Type Selector */}
            <div className="border border-gray-200 rounded-lg p-2 mb-4">
              <div className="flex flex-col gap-1">
                {['Video', 'Image', 'Img2Vid', 'Upscale', 'Lip Sync'].map((type) => (
                  <label key={type} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      {videoType === type && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                    <Video className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-white text-gray-900 font-sans overflow-hidden">
        {/* AI Chat Panel - LEFT SIDE */}
        <div className={`${isChatExpanded ? 'w-80' : 'w-12'} bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0`}>
          {isChatExpanded ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground">LEXI</h3>
                    <p className="text-xs text-primary-foreground/80">AI Video Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatExpanded(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-primary' 
                        : 'bg-gray-200'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Ask LEXI anything..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleChatSubmit}
                    className="p-3 bg-primary rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-5 h-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsChatExpanded(true)}
              className="flex-1 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>

        {/* Left Panel - Tab Content */}
        <div className="w-[500px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Tabs with Tooltips */}
          <div className="flex items-center justify-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {activeTab === tab.id && (
                      <span className="text-sm font-medium">{tab.label}</span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Content Area - grows to fill available space */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>

          {/* Compact Prompt Box with Green Border */}
          <div className="p-3 border-t border-gray-200">
            <div className="border-2 border-brand-green rounded-xl p-3 bg-gray-50">
              {/* Video Icon and Textarea */}
              <div className="flex items-start gap-2 mb-3">
                <Video className="w-5 h-5 text-brand-green mt-1 flex-shrink-0" />
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="w-full bg-transparent text-sm focus:outline-none resize-none h-24 placeholder:text-gray-400"
                />
              </div>

              {/* Bottom Toolbar Icons */}
              <div className="flex items-center gap-2">
                {/* Upload Button */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Upload</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuItem className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer">
                      <ImageIcon className="w-4 h-4" />
                      Upload Image
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer">
                      <Video className="w-4 h-4" />
                      Upload Video
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer">
                      <AudioLines className="w-4 h-4" />
                      Upload Audio
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Model Selector */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                          <Box className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Model</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-80 bg-gray-900 border-gray-800 text-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Model</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Auto</span>
                        <div className="w-8 h-4 bg-primary rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3 bg-gray-800 rounded-lg p-1">
                      <button className="flex-1 py-1.5 px-3 bg-gray-700 rounded-md text-sm font-medium">Video</button>
                      <button className="flex-1 py-1.5 px-3 text-gray-400 text-sm">Image</button>
                      <button className="flex-1 py-1.5 px-3 text-gray-400 text-sm">Audio</button>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Each video costs 15-80 credits</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-xs font-bold">H</div>
                        <div className="flex-1">
                          <p className="font-medium">Hailuo 2.3</p>
                          <p className="text-xs text-gray-400">Enhanced quality, smoother</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">768P-1080P</span>
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">6s-10s</span>
                          </div>
                        </div>
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Aspect Ratio Selector */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                          <Scan className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Aspect Ratio</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuItem 
                      className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedRatio('Automatic Ratio')}
                    >
                      <div className="flex items-center gap-3">
                        <Scan className="w-4 h-4" />
                        Automatic Ratio
                      </div>
                      {selectedRatio === 'Automatic Ratio' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedRatio('Landscape')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-3 border border-current rounded-sm" />
                        Landscape
                      </div>
                      {selectedRatio === 'Landscape' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedRatio('Portrait')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-4 border border-current rounded-sm" />
                        Portrait
                      </div>
                      {selectedRatio === 'Portrait' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedRatio('Square')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border border-current rounded-sm" />
                        Square
                      </div>
                      {selectedRatio === 'Square' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Tools Dropdown */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          selectedTool ? 'bg-purple-900/30 text-purple-400' : 'hover:bg-gray-200 text-gray-500'
                        }`}>
                          <LayoutGrid className="w-5 h-5" />
                          {!selectedTool && <span className="text-sm">Tools</span>}
                          {selectedTool && (
                            <>
                              {selectedTool === 'image' && <><ImageIcon className="w-4 h-4" /> Generate Image</>}
                              {selectedTool === 'video' && <><Video className="w-4 h-4" /> Generate Video</>}
                              {selectedTool === 'music' && <><Music className="w-4 h-4" /> Generate Music</>}
                              {selectedTool === 'tts' && <><AudioLines className="w-4 h-4" /> Text to Speech</>}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTool(null); }}
                                className="ml-1 hover:bg-gray-700 rounded p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Tools</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool('image')}
                    >
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      Generate Image
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool('video')}
                    >
                      <Video className="w-4 h-4 text-purple-400" />
                      Generate Video
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool('music')}
                    >
                      <Music className="w-4 h-4 text-purple-400" />
                      Generate Music
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool('tts')}
                    >
                      <AudioLines className="w-4 h-4 text-purple-400" />
                      Text to Speech
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Generate Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-full font-medium hover:opacity-90 transition-opacity text-sm">
                  Generate For Free!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Video Preview & Timeline */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-6 min-h-0">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ maxWidth: '800px', maxHeight: '450px' }}>
              {/* Video Element */}
              <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 relative">
                {video ? (
                  <video
                    ref={videoRef}
                    src={video}
                    className="w-full h-full object-contain"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onDurationChange={(e) => setDuration(e.currentTarget.duration || 78)}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <>
                    {/* Selection Border */}
                    <div className="absolute inset-0 border-4 border-primary rounded-lg pointer-events-none">
                      {/* Corner Handles */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-sm" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-sm" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-sm" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-sm" />
                      {/* Edge Handles */}
                      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-primary rounded-sm -translate-y-1/2" />
                      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-primary rounded-sm -translate-y-1/2" />
                      <div className="absolute -top-2 left-1/2 w-4 h-4 bg-primary rounded-sm -translate-x-1/2" />
                      <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-primary rounded-sm -translate-x-1/2" />
                    </div>
                    
                    {/* Preview Image Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={togglePlayback}
                        className="text-center cursor-pointer group"
                      >
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Play className="w-12 h-12 text-primary-foreground ml-1" />
                        </div>
                        <p className="text-white/70 text-sm">Click to play</p>
                      </button>
                    </div>
                  </>
                )}
                
                {/* Bottom Overlay with speaker name */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-white text-sm font-medium">Vicki Revelle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="bg-white border-t border-gray-200 shrink-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              {/* Left Tools */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={undo}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Undo className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Undo</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={redo}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Redo className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Redo</p></TooltipContent>
                </Tooltip>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={deleteSelectedClip}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Delete</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={cutClip}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Scissors className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Cut</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-primary transition-colors">
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Effects</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                      <Diamond className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Keyframe</p></TooltipContent>
                </Tooltip>
              </div>

              {/* Center - Playback Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={skipBackward}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 flex items-center justify-center bg-brand-green rounded-full hover:opacity-90 transition-opacity text-white shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={skipForward}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <span className="text-sm font-mono text-gray-600 min-w-[100px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right - Zoom & View Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(zoom - 0.5) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="h-64 overflow-hidden flex">
              {/* Track Labels - Dark Background matching sidebar */}
              <div className="w-12 bg-sidebar-background flex flex-col shrink-0">
                {/* Time Ruler Spacer */}
                <div className="h-8 border-b border-gray-800 flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1 hover:bg-gray-800 rounded text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Add Track</p></TooltipContent>
                  </Tooltip>
                </div>
                {/* Track Icons */}
                {tracks.map((track) => (
                  <div key={track.id} className="h-14 flex items-center justify-center border-b border-gray-800">
                    {track.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                    {track.type === 'audio' && <Volume2 className="w-4 h-4 text-gray-400" />}
                    {track.type === 'effect' && <Sparkles className="w-4 h-4 text-gray-400" />}
                    {track.type === 'text' && <Type className="w-4 h-4 text-gray-400" />}
                  </div>
                ))}
              </div>

              {/* Timeline Content */}
              <div className="flex-1 overflow-x-auto">
                {/* Time Ruler */}
                <div
                  ref={timelineRef}
                  onMouseDown={handleTimelineMouseDown}
                  onMouseMove={handleTimelineMouseMove}
                  onMouseUp={handleTimelineMouseUp}
                  onMouseLeave={handleTimelineMouseUp}
                  className="h-8 bg-gray-50 border-b border-gray-200 relative cursor-pointer select-none"
                >
                  {/* Plus and Arrow */}
                  <div className="absolute left-0 top-0 h-full flex items-center gap-1 px-1 z-10">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Playhead Position Marker - with smooth transition */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                    transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1 }}
                  >
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                  </motion.div>
                  
                  {/* Time Markers */}
                  <div className="flex items-end h-full pl-12">
                    {Array.from({ length: Math.ceil(duration / 2) + 1 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 text-xs text-gray-400 border-l border-gray-300 pl-1"
                        style={{ width: `${(2 / duration) * 100}%` }}
                      >
                        0:{(i * 2).toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracks */}
                <div className="overflow-y-auto" style={{ height: 'calc(100% - 32px)' }}>
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center h-14 border-b border-gray-100 hover:bg-gray-50 relative"
                    >
                      {/* Track Content */}
                      <div className="flex-1 h-full relative">
                        {/* Playhead Line - smooth transition */}
                        <motion.div
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                          transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1 }}
                        />
                        
                        {track.clips.map((clip) => (
                          <div
                            key={clip.id}
                            onClick={() => setSelectedClip(clip.id)}
                            className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all overflow-hidden ${
                              selectedClip === clip.id 
                                ? 'ring-2 ring-primary ring-offset-1' 
                                : 'hover:brightness-110'
                            }`}
                            style={{
                              left: `${(clip.startTime / duration) * 100}%`,
                              width: `${(clip.duration / duration) * 100}%`,
                              background: track.type === 'audio' 
                                ? 'rgba(168, 85, 247, 0.3)'
                                : clip.color || '#EAB308',
                            }}
                          >
                            {/* Combined Caption + Waveform for Audio Clips */}
                            {track.type === 'audio' && (
                              <div className="absolute inset-0 flex flex-col">
                                {/* Caption Text */}
                                <div className="px-2 py-1 text-xs text-gray-700 truncate flex-1 flex items-center">
                                  {clip.caption || clip.name}
                                </div>
                                {/* Waveform */}
                                {clip.waveform && renderWaveform(clip, 200)}
                              </div>
                            )}
                            
                            {/* Video clips with thumbnails */}
                            {track.type === 'video' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full flex">
                                  {Array.from({ length: Math.ceil(clip.duration) }).map((_, i) => (
                                    <div key={i} className="h-full aspect-video bg-gray-600 border-r border-gray-500 flex-shrink-0" />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Duration indicator for selected audio */}
                            {track.type === 'audio' && selectedClip === clip.id && (
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                                {clip.duration.toFixed(3)}s
                              </div>
                            )}
                            
                            {/* Resize handles */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 cursor-ew-resize hover:bg-white/60" />
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 cursor-ew-resize hover:bg-white/60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
