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
  Pencil, Trash2, Check, X, Search, Mic
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
}

// Parse transcript text into structured format
const parseTranscriptContent = (text: string, durationStr: string): TranscriptLine[] => {
  if (!text) return [];
  
  // Split by sentences or paragraphs
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  
  // Parse duration to seconds
  const durationParts = durationStr.split(':').map(Number);
  const totalSeconds = durationParts.length === 3 
    ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
    : durationParts[0] * 60 + (durationParts[1] || 0);
  
  const timePerSentence = totalSeconds / Math.max(sentences.length, 1);
  
  return sentences.map((sentence, index) => {
    const seconds = Math.floor(index * timePerSentence);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      speaker: 'Speaker 1',
      time: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
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
  
  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Transcript content from database
  const [originalContent, setOriginalContent] = useState<TranscriptLine[]>([]);
  const [editedContent, setEditedContent] = useState<TranscriptLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [summaryTranslationLang, setSummaryTranslationLang] = useState('');
  const [selectedSummaryLang, setSelectedSummaryLang] = useState('Spanish');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isTranslatingSummary, setIsTranslatingSummary] = useState(false);
  
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
        setTranslatedSummary(data.translatedText);
        setSummaryTranslationLang(targetLanguage);
        toast.success(`Summary translated to ${targetLanguage}`);
      }
    } catch (error) {
      console.error('Error translating summary:', error);
      toast.error('Failed to translate summary');
    } finally {
      setIsTranslatingSummary(false);
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
        
        if (data?.prompt) {
          const parsedContent = parseTranscriptContent(data.prompt, duration);
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
  }, [id, duration]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

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

  const handleUse = () => {
    // Compile all transcript content
    const transcriptText = editedContent
      .map(item => item.text)
      .join('\n\n');
    
    // Navigate to Create page with the transcript text for video/avatar mode
    navigate('/create', { 
      state: { 
        transcriptText,
        transcriptTitle: editedTitle,
        targetMode: 'Video' // Default to video section
      } 
    });
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = () => {
    toast.success(`Downloading as ${downloadFormat.toUpperCase()}...`);
    setShowDownloadModal(false);
  };

  const handleSaveLine = (index: number) => {
    setEditingLineIndex(null);
    toast.success('Line saved');
  };

  const handleCancelLineEdit = (index: number) => {
    // Reset the line to original content
    const newContent = [...editedContent];
    newContent[index] = { ...originalContent[index] };
    setEditedContent(newContent);
    setEditingLineIndex(null);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    toast.success('Title updated');
  };

  const handleCancelTitleEdit = () => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  };

  const handleTranslate = async (targetLanguage: string) => {
    setIsTranslating(true);
    setSelectedTranslation(targetLanguage);
    setShowTranslatePopover(false);
    
    try {
      // Translate the transcript content using OpenRouter GPT-4o
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
  };

  const handleIdentifyVoice = (speakerId: number) => {
    setIdentifyingVoice(speakerId);
    // Simulate voice identification
    setTimeout(() => {
      setIdentifyingVoice(null);
      toast.success(`Voice identified for Speaker ${speakerId}`);
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
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
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
                      <>
                        <h1 className="text-2xl font-bold text-gray-900">{editedTitle}</h1>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => setIsEditingTitle(true)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Rename</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {speakers} speaker{speakers > 1 ? 's' : ''}
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeTranslationTab === 'original'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Original
                      </button>
                      <button 
                        onClick={() => setActiveTranslationTab('translated')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
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
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {/* Use Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleUse}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Use
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Use Transcript</TooltipContent>
                  </Tooltip>

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
                    <TooltipContent>Download Transcript</TooltipContent>
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
                      <TooltipContent>Translate Transcript</TooltipContent>
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
                    <div key={i} className="group flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-shrink-0 w-20">
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">{item.speaker}</p>
                        {editingLineIndex === i ? (
                          <div className="space-y-2">
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
                          <p className="text-gray-900 leading-relaxed">{item.text}</p>
                        )}
                      </div>
                      {editingLineIndex !== i && (
                        <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(item.text);
                              toast.success('Line copied!');
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingLineIndex(i)}
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
                      {summaryTranslationLang && translatedSummary && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setTranslatedSummary(''); setSummaryTranslationLang(''); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              !summaryTranslationLang ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Original
                          </button>
                          <button 
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500 text-white flex items-center gap-1.5"
                          >
                            <Languages className="w-3.5 h-3.5" />
                            {summaryTranslationLang}
                          </button>
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
                    ) : translatedSummary && summaryTranslationLang ? (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {translatedSummary}
                      </p>
                    ) : aiSummary ? (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {aiSummary}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No summary available</p>
                    )}
                    <button 
                      onClick={() => {
                        setTranslatedSummary('');
                        setSummaryTranslationLang('');
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
                            onChange={(e) => setSpeakerNames(prev => ({ ...prev, [speaker.id]: e.target.value }))}
                            className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
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
                <div className="max-w-3xl">
                  <div className="space-y-4 mb-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                      <p className="text-sm text-emerald-700">
                        Ask me anything about this transcript! I can help you find specific information, extract insights, or answer questions about what was discussed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Ask a question about this transcript..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors">
                      <Wand2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Try:</span>
                    {['What was decided?', 'Action items', 'Key metrics'].map((q, i) => (
                      <button key={i} className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Fixed Audio Player at Bottom */}
        <div className={`fixed bottom-0 right-0 bg-[hsl(215,28%,17%)] border-t border-gray-700 p-4 z-50 transition-all duration-300 ${isSidebarCollapsed ? 'left-16' : 'left-64'}`}>
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm text-white font-mono w-12">00:00</span>
              <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden cursor-pointer">
                <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
              </div>
              <span className="text-sm text-white font-mono w-12">{duration}</span>
              
              {/* Volume */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-12 p-3 bg-gray-800 border-gray-700" side="top">
                  <div className="relative h-24 flex items-center justify-center">
                    <div className="absolute w-2 h-20 bg-white/30 rounded-full" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-20 h-2 bg-white/30 rounded-full appearance-none cursor-pointer -rotate-90 origin-center [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-runnable-track]:bg-white/30 [&::-webkit-slider-runnable-track]:rounded-full"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              {/* Speed */}
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 rounded-lg bg-gray-700 border border-gray-600 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <p className="text-sm text-white ml-4">Click Any Text To Jump To That Moment</p>
          </div>
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
