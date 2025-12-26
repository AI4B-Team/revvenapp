import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import TranscribeHeader from '@/components/transcribe/TranscribeHeader';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { 
  ArrowLeft, Play, Pause, FileText, Clock, Calendar, Users, Globe,
  FileDown, Share2, ChevronDown, Copy, Edit3, Sparkles,
  Volume2, RotateCcw, TrendingUp, Zap, Languages, 
  MessageSquare, User, ChevronRight, Wand2, Download,
  Pencil, Trash2, Check, X, Search, Mic,
  Star, MoreVertical, Upload, Loader2, VolumeX, Heart, Info, RefreshCw, EyeOff, Eye, Plus, Maximize,
  ArrowDownToLine, Briefcase, FileText as FileTextIcon, List, MinusCircle,
  ThumbsUp, ThumbsDown, ChevronLeft, RotateCw as RefreshCwIcon, Umbrella
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
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [editedTitle, setEditedTitle] = useState<string | null>(null);
  
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
  
  // Like state
  const [isLiked, setIsLiked] = useState(false);

  // Auto-save state
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Selected transcript line for toolbar
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<number>>(new Set());
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  // Comments state (Google Docs style)
  interface Comment {
    id: string;
    text: string;
    author: string;
    createdAt: Date;
    resolved: boolean;
    mentions: string[];
    replies: { id: string; text: string; author: string; createdAt: Date; mentions?: string[] }[];
  }
  const [lineComments, setLineComments] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null);
  const [openCommentPopover, setOpenCommentPopover] = useState<number | null>(null);
  
  // @mention functionality
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionContext, setMentionContext] = useState<'comment' | 'reply' | null>(null);
  const [mentionReplyId, setMentionReplyId] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Mock list of mentionable users (in a real app, this would come from the database)
  const mentionableUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Williams', email: 'mike@example.com' },
    { id: '4', name: 'Emily Brown', email: 'emily@example.com' },
    { id: '5', name: 'David Lee', email: 'david@example.com' },
    { id: '6', name: 'Jessica Davis', email: 'jessica@example.com' },
  ];
  
  const filteredMentionUsers = mentionableUsers.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionSearch.toLowerCase())
  );
  
  // Handle @ mention detection in comment input
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentInput(value);
    
    // Check for @ trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      // Only show dropdown if @ is followed by word characters (no spaces)
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
        setMentionSearch(textAfterAt);
        setShowMentionDropdown(true);
        setMentionContext('comment');
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };
  
  // Handle @ mention detection in reply input
  const handleReplyInputChange = (commentId: string, value: string, cursorPos: number) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }));
    
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
        setMentionSearch(textAfterAt);
        setShowMentionDropdown(true);
        setMentionContext('reply');
        setMentionReplyId(commentId);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };
  
  // Insert mention into input
  const insertMention = (userName: string) => {
    if (mentionContext === 'comment') {
      const cursorPos = commentInputRef.current?.selectionStart || commentInput.length;
      const textBeforeCursor = commentInput.substring(0, cursorPos);
      const atIndex = textBeforeCursor.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const newValue = commentInput.substring(0, atIndex) + '@' + userName + ' ' + commentInput.substring(cursorPos);
        setCommentInput(newValue);
      }
    } else if (mentionContext === 'reply' && mentionReplyId) {
      const currentReply = replyInputs[mentionReplyId] || '';
      const atIndex = currentReply.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const newValue = currentReply.substring(0, atIndex) + '@' + userName + ' ' + currentReply.substring(currentReply.length);
        setReplyInputs(prev => ({ ...prev, [mentionReplyId]: newValue }));
      }
    }
    
    setShowMentionDropdown(false);
    setMentionSearch('');
    setMentionContext(null);
    setMentionReplyId(null);
  };
  
  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };
  
  // Render text with highlighted mentions
  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+(?:\s+\w+)?)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span key={idx} className="text-blue-500 font-medium bg-blue-50 px-0.5 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Highlight colors per line
  const [lineHighlights, setLineHighlights] = useState<Record<number, string>>({});
  
  // Text-level highlights (per segment, with character ranges)
  interface TextHighlight {
    start: number;
    end: number;
    color: string;
  }
  const [textHighlights, setTextHighlights] = useState<Record<number, TextHighlight[]>>({});
  const [highlightsLoaded, setHighlightsLoaded] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [textSelection, setTextSelection] = useState<{ segmentIndex: number; start: number; end: number; text: string } | null>(null);
  const segmentTextRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const editTextareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  // Ref to preserve text selection when clicking highlight toolbar button
  const pendingHighlightSelectionRef = useRef<{ segmentIndex: number; start: number; end: number } | null>(null);
  
  // AI Writer dropdown state
  const [showAIWriterDropdown, setShowAIWriterDropdown] = useState<number | null>(null);
  const [aiWriterPrompt, setAIWriterPrompt] = useState('');
  
  // AI Writer Preview Modal state
  interface AIWriterResult {
    text: string;
    action: string;
  }
  const [aiWriterModalOpen, setAiWriterModalOpen] = useState(false);
  const [aiWriterModalLoading, setAiWriterModalLoading] = useState(false);
  const [aiWriterResults, setAiWriterResults] = useState<AIWriterResult[]>([]);
  const [aiWriterResultIndex, setAiWriterResultIndex] = useState(0);
  const [aiWriterOriginalText, setAiWriterOriginalText] = useState('');
  const [aiWriterSegmentIndex, setAiWriterSegmentIndex] = useState<number | null>(null);
  const [aiWriterUsingSelection, setAiWriterUsingSelection] = useState(false);
  const [aiWriterSelectionRange, setAiWriterSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [aiWriterCurrentAction, setAiWriterCurrentAction] = useState('');
  const [aiWriterRefinePrompt, setAiWriterRefinePrompt] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showMoreModesModal, setShowMoreModesModal] = useState(false);
  const [customModes, setCustomModes] = useState<string[]>([]);
  
  // All available writing modes organized by category
  const allWritingModes = {
    common: ['Rephrase', 'Formal', 'Casual', 'Shorten', 'Expand', 'Simplify', 'Standard', 'Fluent'],
    styleAndVoice: ['Authoritative', 'Humorous', 'Poetic', 'Intellectual', 'Technical', 'Conversational', 'Persuasive', 'Professional'],
    moodAndEmotion: ['Adventurous', 'Inspiring', 'Romantic', 'Angry', 'Mysterious', 'Sad', 'Emotional', 'Nostalgic', 'Serious', 'Emotive', 'Peaceful', 'Surreal', 'Frightening', 'Personal', 'Suspenseful', 'Respectful'],
    clarityAndConcision: ['Brief', 'Concise', 'To the point', 'Clear', 'Direct'],
    depthAndDetail: ['Complex', 'Expansive', 'Specific', 'Descriptive', 'In-depth', 'Thorough', 'Elaborate', 'Insightful'],
    originalityAndCreativity: ['Artistic', 'Groundbreaking', 'Magical journey', 'Expressive', 'Imaginative', 'Out of the box', 'Creative', 'Unique']
  };
  
  const defaultModes = ['Rephrase', 'Shorten', 'Expand', 'Formal', 'Casual', 'Simplify'];
  const totalExtraModes = Object.values(allWritingModes).flat().length - defaultModes.length;
  
  // Segment playback - track when to stop playing a segment
  const [segmentEndTime, setSegmentEndTime] = useState<number | null>(null);
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
    setSegmentEndTime(null); // Clear any segment end time
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    toast.success(`Jumped to ${timeStr}`);
  };

  // Play only a specific segment (from start to end time)
  const playSegmentOnly = (startTimeStr: string, endTimeStr?: string) => {
    if (!audioRef.current || !resolvedAudioUrl) {
      toast.error('No audio available to play');
      return;
    }
    const startSeconds = parseTimeToSeconds(startTimeStr);
    // Add 1.5 seconds buffer to avoid cutting off final words
    const endSeconds = endTimeStr ? parseTimeToSeconds(endTimeStr) + 1.5 : startSeconds + 5;
    
    audioRef.current.currentTime = startSeconds;
    setSegmentEndTime(endSeconds);
    audioRef.current.play();
    setIsPlaying(true);
    toast.success(`Playing segment ${startTimeStr} - ${endTimeStr || ''}`);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Render text with word-level highlighting (karaoke-style), user highlights, text-level highlights, and active selection preview
  const renderHighlightedText = (item: TranscriptLine, segmentIndex: number) => {
    const highlightColor = lineHighlights[segmentIndex];
    const segmentTextHighlights = textHighlights[segmentIndex] || [];
    
    // Map highlight color names to Tailwind classes
    const highlightClasses: Record<string, string> = {
      yellow: 'bg-yellow-200',
      green: 'bg-green-200',
      blue: 'bg-blue-200',
      pink: 'bg-pink-200',
    };
    
    const baseHighlightClass = highlightColor ? highlightClasses[highlightColor] : '';
    const text = item.text;
    
    // Combine persisted highlights with current text selection preview
    const allHighlights = [...segmentTextHighlights];
    
    // Add active selection as a temporary highlight preview (light blue)
    if (textSelection && textSelection.segmentIndex === segmentIndex && textSelection.start !== textSelection.end) {
      allHighlights.push({ start: textSelection.start, end: textSelection.end, color: 'selection' });
    }
    
    // If there are any highlights to render (persisted or selection preview)
    if (allHighlights.length > 0 && !isPlaying) {
      // Sort highlights by start position
      const sortedHighlights = [...allHighlights].sort((a, b) => a.start - b.start);
      const parts: React.ReactNode[] = [];
      let lastEnd = 0;
      
      sortedHighlights.forEach((hl, idx) => {
        // Skip if this highlight is entirely within already-rendered text (overlapping/duplicate)
        if (hl.end <= lastEnd) return;
        
        // Adjust start if it overlaps with previous highlight
        const effectiveStart = Math.max(hl.start, lastEnd);
        
        // Add non-highlighted text before this highlight
        if (effectiveStart > lastEnd) {
          parts.push(<span key={`text-${idx}-before`}>{text.substring(lastEnd, effectiveStart)}</span>);
        }
        // Add highlighted text - use special class for active selection
        const hlClass = hl.color === 'selection' 
          ? 'bg-blue-100 border-b-2 border-blue-400' 
          : (highlightClasses[hl.color] || 'bg-yellow-200');
        parts.push(
          <span key={`hl-${idx}`} className={`${hlClass} px-0.5 rounded`}>
            {text.substring(effectiveStart, hl.end)}
          </span>
        );
        lastEnd = hl.end;
      });
      
      // Add remaining text after last highlight
      if (lastEnd < text.length) {
        parts.push(<span key="text-end">{text.substring(lastEnd)}</span>);
      }
      
      return <span className={`${baseHighlightClass} ${baseHighlightClass ? 'px-1 rounded' : ''}`}>{parts}</span>;
    }
    
    if (!isPlaying) {
      return <span className={`${baseHighlightClass} ${baseHighlightClass ? 'px-1 rounded' : ''}`}>{item.text}</span>;
    }

    const segmentStartTime = parseTimeToSeconds(item.time);
    const segmentEndTimeVal = item.endTime ? parseTimeToSeconds(item.endTime) : segmentStartTime + 10;
    const segmentDuration = Math.max(0.001, segmentEndTimeVal - segmentStartTime);

    // Only highlight while we're inside this segment
    if (currentTime < segmentStartTime || currentTime >= segmentEndTimeVal) {
      return <span className={`${baseHighlightClass} ${baseHighlightClass ? 'px-1 rounded' : ''}`}>{item.text}</span>;
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

  const renderStaticHighlightedText = (text: string, segmentIndex: number) => {
    const highlightColor = lineHighlights[segmentIndex];
    const segmentTextHighlights = textHighlights[segmentIndex] || [];

    const highlightClasses: Record<string, string> = {
      yellow: 'bg-yellow-200',
      green: 'bg-green-200',
      blue: 'bg-blue-200',
      pink: 'bg-pink-200',
    };

    const baseHighlightClass = highlightColor ? highlightClasses[highlightColor] : '';

    const allHighlights: TextHighlight[] = [...segmentTextHighlights];
    if (textSelection && textSelection.segmentIndex === segmentIndex && textSelection.start !== textSelection.end) {
      allHighlights.push({ start: textSelection.start, end: textSelection.end, color: 'selection' });
    }

    if (allHighlights.length === 0) {
      return <span className={`${baseHighlightClass} ${baseHighlightClass ? 'px-1 rounded' : ''}`}>{text}</span>;
    }

    const sortedHighlights = [...allHighlights].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedHighlights.forEach((hl, idx) => {
      if (hl.end <= lastEnd) return;
      const effectiveStart = Math.max(hl.start, lastEnd);

      if (effectiveStart > lastEnd) {
        parts.push(<span key={`edit-text-${idx}-before`}>{text.substring(lastEnd, effectiveStart)}</span>);
      }

      const hlClass =
        hl.color === 'selection'
          ? 'bg-blue-100 border-b-2 border-blue-400'
          : (highlightClasses[hl.color] || 'bg-yellow-200');

      parts.push(
        <span key={`edit-hl-${idx}`} className={`${hlClass} px-0.5 rounded`}>
          {text.substring(effectiveStart, hl.end)}
        </span>
      );

      lastEnd = hl.end;
    });

    if (lastEnd < text.length) {
      parts.push(<span key="edit-text-end">{text.substring(lastEnd)}</span>);
    }

    return <span className={`${baseHighlightClass} ${baseHighlightClass ? 'px-1 rounded' : ''}`}>{parts}</span>;
  };
  
  // Handle text selection within a segment for text-level highlighting
  const handleTextSelection = (segmentIndex: number) => {
    const root = segmentTextRefs.current[segmentIndex];
    const selection = window.getSelection();

    if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      setTextSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    // Only accept selections inside this segment's text node
    if (!root.contains(range.commonAncestorContainer)) {
      return;
    }

    // Compute character offsets relative to the segment text by measuring text up to the range endpoints
    const preRange = document.createRange();
    preRange.selectNodeContents(root);
    preRange.setEnd(range.startContainer, range.startOffset);
    const rawStart = preRange.toString().length;

    preRange.setEnd(range.endContainer, range.endOffset);
    const rawEnd = preRange.toString().length;

    const segmentText = editedContent[segmentIndex]?.text || '';
    const start = Math.max(0, Math.min(segmentText.length, Math.min(rawStart, rawEnd)));
    const end = Math.max(0, Math.min(segmentText.length, Math.max(rawStart, rawEnd)));

    if (start === end) {
      setTextSelection(null);
      return;
    }

    const selectedText = segmentText.substring(start, end);
    setTextSelection({ segmentIndex, start, end, text: selectedText });
    // Persist so the user can click the toolbar without losing the selection
    pendingHighlightSelectionRef.current = { segmentIndex, start, end };
  };
  
  // Apply text-level highlight
  const applyTextHighlight = (color: string) => {
    if (!textSelection) return;

    const { segmentIndex, start, end } = textSelection;
    setTextHighlights(prev => ({
      ...prev,
      [segmentIndex]: [...(prev[segmentIndex] || []), { start, end, color }]
    }));
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();
    toast.success(`Text highlighted in ${color}`);
  };

  const applyHighlightForSegment = (segmentIndex: number, color: 'yellow' | 'green' | 'blue' | 'pink') => {
    // First check for pending selection from the ref (captured when opening popover)
    if (pendingHighlightSelectionRef.current && pendingHighlightSelectionRef.current.segmentIndex === segmentIndex) {
      const { start, end } = pendingHighlightSelectionRef.current;
      if (start !== end) {
        setTextHighlights(prev => ({
          ...prev,
          [segmentIndex]: [...(prev[segmentIndex] || []), { start, end, color }]
        }));
        pendingHighlightSelectionRef.current = null;
        setTextSelection(null);
        toast.success(`Text highlighted in ${color}`);
        return;
      }
    }

    // Then check textSelection state
    if (textSelection && textSelection.segmentIndex === segmentIndex && textSelection.start !== textSelection.end) {
      applyTextHighlight(color);
      return;
    }

    // Fall back to line-level highlight
    setLineHighlights(prev => ({ ...prev, [segmentIndex]: color }));
    toast.success(`Highlighted in ${color}`);
  };

  const removeHighlightForSegment = (segmentIndex: number) => {
    // Prefer removing within the current selection (pending or active)
    const pending = pendingHighlightSelectionRef.current;
    const pendingRange = pending && pending.segmentIndex === segmentIndex ? pending : null;

    const selectionRange =
      pendingRange && pendingRange.start !== pendingRange.end
        ? { start: pendingRange.start, end: pendingRange.end }
        : (textSelection && textSelection.segmentIndex === segmentIndex && textSelection.start !== textSelection.end
            ? { start: textSelection.start, end: textSelection.end }
            : null);

    if (selectionRange) {
      const { start, end } = selectionRange;
      setTextHighlights(prev => {
        const existing = prev[segmentIndex] || [];
        const nextForSeg = existing.filter((hl) => hl.end <= start || hl.start >= end);
        return {
          ...prev,
          [segmentIndex]: nextForSeg,
        };
      });
    } else if ((textHighlights[segmentIndex]?.length ?? 0) > 0) {
      // No selection: clear all text-level highlights for this segment
      setTextHighlights(prev => ({
        ...prev,
        [segmentIndex]: [],
      }));
    } else {
      // No text-level highlights: clear line-level highlight
      setLineHighlights(prev => {
        const next = { ...prev };
        delete next[segmentIndex];
        return next;
      });
    }

    pendingHighlightSelectionRef.current = null;
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();
    toast.success('Highlight removed');
  };
  
  // AI Writer actions (smart: uses selected text if any, otherwise whole segment)
  // Now opens a preview modal instead of applying directly
  const handleAIWriterAction = async (action: string, segmentIndex: number) => {
    const segment = editedContent[segmentIndex];
    if (!segment) return;
    
    // Determine what text to modify
    let targetText = segment.text;
    let usingSelection = false;
    let selectionRange: { start: number; end: number } | null = null;
    
    if (pendingHighlightSelectionRef.current && pendingHighlightSelectionRef.current.segmentIndex === segmentIndex) {
      const { start, end } = pendingHighlightSelectionRef.current;
      if (start !== end) {
        targetText = segment.text.substring(start, end);
        usingSelection = true;
        selectionRange = { start, end };
      }
    } else if (textSelection && textSelection.segmentIndex === segmentIndex && textSelection.start !== textSelection.end) {
      targetText = textSelection.text;
      usingSelection = true;
      selectionRange = { start: textSelection.start, end: textSelection.end };
    }
    
    // Store context for the modal
    setAiWriterOriginalText(targetText);
    setAiWriterSegmentIndex(segmentIndex);
    setAiWriterUsingSelection(usingSelection);
    setAiWriterSelectionRange(selectionRange);
    setAiWriterCurrentAction(action);
    setAiWriterResults([]);
    setAiWriterResultIndex(0);
    setAiWriterRefinePrompt('');
    setAiWriterModalOpen(true);
    setAiWriterModalLoading(true);
    setShowAIWriterDropdown(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { 
          action: 'transform',
          text: targetText,
          transformType: action.toLowerCase()
        }
      });
      
      if (error) throw error;
      
      if (data?.result) {
        setAiWriterResults([{ text: data.result, action }]);
      }
    } catch (err) {
      console.error('AI Writer error:', err);
      toast.error('Failed to generate AI result');
      setAiWriterModalOpen(false);
    } finally {
      setAiWriterModalLoading(false);
      pendingHighlightSelectionRef.current = null;
      setTextSelection(null);
    }
  };

  // Apply the AI Writer result to the transcript
  const applyAIWriterResult = () => {
    if (aiWriterSegmentIndex === null || aiWriterResults.length === 0) return;
    
    const segment = editedContent[aiWriterSegmentIndex];
    if (!segment) return;
    
    const result = aiWriterResults[aiWriterResultIndex];
    const newContent = [...editedContent];
    
    if (aiWriterUsingSelection && aiWriterSelectionRange) {
      const { start, end } = aiWriterSelectionRange;
      const origText = segment.text;
      newContent[aiWriterSegmentIndex] = { 
        ...segment, 
        text: origText.substring(0, start) + result.text + origText.substring(end)
      };
    } else {
      newContent[aiWriterSegmentIndex] = { ...segment, text: result.text };
    }
    
    setEditedContent(newContent);
    toast.success(`${result.action} applied successfully`);
    setAiWriterModalOpen(false);
    resetAIWriterModal();
  };

  // Reset the AI Writer modal state
  const resetAIWriterModal = () => {
    setAiWriterResults([]);
    setAiWriterResultIndex(0);
    setAiWriterOriginalText('');
    setAiWriterSegmentIndex(null);
    setAiWriterUsingSelection(false);
    setAiWriterSelectionRange(null);
    setAiWriterCurrentAction('');
    setAiWriterRefinePrompt('');
  };

  // Handle refining the AI result with a custom prompt
  const handleRefineAIResult = async (refineAction?: string) => {
    const action = refineAction || aiWriterRefinePrompt.trim();
    if (!action || aiWriterResults.length === 0) return;
    
    setAiWriterModalLoading(true);
    const currentResult = aiWriterResults[aiWriterResultIndex];
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { 
          action: 'transform',
          text: currentResult.text,
          transformType: action.toLowerCase()
        }
      });
      
      if (error) throw error;
      
      if (data?.result) {
        setAiWriterResults(prev => [...prev, { text: data.result, action }]);
        setAiWriterResultIndex(prev => prev + 1);
        setAiWriterRefinePrompt('');
      }
    } catch (err) {
      console.error('AI Writer refine error:', err);
      toast.error('Failed to refine result');
    } finally {
      setAiWriterModalLoading(false);
    }
  };

  // Retry the current action
  const handleRetryAIWriter = async () => {
    if (!aiWriterCurrentAction || aiWriterSegmentIndex === null) return;
    
    setAiWriterModalLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-transcript-summary', {
        body: { 
          action: 'transform',
          text: aiWriterOriginalText,
          transformType: aiWriterCurrentAction.toLowerCase()
        }
      });
      
      if (error) throw error;
      
      if (data?.result) {
        setAiWriterResults(prev => [...prev, { text: data.result, action: aiWriterCurrentAction }]);
        setAiWriterResultIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('AI Writer retry error:', err);
      toast.error('Failed to retry');
    } finally {
      setAiWriterModalLoading(false);
    }
  };

  // Close the modal with confirmation if there are unsaved changes
  const handleCloseAIWriterModal = () => {
    if (aiWriterResults.length > 0) {
      setShowDiscardConfirm(true);
    } else {
      setAiWriterModalOpen(false);
      resetAIWriterModal();
    }
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
      
      // Stop playback when reaching segment end time
      if (segmentEndTime !== null && audio.currentTime >= segmentEndTime) {
        audio.pause();
        setIsPlaying(false);
        setSegmentEndTime(null);
      }
      
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, segmentEndTime]);

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
        setSummaryTranslations((prev) => {
          const next = { ...prev, [targetLanguage]: data.translatedText as string };
          if (id) {
            localStorage.setItem(`summary-translations-${id}`, JSON.stringify(next));
          }
          return next;
        });
        setActiveSummaryTab(targetLanguage);
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

  // ========================
  // LOAD / SAVE HIGHLIGHTS
  // ========================
  useEffect(() => {
    if (!id || isLoading) return;
    let cancelled = false;

    setHighlightsLoaded(false);

    const loadHighlights = async () => {
      try {
        const { data, error } = await supabase
          .from('transcript_highlights')
          .select('*')
          .eq('transcript_id', id);
        if (error) throw error;
        if (!data) return;

        const grouped: Record<number, TextHighlight[]> = {};
        data.forEach((h: any) => {
          if (!grouped[h.segment_index]) grouped[h.segment_index] = [];
          grouped[h.segment_index].push({ start: h.start_pos, end: h.end_pos, color: h.color });
        });

        if (!cancelled) setTextHighlights(grouped);
      } catch (e) {
        console.error('Failed to load highlights', e);
      } finally {
        if (!cancelled) setHighlightsLoaded(true);
      }
    };

    loadHighlights();

    return () => {
      cancelled = true;
    };
  }, [id, isLoading]);

  // Save highlights when they change (debounced via useEffect)
  const saveHighlightsToDb = useCallback(async (highlights: Record<number, TextHighlight[]>) => {
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Delete existing then insert new (simple approach)
      const { error: deleteError } = await supabase.from('transcript_highlights').delete().eq('transcript_id', id).eq('user_id', user.id);
      if (deleteError) {
        console.warn('Could not delete existing highlights (may not own this transcript):', deleteError.message);
        return; // Don't proceed if we can't delete - likely RLS issue
      }
      const rows: any[] = [];
      Object.entries(highlights).forEach(([segIdx, hls]) => {
        hls.forEach(hl => {
          rows.push({
            transcript_id: id,
            user_id: user.id,
            segment_index: Number(segIdx),
            start_pos: hl.start,
            end_pos: hl.end,
            color: hl.color,
          });
        });
      });
      if (rows.length > 0) {
        const { error: insertError } = await supabase.from('transcript_highlights').insert(rows);
        if (insertError) {
          console.warn('Could not save highlights:', insertError.message);
        }
      }
    } catch (e) {
      console.error('Failed to save highlights', e);
    }
  }, [id]);

  useEffect(() => {
    // Don't save until initial load from DB has completed; otherwise we delete server data on mount.
    if (isLoading || !highlightsLoaded) return;
    saveHighlightsToDb(textHighlights);
  }, [textHighlights, saveHighlightsToDb, isLoading, highlightsLoaded]);

  // ========================
  // LOAD / SAVE COMMENTS
  // ========================
  useEffect(() => {
    if (!id || isLoading) return;
    let cancelled = false;

    setCommentsLoaded(false);

    const loadComments = async () => {
      try {
        const { data, error } = await supabase
          .from('transcript_comments')
          .select('*')
          .eq('transcript_id', id);
        if (error) throw error;
        if (!data) return;

        const grouped: Record<number, Comment[]> = {};
        data.forEach((c: any) => {
          if (!grouped[c.segment_index]) grouped[c.segment_index] = [];
          grouped[c.segment_index].push({
            id: c.id,
            text: c.text,
            author: c.author,
            createdAt: new Date(c.created_at),
            resolved: c.resolved,
            mentions: c.mentions || [],
            replies: c.replies || [],
          });
        });

        if (!cancelled) setLineComments(grouped);
      } catch (e) {
        console.error('Failed to load comments', e);
      } finally {
        if (!cancelled) setCommentsLoaded(true);
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [id, isLoading]);

  // Persist comments when they change
  const saveCommentsToDb = useCallback(async (comments: Record<number, Comment[]>) => {
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Delete existing then insert new
      const { error: deleteError } = await supabase.from('transcript_comments').delete().eq('transcript_id', id).eq('user_id', user.id);
      if (deleteError) {
        console.warn('Could not delete existing comments (may not own this transcript):', deleteError.message);
        return; // Don't proceed if we can't delete - likely RLS issue
      }
      const rows: any[] = [];
      Object.entries(comments).forEach(([segIdx, cmts]) => {
        cmts.forEach(c => {
          rows.push({
            id: c.id,
            transcript_id: id,
            user_id: user.id,
            segment_index: Number(segIdx),
            text: c.text,
            author: c.author,
            resolved: c.resolved,
            mentions: c.mentions,
            replies: c.replies,
            created_at: c.createdAt.toISOString(),
          });
        });
      });
      if (rows.length > 0) {
        const { error: insertError } = await supabase.from('transcript_comments').insert(rows);
        if (insertError) {
          console.warn('Could not save comments:', insertError.message);
        }
      }
    } catch (e) {
      console.error('Failed to save comments', e);
    }
  }, [id]);

  useEffect(() => {
    if (isLoading || !commentsLoaded) return;
    saveCommentsToDb(lineComments);
  }, [lineComments, saveCommentsToDb, isLoading, commentsLoaded]);

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
      setSelectedLineIndex(null);
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
      setSelectedLineIndex(null);
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
    setSelectedLineIndex(null);
    setTextSelection(null);
    pendingHighlightSelectionRef.current = null;
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

  // Keep Summary language in sync with the transcript language toggle
  useEffect(() => {
    if (activeTab !== 'summary') return;

    if (activeTranslationTab === 'original' || !selectedTranslation) {
      if (activeSummaryTab !== 'original') setActiveSummaryTab('original');
      return;
    }

    // Translated transcript selected
    if (activeSummaryTab !== selectedTranslation) setActiveSummaryTab(selectedTranslation);

    // If we don't have a translated summary yet, translate it on-demand
    if (aiSummary && !summaryTranslations[selectedTranslation] && !isTranslatingSummary) {
      void translateSummary(selectedTranslation);
    }
  }, [
    activeTab,
    activeTranslationTab,
    selectedTranslation,
    aiSummary,
    summaryTranslations,
    isTranslatingSummary,
    activeSummaryTab,
  ]);

  // Click outside handler to deselect line (but not when editing or clicking in popovers)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't deselect if we're currently editing a line
      if (editingLineIndex !== null) return;
      
      const target = event.target as HTMLElement;
      
      // Check if click is inside a Radix portal (popover, dropdown, etc.)
      const isInPortal = target.closest('[data-radix-popper-content-wrapper]') || 
                         target.closest('[role="dialog"]') ||
                         target.closest('[data-radix-menu-content]');
      if (isInPortal) return;
      
      // Check if click is outside the transcript container
      if (transcriptContainerRef.current && !transcriptContainerRef.current.contains(target)) {
        setSelectedLineIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingLineIndex]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <TranscribeHeader 
          onDownloadClick={() => setShowDownloadModal(true)}
          showCreateDownload={true}
          onCreateClick={handleCreate}
        />
        
          <main className="flex-1 overflow-hidden bg-white">
          <div className="h-full flex flex-col">
            {/* Header Section with Back link and Title */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30">
              {/* Back to Transcriptions Link */}
              <button 
                onClick={() => navigate('/transcribe')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back To Transcriptions
              </button>
              
              {/* Title Row with pencil icon */}
              <div className="flex items-center gap-3 mb-4">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editedTitle ?? title}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                      if (e.key === 'Escape') {
                        setEditedTitle(null);
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-emerald-500 focus:outline-none px-1"
                  />
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">{editedTitle ?? title}</h1>
                    <button 
                      onClick={() => {
                        if (editedTitle === null) setEditedTitle(title);
                        setIsEditingTitle(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Metadata Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>{speakers} Speaker{speakers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>{language}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-emerald-100/80 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-mono text-emerald-700">{duration}</span>
                  </div>
                </div>
                    
                    {/* Action Buttons - aligned right */}
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        {/* Favorite */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                              <Star className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Favorite</TooltipContent>
                        </Tooltip>
                        
                        {/* Remix */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Remix</TooltipContent>
                        </Tooltip>
                        
                        {/* Copy */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleCopy}
                              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Transcript</TooltipContent>
                        </Tooltip>
                        
                        {/* Share */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleShare}
                              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Share</TooltipContent>
                        </Tooltip>
                        
                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleDelete}
                              className="p-2.5 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      
                      {/* Translate Button */}
                      <Popover open={showTranslatePopover} onOpenChange={setShowTranslatePopover}>
                        <PopoverTrigger asChild>
                          <button className="px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5" />
                            Translate
                          </button>
                        </PopoverTrigger>
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
                      
                </div>
              </div>
            </div>
            
            {/* 2-Column Layout */}
            <div className="flex-1 flex overflow-hidden px-6 py-6 gap-6">
              {/* Left Column - Media Player */}
              <div className="w-[480px] flex-shrink-0 flex flex-col">
                <div className="sticky top-0">
                  {/* Media Player Card */}
                  <div className="waveform-container rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-emerald-100/50 via-cyan-50/30 to-blue-100/50">
                    {/* Waveform Visualization Area */}
                    <div className="relative aspect-[4/3] p-8 flex items-center justify-center group/waveform bg-gradient-to-br from-emerald-100/50 via-cyan-50/30 to-blue-100/50">
                      {/* Audio Waveform Visualization */}
                      <div className="flex items-center justify-center gap-[3px] h-32">
                        {[...Array(50)].map((_, i) => {
                          const heightPattern = [
                            0.3, 0.5, 0.4, 0.6, 0.8, 0.6, 0.9, 0.7, 0.5, 0.8,
                            1, 0.9, 0.7, 0.5, 0.3, 0.2, 0.3, 0.5, 0.8, 1,
                            0.8, 0.6, 0.9, 1, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7,
                            0.9, 1, 0.8, 0.5, 0.3, 0.2, 0.4, 0.6, 0.8, 0.5,
                            0.7, 0.9, 0.6, 0.4, 0.8, 1, 0.7, 0.5, 0.3, 0.6
                          ];
                          const height = heightPattern[i % heightPattern.length] * 100;
                          return (
                            <div
                              key={i}
                              className="w-[4px] rounded-full bg-emerald-400/80 transition-all duration-300"
                              style={{
                                height: `${height}%`,
                                animation: isPlaying ? `waveformPulse 1s ease-in-out infinite ${i * 0.04}s` : 'none',
                              }}
                            />
                          );
                        })}
                      </div>
                      
                      <style>{`
                        @keyframes waveformPulse {
                          0%, 100% { transform: scaleY(1); }
                          50% { transform: scaleY(0.6); }
                        }
                      `}</style>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-gray-900/80 text-white text-sm font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {duration}
                      </div>
                      
                      {/* Fullscreen Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                const waveformArea = document.querySelector('.waveform-container') as HTMLElement;
                                if (waveformArea) {
                                  if (document.fullscreenElement) {
                                    document.exitFullscreen();
                                  } else {
                                    waveformArea.requestFullscreen().catch(err => {
                                      console.log('Fullscreen error:', err);
                                    });
                                  }
                                }
                              }}
                              className="absolute bottom-4 right-4 p-2 rounded-lg bg-gray-900/80 text-white hover:bg-gray-900 transition-colors z-10"
                            >
                              <Maximize className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Full-Screen</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Play Button Overlay - shows when not playing */}
                      {!isPlaying && resolvedAudioUrl && (
                        <button
                          onClick={togglePlayPause}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-emerald-600 ml-1" />
                          </div>
                        </button>
                      )}
                      
                      {/* Pause Button Overlay - shows on hover when playing */}
                      {isPlaying && resolvedAudioUrl && (
                        <button
                          onClick={togglePlayPause}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 group-hover/waveform:opacity-100 group-hover/waveform:bg-black/10 transition-all duration-200"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                            <Pause className="w-7 h-7 text-emerald-600" />
                          </div>
                        </button>
                      )}
                    </div>
                    
                    {/* Playback Controls - All in one row */}
                    {resolvedAudioUrl && (
                      <div className="p-4 bg-white/80 border-t border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>
                          
                          <span className="text-xs text-gray-600 font-mono min-w-[36px]">{formatTime(currentTime)}</span>
                          
                          <div 
                            ref={progressBarRef}
                            className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative group"
                            onMouseDown={handleDragStart}
                            onClick={handleSeek}
                          >
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: isValidDuration(audioDuration) ? `${(currentTime / audioDuration) * 100}%` : '0%' }}
                            />
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-emerald-500 hover:scale-125 transition-transform ${isDragging ? 'scale-125' : ''}`}
                              style={{ left: `calc(${isValidDuration(audioDuration) ? (currentTime / audioDuration) * 100 : 0}% - 6px)` }}
                            />
                          </div>
                          
                          <span className="text-xs text-gray-600 font-mono min-w-[36px]">{isValidDuration(audioDuration) ? formatTime(audioDuration) : duration}</span>
                          
                          {/* Speed Control */}
                          <select 
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            className="px-2 py-1.5 rounded-lg bg-gray-100 border-0 text-xs text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                          
                          {/* Volume Control */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
                                <Volume2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-10 p-2 bg-white border-gray-200" side="top">
                              <div className="relative h-24 flex items-center justify-center">
                                <div className="relative h-full w-2 bg-gray-300 rounded-full flex flex-col-reverse">
                                  <div 
                                    className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-full"
                                    style={{ height: `${volume}%` }}
                                  />
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full opacity-0 cursor-pointer"
                                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                                  />
                                  <div 
                                    className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-emerald-500 pointer-events-none"
                                    style={{ bottom: `calc(${volume}% - 6px)` }}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* No Audio State */}
                  {!resolvedAudioUrl && (
                    <button
                      onClick={() => attachAudioInputRef.current?.click()}
                      disabled={isUploadingAudio}
                      className="mt-4 w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  )}
                </div>
              </div>
              
              {/* Right Column - Transcript Content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header with tabs */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  {/* Main Tabs Row */}
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'transcript', label: 'Transcript', icon: FileText },
                      { id: 'summary', label: 'Summary', icon: Sparkles },
                      { id: 'speakers', label: 'Speakers', icon: Users },
                      { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all border ${
                          activeTab === tab.id 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sub-tabs row - Original / New Language (visible on all tabs when translation exists) */}
                  {selectedTranslation && (
                    <div className="flex items-center gap-1 mt-3">
                      <button 
                        onClick={() => setActiveTranslationTab('original')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          activeTranslationTab === 'original'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Original
                      </button>
                      <button 
                        onClick={() => setActiveTranslationTab('translated')}
                        className={`px-3 py-1.5 rounded-l-full text-xs font-medium flex items-center gap-1 transition-colors ${
                          activeTranslationTab === 'translated'
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        <Languages className="w-3 h-3" />
                        {selectedTranslation}
                      </button>
                      <button 
                        onClick={handleRemoveTranslation}
                        className={`px-1.5 py-1.5 rounded-r-full transition-colors ${
                          activeTranslationTab === 'translated'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto" ref={transcriptContainerRef}>
                  {activeTab === 'transcript' && (
                    <div className="space-y-1 px-2 overflow-visible">
                      {isTranslating && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                          <span className="ml-3 text-gray-500">Translating...</span>
                        </div>
                      )}
                      {!isTranslating && displayContent.map((item, i) => {
                        const isSelected = selectedLineIndex === i;
                        const isHidden = hiddenLines.has(i);
                        const isInSelection = selectedLines.has(i);
                        
                        // Check if there's an active text selection in this segment
                        const hasActiveSelection = textSelection && textSelection.segmentIndex === i && textSelection.start !== textSelection.end;
                        // Show toolbar when selected, editing, OR has active text selection
                        const showToolbar = isSelected || editingLineIndex === i || hasActiveSelection;
                        
                        return (
                          <div key={i} className={`relative overflow-visible transition-[margin] duration-200 ${i === 0 && showToolbar ? 'mt-10' : ''}`}>
                            {/* Floating Toolbar - appears between segments (also show when editing or text selected) */}
                            {showToolbar && (
                              <TooltipProvider delayDuration={200}>
                                <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-50 animate-fade-in">
                                  <div className="flex items-center gap-0.5 px-2 py-1.5 bg-sidebar rounded-lg shadow-xl border border-gray-700">
                                    {/* Play */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playSegmentOnly(item.time, item.endTime);
                                          }}
                                          className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                        >
                                          <Play className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">Play Clip</TooltipContent>
                                    </Tooltip>
                                    
                                    {/* AI Writer */}
                                    <Popover open={showAIWriterDropdown === i} onOpenChange={(open) => {
                                      if (open) {
                                        // Capture selection before popover opens
                                        if (editingLineIndex === i) {
                                          const textarea = editTextareaRefs.current[i];
                                          if (textarea) {
                                            const start = textarea.selectionStart ?? 0;
                                            const end = textarea.selectionEnd ?? 0;
                                            if (start !== end) {
                                              pendingHighlightSelectionRef.current = { segmentIndex: i, start, end };
                                            }
                                          }
                                        } else {
                                          // Use textSelection if available
                                          if (textSelection && textSelection.segmentIndex === i && textSelection.start !== textSelection.end) {
                                            pendingHighlightSelectionRef.current = { segmentIndex: i, start: textSelection.start, end: textSelection.end };
                                          }
                                        }
                                      }
                                      setShowAIWriterDropdown(open ? i : null);
                                    }}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <PopoverTrigger asChild>
                                            <button
                                              onPointerDownCapture={(e) => {
                                                // Keep text selection from collapsing when opening the popover (Radix toggles onClick)
                                                e.preventDefault();
                                                e.stopPropagation();
                                              }}
                                              onMouseDownCapture={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                            >
                                              <Wand2 className="w-4 h-4" />
                                            </button>
                                          </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Writer</TooltipContent>
                                      </Tooltip>
                                      <PopoverContent 
                                        className="w-56 p-0 bg-white border-gray-200 shadow-xl" 
                                        side="bottom"
                                        align="start"
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                        onCloseAutoFocus={(e) => e.preventDefault()}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {/* Custom prompt input */}
                                        <div className="p-2 border-b border-gray-100">
                                          <input
                                            type="text"
                                            placeholder="Modify with a prompt"
                                            value={aiWriterPrompt}
                                            onChange={(e) => setAIWriterPrompt(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && aiWriterPrompt.trim()) {
                                                handleAIWriterAction(aiWriterPrompt, i);
                                                setAIWriterPrompt('');
                                              }
                                            }}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div className="py-1">
                                          <button
                                            onClick={() => handleAIWriterAction('Rephrase', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <Wand2 className="w-4 h-4" />
                                            Rephrase
                                          </button>
                                          <button
                                            onClick={() => handleAIWriterAction('Shorten', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <MinusCircle className="w-4 h-4" />
                                            Shorten
                                          </button>
                                          <button
                                            onClick={() => handleAIWriterAction('Expand', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <ArrowDownToLine className="w-4 h-4" />
                                            Expand
                                          </button>
                                          <button
                                            onClick={() => handleAIWriterAction('Formal', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <Briefcase className="w-4 h-4" />
                                            Formal
                                          </button>
                                          <button
                                            onClick={() => handleAIWriterAction('Casual', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <Umbrella className="w-4 h-4" />
                                            Casual
                                          </button>
                                          <button
                                            onClick={() => handleAIWriterAction('Simplify', i)}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                          >
                                            <FileTextIcon className="w-4 h-4" />
                                            Simplify
                                          </button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    
                                    {/* Highlight colors */}
                                    <Popover>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <PopoverTrigger asChild>
                                            <button
                                              onPointerDownCapture={(e) => {
                                                // Capture selection + keep it visible while the highlight picker is open
                                                e.preventDefault();
                                                e.stopPropagation();

                                                // Editing: use textarea selection
                                                if (editingLineIndex === i) {
                                                  const textarea = editTextareaRefs.current[i];
                                                  if (textarea) {
                                                    const start = textarea.selectionStart ?? 0;
                                                    const end = textarea.selectionEnd ?? 0;
                                                    if (start !== end) {
                                                      pendingHighlightSelectionRef.current = { segmentIndex: i, start, end };
                                                      setTextSelection({
                                                        segmentIndex: i,
                                                        start,
                                                        end,
                                                        text: textarea.value.substring(start, end),
                                                      });
                                                    }
                                                  }
                                                  return;
                                                }

                                                // Not editing: capture DOM selection within the segment text
                                                const root = segmentTextRefs.current[i];
                                                const selection = window.getSelection();
                                                if (root && selection && !selection.isCollapsed && selection.rangeCount > 0) {
                                                  const range = selection.getRangeAt(0);
                                                  if (root.contains(range.commonAncestorContainer)) {
                                                    const preRange = document.createRange();
                                                    preRange.selectNodeContents(root);
                                                    preRange.setEnd(range.startContainer, range.startOffset);
                                                    const rawStart = preRange.toString().length;
                                                    preRange.setEnd(range.endContainer, range.endOffset);
                                                    const rawEnd = preRange.toString().length;

                                                    const segmentText = editedContent[i]?.text || '';
                                                    const start = Math.max(0, Math.min(segmentText.length, Math.min(rawStart, rawEnd)));
                                                    const end = Math.max(0, Math.min(segmentText.length, Math.max(rawStart, rawEnd)));

                                                    if (start !== end) {
                                                      pendingHighlightSelectionRef.current = { segmentIndex: i, start, end };
                                                      setTextSelection({
                                                        segmentIndex: i,
                                                        start,
                                                        end,
                                                        text: segmentText.substring(start, end),
                                                      });
                                                      return;
                                                    }
                                                  }
                                                }

                                                // Fallback: use last stored selection
                                                if (textSelection && textSelection.segmentIndex === i && textSelection.start !== textSelection.end) {
                                                  pendingHighlightSelectionRef.current = {
                                                    segmentIndex: i,
                                                    start: textSelection.start,
                                                    end: textSelection.end,
                                                  };
                                                }
                                              }}
                                              onMouseDownCapture={(e) => {
                                                // Keep for mouse-only environments
                                                e.preventDefault();
                                                e.stopPropagation();
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                            >
                                              <div className="flex -space-x-1">
                                                <div className="w-3 h-3 rounded-full bg-yellow-200 border border-gray-600" />
                                                <div className="w-3 h-3 rounded-full bg-green-200 border border-gray-600" />
                                              </div>
                                            </button>
                                          </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Highlight</TooltipContent>
                                      </Tooltip>
                                      <PopoverContent 
                                        className="w-auto p-2 bg-white border-gray-200" 
                                        side="bottom"
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                        onCloseAutoFocus={(e) => e.preventDefault()}
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDownOutside={(e) => e.preventDefault()}
                                      >
                                        <div className="flex items-center gap-2">
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              applyHighlightForSegment(i, 'yellow');
                                            }}
                                            className={`w-6 h-6 rounded-full bg-yellow-200 border-2 border-yellow-400 hover:scale-110 transition-transform ${lineHighlights[i] === 'yellow' ? 'ring-2 ring-yellow-500 ring-offset-1' : ''}`}
                                          />
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              applyHighlightForSegment(i, 'green');
                                            }}
                                            className={`w-6 h-6 rounded-full bg-green-200 border-2 border-green-400 hover:scale-110 transition-transform ${lineHighlights[i] === 'green' ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                                          />
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              applyHighlightForSegment(i, 'blue');
                                            }}
                                            className={`w-6 h-6 rounded-full bg-blue-200 border-2 border-blue-400 hover:scale-110 transition-transform ${lineHighlights[i] === 'blue' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                          />
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              applyHighlightForSegment(i, 'pink');
                                            }}
                                            className={`w-6 h-6 rounded-full bg-pink-200 border-2 border-pink-400 hover:scale-110 transition-transform ${lineHighlights[i] === 'pink' ? 'ring-2 ring-pink-500 ring-offset-1' : ''}`}
                                          />
                                          <button
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeHighlightForSegment(i);
                                            }}
                                            className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                                          >
                                            <X className="w-3 h-3 text-gray-500" />
                                          </button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    
                                    {/* Comment */}
                                    <Popover open={openCommentPopover === i} onOpenChange={(open) => setOpenCommentPopover(open ? i : null)}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <PopoverTrigger asChild>
                                            <button
                                              onClick={(e) => e.stopPropagation()}
                                              className={`p-2 rounded-md transition-colors relative ${
                                                lineComments[i]?.some(c => !c.resolved)
                                                  ? 'text-amber-400 hover:bg-gray-700 hover:text-amber-300'
                                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                              }`}
                                            >
                                              <MessageSquare className="w-4 h-4" />
                                              {lineComments[i]?.filter(c => !c.resolved).length > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-[9px] text-white rounded-full flex items-center justify-center font-medium">
                                                  {lineComments[i].filter(c => !c.resolved).length}
                                                </span>
                                              )}
                                            </button>
                                          </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Comment</TooltipContent>
                                      </Tooltip>
                                      <PopoverContent 
                                        className="w-80 p-0 bg-white border-gray-200 shadow-xl" 
                                        side="bottom"
                                        align="start"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="max-h-80 overflow-y-auto">
                                          {/* Existing Comments */}
                                          {lineComments[i]?.map((comment) => (
                                            <div 
                                              key={comment.id} 
                                              className={`p-3 border-b border-gray-100 ${comment.resolved ? 'bg-gray-50 opacity-60' : ''}`}
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                                    {comment.author.charAt(0).toUpperCase()}
                                                  </div>
                                                  <div>
                                                    <p className="text-xs font-medium text-gray-900">{comment.author}</p>
                                                    <p className="text-[10px] text-gray-400">
                                                      {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  {!comment.resolved && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLineComments(prev => ({
                                                          ...prev,
                                                          [i]: prev[i].map(c => 
                                                            c.id === comment.id ? { ...c, resolved: true } : c
                                                          )
                                                        }));
                                                        toast.success('Comment resolved');
                                                      }}
                                                      className="p-1 text-gray-400 hover:text-emerald-500 hover:bg-gray-100 rounded"
                                                    >
                                                      <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                  )}
                                                  {comment.resolved && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLineComments(prev => ({
                                                          ...prev,
                                                          [i]: prev[i].filter(c => c.id !== comment.id)
                                                        }));
                                                        toast.success('Comment deleted');
                                                      }}
                                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                              <p className={`text-sm text-gray-700 mt-2 ${comment.resolved ? 'line-through' : ''}`}>
                                                {renderTextWithMentions(comment.text)}
                                              </p>
                                              
                                              {/* Replies */}
                                              {comment.replies.length > 0 && (
                                                <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                                                  {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="text-xs">
                                                      <div className="flex items-center gap-1.5">
                                                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white text-[8px] font-medium">
                                                          {reply.author.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{reply.author}</span>
                                                        <span className="text-gray-400">·</span>
                                                        <span className="text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                      </div>
                                                      <p className="text-gray-600 mt-0.5">{renderTextWithMentions(reply.text)}</p>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              
                                              {/* Reply Input */}
                                              {!comment.resolved && (
                                                <>
                                                  {showReplyFor === comment.id ? (
                                                    <div className="mt-2 relative">
                                                      <div className="flex gap-1.5">
                                                        <div className="relative flex-1">
                                                          <Input
                                                            placeholder="Reply... (use @ to mention)"
                                                            value={replyInputs[comment.id] || ''}
                                                            onChange={(e) => handleReplyInputChange(comment.id, e.target.value, e.target.selectionStart || 0)}
                                                            className="h-7 text-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                          />
                                                          {/* Mention dropdown for reply */}
                                                          {showMentionDropdown && mentionContext === 'reply' && mentionReplyId === comment.id && (
                                                            <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
{filteredMentionUsers.length > 0 ? (
                                                              filteredMentionUsers.map(user => (
                                                                  <button
                                                                    key={user.id}
                                                                    onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      insertMention(user.name);
                                                                    }}
                                                                    className="w-full px-3 py-1.5 text-left hover:bg-blue-100 focus:bg-blue-100 flex items-center gap-2"
                                                                  >
                                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                                      {user.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                      <p className="text-xs font-bold text-gray-900">{user.name}</p>
                                                                      <p className="text-[10px] text-gray-500">{user.email}</p>
                                                                    </div>
                                                                  </button>
                                                                ))
                                                              ) : (
                                                                <p className="px-3 py-2 text-xs text-gray-500">No users found</p>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <Button
                                                          size="sm"
                                                          className="h-7 px-2"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!replyInputs[comment.id]?.trim()) return;
                                                            setLineComments(prev => ({
                                                              ...prev,
                                                              [i]: prev[i].map(c => 
                                                                c.id === comment.id 
                                                                  ? { 
                                                                      ...c, 
                                                                      replies: [...c.replies, {
                                                                        id: crypto.randomUUID(),
                                                                        text: replyInputs[comment.id],
                                                                        author: 'You',
                                                                        createdAt: new Date()
                                                                      }]
                                                                    } 
                                                                  : c
                                                              )
                                                            }));
                                                            setReplyInputs(prev => ({ ...prev, [comment.id]: '' }));
                                                            setShowReplyFor(null);
                                                            toast.success('Reply added');
                                                          }}
                                                        >
                                                          <Check className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          className="h-7 px-2"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowReplyFor(null);
                                                          }}
                                                        >
                                                          <X className="w-3 h-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowReplyFor(comment.id);
                                                      }}
                                                      className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                                                    >
                                                      Reply
                                                    </button>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          ))}
                                          
                                          {/* Add Comment */}
                                          <div className="p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                                                Y
                                              </div>
                                              <span className="text-xs font-medium text-gray-700">Add A Comment</span>
                                            </div>
                                            <div className="relative">
                                              <textarea
                                                ref={commentInputRef}
                                                placeholder="Type your comment... (use @ to mention)"
                                                value={commentInput}
                                                onChange={handleCommentInputChange}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-emerald-500"
                                                rows={2}
                                              />
                                              {/* Mention dropdown */}
                                              {showMentionDropdown && mentionContext === 'comment' && (
                                                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                                  {filteredMentionUsers.length > 0 ? (
                                                                    filteredMentionUsers.map(user => (
                                                      <button
                                                        key={user.id}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          insertMention(user.name);
                                                        }}
                                                        className="w-full px-3 py-2 text-left hover:bg-blue-100 focus:bg-blue-100 flex items-center gap-2"
                                                      >
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                          {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                          <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                      </button>
                                                    ))
                                                  ) : (
                                                    <p className="px-3 py-2 text-sm text-gray-500">No users found</p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setCommentInput('');
                                                  setOpenCommentPopover(null);
                                                }}
                                                className="h-7 text-xs"
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (!commentInput.trim()) return;
                                                  const mentions = extractMentions(commentInput);
                                                  const newComment: Comment = {
                                                    id: crypto.randomUUID(),
                                                    text: commentInput,
                                                    author: 'You',
                                                    createdAt: new Date(),
                                                    resolved: false,
                                                    mentions,
                                                    replies: []
                                                  };
                                                  setLineComments(prev => ({
                                                    ...prev,
                                                    [i]: [...(prev[i] || []), newComment]
                                                  }));
                                                  setCommentInput('');
                                                  setOpenCommentPopover(null);
                                                  toast.success('Comment added');
                                                }}
                                                className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600"
                                              >
                                                Comment
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    
                                    {/* Hide */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setHiddenLines(prev => {
                                              const next = new Set(prev);
                                              if (next.has(i)) {
                                                next.delete(i);
                                              } else {
                                                next.add(i);
                                              }
                                              return next;
                                            });
                                            toast.success(isHidden ? 'Line shown' : 'Line hidden');
                                          }}
                                          className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                        >
                                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">{isHidden ? 'Show' : 'Hide'}</TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Copy */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(item.text);
                                            toast.success('Copied to clipboard');
                                          }}
                                          className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">Copy</TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Delete */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newContent = [...editedContent];
                                            newContent.splice(i, 1);
                                            setEditedContent(newContent);
                                            setSelectedLineIndex(null);
                                            toast.success('Line removed');
                                          }}
                                          className="p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">Remove</TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Download */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const blob = new Blob([item.text], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `segment-${item.time}.txt`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            toast.success('Segment downloaded');
                                          }}
                                          className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">Download</TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Divider */}
                                    <div className="w-px h-5 bg-gray-600 mx-1" />
                                    
                                    {/* More Options */}
                                    <DropdownMenu>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DropdownMenuTrigger asChild>
                                            <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                              <MoreVertical className="w-4 h-4" />
                                            </button>
                                          </DropdownMenuTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">More Options</TooltipContent>
                                      </Tooltip>
                                      <DropdownMenuContent align="end" className="w-44 bg-white border-gray-200">
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLines(prev => new Set([...prev, i]));
                                            toast.success('Added to selection');
                                          }}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          <Plus className="w-4 h-4" />
                                          <span>Add To Selection</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Keep only selected lines
                                            const linesToKeep = new Set(selectedLines);
                                            linesToKeep.add(i);
                                            const newContent = editedContent.filter((_, idx) => linesToKeep.has(idx));
                                            setEditedContent(newContent);
                                            setSelectedLines(new Set());
                                            setSelectedLineIndex(null);
                                            toast.success('Kept only selected lines');
                                          }}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span>Keep Only Selected</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </TooltipProvider>
                            )}
                            
                            {/* Segment Content */}
                            <div 
                              className={`group relative flex gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer min-h-fit ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-inset' 
                                  : isInSelection
                                    ? 'bg-blue-50/50 border-blue-300'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } ${isHidden ? 'opacity-40' : ''}`}
                              onClick={(e) => {
                                // If already editing this line, don't interfere
                                if (editingLineIndex === i) {
                                  e.stopPropagation();
                                  return;
                                }

                                e.stopPropagation();

                                // If user is selecting text, capture the selection (for text-level highlights) and do not enter edit
                                const selection = window.getSelection();
                                if (selection && !selection.isCollapsed && selection.toString().trim()) {
                                  handleTextSelection(i);
                                  return;
                                }

                                // Single-click to edit
                                setSelectedLineIndex(i);
                                setEditingLineIndex(i);
                              }}
                              onMouseUp={() => {
                                // Handle text selection on mouse up
                                const selection = window.getSelection();
                                if (selection && !selection.isCollapsed && selection.toString().trim()) {
                                  handleTextSelection(i);
                                }
                              }}
                            >
                              {/* Comment indicator - shows when there are unresolved comments - click to open popover */}
                              {lineComments[i]?.some(c => !c.resolved) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLineIndex(i);
                                    setOpenCommentPopover(i);
                                  }}
                                  className="absolute top-1 right-1 z-10 cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <div className="relative">
                                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md border-2 border-white">
                                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] text-white rounded-full flex items-center justify-center font-bold border border-white">
                                      {lineComments[i].filter(c => !c.resolved).length}
                                    </span>
                                  </div>
                                </button>
                              )}
                              <div className="flex-shrink-0 w-16">
                                <span 
                                  className={`text-xs font-mono px-2 py-1 rounded cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'text-blue-600 bg-blue-500/20 hover:bg-blue-500/30'
                                      : 'text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    jumpToTime(item.time);
                                  }}
                                >
                                  {item.time}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 overflow-visible">
                                <p className={`text-sm font-medium mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                  {item.speaker}
                                </p>
                                {editingLineIndex === i ? (
                                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="relative">
                                      <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 w-full p-2 rounded-lg border border-transparent text-gray-900 leading-relaxed whitespace-pre-wrap break-words"
                                      >
                                        {renderStaticHighlightedText(editedContent[i].text, i)}
                                      </div>
                                      <textarea
                                        ref={(el) => {
                                          editTextareaRefs.current[i] = el;
                                        }}
                                        value={editedContent[i].text}
                                        onChange={(e) => {
                                          const newContent = [...editedContent];
                                          newContent[i] = { ...newContent[i], text: e.target.value };
                                          setEditedContent(newContent);
                                        }}
                                        onSelect={(e) => {
                                          const el = e.currentTarget;
                                          const start = el.selectionStart ?? 0;
                                          const end = el.selectionEnd ?? 0;
                                          if (start === end) {
                                            setTextSelection(null);
                                            pendingHighlightSelectionRef.current = null;
                                            return;
                                          }

                                          setTextSelection({
                                            segmentIndex: i,
                                            start,
                                            end,
                                            text: el.value.substring(start, end),
                                          });
                                          pendingHighlightSelectionRef.current = { segmentIndex: i, start, end };
                                        }}
                                        className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-transparent caret-foreground leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
                                        style={{ WebkitTextFillColor: 'transparent', caretColor: 'hsl(var(--foreground))' }}
                                        rows={2}
                                        autoFocus
                                      />
                                    </div>
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
                                  <p
                                    ref={(el) => {
                                      segmentTextRefs.current[i] = el;
                                    }}
                                    className={`leading-relaxed whitespace-pre-wrap break-words ${isHidden ? 'italic' : ''} ${isSelected ? 'text-gray-800' : 'text-gray-900'}`}
                                  >
                                    {renderHighlightedText(item, i)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div className="pr-2">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-emerald-500" />
                          <h3 className="font-semibold text-gray-900">AI Summary</h3>
                        </div>
                        
                        {isGeneratingSummary ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-600">Generating summary...</span>
                          </div>
                        ) : aiSummary ? (
                          <p className="text-gray-700 leading-relaxed">
                            {activeSummaryTab === 'original' ? aiSummary : summaryTranslations[activeSummaryTab] || aiSummary}
                          </p>
                        ) : (
                          <p className="text-gray-500">No summary available. Click regenerate to generate one.</p>
                        )}
                        
                        <button 
                          onClick={() => generateAISummary(originalContent.map(c => c.text).join(' '))}
                          disabled={isGeneratingSummary}
                          className="mt-4 text-sm text-emerald-600 hover:text-emerald-500 flex items-center gap-1 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Regenerate Summary
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Key Points
                          </h4>
                          <ul className="space-y-2">
                            {['Main topic discussed', 'Key decisions made', 'Action items identified'].map((point, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Action Items
                          </h4>
                          <ul className="space-y-2">
                            {['Follow up on discussion', 'Schedule next meeting', 'Review materials'].map((item, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <div className="w-4 h-4 rounded border border-amber-500/30 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Languages className="w-4 h-4 text-purple-500" />
                          Translate Summary
                        </h4>
                        <div className="flex items-center gap-3">
                          <select 
                            value={selectedSummaryLang}
                            onChange={(e) => setSelectedSummaryLang(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none"
                          >
                            {LANGUAGES.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => translateSummary(selectedSummaryLang)}
                            disabled={isTranslatingSummary || !aiSummary}
                            className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-600 text-sm font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                          >
                            {isTranslatingSummary ? 'Translating...' : 'Translate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'speakers' && (
                    <div className="pr-2">
                      <p className="text-gray-500 mb-6">Identify and label speakers for better organization</p>
                      <div className="space-y-4">
                        {speakerData.map((speaker) => (
                          <div key={speaker.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${speaker.bgLight}`}>
                              <User className={`w-5 h-5 ${speaker.textColor}`} />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={speakerNames[speaker.id] || `Speaker ${speaker.id}`}
                                onChange={(e) => handleSpeakerNameChange(speaker.id, e.target.value)}
                                className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-0.5">
                                Spoke for ~{speaker.minutes} minutes ({Math.round((speaker.minutes / totalSpeakingMinutes) * 100)}%)
                              </p>
                            </div>
                            <button 
                              onClick={() => handleIdentifyVoice(speaker.id)}
                              disabled={identifyingVoice === speaker.id}
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                              {identifyingVoice === speaker.id ? (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Identifying...
                                </span>
                              ) : (
                                'Identify Voice'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="h-full flex flex-col pr-2">
                      {/* Chat Messages */}
                      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                        {chatMessages.length === 0 && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                            <p className="text-sm text-emerald-700">
                              Ask me anything about this transcript! I can help you find specific information, extract insights, or answer questions about what was discussed.
                            </p>
                          </div>
                        )}
                        
                        {chatMessages.map((msg, i) => (
                          <div 
                            key={i} 
                            className={`p-4 rounded-xl max-w-md ${
                              msg.role === 'user' 
                                ? 'bg-gray-100 border border-gray-200 ml-auto' 
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
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
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
                            className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

      {/* AI Writer Preview Modal */}
      <Dialog open={aiWriterModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseAIWriterModal();
        }
      }}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 rounded-xl overflow-hidden shadow-xl [&>button]:hidden">
          {/* Header with mode tabs */}
          <div className="bg-background border-b border-border">
            <div className="flex items-center justify-between px-5 py-3">
              <DialogTitle className="text-lg font-semibold text-foreground">
                AI Writer
              </DialogTitle>
              <button 
                onClick={handleCloseAIWriterModal}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mode Pills */}
            <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
              {/* Default modes */}
              {defaultModes.map((mode) => {
                const actionMap: Record<string, string> = {
                  'Rephrase': 'Rephrase',
                  'Formal': 'Make formal',
                  'Casual': 'Make casual',
                  'Shorten': 'Shorten',
                  'Expand': 'Elaborate',
                  'Simplify': 'Simplify'
                };
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (!aiWriterModalLoading && aiWriterOriginalText) {
                        handleRefineAIResult(actionMap[mode] || mode);
                      }
                    }}
                    disabled={aiWriterModalLoading}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                      aiWriterCurrentAction === (actionMap[mode] || mode)
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-background text-foreground border-border hover:border-emerald-400 hover:bg-emerald-50'
                    } disabled:opacity-50`}
                  >
                    {mode}
                  </button>
                );
              })}
              
              {/* Custom modes that user selected */}
              {customModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (!aiWriterModalLoading && aiWriterOriginalText) {
                      handleRefineAIResult(mode);
                    }
                  }}
                  disabled={aiWriterModalLoading}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                    aiWriterCurrentAction === mode
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-100'
                  } disabled:opacity-50`}
                >
                  {mode}
                </button>
              ))}
              
              {/* +X more button */}
              <button
                onClick={() => setShowMoreModesModal(true)}
                disabled={aiWriterModalLoading}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
              >
                +{totalExtraModes} more
              </button>
            </div>
          </div>
          
          {/* Two-column content */}
          <div className="grid grid-cols-2 divide-x divide-border min-h-[280px]">
            {/* Original Text Column */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</span>
                <span className="text-xs text-muted-foreground/60">({aiWriterOriginalText.split(/\s+/).filter(Boolean).length} words)</span>
              </div>
              <div className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4 max-h-52 overflow-y-auto">
                {aiWriterOriginalText || 'No text selected'}
              </div>
            </div>
            
            {/* AI Result Column */}
            <div className="p-5 bg-emerald-50/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">AI Result</span>
                  {aiWriterResults.length > 0 && !aiWriterModalLoading && (
                    <span className="text-xs text-muted-foreground/60">
                      ({aiWriterResults[aiWriterResultIndex]?.text.split(/\s+/).filter(Boolean).length || 0} words)
                    </span>
                  )}
                </div>
                {aiWriterResults.length > 1 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <button 
                      onClick={() => setAiWriterResultIndex(prev => Math.max(0, prev - 1))}
                      disabled={aiWriterResultIndex === 0}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span>{aiWriterResultIndex + 1}/{aiWriterResults.length}</span>
                    <button 
                      onClick={() => setAiWriterResultIndex(prev => Math.min(aiWriterResults.length - 1, prev + 1))}
                      disabled={aiWriterResultIndex === aiWriterResults.length - 1}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-foreground leading-relaxed bg-background rounded-lg p-4 max-h-52 overflow-y-auto border border-emerald-200">
                {aiWriterModalLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Generating...</span>
                  </div>
                ) : aiWriterResults.length > 0 ? (
                  aiWriterResults[aiWriterResultIndex]?.text
                ) : (
                  <span className="text-muted-foreground italic">Select a mode above to generate</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-5 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
            {/* Refine Input */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Refine with custom instructions..."
                value={aiWriterRefinePrompt}
                onChange={(e) => setAiWriterRefinePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && aiWriterRefinePrompt.trim()) {
                    handleRefineAIResult();
                  }
                }}
                disabled={aiWriterModalLoading || aiWriterResults.length === 0}
                className="flex-1 px-4 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => aiWriterRefinePrompt.trim() && handleRefineAIResult()}
                disabled={aiWriterModalLoading || !aiWriterRefinePrompt.trim()}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetryAIWriter}
                disabled={aiWriterModalLoading}
                className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                title="Try again"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
              
              {/* Vertical divider with equal spacing */}
              <div className="h-6 w-px bg-border mx-1" />
              
              <button 
                onClick={() => toast.success('Thanks for the feedback!')}
                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-emerald-600 transition-colors"
                title="Helpful"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toast.info('Thanks for the feedback!')}
                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                title="Not helpful"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  if (aiWriterResults.length > 0) {
                    navigator.clipboard.writeText(aiWriterResults[aiWriterResultIndex]?.text || '');
                    toast.success('Copied to clipboard');
                  }
                }}
                disabled={aiWriterModalLoading || aiWriterResults.length === 0}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              
              <button
                onClick={applyAIWriterResult}
                disabled={aiWriterModalLoading || aiWriterResults.length === 0}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Replace
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The AI-generated content has not been inserted. Are you sure you want to discard it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowDiscardConfirm(false);
              setAiWriterModalOpen(false);
              resetAIWriterModal();
            }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More Rewrite Options Modal */}
      <Dialog open={showMoreModesModal} onOpenChange={setShowMoreModesModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:hidden">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">More Rewrite Options</DialogTitle>
              <button 
                onClick={() => setShowMoreModesModal(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Common */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Common</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.common.map((mode) => {
                  const isSelected = customModes.includes(mode) || defaultModes.includes(mode);
                  const isDefault = defaultModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        if (isDefault) return;
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isDefault
                          ? 'bg-muted/50 text-muted-foreground border-border cursor-default'
                          : isSelected
                            ? 'bg-muted text-foreground border-muted-foreground/30'
                            : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Style and voice */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Style and voice</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.styleAndVoice.map((mode) => {
                  const isSelected = customModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-muted text-foreground border-muted-foreground/30'
                          : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Mood and emotion */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Mood and emotion</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.moodAndEmotion.map((mode) => {
                  const isSelected = customModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-muted text-foreground border-muted-foreground/30'
                          : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Clarity and concision */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Clarity and concision</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.clarityAndConcision.map((mode) => {
                  const isSelected = customModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-muted text-foreground border-muted-foreground/30'
                          : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Depth and detail */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Depth and detail</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.depthAndDetail.map((mode) => {
                  const isSelected = customModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-muted text-foreground border-muted-foreground/30'
                          : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Originality and creativity */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Originality and creativity</h3>
              <div className="grid grid-cols-3 gap-2">
                {allWritingModes.originalityAndCreativity.map((mode) => {
                  const isSelected = customModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setCustomModes(prev => 
                          prev.includes(mode) 
                            ? prev.filter(m => m !== mode)
                            : [...prev, mode]
                        );
                      }}
                      className={`px-4 py-2.5 text-sm rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-muted text-foreground border-muted-foreground/30'
                          : 'bg-background text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-border pt-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCustomModes([])}
              className="px-6"
            >
              Reset
            </Button>
            <Button
              onClick={() => setShowMoreModesModal(false)}
              className="px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              Select
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
