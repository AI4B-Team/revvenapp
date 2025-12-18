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

const MOCK_TRANSCRIPT_CONTENT = [
  { speaker: 'Speaker 1', time: '00:00:05', text: "Welcome everyone to today's product strategy meeting. We have a lot to cover, so let's get started." },
  { speaker: 'Speaker 2', time: '00:00:15', text: "Thanks for organizing this. I've prepared the Q4 projections we discussed last week." },
  { speaker: 'Speaker 1', time: '00:00:25', text: "Perfect. Before we dive in, let's do a quick round of updates from each team." },
  { speaker: 'Speaker 3', time: '00:00:35', text: "The engineering team has completed the core features for the mobile app. We're now in the testing phase." },
  { speaker: 'Speaker 4', time: '00:00:48', text: "Marketing has finalized the launch campaign. We're targeting early January for the announcement." },
  { speaker: 'Speaker 2', time: '00:01:02', text: "Great progress. The numbers look promising - we're projecting a 40% increase in user engagement." },
  { speaker: 'Speaker 1', time: '00:01:15', text: "That's excellent news. Let's discuss the resource allocation for Q1..." },
];

// Mock speaker speaking time data
const SPEAKER_DATA = [
  { id: 1, name: 'Speaker 1', minutes: 12, color: 'bg-emerald-500', textColor: 'text-emerald-500', bgLight: 'bg-emerald-500/20' },
  { id: 2, name: 'Speaker 2', minutes: 8, color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-500/20' },
  { id: 3, name: 'Speaker 3', minutes: 15, color: 'bg-purple-500', textColor: 'text-purple-500', bgLight: 'bg-purple-500/20' },
  { id: 4, name: 'Speaker 4', minutes: 10, color: 'bg-amber-500', textColor: 'text-amber-500', bgLight: 'bg-amber-500/20' },
];

const TranscriptDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [volume, setVolume] = useState(80);
  
  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Transcript editing
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedContent, setEditedContent] = useState(MOCK_TRANSCRIPT_CONTENT);
  
  // Translation
  const [showTranslatePopover, setShowTranslatePopover] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<typeof MOCK_TRANSCRIPT_CONTENT | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Speakers
  const [speakerNames, setSpeakerNames] = useState<Record<number, string>>({});
  const [identifyingVoice, setIdentifyingVoice] = useState<number | null>(null);

  // Get transcript data from URL params
  const title = searchParams.get('title') || 'Untitled Transcript';
  const duration = searchParams.get('duration') || '00:00';
  const speakers = parseInt(searchParams.get('speakers') || '1');
  const language = searchParams.get('language') || 'English';
  const summary = searchParams.get('summary') || 'This meeting covered Q4 product strategy and launch planning.';

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`);
    setShowExportMenu(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Check out this transcript',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      toast.success('Transcript deleted');
      navigate('/transcribe');
    }
  };

  const handleUse = () => {
    toast.success('Transcript ready to use');
  };

  const handleDownload = () => {
    toast.success('Downloading transcript...');
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
      // Translate the transcript content
      const translatedItems = await Promise.all(
        MOCK_TRANSCRIPT_CONTENT.map(async (item) => {
          const { data, error } = await supabase.functions.invoke('translate-text', {
            body: { text: item.text, targetLanguage }
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

  const totalSpeakingMinutes = SPEAKER_DATA.reduce((sum, s) => sum + s.minutes, 0);

  const displayContent = selectedTranslation && translatedContent ? translatedContent : editedContent;

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
              <span className="font-medium">Back to Transcripts</span>
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
                  {/* Translation language button */}
                  <div className="flex items-center gap-4 mt-1">
                    {selectedTranslation && (
                      <button 
                        onClick={handleRemoveTranslation}
                        className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-600 text-sm font-medium flex items-center gap-1.5 hover:bg-purple-500/30 transition-colors"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        {selectedTranslation}
                        <X className="w-3.5 h-3.5 ml-1" />
                      </button>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {/* Edit Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                        className={`px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-2 ${
                          isEditingTranscript 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Transcript</TooltipContent>
                  </Tooltip>

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
                            placeholder="Search languages..."
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
                        onClick={() => handleCopy(displayContent.map(c => c.text).join('\n'))}
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

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-300 pb-4">
              {[
                { id: 'transcript', label: 'Transcript', icon: FileText },
                { id: 'summary', label: 'AI Summary', icon: Sparkles },
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
                        {isEditingTranscript ? (
                          <textarea
                            value={item.text}
                            onChange={(e) => {
                              const newContent = [...editedContent];
                              newContent[i] = { ...newContent[i], text: e.target.value };
                              setEditedContent(newContent);
                            }}
                            className="w-full p-2 rounded-lg border border-gray-300 text-gray-900 leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
                            rows={2}
                          />
                        ) : (
                          <p className="text-gray-900 leading-relaxed">{item.text}</p>
                        )}
                      </div>
                      {!isEditingTranscript && (
                        <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleCopy(item.text)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setIsEditingTranscript(true)}
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
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold text-gray-900">AI-Generated Summary</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {summary}
                    </p>
                    <button className="text-sm text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
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
                      <select className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-emerald-500">
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                        ))}
                      </select>
                      <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-600 text-sm font-medium hover:bg-purple-500/30 transition-colors">
                        Translate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'speakers' && (
                <div className="w-full">
                  <p className="text-gray-500 mb-6">Identify & Label Speakers For Better Organization</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {SPEAKER_DATA.slice(0, speakers).map((speaker) => (
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
                      {SPEAKER_DATA.slice(0, speakers).map((speaker) => (
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
              <span className="text-sm text-gray-400 font-mono w-12">00:00</span>
              <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden cursor-pointer">
                <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
              </div>
              <span className="text-sm text-gray-400 font-mono w-12">{duration}</span>
              
              {/* Volume */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-12 p-3 bg-gray-800 border-gray-700" side="top">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-24 h-2 bg-gray-600 rounded-full appearance-none cursor-pointer -rotate-90 origin-center"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </PopoverContent>
              </Popover>

              {/* Speed */}
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 rounded-lg bg-gray-700 border border-gray-600 text-sm text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <p className="text-sm text-gray-400 ml-4">Click Any Text To Jump To That Moment</p>
          </div>
        </div>
      </div>

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
