import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Minus,
  Plus,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Circle,
  Scissors,
  Move,
  RotateCcw,
  RotateCw,
  Crop,
  FlipHorizontal,
  Sparkles,
  Type,
  Square,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Download,
  Upload,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  GripVertical,
  Clock,
  Pencil,
  Share2,
  Save,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================
// TYPES
// ============================================

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  start: number;
  duration: number;
  content: string;
  thumbnail?: string;
  track: number;
  locked?: boolean;
  visible?: boolean;
}

interface EditorState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipId: string | null;
  volume: number;
  isMuted: boolean;
}

interface VideoEditingCanvasProps {
  video?: string;
  onClose: () => void;
  onSave: () => void;
}

// ============================================
// SAMPLE DATA
// ============================================

const sampleScript = `They can create content that never sleeps daily post. Reels and stories without you having to film a thing. They can model and showcase products, outfits, skincare, fitness gear, even digital products.

Your babe wears it, promotes it, and makes it shine. Digital babes can sell without feeling salesy. Your babe becomes your brand's voice, naturally promoting your products or services.`;

const sampleClips: TimelineClip[] = [
  { id: '1', type: 'video', start: 0, duration: 20, content: 'Intro Scene', track: 0, thumbnail: '🎬' },
  { id: '2', type: 'video', start: 20, duration: 25, content: 'Main Content', track: 0, thumbnail: '👩' },
  { id: '3', type: 'video', start: 45, duration: 30, content: 'Product Showcase', track: 0, thumbnail: '🛍️' },
  { id: '4', type: 'video', start: 75, duration: 25, content: 'Scene 4', track: 0, thumbnail: '🏖️' },
  { id: '5', type: 'video', start: 100, duration: 30, content: 'Scene 5', track: 0, thumbnail: '✈️' },
  { id: '6', type: 'video', start: 130, duration: 28, content: 'Closing', track: 0, thumbnail: '🎯' },
  { id: 't1', type: 'text', start: 0, duration: 20, content: "I'm going to tell you about digital babes", track: 1 },
  { id: 't2', type: 'text', start: 20, duration: 40, content: "Hi, my name is Vicki Revelle...", track: 1 },
  { id: 't3', type: 'text', start: 60, duration: 35, content: "A glamorous digital influencer...", track: 1 },
  { id: 't4', type: 'text', start: 95, duration: 63, content: "Different looks, different niches...", track: 1 },
];

