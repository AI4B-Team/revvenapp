import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play, Pause, SkipBack, SkipForward, Heart, Download, Share2,
  RefreshCw, Volume2, VolumeX, MoreVertical, Bookmark, Clock, Music,
  Pencil, Copy, Languages, Check, X, Loader2
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
];

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
  onTitleUpdate?: (id: string, newTitle: string) => void;
}

const AudioDetailsModal = ({ isOpen, onClose, audioItem, onTitleUpdate }: AudioDetailsModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | string>('original');
  const [translatedText, setTranslatedText] = useState<{ [key: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');
  const [syncedTimestamps, setSyncedTimestamps] = useState<{ type: string; lines: string[]; timestamp: number | null }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load saved translations from localStorage
  useEffect(() => {
    if (isOpen && audioItem) {
      const savedTranslations = localStorage.getItem(`translations_${audioItem.id}`);
      if (savedTranslations) {
        try {
          setTranslatedText(JSON.parse(savedTranslations));
        } catch (e) {
          console.error('Failed to parse saved translations:', e);
        }
      }
      setEditedTitle(audioItem.name);
    }
  }, [isOpen, audioItem]);

  // Save translations to localStorage whenever they change
  useEffect(() => {
    if (audioItem && Object.keys(translatedText).length > 0) {
      localStorage.setItem(`translations_${audioItem.id}`, JSON.stringify(translatedText));
    }
  }, [translatedText, audioItem]);

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setIsEditingTitle(false);
      setActiveTab('original');
      setSelectedLanguage(null);
      setTranslateOpen(false);
      setLanguageQuery('');
      // Don't clear translatedText - it's loaded from localStorage on open
    }
  }, [isOpen]);

  // Calculate lyrics timestamps based on song duration (first verse at start, outro at end)
  useEffect(() => {
    if (!isOpen || !audioItem || audioItem.type !== 'music' || !audioItem.prompt) {
      return;
    }
    
    const totalDuration = audioItem.duration || 180;
    const parsedSections = parseLyrics(audioItem.prompt);
    
    // Filter to get only actual song sections (skip title)
    const songSections = parsedSections.filter(s => 
      s.type && !s.type.includes('Song Title') && !s.type.includes('🎵')
    );
    
    if (songSections.length === 0) {
      setSyncedTimestamps([]);
      return;
    }
    
    // Distribute timestamps: first verse at ~5s, outro ends at song end
    const startOffset = 5; // Small offset for intro/instrumental
    const availableDuration = totalDuration - startOffset;
    const timePerSection = songSections.length > 1 
      ? availableDuration / (songSections.length - 1) 
      : availableDuration;
    
    const timestampedSections = parsedSections.map((section, index) => {
      // Title section gets 0
      if (section.type.includes('Song Title') || section.type.includes('🎵')) {
        return { ...section, timestamp: 0 };
      }
      
      // Find this section's index among song sections
      const songIndex = songSections.findIndex(s => s.type === section.type && s.lines.join() === section.lines.join());
      const timestamp = songIndex >= 0 
        ? startOffset + (songIndex * timePerSection)
        : null;
      
      return { ...section, timestamp: timestamp !== null ? Math.round(timestamp * 10) / 10 : null };
    });
    
    setSyncedTimestamps(timestampedSections);
  }, [isOpen, audioItem?.id, audioItem?.prompt, audioItem?.duration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleSaveTitle = async () => {
    if (!audioItem || !editedTitle.trim()) return;
    setIsSavingTitle(true);
    try {
      const { error } = await supabase
        .from('user_voices')
        .update({ name: editedTitle.trim() })
        .eq('id', audioItem.id);
      
      if (error) throw error;
      
      onTitleUpdate?.(audioItem.id, editedTitle.trim());
      setIsEditingTitle(false);
      toast({ title: "Title updated", description: "Audio title saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update title", variant: "destructive" });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = activeTab === 'original' 
      ? audioItem?.prompt 
      : translatedText[activeTab];
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({ title: "Copied", description: "Text copied to clipboard" });
    }
  };

  const handleTranslate = async (langCode: string, langName: string) => {
    if (!audioItem?.prompt) return;

    setTranslateOpen(false);
    setLanguageQuery('');

    if (translatedText[langCode]) {
      setSelectedLanguage(langCode);
      setActiveTab(langCode);
      return;
    }
    
    setIsTranslating(true);
    setSelectedLanguage(langCode);
    
    try {
      const response = await supabase.functions.invoke('translate-text', {
        body: {
          text: audioItem.prompt,
          targetLanguage: langName
        }
      });
      
      if (response.error) throw response.error;
      
      const translated = response.data?.translatedText || '';
      setTranslatedText(prev => ({ ...prev, [langCode]: translated }));
      setActiveTab(langCode);
    } catch (error) {
      toast({ title: "Translation failed", description: "Could not translate text", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

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

  // Parse lyrics with sections - handles format with section headers like "Verse 1", "Chorus", etc.
  const parseLyrics = (text: string) => {
    const sectionHeaders = [
      '🎵 Song Title:', 'Song Title:',
      'Verse 1', 'Verse 2', 'Verse 3',
      'Pre-Chorus', 'Chorus', 'Bridge',
      'Final Chorus', 'Outro', 'Intro'
    ];
    
    const sections: { type: string; lines: string[] }[] = [];
    let currentSection = { type: '', lines: [] as string[] };
    
    const lines = text.split('\n');
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check if this line is a section header
      const isHeader = sectionHeaders.some(header => 
        trimmedLine.toLowerCase().startsWith(header.toLowerCase()) ||
        (trimmedLine.startsWith('[') && trimmedLine.endsWith(']'))
      );
      
      if (isHeader) {
        // Save previous section if it has content
        if (currentSection.type || currentSection.lines.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: trimmedLine, lines: [] };
      } else if (trimmedLine) {
        // Add non-empty lines to current section
        currentSection.lines.push(trimmedLine);
      }
      // Empty lines are skipped but create natural spacing in render
    });
    
    // Don't forget the last section
    if (currentSection.type || currentSection.lines.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  if (!audioItem) return null;

  const isTranscription = audioItem.type === 'transcription';
  const isMusic = audioItem.type === 'music';
  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(languageQuery.trim().toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[85vh] bg-white text-foreground p-0 flex flex-col overflow-hidden">
        <audio
          ref={audioRef}
          src={audioItem.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
        
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Side - Audio Visual & Controls */}
          <div className="w-[45%] p-8 flex flex-col border-r border-gray-200 overflow-y-auto">
            {/* Cover Image or Waveform */}
            <div className="flex flex-col">
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
                <div className="flex items-center gap-2 mb-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-xl font-semibold h-9"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitle}
                        disabled={isSavingTitle}
                        className="p-1.5 rounded hover:bg-gray-100"
                      >
                        {isSavingTitle ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="text-green-600" />}
                      </button>
                      <button
                        onClick={() => { setIsEditingTitle(false); setEditedTitle(audioItem.name); }}
                        className="p-1.5 rounded hover:bg-gray-100"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900">{audioItem.name}</h3>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="p-1.5 rounded hover:bg-gray-100"
                      >
                        <Pencil size={14} className="text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
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
          <div className="w-[55%] flex flex-col min-h-0">
            <DialogHeader className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {isTranscription ? 'Transcript' : 'Lyrics'}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={handleCopyText} className="p-2 rounded-lg hover:bg-gray-100">
                          <Copy size={18} className="text-gray-600" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy text</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <DropdownMenu open={translateOpen} onOpenChange={(open) => {
                    setTranslateOpen(open);
                    if (open) setLanguageQuery('');
                  }}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Languages size={16} />
                        Translate
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white z-50 w-64">
                      <div className="p-2 border-b border-border">
                        <Input
                          value={languageQuery}
                          onChange={(e) => setLanguageQuery(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder="Search languages..."
                          className="h-9"
                        />
                      </div>
                      {filteredLanguages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => handleTranslate(lang.code, lang.name)}
                          className="cursor-pointer"
                        >
                          {lang.name}
                        </DropdownMenuItem>
                      ))}
                      {filteredLanguages.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No languages found</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Language Tabs */}
              {Object.keys(translatedText).length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'original' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Original
                  </button>
                  {Object.keys(translatedText).map((langCode) => (
                    <div key={langCode} className="relative group">
                      <button
                        onClick={() => setActiveTab(langCode)}
                        className={`px-3 py-1.5 pr-7 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          activeTab === langCode 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {LANGUAGES.find(l => l.code === langCode)?.name || langCode}
                        {isTranslating && selectedLanguage === langCode && <Loader2 size={14} className="animate-spin" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTranslations = { ...translatedText };
                          delete newTranslations[langCode];
                          setTranslatedText(newTranslations);
                          if (audioItem) {
                            if (Object.keys(newTranslations).length === 0) {
                              localStorage.removeItem(`translations_${audioItem.id}`);
                            } else {
                              localStorage.setItem(`translations_${audioItem.id}`, JSON.stringify(newTranslations));
                            }
                          }
                          if (activeTab === langCode) {
                            setActiveTab('original');
                          }
                          toast({ title: "Translation deleted" });
                        }}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/20 ${
                          activeTab === langCode ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </DialogHeader>
            
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
              {isTranslating && activeTab !== 'original' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                  <p className="text-gray-500">Translating...</p>
                </div>
              ) : (isTranscription || isMusic) && (activeTab === 'original' ? audioItem.prompt : translatedText[activeTab]) ? (
                <div className="space-y-4">
                  {isTranscription ? (
                    parseTranscript(activeTab === 'original' ? audioItem.prompt! : translatedText[activeTab]).map((segment, index) => (
                      <div key={index} className="flex gap-4 group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                        <span className="text-xs text-gray-900 font-mono w-12 flex-shrink-0 pt-0.5">
                          {segment.time}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{segment.text}</p>
                      </div>
                    ))
                  ) : (
                    (() => {
                      const formatTimestamp = (seconds: number) => {
                        const mins = Math.floor(seconds / 60);
                        const secs = Math.floor(seconds % 60);
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                      };
                      
                      // Use synced timestamps if available, otherwise fall back to parsed sections with estimates
                      const useSynced = syncedTimestamps.length > 0 && activeTab === 'original';
                      const parsedSections = parseLyrics(activeTab === 'original' ? audioItem.prompt! : translatedText[activeTab]);
                      
                      // For fallback estimation
                      const totalDuration = audioItem.duration || 180;
                      const sectionCount = parsedSections.filter(s => s.type).length || 1;
                      const timePerSection = sectionCount > 1 ? totalDuration / (sectionCount - 1) : totalDuration;
                      
                      let sectionIndex = 0;
                      const sectionsToRender = useSynced ? syncedTimestamps : parsedSections;
                      
                      return (
                        <>
                          {sectionsToRender.map((section, index) => {
                            // Use synced timestamp if available, otherwise estimate
                            const syncedSection = useSynced ? syncedTimestamps[index] : null;
                            const hasRealTimestamp = syncedSection && syncedSection.timestamp !== null && syncedSection.timestamp !== undefined;
                            const timestamp = hasRealTimestamp
                              ? syncedSection.timestamp!
                              : (section.type ? sectionIndex++ * timePerSection : 0);
                            
                            return (
                              <div key={index} className="mb-8">
                                {section.type && (
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                      hasRealTimestamp 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-gray-400 bg-gray-100'
                                    }`}>
                                      {formatTimestamp(timestamp)}
                                    </span>
                                    <p className="text-sm font-semibold text-gray-500">{section.type}</p>
                                  </div>
                                )}
                                <div className="space-y-2 pl-14">
                                  {section.lines.map((line, lineIndex) => {
                                    const trimmedLine = line.trim();
                                    const needsPeriod = trimmedLine && !/[.!?;:,]$/.test(trimmedLine);
                                    return (
                                      <p key={lineIndex} className="text-gray-700 leading-relaxed">
                                        {needsPeriod ? `${trimmedLine}.` : line}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Music className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {isTranscription ? 'No transcript available' : 'No lyrics available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioDetailsModal;
