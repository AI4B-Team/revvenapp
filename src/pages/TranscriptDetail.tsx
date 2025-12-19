import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { 
  ArrowLeft, Play, Pause, FileText, Clock, Users, Globe,
  FileDown, Share2, ChevronDown, Copy, Edit3, Sparkles,
  Volume2, RotateCcw, TrendingUp, Zap, Languages, 
  MessageSquare, User, ChevronRight, Wand2, Download,
  Pencil, Trash2, Check, X, Search, Mic, Video, UserCircle, FileEdit, BookOpen,
  Star, MoreVertical, Upload, Loader2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Polish', 'Vietnamese', 'Thai', 'Indonesian',
  'Swedish', 'Bengali'
];

// Speaker color mapping
const SPEAKER_COLORS = [
  { color: 'bg-emerald-300', textColor: 'text-emerald-500', bgLight: 'bg-emerald-500/20' },
  { color: 'bg-blue-300', textColor: 'text-blue-500', bgLight: 'bg-blue-500/20' },
  { color: 'bg-purple-300', textColor: 'text-purple-500', bgLight: 'bg-purple-500/20' },
  { color: 'bg-orange-300', textColor: 'text-orange-500', bgLight: 'bg-orange-500/20' },
];

interface TranscriptLine {
  speaker: string;
  time: string;
  text: string;
  endTime?: string; // End time for the segment
}

// Parse transcript text into structured format
const parseTranscriptContent = (text: string, durationStr: string, speakerCount: number = 1): TranscriptLine[] => {
  if (!text) return [];
  
  // Split by sentences or paragraphs
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  
  // Parse duration to seconds
  const durationParts = durationStr.split(':').map(Number);
  const totalSeconds = durationParts.length === 3 
    ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
    : durationParts[0] * 60 + (durationParts[1] || 0);

  // Distribute timestamps proportionally by word count (much closer to real speech pacing)
  const wordsPerSentence = sentences.map(s => s.trim().split(/\s+/).filter(Boolean).length);
  const totalWords = wordsPerSentence.reduce((sum, w) => sum + w, 0) || 1;

  let wordCursor = 0;

  return sentences.map((sentence, index) => {
    const isLast = index === sentences.length - 1;
    const startSeconds = Math.floor((wordCursor / totalWords) * totalSeconds);

    wordCursor += wordsPerSentence[index] || 0;

    const rawEndSeconds = Math.floor((wordCursor / totalWords) * totalSeconds);
    const endSeconds = isLast
      ? totalSeconds
      : Math.min(totalSeconds, Math.max(startSeconds + 1, rawEndSeconds));

    const startMins = Math.floor(startSeconds / 60);
    const startSecs = startSeconds % 60;
    const endMins = Math.floor(endSeconds / 60);
    const endSecs = endSeconds % 60;

    // Distribute speakers across sentences
    const speakerNum = (index % speakerCount) + 1;
    return {
      speaker: `Speaker ${speakerNum}`,
      time: `${String(startMins).padStart(2, '0')}:${String(startSecs).padStart(2, '0')}`,
      endTime: `${String(endMins).padStart(2, '0')}:${String(endSecs).padStart(2, '0')}`,
      text: sentence.trim()
    };
  });
};

const TranscriptDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | 'txt' | 'srt' | 'vtt' | 'xml' | 'fcpxml' | 'audio'>('pdf');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [volume, setVolume] = useState(80);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Transcript content from database
  const [originalContent, setOriginalContent] = useState<TranscriptLine[]>([]);
  const [editedContent, setEditedContent] = useState<TranscriptLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [summaryTranslations, setSummaryTranslations] = useState<Record<string, string>>({});
  const [activeSummaryTab, setActiveSummaryTab] = useState<'original' | string>('original');
  const [selectedSummaryLang, setSelectedSummaryLang] = useState('Spanish');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isTranslatingSummary, setIsTranslatingSummary] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  // Prevent async translation finishing from overriding a user's manual summary tab click
  const summaryTabManuallySelectedRef = useRef(false);
  const activeSummaryTabRef = useRef(activeSummaryTab);
  useEffect(() => {
    activeSummaryTabRef.current = activeSummaryTab;
  }, [activeSummaryTab]);
  
  // AI Chat
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant'; content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Per-line transcript editing
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  
  // Translation
  const [showTranslatePopover, setShowTranslatePopover] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<TranscriptLine[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTranslationTab, setActiveTranslationTab] = useState<'original' | 'translated'>('original');
  
  // Speakers
  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [identifyingVoice, setIdentifyingVoice] = useState<number | null>(null);
  const [speakerNamesLoaded, setSpeakerNamesLoaded] = useState(false);
  
  // Attach audio state
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const attachAudioInputRef = useRef<HTMLInputElement>(null);
  
  // Progress bar dragging
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Get transcript data from URL params
  const title = searchParams.get('title') || 'Untitled Transcript';
  const duration = searchParams.get('duration') || '00:00';
  const speakers = parseInt(searchParams.get('speakers') || '1');
  const language = searchParams.get('language') || 'English';

  // Generate speaker data dynamically
  const speakerData = Array.from({ length: speakers }, (_, i) => ({
    id: i + 1,
    name: `Speaker ${i + 1}`,
    minutes: Math.floor(Math.random() * 10) + 5,
    ...SPEAKER_COLORS[i % SPEAKER_COLORS.length]
  }));
  
  const totalSpeakingMinutes = speakerData.reduce((sum, s) => sum + s.minutes, 0);

  // Audio URL: prefer URL params (when present), otherwise load from DB
  const audioUrlParam = searchParams.get('audioUrl');
  const initialAudioUrl = audioUrlParam && audioUrlParam !== '.' ? audioUrlParam : '';
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState(initialAudioUrl);

  // Parse time string (MM:SS) to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + (parts[1] || 0);
  };

  // Jump to specific time in audio
  const jumpToTime = (timeStr: string) => {
    if (!audioRef.current || !resolvedAudioUrl) {
      toast.error('No audio available to play');
      return;
    }
    const seconds = parseTimeToSeconds(timeStr);
    audioRef.current.currentTime = seconds;
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    toast.success(`Jumped to ${timeStr}`);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Render text with word-level highlighting (karaoke-style)
  const renderHighlightedText = (item: TranscriptLine, segmentIndex: number) => {
    if (!isPlaying) {
      return <span>{item.text}</span>;
    }

    const segmentStartTime = parseTimeToSeconds(item.time);
    const segmentEndTime = item.endTime ? parseTimeToSeconds(item.endTime) : segmentStartTime + 10;
    const segmentDuration = Math.max(0.001, segmentEndTime - segmentStartTime);

    // Only highlight while we're inside this segment
    if (currentTime < segmentStartTime || currentTime >= segmentEndTime) {
      return <span>{item.text}</span>;
    }

    const words = item.text.split(/\s+/).filter(Boolean);
    const totalWords = words.length || 1;

    const progressInSegment = (currentTime - segmentStartTime) / segmentDuration;
    const activeWordIndex = Math.min(totalWords - 1, Math.floor(progressInSegment * totalWords));

    return (
      <span>
        {words.map((word, wordIndex) => {
          const isPastWord = wordIndex < activeWordIndex;
          const isCurrentWord = wordIndex === activeWordIndex;

          return (
            <span key={wordIndex}>
              {isPastWord ? (
                <span className="bg-primary/25 text-foreground rounded-sm px-0.5 transition-colors duration-75">
                  {word}
                </span>
              ) : isCurrentWord ? (
                <span className="bg-primary/15 text-foreground rounded-sm px-0.5 transition-colors duration-75">
                  {word}
                </span>
              ) : (
                <span>{word}</span>
              )}
              {wordIndex < totalWords - 1 && ' '}
            </span>
          );
        })}
      </span>
    );
  };

  // Check if audio duration is valid
  const isValidDuration = (d: number) => isFinite(d) && !isNaN(d) && d > 0;
  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Smooth currentTime updates for karaoke highlighting (timeupdate is low-frequency)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isPlaying) return;

    let rafId = 0;
    const tick = () => {
      setCurrentTime(audio.currentTime);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !resolvedAudioUrl) {
      toast.error('No audio available');
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle playback speed change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle seek (for click and drag)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;
    const rect = progressBarRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle drag start on progress bar
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleSeek(e);
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !audioRef.current || !audioDuration || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * audioDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, audioDuration]);

  // Generate AI summary
  const generateAISummary = async (transcriptText: string) => {
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { transcript: transcriptText }
      });
      
      if (error) throw error;
      if (data?.summary) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Translate AI summary
  const translateSummary = async (targetLanguage: string) => {
    if (!aiSummary) {
      toast.error('No summary to translate');
      return;
    }
    
    setIsTranslatingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { action: 'translate', text: aiSummary, targetLanguage }
      });
      
      if (error) throw error;
      if (data?.translatedText) {
        setSummaryTranslations(prev => ({ ...prev, [targetLanguage]: data.translatedText }));
        setActiveSummaryTab(targetLanguage);
        // Save to localStorage
        if (id) {
          const currentTranslations = { ...summaryTranslations, [targetLanguage]: data.translatedText };
          localStorage.setItem(`summary-translations-${id}`, JSON.stringify(currentTranslations));
        }
        toast.success(`Summary translated to ${targetLanguage}`);
      }
    } catch (error) {
      console.error('Error translating summary:', error);
      toast.error('Failed to translate summary');
    } finally {
      setIsTranslatingSummary(false);
    }
  };

  // Remove a summary translation
  const handleRemoveSummaryTranslation = (lang: string) => {
    const newTranslations = { ...summaryTranslations };
    delete newTranslations[lang];
    setSummaryTranslations(newTranslations);
    if (activeSummaryTab === lang) {
      setActiveSummaryTab('original');
    }
    if (id) {
      localStorage.setItem(`summary-translations-${id}`, JSON.stringify(newTranslations));
    }
  };

  // Chat about transcript
  const sendChatMessage = async (question: string) => {
    if (!question.trim() || isChatLoading) return;
    
    const transcriptText = originalContent.map(c => c.text).join(' ');
    if (!transcriptText) {
      toast.error('No transcript loaded');
      return;
    }

    const userMessage = { role: 'user' as const, content: question };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { 
          action: 'chat', 
          question, 
          transcript: transcriptText,
          chatHistory: chatMessages
        }
      });

      if (error) throw error;
      if (data?.answer) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch (error) {
      console.error('Error chatting:', error);
      toast.error('Failed to get response');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Load transcript from database
  useEffect(() => {
    const loadTranscript = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_voices')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;

        // Backfill audio URL from DB if it wasn't present in the URL
        if (data?.url && !resolvedAudioUrl) {
          setResolvedAudioUrl(data.url);
        }
        
        if (data?.prompt) {
          const parsedContent = parseTranscriptContent(data.prompt, duration, speakers);
          setOriginalContent(parsedContent);
          setEditedContent(parsedContent);
          
          // Generate AI summary from the transcript
          generateAISummary(data.prompt);
        }
      } catch (error) {
        console.error('Error loading transcript:', error);
        toast.error('Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [id, duration, speakers]);

  // Apply saved speaker names to content on initial load
  const applySpeakerNamesToContent = (names: Record<number, string>, content: TranscriptLine[]) => {
    return content.map(line => {
      const match = line.speaker.match(/Speaker (\d+)/);
      if (match) {
        const speakerNum = parseInt(match[1]);
        const customName = names[speakerNum];
        if (customName && customName !== `Speaker ${speakerNum}`) {
          return { ...line, speaker: customName };
        }
      }
      return line;
    });
  };

  // Load speaker names and apply to content after initial load
  useEffect(() => {
    if (id && editedContent.length > 0 && !isLoading && !speakerNamesLoaded) {
      const savedNames = localStorage.getItem(`speaker-names-${id}`);
      if (savedNames) {
        const names = JSON.parse(savedNames);
        setSpeakerNames(names);
        setEditedContent(prev => applySpeakerNamesToContent(names, prev));
      }
      setSpeakerNamesLoaded(true);
    }
  }, [id, isLoading, editedContent.length, speakerNamesLoaded]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Handle attaching audio file to this transcript
  const handleAttachAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploadingAudio(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Audio = await base64Promise;

      // Upload to Cloudinary
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-audio', {
        body: {
          audioData: base64Audio,
          filename: file.name,
          contentType: file.type,
        },
      });

      if (uploadError) throw uploadError;
      if (!uploadData?.url) throw new Error('Upload did not return a URL');

      // Update the database record
      const { error: updateError } = await supabase
        .from('user_voices')
        .update({ url: uploadData.url })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state so the player appears
      setResolvedAudioUrl(uploadData.url);
      toast.success('Audio attached successfully!');
    } catch (err) {
      console.error('Error attaching audio:', err);
      toast.error('Failed to attach audio');
    } finally {
      setIsUploadingAudio(false);
      // Reset input so user can re-select the same file if needed
      if (attachAudioInputRef.current) {
        attachAudioInputRef.current.value = '';
      }
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`);
    setShowExportMenu(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://app.transcribe.com/transcript/share/${searchParams.get('id') || '1'}`);
    toast.success('Link copied to clipboard!');
    setShowShareModal(false);
  };

  const handleCopy = () => {
    const fullTranscript = displayContent.map(c => `[${c.time}] ${c.speaker}: ${c.text}`).join('\n\n');
    navigator.clipboard.writeText(fullTranscript);
    toast.success('Full transcript copied to clipboard!');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      toast.success('Transcript deleted');
      navigate('/transcribe');
    }
  };

  const handleCreate = (contentType: 'video' | 'ugc' | 'post' | 'ebook') => {
    // Compile all transcript content
    const transcriptText = editedContent
      .map(item => item.text)
      .join('\n\n');
    
    // Map content types to modes
    const modeMap = {
      video: { targetMode: 'Video', targetAnimateMode: 'Avatar Video' },
      ugc: { targetMode: 'Video', targetAnimateMode: 'UGC Video' },
      post: { targetMode: 'Content', targetAnimateMode: 'Social Post' },
      ebook: { targetMode: 'Content', targetAnimateMode: 'Ebook' }
    };
    
    const { targetMode, targetAnimateMode } = modeMap[contentType];
    
    // Navigate to Create page with the transcript text
    navigate('/create', { 
      state: { 
        transcriptText,
        transcriptTitle: editedTitle,
        targetMode,
        targetAnimateMode
      } 
    });
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = () => {
    const content = displayContent;
    const fileName = editedTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    let fileContent = '';
    let mimeType = 'text/plain';
    let extension = 'txt';
    
    switch (downloadFormat) {
      case 'txt':
        fileContent = content.map(item => {
          let line = '';
          if (includeTimestamps) line += `[${item.time}] `;
          line += `${item.speaker}: ${item.text}`;
          return line;
        }).join('\n\n');
        if (includeSummary && aiSummary) {
          fileContent = `SUMMARY:\n${aiSummary}\n\n---\n\nTRANSCRIPT:\n\n${fileContent}`;
        }
        extension = 'txt';
        mimeType = 'text/plain';
        break;
        
      case 'srt':
        fileContent = content.map((item, index) => {
          const startSeconds = parseTimeToSeconds(item.time);
          const endSeconds = startSeconds + 5; // Assume 5 seconds per segment
          const formatSrtTime = (s: number) => {
            const hrs = Math.floor(s / 3600);
            const mins = Math.floor((s % 3600) / 60);
            const secs = Math.floor(s % 60);
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},000`;
          };
          return `${index + 1}\n${formatSrtTime(startSeconds)} --> ${formatSrtTime(endSeconds)}\n${item.text}`;
        }).join('\n\n');
        extension = 'srt';
        mimeType = 'text/plain';
        break;
        
      case 'vtt':
        fileContent = 'WEBVTT\n\n' + content.map((item, index) => {
          const startSeconds = parseTimeToSeconds(item.time);
          const endSeconds = startSeconds + 5;
          const formatVttTime = (s: number) => {
            const hrs = Math.floor(s / 3600);
            const mins = Math.floor((s % 3600) / 60);
            const secs = Math.floor(s % 60);
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.000`;
          };
          return `${index + 1}\n${formatVttTime(startSeconds)} --> ${formatVttTime(endSeconds)}\n${item.text}`;
        }).join('\n\n');
        extension = 'vtt';
        mimeType = 'text/vtt';
        break;
        
      case 'pdf':
        // Create a printable HTML and trigger print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${editedTitle}</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                h1 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
                .summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                .summary h2 { color: #059669; margin-top: 0; }
                .line { margin-bottom: 15px; padding: 10px; background: #f9fafb; border-radius: 4px; }
                .time { color: #10b981; font-family: monospace; font-size: 12px; }
                .speaker { color: #6b7280; font-size: 14px; }
                .text { color: #111827; margin-top: 5px; }
              </style>
            </head>
            <body>
              <h1>${editedTitle}</h1>
              ${includeSummary && aiSummary ? `<div class="summary"><h2>Summary</h2><p>${aiSummary}</p></div>` : ''}
              <h2>Transcript</h2>
              ${content.map(item => `
                <div class="line">
                  ${includeTimestamps ? `<span class="time">[${item.time}]</span>` : ''}
                  <span class="speaker">${item.speaker}</span>
                  <p class="text">${item.text}</p>
                </div>
              `).join('')}
            </body>
            </html>
          `;
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
        setShowDownloadModal(false);
        toast.success('PDF print dialog opened');
        return;
        
      case 'docx':
        // Create RTF-like content that Word can open
        fileContent = `${editedTitle}\n${'='.repeat(editedTitle.length)}\n\n`;
        if (includeSummary && aiSummary) {
          fileContent += `SUMMARY\n${'-'.repeat(7)}\n${aiSummary}\n\n`;
        }
        fileContent += `TRANSCRIPT\n${'-'.repeat(10)}\n\n`;
        fileContent += content.map(item => {
          let line = '';
          if (includeTimestamps) line += `[${item.time}] `;
          line += `${item.speaker}: ${item.text}`;
          return line;
        }).join('\n\n');
        extension = 'doc';
        mimeType = 'application/msword';
        break;
        
      case 'xml':
        // Premiere Pro compatible XML
        fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <sequence>
    <name>${editedTitle}</name>
    <media>
      <video>
        <track>
${content.map((item, index) => {
  const startSeconds = parseTimeToSeconds(item.time);
  return `          <clipitem id="${index + 1}">
            <name>${item.speaker}</name>
            <start>${Math.floor(startSeconds * 30)}</start>
            <end>${Math.floor((startSeconds + 5) * 30)}</end>
            <marker>
              <comment>${item.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</comment>
            </marker>
          </clipitem>`;
}).join('\n')}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;
        extension = 'xml';
        mimeType = 'application/xml';
        break;
        
      case 'fcpxml':
        // Final Cut Pro X compatible XML
        fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="100/3000s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="${editedTitle}">
      <project name="${editedTitle}">
        <sequence format="r1">
          <spine>
${content.map((item, index) => {
  const startSeconds = parseTimeToSeconds(item.time);
  return `            <title ref="r${index + 2}" offset="${startSeconds}s" duration="5s" name="${item.speaker}">
              <text>${item.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
            </title>`;
}).join('\n')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
        extension = 'fcpxml';
        mimeType = 'application/xml';
        break;
        
      case 'audio':
        // Download the audio file directly
        if (resolvedAudioUrl) {
          const link = document.createElement('a');
          link.href = resolvedAudioUrl;
          link.download = `${fileName}.mp3`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setShowDownloadModal(false);
          toast.success('Audio download started');
          return;
        } else {
          toast.error('No audio file available');
          return;
        }
        
      default:
        fileContent = content.map(item => `[${item.time}] ${item.speaker}: ${item.text}`).join('\n\n');
    }
    
    // Create and download the file
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowDownloadModal(false);
    toast.success(`Downloaded as ${extension.toUpperCase()}`);
  };

  const handleSaveLine = async (index: number) => {
    if (!id) {
      setEditingLineIndex(null);
      toast.success('Line saved locally');
      return;
    }
    
    setIsSavingTranscript(true);
    try {
      // Compile all edited content back to a single string
      const updatedTranscript = editedContent.map(item => item.text).join(' ');
      
      const { error } = await supabase
        .from('user_voices')
        .update({ prompt: updatedTranscript })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update original content to match edited content
      setOriginalContent([...editedContent]);
      setEditingLineIndex(null);
      toast.success('Transcript saved');
    } catch (error) {
      console.error('Error saving transcript:', error);
      toast.error('Failed to save transcript');
    } finally {
      setIsSavingTranscript(false);
    }
  };

  const handleCancelLineEdit = (index: number) => {
    // Reset the line to original content
    const newContent = [...editedContent];
    newContent[index] = { ...originalContent[index] };
    setEditedContent(newContent);
    setEditingLineIndex(null);
  };

  const handleSaveTitle = async () => {
    if (!id) {
      setIsEditingTitle(false);
      toast.success('Title updated locally');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_voices')
        .update({ name: editedTitle })
        .eq('id', id);
      
      if (error) throw error;
      
      setIsEditingTitle(false);
      toast.success('Title saved');
    } catch (error) {
      console.error('Error saving title:', error);
      toast.error('Failed to save title');
    }
  };

  const handleCancelTitleEdit = () => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  };

  // Load saved translations from localStorage on mount
  useEffect(() => {
    if (id) {
      // Load transcript translation
      const savedTranslation = localStorage.getItem(`transcript-translation-${id}`);
      if (savedTranslation) {
        try {
          const parsed = JSON.parse(savedTranslation);
          setSelectedTranslation(parsed.language);
          setTranslatedContent(parsed.content);
        } catch (e) {
          console.error('Failed to parse saved translation:', e);
        }
      }
      
      // Load summary translations
      const savedSummaryTranslations = localStorage.getItem(`summary-translations-${id}`);
      if (savedSummaryTranslations) {
        try {
          const parsed = JSON.parse(savedSummaryTranslations);
          setSummaryTranslations(parsed);
        } catch (e) {
          console.error('Failed to parse saved summary translations:', e);
        }
      }
    }
  }, [id]);

  const handleTranslate = async (targetLanguage: string) => {
    setIsTranslating(true);
    setSelectedTranslation(targetLanguage);
    setShowTranslatePopover(false);

    // Track whether the user manually clicks summary tabs while translation is running
    summaryTabManuallySelectedRef.current = false;
    const summaryTabAtStart = activeSummaryTabRef.current;

    try {
      // Translate the transcript content
      const translatedItems = await Promise.all(
        originalContent.map(async (item) => {
          const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
            body: { action: 'translate', text: item.text, targetLanguage }
          });

          if (error) throw error;
          return { ...item, text: data.translatedText || item.text };
        })
      );

      setTranslatedContent(translatedItems);
      setActiveTranslationTab('translated'); // Auto-switch to translated tab

      // Also translate the summary if it exists and hasn't been translated to this language yet
      if (aiSummary && !summaryTranslations[targetLanguage]) {
        setIsTranslatingSummary(true);
        try {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-transcript-summary', {
            body: { action: 'translate', text: aiSummary, targetLanguage }
          });

          if (!summaryError && summaryData?.translatedText) {
            const updatedTranslations = { ...summaryTranslations, [targetLanguage]: summaryData.translatedText };
            setSummaryTranslations(updatedTranslations);

            // Only auto-switch summary tab if the user hasn't manually changed it mid-translation.
            // Never override 'original' if that's what they were on.
            if (!summaryTabManuallySelectedRef.current && summaryTabAtStart !== 'original') {
              setActiveSummaryTab(targetLanguage);
            }

            // Save to localStorage
            if (id) {
              localStorage.setItem(`summary-translations-${id}`, JSON.stringify(updatedTranslations));
            }
          }
        } catch (summaryTranslateError) {
          console.error('Summary translation error:', summaryTranslateError);
        } finally {
          setIsTranslatingSummary(false);
        }
      } else if (aiSummary && summaryTranslations[targetLanguage]) {
        // Summary already translated; only auto-switch if user didn't click and they weren't on original
        if (!summaryTabManuallySelectedRef.current && summaryTabAtStart !== 'original') {
          setActiveSummaryTab(targetLanguage);
        }
      }

      // Save translation to localStorage
      if (id) {
        localStorage.setItem(`transcript-translation-${id}`, JSON.stringify({
          language: targetLanguage,
          content: translatedItems
        }));
      }

      toast.success(`Translated to ${targetLanguage}`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
      setSelectedTranslation(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRemoveTranslation = () => {
    setSelectedTranslation(null);
    setTranslatedContent(null);
    setActiveTranslationTab('original');
    // Remove from localStorage
    if (id) {
      localStorage.removeItem(`transcript-translation-${id}`);
    }
  };

  const handleSpeakerNameChange = (speakerId: number, newName: string) => {
    const updatedNames = { ...speakerNames, [speakerId]: newName };
    setSpeakerNames(updatedNames);
    
    // Save to localStorage
    if (id) {
      localStorage.setItem(`speaker-names-${id}`, JSON.stringify(updatedNames));
    }
    
    // Update content with new speaker name
    const oldSpeakerName = speakerNames[speakerId] || `Speaker ${speakerId}`;
    setEditedContent(prev => prev.map(line => {
      if (line.speaker === oldSpeakerName || line.speaker === `Speaker ${speakerId}`) {
        return { ...line, speaker: newName || `Speaker ${speakerId}` };
      }
      return line;
    }));
  };

  const handleIdentifyVoice = (speakerId: number) => {
    setIdentifyingVoice(speakerId);
    // Simulate voice identification - in a real app this would use audio analysis
    setTimeout(() => {
      setIdentifyingVoice(null);
      // Auto-assign a placeholder name based on voice characteristics
      const suggestedName = `Voice ${speakerId}`;
      handleSpeakerNameChange(speakerId, suggestedName);
      toast.success(`Voice identified and labeled as "${suggestedName}"`);
    }, 2000);
  };

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const displayContent = (selectedTranslation && translatedContent && activeTranslationTab === 'translated') 
    ? translatedContent 
    : editedContent;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white pb-32">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/transcribe')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back To Transcripts</span>
            </button>

            {/* Header */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-2xl font-bold h-10 w-96"
                          autoFocus
                        />
                        <button onClick={handleSaveTitle} className="p-1.5 rounded-lg hover:bg-gray-100 text-emerald-500">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={handleCancelTitleEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="pr-4">
                        <h1 className="text-2xl font-bold text-gray-900 break-words inline">
                          {editedTitle}
                        </h1>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => setIsEditingTitle(true)}
                                className="p-1 ml-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors inline-flex align-middle"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Rename</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {speakers} {speakers === 1 ? 'Speaker' : 'Speakers'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {language}
                    </span>
                  </div>
                  {/* Translation tabs */}
                  {selectedTranslation && (
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => setActiveTranslationTab('original')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          activeTranslationTab === 'original'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Original
                      </button>
                      <button 
                        onClick={() => setActiveTranslationTab('translated')}
                        className={`px-3 py-1.5 rounded-l-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
                          activeTranslationTab === 'translated'
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        <Languages className="w-3.5 h-3.5" />
                        {selectedTranslation}
                      </button>
                      <button 
                        onClick={handleRemoveTranslation}
                        className={`px-2 py-1.5 rounded-r-full transition-colors ${
                          activeTranslationTab === 'translated'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <TooltipProvider>
                  {/* Create Dropdown Button */}
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
                          >
                            <Wand2 className="w-4 h-4" />
                            Create
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Create Content</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                      <DropdownMenuItem onClick={() => handleCreate('video')} className="flex items-center gap-2 cursor-pointer">
                        <Video className="w-4 h-4" />
                        Video
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreate('ugc')} className="flex items-center gap-2 cursor-pointer">
                        <UserCircle className="w-4 h-4" />
                        UGC
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreate('post')} className="flex items-center gap-2 cursor-pointer">
                        <FileEdit className="w-4 h-4" />
                        Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreate('ebook')} className="flex items-center gap-2 cursor-pointer">
                        <BookOpen className="w-4 h-4" />
                        Ebook
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Download Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleDownload}
                        className="px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>

                  {/* Translate Button */}
                  <Popover open={showTranslatePopover} onOpenChange={setShowTranslatePopover}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button 
                            className="px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <Languages className="w-4 h-4" />
                            Translate
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Translate</TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-64 p-0 bg-white" align="end">
                        <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search Languages..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredLanguages.map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleTranslate(lang)}
                            disabled={isTranslating}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Copy Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleCopy}
                        className="p-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Transcript</TooltipContent>
                  </Tooltip>

                  {/* Share Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleShare}
                        className="p-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>

                  {/* Delete Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Tabs - Centered */}
            <div className="flex items-center justify-center gap-1 mb-6 border-b border-gray-300 pb-4">
              {[
                { id: 'transcript', label: 'Transcript', icon: FileText },
                { id: 'summary', label: 'Summary', icon: Sparkles },
                { id: 'speakers', label: 'Speakers', icon: Users },
                { id: 'chat', label: 'AI Chat', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-emerald-500/10 text-emerald-600' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
              {activeTab === 'transcript' && (
                <div className="space-y-3">
                  {isTranslating && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                      <span className="ml-3 text-gray-500">Translating...</span>
                    </div>
                  )}
                  {!isTranslating && displayContent.map((item, i) => (
                    <div 
                      key={i} 
                      className="group flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => jumpToTime(item.time)}
                    >
                      <div className="flex-shrink-0 w-20">
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">{item.speaker}</p>
                        {editingLineIndex === i ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editedContent[i].text}
                              onChange={(e) => {
                                const newContent = [...editedContent];
                                newContent[i] = { ...newContent[i], text: e.target.value };
                                setEditedContent(newContent);
                              }}
                              className="w-full p-2 rounded-lg border border-gray-300 text-gray-900 leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleSaveLine(i)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button 
                                onClick={() => handleCancelLineEdit(i)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-900 leading-relaxed">{renderHighlightedText(item, i)}</p>
                        )}
                      </div>
                      {editingLineIndex !== i && (
                        <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(item.text);
                              toast.success('Line copied!');
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLineIndex(i);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="w-full">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-gray-900">AI Summary</h3>
                      </div>
                      {aiSummary && Object.keys(summaryTranslations).length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            onClick={() => {
                              summaryTabManuallySelectedRef.current = true;
                              setActiveSummaryTab('original');
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              activeSummaryTab === 'original' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Original
                          </button>
                          {Object.keys(summaryTranslations).map(lang => (
                            <div key={lang} className="flex items-center">
                              <button 
                                onClick={() => {
                                  summaryTabManuallySelectedRef.current = true;
                                  setActiveSummaryTab(lang);
                                }}
                                className={`px-3 py-1.5 rounded-l-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
                                  activeSummaryTab === lang ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                              >
                                <Languages className="w-3.5 h-3.5" />
                                {lang}
                              </button>
                              <button
                                onClick={() => handleRemoveSummaryTranslation(lang)}
                                className={`px-2 py-1.5 rounded-r-full text-sm font-medium transition-colors ${
                                  activeSummaryTab === lang ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {isGeneratingSummary ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        Generating summary with GPT-4o...
                      </div>
                    ) : isTranslatingSummary ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        Translating summary with GPT-4o...
                      </div>
                    ) : activeSummaryTab === 'original' ? (
                      aiSummary ? (
                        <p key="original-summary" className="text-gray-700 leading-relaxed mb-4">
                          {aiSummary}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">No summary available</p>
                      )
                    ) : summaryTranslations[activeSummaryTab] ? (
                      <p key={`translated-summary-${activeSummaryTab}`} className="text-gray-700 leading-relaxed mb-4">
                        {summaryTranslations[activeSummaryTab]}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No translation available</p>
                    )}
                    <button 
                      onClick={() => {
                        setActiveSummaryTab('original');
                        // Clear old translations when regenerating summary
                        setSummaryTranslations({});
                        if (id) {
                          localStorage.removeItem(`summary-translations-${id}`);
                        }
                        const transcriptText = originalContent.map(c => c.text).join(' ');
                        if (transcriptText) generateAISummary(transcriptText);
                      }}
                      disabled={isGeneratingSummary || isTranslatingSummary || originalContent.length === 0}
                      className="text-sm text-emerald-600 hover:text-emerald-500 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Regenerate Summary
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {['Mobile app testing phase completed', 'Launch campaign targeting January', '40% projected user engagement increase'].map((point, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {['Finalize Q1 resource allocation', 'Schedule follow-up meeting', 'Review marketing materials'].map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-4 h-4 rounded border border-amber-500/50 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-500" />
                      Translate Summary
                    </h4>
                    <div className="flex items-center gap-3">
                      <select 
                        value={selectedSummaryLang}
                        onChange={(e) => setSelectedSummaryLang(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-emerald-500"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => translateSummary(selectedSummaryLang)}
                        disabled={isTranslatingSummary || !aiSummary}
                        className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-600 text-sm font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isTranslatingSummary && (
                          <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        Translate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'speakers' && (
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Speakers</h3>
                  <p className="text-gray-500 mb-6">Identify & Label Speakers For Better Organization</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {speakerData.slice(0, speakers).map((speaker) => (
                      <div key={speaker.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-300">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${speaker.bgLight} ${speaker.textColor}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={speakerNames[speaker.id] || speaker.name}
                            onChange={(e) => handleSpeakerNameChange(speaker.id, e.target.value)}
                            onBlur={() => {
                              // Ensure changes are saved on blur
                              if (id && Object.keys(speakerNames).length > 0) {
                                localStorage.setItem(`speaker-names-${id}`, JSON.stringify(speakerNames));
                              }
                            }}
                            className="w-full bg-transparent text-gray-900 font-medium focus:outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                            placeholder={speaker.name}
                          />
                          <p className="text-xs text-gray-500 mt-0.5">Spoke For ~{speaker.minutes} minutes</p>
                        </div>
                        <button 
                          onClick={() => handleIdentifyVoice(speaker.id)}
                          disabled={identifyingVoice === speaker.id}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {identifyingVoice === speaker.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              Identifying...
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              Identify Voice
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Speaker Time Chart */}
                  <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Speaking Time Distribution</h4>
                    <div className="space-y-3">
                      {speakerData.slice(0, speakers).map((speaker) => (
                        <div key={speaker.id} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-gray-600">{speakerNames[speaker.id] || speaker.name}</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${speaker.color} rounded-full transition-all duration-500`}
                              style={{ width: `${(speaker.minutes / totalSpeakingMinutes) * 100}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-gray-500 text-right">{speaker.minutes} min</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Speaking Time</span>
                        <span className="font-medium text-gray-900">{totalSpeakingMinutes} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="max-w-3xl w-full">
                  {/* Chat Messages */}
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                      <p className="text-sm text-emerald-700">
                        Ask me anything about this transcript! I can help you find specific information, extract insights, or answer questions about what was discussed.
                      </p>
                    </div>
                    
                    {chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-xl max-w-md ${
                          msg.role === 'user' 
                            ? 'bg-gray-100 border border-gray-300 ml-auto' 
                            : 'bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        <p className={`text-sm ${msg.role === 'user' ? 'text-gray-700' : 'text-emerald-700'}`}>
                          {msg.content}
                        </p>
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                      placeholder="Ask a question about this transcript..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                      disabled={isChatLoading}
                    />
                    <button 
                      onClick={() => sendChatMessage(chatInput)}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      <Wand2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Quick Suggestions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-gray-500">Try:</span>
                    {['What was decided?', 'Action items', 'Key metrics', 'Main topics'].map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => sendChatMessage(q)}
                        disabled={isChatLoading}
                        className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Hidden Audio Element */}
        {resolvedAudioUrl && (
          <audio ref={audioRef} src={resolvedAudioUrl} preload="metadata" />
        )}

        {/* Hidden file input for attaching audio */}
        <input
          ref={attachAudioInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleAttachAudio}
          className="hidden"
        />

        {/* Fixed Audio Player at Bottom - Dark Sleek Design */}
        <div className={`fixed bottom-0 right-0 bg-[#1a1f2e] border-t border-gray-800 py-3 px-4 z-50 transition-all duration-300 ${isSidebarCollapsed ? 'left-16' : 'left-64'}`}>
          {resolvedAudioUrl ? (
            <div className="flex items-center gap-4">
              {/* Animated Audio Waves */}
              <div className="flex items-center gap-1 h-8">
                <div
                  className="w-1 rounded-full bg-emerald-500"
                  style={{
                    height: isPlaying ? '24px' : '8px',
                    animation: isPlaying ? 'audioWave1 0.4s ease-in-out infinite' : 'none',
                  }}
                />
                <div
                  className="w-1 rounded-full bg-emerald-500"
                  style={{
                    height: isPlaying ? '16px' : '12px',
                    animation: isPlaying ? 'audioWave2 0.4s ease-in-out infinite 0.1s' : 'none',
                  }}
                />
                <div
                  className="w-1 rounded-full bg-emerald-500"
                  style={{
                    height: isPlaying ? '20px' : '10px',
                    animation: isPlaying ? 'audioWave3 0.4s ease-in-out infinite 0.2s' : 'none',
                  }}
                />
                <style>{`
                  @keyframes audioWave1 {
                    0%, 100% { height: 8px; }
                    50% { height: 24px; }
                  }
                  @keyframes audioWave2 {
                    0%, 100% { height: 16px; }
                    50% { height: 8px; }
                  }
                  @keyframes audioWave3 {
                    0%, 100% { height: 12px; }
                    50% { height: 28px; }
                  }
                `}</style>
              </div>

              {/* Left: Title & Badge */}
              <div className="flex items-center gap-3 min-w-[180px] max-w-[220px]">
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium truncate max-w-[200px]">{editedTitle}</span>
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded w-fit">Transcription</span>
                </div>
              </div>

              {/* Center: Play Button & Progress */}
              <div className="flex-1 flex items-center gap-4">
                <button 
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors flex-shrink-0 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                
                <span className="text-sm text-white font-mono min-w-[40px]">{formatTime(currentTime)}</span>
                
                <div 
                  ref={progressBarRef}
                  className="flex-1 h-4 bg-transparent cursor-pointer relative group flex items-center"
                  onMouseDown={handleDragStart}
                  onClick={handleSeek}
                >
                  {/* Track background */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-600 rounded-full" />
                  {/* Progress fill */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-white rounded-full" 
                    style={{ width: isValidDuration(audioDuration) ? `${(currentTime / audioDuration) * 100}%` : '0%' }}
                  />
                  {/* Draggable handle */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-emerald-500 hover:scale-125 transition-transform ${isDragging ? 'scale-125' : ''}`}
                    style={{ left: `calc(${isValidDuration(audioDuration) ? (currentTime / audioDuration) * 100 : 0}% - 8px)` }}
                  />
                </div>
                
                <span className="text-sm text-white font-mono min-w-[40px]">{isValidDuration(audioDuration) ? formatTime(audioDuration) : duration}</span>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-1">
                {/* Volume */}
                <Popover>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Volume</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <PopoverContent className="w-12 p-3 bg-gray-800 border-gray-700" side="top">
                    <div className="relative h-24 flex items-center justify-center">
                      <style>{`
                        .volume-slider {
                          -webkit-appearance: none;
                          appearance: none;
                          width: 80px;
                          height: 6px;
                          background: #4b5563;
                          border-radius: 9999px;
                          cursor: pointer;
                          transform: rotate(-90deg);
                          transform-origin: center;
                        }
                        .volume-slider::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          appearance: none;
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          background: white;
                          border: 2px solid #10b981;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                          cursor: pointer;
                        }
                        .volume-slider::-moz-range-thumb {
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          background: white;
                          border: 2px solid #10b981;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                          cursor: pointer;
                        }
                      `}</style>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="volume-slider"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Speed */}
                <select 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="px-2 py-1.5 rounded-lg bg-gray-700/50 border-0 text-sm text-white focus:outline-none cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                {/* Favorite */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
                        <Star className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Favorite</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Create */}
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
                            <Wand2 className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Create</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem 
                      onClick={() => handleCreate('video')}
                      className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCreate('ugc')}
                      className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      UGC
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCreate('post')}
                      className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                    >
                      <FileEdit className="w-4 h-4 mr-2" />
                      Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCreate('ebook')}
                      className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ebook
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Download */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleDownload}
                        className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Copy */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleCopy}
                        className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Share */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleShare}
                        className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleDelete}
                        className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            /* No audio - show attach audio UI */
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <VolumeX className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">{editedTitle}</span>
                  <span className="text-xs text-gray-500">No audio file attached</span>
                </div>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => attachAudioInputRef.current?.click()}
                disabled={isUploadingAudio}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUploadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Attach Audio
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Download Modal - Matching listing page */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Download Transcript</h2>
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Select The Format</p>

            {/* Format Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { id: 'pdf' as const, label: 'PDF', ext: '.pdf', icon: FileText },
                { id: 'docx' as const, label: 'Word', ext: '.docx', icon: FileText },
                { id: 'txt' as const, label: 'Text', ext: '.txt', icon: FileText },
                { id: 'srt' as const, label: 'SRT', ext: '.srt', icon: FileText },
                { id: 'vtt' as const, label: 'VTT', ext: '.vtt', icon: FileText },
                { id: 'xml' as const, label: 'Premiere', ext: '.xml', icon: FileDown },
                { id: 'fcpxml' as const, label: 'Final Cut', ext: '.fcpxml', icon: FileDown },
                { id: 'audio' as const, label: 'Audio', ext: '.mp3', icon: Volume2 },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDownloadFormat(opt.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    downloadFormat === opt.id 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <opt.icon className={`w-6 h-6 mb-2 ${downloadFormat === opt.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className={`text-xs mt-0.5 ${downloadFormat === opt.id ? 'text-emerald-400' : 'text-gray-400'}`}>{opt.ext}</span>
                </button>
              ))}
            </div>

            {/* Options - only show for transcript formats */}
            {downloadFormat !== 'audio' && (
              <div className="space-y-4 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Include Timestamps</span>
                    <p className="text-xs text-gray-500">Add time markers for each speaker segment</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Include Summary</span>
                    <p className="text-xs text-gray-500">Add AI-generated summary at the top</p>
                  </div>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDownload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal - Matching listing page */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Share Transcript
              </h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Anyone with the following secure link can <span className="font-semibold">view</span> this transcript.
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Secure Link</label>
              <input
                type="text"
                readOnly
                value={`https://app.transcribe.com/transcript/share/${searchParams.get('id') || '1'}`}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-blue-200 text-sm text-gray-700 focus:outline-none"
              />
            </div>

            <button
              onClick={copyShareLink}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              COPY SECURE LINK
            </button>
          </div>
        </div>
      )}

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default TranscriptDetail;
