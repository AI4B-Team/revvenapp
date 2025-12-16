import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X 
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

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
}

const AudioPlayerBar = ({ 
  track, 
  tracks, 
  currentIndex, 
  onNext, 
  onPrevious, 
  onClose,
  onTrackChange 
}: AudioPlayerBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
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
      // Auto-play next track
      if (currentIndex < tracks.length - 1) {
        onNext();
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      audio.volume = volume / 100;
      audio.play();
      setIsPlaying(true);
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
    } else {
      audioRef.current.play();
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

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-sidebar-background border-t border-sidebar-hover z-50 animate-slide-up">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          {/* Animated equalizer when playing */}
          <div className="flex items-end gap-0.5 h-8 w-8">
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
            <SkipBack size={18} className="text-sidebar-text" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-brand-green hover:bg-brand-green/90 transition-colors"
          >
            {isPlaying ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === tracks.length - 1}
            className="p-2 rounded-full hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={18} className="text-sidebar-text" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-sidebar-text-muted w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={track.duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-sidebar-text-muted w-10">
            {formatTime(track.duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} className="text-sidebar-text" />
            ) : (
              <Volume2 size={18} className="text-sidebar-text" />
            )}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={(v) => {
              setVolume(v[0]);
              setIsMuted(false);
            }}
            className="w-20"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
        >
          <X size={18} className="text-sidebar-text" />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayerBar;
