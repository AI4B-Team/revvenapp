import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Music, Volume2, ImageIcon, Plus, Lock, Unlock, 
  Eye, EyeOff, MoreHorizontal, GripVertical, LayoutGrid, Rows3,
  ChevronLeft, ChevronRight, Flag
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
export interface TimelineClip {
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

export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  clips: TimelineClip[];
  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
}

interface VideoTimelineProps {
  tracks: TimelineTrack[];
  setTracks: React.Dispatch<React.SetStateAction<TimelineTrack[]>>;
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClip: string | null;
  setSelectedClip: (id: string | null) => void;
  onTimeSeek: (time: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const SNAP_THRESHOLD = 5; // pixels
const MIN_CLIP_DURATION = 0.5;

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  tracks,
  setTracks,
  currentTime,
  duration,
  zoom,
  selectedClip,
  setSelectedClip,
  onTimeSeek,
  isDragging,
  setIsDragging,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    clipId: string;
    trackId: string;
    startX: number;
    originalStartTime: number;
    type: 'move' | 'resize-left' | 'resize-right';
  } | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<number | null>(null);
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);
  const [dropTargetTrack, setDropTargetTrack] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'storyboard'>('timeline');
  const [markers, setMarkers] = useState<number[]>([]);
  const [isPlayheadDragging, setIsPlayheadDragging] = useState(false);
  
  // Track reordering state
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Get all scenes/clips from video tracks for navigation
  const scenes = React.useMemo(() => {
    return tracks
      .filter(t => t.type === 'video' || t.id.includes('video'))
      .flatMap(t => t.clips)
      .sort((a, b) => a.startTime - b.startTime);
  }, [tracks]);

  // Navigate to previous scene
  const goToPreviousScene = useCallback(() => {
    const currentScene = scenes.findIndex(s => currentTime >= s.startTime && currentTime < s.startTime + s.duration);
    if (currentScene > 0) {
      onTimeSeek(scenes[currentScene - 1].startTime);
    } else if (scenes.length > 0 && currentTime > scenes[0].startTime) {
      onTimeSeek(scenes[0].startTime);
    }
  }, [scenes, currentTime, onTimeSeek]);

  // Navigate to next scene
  const goToNextScene = useCallback(() => {
    const nextScene = scenes.find(s => s.startTime > currentTime);
    if (nextScene) {
      onTimeSeek(nextScene.startTime);
    }
  }, [scenes, currentTime, onTimeSeek]);

  // Add marker at current position
  const addMarker = useCallback(() => {
    if (!markers.includes(currentTime)) {
      setMarkers(prev => [...prev, currentTime].sort((a, b) => a - b));
    }
  }, [currentTime, markers]);

  // Jump to nearest marker
  const jumpToMarker = useCallback(() => {
    if (markers.length === 0) {
      addMarker();
      return;
    }
    // Find nearest marker after current time
    const nextMarker = markers.find(m => m > currentTime + 0.1);
    if (nextMarker !== undefined) {
      onTimeSeek(nextMarker);
    } else {
      // Loop back to first marker
      onTimeSeek(markers[0]);
    }
  }, [markers, currentTime, onTimeSeek, addMarker]);

  // Handle drop from external sources (like StockVideoPanel)
  const handleDragOver = useCallback((e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropTargetTrack(trackId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTargetTrack(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    setDropTargetTrack(null);

    // Check if track is locked
    const track = tracks.find(t => t.id === trackId);
    if (track?.locked) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'video') {
        // Calculate drop position based on mouse position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const startTime = (x / rect.width) * duration;

        // Create new clip
        const newClip: TimelineClip = {
          id: `clip-${Date.now()}`,
          type: 'video',
          name: data.name || 'Stock Video',
          startTime: Math.max(0, startTime),
          duration: Math.min(data.duration || 5, duration - startTime),
          thumbnail: data.thumbnail,
          src: data.url, // Store the video URL for playback
        };

        // Add to track
        setTracks(prev => prev.map(t => {
          if (t.id !== trackId) return t;
          return {
            ...t,
            clips: [...t.clips, newClip]
          };
        }));
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  }, [tracks, duration, setTracks]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Get all clip edges for snapping
  const getSnapPoints = useCallback((excludeClipId: string) => {
    const points: number[] = [0]; // Always snap to start
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.id !== excludeClipId) {
          points.push(clip.startTime);
          points.push(clip.startTime + clip.duration);
        }
      });
    });
    return points;
  }, [tracks]);

  // Find nearest snap point
  const findSnapPoint = useCallback((time: number, excludeClipId: string, pixelWidth: number) => {
    const snapPoints = getSnapPoints(excludeClipId);
    const pixelsPerSecond = pixelWidth / duration;
    
    for (const point of snapPoints) {
      const pixelDiff = Math.abs((point - time) * pixelsPerSecond);
      if (pixelDiff < SNAP_THRESHOLD) {
        return point;
      }
    }
    return null;
  }, [getSnapPoints, duration]);

  // Handle timeline click for seeking
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current || dragState) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    onTimeSeek(Math.max(0, Math.min(duration, newTime)));
  }, [duration, onTimeSeek, dragState]);

  // Handle drag start for clips
  const handleClipDragStart = useCallback((
    e: React.MouseEvent, 
    clipId: string, 
    trackId: string, 
    type: 'move' | 'resize-left' | 'resize-right'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    const clip = tracks.find(t => t.id === trackId)?.clips.find(c => c.id === clipId);
    if (!clip) return;

    // Check if track is locked
    const track = tracks.find(t => t.id === trackId);
    if (track?.locked) return;

    setSelectedClip(clipId);
    setDragState({
      clipId,
      trackId,
      startX: e.clientX,
      originalStartTime: clip.startTime,
      type,
    });
    setIsDragging(true);
  }, [tracks, setSelectedClip, setIsDragging]);

  // Handle drag move
  useEffect(() => {
    if (!dragState || !timelineRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineRef.current!.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const timePerPixel = duration / rect.width;
      const timeDelta = deltaX * timePerPixel;

      const clip = tracks.find(t => t.id === dragState.trackId)?.clips.find(c => c.id === dragState.clipId);
      if (!clip) return;

      let newStartTime = clip.startTime;
      let newDuration = clip.duration;

      if (dragState.type === 'move') {
        newStartTime = Math.max(0, dragState.originalStartTime + timeDelta);
        
        // Check for snap
        const snapPoint = findSnapPoint(newStartTime, dragState.clipId, rect.width);
        const endSnapPoint = findSnapPoint(newStartTime + clip.duration, dragState.clipId, rect.width);
        
        if (snapPoint !== null) {
          newStartTime = snapPoint;
          setSnapIndicator(snapPoint);
        } else if (endSnapPoint !== null) {
          newStartTime = endSnapPoint - clip.duration;
          setSnapIndicator(endSnapPoint);
        } else {
          setSnapIndicator(null);
        }
      } else if (dragState.type === 'resize-left') {
        const originalEnd = dragState.originalStartTime + clip.duration;
        newStartTime = Math.max(0, dragState.originalStartTime + timeDelta);
        newDuration = originalEnd - newStartTime;
        
        if (newDuration < MIN_CLIP_DURATION) {
          newStartTime = originalEnd - MIN_CLIP_DURATION;
          newDuration = MIN_CLIP_DURATION;
        }
        
        // Snap start
        const snapPoint = findSnapPoint(newStartTime, dragState.clipId, rect.width);
        if (snapPoint !== null && originalEnd - snapPoint >= MIN_CLIP_DURATION) {
          newStartTime = snapPoint;
          newDuration = originalEnd - snapPoint;
          setSnapIndicator(snapPoint);
        } else {
          setSnapIndicator(null);
        }
      } else if (dragState.type === 'resize-right') {
        newDuration = Math.max(MIN_CLIP_DURATION, clip.duration + timeDelta - (dragState.originalStartTime - clip.startTime));
        const newEnd = clip.startTime + newDuration;
        
        // Snap end
        const snapPoint = findSnapPoint(newEnd, dragState.clipId, rect.width);
        if (snapPoint !== null && snapPoint - clip.startTime >= MIN_CLIP_DURATION) {
          newDuration = snapPoint - clip.startTime;
          setSnapIndicator(snapPoint);
        } else {
          setSnapIndicator(null);
        }
      }

      setTracks(prev => prev.map(track => {
        if (track.id !== dragState.trackId) return track;
        return {
          ...track,
          clips: track.clips.map(c => {
            if (c.id !== dragState.clipId) return c;
            return { ...c, startTime: newStartTime, duration: newDuration };
          })
        };
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
      setIsDragging(false);
      setSnapIndicator(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, duration, tracks, setTracks, findSnapPoint, setIsDragging]);

  // Toggle track properties
  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ));
  };

  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, locked: !t.locked } : t
    ));
  };

  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, visible: t.visible === false ? true : false } : t
    ));
  };

  // Get track icon and color - pastel colors for better visibility
  const getTrackStyle = (trackId: string) => {
    if (trackId.includes('image')) return { icon: ImageIcon, color: 'text-blue-600', bg: 'from-blue-200 to-blue-300' };
    if (trackId.includes('video')) return { icon: Video, color: 'text-rose-600', bg: 'from-rose-200 to-rose-300' };
    if (trackId.includes('audio')) return { icon: Volume2, color: 'text-violet-600', bg: 'from-violet-200 to-violet-300' };
    if (trackId.includes('music')) return { icon: Music, color: 'text-emerald-600', bg: 'from-emerald-200 to-emerald-300' };
    return { icon: Video, color: 'text-gray-600', bg: 'from-gray-200 to-gray-300' };
  };

  // Render waveform
  const renderWaveform = (clip: TimelineClip, isSelected: boolean) => {
    if (!clip.waveform) return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end px-1 gap-px overflow-hidden">
        {clip.waveform.map((amplitude, i) => (
          <div
            key={i}
            className={`flex-1 min-w-[1px] rounded-t-sm transition-colors ${
              isSelected ? 'bg-white/70' : 'bg-white/40'
            }`}
            style={{ height: `${amplitude * 100}%` }}
          />
        ))}
      </div>
    );
  };

  // Handle progress bar seeking
  const handleProgressBarSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    onTimeSeek(Math.max(0, Math.min(duration, newTime)));
  }, [duration, onTimeSeek]);

  // Handle playhead drag start
  const handlePlayheadDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlayheadDragging(true);
    setIsDragging(true);
  }, [setIsDragging]);

  // Handle playhead drag
  useEffect(() => {
    if (!isPlayheadDragging || !playheadRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = playheadRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
      onTimeSeek(newTime);
    };

    const handleMouseUp = () => {
      setIsPlayheadDragging(false);
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlayheadDragging, duration, onTimeSeek, setIsDragging]);

  // Track drag and drop handlers
  const handleTrackDragStart = useCallback((e: React.DragEvent, trackId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', trackId);
    setDraggedTrackId(trackId);
  }, []);

  const handleTrackDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  }, []);

  const handleTrackDragEnd = useCallback(() => {
    setDraggedTrackId(null);
    setDropTargetIndex(null);
  }, []);

  const handleTrackDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    setTracks(prev => {
      const draggedIndex = prev.findIndex(t => t.id === draggedId);
      if (draggedIndex === -1 || draggedIndex === targetIndex) return prev;

      const newTracks = [...prev];
      const [removed] = newTracks.splice(draggedIndex, 1);
      newTracks.splice(targetIndex > draggedIndex ? targetIndex - 1 : targetIndex, 0, removed);
      return newTracks;
    });

    setDraggedTrackId(null);
    setDropTargetIndex(null);
  }, [setTracks]);

  // Add new track
  const handleAddTrack = () => {
    const newTrack: TimelineTrack = {
      id: `track-${Date.now()}`,
      type: 'video',
      name: `Track ${tracks.length + 1}`,
      clips: [],
      muted: false,
      locked: false,
      visible: true,
    };
    setTracks(prev => [...prev, newTrack]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Scrubber/Playhead Bar at Top - aligned with timeline content */}
      <div className="flex h-6 bg-slate-800 flex-shrink-0 border-b border-slate-700">
        {/* Empty space matching track header width */}
        <div className="w-[180px] flex-shrink-0 bg-slate-800/80" />
        
        {/* Scrubber area - aligned with timeline content */}
        <div 
          ref={playheadRef}
          className="flex-1 cursor-pointer relative group"
          onClick={handleProgressBarSeek}
        >
          {/* Track line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-slate-700 mx-2 rounded-full">
            {/* Progress fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Markers on scrubber */}
          {markers.map((markerTime, idx) => (
            <div 
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full cursor-pointer hover:scale-125 transition-transform z-10"
              style={{ left: `calc(${(markerTime / duration) * 100}% - 4px)` }}
              onClick={(e) => { e.stopPropagation(); onTimeSeek(markerTime); }}
            />
          ))}
          
          {/* Draggable Playhead dot */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing z-20 transition-transform hover:scale-110 ${isPlayheadDragging ? 'scale-125' : ''}`}
            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
            onMouseDown={handlePlayheadDragStart}
          >
            <div className="absolute inset-1 bg-rose-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Time Ruler with Controls */}
      <div className="flex flex-shrink-0">
        <div className="w-[180px] flex-shrink-0 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-2">
          {/* Add Track Button */}
          <button 
            onClick={handleAddTrack}
            className="flex items-center gap-1 px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Scene Navigation */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={goToPreviousScene}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Previous Scene</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={goToNextScene}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Next Scene</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={jumpToMarker}
                  className={`p-1 rounded transition-colors ${markers.length > 0 ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'} hover:bg-slate-700/50`}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{markers.length > 0 ? 'Jump to Marker' : 'Add Marker'}</p></TooltipContent>
            </Tooltip>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-700/50 rounded p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setViewMode('storyboard')}
                  className={`p-1 rounded transition-colors ${viewMode === 'storyboard' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Scenes</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={`p-1 rounded transition-colors ${viewMode === 'timeline' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Rows3 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Timeline</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div 
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 h-8 bg-slate-800 border-b border-slate-700 relative cursor-pointer select-none overflow-hidden"
        >
          <div 
            className="h-full relative"
            style={{ width: `${100 * zoom}%`, minWidth: '100%' }}
          >
            {/* Playhead */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
              animate={{ left: `${(currentTime / duration) * 100}%` }}
              transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1, stiffness: 300, damping: 30 }}
            >
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500" />
            </motion.div>

            {/* Markers */}
            {markers.map((markerTime, idx) => (
              <div 
                key={idx}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 cursor-pointer hover:bg-amber-300"
                style={{ left: `${(markerTime / duration) * 100}%` }}
                onClick={(e) => { e.stopPropagation(); onTimeSeek(markerTime); }}
              >
                <Flag className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 text-amber-400" />
              </div>
            ))}

            {/* Snap indicator */}
            {snapIndicator !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 pointer-events-none"
                style={{ left: `${(snapIndicator / duration) * 100}%` }}
              />
            )}

            {/* Time markers */}
            <div className="flex items-end h-full">
              {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-full flex items-center"
                  style={{ width: `${(5 / duration) * 100}%`, minWidth: '80px' }}
                >
                  <div className="h-full flex flex-col justify-end border-l border-slate-600">
                    <span className="text-xs text-slate-300 font-mono pl-2 pb-1 whitespace-nowrap">
                      {formatTime(i * 5)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard View */}
      {viewMode === 'storyboard' ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {scenes.map((clip, index) => {
              const isSelected = selectedClip === clip.id;
              const isCurrent = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
              
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setSelectedClip(clip.id);
                    onTimeSeek(clip.startTime);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all group ${
                    isSelected 
                      ? 'ring-2 ring-white shadow-lg scale-105' 
                      : isCurrent 
                        ? 'ring-2 ring-rose-500' 
                        : 'hover:ring-2 hover:ring-slate-400'
                  }`}
                >
                  {/* Scene thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
                    {clip.thumbnail ? (
                      <img src={clip.thumbnail} alt={clip.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Scene number badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white font-mono">
                    {clip.duration.toFixed(1)}s
                  </div>
                  
                  {/* Scene name - shows on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{clip.name}</p>
                  </div>
                  
                  {/* Current playback indicator */}
                  {isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-8 h-8 rounded-full bg-rose-500/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[10px] border-t-[6px] border-b-[6px] border-l-white border-t-transparent border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Add scene button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  onClick={() => {
                    // Find the last scene's end time or use 0
                    const lastScene = scenes[scenes.length - 1];
                    const newStartTime = lastScene ? lastScene.startTime + lastScene.duration : 0;
                    
                    // Create new scene in the first video track
                    const videoTrack = tracks.find(t => t.type === 'video' || t.id.includes('video'));
                    if (videoTrack) {
                      const newClip: TimelineClip = {
                        id: `clip-${Date.now()}`,
                        type: 'video',
                        name: `Scene ${scenes.length + 1}`,
                        startTime: newStartTime,
                        duration: 5,
                        thumbnail: undefined,
                      };
                      
                      setTracks(prev => prev.map(t => {
                        if (t.id !== videoTrack.id) return t;
                        return { ...t, clips: [...t.clips, newClip] };
                      }));
                    }
                  }}
                  className="aspect-video rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-green-500 hover:bg-slate-800/30 transition-all group"
                >
                  <Plus className="w-6 h-6 text-slate-500 group-hover:text-green-500 transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Add New Scene</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
        {tracks.map((track, index) => {
          const trackStyle = getTrackStyle(track.id);
          const TrackIcon = trackStyle.icon;
          const isDragged = draggedTrackId === track.id;
          const isDropTargetAbove = dropTargetIndex === index;
          const isDropTargetBelow = dropTargetIndex === index + 1 && index === tracks.length - 1;
          
          return (
            <React.Fragment key={track.id}>
              {/* Drop indicator line above track */}
              {isDropTargetAbove && draggedTrackId && (
                <div className="h-1 bg-primary mx-2 rounded-full shadow-lg shadow-primary/50" />
              )}
              <div 
                className={`flex h-16 border-b border-gray-200 group transition-all ${isDragged ? 'opacity-40 bg-gray-100' : ''}`}
                draggable
                onDragStart={(e) => handleTrackDragStart(e, track.id)}
                onDragOver={(e) => handleTrackDragOver(e, index)}
                onDragEnd={handleTrackDragEnd}
                onDrop={(e) => handleTrackDrop(e, index)}
              >
              {/* Track Header - Icon only with tooltip */}
              <div className="w-[60px] flex-shrink-0 bg-white flex items-center justify-center px-2 gap-1 border-r border-gray-200">
                <GripVertical className="w-3 h-3 text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${track.locked ? 'opacity-50' : ''}`}>
                      <TrackIcon className={`w-4 h-4 ${trackStyle.color}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right"><p>{track.name}</p></TooltipContent>
                </Tooltip>
                {/* Hover icons - shown on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => toggleTrackMute(track.id)}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${track.muted ? 'text-red-400' : 'text-gray-400'}`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>{track.muted ? 'Unmute' : 'Mute'}</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => toggleTrackLock(track.id)}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${track.locked ? 'text-amber-400' : 'text-gray-400'}`}
                      >
                        {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>{track.locked ? 'Unlock' : 'Lock'}</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => toggleTrackVisibility(track.id)}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${track.visible === false ? 'text-gray-300' : 'text-gray-400'}`}
                      >
                        {track.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>{track.visible === false ? 'Show' : 'Hide'}</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Track Content - Scrollable with zoom */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div 
                  className={`relative h-full transition-colors ${track.locked ? 'opacity-60' : ''} ${
                    dropTargetTrack === track.id 
                      ? 'bg-primary/20 ring-2 ring-primary ring-inset' 
                      : 'bg-slate-900/50'
                  }`}
                  style={{ width: `${100 * zoom}%`, minWidth: '100%' }}
                  onDragOver={(e) => handleDragOver(e, track.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, track.id)}
                >
                  {/* Playhead line */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-20 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                    animate={{ left: `${(currentTime / duration) * 100}%` }}
                    transition={{ type: isDragging ? 'tween' : 'spring', duration: isDragging ? 0 : 0.1, stiffness: 300, damping: 30 }}
                  />

                  {/* Snap indicator line */}
                  {snapIndicator !== null && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/80 z-10 pointer-events-none"
                      style={{ left: `${(snapIndicator / duration) * 100}%` }}
                    />
                  )}

                {/* Clips */}
                {track.clips.map((clip) => {
                  const isSelected = selectedClip === clip.id;
                  const isHovered = hoveredClip === clip.id;
                  
                  return (
                    <div
                      key={clip.id}
                      onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id, 'move')}
                      onMouseEnter={() => setHoveredClip(clip.id)}
                      onMouseLeave={() => setHoveredClip(null)}
                      className={`absolute top-1.5 bottom-1.5 rounded-md cursor-grab active:cursor-grabbing transition-all overflow-hidden group/clip ${
                        isSelected 
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 shadow-lg shadow-black/30' 
                          : isHovered
                            ? 'ring-1 ring-white/30'
                            : ''
                      } ${track.locked ? 'cursor-not-allowed' : ''}`}
                      style={{
                        left: `${(clip.startTime / duration) * 100}%`,
                        width: `${(clip.duration / duration) * 100}%`,
                      }}
                    >
                      {/* Clip background */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${trackStyle.bg} ${track.visible === false ? 'opacity-40' : ''}`} />
                      
                      {/* Clip content - Script text above waveform */}
                      <div className="relative h-full flex flex-col z-10">
                        {track.type === 'audio' ? (
                          <>
                            {/* Script text - easy to read */}
                            <div className="flex-1 flex items-center px-2 pt-1">
                              <span className="text-xs text-white font-medium leading-tight line-clamp-2 drop-shadow-sm">
                                {clip.caption || clip.name}
                              </span>
                            </div>
                            {/* Waveform below */}
                            {renderWaveform(clip, isSelected)}
                          </>
                        ) : (
                          <div className="flex-1 flex items-center px-2">
                            <TrackIcon className="w-3 h-3 text-white/60 mr-1.5 flex-shrink-0" />
                            <span className="text-[10px] text-white/90 font-medium truncate">
                              {clip.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Duration badge on selection */}
                      {isSelected && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white font-mono">
                          {clip.duration.toFixed(1)}s
                        </div>
                      )}

                      {/* Resize handles */}
                      {!track.locked && (
                        <>
                          <div 
                            onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id, 'resize-left')}
                            className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize transition-all z-20 ${
                              isSelected || isHovered 
                                ? 'bg-white/40 hover:bg-white/70' 
                                : 'bg-transparent hover:bg-white/30'
                            }`}
                          >
                            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-full opacity-0 group-hover/clip:opacity-100" />
                          </div>
                          <div 
                            onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id, 'resize-right')}
                            className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize transition-all z-20 ${
                              isSelected || isHovered 
                                ? 'bg-white/40 hover:bg-white/70' 
                                : 'bg-transparent hover:bg-white/30'
                            }`}
                          >
                            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-full opacity-0 group-hover/clip:opacity-100" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
            {/* Drop indicator line below last track */}
            {isDropTargetBelow && draggedTrackId && (
              <div className="h-1 bg-primary mx-2 rounded-full shadow-lg shadow-primary/50" />
            )}
            </React.Fragment>
          );
        })}

        </div>
      )}
    </div>
  );
};

export default VideoTimeline;
