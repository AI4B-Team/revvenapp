import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play, Pause, SkipBack, SkipForward, Heart, Download, Share2,
  RefreshCw, Volume2, VolumeX, MoreVertical, Bookmark, Clock, Music
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface AudioDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioItem: {
    id: string;
    name: string;
    url: string;
    duration: number;
    type: string;
    created_at: string;
    prompt?: string;
    cover_image_url?: string;
  } | null;
}

const AudioDetailsModal = ({ isOpen, onClose, audioItem }: AudioDetailsModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current || !audioItem) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    if (!audioItem) return;
    try {
      const response = await fetch(audioItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audioItem.name || 'audio'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Downloaded",
        description: "Audio file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download this audio file",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (audioItem?.url) {
      navigator.clipboard.writeText(audioItem.url);
      toast({
        title: "Link copied",
        description: "Audio link copied to clipboard",
      });
    }
  };

  // Parse transcript with timestamps
  const parseTranscript = (text: string) => {
    // Simple parsing - could be enhanced for actual timestamp format
    return text.split('\n').filter(line => line.trim()).map((line, index) => ({
      time: `${Math.floor(index * 3)}:${(index * 3 % 60).toString().padStart(2, '0')}`,
      text: line
    }));
  };

  // Parse lyrics with sections
  const parseLyrics = (text: string) => {
    const sections: { type: string; lines: string[] }[] = [];
    let currentSection = { type: '', lines: [] as string[] };
    
    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        if (currentSection.lines.length > 0 || currentSection.type) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: trimmedLine, lines: [] };
      } else {
        currentSection.lines.push(trimmedLine);
      }
    });
    
    if (currentSection.lines.length > 0 || currentSection.type) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  if (!audioItem) return null;

  const isTranscription = audioItem.type === 'transcription';
  const isMusic = audioItem.type === 'music';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] bg-white text-foreground p-0 overflow-hidden">
        <audio
          ref={audioRef}
          src={audioItem.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
        
        <div className="flex h-full">
          {/* Left Side - Audio Visual & Controls */}
          <div className="w-[45%] p-8 flex flex-col border-r border-gray-200">
            {/* Cover Image or Waveform */}
            <div className="flex-1 flex flex-col">
              <div className="relative aspect-square bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-xl overflow-hidden flex items-center justify-center mb-6">
                {isMusic && audioItem.cover_image_url ? (
                  <img 
                    src={audioItem.cover_image_url} 
                    alt={audioItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-0.5 h-24">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const baseHeight = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 30;
                      return (
                        <div 
                          key={i}
                          className={`w-1.5 rounded-full origin-bottom ${
                            isPlaying 
                              ? 'bg-brand-green animate-waveform' 
                              : 'bg-brand-green/50'
                          }`}
                          style={{ 
                            height: `${baseHeight}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.3 + (i % 5) * 0.1}s`
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                
                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-white text-xs flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(audioItem.duration)}
                </div>
              </div>
              
              {/* Title & Date */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{audioItem.name}</h3>
                <p className="text-sm text-gray-500">{formatTimestamp(audioItem.created_at)}</p>
              </div>
              
              {/* Action Icons */}
              <div className="flex items-center gap-2 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleDownload}
                        className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Download size={20} className="text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setIsSaved(!isSaved)}
                        className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Bookmark size={20} className={isSaved ? 'fill-brand-blue text-brand-blue' : 'text-gray-600'} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Save</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleShare}
                        className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Share2 size={20} className="text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Heart size={20} className={isLiked ? 'fill-brand-red text-brand-red' : 'text-gray-600'} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Like</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <RefreshCw size={20} className="text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remix</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX size={20} className="text-gray-600" />
                        ) : (
                          <Volume2 size={20} className="text-gray-600" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreVertical size={20} className="text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Player Controls */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-center gap-6 mb-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <SkipBack size={20} className="text-gray-600" />
                </button>
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white ml-0.5" />
                  )}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <SkipForward size={20} className="text-gray-600" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10 font-mono">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={audioItem.duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                  trackClassName="bg-gray-200 h-1"
                  rangeClassName="bg-gray-900"
                  thumbClassName="h-3 w-3 border-gray-900 bg-gray-900"
                />
                <span className="text-xs text-gray-500 w-10 font-mono">{formatTime(audioItem.duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Right Side - Transcript/Lyrics */}
          <div className="w-[55%] flex flex-col">
            <DialogHeader className="px-8 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {audioItem.name}
              </DialogTitle>
              {audioItem.prompt && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {isMusic ? 'Inspiration: ' : ''}{audioItem.prompt.slice(0, 100)}...
                </p>
              )}
            </DialogHeader>
            
            <ScrollArea className="flex-1 px-8 py-6">
              {isTranscription && audioItem.prompt ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Transcript
                  </h4>
                  {parseTranscript(audioItem.prompt).map((segment, index) => (
                    <div key={index} className="flex gap-4 group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                      <span className="text-xs text-brand-green font-mono w-12 flex-shrink-0 pt-0.5">
                        {segment.time}
                      </span>
                      <p className="text-gray-700 leading-relaxed">{segment.text}</p>
                    </div>
                  ))}
                </div>
              ) : isMusic && audioItem.prompt ? (
                <div className="space-y-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Lyrics
                  </h4>
                  {parseLyrics(audioItem.prompt).map((section, index) => (
                    <div key={index} className="mb-6">
                      {section.type && (
                        <p className="text-sm font-semibold text-gray-400 mb-2">{section.type}</p>
                      )}
                      {section.lines.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-700 leading-loose">{line}</p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Music className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {isTranscription ? 'No transcript available' : 'No lyrics available'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioDetailsModal;
