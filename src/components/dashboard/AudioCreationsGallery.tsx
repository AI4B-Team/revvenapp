import { useEffect, useState } from 'react';
import { 
  Play, Pause, Bookmark, Heart, Download, Edit, 
  Share2, Trash2, MoreVertical, Mic, Clock, Loader2, Copy, FileText, RefreshCw, Info
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AudioDetailsModal from './AudioDetailsModal';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  type: string;
  prompt?: string;
  created_at?: string;
}

interface AudioItem {
  id: string;
  name: string;
  duration: number;
  url: string;
  type: string;
  created_at: string;
  cloudinary_public_id?: string | null;
  user_id?: string;
  status?: string;
  prompt?: string;
}

interface AudioCreationsGalleryProps {
  columnsPerRow?: number;
  onTrackSelect?: (track: AudioTrack, index: number, allTracks: AudioTrack[]) => void;
  onPauseToggle?: () => void;
  currentPlayingId?: string | null;
  isAudioPlaying?: boolean;
}

const AudioCreationsGallery = ({ columnsPerRow = 4, onTrackSelect, onPauseToggle, currentPlayingId, isAudioPlaying = false }: AudioCreationsGalleryProps) => {
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState(new Set<string>());
  const [savedItems, setSavedItems] = useState(new Set<string>());
  const [isLoading, setIsLoading] = useState(true);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAudioItem, setSelectedAudioItem] = useState<AudioItem | null>(null);
  const { toast } = useToast();

  // Fetch user's audio from Supabase
  useEffect(() => {
    const fetchAudioContent = async () => {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', session.session.user.id)
        .not('type', 'in', '("uploaded","recorded","cloned","revoice_source")')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audio:', error);
      } else {
        setAudioItems(data || []);
      }
      setIsLoading(false);
    };

    fetchAudioContent();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('user_voices_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_voices'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as AudioItem;
            // Filter out uploaded/recorded/cloned/revoice_source types from realtime updates
            if (newItem.type !== 'uploaded' && newItem.type !== 'recorded' && newItem.type !== 'cloned' && newItem.type !== 'revoice_source') {
              setAudioItems(prev => [newItem, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setAudioItems(prev => prev.filter(item => item.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setAudioItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as AudioItem : item
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handlePlay = (item: AudioItem, index: number) => {
    // If this track is already playing and we have a pause toggle, use it
    if (currentPlayingId === item.id && isAudioPlaying && onPauseToggle) {
      onPauseToggle();
      return;
    }
    
    // Stop any currently playing audio in this component
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    setPlayingId(null);
    setAudioRef(null);
    
    // If onTrackSelect is provided, use the player bar instead
    if (onTrackSelect) {
      const completedItems = audioItems.filter(i => i.status !== 'processing' && i.status !== 'error');
      const tracks: AudioTrack[] = completedItems.map(i => ({
        id: i.id,
        name: i.name,
        url: i.url,
        duration: i.duration,
        type: i.type,
        prompt: i.prompt,
        created_at: i.created_at
      }));
      const trackIndex = completedItems.findIndex(i => i.id === item.id);
      
      // If it's the same track that's paused, resume it
      if (currentPlayingId === item.id && !isAudioPlaying) {
        onPauseToggle?.();
      } else {
        onTrackSelect(tracks[trackIndex], trackIndex, tracks);
      }
    } else {
      // Fallback to inline playback
      if (playingId === item.id) {
        setPlayingId(null);
      } else {
        const audio = new Audio(item.url);
        audio.onended = () => {
          setPlayingId(null);
          setAudioRef(null);
        };
        audio.onerror = () => {
          toast({
            title: "Playback error",
            description: "Could not play this audio file",
            variant: "destructive",
          });
          setPlayingId(null);
          setAudioRef(null);
        };
        audio.play();
        setAudioRef(audio);
        setPlayingId(item.id);
      }
    }
  };

  const handleDelete = async (item: AudioItem) => {
    const { error } = await supabase
      .from('user_voices')
      .delete()
      .eq('id', item.id);

    if (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete this audio file",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Audio file removed successfully",
      });
    }
  };

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDownload = async (item: AudioItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name || 'audio'}.mp3`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (audioItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-4">
          <Mic className="h-8 w-8 text-brand-green" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No audio creations yet</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Generate voiceovers, clone voices, or record audio to see them here
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid gap-4"
      style={{ 
        gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))`
      }}
    >
      {audioItems.map((item) => (
        <div
          key={item.id}
          className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group"
        >
          {/* Waveform/Visual Area */}
          <div 
            className={`relative h-32 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 flex items-center justify-center ${
              item.status === 'processing' || item.status === 'error' ? '' : 'cursor-pointer'
            }`}
            onClick={() => {
              if (item.status !== 'processing' && item.status !== 'error') {
                const completedItems = audioItems.filter(i => i.status !== 'processing' && i.status !== 'error');
                const index = completedItems.findIndex(i => i.id === item.id);
                handlePlay(item, index);
              }
            }}
          >
            {/* Processing state */}
            {item.status === 'processing' ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
                <p className="text-sm text-muted-foreground">Generating...</p>
              </div>
            ) : item.status === 'error' ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <Mic className="h-8 w-8" />
                <p className="text-sm">Generation failed</p>
              </div>
            ) : (
              <>
                {/* NOW PLAYING badge */}
                {(currentPlayingId === item.id || playingId === item.id) && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-green rounded text-white text-xs font-medium animate-pulse z-10">
                    NOW PLAYING
                  </div>
                )}
                {/* Animated waveform visualization */}
                <div className="flex items-center gap-0.5 h-12">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const isCurrentTrack = currentPlayingId === item.id || playingId === item.id;
                    const shouldAnimate = isCurrentTrack && isAudioPlaying;
                    const baseHeight = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 30;
                    return (
                      <div 
                        key={i}
                        className={`w-1 rounded-full origin-bottom ${
                          shouldAnimate 
                            ? 'bg-brand-green animate-waveform' 
                            : isCurrentTrack
                              ? 'bg-brand-green/60'
                              : 'bg-brand-green/40'
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
                
                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <button className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    {(currentPlayingId === item.id && isAudioPlaying) || playingId === item.id ? (
                      <Pause className="h-5 w-5 text-brand-green" />
                    ) : (
                      <Play className="h-5 w-5 text-brand-green ml-0.5" />
                    )}
                  </button>
                </div>
              </>
            )}
            
            {/* Duration badge - only show for completed */}
            {item.status !== 'processing' && item.status !== 'error' && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs flex items-center gap-1">
                <Clock size={10} />
                {formatDuration(item.duration)}
              </div>
            )}
            
            {/* Status badge */}
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-white text-xs capitalize ${
              item.status === 'processing' ? 'bg-amber-500' : 
              item.status === 'error' ? 'bg-destructive' : 
              item.type === 'sound_effect' ? 'bg-brand-blue/80' :
              item.type === 'music' ? 'bg-purple-500/80' :
              item.type === 'recorded' ? 'bg-orange-500/80' :
              item.type === 'uploaded' ? 'bg-cyan-500/80' :
              item.type === 'transcription' ? 'bg-violet-500/80' :
              item.type === 'revoice' ? 'bg-rose-500/80' :
              'bg-brand-green/80'
            }`}>
              {item.status === 'processing' ? 'Processing' : 
               item.status === 'error' ? 'Error' : 
               item.type === 'sound_effect' ? 'Sound Effect' :
               item.type === 'music' ? 'Music' :
               item.type === 'voiceover' ? 'Voiceover' :
               item.type === 'recorded' ? 'Recorded' :
               item.type === 'uploaded' ? 'Uploaded' :
               item.type === 'transcription' ? 'Transcription' :
               item.type === 'revoice' ? 'Revoice' :
               item.type || 'Voiceover'}
            </div>
          </div>
          
          {/* Info Area */}
          <div className="p-3">
            {/* Row 1: Title */}
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            
            {/* Row 2: Date/time */}
            <p className="text-xs text-muted-foreground mt-1">
              {formatTimestamp(item.created_at)}
            </p>
            
            {/* Row 3: Icons */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {/* Copy Text button for transcriptions */}
              {item.type === 'transcription' && item.prompt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(item.prompt || '');
                          toast({
                            title: "Copied!",
                            description: "Transcribed text copied to clipboard",
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Copy size={14} className="text-violet-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Text</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Details button for transcription and music */}
              {(item.type === 'transcription' || item.type === 'music') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => {
                          setSelectedAudioItem(item);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Info size={14} className="text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Details</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toggleLike(item.id)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Heart 
                        size={14} 
                        className={likedItems.has(item.id) ? 'fill-brand-red text-brand-red' : 'text-muted-foreground'} 
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Like</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <RefreshCw size={14} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remix</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Download size={14} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <MoreVertical size={14} className="text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-border">
                    {item.type === 'transcription' && item.prompt && (
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(item.prompt || '');
                        toast({
                          title: "Copied!",
                          description: "Transcribed text copied to clipboard",
                        });
                      }}>
                        <FileText size={14} className="mr-2" />
                        Copy Full Text
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => toggleSave(item.id)}>
                      <Bookmark size={14} className="mr-2" />
                      {savedItems.has(item.id) ? 'Unsave' : 'Save'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 size={14} className="mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(item)}
                      className="text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
      
      {/* Audio Details Modal */}
      <AudioDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedAudioItem(null);
        }}
        audioItem={selectedAudioItem}
        onTitleUpdate={(id, newTitle) => {
          setAudioItems(prev => prev.map(item => 
            item.id === id ? { ...item, name: newTitle } : item
          ));
          if (selectedAudioItem?.id === id) {
            setSelectedAudioItem(prev => prev ? { ...prev, name: newTitle } : null);
          }
        }}
      />
    </div>
  );
};

export default AudioCreationsGallery;
