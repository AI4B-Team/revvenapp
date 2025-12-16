import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X,
  Heart, Share2, Download, MoreVertical, Info, RefreshCw
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  type: string;
}

interface AudioPlayerBarProps {
  track: AudioTrack;
  tracks: AudioTrack[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onTrackChange: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onShowDetails?: (track: AudioTrack) => void;
}

const AudioPlayerBar = ({ 
  track, 
  tracks, 
  currentIndex, 
  onNext, 
  onPrevious, 
  onClose,
  onTrackChange,
  onPlayStateChange,
  onShowDetails
}: AudioPlayerBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(track.url);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      // Don't auto-play next track - user must manually click next
    });

    audio.addEventListener('loadedmetadata', () => {
      audio.volume = volume / 100;
      audio.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [track.url]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      onPlayStateChange?.(false);
    } else {
      audioRef.current.play();
      onPlayStateChange?.(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'sound_effect': return 'bg-brand-blue/80';
      case 'music': return 'bg-purple-500/80';
      case 'transcription': return 'bg-violet-500/80';
      case 'revoice': return 'bg-rose-500/80';
      default: return 'bg-brand-green/80';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sound_effect': return 'Sound Effect';
      case 'music': return 'Music';
      case 'voiceover': return 'Voiceover';
      case 'transcription': return 'Transcription';
      case 'revoice': return 'Revoice';
      default: return type;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: track.name,
        url: track.url
      });
    } else {
      navigator.clipboard.writeText(track.url);
    }
  };

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 animate-slide-up" style={{ backgroundColor: 'hsl(215, 28%, 17%)' }}>
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          {/* Animated equalizer when playing */}
          <div className="flex items-end gap-0.5 h-10 w-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1.5 bg-brand-green rounded-full ${
                  isPlaying ? 'animate-equalizer' : 'h-1'
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.4 + i * 0.1}s`,
                  height: isPlaying ? undefined : '4px'
                }}
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-text truncate max-w-[150px]">
              {track.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded w-fit ${getTypeBadgeColor(track.type)} text-white`}>
              {getTypeLabel(track.type)}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={20} className="text-sidebar-text" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-brand-green hover:bg-brand-green/90 transition-colors"
          >
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === tracks.length - 1}
            className="p-2 rounded-full hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={20} className="text-sidebar-text" />
          </button>
        </div>

        {/* Progress Bar with Time */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-sidebar-text-muted w-10 text-right font-mono">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={track.duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-sidebar-text-muted w-10 font-mono">
            {formatTime(track.duration)}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {/* Info/Details */}
          <button
            onClick={() => onShowDetails?.(track)}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
            title="View details"
          >
            <Info size={18} className="text-sidebar-text" />
          </button>

          {/* Heart/Like */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
            title="Like"
          >
            <Heart 
              size={18} 
              className={isLiked ? 'text-brand-red fill-brand-red' : 'text-sidebar-text'} 
            />
          </button>

          {/* Remix */}
          <button
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
            title="Remix"
          >
            <RefreshCw size={18} className="text-sidebar-text" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
            title="Download"
          >
            <Download size={18} className="text-sidebar-text" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
            title="Share"
          >
            <Share2 size={18} className="text-sidebar-text" />
          </button>

          {/* Vertical Volume Control */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
                title="Volume"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} className="text-sidebar-text" />
                ) : (
                  <Volume2 size={18} className="text-sidebar-text" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              className="w-10 p-2 bg-sidebar-background border-sidebar-hover"
              align="center"
            >
              <div className="h-24 flex justify-center">
                <Slider
                  orientation="vertical"
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    setVolume(v[0]);
                    setIsMuted(false);
                  }}
                  className="h-full"
                />
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-full mt-2 p-1 rounded hover:bg-sidebar-hover transition-colors flex justify-center"
              >
                {isMuted ? (
                  <VolumeX size={14} className="text-sidebar-text" />
                ) : (
                  <Volume2 size={14} className="text-sidebar-text" />
                )}
              </button>
            </PopoverContent>
          </Popover>

          {/* More Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
                title="More options"
              >
                <MoreVertical size={18} className="text-sidebar-text" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-sidebar-background border-sidebar-hover"
            >
              <DropdownMenuItem onClick={() => onShowDetails?.(track)}>
                <Info size={14} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download size={14} className="mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 size={14} className="mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw size={14} className="mr-2" />
                Remix
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors ml-2"
          >
            <X size={18} className="text-sidebar-text" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerBar;
