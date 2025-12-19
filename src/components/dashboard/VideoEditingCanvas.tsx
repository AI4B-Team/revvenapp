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
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('visuals');
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
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  
  // Script content
  const [scriptContent, setScriptContent] = useState(`I'm going to tell you something shocking. I'm not real. I wasn't born. I don't have a past. I don't even exist, and yet I show up online. I create content. I build influence. I help my creators share ideas, promote products, and grow a brand without them ever needing to step in front of the camera.

Hi, my name is Vicki Revelle and I'm what's called a digital babe. I was created because my creator didn't want to be on camera every day post endless selfies or dance on TikTok, feel pushy or salesy, burnout, chasing trends, or sacrifice their privacy just to be seen. Let's be real. Not everyone wants to be the face of their brand.

Not everyone wants to share their personal life online. Not everyone has the time or energy to create endless content, and yet without a consistent presence, your brand fades away. That's the trap most creators and entrepreneurs fall into, but there's a smarter way forward. That's where Digital Babes come in.`);

  // Speakers
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: '1', name: 'Vicki Revelle', color: '#10B981', avatar: '' }
  ]);

  // Video settings
  const [videoType, setVideoType] = useState('Video');
  const [consistency, setConsistency] = useState('AIV Consistent');
  const [aspectRatio, setAspectRatio] = useState('Landscape');
  const [clipDuration, setClipDuration] = useState('5s');
  const [clipCount, setClipCount] = useState(1);
  const [promptText, setPromptText] = useState('');

  // Timeline tracks
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'video-1',
      type: 'video',
      name: 'Video 1',
      clips: [
        { id: 'clip-1', type: 'video', name: 'N.', startTime: 0, duration: 5, color: '#EAB308' }
      ]
    },
    {
      id: 'video-2',
      type: 'video',
      name: 'Video 2',
      clips: []
    },
    {
      id: 'effect-1',
      type: 'effect',
      name: 'Effects',
      clips: [
        { id: 'effect-clip-1', type: 'effect', name: 'Gradient', startTime: 15, duration: 8, color: 'linear-gradient(90deg, #10B981, #14B8A6)' }
      ]
    },
    {
      id: 'media-1',
      type: 'video',
      name: 'Media',
      clips: [
        { id: 'media-1', type: 'video', name: 'AIVideo.com', startTime: 0, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-2', type: 'video', name: 'gentle wind...', startTime: 3, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-3', type: 'video', name: 'Li...', startTime: 6, duration: 2, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-4', type: 'video', name: 'Footsteps...', startTime: 8, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-5', type: 'video', name: 'Subt...', startTime: 11, duration: 2, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-6', type: 'video', name: 'L', startTime: 13, duration: 2, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-7', type: 'video', name: 'Uplo...', startTime: 15, duration: 2, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-8', type: 'video', name: 'Upload yo...', startTime: 17, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-9', type: 'video', name: 'Skiing in sno...', startTime: 20, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-10', type: 'video', name: 'Skis slicing t...', startTime: 23, duration: 3, thumbnail: '/api/placeholder/60/40' },
        { id: 'media-11', type: 'video', name: 'Skis slicing t...', startTime: 26, duration: 3, thumbnail: '/api/placeholder/60/40' }
      ]
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Audio',
      clips: [
        { id: 'audio-clip-1', type: 'audio', name: 'Voice Over', startTime: 0, duration: 78, waveform: generateWaveform(200) }
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
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const skipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 5));
  };

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

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration * zoom;
    setCurrentTime(Math.min(Math.max(0, newTime), duration));
  };

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

  // Tab configuration
  const tabs = [
    { id: 'visuals', icon: Image, label: 'Visuals' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'voice', icon: Mic, label: 'Voice' },
    { id: 'sfx', icon: Headphones, label: 'Sound FX' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'transitions', icon: ArrowLeftRight, label: 'Transitions' },
    { id: 'effects', icon: Sparkles, label: 'Effects' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  // Render waveform for audio clips
  const renderWaveform = (clip: TimelineClip, width: number) => {
    if (!clip.waveform) return null;
    const barCount = Math.floor(width / 3);
    const step = Math.max(1, Math.floor(clip.waveform.length / barCount));
    
    return (
      <div className="absolute inset-0 flex items-center justify-evenly px-1">
        {Array.from({ length: barCount }).map((_, i) => {
          const amplitude = clip.waveform?.[i * step] || 0.5;
          return (
            <div
              key={i}
              className="w-0.5 bg-emerald-500/60"
              style={{ height: `${amplitude * 80}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-white text-gray-900 font-sans overflow-hidden">
        {/* AI Chat Panel - LEFT SIDE */}
        <div className={`${isChatExpanded ? 'w-80' : 'w-12'} bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0`}>
          {isChatExpanded ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">LEXI</h3>
                    <p className="text-xs text-white/80">AI Video Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatExpanded(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
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
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                        : 'bg-gray-200'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
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
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleChatSubmit}
                    className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsChatExpanded(true)}
              className="flex-1 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-emerald-500" />
            </button>
          )}
        </div>

        {/* Left Panel - Script Editor */}
        <div className="w-[500px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4" />
                {activeTab === tab.id && (
                  <span className="text-sm font-medium">{tab.label}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Project Title */}
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-xl font-bold w-full bg-transparent border-none outline-none mb-4 text-gray-900"
            />

            {/* Speakers Section */}
            <div className="mb-4">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add speaker
              </button>
              
              {/* Speaker Tags */}
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

            {/* Script Content */}
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="w-full h-64 p-3 bg-gray-50 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200"
              placeholder="Enter your script here..."
            />
          </div>

          {/* Media Upload Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600">
                Drag and drop, <button className="text-emerald-600 hover:text-emerald-700 font-medium">browse my library</button>, or <button className="text-emerald-600 hover:text-emerald-700 font-medium">upload</button>.
              </p>
            </div>
          </div>

          {/* Settings Row */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Video Type */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  <Video className="w-4 h-4" />
                  {videoType}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Consistency */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {consistency}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Aspect Ratio */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  <Maximize className="w-4 h-4" />
                  {aspectRatio}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Duration */}
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  ⏱️ {clipDuration}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Clip Count */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setClipCount(Math.max(1, clipCount - 1))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  -
                </button>
                <span className="text-sm w-6 text-center">{clipCount}</span>
                <button
                  onClick={() => setClipCount(clipCount + 1)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mt-4">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe your video idea... (e.g., 'Sunlight filtering through trees and a gentle stream flowing')"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="text-emerald-600 text-sm mt-2 hover:text-emerald-700 font-medium">
                or surprise me!
              </button>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-between mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Wand2 className="w-5 h-5" />
                Generate
              </button>
              <div className="ml-4 flex items-center gap-1 text-sm text-gray-500">
                <span className="text-lg">✨</span>
                Cost: <span className="font-semibold text-gray-700">30 credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Video Preview & Timeline */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-6 min-h-0">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ maxWidth: '800px', maxHeight: '450px' }}>
              {/* Video Placeholder / Preview */}
              <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 relative">
                {/* Selection Border */}
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-lg pointer-events-none">
                  {/* Corner Handles */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-500 rounded-sm" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-sm" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-500 rounded-sm" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-500 rounded-sm" />
                  {/* Edge Handles */}
                  <div className="absolute top-1/2 -left-2 w-4 h-4 bg-emerald-500 rounded-sm -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-2 w-4 h-4 bg-emerald-500 rounded-sm -translate-y-1/2" />
                  <div className="absolute -top-2 left-1/2 w-4 h-4 bg-emerald-500 rounded-sm -translate-x-1/2" />
                  <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-emerald-500 rounded-sm -translate-x-1/2" />
                </div>
                
                {/* Preview Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white ml-1" />
                    </div>
                    <p className="text-white/70 text-sm">Preview will appear here</p>
                  </div>
                </div>
                
                {/* Bottom Overlay with speaker name */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
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
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:opacity-90 transition-opacity text-white shadow-lg"
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
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
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
            <div className="h-64 overflow-hidden">
              {/* Time Ruler */}
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="h-8 bg-gray-50 border-b border-gray-200 relative cursor-pointer"
              >
                {/* Playhead Position Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500 rounded-sm rotate-45 -mt-1" />
                </div>
                
                {/* Time Markers */}
                <div className="flex items-end h-full px-4">
                  {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 text-xs text-gray-400 border-l border-gray-300 pl-1"
                      style={{ width: `${(5 / duration) * 100}%` }}
                    >
                      {formatTime(i * 5)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracks */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 32px)' }}>
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center h-14 border-b border-gray-100 hover:bg-gray-50"
                  >
                    {/* Track Label */}
                    <div className="w-10 h-full flex items-center justify-center border-r border-gray-200 flex-shrink-0">
                      {track.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                      {track.type === 'audio' && <Volume2 className="w-4 h-4 text-gray-400" />}
                      {track.type === 'effect' && <Sparkles className="w-4 h-4 text-gray-400" />}
                      {track.type === 'text' && <Type className="w-4 h-4 text-gray-400" />}
                    </div>
                    
                    {/* Track Content */}
                    <div className="flex-1 h-full relative px-1">
                      {/* Playhead Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                      
                      {track.clips.map((clip) => (
                        <div
                          key={clip.id}
                          onClick={() => setSelectedClip(clip.id)}
                          className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all overflow-hidden ${
                            selectedClip === clip.id 
                              ? 'ring-2 ring-emerald-500 ring-offset-1' 
                              : 'hover:brightness-110'
                          }`}
                          style={{
                            left: `${(clip.startTime / duration) * 100}%`,
                            width: `${(clip.duration / duration) * 100}%`,
                            background: clip.color || (
                              track.type === 'audio' 
                                ? '#10B98120' 
                                : track.type === 'effect' 
                                  ? 'linear-gradient(90deg, #10B981, #14B8A6)' 
                                  : '#6B7280'
                            ),
                          }}
                        >
                          {/* Clip Content */}
                          {track.type === 'audio' && clip.waveform && renderWaveform(clip, 200)}
                          
                          {clip.thumbnail && (
                            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-white truncate px-1">{clip.name}</span>
                            </div>
                          )}
                          
                          {!clip.thumbnail && track.type !== 'audio' && (
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs text-white truncate font-medium">{clip.name}</span>
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
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
