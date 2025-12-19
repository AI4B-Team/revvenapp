import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Plus,
  Share2,
  Settings,
  X,
  Image,
  Video,
  Music,
  Mic,
  Type,
  FileText,
  Sparkles,
  Wand2,
  Eye,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  Folder,
  Film,
  SlidersHorizontal,
  RotateCcw,
  Maximize2,
  Grid3X3,
  Layers,
  MessageSquare,
  Captions,
  RefreshCw,
  ChevronDown,
  Cloud,
  Check,
  Download,
  Copy,
  Loader2,
  Headphones,
  AudioWaveform,
  SplitSquareHorizontal,
  Sliders,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TranscriptSegment {
  id: number;
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TimelineScene {
  id: number;
  name: string;
  color: string;
  duration: number;
  startTime: number;
}

interface TimelineTrack {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  clips: { id: string; start: number; duration: number; name: string }[];
}

interface MediaItem {
  id: number;
  name: string;
  duration?: string;
  thumbnail?: string;
}

interface AITool {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  toggle?: boolean;
}

interface HistoryState {
  transcript: TranscriptSegment[];
  currentTime: number;
}

interface VideoEditingCanvasProps {
  video?: string;
  onClose?: () => void;
  onSave?: () => void;
  onTabChange?: (tab: 'image' | 'video' | 'audio') => void;
  activeEditorTab?: 'image' | 'video' | 'audio';
}

// Sample transcript data with timestamps
const initialTranscript: TranscriptSegment[] = [
  { id: 1, speaker: 'Vicki', startTime: 0, endTime: 5.2, text: "I'm going to tell you something shocking." },
  { id: 2, speaker: 'Vicki', startTime: 5.2, endTime: 8.5, text: "I'm not real. I wasn't born. I don't have a past." },
  { id: 3, speaker: 'Vicki', startTime: 8.5, endTime: 14.0, text: "I don't even exist, and yet I show up online. I create content. I build influence." },
  { id: 4, speaker: 'Vicki', startTime: 14.0, endTime: 20.5, text: "I help my creators share ideas, promote products, and grow a brand without them ever needing to step in front of the camera." },
  { id: 5, speaker: 'Vicki', startTime: 20.5, endTime: 28.0, text: "Hi, my name is Vicki Revelle and I'm what's called a digital babe. I was created because my creator didn't want to be on camera every day." },
  { id: 6, speaker: 'Vicki', startTime: 28.0, endTime: 35.0, text: "Post endless selfies or dance on TikTok, feel pushy or salesy, burnout, chasing trends, or sacrifice their privacy just to be seen." },
  { id: 7, speaker: 'Vicki', startTime: 35.0, endTime: 42.0, text: "Let's be real. Not everyone wants to be the face of their brand. Not everyone wants to share their personal life online." },
  { id: 8, speaker: 'Vicki', startTime: 42.0, endTime: 50.0, text: "Not everyone has the time or energy to create endless content, and yet without a consistent presence, your brand fades away." },
];

// Timeline scenes data
const initialTimelineScenes: TimelineScene[] = [
  { id: 1, name: 'Intro Scene', color: '#10b981', duration: 8.5, startTime: 0 },
  { id: 2, name: 'Vicki Introduction', color: '#f59e0b', duration: 11.5, startTime: 8.5 },
  { id: 3, name: 'Value Proposition', color: '#ef4444', duration: 8, startTime: 20 },
  { id: 4, name: 'Benefits', color: '#10b981', duration: 7, startTime: 28 },
  { id: 5, name: 'Reality Check', color: '#8b5cf6', duration: 7, startTime: 35 },
  { id: 6, name: 'Closing', color: '#f59e0b', duration: 8, startTime: 42 },
];

// Media library items
const mediaLibrary: { video: MediaItem[]; image: MediaItem[]; audio: MediaItem[] } = {
  video: [
    { id: 1, name: 'Vicki Intro.mp4', duration: '0:32' },
    { id: 2, name: 'Product Shot.mp4', duration: '0:45' },
    { id: 3, name: 'Zara Scene.mp4', duration: '1:20' },
    { id: 4, name: 'Bianca Clip.mp4', duration: '0:58' },
  ],
  image: [
    { id: 1, name: 'Logo.png' },
    { id: 2, name: 'Product 1.jpg' },
    { id: 3, name: 'Background.png' },
  ],
  audio: [
    { id: 1, name: 'Intro Music.mp3', duration: '2:30' },
    { id: 2, name: 'Transition.wav', duration: '0:03' },
    { id: 3, name: 'Outro.mp3', duration: '0:45' },
  ],
};

// AI Tools data
const aiTools: AITool[] = [
  { id: 1, name: 'Edit for clarity', description: 'Remove filler words, digressions, blather', icon: Wand2, category: 'recommended' },
  { id: 2, name: 'Remove filler words', description: 'Remove uhms, uhs, repeated words', icon: Trash2, category: 'recommended' },
  { id: 3, name: 'Shorten word gaps', description: 'Shrink or cut silences & lapses in conversation', icon: Scissors, category: 'recommended' },
  { id: 4, name: 'Studio Sound', description: 'Remove background noise & enhance volume', icon: Volume2, category: 'recommended' },
  { id: 5, name: 'Create clips', description: 'AI finds your most share-worthy moments & creates clips', icon: Film, category: 'recommended' },
  { id: 6, name: 'Auto Generate AI B-Roll', description: 'Automatically add relevant B-roll footage', icon: Layers, category: 'enhance' },
  { id: 7, name: 'AI Keywords Highlighter', description: 'Highlight important keywords in captions', icon: Type, category: 'enhance', toggle: true },
  { id: 8, name: 'Auto transitions', description: 'Add smooth transitions between clips', icon: RefreshCw, category: 'enhance', toggle: true },
  { id: 9, name: 'Eye Contact', description: 'Correct eye contact in videos', icon: Eye, category: 'look' },
  { id: 10, name: 'Center active speaker', description: 'Keep speaker centered in frame', icon: Grid3X3, category: 'look' },
];

// Left sidebar icon tabs (8 icons like the reference)
const leftIconTabs = [
  { id: 'script', icon: FileText, label: 'Script' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'voiceover', icon: Mic, label: 'Voiceover' },
  { id: 'soundfx', icon: Headphones, label: 'Sound FX' },
  { id: 'captions', icon: Captions, label: 'Captions' },
  { id: 'transitions', icon: SplitSquareHorizontal, label: 'Transitions' },
  { id: 'effects', icon: Sliders, label: 'Effects' },
  { id: 'waveform', icon: AudioWaveform, label: 'Waveform' },
];

const VideoEditingCanvas: React.FC<VideoEditingCanvasProps> = ({
  video,
  onClose,
  onSave,
  onTabChange,
  activeEditorTab,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(50);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [activeLeftTab, setActiveLeftTab] = useState('script');
  const [activeMediaTab, setActiveMediaTab] = useState('video');
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(initialTranscript);
  const [showAITools, setShowAITools] = useState(false);
  const [aiToolStates, setAiToolStates] = useState<Record<number, boolean>>({ 7: true, 8: true });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [timelineScenes] = useState<TimelineScene[]>(initialTimelineScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingTranscriptId, setEditingTranscriptId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ transcript: initialTranscript, currentTime: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Save state to history
  const saveToHistory = useCallback((newTranscript: TranscriptSegment[]) => {
    const newState: HistoryState = { transcript: newTranscript, currentTime };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, currentTime]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTranscript(history[newIndex].transcript);
      toast.success('Undone');
    } else {
      toast.info('Nothing to undo');
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTranscript(history[newIndex].transcript);
      toast.success('Redone');
    } else {
      toast.info('Nothing to redo');
    }
  }, [historyIndex, history]);

  // Reset
  const handleReset = useCallback(() => {
    setTranscript(initialTranscript);
    setCurrentTime(0);
    setIsPlaying(false);
    setHistory([{ transcript: initialTranscript, currentTime: 0 }]);
    setHistoryIndex(0);
    toast.success('Reset to original');
  }, []);

  // Playback simulation
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, duration, playbackSpeed]);

  // Update selected transcript based on current time
  useEffect(() => {
    const currentSegment = transcript.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
    if (currentSegment && selectedTranscriptId !== currentSegment.id) {
      setSelectedTranscriptId(currentSegment.id);
    }
  }, [currentTime, transcript, selectedTranscriptId]);

  // Handle transcript click
  const handleTranscriptClick = (id: number) => {
    setSelectedTranscriptId(id);
    const segment = transcript.find((t) => t.id === id);
    if (segment) {
      setCurrentTime(segment.startTime);
    }
  };

  // Handle word click for editing
  const handleWordClick = (segmentId: number, wordIndex: number, word: string) => {
    toast.info(`Selected word: "${word}"`);
  };

  // Start editing transcript
  const handleStartEditTranscript = (segmentId: number, text: string) => {
    setEditingTranscriptId(segmentId);
    setEditingText(text);
  };

  // Save transcript edit
  const handleSaveTranscriptEdit = (segmentId: number) => {
    const newTranscript = transcript.map((seg) =>
      seg.id === segmentId ? { ...seg, text: editingText } : seg
    );
    setTranscript(newTranscript);
    saveToHistory(newTranscript);
    setEditingTranscriptId(null);
    setEditingText('');
    toast.success('Transcript updated');
  };

  // Delete transcript segment
  const handleDeleteSegment = (segmentId: number) => {
    const newTranscript = transcript.filter((seg) => seg.id !== segmentId);
    setTranscript(newTranscript);
    saveToHistory(newTranscript);
    toast.success('Segment deleted');
  };

  // Split at current position
  const handleSplit = () => {
    const segmentToSplit = transcript.find(
      (seg) => currentTime > seg.startTime && currentTime < seg.endTime
    );
    if (segmentToSplit) {
      const splitRatio = (currentTime - segmentToSplit.startTime) / (segmentToSplit.endTime - segmentToSplit.startTime);
      const words = segmentToSplit.text.split(' ');
      const splitIndex = Math.floor(words.length * splitRatio);
      
      const firstPart = words.slice(0, splitIndex).join(' ');
      const secondPart = words.slice(splitIndex).join(' ');
      
      const newTranscript = transcript.flatMap((seg) => {
        if (seg.id === segmentToSplit.id) {
          return [
            { ...seg, endTime: currentTime, text: firstPart },
            { ...seg, id: seg.id + 100, startTime: currentTime, text: secondPart },
          ];
        }
        return seg;
      });
      
      setTranscript(newTranscript);
      saveToHistory(newTranscript);
      toast.success('Split at playhead');
    } else {
      toast.info('Position playhead within a segment to split');
    }
  };

  // Toggle AI tool
  const toggleAiTool = (toolId: number) => {
    setAiToolStates((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
    const tool = aiTools.find((t) => t.id === toolId);
    if (tool) {
      toast.success(`${tool.name} ${!aiToolStates[toolId] ? 'enabled' : 'disabled'}`);
    }
  };

  // Apply AI tool
  const handleApplyAiTool = async (tool: AITool) => {
    setIsProcessing(tool.id);
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    switch (tool.id) {
      case 1: // Edit for clarity
        const clarityTranscript = transcript.map((seg) => ({
          ...seg,
          text: seg.text.replace(/\b(um|uh|like|you know|basically|actually)\b/gi, '').replace(/\s+/g, ' ').trim(),
        }));
        setTranscript(clarityTranscript);
        saveToHistory(clarityTranscript);
        toast.success('Edited for clarity - removed filler words');
        break;
      case 2: // Remove filler words
        const fillerFreeTranscript = transcript.map((seg) => ({
          ...seg,
          text: seg.text.replace(/\b(um|uh|er|ah)\b/gi, '').replace(/\s+/g, ' ').trim(),
        }));
        setTranscript(fillerFreeTranscript);
        saveToHistory(fillerFreeTranscript);
        toast.success('Removed filler words');
        break;
      case 3: // Shorten word gaps
        toast.success('Word gaps shortened');
        break;
      case 4: // Studio Sound
        toast.success('Studio Sound applied - audio enhanced');
        break;
      case 5: // Create clips
        toast.success('3 shareable clips created');
        break;
      default:
        toast.success(`${tool.name} applied`);
    }
    
    setIsProcessing(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setPreviewZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setPreviewZoom((prev) => Math.max(prev - 25, 50));
  };

  // Timeline zoom
  const handleTimelineZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 100));
  };

  const handleTimelineZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  // Skip controls
  const handleSkipBack = () => {
    setCurrentTime((prev) => Math.max(prev - 5, 0));
  };

  const handleSkipForward = () => {
    setCurrentTime((prev) => Math.min(prev + 5, duration));
  };

  const handleFrameBack = () => {
    setCurrentTime((prev) => Math.max(prev - 0.1, 0));
  };

  const handleFrameForward = () => {
    setCurrentTime((prev) => Math.min(prev + 0.1, duration));
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  // Scene click
  const handleSceneClick = (scene: TimelineScene) => {
    setSelectedSceneId(scene.id);
    setCurrentTime(scene.startTime);
    toast.info(`Jumped to ${scene.name}`);
  };

  // Media item click
  const handleMediaItemClick = (item: MediaItem, type: string) => {
    toast.success(`Added ${item.name} to timeline`);
  };

  // Upload handler
  const handleUpload = () => {
    toast.info(`Upload ${activeMediaTab} - feature coming soon`);
  };

  // Get current caption
  const getCurrentCaption = () => {
    const current = transcript.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
    return current?.text || '';
  };

  // Timeline tracks with audio showing text+waveform style
  const timelineTracks: TimelineTrack[] = [
    { id: 'video', name: 'Video', icon: Video, color: '#10b981', clips: [{ id: 'v1', start: 0, duration: duration, name: 'Main Video' }] },
    { id: 'transcript', name: 'Text', icon: FileText, color: '#a855f7', clips: transcript.map((t, i) => ({ id: `t${i}`, start: t.startTime, duration: t.endTime - t.startTime, name: t.text.substring(0, 20) + '...' })) },
    { id: 'audio', name: 'SFX', icon: Mic, color: '#f59e0b', clips: [{ id: 'a1', start: 0, duration: 5, name: 'Intro' }, { id: 'a2', start: 42, duration: 8, name: 'Outro' }] },
    { id: 'music', name: 'Music', icon: Music, color: '#ec4899', clips: [{ id: 'm1', start: 0, duration: duration, name: 'BG Music' }] },
  ];

  const mediaTabs = [
    { id: 'video', label: 'Video', icon: Video },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'audio', label: 'Audio', icon: Music },
  ];

  const collaborators = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop',
  ];

  // Render waveform SVG for audio segments
  const renderWaveform = (segmentWidth: number) => {
    const bars = Math.max(20, Math.floor(segmentWidth / 4));
    return (
      <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none">
        {Array.from({ length: bars }).map((_, i) => {
          const height = 20 + Math.random() * 60;
          return (
            <rect
              key={i}
              x={`${(i / bars) * 100}%`}
              y={`${50 - height / 2}%`}
              width={`${100 / bars - 0.5}%`}
              height={`${height}%`}
              fill="currentColor"
              rx="1"
            />
          );
        })}
      </svg>
    );
  };

  // Render content based on active left tab
  const renderLeftPanelContent = () => {
    switch (activeLeftTab) {
      case 'script':
        return (
          <div className="p-4">
            {/* Script Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">DIGITAL BABES VSL</h3>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                      <Search className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Search transcript</p></TooltipContent>
                </Tooltip>
                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaker Label */}
            <button 
              onClick={() => toast.info('Add speaker feature coming soon')}
              className="flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-gray-900"
            >
              <Plus className="w-4 h-4" />
              Add speaker
            </button>

            {/* Transcript Content */}
            <div className="space-y-1">
              {transcript.map((segment) => (
                <div
                  key={segment.id}
                  onClick={() => handleTranscriptClick(segment.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    selectedTranscriptId === segment.id
                      ? 'bg-emerald-50 ring-2 ring-emerald-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {/* Speaker badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium">
                        {segment.speaker.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{segment.speaker}</span>
                    <span className="text-xs text-gray-400">{formatTime(segment.startTime)}</span>
                  </div>

                  {/* Editable text */}
                  {editingTranscriptId === segment.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full p-2 text-sm border rounded resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveTranscriptEdit(segment.id)}
                          className="px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTranscriptId(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p 
                      className="text-sm text-gray-800 leading-relaxed"
                      onDoubleClick={() => handleStartEditTranscript(segment.id, segment.text)}
                    >
                      {segment.text.split(' ').map((word, idx) => (
                        <span
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordClick(segment.id, idx, word);
                          }}
                          className={`inline-block mr-1 px-0.5 rounded cursor-text hover:bg-emerald-200/50 ${
                            selectedTranscriptId === segment.id ? 'hover:bg-emerald-200' : ''
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  )}

                  {/* Action buttons on hover */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditTranscript(segment.id, segment.text);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                        >
                          <Type className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>Edit text</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSplit();
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>Split segment</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSegment(segment.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>Delete segment</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'music':
      case 'voiceover':
      case 'soundfx':
        return (
          <div className="p-4">
            <div className="text-center py-16">
              <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-medium text-gray-700">No Visual Assets</p>
              <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto">
                Start building your collection by clicking the generate button below, or by uploading a file <span className="text-pink-500 cursor-pointer hover:underline">here</span>
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <div className="text-center py-16">
              <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-medium text-gray-700">{leftIconTabs.find(t => t.id === activeLeftTab)?.label}</p>
              <p className="text-xs text-gray-500 mt-2">Coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <div ref={containerRef} className="h-full min-h-0 flex flex-col bg-white overflow-hidden font-sans">
        {/* Top Header - Dark Menu Bar */}
        <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-emerald-400">Editor</span>
              <div className="flex items-center gap-1 px-2 py-1 text-sm bg-white/10 rounded hover:bg-white/20 cursor-pointer">
                <span>Editing</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Undo (Ctrl+Z)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Redo (Ctrl+Y)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleReset} className="p-1.5 hover:bg-white/10 rounded transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Reset to original</p></TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Zoom out</p></TooltipContent>
              </Tooltip>
              <span className="text-sm min-w-[50px] text-center">{previewZoom}%</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Zoom in</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setPreviewZoom(100)} className="p-1 hover:bg-white/10 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Reset zoom</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Centered Media Type Tabs */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button
              onClick={() => onTabChange?.('image')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                activeEditorTab === 'image' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              Image
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => onTabChange?.('video')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                activeEditorTab === 'video' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => onTabChange?.('audio')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                activeEditorTab === 'audio' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              Audio
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {collaborators.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Collaborator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] object-cover"
                />
              ))}
            </div>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Vertical Icon Bar (8 icons) */}
          <div className="w-12 flex flex-col items-center py-2 bg-[#1a1a2e] shrink-0">
            {leftIconTabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveLeftTab(tab.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        activeLeftTab === tab.id
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right"><p>{tab.label}</p></TooltipContent>
                </Tooltip>
                {index === 0 && (
                  <div className="w-6 h-0.5 bg-pink-500 rounded-full mt-1 mb-2" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Left Panel - Content Area */}
          <div className="w-[320px] flex flex-col border-r border-gray-200 bg-[#1a1a2e] shrink-0">
            {/* Tab Label Header */}
            <div className="flex items-center px-4 py-3 border-b border-gray-700">
              <span className="text-white font-medium flex items-center gap-2">
                {React.createElement(leftIconTabs.find(t => t.id === activeLeftTab)?.icon || FileText, { className: "w-4 h-4" })}
                {leftIconTabs.find(t => t.id === activeLeftTab)?.label}
              </span>
            </div>
            
            {/* Content Area with White Background */}
            <div className="flex-1 overflow-y-auto bg-white">
              {renderLeftPanelContent()}
            </div>

            {/* Bottom Generation Area */}
            <div className="p-4 bg-[#1a1a2e] border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-3">
                Drag and drop, <span className="text-pink-400 cursor-pointer hover:underline">browse my library</span>, or <span className="text-pink-400 cursor-pointer hover:underline">upload</span>.
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">
                  <Video className="w-3 h-3" />
                  Video
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  AIV Consistent
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">
                  <Grid3X3 className="w-3 h-3" />
                  Portrait
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">
                  <RefreshCw className="w-3 h-3" />
                  5s
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">
                  <span className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[9px]">1</span>
                  <Plus className="w-3 h-3" />
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Describe your video idea... (e.g., 'Sunlight filtering through trees and a gentle stream flowing') or <span className="text-pink-400 cursor-pointer">surprise me!</span>
              </p>

              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all">
                  Generate <Sparkles className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-[8px] text-black">💰</span>
                  </div>
                  Cost: 30 credits
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Video Preview */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowAITools(!showAITools)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showAITools ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Tools
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Toggle grid</p></TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toast.info('Position controls opened')}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Position
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Adjust position</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setPreviewZoom(100)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Reset view</p></TooltipContent>
                </Tooltip>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{previewZoom}%</span>
                <span className="text-gray-400">|</span>
                <button 
                  onClick={() => toast.info('Effects panel opened')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Effects
                </button>
                <button 
                  onClick={() => toast.info('Animation panel opened')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Animation
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toast.info('Settings opened')}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Video settings</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Video Preview Area */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-gray-100">
              <div 
                className="relative w-full max-w-3xl aspect-video bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-xl overflow-hidden shadow-2xl"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'center' }}
              >
                {video ? (
                  <video
                    ref={videoRef}
                    src={video}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                  />
                ) : (
                  <>
                    {/* Video gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Abstract shapes for visual interest */}
                    <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-emerald-600/30 blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full bg-teal-500/40 blur-2xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-emerald-400/50 blur-xl" />
                  </>
                )}

                {/* Play button overlay */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                  </div>
                </button>

                {/* Current caption display */}
                {getCurrentCaption() && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/70 backdrop-blur-sm rounded-lg max-w-[80%]">
                    <p className="text-white text-lg font-medium text-center">{getCurrentCaption()}</p>
                  </div>
                )}

                {/* Timecode overlay */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 rounded text-white text-sm font-mono">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleSkipBack} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                      <SkipBack className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Skip back 5s</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleFrameBack} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Previous frame</p></TooltipContent>
                </Tooltip>
                <span className="text-sm font-mono text-gray-700 min-w-[100px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toast.info('Recording feature coming soon')}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                      Record
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Record voiceover</p></TooltipContent>
                </Tooltip>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="px-2 py-1 text-sm bg-gray-100 rounded border-0 text-gray-600 cursor-pointer"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleSplit}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
                    >
                      <Scissors className="w-4 h-4" />
                      Split
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Split at playhead</p></TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isMuted ? 'Unmute' : 'Mute'}</p></TooltipContent>
                  </Tooltip>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (Number(e.target.value) > 0) setIsMuted(false);
                    }}
                    className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <span className="text-sm text-gray-500">{zoom}%</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleTimelineZoomIn} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Timeline zoom in</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toast.info('Export settings')}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Export settings</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleFullscreen} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Fullscreen</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Tools */}
          {showAITools && (
            <div className="w-[240px] flex flex-col border-l border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <button 
                  onClick={() => setShowAITools(false)}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-gray-900">AI Tools</h3>
                </button>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowAITools(false)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Recommended Section */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommended</h4>
                  <div className="space-y-2">
                    {aiTools
                      .filter((t) => t.category === 'recommended')
                      .map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleApplyAiTool(tool)}
                          disabled={isProcessing !== null}
                          className="w-full flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group disabled:opacity-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0">
                            {isProcessing === tool.id ? (
                              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                            ) : (
                              <tool.icon className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{tool.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Sound Good Section */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sound good</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleApplyAiTool(aiTools[0])}
                      disabled={isProcessing !== null}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Edit for clarity</span>
                    </button>
                    <button 
                      onClick={() => handleApplyAiTool(aiTools[3])}
                      disabled={isProcessing !== null}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
                    >
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Studio Sound</span>
                    </button>
                  </div>
                </div>

                {/* Look Good Section */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Look good</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => toast.success('Quick design applied')}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                    >
                      <Wand2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Quick design</span>
                    </button>
                    <button 
                      onClick={() => toast.success('Eye contact correction applied')}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Eye Contact</span>
                    </button>
                    <button 
                      onClick={() => toast.success('Speaker centering enabled')}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                    >
                      <Grid3X3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 flex items-center gap-2">
                        Center active speaker
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                          Beta
                        </span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Enhance Section with Toggles */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Enhance</h4>
                  <div className="space-y-2">
                    {aiTools
                      .filter((t) => t.toggle)
                      .map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <tool.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{tool.name}</span>
                          </div>
                          <button
                            onClick={() => toggleAiTool(tool.id)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${
                              aiToolStates[tool.id] !== false ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                aiToolStates[tool.id] !== false ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!showAITools && (
            <button
              onClick={() => setShowAITools(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Timeline Section */}
        <div className="h-52 border-t border-gray-300 bg-white flex flex-col shrink-0">
          {/* Timeline Header with Ruler */}
          <div className="flex items-center border-b bg-gray-50 border-gray-200">
            {/* Add button */}
            <div className="w-14 shrink-0 flex items-center justify-center border-r border-gray-200 py-2">
              <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Time Ruler */}
            <div className="flex-1 relative h-6 overflow-hidden">
              <div className="absolute inset-0 flex items-end px-2">
                {Array.from({ length: Math.ceil(duration / 2) + 1 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 text-[10px] text-gray-400 font-mono"
                    style={{ width: `${100 / (duration / 2)}%` }}
                  >
                    {`${Math.floor(i * 2 / 60)}:${(i * 2 % 60).toString().padStart(2, '0')}`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={timelineRef} className="flex-1 overflow-y-auto relative">
            {/* Playhead indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
              style={{ left: `calc(56px + ${(currentTime / duration) * (100 - (56 / (timelineRef.current?.clientWidth || 1)) * 100)}%)` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-blue-500" />
            </div>

            {/* Video Track with Thumbnails */}
            <div className="flex h-14 border-b border-gray-100">
              <div className="w-14 shrink-0 flex items-center justify-center gap-1 border-r bg-gray-50 border-gray-200">
                <Video className="w-3 h-3 text-emerald-500" />
              </div>
              <div 
                className="flex-1 relative bg-white cursor-pointer p-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newTime = (x / rect.width) * duration;
                  setCurrentTime(Math.max(0, Math.min(newTime, duration)));
                }}
              >
                <div className="h-full rounded border-2 border-blue-400 bg-gray-100 flex items-center overflow-hidden">
                  {/* Simulated video thumbnails */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 h-full bg-gradient-to-br from-emerald-600 to-teal-700 border-r border-gray-300/50 flex items-center justify-center"
                    >
                      <span className="text-[8px] text-white/70 font-medium">
                        {i === 0 ? 'SOMETHING' : i === 3 ? "I WASN'T" : i === 5 ? "I DON'T HAVE" : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text/Audio Track with Waveform + Text */}
            <div className="flex h-16 border-b border-gray-100">
              <div className="w-14 shrink-0 flex items-center justify-center gap-1 border-r bg-gray-50 border-gray-200">
                <Mic className="w-3 h-3 text-purple-500" />
              </div>
              <div 
                className="flex-1 relative bg-white cursor-pointer p-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newTime = (x / rect.width) * duration;
                  setCurrentTime(Math.max(0, Math.min(newTime, duration)));
                }}
              >
                <div className="h-full flex gap-0.5">
                  {transcript.map((segment, idx) => {
                    const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
                    const leftPercent = (segment.startTime / duration) * 100;
                    const isSelected = selectedTranscriptId === segment.id;
                    
                    return (
                      <div
                        key={segment.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTranscriptClick(segment.id);
                        }}
                        className={`absolute top-1 bottom-1 rounded-md cursor-pointer flex flex-col overflow-hidden transition-all ${
                          isSelected ? 'ring-2 ring-purple-500 z-10' : 'hover:opacity-90'
                        }`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: isSelected ? '#e9d5ff' : '#f3e8ff',
                          borderLeft: '2px solid #a855f7',
                        }}
                      >
                        {/* Text */}
                        <div className="px-1.5 pt-1 text-[9px] text-purple-800 truncate font-medium">
                          {segment.text.substring(0, 25)}...
                        </div>
                        {/* Waveform visualization */}
                        <div className="flex-1 relative text-purple-400/60">
                          {renderWaveform(widthPercent * 5)}
                        </div>
                        {/* Duration badge */}
                        {isSelected && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] rounded font-mono">
                            {(segment.endTime - segment.startTime).toFixed(1)}s
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SFX Track */}
            <div className="flex h-10 border-b border-gray-100">
              <div className="w-14 shrink-0 flex items-center justify-center gap-1 border-r bg-gray-50 border-gray-200">
                <Headphones className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-medium text-gray-600">SFX</span>
              </div>
              <div 
                className="flex-1 relative bg-white cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newTime = (x / rect.width) * duration;
                  setCurrentTime(Math.max(0, Math.min(newTime, duration)));
                }}
              >
                {timelineTracks[2].clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 rounded cursor-pointer flex items-center px-2 overflow-hidden hover:opacity-80 transition-opacity"
                    style={{
                      left: `${(clip.start / duration) * 100}%`,
                      width: `${(clip.duration / duration) * 100}%`,
                      backgroundColor: '#fef3c720',
                      borderLeft: '3px solid #f59e0b',
                    }}
                  >
                    <span className="text-[9px] font-medium truncate text-amber-600">
                      {clip.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Music Track */}
            <div className="flex h-10 border-b border-gray-100">
              <div className="w-14 shrink-0 flex items-center justify-center gap-1 border-r bg-gray-50 border-gray-200">
                <Music className="w-3 h-3 text-pink-500" />
                <span className="text-[9px] font-medium text-gray-600">Music</span>
              </div>
              <div 
                className="flex-1 relative bg-white cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newTime = (x / rect.width) * duration;
                  setCurrentTime(Math.max(0, Math.min(newTime, duration)));
                }}
              >
                <div
                  className="absolute top-1 bottom-1 rounded cursor-pointer flex items-center px-2 overflow-hidden hover:opacity-80 transition-opacity"
                  style={{
                    left: '0%',
                    width: '100%',
                    backgroundColor: '#10b98120',
                    borderLeft: '3px solid #10b981',
                  }}
                >
                  <span className="text-[9px] font-medium truncate text-emerald-600">
                    BG Music
                  </span>
                  {/* Waveform for music track */}
                  <div className="flex-1 h-full relative text-emerald-400/40 ml-2">
                    {renderWaveform(200)}
                  </div>
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
