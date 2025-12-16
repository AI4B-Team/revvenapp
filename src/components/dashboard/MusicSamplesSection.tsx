import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MusicSample {
  id: string;
  genre: string;
  coverImage: string;
  audioUrl: string;
  promptText: string;
  isNew?: boolean;
}

const musicSamples: MusicSample[] = [
  {
    id: '1',
    genre: 'R&B',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/rnb.mp3',
    promptText:
      'Create a song that blends modern R&B, pop, and trap styles, with a confident and bold emotional vibe, perfect for clubs, parties, or workout sessions. The female lead vocalist should have a bright and agile voice, with pitch correction (Auto-Tune) and melisma, accompanied by rich harmonies.',
    isNew: true,
  },
  {
    id: '2',
    genre: 'POP',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/pop.mp3',
    promptText:
      'This song blends EDM, Pop-Dance, and Progressive House styles, creating an uplifting, anthemic, and emotionally charged track perfect for a night out, a music festival, or even a high-energy workout. The lyrics are designed to evoke feelings of hope, yearning, and strength, with a male vocalist delivering a melodic, smooth, and emotionally rich performance.',
  },
  {
    id: '3',
    genre: 'Jazz',
    coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/jazz.mp3',
    promptText:
      'Create a vocal jazz and swing song with joyful, romantic, and lighthearted vibes, perfect for a lively jazz club or romantic evening. The female lead vocalist should have a clear, bright voice with a playful, scat-influenced style. The arrangement includes piano and upright bass for a warm, jazz feel.',
  },
  {
    id: '4',
    genre: 'Country',
    coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/country.mp3',
    promptText:
      "Create a folk-style song with warm, nostalgic emotions, perfect for New Year's Eve or farewell gatherings. The female lead has a clear, gentle voice, with simple guitar accompaniment.",
  },
  {
    id: '5',
    genre: 'Blues',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/blues.mp3',
    promptText:
      'Create a lively and upbeat Jump Blues/Early Rock and Roll song, perfect for dancing and retro parties. The female lead has a bright, playful voice. The arrangement includes piano, drums, bass, saxophone, and guitar, with a BPM of 98.',
  },
  {
    id: '6',
    genre: 'Hip-Hop',
    coverImage: 'https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/hiphop.mp3',
    promptText:
      'Create a hard-hitting hip-hop track with heavy 808 bass, punchy drums, and aggressive synth stabs. The male rapper delivers confident, rapid-fire verses with an assertive flow. Perfect for workout playlists, sports highlights, or high-energy content.',
  },
  {
    id: '7',
    genre: 'Electronic',
    coverImage: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/electronic.mp3',
    promptText:
      'Create an energetic electronic dance track with pulsing synthesizers, driving four-on-the-floor beats, and atmospheric pads. Build tension with rising arpeggios before dropping into a euphoric chorus. Perfect for clubs, festivals, and high-energy content.',
  },
  {
    id: '8',
    genre: 'Classical',
    coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    audioUrl: '/audio/samples/classical.mp3',
    promptText:
      'Compose a classical orchestral piece with a graceful, cinematic build: a delicate string-and-piano introduction, warm woodwinds, then a triumphant full-orchestra swell. Keep it elegant, emotional, and timeless.',
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
          alt={`Royalty-free ${sample.genre} music sample cover`}
          className={
            `
              w-full h-full object-cover
              transition-all duration-500 ease-out
              ${isHovered ? 'scale-110 brightness-75' : 'scale-100 brightness-100'}
            `
          }
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
  onSampleSelect?: (sample: MusicSample | null) => void;
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
  const activeSampleIdRef = useRef<string | null>(null);

  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeOutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoplayToastShownRef = useRef(false);

  const clearPreviewTimers = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (fadeInIntervalRef.current) {
      clearInterval(fadeInIntervalRef.current);
      fadeInIntervalRef.current = null;
    }
    if (fadeOutIntervalRef.current) {
      clearInterval(fadeOutIntervalRef.current);
      fadeOutIntervalRef.current = null;
    }
  }, []);

  // Initialize audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0;
    audio.muted = false;
    // @ts-expect-error - playsInline exists on HTMLMediaElement in many browsers
    audio.playsInline = true;

    audioRef.current = audio;

    return () => {
      clearPreviewTimers();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [clearPreviewTimers]);

  const selectedSample = selectedSampleId 
    ? musicSamples.find(s => s.id === selectedSampleId) || internalSelectedSample
    : internalSelectedSample;

  const handleHover = useCallback(
    (sample: MusicSample | null) => {
      // Prevent any in-flight fade-out from muting/pausing the next hover preview
      clearPreviewTimers();

      activeSampleIdRef.current = sample?.id ?? null;

      if (sample) {
        setHoveredSample(sample);

        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.src = sample.audioUrl;
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = false;
        audio.load();

        audio
          .play()
          .then(() => {
            if (activeSampleIdRef.current !== sample.id) return;

            setIsPlaying(true);

            const target = 0.5;
            let vol = 0;

            fadeInIntervalRef.current = setInterval(() => {
              const a = audioRef.current;
              if (!a || activeSampleIdRef.current !== sample.id) {
                if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
                fadeInIntervalRef.current = null;
                return;
              }

              vol = Math.min(target, vol + 0.1);
              a.volume = vol;

              if (vol >= target) {
                if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
                fadeInIntervalRef.current = null;
              }
            }, 25);
          })
          .catch((e) => {
            if (activeSampleIdRef.current !== sample.id) return;

            if (!autoplayToastShownRef.current) {
              autoplayToastShownRef.current = true;
              toast('Enable audio previews', {
                description: 'Click anywhere once, then hover a sample to preview audio.',
                duration: 4000,
              });
            }
            console.log('Audio play failed:', e);
            setIsPlaying(false);
          });

        return;
      }

      // Small delay so moving between cards doesn’t cut the audio out
      setHoveredSample(null);

      stopTimeoutRef.current = setTimeout(() => {
        if (activeSampleIdRef.current) return;

        const audio = audioRef.current;
        if (!audio || audio.paused || !audio.src) {
          setIsPlaying(false);
          return;
        }

        let vol = audio.volume;

        fadeOutIntervalRef.current = setInterval(() => {
          const a = audioRef.current;
          if (!a || activeSampleIdRef.current) {
            if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
            fadeOutIntervalRef.current = null;
            return;
          }

          vol = Math.max(0, vol - 0.1);
          a.volume = vol;

          if (vol <= 0.001) {
            a.pause();
            setIsPlaying(false);

            if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
            fadeOutIntervalRef.current = null;
          }
        }, 25);
      }, 120);
    },
    [clearPreviewTimers]
  );

  const handleSelect = useCallback((sample: MusicSample) => {
    const isCurrentlySelected = internalSelectedSample?.id === sample.id || selectedSampleId === sample.id;
    const newSelection = isCurrentlySelected ? null : sample;
    setInternalSelectedSample(newSelection);
    onSampleSelect?.(newSelection);
  }, [internalSelectedSample, selectedSampleId, onSampleSelect]);

  if (!isVisible) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Samples</h2>
          <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
            {musicSamples.length} styles
          </span>
        </div>
        
        <button className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
          View All
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
