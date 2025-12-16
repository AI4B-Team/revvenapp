import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause, Check } from 'lucide-react';

interface MusicSample {
  id: string;
  genre: string;
  coverImage: string;
  audioUrl: string;
  isNew?: boolean;
}

const musicSamples: MusicSample[] = [
  {
    id: '1',
    genre: 'R&B',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    isNew: true,
  },
  {
    id: '2',
    genre: 'POP',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c1.mp3',
  },
  {
    id: '3',
    genre: 'Jazz',
    coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
  },
  {
    id: '4',
    genre: 'Country',
    coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
  },
  {
    id: '5',
    genre: 'Blues',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4b5a6a07.mp3',
  },
  {
    id: '6',
    genre: 'Hip-Hop',
    coverImage: 'https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
  {
    id: '7',
    genre: 'Electronic',
    coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f49f8b4.mp3',
  },
  {
    id: '8',
    genre: 'Classical',
    coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_c8c8a73467.mp3',
  },
];

interface MusicSampleCardProps {
  sample: MusicSample;
  isPlaying: boolean;
  isSelected: boolean;
  onHover: (sample: MusicSample | null) => void;
  onSelect: (sample: MusicSample) => void;
}

const MusicSampleCard: React.FC<MusicSampleCardProps> = ({
  sample,
  isPlaying,
  isSelected,
  onHover,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover(sample);
  }, [sample, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHover(null);
  }, [onHover]);

  return (
    <div
      className="group relative cursor-pointer transition-all duration-300 ease-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(sample)}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl aspect-square
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-105 shadow-2xl shadow-emerald-500/20' : 'scale-100 shadow-lg shadow-black/10'}
          ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <img
          src={sample.coverImage}
          alt={sample.genre}
          className={`
            w-full h-full object-cover
            transition-all duration-500 ease-out
            ${isHovered ? 'scale-110 brightness-75' : 'scale-100 brightness-100'}
          `}
        />

        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-60'}
          `}
        />

        {isPlaying && (
          <div className="absolute top-3 right-3 flex items-center gap-0.5">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-emerald-400 rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ height: '40%' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.1s]" style={{ height: '70%' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.2s]" style={{ height: '100%' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.3s]" style={{ height: '60%' }} />
            </div>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        )}

        {sample.isNew && !isSelected && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-500 rounded-full">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">New</span>
          </div>
        )}

        {/* Use Button - Bottom Right */}
        <div
          className={`
            absolute bottom-3 right-3 z-10
            transition-all duration-300 ease-out
            ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(sample);
            }}
            className={`
              px-4 py-2 rounded-full font-semibold text-xs
              transition-all duration-200 ease-out
              transform ${isHovered ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95'}
              ${isSelected 
                ? 'bg-white text-emerald-600 hover:bg-gray-100' 
                : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30'
              }
              active:scale-95
            `}
          >
            {isSelected ? 'Selected' : 'Use'}
          </button>
        </div>

        {/* Play/Pause Icon - Center */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          )}
        </div>

        {/* Genre Label - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-12 p-3">
          <h3 className="text-white font-bold text-sm tracking-wide">
            {sample.genre}
          </h3>
        </div>
      </div>
    </div>
  );
};

interface MusicSamplesSectionProps {
  isVisible?: boolean;
  onSampleSelect?: (sample: MusicSample) => void;
  selectedSampleId?: string | null;
}

const MusicSamplesSection: React.FC<MusicSamplesSectionProps> = ({
  isVisible = true,
  onSampleSelect,
  selectedSampleId,
}) => {
  const [hoveredSample, setHoveredSample] = useState<MusicSample | null>(null);
  const [internalSelectedSample, setInternalSelectedSample] = useState<MusicSample | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSample = selectedSampleId 
    ? musicSamples.find(s => s.id === selectedSampleId) || internalSelectedSample
    : internalSelectedSample;

  const handleHover = useCallback((sample: MusicSample | null) => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (sample) {
      setHoveredSample(sample);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = sample.audioUrl;
        audioRef.current.volume = 0;
        audioRef.current.currentTime = 0;
        
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          let vol = 0;
          const fadeIn = setInterval(() => {
            if (audioRef.current && vol < 0.5) {
              vol += 0.05;
              audioRef.current.volume = Math.min(vol, 0.5);
            } else {
              clearInterval(fadeIn);
            }
          }, 50);
        }).catch((e) => {
          console.log('Audio autoplay prevented:', e);
          setIsPlaying(false);
        });
      }
    } else {
      if (audioRef.current && isPlaying) {
        let vol = audioRef.current.volume;
        const fadeOut = setInterval(() => {
          if (audioRef.current && vol > 0) {
            vol -= 0.05;
            audioRef.current.volume = Math.max(vol, 0);
          } else {
            clearInterval(fadeOut);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsPlaying(false);
            setHoveredSample(null);
          }
        }, 30);
      } else {
        setHoveredSample(null);
      }
    }
  }, [isPlaying]);

  const handleSelect = useCallback((sample: MusicSample) => {
    const newSelection = internalSelectedSample?.id === sample.id ? null : sample;
    setInternalSelectedSample(newSelection);
    onSampleSelect?.(sample);
  }, [internalSelectedSample, onSampleSelect]);

  if (!isVisible) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
      <audio ref={audioRef} preload="none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Samples</h2>
          <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
            {musicSamples.length} styles
          </span>
        </div>
        
        <button className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
          View all
          <svg 
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {musicSamples.map((sample) => (
          <MusicSampleCard
            key={sample.id}
            sample={sample}
            isPlaying={isPlaying && hoveredSample?.id === sample.id}
            isSelected={selectedSample?.id === sample.id}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {hoveredSample && isPlaying && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-emerald-500 rounded-full animate-pulse" style={{ height: '40%' }} />
            <span className="w-0.5 bg-emerald-500 rounded-full animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }} />
            <span className="w-0.5 bg-emerald-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
            <span className="w-0.5 bg-emerald-500 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.3s' }} />
          </div>
          <span>
            Now previewing: <span className="font-medium text-foreground">{hoveredSample.genre}</span>
          </span>
        </div>
      )}

      <style>{`
        @keyframes soundwave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
};

export default MusicSamplesSection;
