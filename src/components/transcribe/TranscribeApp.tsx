import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Upload, Link2, Play, Pause, Download, Edit3, Sparkles, 
  Search, Folder, Tag, Clock, User, Globe, FileText, Copy, 
  Share2, Trash2, MoreVertical, ChevronDown, Check, X, 
  Volume2, VolumeX, Settings, Filter, Grid, List, Star,
  MessageSquare, Zap, Languages, FileDown, AlertCircle,
  StopCircle, RotateCcw, ChevronRight, Wand2, Users,
  BookOpen, Subtitles, Hash, Calendar, TrendingUp, Loader2
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

// Platform icons data with real brand logos
const PLATFORMS = [
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'X', icon: FaXTwitter, color: '#000000' },
  { name: 'Vimeo', icon: FaVimeo, color: '#1AB7EA' },
  { name: 'Google Drive', icon: FaGoogleDrive, color: '#4285F4' },
];

// Mock transcript data
const MOCK_TRANSCRIPTS = [
  {
    id: 1,
    title: 'Product Launch Meeting - Q4 Strategy',
    duration: '45:32',
    date: '2025-12-17',
    source: 'recording',
    status: 'completed',
    speakers: 4,
    language: 'English',
    words: 6840,
    starred: true,
    tags: ['Meeting', 'Strategy'],
    thumbnail: null,
    summary: 'Discussion of Q4 product launch timeline, marketing strategy, and resource allocation.',
  },
  {
    id: 2,
    title: 'Customer Interview - Sarah Chen',
    duration: '28:15',
    date: '2025-12-16',
    source: 'upload',
    status: 'completed',
    speakers: 2,
    language: 'English',
    words: 4230,
    starred: false,
    tags: ['Interview', 'Research'],
    thumbnail: null,
    summary: 'User feedback session covering pain points and feature requests for the mobile app.',
  },
  {
    id: 3,
    title: 'AI Trends 2025 - YouTube Analysis',
    duration: '12:47',
    date: '2025-12-15',
    source: 'link',
    status: 'completed',
    speakers: 1,
    language: 'English',
    words: 2100,
    starred: true,
    tags: ['Research', 'AI'],
    thumbnail: null,
    summary: 'Overview of emerging AI trends including multimodal models and agent frameworks.',
  },
  {
    id: 4,
    title: 'Spanish Podcast - Marketing Tips',
    duration: '34:22',
    date: '2025-12-14',
    source: 'upload',
    status: 'processing',
    speakers: 2,
    language: 'Spanish',
    words: null,
    starred: false,
    tags: ['Podcast', 'Marketing'],
    thumbnail: null,
    summary: null,
  },
  {
    id: 5,
    title: 'Team Standup - December 13',
    duration: '15:08',
    date: '2025-12-13',
    source: 'recording',
    status: 'completed',
    speakers: 6,
    language: 'English',
    words: 2450,
    starred: false,
    tags: ['Meeting', 'Daily'],
    thumbnail: null,
    summary: 'Daily standup covering sprint progress, blockers, and upcoming deadlines.',
  },
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Polish', 'Vietnamese', 'Thai', 'Indonesian'
];

interface Transcript {
  id: number;
  title: string;
  duration: string;
  date: string;
  source: string;
  status: string;
  speakers: number;
  language: string;
  words: number | null;
  starred: boolean;
  tags: string[];
  thumbnail: string | null;
  summary: string | null;
}

