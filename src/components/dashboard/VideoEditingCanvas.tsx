import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Minimize,
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
  RotateCcw,
  RotateCw,
  Cloud,
  Pencil,
  Shuffle,
  Magnet,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Ratio,
  FileText,
  Captions,
  LayoutTemplate,
  Wrench,
  Shapes,
  Timer,
  Clock,
  Layers2,
  Hash,
  VolumeIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  // State Management
  const [activeTab, setActiveTab] = useState<string>('script');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(78);
  const [zoom, setZoom] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [audioSubTab, setAudioSubTab] = useState<'voices' | 'music' | 'effects'>('voices');
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [selectedAudioClip, setSelectedAudioClip] = useState<string | null>(null);
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
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  
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
  const [selectedPromptTool, setSelectedPromptTool] = useState<'image' | 'video' | 'audio' | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('Automatic Ratio');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // Clip resizing state
  const [resizingClip, setResizingClip] = useState<{ clipId: string; edge: 'left' | 'right'; startX: number; originalStart: number; originalDuration: number } | null>(null);

  // Timeline tracks with combined audio/text
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'image-1',
      type: 'effect' as const,
      name: 'Images',
      clips: [
        { id: 'img-1', type: 'effect', name: 'Brand Logo', startTime: 0, duration: 3, color: '#3B82F6' },
        { id: 'img-2', type: 'effect', name: 'Product Hero', startTime: 8, duration: 5, color: '#3B82F6' },
        { id: 'img-3', type: 'effect', name: 'Lifestyle Shot', startTime: 20, duration: 7, color: '#3B82F6' },
        { id: 'img-4', type: 'effect', name: 'Testimonial BG', startTime: 35, duration: 6, color: '#3B82F6' },
        { id: 'img-5', type: 'effect', name: 'CTA Graphic', startTime: 50, duration: 8, color: '#3B82F6' },
      ]
    },
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
      name: 'Voiceover',
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
    },
    {
      id: 'music-1',
      type: 'text' as const,
      name: 'Music',
      clips: [
        { id: 'music-clip-1', type: 'text', name: 'Ambient Intro', startTime: 0, duration: 15, color: '#10B981' },
        { id: 'music-clip-2', type: 'text', name: 'Upbeat Main', startTime: 15, duration: 25, color: '#10B981' },
        { id: 'music-clip-3', type: 'text', name: 'Emotional Bridge', startTime: 40, duration: 12, color: '#10B981' },
        { id: 'music-clip-4', type: 'text', name: 'Outro Fade', startTime: 52, duration: 10, color: '#10B981' },
      ]
    }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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

  // Spacebar to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback]);

  // Trackpad/wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(3, Math.max(0.25, prev + delta)));
      }
    };
    const container = timelineRef.current?.parentElement;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

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
      toast({ title: 'Undone' });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      toast({ title: 'Redone' });
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
      toast({ title: 'Clip deleted' });
    }
  };

  // Cut/Split clip at playhead
  const splitClip = () => {
    if (!selectedClip) {
      toast({ title: 'Select a clip to split', variant: 'destructive' });
      return;
    }
    
    setTracks(tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === selectedClip);
      if (clipIndex === -1) return track;
      
      const clip = track.clips[clipIndex];
      const cutPoint = currentTime - clip.startTime;
      
      if (cutPoint <= 0 || cutPoint >= clip.duration) {
        toast({ title: 'Playhead must be within the clip', variant: 'destructive' });
        return track;
      }
      
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
    toast({ title: 'Clip split' });
  };

  // Record toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({ title: isRecording ? 'Recording stopped' : 'Recording started' });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Share invitation
  const handleShareInvite = () => {
    if (!shareEmail.trim()) return;
    toast({ title: `Invitation sent to ${shareEmail}` });
    setShareEmail('');
    setShareDialogOpen(false);
  };

  // Generate auto prompt using AI
  const handleAutoPrompt = async () => {
    if (isGeneratingPrompt) return;
    
    setIsGeneratingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt-suggestion', {
        body: { 
          contentType: 'video',
          specificMode: 'Animate'
        }
      });

      if (error) throw error;
      if (data?.suggestion) {
        setPromptText(data.suggestion);
        toast({
          title: "Prompt generated",
          description: "A creative video prompt has been generated for you.",
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Handle timeline click with proper calculation
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const scaledDuration = duration / zoom;
    const percentage = clickX / timelineWidth;
    const newTime = Math.min(Math.max(0, percentage * scaledDuration), duration);
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
    const timelineWidth = rect.width;
    const scaledDuration = duration / zoom;
    const percentage = clickX / timelineWidth;
    const newTime = Math.min(Math.max(0, percentage * scaledDuration), duration);
    handleTimelineSeek(newTime);
  }, [isDragging, duration, zoom, handleTimelineSeek]);

  const handleTimelineMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setResizingClip(null);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingClip && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const deltaX = e.clientX - resizingClip.startX;
        const timePerPixel = duration / rect.width;
        const timeDelta = deltaX * timePerPixel;
        
        setTracks(prev => prev.map(track => ({
          ...track,
          clips: track.clips.map(clip => {
            if (clip.id !== resizingClip.clipId) return clip;
            
            if (resizingClip.edge === 'left') {
              const newStartTime = Math.max(0, resizingClip.originalStart + timeDelta);
              const newDuration = resizingClip.originalDuration - timeDelta;
              if (newDuration < 0.5) return clip;
              return { ...clip, startTime: newStartTime, duration: newDuration };
            } else {
              const newDuration = Math.max(0.5, resizingClip.originalDuration + timeDelta);
              return { ...clip, duration: newDuration };
            }
          })
        })));
      }
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resizingClip, duration]);

  // Handle clip resize start
  const handleClipResizeStart = (e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => {
    e.stopPropagation();
    const clip = tracks.flatMap(t => t.clips).find(c => c.id === clipId);
    if (clip) {
      setResizingClip({
        clipId,
        edge,
        startX: e.clientX,
        originalStart: clip.startTime,
        originalDuration: clip.duration
      });
    }
  };

  // Collaborator avatars
  const collaborators = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop',
  ];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/create');
    }
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

  // Tab configuration with all requested icons in order
  const tabs = [
    { id: 'script', icon: ScrollText, label: 'Script' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'audio', icon: AudioLines, label: 'Audio' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'effects', icon: Sparkles, label: 'Effects' },
    { id: 'captions', icon: Captions, label: 'Captions' },
    { id: 'transitions', icon: ArrowLeftRight, label: 'Transitions' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'tools', icon: Settings, label: 'Tools' },
  ];

  // Sub-menu items for each tab
  const getSubMenuItems = (tabId: string) => {
    switch(tabId) {
      case 'script':
        return [{ icon: Pencil, label: 'Edit', action: () => {} }];
      case 'image':
      case 'video':
      case 'audio':
      case 'templates':
      case 'elements':
      case 'effects':
      case 'tools':
        return [{ icon: Search, label: 'Search', action: () => {} }];
      default:
        return [];
    }
  };

  // Elements tab content
  const renderElementsContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <Shapes className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Elements</h3>
        <p className="text-sm text-gray-500 max-w-[280px]">
          Add shapes, stickers, and graphic elements to your project
        </p>
      </div>
    </div>
  );

  // Tools tab content
  const renderToolsContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Tools</h3>
        <p className="text-sm text-gray-500 max-w-[280px]">
          Access advanced editing tools and utilities
        </p>
      </div>
    </div>
  );

  // Render waveform for audio clips
  const renderWaveform = (clip: TimelineClip, width: number, isSelected: boolean) => {
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
              className={`w-0.5 ${isSelected ? 'bg-purple-400' : 'bg-white/60'}`}
              style={{ height: `${amplitude * 100}%` }}
            />
          );
        })}
      </div>
    );
  };

  // Sample data for different tabs
  const transitionPresets = [
    { id: '1', name: 'Fade', thumbnail: '/placeholder.svg' },
    { id: '2', name: 'Slide', thumbnail: '/placeholder.svg' },
    { id: '3', name: 'Wipe', thumbnail: '/placeholder.svg' },
    { id: '4', name: 'Flip', thumbnail: '/placeholder.svg' },
    { id: '5', name: 'Clock Wipe', thumbnail: '/placeholder.svg' },
    { id: '6', name: 'Pull In', thumbnail: '/placeholder.svg' },
    { id: '7', name: 'Pull Out', thumbnail: '/placeholder.svg' },
    { id: '8', name: 'Light Leak', thumbnail: '/placeholder.svg' },
    { id: '9', name: 'Glitch', thumbnail: '/placeholder.svg' },
    { id: '10', name: 'Glitch 2', thumbnail: '/placeholder.svg' },
    { id: '11', name: 'Explosion', thumbnail: '/placeholder.svg' },
  ];

  const effectPresets = [
    { id: '1', name: 'Audio Dust', thumbnail: '/placeholder.svg' },
    { id: '2', name: 'Audio Glitch', thumbnail: '/placeholder.svg' },
    { id: '3', name: 'Audio Glow', thumbnail: '/placeholder.svg' },
    { id: '4', name: 'Audio Meltdown', thumbnail: '/placeholder.svg' },
    { id: '5', name: 'Audio Mosh', thumbnail: '/placeholder.svg' },
    { id: '6', name: 'Audio RGB', thumbnail: '/placeholder.svg' },
    { id: '7', name: 'Audio Shake', thumbnail: '/placeholder.svg' },
    { id: '8', name: 'Black & White', thumbnail: '/placeholder.svg' },
    { id: '9', name: 'Chroma Key', thumbnail: '/placeholder.svg' },
    { id: '10', name: 'Color Grading', thumbnail: '/placeholder.svg' },
    { id: '11', name: 'Color Strobe', thumbnail: '/placeholder.svg' },
    { id: '12', name: 'Night Vision', thumbnail: '/placeholder.svg' },
  ];

  const captionStylePresets = [
    { id: '1', name: 'Classic', style: 'bg-gray-800' },
    { id: '2', name: 'Yellow Slam', style: 'bg-yellow-500' },
    { id: '3', name: 'Subtle Backdrop', style: 'bg-gray-700' },
    { id: '4', name: 'Neon Glow', style: 'bg-pink-600' },
    { id: '5', name: 'Clean Slide', style: 'bg-gray-900' },
    { id: '6', name: 'Brat', style: 'bg-green-500' },
    { id: '7', name: 'Chaotic Paint', style: 'bg-purple-600' },
    { id: '8', name: 'Elegant Indie', style: 'bg-gray-800' },
  ];

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'script':
        return (
          <div className="flex flex-col h-full">
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="w-full flex-1 min-h-[400px] p-3 bg-gray-50 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-gray-200"
              placeholder="Enter your script here..."
            />
          </div>
        );

      case 'image':
      case 'video':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                {activeTab === 'image' ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No {activeTab === 'image' ? 'Image' : 'Video'} Assets</h3>
              <p className="text-sm text-gray-500 max-w-[280px]">
                Start building your collection by clicking the generate button below, or by uploading a file <span className="text-orange-500 cursor-pointer hover:underline">here</span>
              </p>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col h-full">
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
              {[
                { id: 'voices' as const, label: 'Voices' },
                { id: 'music' as const, label: 'Music' },
                { id: 'effects' as const, label: 'Sound Effects' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAudioSubTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    audioSubTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-colors">
                <Bot className="w-4 h-4" />
                AI Voice
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>

            {/* Sub-tab content */}
            {audioSubTab === 'voices' && (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900">Voice</h4>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <AudioLines className="w-4 h-4" />
                      Voice Cloning
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <Mic className="w-4 h-4" />
                      Voiceover
                    </button>
                  </div>
                </div>
              </div>
            )}

            {audioSubTab === 'music' && (
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Stock Music</h4>
                  <button className="text-sm text-primary hover:underline">View all →</button>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['All', 'Ambient', 'Chill', 'Happy'].map((cat) => (
                    <button key={cat} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      {cat}
                    </button>
                  ))}
                  <button className="px-2 py-1.5 text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Synthwave Memories', duration: '2:56' },
                    { name: 'Lofi Background Vlog Hip Hop', duration: '2:01' },
                    { name: 'Deep House In Cafe', duration: '4:48' },
                    { name: 'King And Queens, New York', duration: '2:56' },
                    { name: 'Are U Ok', duration: '1:29' },
                  ].map((track, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                        <p className="text-xs text-gray-500">{track.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audioSubTab === 'effects' && (
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Sound Effects</h4>
                  <button className="text-sm text-primary hover:underline">View all →</button>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['All', 'Cartoon', 'Clicks', 'Magic'].map((cat) => (
                    <button key={cat} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      {cat}
                    </button>
                  ))}
                  <button className="px-2 py-1.5 text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Large Crowd Medium Ovation', duration: '0:10' },
                    { name: 'Forest Bird Singing', duration: '2:13' },
                    { name: 'Tune Fm Radio', duration: '0:03' },
                    { name: 'Fail Error Mistake Out of Time', duration: '0:02' },
                    { name: 'Mouse Click Computer', duration: '0:00' },
                  ].map((sfx, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sfx.name}</p>
                        <p className="text-xs text-gray-500">{sfx.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Text</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add Text
              </button>
            </div>
          </div>
        );

      case 'captions':
        return (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Captions</h3>
              <div className="flex gap-2 mb-4">
                <button className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-600 rounded-lg text-sm hover:bg-orange-500/30 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Auto Generate
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {captionStylePresets.map((preset) => (
                  <div key={preset.id} className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <div className={`w-full h-full ${preset.style} flex items-center justify-center`}>
                      <span className="text-white text-xs font-medium">{preset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'transitions':
        return (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {transitionPresets.map((preset) => (
                <div key={preset.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 mb-1 hover:ring-2 hover:ring-primary transition-all">
                    <div className="w-full h-full flex items-center justify-center">
                      <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">{preset.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'effects':
        return (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {effectPresets.map((preset) => (
                <div key={preset.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 mb-1 hover:ring-2 hover:ring-primary transition-all">
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white/70" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center truncate">{preset.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Templates</h3>
              <p className="text-sm text-gray-500 max-w-[280px]">
                Browse and apply pre-made templates to your project
              </p>
            </div>
          </div>
        );

      case 'elements':
        return renderElementsContent();

      case 'tools':
        return renderToolsContent();

      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white text-gray-900 font-sans overflow-hidden">
        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Invite Collaborators</DialogTitle>
              <DialogDescription>
                Enter an email address to invite someone to collaborate on this project.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleShareInvite}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Send Invite
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Current collaborators:</p>
              <div className="flex items-center gap-2">
                {collaborators.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Collaborator ${index + 1}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Top Editor Menu Bar */}
        <div className="h-14 bg-[#2d4a54] flex items-center px-4 gap-4 flex-shrink-0 border-b border-slate-600 relative">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Editor</span>
            <div className="flex items-center gap-1.5 bg-violet-500/30 px-3 py-1.5 rounded-lg">
              <Pencil className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-sm font-medium text-violet-200">Editing</span>
              <ChevronDown className="w-3.5 h-3.5 text-violet-300" />
            </div>
          </div>

          {/* Editable Project Name + 3-dot menu */}
          <div className="flex items-center gap-2 ml-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-slate-700/50 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-500 focus:outline-none focus:border-slate-400 min-w-[150px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-white text-sm font-medium hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {projectTitle}
              </button>
            )}
            <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border border-gray-200">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Copy className="w-4 h-4" />
                  Duplicate Project
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <LayoutTemplate className="w-4 h-4" />
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <RotateCcw className="w-4 h-4" />
                  Version History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Centered Media Type Tabs */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button 
              onClick={() => onTabChange?.('image')}
              className={`flex items-center gap-2 font-medium text-sm ${activeEditorTab === 'image' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
            >
              <Image className="w-4 h-4" />
              <span>Image</span>
            </button>
            <span className="text-slate-500">|</span>
            <button 
              onClick={() => onTabChange?.('video')}
              className={`flex items-center gap-2 text-sm ${activeEditorTab === 'video' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            <span className="text-slate-500">|</span>
            <button 
              onClick={() => onTabChange?.('audio')}
              className={`flex items-center gap-2 text-sm ${activeEditorTab === 'audio' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
            >
              <Music className="w-4 h-4" />
              <span>Audio</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center -space-x-2">
              {collaborators.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Collaborator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-[#2d4a54] object-cover"
                />
              ))}
            </div>
            <button 
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm text-white font-medium transition-colors"
            >
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

        {/* Main Content - horizontal layout with resizable panels */}
        <div className="flex flex-1 overflow-hidden">
          {/* AI Chat Panel - LEFT SIDE */}
          <div className={`${isChatExpanded ? 'w-80' : 'w-12'} bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0`}>
            {isChatExpanded ? (
              <>
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
                        message.role === 'assistant' ? 'bg-primary' : 'bg-gray-200'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
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

          {/* Resizable panels for left panel and preview */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left Panel - Tab Content */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <div className="h-full bg-white border-r-2 border-gray-400 flex flex-col">
                {/* Tabs with Tooltips */}
                <div className="flex items-center justify-center gap-1 p-2 border-b-2 border-gray-400 bg-gray-50 flex-wrap">
                  {tabs.map((tab) => (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                            activeTab === tab.id
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {activeTab === tab.id && (
                            <span className="text-xs font-medium">{tab.label}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tab.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Sub-menu section */}
                {getSubMenuItems(activeTab).length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-gray-300 bg-gray-50/50">
                    {getSubMenuItems(activeTab).map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                  <div className="flex-1">
                    {renderTabContent()}
                  </div>
                </div>

                {/* Compact Prompt Box with Green Border */}
                <div className="p-3 border-t-2 border-gray-400">
                  <div className="border-2 border-brand-green rounded-xl p-3 bg-gray-50">
                    <div className="flex items-start gap-2 mb-3">
                      <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Describe what you want to create..."
                        className="w-full bg-transparent text-sm focus:outline-none resize-none h-32 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Bottom Toolbar Icons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {/* Tool selector - always first */}
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <button className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                                selectedPromptTool ? 'bg-green-200 text-green-900' : 'hover:bg-gray-200 text-gray-600'
                              }`}>
                                {!selectedPromptTool && <LayoutGrid className="w-4 h-4" />}
                                {selectedPromptTool === 'image' && <ImageIcon className="w-4 h-4" />}
                                {selectedPromptTool === 'video' && <Video className="w-4 h-4" />}
                                {selectedPromptTool === 'audio' && <AudioLines className="w-4 h-4" />}
                                {selectedPromptTool && (
                                  <>
                                    <span className="text-sm font-medium capitalize">{selectedPromptTool}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setSelectedPromptTool(null); }}
                                      className="ml-1 hover:bg-green-300 rounded p-0.5"
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
                            onClick={() => setSelectedPromptTool('video')}
                          >
                            <Video className="w-4 h-4" />
                            Video
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedPromptTool('audio')}
                          >
                            <AudioLines className="w-4 h-4" />
                            Audio
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-3 hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedPromptTool('image')}
                          >
                            <ImageIcon className="w-4 h-4" />
                            Image
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Context icons appear when tool is selected */}
                      {selectedPromptTool && (
                        <>
                          <div className="w-px h-5 bg-gray-400" />
                          
                          {/* Image tool icons: model, character, reference, ratio, # of images */}
                          {selectedPromptTool === 'image' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Box className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Model</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <User className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Character</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Layers className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Reference</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Scan className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Ratio</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Hash className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p># of Images</p></TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {/* Video tool icons: model, character, reference, ratio, duration */}
                          {selectedPromptTool === 'video' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Box className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Model</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <User className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Character</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Layers className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Reference</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Scan className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Ratio</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Timer className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Duration</p></TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {/* Audio tool icons: model, voice, duration, effects */}
                          {selectedPromptTool === 'audio' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Box className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Model</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Mic className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Voice</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Timer className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Duration</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
                                    <Sparkles className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent><p>Effects</p></TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </>
                      )}

                      <div className="flex-1" />

                      {/* Auto prompt only shows when tool is selected */}
                      {selectedPromptTool && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleAutoPrompt}
                              disabled={isGeneratingPrompt}
                              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors disabled:opacity-50"
                            >
                              <Shuffle className={`w-4 h-4 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Generate Auto Prompt</p></TooltipContent>
                        </Tooltip>
                      )}

                      <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right - Video Preview & Timeline */}
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col bg-gray-100">
                {/* Video Preview Area */}
                <div 
                  ref={playerContainerRef}
                  className="flex-1 flex items-center justify-center p-4 relative"
                >
                  <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl max-w-full max-h-full aspect-video w-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                      className="max-w-full max-h-full object-contain"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onDurationChange={(e) => setDuration(e.currentTarget.duration || 78)}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      muted={isMuted}
                    />
                    
                    {/* Player Controls Overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      {/* Volume with slider */}
                      <div className="relative">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                              className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                            >
                              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Volume</p></TooltipContent>
                        </Tooltip>
                        {showVolumeSlider && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-4 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-xs text-white font-medium">{Math.round(isMuted ? 0 : volume * 100)}%</span>
                              <div className="h-20 flex items-center">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={isMuted ? 0 : volume * 100}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setVolume(val / 100);
                                    setIsMuted(val === 0);
                                    if (videoRef.current) {
                                      videoRef.current.volume = val / 100;
                                      videoRef.current.muted = val === 0;
                                    }
                                  }}
                                  className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer -rotate-90 origin-center accent-brand-green"
                                  style={{ WebkitAppearance: 'none' }}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  setIsMuted(!isMuted);
                                  if (videoRef.current) {
                                    videoRef.current.muted = !isMuted;
                                  }
                                }}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                {isMuted ? 'Unmute' : 'Mute'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors">
                                <Ratio className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                              {['16:9', '9:16', '1:1', '4:3'].map((r) => (
                                <DropdownMenuItem key={r} className="hover:bg-gray-800 cursor-pointer">
                                  {r}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent><p>Aspect Ratio</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={toggleFullscreen}
                            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                          >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Timeline Controls */}
                <div className="bg-white border-t border-gray-200 shrink-0">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                    {/* Left Tools - Text Editing button + CapCut style icons */}
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-lg text-violet-700 font-medium text-sm transition-colors mr-2">
                        <Pencil className="w-4 h-4" />
                        Text Editing
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Undo className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Undo (Ctrl+Z)</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Redo className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Redo (Ctrl+Y)</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={splitClip} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Scissors className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Split (S)</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Copy className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Duplicate (Ctrl+D)</p></TooltipContent>
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
                        <TooltipContent><p>Add Keyframe</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Magnet className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Snap to Grid</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={deleteSelectedClip} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete (Del)</p></TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Center - Playback Controls */}
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={toggleRecording}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors text-white shadow-md ${
                              isRecording ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            <CircleDot className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isRecording ? 'Stop Recording' : 'Start Recording'}</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200" />
                      <button onClick={skipBackward} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button
                        onClick={togglePlayback}
                        className="w-12 h-12 flex items-center justify-center bg-brand-green rounded-full hover:opacity-90 transition-opacity text-white shadow-lg"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <button onClick={skipForward} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-mono text-gray-600 min-w-[100px]">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right - Zoom Slider & View Controls */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <ZoomOut className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom Out</p></TooltipContent>
                      </Tooltip>
                      <Slider
                        value={[zoom]}
                        onValueChange={([val]) => setZoom(val)}
                        min={0.25}
                        max={3}
                        step={0.05}
                        className="w-24"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <ZoomIn className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom In</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200 mx-2" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Maximize className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Fit Timeline</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Timeline - minimum 3 tracks visible with scroll */}
                  <div className="h-[240px] overflow-hidden flex">
                    {/* Track Labels - Dark Background */}
                    <div className="w-14 bg-sidebar-background flex flex-col shrink-0 overflow-y-auto">
                      <div className="h-8 border-b border-gray-800 flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-1.5 hover:bg-gray-800 rounded text-gray-100 hover:text-white transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Add Track</p></TooltipContent>
                        </Tooltip>
                      </div>
                      {tracks.map((track) => (
                        <div key={track.id} className="h-16 flex items-center justify-center border-b border-gray-800">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer">
                                {track.id === 'image-1' && <ImageIcon className="w-5 h-5 text-blue-400" />}
                                {track.id === 'video-1' && <Video className="w-5 h-5 text-red-500" />}
                                {track.id === 'audio-1' && <Volume2 className="w-5 h-5 text-purple-400" />}
                                {track.id === 'music-1' && <Music className="w-5 h-5 text-green-400" />}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent><p>{track.name}</p></TooltipContent>
                          </Tooltip>
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
                        style={{ width: `${100 * zoom}%`, minWidth: '100%' }}
                      >
                        {/* Playhead Position Marker - RED */}
                        <motion.div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                          transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1 }}
                        >
                          <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                        </motion.div>
                        
                        {/* Time Markers */}
                        <div className="flex items-end h-full">
                          {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 text-xs text-gray-500 border-l border-gray-300 pl-2 h-full flex items-center"
                              style={{ width: `${(5 / duration) * 100}%`, minWidth: '60px' }}
                            >
                              {formatTime(i * 5)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tracks */}
                      <div className="overflow-y-auto" style={{ height: 'calc(100% - 32px)', width: `${100 * zoom}%`, minWidth: '100%' }}>
                        {tracks.map((track) => (
                          <div
                            key={track.id}
                            className="flex items-center h-16 border-b border-gray-100 hover:bg-gray-50 relative"
                          >
                            <div className="flex-1 h-full relative">
                              {/* Playhead Line - RED */}
                              <motion.div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                                transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1 }}
                              />
                              
                              {track.clips.map((clip) => {
                                const isAudioSelected = selectedAudioClip === clip.id;
                                return (
                                  <div
                                    key={clip.id}
                                    onClick={() => {
                                      setSelectedClip(clip.id);
                                      if (track.type === 'audio') {
                                        setSelectedAudioClip(clip.id);
                                      }
                                    }}
                                    className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all overflow-hidden ${
                                      selectedClip === clip.id 
                                        ? 'ring-2 ring-primary ring-offset-1' 
                                        : 'hover:brightness-110'
                                    }`}
                                    style={{
                                      left: `${(clip.startTime / duration) * 100}%`,
                                      width: `${(clip.duration / duration) * 100}%`,
                                      background: track.type === 'audio' 
                                        ? (isAudioSelected ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.2)')
                                        : clip.color || '#EAB308',
                                    }}
                                  >
                                    {/* Audio Clips with waveform */}
                                    {track.type === 'audio' && (
                                      <div className="absolute inset-0 flex flex-col">
                                        <div className="px-2 py-1 text-xs text-gray-700 truncate flex-1 flex items-center font-medium">
                                          {clip.caption || clip.name}
                                        </div>
                                        {clip.waveform && renderWaveform(clip, 200, isAudioSelected)}
                                      </div>
                                    )}
                                    
                                    {/* Video clips with thumbnails */}
                                    {track.type === 'video' && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center overflow-hidden">
                                        <div className="w-full h-full flex">
                                          {Array.from({ length: Math.ceil(clip.duration) }).map((_, i) => (
                                            <div key={i} className="h-full aspect-video bg-gray-600 border-r border-gray-500 flex-shrink-0" />
                                          ))}
                                        </div>
                                        <div className="absolute inset-0 flex items-center px-2">
                                          <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Image clips */}
                                    {track.id === 'image-1' && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center px-2 overflow-hidden">
                                        <ImageIcon className="w-3 h-3 text-white/70 mr-1 flex-shrink-0" />
                                        <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                                      </div>
                                    )}

                                    {/* Music clips */}
                                    {track.id === 'music-1' && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 flex items-center px-2 overflow-hidden">
                                        <Music className="w-3 h-3 text-white/70 mr-1 flex-shrink-0" />
                                        <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                                      </div>
                                    )}
                                    
                                    {/* Duration indicator */}
                                    {selectedClip === clip.id && (
                                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                                        {clip.duration.toFixed(1)}s
                                      </div>
                                    )}
                                    
                                    {/* Resize handles */}
                                    <div 
                                      onMouseDown={(e) => handleClipResizeStart(e, clip.id, 'left')}
                                      className="absolute left-0 top-0 bottom-0 w-2 bg-white/30 cursor-ew-resize hover:bg-white/60 active:bg-white/80 transition-colors" 
                                    />
                                    <div 
                                      onMouseDown={(e) => handleClipResizeStart(e, clip.id, 'right')}
                                      className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 cursor-ew-resize hover:bg-white/60 active:bg-white/80 transition-colors" 
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