const VideoEditingCanvas: React.FC<VideoEditingCanvasProps> = ({ video, onClose, onSave }) => {
  const [showWrite, setShowWrite] = useState(true);
  const [script, setScript] = useState(sampleScript);
  const [clips, setClips] = useState<TimelineClip[]>(sampleClips);
  const [editorState, setEditorState] = useState<EditorState>({
    currentTime: 0,
    duration: 158,
    isPlaying: false,
    zoom: 50,
    selectedClipId: null,
    volume: 100,
    isMuted: false,
  });
  const [activePanel, setActivePanel] = useState<'position' | 'effects' | 'animation'>('position');
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadPosition = (editorState.currentTime / editorState.duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const togglePlay = () => {
    setEditorState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setEditorState(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom + 10, 200) 
        : Math.max(prev.zoom - 10, 10)
    }));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * editorState.duration;
    setEditorState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(newTime, prev.duration)) }));
  };

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (editorState.isPlaying) {
      interval = setInterval(() => {
        setEditorState(prev => {
          if (prev.currentTime >= prev.duration) {
            return { ...prev, isPlaying: false, currentTime: 0 };
          }
          return { ...prev, currentTime: prev.currentTime + 0.1 };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [editorState.isPlaying]);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-semibold">Video Editor</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
              <Pencil className="w-3.5 h-3.5" />
              Editing
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <Undo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <Redo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Redo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Rotate Left</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <RotateCw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">Rotate Right</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 min-w-[48px] text-center">100%</span>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Script Panel */}
          <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 shrink-0">
              <button
                onClick={() => setShowWrite(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showWrite ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Pencil className="w-4 h-4" />
                Write
              </button>
              <button
                onClick={() => setShowWrite(false)}
                className={`p-2 rounded-lg transition-all ${
                  !showWrite ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            {/* Script Content */}
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full h-full resize-none outline-none text-slate-700 text-[15px] leading-relaxed bg-transparent"
                placeholder="Write your script here..."
              />
            </div>
          </div>

          {/* Video Preview */}
          <div className="flex-1 flex flex-col bg-slate-100">
            {/* Preview Controls */}
            <div className="flex items-center justify-end gap-2 px-4 py-2 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                    <Move className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">Move</TooltipContent>
              </Tooltip>
              <span className="text-sm text-slate-600 font-medium">Position</span>
              <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                <RotateCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                <Crop className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 ml-2">100%</span>
              <span className="text-sm text-slate-400 mx-2">|</span>
              <button
                onClick={() => setActivePanel('effects')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  activePanel === 'effects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Effects
              </button>
              <button
                onClick={() => setActivePanel('animation')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  activePanel === 'animation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Animation
              </button>
              <button className="p-1.5 hover:bg-white rounded text-slate-500 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Video Canvas */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ width: '560px', height: '315px' }}>
                {/* Video or Placeholder Preview */}
                {video ? (
                  <video 
                    src={video} 
                    className="w-full h-full object-contain"
                    controls={false}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/60 to-emerald-900/80">
                    {/* Simulated video frame with AI avatar */}
                    <div className="absolute inset-0 flex">
                      {/* Left side - ambient lighting */}
                      <div className="w-1/3 bg-gradient-to-r from-amber-500/30 to-transparent" />
                      {/* Right side - avatar placeholder */}
                      <div className="w-2/3 flex items-end justify-center relative">
                        <div className="absolute top-4 right-4 left-4 bottom-4 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>
                        {/* Avatar silhouette */}
                        <div className="relative z-10 w-48 h-64 mb-0">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-t from-amber-200/80 to-amber-100/60 rounded-full blur-sm" />
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-100/90 rounded-full" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-48 bg-gradient-to-t from-emerald-800/80 via-emerald-700/60 to-transparent rounded-t-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Play overlay */}
                {!editorState.isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                  >
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                    >
                      <Play className="w-8 h-8 text-slate-900 ml-1" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="h-[200px] bg-slate-900 border-t border-slate-700 flex flex-col shrink-0">
          {/* Timeline Header */}
          <div className="h-10 flex items-center px-4 border-b border-slate-700 gap-4 shrink-0">
            {/* Transport Controls */}
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Timecode */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-mono text-white">
                {formatTime(editorState.currentTime)} / {formatTime(editorState.duration)}
              </span>
            </div>

            {/* Main Transport */}
            <div className="flex items-center gap-2 ml-4">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all">
                <Circle className="w-3 h-3 fill-current" />
                Record
              </button>
              <button
                onClick={togglePlay}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
              >
                {editorState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-sm text-slate-400 px-2">1x</span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all">
                <Scissors className="w-4 h-4" />
                Split
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => handleZoom('out')}
                className="p-1 hover:bg-slate-700 rounded text-slate-400"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400 min-w-[48px] text-center">{editorState.zoom}%</span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1 hover:bg-slate-700 rounded text-slate-400"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 ml-2">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Time Ruler */}
          <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-end px-4 relative shrink-0">
            {Array.from({ length: Math.ceil(editorState.duration / 20) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${(i * 20 / editorState.duration) * 100}%` }}
              >
                <span className="text-[10px] text-slate-500 mb-1">{`${Math.floor(i * 20 / 60)}:${(i * 20 % 60).toString().padStart(2, '0')}`}</span>
                <div className="w-px h-2 bg-slate-600" />
              </div>
            ))}
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${playheadPosition}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-sm rotate-45" />
            </div>
          </div>

          {/* Timeline Tracks */}
          <div
            ref={timelineRef}
            className="flex-1 overflow-x-auto overflow-y-auto relative"
            onClick={handleTimelineClick}
          >
            {/* Video Track */}
            <div className="h-16 border-b border-slate-700 flex items-center px-4 relative">
              <div className="absolute inset-0 flex">
                {clips.filter(c => c.track === 0).map(clip => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute top-2 bottom-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      editorState.selectedClipId === clip.id
                        ? 'ring-2 ring-emerald-500'
                        : 'hover:ring-2 hover:ring-white/30'
                    }`}
                    style={{
                      left: `${(clip.start / editorState.duration) * 100}%`,
                      width: `${(clip.duration / editorState.duration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditorState(prev => ({ ...prev, selectedClipId: clip.id }));
                    }}
                  >
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center px-2 gap-2">
                      <span className="text-lg">{clip.thumbnail}</span>
                      <span className="text-xs text-white font-medium truncate">{clip.content}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Text/Caption Track */}
            <div className="h-12 border-b border-slate-700 flex items-center px-4 relative">
              <div className="absolute inset-0 flex">
                {clips.filter(c => c.track === 1).map(clip => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute top-1.5 bottom-1.5 rounded overflow-hidden cursor-pointer transition-all ${
                      editorState.selectedClipId === clip.id
                        ? 'ring-2 ring-emerald-500'
                        : 'hover:ring-1 hover:ring-white/30'
                    }`}
                    style={{
                      left: `${(clip.start / editorState.duration) * 100}%`,
                      width: `${(clip.duration / editorState.duration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditorState(prev => ({ ...prev, selectedClipId: clip.id }));
                    }}
                  >
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center px-2">
                      <span className="text-[10px] text-white truncate">{clip.content}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional empty track */}
            <div className="h-10 border-b border-slate-700/50" />

            {/* Playhead line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: `${playheadPosition}%` }}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoEditingCanvas;