export default function TranscribeApp() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTranscripts, setSelectedTranscripts] = useState<number[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>(MOCK_TRANSCRIPTS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [downloadTranscript, setDownloadTranscript] = useState<Transcript | null>(null);
  const [shareTranscript, setShareTranscript] = useState<Transcript | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranscriptionEnabled, setLiveTranscriptionEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleUrlSubmit = async (url: string) => {
    if (!url) return;
    
    // Create a new processing transcript
    const newTranscript: Transcript = {
      id: Date.now(),
      title: `Processing: ${url.substring(0, 50)}...`,
      duration: '--:--',
      date: new Date().toISOString().split('T')[0],
      source: 'link',
      status: 'processing',
      speakers: 1,
      language: 'Detecting...',
      words: null,
      starred: false,
      tags: ['Link'],
      thumbnail: null,
      summary: null,
    };
    
    setTranscripts(prev => [newTranscript, ...prev]);
    setUrlInput('');
    
    // TODO: Call the actual transcription API here
    // For now, simulate processing completion after 3 seconds
    setTimeout(() => {
      setTranscripts(prev => prev.map(t => 
        t.id === newTranscript.id 
          ? { 
              ...t, 
              title: 'Transcribed from URL', 
              status: 'completed',
              duration: '05:32',
              language: 'English',
              words: 850,
              summary: 'Transcription from uploaded URL'
            } 
          : t
      ));
    }, 3000);
  };

  const handleDownload = (transcript: Transcript) => {
    setDownloadTranscript(transcript);
    setShowDownloadModal(true);
  };

  const handleDelete = (id: number) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
  };

  const handleShare = (transcript: Transcript) => {
    setShareTranscript(transcript);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    if (shareTranscript) {
      navigator.clipboard.writeText(`https://app.transcribe.com/transcript/share/${shareTranscript.id}`);
    }
  };

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Speech recognition for live transcription
  useEffect(() => {
    if (isRecording && liveTranscriptionEnabled) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setLiveTranscript(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isRecording, liveTranscriptionEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleEdit = (transcript: Transcript) => {
    const params = new URLSearchParams({
      title: transcript.title,
      duration: transcript.duration,
      speakers: String(transcript.speakers),
      language: transcript.language,
      summary: transcript.summary || ''
    });
    navigate(`/transcribe/${transcript.id}?${params.toString()}`);
  };

  const handleUse = (transcript: Transcript) => {
    const params = new URLSearchParams({
      title: transcript.title,
      duration: transcript.duration,
      speakers: String(transcript.speakers),
      language: transcript.language,
      summary: transcript.summary || ''
    });
    navigate(`/transcribe/${transcript.id}?${params.toString()}`);
  };

  const toggleStar = (id: number) => {
    setTranscripts(prev => prev.map(t => 
      t.id === id ? { ...t, starred: !t.starred } : t
    ));
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'youtube': 
      case 'link': 
        return <Link2 className="w-5 h-5 text-blue-500" />;
      case 'recording': 
        return <Mic className="w-5 h-5 text-rose-500" />;
      case 'upload': 
        return <Upload className="w-5 h-5 text-emerald-500" />;
      default: 
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'starred') return matchesSearch && t.starred;
    if (activeFilter === 'processing') return matchesSearch && t.status === 'processing';
    return matchesSearch && t.source === activeFilter;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Inter',sans-serif]">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Subtitles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  <span className="text-gray-900">TRAN</span>
                  <span className="text-emerald-500">SCRIBE</span>
                </h1>
                <p className="text-sm text-gray-500">AI-Powered Transcriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </header>

        {/* Input Options - 3 Horizontal Boxes */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Upload Audio */}
            <button
              onClick={() => setShowUploadModal(true)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                setShowUploadModal(true);
              }}
              className={`group relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragOver 
                  ? 'border-emerald-400 bg-emerald-500/10' 
                  : 'border-gray-400 bg-gray-50 hover:border-emerald-400/50 hover:bg-emerald-50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                  dragOver 
                    ? 'bg-emerald-500/20' 
                    : 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 group-hover:from-emerald-500/20 group-hover:to-emerald-600/20'
                }`}>
                  <Upload className={`w-9 h-9 transition-all duration-300 ${
                    dragOver ? 'text-emerald-500 scale-110' : 'text-emerald-500 group-hover:scale-110'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload File</h3>
                <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 bg-white flex items-center justify-center gap-2 mb-4">
                  <Upload className="w-[22px] h-[22px] text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-gray-500 whitespace-nowrap">Drag & Drop Your Video Or Audio File Here</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 items-center">
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">.mp3</span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">.wav</span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">.mp4</span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">.mov</span>
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-xs text-emerald-600 font-medium">+ more</span>
                </div>
              </div>
            </button>

            {/* Upload Link */}
            <div
              className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-blue-400/50 hover:bg-blue-50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 group-hover:from-blue-500/20 group-hover:to-blue-600/20 flex items-center justify-center mb-5 transition-all duration-300">
                  <Link2 className="w-9 h-9 text-blue-500 group-hover:scale-110 transition-all duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Link</h3>
                <div className="mt-3 w-full">
                  <div className="relative flex items-center justify-center">
                    <Link2 className="absolute left-4 w-[22px] h-[22px] text-blue-500 pointer-events-none flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Paste A Supported Public Media Link"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && urlInput.trim()) {
                          e.preventDefault();
                          handleUrlSubmit(urlInput.trim());
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('text');
                        if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
                          setTimeout(() => handleUrlSubmit(pastedText.trim()), 100);
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-gray-400 text-sm text-gray-900 placeholder-gray-500 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {PLATFORMS.slice(0, 7).map((platform, i) => (
                    <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +43
                  </div>
                </div>
              </div>
            </div>

            {/* Record Audio */}
            <button
              onClick={() => setShowRecordModal(true)}
              className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-rose-400/50 hover:bg-rose-50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/10 group-hover:from-rose-500/20 group-hover:to-rose-600/20 flex items-center justify-center mb-5 transition-all duration-300">
                  <Mic className="w-9 h-9 text-rose-500 group-hover:scale-110 transition-all duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Record Audio</h3>
                <p className="text-sm text-gray-500">Click To Start Recording</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wide">Live</span>
                  Real-Time Transcription Available
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Transcripts Section */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Transcripts
              </h2>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                {transcripts.length} Files
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Transcripts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-all ${
                    activeFilter !== 'all' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  <ChevronDown className="w-4 h-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-white border border-gray-200 shadow-xl z-50">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'starred', label: 'Starred' },
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => { setActiveFilter(filter.id); setFilterOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          activeFilter === filter.id ? 'text-emerald-600' : 'text-gray-600'
                        }`}
                      >
                        {filter.label}
                        {activeFilter === filter.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* View Toggle */}
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button 
                  onClick={() => setActiveView('list')}
                  className={`p-2 rounded-lg transition-all ${activeView === 'list' ? 'bg-emerald-500/20 text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveView('grid')}
                  className={`p-2 rounded-lg transition-all ${activeView === 'grid' ? 'bg-emerald-500/20 text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Transcripts List */}
          {activeView === 'list' ? (
            <div className="space-y-3">
              {filteredTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  onClick={() => handleEdit(transcript)}
                  className="group relative p-5 rounded-2xl bg-gray-50 border border-gray-400 hover:bg-gray-100 hover:border-gray-500 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    {/* Thumbnail / Icon */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      {getSourceIcon(transcript.source)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {transcript.title}
                          </h3>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStar(transcript.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star className={`w-4 h-4 ${transcript.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {transcript.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(transcript.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {transcript.speakers} Speakers
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          {transcript.language}
                        </span>
                        {transcript.words && (
                          <span className="flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5" />
                            {transcript.words.toLocaleString()} Words
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-3">
                        {transcript.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-gray-200 text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Processing indicator on far right */}
                    {transcript.status === 'processing' && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm font-medium animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Processing...
                      </div>
                    )}

                    {/* Actions */}
                    <TooltipProvider>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUse(transcript); }}
                          disabled={transcript.status === 'processing'}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Use
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(transcript); }}
                          disabled={transcript.status === 'processing'}
                          className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(transcript.title);
                                alert('Transcript title copied!');
                              }}
                              disabled={transcript.status === 'processing'}
                              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleShare(transcript); }}
                              disabled={transcript.status === 'processing'}
                              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(transcript.id); }}
                              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  onClick={() => handleEdit(transcript)}
                  className="group relative p-5 rounded-2xl bg-gray-50 border border-gray-400 hover:bg-gray-100 hover:border-gray-500 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                      {getSourceIcon(transcript.source)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(transcript.id); }}>
                        <Star className={`w-4 h-4 ${transcript.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(transcript.id); }}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
                    {transcript.title}
                  </h3>

                  {transcript.summary && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{transcript.summary}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {transcript.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-200 text-xs text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {transcript.duration}
                    </span>
                    <span>{formatDate(transcript.date)}</span>
                  </div>

                  {transcript.status === 'processing' ? (
                    <div className="flex items-center justify-end gap-2 text-amber-600 text-sm font-medium animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Processing...
                    </div>
                  ) : (
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUse(transcript); }}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Use
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(transcript); }}
                          className="flex-1 py-2 rounded-xl bg-gray-100 border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(transcript.title);
                                alert('Transcript title copied!');
                              }}
                              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleShare(transcript); }}
                              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#141419] rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Upload File To Transcribe</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-12 rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-400/50 bg-white/[0.02] hover:bg-emerald-500/5 cursor-pointer transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Upload className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Drag & drop your audio file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <p className="text-xs text-gray-500">
                  Supported: MP3, WAV, M4A, FLAC, OGG, WMA • Max 500MB
                </p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" />

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Transcription Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Language</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="auto">Auto-Detect</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Speaker Detection</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="auto">Auto-Detect Speakers</option>
                    <option value="1">1 speaker</option>
                    <option value="2">2 speakers</option>
                    <option value="3">3-4 speakers</option>
                    <option value="5">5+ speakers</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500/20" defaultChecked />
                  Generate AI Summary
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500/20" defaultChecked />
                  Include Timestamps
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Start Transcription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#141419] rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Transcribe From URL</h2>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-6">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="url"
                placeholder="Paste Any Public Media Link To Extract Audio"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <h3 className="text-sm font-medium text-white mb-4">Supported Platforms (50+)</h3>
              <div className="grid grid-cols-4 gap-3">
                {PLATFORMS.map((platform, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                    <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                    <span className="text-xs text-gray-400">{platform.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-gray-400">+43 more platforms</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Transcription Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Language</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50">
                    <option value="auto">Auto-Detect</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Output Format</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50">
                    <option value="transcript">Full Transcript</option>
                    <option value="srt">SRT Subtitles</option>
                    <option value="vtt">VTT Subtitles</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20" defaultChecked />
                  Generate AI Summary
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/20" />
                  Translate to English
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowLinkModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={!urlInput}
                className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Extract & Transcribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#141419] rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Record Audio To Transcribe</h2>
              <button 
                onClick={() => { setShowRecordModal(false); setIsRecording(false); setRecordingTime(0); setLiveTranscript(''); }}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center py-8">
              {/* Recording Visualization */}
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                isRecording 
                  ? 'bg-rose-500/20' 
                  : 'bg-white/5'
              }`}>
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-rose-500/10 animate-pulse" />
                  </>
                )}
              <button
                  onClick={async () => {
                    if (isRecording) {
                      // Stop recording
                      if (mediaRecorderRef.current) {
                        mediaRecorderRef.current.stop();
                      }
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                      }
                      setIsRecording(false);
                    } else {
                      // Start recording
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;
                        audioChunksRef.current = [];
                        
                        const mediaRecorder = new MediaRecorder(stream);
                        mediaRecorderRef.current = mediaRecorder;
                        
                        mediaRecorder.ondataavailable = (e) => {
                          if (e.data.size > 0) {
                            audioChunksRef.current.push(e.data);
                          }
                        };
                        
                        mediaRecorder.start(100);
                        setIsRecording(true);
                        setRecordingTime(0);
                      } catch (err) {
                        console.error('Error accessing microphone:', err);
                      }
                    }
                  }}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-rose-500 hover:bg-rose-400' 
                      : 'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500'
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
              </div>

              {/* Timer */}
              <div className="text-4xl font-mono text-white mb-2">
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm text-gray-500">
                {isRecording ? 'Recording...' : 'Click To Start Recording'}
              </p>

              {/* Live Waveform Placeholder */}
              {isRecording && (
                <div className="flex items-center gap-1 mt-6">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 24 + 8}px`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  Live Transcription
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={liveTranscriptionEnabled}
                    onChange={(e) => setLiveTranscriptionEnabled(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              {liveTranscriptionEnabled && liveTranscript ? (
                <div className="min-h-[60px] max-h-[120px] overflow-y-auto">
                  <p className="text-sm text-white leading-relaxed">{liveTranscript}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {liveTranscriptionEnabled 
                    ? (isRecording ? 'Listening...' : 'Start recording to see your words appear')
                    : 'Live transcription disabled'
                  }
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Language</label>
                <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500/50">
                  <option value="auto">Auto-Detect</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Audio Quality</label>
                <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500/50">
                  <option value="high">High Quality</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low (smaller file)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => { setRecordingTime(0); setLiveTranscript(''); }}
                disabled={recordingTime === 0}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button 
                disabled={recordingTime === 0 || isRecording || isSaving || audioChunksRef.current.length === 0}
                onClick={async () => {
                  if (audioChunksRef.current.length === 0) return;
                  
                  setIsSaving(true);
                  try {
                    // Create audio blob
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    
                    // Convert to base64
                    const reader = new FileReader();
                    const base64Promise = new Promise<string>((resolve) => {
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                      };
                    });
                    reader.readAsDataURL(audioBlob);
                    const base64Audio = await base64Promise;
                    
                    // Upload to Cloudinary
                    const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-audio', {
                      body: {
                        audioBase64: base64Audio,
                        filename: `recording-${Date.now()}.webm`,
                        contentType: 'audio/webm'
                      }
                    });
                    
                    if (uploadError) throw uploadError;
                    
                    // Create transcript entry
                    const newTranscript: Transcript = {
                      id: Date.now(),
                      title: `Recording ${new Date().toLocaleTimeString()}`,
                      duration: formatTime(recordingTime),
                      date: new Date().toISOString().split('T')[0],
                      source: 'recording',
                      status: 'processing',
                      speakers: 1,
                      language: 'Detecting...',
                      words: null,
                      starred: false,
                      tags: ['Recording'],
                      thumbnail: null,
                      summary: liveTranscript || null,
                    };
                    
                    setTranscripts(prev => [newTranscript, ...prev]);
                    
                    // Start transcription
                    const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
                      body: {
                        audioUrl: uploadData?.url,
                        filename: `recording-${Date.now()}.webm`
                      }
                    });
                    
                    // Update transcript with results
                    setTranscripts(prev => prev.map(t => 
                      t.id === newTranscript.id 
                        ? { 
                            ...t, 
                            status: transcribeError ? 'error' : 'completed',
                            summary: transcribeData?.text || liveTranscript || 'Transcription completed',
                            language: 'English',
                            words: transcribeData?.text?.split(' ').length || null
                          } 
                        : t
                    ));
                    
                    // Close modal and reset
                    setShowRecordModal(false);
                    setRecordingTime(0);
                    setLiveTranscript('');
                    audioChunksRef.current = [];
                    
                  } catch (err) {
                    console.error('Error saving recording:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save & Transcribe'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail/Edit Modal */}
      {showDetailModal && selectedTranscript && (
        <TranscriptDetailModal 
          transcript={selectedTranscript} 
          onClose={() => { setShowDetailModal(false); setSelectedTranscript(null); }}
        />
      )}

      {/* Download Modal */}
      {showDownloadModal && downloadTranscript && (
        <DownloadModal 
          transcript={downloadTranscript}
          onClose={() => { setShowDownloadModal(false); setDownloadTranscript(null); }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-500" />
                Share Transcript
              </h2>
              <button 
                onClick={() => { setShowShareModal(false); setShareTranscript(null); }}
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
                value={`https://app.transcribe.com/transcript/share/${shareTranscript.id}`}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-blue-200 text-sm text-gray-700 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                copyShareLink();
                setShowShareModal(false);
                setShareTranscript(null);
              }}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              COPY SECURE LINK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Download Modal Component
type DownloadFormat = 'pdf' | 'docx' | 'txt' | 'srt' | 'vtt' | 'xml' | 'fcpxml' | 'audio';

function DownloadModal({ transcript, onClose }: { transcript: Transcript; onClose: () => void }) {
  const [format, setFormat] = useState<DownloadFormat>('pdf');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  const FORMAT_OPTIONS = [
    { id: 'pdf' as DownloadFormat, label: 'PDF', ext: '.pdf', icon: FileText },
    { id: 'docx' as DownloadFormat, label: 'Word', ext: '.docx', icon: FileText },
    { id: 'txt' as DownloadFormat, label: 'Text', ext: '.txt', icon: FileText },
    { id: 'srt' as DownloadFormat, label: 'SRT', ext: '.srt', icon: Subtitles },
    { id: 'vtt' as DownloadFormat, label: 'VTT', ext: '.vtt', icon: Subtitles },
    { id: 'xml' as DownloadFormat, label: 'Premiere', ext: '.xml', icon: FileDown },
    { id: 'fcpxml' as DownloadFormat, label: 'Final Cut', ext: '.fcpxml', icon: FileDown },
    { id: 'audio' as DownloadFormat, label: 'Audio', ext: '.mp3', icon: Volume2 },
  ];

  const handleDownload = () => {
    console.log('Downloading:', { format, includeTimestamps, includeSummary, transcript: transcript.title });
    onClose();
  };

  const isMediaFormat = format === 'audio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Download Transcript</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">Select The Format</p>

        {/* Format Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setFormat(opt.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  format === opt.id 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${format === opt.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">{opt.label}</span>
                <span className={`text-xs mt-0.5 ${format === opt.id ? 'text-emerald-400' : 'text-gray-400'}`}>{opt.ext}</span>
              </button>
            );
          })}
        </div>

        {/* Options - only show for transcript formats */}
        {!isMediaFormat && (
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
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// Transcript Detail/Edit Modal Component
function TranscriptDetailModal({ transcript, onClose }: { transcript: Transcript; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const MOCK_TRANSCRIPT_CONTENT = [
    { speaker: 'Speaker 1', time: '00:00:05', text: "Welcome everyone to today's product strategy meeting. We have a lot to cover, so let's get started." },
    { speaker: 'Speaker 2', time: '00:00:15', text: "Thanks for organizing this. I've prepared the Q4 projections we discussed last week." },
    { speaker: 'Speaker 1', time: '00:00:25', text: "Perfect. Before we dive in, let's do a quick round of updates from each team." },
    { speaker: 'Speaker 3', time: '00:00:35', text: "The engineering team has completed the core features for the mobile app. We're now in the testing phase." },
    { speaker: 'Speaker 4', time: '00:00:48', text: "Marketing has finalized the launch campaign. We're targeting early January for the announcement." },
    { speaker: 'Speaker 2', time: '00:01:02', text: "Great progress. The numbers look promising - we're projecting a 40% increase in user engagement." },
    { speaker: 'Speaker 1', time: '00:01:15', text: "That's excellent news. Let's discuss the resource allocation for Q1..." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="w-full max-w-5xl h-[90vh] bg-[#141419] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{transcript.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {transcript.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {transcript.speakers} Speakers
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {transcript.language}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-[#1a1a1f] border border-white/10 shadow-xl z-50">
                  {[
                    { format: 'TXT', desc: 'Plain Text' },
                    { format: 'DOCX', desc: 'Word Document' },
                    { format: 'PDF', desc: 'PDF Document' },
                    { format: 'SRT', desc: 'Subtitles' },
                    { format: 'VTT', desc: 'Web Subtitles' },
                    { format: 'JSON', desc: 'Raw Data' },
                  ].map(item => (
                    <button
                      key={item.format}
                      className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>{item.format}</span>
                      <span className="text-xs text-gray-600">{item.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-400 font-mono">00:00</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
                <span className="text-sm text-gray-400 font-mono">{transcript.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 focus:outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500">Click any text to jump to that moment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-white/10">
          {[
            { id: 'transcript', label: 'Transcript', icon: FileText },
            { id: 'summary', label: 'AI Summary', icon: Sparkles },
            { id: 'speakers', label: 'Speakers', icon: Users },
            { id: 'chat', label: 'AI Chat', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {MOCK_TRANSCRIPT_CONTENT.map((item, i) => (
                <div key={i} className="group flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-20">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {item.time}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">{item.speaker}</p>
                    <p className="text-white leading-relaxed">{item.text}</p>
                  </div>
                  <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="max-w-3xl">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">AI-Generated Summary</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {transcript.summary || 'This meeting covered Q4 product strategy and launch planning. Key topics included engineering progress on the mobile app, marketing campaign finalization, and resource allocation discussions for Q1.'}
                </p>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate Summary
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {['Mobile app testing phase completed', 'Launch campaign targeting January', '40% projected user engagement increase'].map((point, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {['Finalize Q1 resource allocation', 'Schedule follow-up meeting', 'Review marketing materials'].map((item, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <div className="w-4 h-4 rounded border border-amber-500/30 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-purple-400" />
                  Translate Summary
                </h4>
                <div className="flex items-center gap-3">
                  <select className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none">
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                  <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-colors">
                    Translate
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div className="max-w-2xl">
              <p className="text-gray-500 mb-6">Identify and label speakers for better organization</p>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((speaker) => (
                  <div key={speaker} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['bg-emerald-500/20 text-emerald-400', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400'][speaker - 1]
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        defaultValue={`Speaker ${speaker}`}
                        className="w-full bg-transparent text-white font-medium focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">Spoke for ~{Math.floor(Math.random() * 10 + 5)} minutes</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                      Identify Voice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-3xl h-full flex flex-col">
              <div className="flex-1 space-y-4 mb-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                  <p className="text-sm text-emerald-100">
                    Ask me anything about this transcript! I can help you find specific information, extract insights, or answer questions about what was discussed.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask a question about this transcript..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors">
                  <Wand2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-500">Try:</span>
                {['What was decided?', 'Action items', 'Key metrics'].map((q, i) => (
                  <button key={i} className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
