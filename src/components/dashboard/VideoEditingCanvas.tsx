import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import mediaPlaceholder from '@/assets/media-placeholder.png';
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
  ChevronUp,
  Plus,
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
  MoreVertical,
  GripVertical,
  User,
  Share2,
  Link2,
  Settings,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  FileText,
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
  Languages,
  Captions,
  LayoutTemplate,
  Wrench,
  Shapes,
  Timer,
  Clock,
  Layers2,
  Hash,
  VolumeIcon,
  Rows3,
  PanelLeftClose,
  PanelLeft,
  Zap,
  Loader2,
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaVimeo } from 'react-icons/fa';
import { SiLoom } from 'react-icons/si';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15); // Short default for better clip visibility
  const [zoom, setZoom] = useState(5); // Higher zoom for more zoomed-in clips by default
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
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [isFreePlan] = useState(true); // Would come from auth context in production
  const [showDeletedText, setShowDeletedText] = useState(false);
  const [isVideoDeleted, setIsVideoDeleted] = useState(false);
  const [nativeVideoRatio, setNativeVideoRatio] = useState<number>(16/9); // Store the original video aspect ratio
  const [selectedUploadedVideoUrl, setSelectedUploadedVideoUrl] = useState<string | null>(null); // Selected uploaded video to play on canvas
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [currentViewMode, setCurrentViewMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
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

  // Uploaded media files for the Visuals tab
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
    type: 'video' | 'audio';
    source: 'upload' | 'url';
  }>>([]);

  // Fetch user videos from database
  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: videos, error } = await supabase
          .from('user_videos')
          .select('id, url, name, duration')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user videos:', error);
          return;
        }

        if (videos && videos.length > 0) {
          const formattedVideos = videos.map(video => ({
            id: video.id,
            name: video.name,
            url: video.url,
            type: 'video' as const,
            source: 'upload' as const,
          }));
          setUploadedMedia(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching user videos:', error);
      }
    };

    fetchUserVideos();
  }, []);

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

  // Timeline tracks - empty by default
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'video-1',
      type: 'video',
      name: 'Video 1',
      clips: []
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Voiceover',
      clips: []
    },
    {
      id: 'music-1',
      type: 'text' as const,
      name: 'Music',
      clips: []
    }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get all video clips sorted by start time
  const sortedVideoClips = React.useMemo(() => {
    const clips: TimelineClip[] = [];
    for (const track of tracks) {
      if (track.type === 'video' || track.id.includes('video')) {
        clips.push(...track.clips.filter(c => c.src));
      }
    }
    return clips.sort((a, b) => a.startTime - b.startTime);
  }, [tracks]);

  // Find the active video clip based on current playback time
  const activeVideoClip = React.useMemo(() => {
    for (const clip of sortedVideoClips) {
      if (currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
        return clip;
      }
    }
    return null;
  }, [sortedVideoClips, currentTime]);

  // Calculate total timeline duration based on ALL clips (for timeline display)
  const timelineDuration = React.useMemo(() => {
    let maxEnd = 0;
    for (const track of tracks) {
      for (const clip of track.clips) {
        maxEnd = Math.max(maxEnd, clip.startTime + clip.duration);
      }
    }
    // If there are clips, add a small buffer (20% or at least 2s)
    // If no clips, use default duration
    if (maxEnd > 0) {
      return maxEnd + Math.max(2, maxEnd * 0.2);
    }
    return duration;
  }, [tracks, duration]);

  // Track the currently loaded clip to detect source changes
  const [loadedClipId, setLoadedClipId] = useState<string | null>(null);

  // Playback controls
  const togglePlayback = useCallback(() => {
    // If no clips on timeline, don't try to play
    if (sortedVideoClips.length === 0) {
      toast({ title: 'No clips on timeline', description: 'Add a video clip to the timeline to play.' });
      return;
    }
    
    // If not in any clip, jump to first clip
    if (!activeVideoClip && !isPlaying) {
      const firstClip = sortedVideoClips[0];
      if (firstClip) {
        setCurrentTime(firstClip.startTime);
      }
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, sortedVideoClips, activeVideoClip, toast]);

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
  }, [currentTime]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(timelineDuration, currentTime + 5);
    setCurrentTime(newTime);
  }, [currentTime, timelineDuration]);

  // Handle timeline scrubbing with smooth animation
  const handleTimelineSeek = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    // Video element will be synced by the effect
  }, []);

  // Get current video source - prioritize selected uploaded video, then active clip's src
  const currentVideoSrc = React.useMemo(() => {
    if (selectedUploadedVideoUrl) {
      return selectedUploadedVideoUrl;
    }
    if (activeVideoClip?.src) {
      return activeVideoClip.src;
    }
    return video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }, [selectedUploadedVideoUrl, activeVideoClip, video]);

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

  // Handle selecting an uploaded video to play on canvas
  const handleSelectUploadedVideo = useCallback((videoUrl: string, _thumbnailUrl: string) => {
    setSelectedUploadedVideoUrl(videoUrl);
    setIsVideoDeleted(false); // Show the video canvas
    toast({ title: 'Video loaded to canvas' });
  }, [toast]);

  // Handle adding a video to the timeline
  const handleAddToTimeline = useCallback((videoUrl: string, name: string, thumbnail?: string, videoDuration?: number) => {
    const clipDuration = videoDuration || 5;
    
    // Find the first video track
    const videoTrackIndex = tracks.findIndex(t => t.type === 'video' || t.id.includes('video'));
    if (videoTrackIndex === -1) return;
    
    // Calculate start time (add at the end of existing clips)
    const existingClips = tracks[videoTrackIndex].clips;
    const lastClipEnd = existingClips.length > 0 
      ? Math.max(...existingClips.map(c => c.startTime + c.duration))
      : 0;
    
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      type: 'video',
      name: name || 'Video',
      startTime: lastClipEnd,
      duration: clipDuration,
      thumbnail: thumbnail || '',
      src: videoUrl,
    };
    
    setTracks(prev => prev.map((track, index) => {
      if (index !== videoTrackIndex) return track;
      return {
        ...track,
        clips: [...track.clips, newClip]
      };
    }));
    
    setIsVideoDeleted(false);
  }, [tracks]);

  // Export function - plays timeline in real-time and records it
  const handleRecordingExport = useCallback(async (): Promise<Blob | null> => {
    if (sortedVideoClips.length === 0) {
      toast({ title: 'No clips to export', description: 'Add clips to the timeline first' });
      return null;
    }

    return new Promise(async (resolve) => {
      try {
        // Get the video container element
        const videoContainer = document.querySelector('.video-export-container') as HTMLElement;
        const videoEl = videoRef.current;
        
        if (!videoEl) {
          toast({ title: 'Export failed', description: 'Video element not found' });
          resolve(null);
          return;
        }

        // Calculate total duration including gaps
        const totalDuration = Math.max(...sortedVideoClips.map(c => c.startTime + c.duration));
        
        // Create a canvas to render frames
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d')!;
        
        // Setup MediaRecorder
        const stream = canvas.captureStream(30);
        
        let mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
        
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 3000000
        });
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };

        // Load all video sources into separate elements
        const videoCache: Map<string, HTMLVideoElement> = new Map();
        
        // Preload all clips
        const loadPromises = sortedVideoClips.map(clip => {
          return new Promise<void>((res) => {
            if (!clip.src) { res(); return; }
            
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.muted = true;
            vid.playsInline = true;
            vid.preload = 'auto';
            vid.src = clip.src;
            
            vid.oncanplaythrough = () => {
              videoCache.set(clip.id, vid);
              res();
            };
            vid.onerror = () => {
              console.error('Failed to load video:', clip.src);
              res();
            };
            vid.load();
          });
        });
        
        await Promise.all(loadPromises);
        
        // Start recording
        recorder.start(100);
        
        toast({ title: 'Recording export...', description: `This will take ~${Math.ceil(totalDuration)}s` });
        
        // Play through timeline in real-time
        let exportTime = 0;
        const startTime = Date.now();
        let lastClipId: string | null = null;
        let currentVideo: HTMLVideoElement | null = null;
        
        const renderLoop = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          exportTime = elapsed;
          
          if (exportTime >= totalDuration) {
            // Finish recording
            setTimeout(() => recorder.stop(), 100);
            return;
          }
          
          // Find active clip
          const activeClip = sortedVideoClips.find(
            c => exportTime >= c.startTime && exportTime < c.startTime + c.duration
          );
          
          // Clear canvas with black
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (activeClip) {
            // Switch video if needed
            if (activeClip.id !== lastClipId) {
              lastClipId = activeClip.id;
              currentVideo = videoCache.get(activeClip.id) || null;
              if (currentVideo) {
                currentVideo.currentTime = 0;
                currentVideo.play().catch(() => {});
              }
            }
            
            // Draw current video frame
            if (currentVideo && currentVideo.readyState >= 2) {
              const vw = currentVideo.videoWidth || 1280;
              const vh = currentVideo.videoHeight || 720;
              const scale = Math.min(canvas.width / vw, canvas.height / vh);
              const w = vw * scale;
              const h = vh * scale;
              const x = (canvas.width - w) / 2;
              const y = (canvas.height - h) / 2;
              
              try {
                ctx.drawImage(currentVideo, x, y, w, h);
              } catch (e) {
                // Draw clip name as fallback
                ctx.fillStyle = '#333';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '32px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(activeClip.name, canvas.width / 2, canvas.height / 2);
              }
            }
          } else {
            // In a gap - pause any playing video
            if (currentVideo) {
              currentVideo.pause();
            }
            lastClipId = null;
            currentVideo = null;
          }
          
          requestAnimationFrame(renderLoop);
        };
        
        renderLoop();
        
      } catch (error) {
        console.error('Export error:', error);
        toast({ title: 'Export failed', description: String(error) });
        resolve(null);
      }
    });
  }, [sortedVideoClips, toast]);

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

  // Handle enhance prompt with AI
  const handleEnhancePrompt = async (isFast: boolean = false) => {
    if (isEnhancing || !promptText.trim()) return;
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { 
          prompt: promptText,
          contentType: selectedPromptTool || 'video',
          enhanceLevel: isFast ? 'fast' : 'deep'
        }
      });

      if (error) throw error;
      if (data?.enhancedPrompt) {
        setPromptText(data.enhancedPrompt);
        toast({
          title: isFast ? "Prompt enhanced" : "Deep enhancement complete",
          description: "Your prompt has been improved with AI.",
        });
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
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

  // Sync video element with timeline playback
  useEffect(() => {
    if (!videoRef.current || !activeVideoClip) return;
    
    // Calculate the clip-relative time (where we should be within the clip's source video)
    const clipRelativeTime = currentTime - activeVideoClip.startTime;
    
    // If clip changed, update the video source and seek
    if (loadedClipId !== activeVideoClip.id) {
      setLoadedClipId(activeVideoClip.id);
      // Video source will update via currentVideoSrc memo
      videoRef.current.currentTime = clipRelativeTime;
    }
  }, [activeVideoClip, currentTime, loadedClipId]);

  // Playback timer - plays continuously including gaps (blank frames)
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;
      
      setCurrentTime(prev => {
        const newTime = prev + delta;
        
        // Stop at the end of timeline
        if (newTime >= timelineDuration) {
          setIsPlaying(false);
          return timelineDuration;
        }
        
        // No skipping - play through gaps as blank frames
        return newTime;
      });
      
      if (isPlaying) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    
    if (isPlaying) {
      animationFrame = requestAnimationFrame(tick);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, timelineDuration]);

  // Control video element playback based on isPlaying and activeVideoClip
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying && activeVideoClip) {
      // Seek to correct position within clip before playing
      const clipRelativeTime = currentTime - activeVideoClip.startTime;
      const videoTime = videoRef.current.currentTime;
      
      // Only seek if we're more than 0.2s off to avoid stuttering
      if (Math.abs(videoTime - clipRelativeTime) > 0.2) {
        videoRef.current.currentTime = clipRelativeTime;
      }
      
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeVideoClip, currentTime]);

  // Visuals sub-tab state
  const [visualsSubTab, setVisualsSubTab] = useState<'videos' | 'images' | 'elements'>('videos');

  // Record modal state
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // Layout state
  const [selectedLayout, setSelectedLayout] = useState<string>('camera');
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);

  // Tab configuration with all requested icons in order
  const tabs = [
    { id: 'script', icon: FileText, label: 'Script' },
    { id: 'character', icon: User, label: 'Character' },
    { id: 'visuals', icon: Video, label: 'Visuals' },
    { id: 'audio', icon: AudioLines, label: 'Audio' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'translate', icon: Languages, label: 'Translate' },
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
        return []; // No sub-menu for script
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

      case 'character':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Characters</h3>
              <p className="text-sm text-gray-500 max-w-[280px]">
                Manage your AI characters and digital personas for your videos
              </p>
            </div>
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
            {visualsSubTab === 'videos' && <EditorVideoPanel onSelectVideo={handleSelectUploadedVideo} onOpenTranslate={() => setTranslateModalOpen(true)} uploadedMedia={uploadedMedia} onAddToTimeline={handleAddToTimeline} />}
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
        return <EditorVideoPanel onSelectVideo={handleSelectUploadedVideo} onOpenTranslate={() => setTranslateModalOpen(true)} uploadedMedia={uploadedMedia} onAddToTimeline={handleAddToTimeline} />;

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

          {/* Centered Media Type Tabs - matches Header nav centering */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-4 lg:gap-8">
              <button 
                onClick={() => onTabChange?.('image')}
                className={`flex items-center gap-2 font-medium text-sm ${activeEditorTab === 'image' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Image className="w-4 h-4" />
                <span>Image</span>
              </button>
              <span className="text-slate-500 hidden lg:inline">|</span>
              <button 
                onClick={() => onTabChange?.('video')}
                className={`flex items-center gap-2 text-sm ${activeEditorTab === 'video' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
              <span className="text-slate-500 hidden lg:inline">|</span>
              <button 
                onClick={() => onTabChange?.('audio')}
                className={`flex items-center gap-2 text-sm ${activeEditorTab === 'audio' ? 'text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                <Music className="w-4 h-4" />
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto flex-shrink-0">
            {/* Collaborators - hide on small screens */}
            <div className="hidden lg:flex items-center -space-x-2">
              {collaborators.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Collaborator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-[#2d4a54] object-cover"
                />
              ))}
            </div>
            {/* Share button - hide text on small screens */}
            <button 
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white font-medium transition-colors border border-gray-500"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </button>
            {/* Export button - always visible */}
            <ExportDropdown 
              isFreePlan={isFreePlan} 
              videoSrc={currentVideoSrc} 
              projectTitle={projectTitle}
              hasMultipleClips={sortedVideoClips.length > 1}
              onStartRecordingExport={handleRecordingExport}
              allClips={sortedVideoClips.map(c => ({ 
                id: c.id, 
                name: c.name, 
                src: c.src || '',
                startTime: c.startTime,
                duration: c.duration
              })).filter(c => c.src)}
            />
            <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200">
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
        </div>

        {/* Main Content - horizontal layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Panel - Tab Content (collapsible) */}
          {!isLeftPanelCollapsed && (
            <div className="w-[560px] h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
              {/* Tabs with Tooltips */}
              <div className="flex items-center justify-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-nowrap">
                {tabs.map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 px-3'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {activeTab === tab.id && (
                          <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
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
                  {/* Top left icons when image tool is selected */}
                  {selectedPromptTool === 'image' && (
                    <div className="flex flex-col gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ImageIcon className="w-4 h-4 text-blue-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent><p>Image To Prompt</p></TooltipContent>
                        </Tooltip>
                        <span className="text-sm text-gray-400">Describe what you want to create...</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Shuffle className="w-4 h-4 text-brand-green cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent><p>Auto Prompt</p></TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  {selectedPromptTool === 'video' && (
                    <div className="flex flex-col gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Video className="w-4 h-4 text-red-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent><p>Video-To-Video</p></TooltipContent>
                        </Tooltip>
                        <span className="text-sm text-gray-400">Describe what you want to create...</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Shuffle className="w-4 h-4 text-brand-green cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent><p>Auto Prompt</p></TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  <div className="flex items-start gap-2 mb-3">
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder={selectedPromptTool === 'image' || selectedPromptTool === 'video' ? '' : 'Describe what you want to create...'}
                      className="w-full bg-transparent text-sm focus:outline-none resize-none h-32 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Bottom Toolbar Icons */}
                  <div className="flex items-center gap-1.5 pt-2 flex-nowrap min-w-0">
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

                    {/* AI Enhance Dropdown */}
                    <Popover>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button 
                              disabled={isEnhancing || !promptText.trim()}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-1.5 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            >
                              {isEnhancing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              AI
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Enhance Prompt</p>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent className="w-56 bg-white border-gray-200 z-50">
                        <div className="space-y-1">
                          <button 
                            onClick={() => handleEnhancePrompt(true)}
                            disabled={isEnhancing || !promptText.trim()}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <div>
                                <div className="font-medium">Fast Enhance</div>
                                <div className="text-xs text-gray-500">Quick improvement</div>
                              </div>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleEnhancePrompt(false)}
                            disabled={isEnhancing || !promptText.trim()}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              <div>
                                <div className="font-medium">Deep Enhance</div>
                                <div className="text-xs text-gray-500">Detailed refinement</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapse/Expand Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-12 bg-gray-200 hover:bg-gray-300 rounded-r-md border border-l-0 border-gray-300 transition-colors"
                style={{ left: isLeftPanelCollapsed ? 0 : 560 }}
              >
                {isLeftPanelCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isLeftPanelCollapsed ? 'Show' : 'Hide'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Right - Video Preview & Timeline */}
          <div className="flex-1 h-full relative overflow-hidden flex flex-col">
            <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0">

                {/* Video Preview Panel - larger by default so timeline shows ~2 tracks initially */}
                <ResizablePanel defaultSize={isTimelineMinimized ? 85 : 65} minSize={35}>
                  <div className="h-full flex flex-col bg-gray-100 relative overflow-hidden">
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
                      className="flex-1 min-h-0 flex items-center justify-center p-4 relative overflow-hidden"
                      onClick={(e) => {
                        // Deselect video when clicking outside the video container
                        if (e.target === e.currentTarget) {
                          setIsVideoSelected(false);
                          setShowLayoutPanel(false);
                        }
                      }}
                    >
                      {/* Show canvas placeholder when video is deleted, otherwise show video */}
                      {isVideoDeleted ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8">
                          {/* Three people image */}
                          <img 
                            src={mediaPlaceholder} 
                            alt="Add media placeholder" 
                            className="w-64 h-auto mb-6 object-contain"
                          />
                          {/* Text */}
                          <p className="text-lg text-gray-600 font-medium text-center">
                            Add Media To The Timeline To Start Creating
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Frame container - dynamically scales to fit available space */}
                          <div 
                            className={`relative bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer transition-all ${
                              isVideoSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                            }`}
                            style={{
                              // Dynamic sizing based on aspect ratio - uses max percentage of container
                              maxWidth: selectedRatio === '9:16' ? '35%' : selectedRatio === '1:1' ? '55%' : '75%',
                              maxHeight: '100%',
                              aspectRatio: selectedRatio === '9:16' ? '9/16' : selectedRatio === '1:1' ? '1/1' : selectedRatio === '4:3' ? '4/3' : '16/9',
                              width: 'auto',
                              height: 'auto',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Don't select if clicking on controls
                              if ((e.target as HTMLElement).closest('button')) return;
                              setIsVideoSelected(true);
                            }}
                          >
                            {/* Show blank frame when in gap (no active clip), otherwise show video */}
                            {!activeVideoClip && sortedVideoClips.length > 0 ? (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                {/* Blank frame - black screen during gaps */}
                              </div>
                            ) : (
                              <video
                                ref={videoRef}
                                src={currentVideoSrc}
                                className="max-w-full max-h-full object-contain"
                                onDurationChange={(e) => {
                                  // Only set base duration if no clips exist
                                  if (sortedVideoClips.length === 0) {
                                    setDuration(e.currentTarget.duration || 78);
                                  }
                                }}
                                onEnded={() => {
                                  // When clip ends, let the timeline logic handle advancing
                                }}
                                muted={isMuted}
                              />
                            )}

                            {/* ESC hint for fullscreen */}
                            {isFullscreen && (
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium animate-fade-in">
                                Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono mx-1">ESC</kbd> to exit fullscreen
                              </div>
                            )}

                            {/* Centered Player Controls - visible on hover and in fullscreen */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isFullscreen ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                              <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/60 backdrop-blur-sm">
                                {/* Rewind 10s */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newTime = Math.max(0, currentTime - 10);
                                        setCurrentTime(newTime);
                                      }}
                                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                      <SkipBack className="w-6 h-6" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Rewind 10s</p></TooltipContent>
                                </Tooltip>

                                {/* Play/Pause */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlayback();
                                      }}
                                      className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                    >
                                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>{isPlaying ? 'Pause' : 'Play'}</p></TooltipContent>
                                </Tooltip>

                                {/* Fast Forward 10s */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newTime = Math.min(timelineDuration, currentTime + 10);
                                        setCurrentTime(newTime);
                                      }}
                                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                      <SkipForward className="w-6 h-6" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Forward 10s</p></TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                        
                        {/* Selection indicator and delete button */}
                        {isVideoSelected && (
                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove video from timeline and show canvas
                                    setTracks(prev => prev.filter(t => t.type !== 'video'));
                                    setIsVideoSelected(false);
                                    setIsVideoDeleted(true);
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
                        </>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle className={`bg-gray-200 hover:bg-primary/30 data-[resize-handle-active]:bg-primary transition-colors shrink-0 ${isTimelineMinimized ? 'hidden' : ''}`} />

                {/* Timeline Panel - small by default (~2 tracks visible), user can drag to expand */}
                <ResizablePanel 
                  defaultSize={isTimelineMinimized ? 0 : 35} 
                  minSize={isTimelineMinimized ? 0 : 20} 
                  maxSize={isTimelineMinimized ? 0 : 65}
                  className={isTimelineMinimized ? 'h-auto !flex-none' : 'overflow-hidden flex flex-col min-h-0'}
                >
                  {/* Layout/Background buttons - positioned just above timeline header when video is selected */}
                  {isVideoSelected && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-gray-50 border-b border-gray-200">
                      <button 
                        onClick={() => setShowLayoutPanel(!showLayoutPanel)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors shadow-sm"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Layout
                      </button>
                      <button 
                        onClick={() => toast({ title: 'Background settings' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Background
                      </button>
                    </div>
                  )}
                  <div className={`bg-white border-t border-gray-200 flex flex-col ${isTimelineMinimized ? '' : 'h-full overflow-hidden'}`}>
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
                            <Magnet className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Enable Snap</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Diamond className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Add Marker</p></TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Center - Playback Controls */}
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => setRecordModalOpen(true)}
                            className={`h-8 px-3 flex items-center justify-center gap-1.5 rounded-full transition-colors text-white shadow-md ${
                              isRecording ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            <CircleDot className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Record</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Record Audio/Video</p></TooltipContent>
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
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-colors shadow-sm"
                          >
                            Fit
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Fit Timeline to View</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => setIsTimelineMinimized(!isTimelineMinimized)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {isTimelineMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isTimelineMinimized ? 'Expand' : 'Hide Timeline'}</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                    {/* Timeline Content */}
                    {!isTimelineMinimized && (
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <VideoTimeline
                          tracks={tracks}
                          setTracks={setTracks}
                          currentTime={currentTime}
                          duration={timelineDuration}
                          zoom={zoom}
                          selectedClip={selectedClip}
                          setSelectedClip={setSelectedClip}
                          onTimeSeek={handleTimelineSeek}
                          isDragging={isDragging}
                          setIsDragging={setIsDragging}
                        />
                      </div>
                    )}
                  </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
