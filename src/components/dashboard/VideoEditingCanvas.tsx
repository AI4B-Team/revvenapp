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
  UserPlus,
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
import VideoTimeline from './VideoTimeline';
import CaptionsPanel from './editor/CaptionsPanel';
import EffectsPanel from './editor/EffectsPanel';
import TransitionsPanel from './editor/TransitionsPanel';
import ElementsPanel from './editor/ElementsPanel';
import TemplatesPanel from './editor/TemplatesPanel';
import EditorVideoPanel from './editor/EditorVideoPanel';
import EditorImagePanel from './editor/EditorImagePanel';
import EditorAudioPanel from './editor/EditorAudioPanel';
import EditorTextPanel from './editor/EditorTextPanel';
import EditorTranslatePanel from './editor/EditorTranslatePanel';
import RecordModal from './RecordModal';
import ExportDropdown from './editor/ExportDropdown';
import VideoTranslateModal from './editor/VideoTranslateModal';
import AIToolsPanel from './editor/AIToolsPanel';
import ScriptTextEditor from './editor/ScriptTextEditor';
import SettingsPanel from './editor/SettingsPanel';
import LayoutPanel from './editor/LayoutPanel';
import ClipSettingsPanel from './editor/ClipSettingsPanel';

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
  src?: string; // Video/audio source URL
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
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [isFreePlan] = useState(true); // Would come from auth context in production
  const [showDeletedText, setShowDeletedText] = useState(false);
  const [nativeVideoRatio, setNativeVideoRatio] = useState<number>(16/9); // Store the original video aspect ratio
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [currentViewMode, setCurrentViewMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');
  
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
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [videoAspectClass, setVideoAspectClass] = useState('aspect-video');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showClipSettings, setShowClipSettings] = useState(false);
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

  // Find the active video clip based on current playback time
  const activeVideoClip = React.useMemo(() => {
    // Find video tracks and get the clip that's currently playing
    for (const track of tracks) {
      if (track.type === 'video' || track.id.includes('video')) {
        for (const clip of track.clips) {
          if (clip.src && currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
            return clip;
          }
        }
      }
    }
    return null;
  }, [tracks, currentTime]);

  // Get current video source - use active clip's src if available
  const currentVideoSrc = React.useMemo(() => {
    if (activeVideoClip?.src) {
      return activeVideoClip.src;
    }
    return video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }, [activeVideoClip, video]);

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

  // Record toggle - now used to stop recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop all recording streams
      const streams = (window as any).recordingStreams;
      if (streams) {
        streams.forEach((stream: MediaStream) => {
          stream.getTracks().forEach(track => track.stop());
        });
        (window as any).recordingStreams = null;
      }
      setIsRecording(false);
      toast({ title: 'Recording stopped', description: 'Your recording has been saved.' });
    } else {
      // Open modal to select recording type
      setRecordModalOpen(true);
    }
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

  // Visuals sub-tab state
  const [visualsSubTab, setVisualsSubTab] = useState<'videos' | 'images' | 'elements'>('videos');

  // Record modal state
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // Layout state
  const [selectedLayout, setSelectedLayout] = useState<string>('camera');
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);

  // Tab configuration with all requested icons in order
  const tabs = [
    { id: 'script', icon: ScrollText, label: 'Script' },
    { id: 'visuals', icon: Video, label: 'Visuals' },
    { id: 'audio', icon: AudioLines, label: 'Audio' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'translate', icon: FileText, label: 'Translate' },
    { id: 'effects', icon: Sparkles, label: 'Effects' },
    { id: 'captions', icon: Captions, label: 'Captions' },
    { id: 'transitions', icon: ArrowLeftRight, label: 'Transitions' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'tools', icon: Wand2, label: 'Tools' },
    { id: 'settings', icon: Settings, label: 'Settings' },
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

  // Tools tab content - now uses AIToolsPanel
  const renderToolsContent = () => (
    <AIToolsPanel 
      onToolAction={(action, settings) => {
        console.log('Tool action:', action, settings);
        if (action === 'show-deleted') {
          setShowDeletedText(settings?.enabled || false);
        }
      }}
    />
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
            <ScriptTextEditor
              script={scriptContent}
              onScriptChange={setScriptContent}
              showDeleted={showDeletedText}
              onSegmentDelete={(id) => console.log('Delete segment:', id)}
              onSegmentExport={(id, text) => console.log('Export segment:', id, text)}
            />
          </div>
        );

      case 'visuals':
        return (
          <div className="flex flex-col h-full">
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
              {[
                { id: 'videos' as const, label: 'Videos' },
                { id: 'images' as const, label: 'Images' },
                { id: 'elements' as const, label: 'Elements' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVisualsSubTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    visualsSubTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-tab content */}
            {visualsSubTab === 'videos' && <EditorVideoPanel onOpenTranslate={() => setTranslateModalOpen(true)} />}
            {visualsSubTab === 'images' && <EditorImagePanel />}
            {visualsSubTab === 'elements' && <ElementsPanel />}
          </div>
        );

      case 'image':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Image Assets</h3>
              <p className="text-sm text-gray-500 max-w-[280px]">
                Start building your collection by clicking the generate button below, or by uploading a file <span className="text-orange-500 cursor-pointer hover:underline">here</span>
              </p>
            </div>
          </div>
        );

      case 'video':
        return <EditorVideoPanel onOpenTranslate={() => setTranslateModalOpen(true)} />;

      case 'audio':
        return <EditorAudioPanel />;

      case 'text':
        return <EditorTextPanel />;

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
        return <TemplatesPanel />;

      case 'elements':
        return <ElementsPanel />;

      case 'tools':
        return renderToolsContent();

      case 'translate':
        return <EditorTranslatePanel />;

      case 'settings':
        return (
          <SettingsPanel 
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            onSettingChange={(setting, value) => console.log('Setting change:', setting, value)}
          />
        );

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

        {/* Record Modal */}
        <RecordModal
          isOpen={recordModalOpen}
          onClose={() => setRecordModalOpen(false)}
          onSave={(audioBlob, duration) => {
            toast({ title: 'Recording saved', description: `${duration}s recording saved to your project.` });
            setRecordModalOpen(false);
          }}
        />

        {/* Video Translate Modal */}
        <VideoTranslateModal
          open={translateModalOpen}
          onOpenChange={setTranslateModalOpen}
          onTranslate={(settings) => {
            console.log('Translation settings:', settings);
          }}
        />

        {/* Top Editor Menu Bar */}
        <div className="h-14 bg-[#2d4a54] flex items-center px-4 gap-4 flex-shrink-0 border-b border-slate-600 relative">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Editor</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentViewMode === 'editing' ? 'bg-violet-500/30 hover:bg-violet-500/40' :
                  currentViewMode === 'viewing' ? 'bg-blue-500/30 hover:bg-blue-500/40' :
                  currentViewMode === 'commenting' ? 'bg-amber-500/30 hover:bg-amber-500/40' :
                  'bg-green-500/30 hover:bg-green-500/40'
                }`}>
                  {currentViewMode === 'editing' && <Pencil className="w-3.5 h-3.5 text-violet-300" />}
                  {currentViewMode === 'viewing' && <Eye className="w-3.5 h-3.5 text-blue-300" />}
                  {currentViewMode === 'commenting' && <MessageSquare className="w-3.5 h-3.5 text-amber-300" />}
                  {currentViewMode === 'admin' && <Settings className="w-3.5 h-3.5 text-green-300" />}
                  <span className={`text-sm font-medium capitalize ${
                    currentViewMode === 'editing' ? 'text-violet-200' :
                    currentViewMode === 'viewing' ? 'text-blue-200' :
                    currentViewMode === 'commenting' ? 'text-amber-200' :
                    'text-green-200'
                  }`}>{currentViewMode}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${
                    currentViewMode === 'editing' ? 'text-violet-300' :
                    currentViewMode === 'viewing' ? 'text-blue-300' :
                    currentViewMode === 'commenting' ? 'text-amber-300' :
                    'text-green-300'
                  }`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Your Access Level</p>
                </div>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('editing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <Pencil className="w-4 h-4 text-violet-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Editing</span>
                    <span className="text-xs text-gray-500">Full Edit Access</span>
                  </div>
                  {currentViewMode === 'editing' && <Check className="w-4 h-4 ml-auto text-violet-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('viewing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <Eye className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Viewing</span>
                    <span className="text-xs text-gray-500">View Only Access</span>
                  </div>
                  {currentViewMode === 'viewing' && <Check className="w-4 h-4 ml-auto text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('commenting')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Commenting</span>
                    <span className="text-xs text-gray-500">View And Comment</span>
                  </div>
                  {currentViewMode === 'commenting' && <Check className="w-4 h-4 ml-auto text-amber-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('admin')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <Settings className="w-4 h-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-gray-500">Full Control And Settings</span>
                  </div>
                  {currentViewMode === 'admin' && <Check className="w-4 h-4 ml-auto text-green-600" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Editable Project Name + 3-dot menu */}
          <div className="flex items-center gap-2 ml-4 max-w-[320px] flex-shrink-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-slate-700/50 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-400 focus:outline-none focus:border-white min-w-[150px] max-w-[180px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-500 hover:border-white hover:bg-slate-700/50 transition-colors truncate max-w-[180px]"
                title={projectTitle}
              >
                {projectTitle}
              </button>
            )}
            <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-colors flex-shrink-0">
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
            
            {/* Auto-save Cloud Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/20 cursor-default flex-shrink-0">
                  <Cloud className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-300 whitespace-nowrap">
                    Auto Saved {lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Project auto-saved to cloud</p></TooltipContent>
            </Tooltip>
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Share</span>
            </button>
            <ExportDropdown isFreePlan={isFreePlan} />
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
              <div className="h-full bg-white border-r border-gray-200 flex flex-col">
                {/* Tabs with Tooltips */}
                <div className="flex items-center justify-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                  {tabs.map((tab) => (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                            activeTab === tab.id
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <tab.icon className="w-5 h-5" />
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
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50/50">
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
                <div className="p-3 border-t border-gray-200">
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
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Video Preview Panel */}
                <ResizablePanel defaultSize={60} minSize={30}>
                  <div className="h-full flex flex-col bg-gray-100 relative">
                    {/* Video Toolbar - appears when video is selected */}
                    {isVideoSelected && (
                      <div className="flex items-center justify-center gap-1 py-2 px-4 bg-white border-b border-gray-200">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                              <Layers className="w-4 h-4" />
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white">
                            <DropdownMenuItem onClick={() => toast({ title: 'Bring to front' })}>Bring to front</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Send to back' })}>Send to back</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          Position
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <Scan className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                          <Minus className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setZoomLevel(Math.max(10, zoomLevel - 10))} />
                          <span className="text-xs text-gray-600 w-10 text-center">{zoomLevel}%</span>
                          <Plus className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} />
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <Ratio className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <SkipForward className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          Effects
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                          Animation
                        </button>
                        <button 
                          onClick={() => {
                            setShowClipSettings(true);
                            setActiveTab('settings');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {/* Video Preview Area */}
                    <div 
                      ref={playerContainerRef}
                      className="flex-1 flex items-center justify-center p-4 relative"
                      onClick={(e) => {
                        // Deselect video when clicking outside the video container
                        if (e.target === e.currentTarget) {
                          setIsVideoSelected(false);
                          setShowLayoutPanel(false);
                        }
                      }}
                    >
                      {/* Frame container - dynamically scales to fit available space */}
                      <div 
                        className={`relative bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer transition-all ${
                          isVideoSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                        }`}
                        style={{
                          // Dynamic sizing based on aspect ratio - uses max percentage of container
                          maxWidth: selectedRatio === '9:16' ? '40%' : selectedRatio === '1:1' ? '70%' : '90%',
                          maxHeight: '90%',
                          aspectRatio: selectedRatio === '9:16' ? '9/16' : selectedRatio === '1:1' ? '1/1' : selectedRatio === '4:3' ? '4/3' : '16/9',
                          width: '100%',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Don't select if clicking on controls
                          if ((e.target as HTMLElement).closest('button')) return;
                          setIsVideoSelected(true);
                        }}
                      >
                        {/* Video inside the frame - always fully visible with object-contain */}
                        <video
                          ref={videoRef}
                          src={currentVideoSrc}
                          className="max-w-full max-h-full object-contain"
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                          onDurationChange={(e) => setDuration(e.currentTarget.duration || 78)}
                          onEnded={() => setIsPlaying(false)}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          muted={isMuted}
                        />
                    
                    {/* Selection indicator and delete button */}
                    {isVideoSelected && (
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove video from timeline
                                setTracks(prev => prev.filter(t => t.type !== 'video'));
                                setIsVideoSelected(false);
                                toast({ title: 'Video removed', description: 'The video has been removed from the timeline.' });
                              }}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete Video</p></TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    
                    {/* Player Controls Overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      {/* Volume with slider */}
                      <div className="relative">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowVolumeSlider(!showVolumeSlider); }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
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
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <button 
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors flex items-center gap-1"
                              >
                                <Ratio className="w-4 h-4" />
                                <span className="text-xs">{selectedRatio}</span>
                              </button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent><p>Aspect Ratio</p></TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                          {[
                            { label: '16:9', className: 'aspect-video' },
                            { label: '9:16', className: 'aspect-[9/16]' },
                            { label: '1:1', className: 'aspect-square' },
                            { label: '4:3', className: 'aspect-[4/3]' },
                          ].map((r) => (
                            <DropdownMenuItem 
                              key={r.label} 
                              className={`hover:bg-gray-800 cursor-pointer ${selectedRatio === r.label ? 'bg-gray-800' : ''}`}
                              onClick={() => {
                                setSelectedRatio(r.label);
                                setVideoAspectClass(r.className);
                              }}
                            >
                              {r.label} {selectedRatio === r.label && <Check className="w-3 h-3 ml-auto" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
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

                  {/* Layout Toolbar Below Video - Fixed position above timeline */}
                  {isVideoSelected && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 py-2 bg-white border-t border-gray-100 z-40">
                      {/* Layout Selector */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowLayoutPanel(!showLayoutPanel); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span>Layout</span>
                          <span className="text-gray-400 text-xs capitalize">{selectedLayout}</span>
                        </button>
                        
                        {/* Layout Panel Popover */}
                        {showLayoutPanel && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            {/* Header with close button */}
                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Layouts</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowLayoutPanel(false); }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                            <LayoutPanel 
                              selectedLayout={selectedLayout}
                              onLayoutSelect={(id) => {
                                setSelectedLayout(id);
                                setShowLayoutPanel(false);
                              }}
                              hideHeader
                            />
                          </div>
                        )}
                      </div>

                      {/* Background Color */}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-700">Background</span>
                        <input 
                          type="color" 
                          defaultValue="#000000"
                          className="w-5 h-5 rounded border-0 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Layers className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-gray-200 hover:bg-primary/30 data-[resize-handle-active]:bg-primary transition-colors" />

                {/* Timeline Panel - Resizable upward */}
                <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
                  <div className="h-full bg-white border-t border-gray-200 flex flex-col">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
                    {/* Left Tools - CapCut style icons */}
                    <div className="flex items-center gap-1">
                      {/* Undo button styled like reference */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={undo} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-colors shadow-sm"
                          >
                            <Undo className="w-4 h-4" />
                            <span>Undo</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Undo (Ctrl+Z)</p></TooltipContent>
                      </Tooltip>
                      {/* Redo button styled like reference */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={redo} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-colors shadow-sm"
                          >
                            <Redo className="w-4 h-4" />
                            <span>Redo</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Redo (Ctrl+Y)</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200 mx-2" />
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
                            onClick={() => setRecordModalOpen(true)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors text-white shadow-md ${
                              isRecording ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            <CircleDot className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Record</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-6 bg-gray-200" />
                      <button onClick={skipBackward} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={togglePlayback}
                            className="w-12 h-12 flex items-center justify-center bg-brand-green rounded-full hover:opacity-90 transition-opacity text-white shadow-lg"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isPlaying ? 'Pause' : 'Play'} <span className="text-gray-400 ml-1">(Space)</span></p>
                        </TooltipContent>
                      </Tooltip>
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
                          <button 
                            onClick={() => {
                              // Fit timeline to view - calculate zoom to show entire duration
                              setZoom(1);
                              toast({ title: 'Timeline fitted to view' });
                            }}
                            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <Maximize className="w-4 h-4" />
                            <span className="text-sm font-medium">Fit</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Fit Timeline to View</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                    {/* Timeline Content */}
                    <div className="flex-1 overflow-hidden">
                      <VideoTimeline
                        tracks={tracks}
                        setTracks={setTracks}
                        currentTime={currentTime}
                        duration={duration}
                        zoom={zoom}
                        selectedClip={selectedClip}
                        setSelectedClip={setSelectedClip}
                        onTimeSeek={handleTimelineSeek}
                        isDragging={isDragging}
                        setIsDragging={setIsDragging}
                      />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
