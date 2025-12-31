import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Upload, Mic, Sparkles, ArrowLeft, BookOpen, Headphones, Presentation,
  Lightbulb, Settings, Palette, Send, Info, CheckCircle2, Globe, MessageSquare,
  Bot, Link2, FileText, Play, Pause, X, Plus, Users, Layers, Image as ImageIcon,
  Briefcase, Coffee, GraduationCap, Heart, Shield, Flame, Search, ChevronDown,
  Check, Pencil, Eye, UserPlus, Download, MoreVertical, Loader2, Wand2, RefreshCw,
  ArrowRight, PenLine, Target, Zap, Award
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive, FaDropbox } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiLoom, SiZoom } from 'react-icons/si';
import { Rss, MoreHorizontal } from 'lucide-react';
import EbookDesignSidebar from '@/components/ebook/EbookDesignSidebar';
import EbookContentPreview from '@/components/ebook/EbookContentPreview';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';

interface UploadedFile {
  id: string;
  name: string;
  type: 'file' | 'audio' | 'video' | 'link';
  url?: string;
  file?: File;
}

interface NewBookData {
  prompt: string;
  sourceType: 'ai' | 'upload' | 'link' | 'record';
  contentType: 'ebook' | 'audiobook' | 'presentation';
  language: string;
  tone: string;
  creative: string;
  audience: string;
  chapters: number;
  wordsPerChapter: number;
  includeImages: boolean;
  selectedTitle: string;
}

const PLATFORMS = [
  { name: 'Blog', icon: Rss, color: '#F97316' },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'X', icon: FaXTwitter, color: '#000000' },
  { name: 'Vimeo', icon: FaVimeo, color: '#1AB7EA' },
  { name: 'Google Drive', icon: FaGoogleDrive, color: '#4285F4' },
  { name: 'Dropbox', icon: FaDropbox, color: '#0061FF' },
  { name: 'Loom', icon: SiLoom, color: '#625DF5' },
  { name: 'Zoom', icon: SiZoom, color: '#2D8CFF' },
];

const CONTENT_TYPES = [
  { id: 'ebook', label: 'eBook', icon: BookOpen },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones },
  { id: 'presentation', label: 'Presentation', icon: Presentation },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'es-mx', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'pt-pt', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
];

const TONES = [
  { id: 'professional', name: 'Professional', icon: Briefcase },
  { id: 'conversational', name: 'Conversational', icon: Coffee },
  { id: 'academic', name: 'Academic', icon: GraduationCap },
  { id: 'friendly', name: 'Friendly', icon: Heart },
  { id: 'authoritative', name: 'Authoritative', icon: Shield },
  { id: 'inspirational', name: 'Inspirational', icon: Flame },
];

const CREATIVES = [
  { id: 'default', name: 'Default' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'bold', name: 'Bold' },
  { id: 'elegant', name: 'Elegant' },
];

const SOURCE_OPTIONS = [
  { id: 'ai', label: 'GhostInk', icon: Bot },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'link', label: 'Link', icon: Link2 },
  { id: 'record', label: 'Record', icon: Mic },
];

type TabId = 'idea' | 'generate' | 'design' | 'review';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'generate', label: 'Generate', icon: Sparkles },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'review', label: 'eBook', icon: BookOpen },
];

const NewEbook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('idea');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [sourceModalType, setSourceModalType] = useState<'upload' | 'link' | 'record'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [isAddingCustomTitle, setIsAddingCustomTitle] = useState(false);
  const [customTitleValue, setCustomTitleValue] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [currentViewMode, setCurrentViewMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSource = searchParams.get('source') || 'ai';
  const mapSourceType = (source: string): 'ai' | 'upload' | 'link' | 'record' => {
    if (source === 'ai-generate') return 'ai';
    if (source === 'url') return 'link';
    if (source === 'voice') return 'record';
    return source as 'ai' | 'upload' | 'link' | 'record';
  };

  const [bookData, setBookData] = useState<NewBookData>({
    prompt: '',
    sourceType: mapSourceType(initialSource),
    contentType: null as any, // null until user selects
    language: 'en',
    tone: 'professional',
    creative: 'default',
    audience: '',
    chapters: 8,
    wordsPerChapter: 2000,
    includeImages: true,
    selectedTitle: '',
  });
  const [contentTypeSelected, setContentTypeSelected] = useState(false);

  // Load uploaded file from navigation state (from EbookCreator page)
  useEffect(() => {
    const state = location.state as { uploadedFile?: UploadedFile } | null;
    if (state?.uploadedFile) {
      setUploadedFiles([state.uploadedFile]);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSourceSelect = (sourceId: string) => {
    if (sourceId === 'ai') {
      setBookData(prev => ({ ...prev, sourceType: 'ai' }));
    } else {
      setSourceModalType(sourceId as 'upload' | 'link' | 'record');
      setSourceModalOpen(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'file',
        file,
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setBookData(prev => ({ ...prev, sourceType: 'upload' }));
      setSourceModalOpen(false);
      toast.success(`${files.length} file(s) added`);
    }
  };

  const handleLinkAdd = () => {
    if (linkInput.trim()) {
      const isVideo = linkInput.includes('youtube') || linkInput.includes('vimeo') || linkInput.includes('tiktok');
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: linkInput,
        type: isVideo ? 'video' : 'link',
        url: linkInput,
      };
      setUploadedFiles(prev => [...prev, newFile]);
      setBookData(prev => ({ ...prev, sourceType: 'link' }));
      setLinkInput('');
      setSourceModalOpen(false);
      toast.success('Link added');
    }
  };

  const handleRecordingComplete = () => {
    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: `Recording ${new Date().toLocaleTimeString()}`,
      type: 'audio',
    };
    setUploadedFiles(prev => [...prev, newFile]);
    setBookData(prev => ({ ...prev, sourceType: 'record' }));
    setIsRecording(false);
    setSourceModalOpen(false);
    toast.success('Recording added');
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const stripTrailingPunctuation = (value: string) =>
    value.trim().replace(/[\p{P}\s]+$/gu, '');

  const handleGenerate = async () => {
    if (!bookData.prompt.trim()) {
      toast.error('Please describe your topic or niche');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
          // Title Case function - properly capitalizes each word including after hyphens
          const toTitleCase = (str: string) => {
            return str.split(' ').map((word) => {
              if (!word) return word;
              // Handle hyphenated words
              if (word.includes('-')) {
                return word.split('-').map(part => 
                  part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                ).join('-');
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
          };

          const topicTitleCase = toTitleCase(stripTrailingPunctuation(bookData.prompt));

          // Simulate topic idea generation
          const interval = setInterval(() => {
            setGenerationProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setIsGenerating(false);
                // Generate 10 topic ideas/suggestions with varied tones
                const suggestions = [
                  `The Complete Guide to ${topicTitleCase}`,
                  `Mastering ${topicTitleCase}: The Definitive Framework`,
                  `${topicTitleCase} Unleashed: The Bold Playbook`,
                  `The ${topicTitleCase} Blueprint`,
                  `${topicTitleCase} Made Simple: A Beginner's Guide`,
                  `Advanced ${topicTitleCase} Techniques`,
                  `The Art of ${topicTitleCase}: A Creative Strategy`,
                  `${topicTitleCase}: From Zero to Hero`,
                  `The Ultimate ${topicTitleCase} Reference Handbook`,
                  `${topicTitleCase} 101: Getting Started`,
                ].map(stripTrailingPunctuation);

                setTitleSuggestions(suggestions);
                setActiveTab('generate');
                toast.success('Generating Title Ideas...');
                return 100;
              }
              return Math.min(prev + Math.random() * 20, 100);
            });
          }, 400);
  };

  const handleTitleSelect = (title: string) => {
    setBookData(prev => ({ ...prev, selectedTitle: stripTrailingPunctuation(title) }));
  };

  const getFileIcon = (file: UploadedFile) => {
    switch (file.type) {
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'link': return <Link2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastAutoSaved(new Date());
    setIsSaving(false);
    toast.success('Project saved');
  };

  // Demo collaborators
  const collaborators = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
  ];

const currentLanguage = LANGUAGES.find(l => l.code === bookData.language);
  const currentTone = TONES.find(t => t.id === bookData.tone);
  const currentContentType = CONTENT_TYPES.find(t => t.id === bookData.contentType);
  const currentSource = SOURCE_OPTIONS.find(s => s.id === bookData.sourceType);

  // Track which tabs are completed
  const isIdeaComplete = bookData.prompt.trim().length > 0 && titleSuggestions.length > 0;
  const isGenerateComplete = bookData.selectedTitle.length > 0;
  const isDesignComplete = isGenerateComplete; // Can be expanded with more conditions

  const canAccessTab = (tabId: TabId): boolean => {
    const tabIndex = TABS.findIndex(t => t.id === tabId);
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    
    // Always can access idea tab
    if (tabId === 'idea') return true;
    // Can access tabs we've already passed
    if (tabIndex <= currentIndex) return true;
    
    // Check completion of previous tabs
    switch (tabId) {
      case 'generate': return isIdeaComplete;
      case 'design': return isGenerateComplete;
      case 'review': return isDesignComplete;
      default: return false;
    }
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onCollapseChange={(collapsed) => setSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        {/* Black Header Bar - matching Transcribe */}
        <div className="relative flex items-center px-4 py-2.5 bg-sidebar border-b border-gray-700 flex-shrink-0">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* eBook Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-white">eBOOK</span>
                <span className="text-emerald-400"> STUDIO</span>
              </h1>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentViewMode === 'editing' ? 'bg-violet-500/30 hover:bg-violet-500/40' :
                  currentViewMode === 'viewing' ? 'bg-blue-500/30 hover:bg-blue-500/40' :
                  currentViewMode === 'commenting' ? 'bg-amber-500/30 hover:bg-amber-500/40' :
                  'bg-green-500/30 hover:bg-green-500/40'
                }`}>
                  {currentViewMode === 'editing' && <Pencil className="w-3.5 h-3.5 text-violet-300" />}
                  {currentViewMode === 'viewing' && <Eye className="w-3.5 h-3.5 text-blue-300" />}
                  {currentViewMode === 'commenting' && <MessageSquare className="w-3.5 h-3.5 text-amber-300" />}
                  {currentViewMode === 'admin' && <Settings className="w-3.5 h-3.5 text-green-300" />}
                  <span className={`text-sm font-medium capitalize ${
                    currentViewMode === 'editing' ? 'text-violet-200' :
                    currentViewMode === 'viewing' ? 'text-blue-200' :
                    currentViewMode === 'commenting' ? 'text-amber-200' :
                    'text-green-200'
                  }`}>{currentViewMode}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${
                    currentViewMode === 'editing' ? 'text-violet-300' :
                    currentViewMode === 'viewing' ? 'text-blue-300' :
                    currentViewMode === 'commenting' ? 'text-amber-300' :
                    'text-green-300'
                  }`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Your Access Level</p>
                </div>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('editing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <Pencil className="w-4 h-4 text-violet-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Editing</span>
                    <span className="text-xs text-gray-500">Full Edit Access</span>
                  </div>
                  {currentViewMode === 'editing' && <Check className="w-4 h-4 ml-auto text-violet-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('viewing')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <Eye className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Viewing</span>
                    <span className="text-xs text-gray-500">Read Only</span>
                  </div>
                  {currentViewMode === 'viewing' && <Check className="w-4 h-4 ml-auto text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('commenting')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Commenting</span>
                    <span className="text-xs text-gray-500">Comments Only</span>
                  </div>
                  {currentViewMode === 'commenting' && <Check className="w-4 h-4 ml-auto text-amber-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentViewMode('admin')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <Settings className="w-4 h-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-gray-500">Full Admin Access</span>
                  </div>
                  {currentViewMode === 'admin' && <Check className="w-4 h-4 ml-auto text-green-600" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Auto-save Cloud Icon */}
            <HoverCard openDelay={100} closeDelay={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HoverCardTrigger asChild>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                        isSaving 
                          ? 'bg-gray-500/30 cursor-wait' 
                          : 'bg-green-500/20 hover:bg-green-500/30 cursor-pointer'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" className="text-green-400" />
                            <polyline points="9 12 11 14 15 10" className="text-green-400" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs whitespace-nowrap ${isSaving ? 'text-gray-300' : 'text-green-300'}`}>
                        {isSaving ? 'Saving' : 'Auto-Saved'}
                      </span>
                    </button>
                  </HoverCardTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-1">
                  <p>Save Project</p>
                </TooltipContent>
              </Tooltip>
              <HoverCardContent side="bottom" align="start" className="w-auto p-2 bg-popover border border-border">
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {isSaving 
                    ? 'Saving...' 
                    : `Click To Save (Last Saved: ${(lastAutoSaved.getMonth() + 1).toString().padStart(2, '0')}/${lastAutoSaved.getDate().toString().padStart(2, '0')}/${lastAutoSaved.getFullYear()} // ${lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` 
                  }
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Center Section - Tab Icons (absolutely centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const isPast = TABS.findIndex(t => t.id === activeTab) > index;
              const isAccessible = canAccessTab(tab.id);
              const isEbook = tab.id === 'review';
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => isAccessible && setActiveTab(tab.id)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                          : isPast
                          ? 'bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/30'
                          : isAccessible
                          ? 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                          : 'text-gray-400 cursor-not-allowed border border-transparent'
                      } ${isEbook ? 'border border-gray-500' : ''}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{tab.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Spacer to push right section */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Collaborators */}
            <div className="hidden lg:flex items-center -space-x-2">
              {collaborators.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Collaborator ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-sidebar object-cover"
                />
              ))}
            </div>
            
            {/* Share button */}
            <button 
              onClick={() => toast.success('Share dialog coming soon')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white font-semibold transition-colors border border-gray-500"
            >
              <UserPlus className="w-5 h-5" strokeWidth={2.5} />
              <span className="hidden md:inline">Share</span>
            </button>
            
            {/* Download button */}
            <button 
              onClick={() => toast.success('Download options coming soon')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-transparent hover:bg-slate-700/50 rounded-lg text-sm text-white font-semibold transition-colors border border-slate-400"
            >
              <Download className="w-5 h-5" strokeWidth={2.5} />
              <span className="hidden md:inline">Download</span>
            </button>
            
            {/* 3-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0">
                  <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 z-50">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <main className="flex-1 p-8">
          {/* Back button row */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/ebook-creator')} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back To Projects</span>
            </button>
          </div>

          <div className={activeTab === 'design' ? '' : 'max-w-4xl mx-auto'}>
            {/* Generation Progress */}
            {isGenerating && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Generating Title Ideas...</h3>
                    <p className="text-sm text-gray-500">{Math.round(generationProgress)}% complete</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${generationProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* IDEA TAB */}
            {activeTab === 'idea' && (
              <div className="space-y-6">
                {/* Main Headline */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8">
                  What Would You Like To Create?
                </h1>

                {/* Prompt Box */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm p-6 max-w-5xl mx-auto">
                  {/* Uploaded Files Preview - Now inline with textarea */}
                  <div className="flex items-start gap-3">
                    {/* Source File Icon */}
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        {uploadedFiles.map(file => (
                          <div 
                            key={file.id}
                            className="relative group flex items-center justify-center w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-lg"
                            title={file.name}
                          >
                            {getFileIcon(file)}
                            <button 
                              onClick={() => removeFile(file.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Textarea */}
                    <textarea
                      value={bookData.prompt}
                      onChange={(e) => setBookData(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="What is your topic or niche? (e.g., digital marketing for small business)"
                      className="flex-1 min-h-[120px] resize-none border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-lg"
                    />
                  </div>

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-2">
                      {/* Source Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors">
                            {currentSource && <currentSource.icon className="w-4 h-4" />}
                            <span>Source: {currentSource?.label}</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {SOURCE_OPTIONS.map(source => (
                            <DropdownMenuItem
                              key={source.id}
                              onClick={() => handleSourceSelect(source.id)}
                              className="flex items-center gap-2"
                            >
                              <source.icon className="w-4 h-4" />
                              {source.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Type Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            {currentContentType ? <currentContentType.icon className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                            <span>Type{currentContentType ? `: ${currentContentType.label}` : ''}</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {CONTENT_TYPES.map(type => (
                            <DropdownMenuItem
                              key={type.id}
                              onClick={() => {
                                setBookData(prev => ({ ...prev, contentType: type.id as any }));
                                setContentTypeSelected(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language Dropdown with Search */}
                      <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            <span>{currentLanguage?.flag}</span>
                            <span>{currentLanguage?.name}</span>
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search Languages" 
                              value={languageSearch}
                              onValueChange={setLanguageSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No language found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-y-auto">
                                {LANGUAGES.filter(lang => 
                                  lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
                                  lang.code.toLowerCase().includes(languageSearch.toLowerCase())
                                ).map(lang => (
                                  <CommandItem
                                    key={lang.code}
                                    value={lang.name}
                                    onSelect={() => {
                                      setBookData(prev => ({ ...prev, language: lang.code }));
                                      setLanguageOpen(false);
                                      setLanguageSearch('');
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>{lang.flag}</span>
                                    <span>{lang.name}</span>
                                    {bookData.language === lang.code && (
                                      <Check className="w-4 h-4 ml-auto text-emerald-500" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Tone Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            {currentTone && <currentTone.icon className="w-4 h-4" />}
                            <span>Tone: {currentTone?.name}</span>
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {TONES.map(tone => (
                            <DropdownMenuItem
                              key={tone.id}
                              onClick={() => setBookData(prev => ({ ...prev, tone: tone.id }))}
                              className="flex items-center gap-2"
                            >
                              <tone.icon className="w-4 h-4" />
                              {tone.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !bookData.prompt.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-10 h-10 p-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* eBook Options Section */}
                {contentTypeSelected && bookData.contentType === 'ebook' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">eBook Options</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Creative */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Creative Style</label>
                        <select
                          value={bookData.creative}
                          onChange={(e) => setBookData(prev => ({ ...prev, creative: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          {CREATIVES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Audience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <Input 
                          value={bookData.audience}
                          onChange={(e) => setBookData(prev => ({ ...prev, audience: e.target.value }))}
                          placeholder="e.g., Small business owners"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Number of Chapters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number Of Chapters</label>
                        <select 
                          value={bookData.chapters}
                          onChange={(e) => setBookData(prev => ({ ...prev, chapters: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          {[5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                            <option key={n} value={n}>{n} chapters</option>
                          ))}
                        </select>
                      </div>

                      {/* Words Per Chapter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Words Per Chapter</label>
                        <div className="flex gap-2">
                          {[1000, 1500, 2000, 2500, 3000].map(n => (
                            <button 
                              key={n}
                              onClick={() => setBookData(prev => ({ ...prev, wordsPerChapter: n }))}
                              className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg border transition-colors ${
                                bookData.wordsPerChapter === n 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {(n / 1000).toFixed(1)}k
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Estimated total: ~{((bookData.chapters * bookData.wordsPerChapter) / 1000).toFixed(0)}k words
                        </p>
                      </div>
                    </div>

                    {/* Include Illustrations */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="includeImages"
                        checked={bookData.includeImages}
                        onChange={(e) => setBookData(prev => ({ ...prev, includeImages: e.target.checked }))}
                        className="w-5 h-5 text-emerald-600 rounded accent-emerald-500"
                      />
                      <label htmlFor="includeImages" className="text-sm text-gray-900 font-medium">
                        Include Illustrations For Each Chapter
                      </label>
                    </div>
                  </div>
                )}

                {/* Audiobook Options Section */}
                {contentTypeSelected && bookData.contentType === 'audiobook' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-purple-500" />
                      Audiobook Options
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Creative */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Creative Style</label>
                        <select
                          value={bookData.creative}
                          onChange={(e) => setBookData(prev => ({ ...prev, creative: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          {CREATIVES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Audience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <Input 
                          value={bookData.audience}
                          onChange={(e) => setBookData(prev => ({ ...prev, audience: e.target.value }))}
                          placeholder="e.g., Small business owners"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Number of Chapters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number Of Chapters</label>
                        <select 
                          value={bookData.chapters}
                          onChange={(e) => setBookData(prev => ({ ...prev, chapters: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          {[5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                            <option key={n} value={n}>{n} chapters</option>
                          ))}
                        </select>
                      </div>

                      {/* Words Per Chapter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Words Per Chapter</label>
                        <div className="flex gap-2">
                          {[1000, 1500, 2000, 2500, 3000].map(n => (
                            <button 
                              key={n}
                              onClick={() => setBookData(prev => ({ ...prev, wordsPerChapter: n }))}
                              className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg border transition-colors ${
                                bookData.wordsPerChapter === n 
                                  ? 'bg-purple-50 border-purple-500 text-purple-700' 
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {(n / 1000).toFixed(1)}k
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Estimated total: ~{((bookData.chapters * bookData.wordsPerChapter) / 1000).toFixed(0)}k words • ~{Math.round((bookData.chapters * bookData.wordsPerChapter) / 150)} min audio
                        </p>
                      </div>
                    </div>

                    {/* Narrator Voice */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Narrator Voice</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].map(voice => (
                          <button
                            key={voice}
                            className="p-3 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mx-auto mb-2 flex items-center justify-center">
                              <Mic className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{voice}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audio Options */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="includeMusic"
                          className="w-5 h-5 text-purple-600 rounded accent-purple-500"
                        />
                        <label htmlFor="includeMusic" className="text-sm text-gray-900 font-medium">
                          Include Background Music
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="chapterBreaks"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded accent-purple-500"
                        />
                        <label htmlFor="chapterBreaks" className="text-sm text-gray-900 font-medium">
                          Include Chapter Break Announcements
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Presentation Options Section */}
                {contentTypeSelected && bookData.contentType === 'presentation' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Presentation className="w-5 h-5 text-blue-500" />
                      Presentation Options
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Presentation Style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Presentation Style</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          <option value="professional">Professional</option>
                          <option value="creative">Creative</option>
                          <option value="minimal">Minimal</option>
                          <option value="bold">Bold</option>
                          <option value="corporate">Corporate</option>
                        </select>
                      </div>

                      {/* Audience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <Input 
                          value={bookData.audience}
                          onChange={(e) => setBookData(prev => ({ ...prev, audience: e.target.value }))}
                          placeholder="e.g., Executive team, Investors"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Number of Slides */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number Of Slides</label>
                        <select 
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        >
                          {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                            <option key={n} value={n}>{n} slides</option>
                          ))}
                        </select>
                      </div>

                      {/* Aspect Ratio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                        <div className="flex gap-2">
                          {[
                            { label: '16:9', value: '16:9' },
                            { label: '4:3', value: '4:3' },
                            { label: '1:1', value: '1:1' },
                          ].map(ratio => (
                            <button 
                              key={ratio.value}
                              className="flex-1 py-2 px-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              {ratio.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Presentation Options */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="includeCharts"
                          defaultChecked
                          className="w-5 h-5 text-blue-600 rounded accent-blue-500"
                        />
                        <label htmlFor="includeCharts" className="text-sm text-gray-900 font-medium">
                          Include Charts & Graphs
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="includeIcons"
                          defaultChecked
                          className="w-5 h-5 text-blue-600 rounded accent-blue-500"
                        />
                        <label htmlFor="includeIcons" className="text-sm text-gray-900 font-medium">
                          Include Icons & Illustrations
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="speakerNotes"
                          defaultChecked
                          className="w-5 h-5 text-blue-600 rounded accent-blue-500"
                        />
                        <label htmlFor="speakerNotes" className="text-sm text-gray-900 font-medium">
                          Generate Speaker Notes
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GENERATE TAB - Title Selection */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Choose A Title
                </h1>
                <p className="text-gray-500 text-center text-lg mb-8">
                  Select A Title Or Tweak One To Match Your Voice. You Can Change It Anytime.
                </p>

              {titleSuggestions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {titleSuggestions.map((title, index) => {
                        // Determine tone category based on title keywords
                        const getToneInfo = (t: string): { label: string; icon: typeof Heart; color: string; helper: string; isAuthority?: boolean } => {
                          // Beginner-friendly
                          if (t.includes('Made Simple') || t.includes('Easy') || t.includes('Beginner') || t.includes('101') || t.includes('Getting Started')) {
                            return { label: 'Beginner-Friendly', icon: Heart, color: 'bg-red-100 text-red-700', helper: 'Best For Beginners', isAuthority: false };
                          }
                          // Transformation
                          if (t.includes('From Zero to Hero') || t.includes('Transform') || t.includes('Journey') || t.includes('Path')) {
                            return { label: 'Transformation', icon: Zap, color: 'bg-amber-100 text-amber-700', helper: 'Results-Focused', isAuthority: false };
                          }
                          // Bold & Tactical
                          if (t.includes('Unleashed') || t.includes('Playbook') || t.includes('Power') || t.includes('Secrets') || t.includes('Bold')) {
                            return { label: 'Bold & Tactical', icon: Flame, color: 'bg-orange-100 text-orange-700', helper: 'Designed To Sell', isAuthority: true };
                          }
                          // Creative / Strategy
                          if (t.includes('Art of') || t.includes('Creative') || t.includes('Strategy')) {
                            return { label: 'Creative / Strategy', icon: Sparkles, color: 'bg-violet-100 text-violet-700', helper: 'Authority Builder', isAuthority: true };
                          }
                          // Reference
                          if (t.includes('Handbook') || t.includes('Reference') || t.includes('Encyclopedia') || t.includes('Manual')) {
                            return { label: 'Reference', icon: BookOpen, color: 'bg-slate-100 text-slate-700', helper: 'Authority Builder', isAuthority: true };
                          }
                          // Advanced
                          if (t.includes('Advanced') || t.includes('Expert') || t.includes('Pro ') || t.includes('Mastering')) {
                            return { label: 'Advanced', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700', helper: 'Authority Builder', isAuthority: true };
                          }
                          // Professional
                          if (t.includes('Definitive') || t.includes('Framework') || t.includes('Complete Guide')) {
                            return { label: 'Professional', icon: Award, color: 'bg-purple-100 text-purple-700', helper: 'Authority Builder', isAuthority: true };
                          }
                          // Practical (Blueprint, Guide, Step)
                          if (t.includes('Blueprint')) {
                            return { label: 'Practical', icon: Target, color: 'bg-blue-100 text-blue-700', helper: 'Fast Implementation', isAuthority: false };
                          }
                          if (t.includes('Step') || t.includes('Guide')) {
                            return { label: 'Practical', icon: Target, color: 'bg-blue-100 text-blue-700', helper: 'Step-By-Step', isAuthority: false };
                          }
                          return { label: 'Practical', icon: Target, color: 'bg-blue-100 text-blue-700', helper: 'Great For Lead Magnets', isAuthority: false };
                        };

                        // Smart preselection - only highlight ONE title (the first best match)
                        const isCredibilityNiche = () => {
                          const prompt = bookData.prompt.toLowerCase();
                          const credibilityKeywords = ['consultant', 'coach', 'expert', 'professional', 'business', 'leadership', 'executive', 'strategy', 'ceo', 'founder', 'entrepreneur', 'advisor', 'specialist', 'authority', 'master'];
                          return credibilityKeywords.some(keyword => prompt.includes(keyword));
                        };

                        const shouldHighlight = () => {
                          const isCredibility = isCredibilityNiche();
                          
                          // Find the first title that matches the preferred criteria
                          const firstMatchIndex = titleSuggestions.findIndex(t => {
                            const info = getToneInfo(t);
                            return isCredibility ? info.isAuthority : info.label === 'Beginner-Friendly';
                          });
                          
                          // Only highlight if there's a genuine match and this is the first one
                          if (firstMatchIndex === -1) return false;
                          
                          return index === firstMatchIndex;
                        };
                        const toneInfo = getToneInfo(title);
                        const normalizedTitle = stripTrailingPunctuation(title);
                        const selectedTitleNormalized = stripTrailingPunctuation(bookData.selectedTitle);
                        const isSelected = selectedTitleNormalized === normalizedTitle;
                        const ToneIcon = toneInfo.icon;

                        const isHighlighted = shouldHighlight();

                        return (
                          <div
                            key={index}
                            className={`group relative w-full p-5 text-left rounded-xl border-2 transition-all hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : isHighlighted
                                  ? 'border-emerald-400 bg-white'
                                  : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => handleTitleSelect(title)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm flex-shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex flex-col gap-1 flex-1">
                                  {editingTitleIndex === index ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <input
                                        type="text"
                                        value={editingTitleValue}
                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const nextTitle = stripTrailingPunctuation(editingTitleValue);
                                            if (nextTitle) {
                                              setTitleSuggestions(prev => prev.map((t, i) => i === index ? nextTitle : t));
                                              if (isSelected) {
                                                setBookData(prev => ({ ...prev, selectedTitle: nextTitle }));
                                              }
                                            }
                                            setEditingTitleIndex(null);
                                            setEditingTitleValue('');
                                          } else if (e.key === 'Escape') {
                                            setEditingTitleIndex(null);
                                            setEditingTitleValue('');
                                          }
                                        }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-lg font-medium text-gray-900 bg-white border border-emerald-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextTitle = stripTrailingPunctuation(editingTitleValue);
                                          if (nextTitle) {
                                            setTitleSuggestions(prev => prev.map((t, i) => i === index ? nextTitle : t));
                                            if (isSelected) {
                                              setBookData(prev => ({ ...prev, selectedTitle: nextTitle }));
                                            }
                                          }
                                          setEditingTitleIndex(null);
                                          setEditingTitleValue('');
                                        }}
                                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTitleIndex(null);
                                          setEditingTitleValue('');
                                        }}
                                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-lg font-medium text-gray-900">{normalizedTitle}</span>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${toneInfo.color}`}>
                                      <ToneIcon className="w-3 h-3" />
                                      {toneInfo.label}
                                    </span>
                                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{toneInfo.helper}</span>
                                    {isHighlighted && (
                                      <span className="text-xs text-emerald-600">Recommended For You</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {editingTitleIndex !== index && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTitleIndex(index);
                                          setEditingTitleValue(title);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/80 transition-all text-gray-500 hover:text-emerald-600 border border-transparent hover:border-emerald-200 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Edit Title</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {isSelected && (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Write My Own Title Option */}
                      {isAddingCustomTitle ? (
                        <div className="w-full p-5 rounded-xl border-2 border-emerald-400 bg-emerald-50 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
                              <PenLine className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={customTitleValue}
                              onChange={(e) => setCustomTitleValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const nextTitle = stripTrailingPunctuation(customTitleValue);
                                  if (nextTitle) {
                                    setTitleSuggestions(prev => [...prev, nextTitle]);
                                    handleTitleSelect(nextTitle);
                                    setIsAddingCustomTitle(false);
                                    setCustomTitleValue('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setIsAddingCustomTitle(false);
                                  setCustomTitleValue('');
                                }
                              }}
                              autoFocus
                              placeholder="Enter your custom title..."
                              className="flex-1 text-lg font-medium text-gray-900 bg-white border border-emerald-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              onClick={() => {
                                const nextTitle = stripTrailingPunctuation(customTitleValue);
                                if (nextTitle) {
                                  setTitleSuggestions(prev => [...prev, nextTitle]);
                                  handleTitleSelect(nextTitle);
                                }
                                setIsAddingCustomTitle(false);
                                setCustomTitleValue('');
                              }}
                              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setIsAddingCustomTitle(false);
                                setCustomTitleValue('');
                              }}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingCustomTitle(true)}
                          className="w-full p-5 text-left rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                              <PenLine className="w-4 h-4" />
                            </span>
                            <span className="text-lg font-medium text-gray-500">Write My Own Title</span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('idea')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleGenerate();
                          }}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                        <Button
                          onClick={() => {
                            if (!bookData.selectedTitle) {
                              toast.error('Please select a title first');
                              return;
                            }
                            setActiveTab('design');
                          }}
                          disabled={!bookData.selectedTitle}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Complete the Idea step first to generate title ideas</p>
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('idea')}
                      className="mt-4"
                    >
                      Go to Idea
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <div className="flex gap-0 h-[calc(100vh-180px)] overflow-hidden">
                {/* Left Sidebar - Collapsible Sections */}
                <EbookDesignSidebar
                  bookTitle={bookData.selectedTitle || 'Untitled eBook'}
                  chapters={[
                    { id: '1', title: bookData.selectedTitle || 'Untitled eBook', type: 'cover' },
                    { id: '2', title: `Contents: ${bookData.selectedTitle?.split(':')[0] || 'Untitled'}`, type: 'table of contents' },
                    { id: '3', title: 'Introduction', type: 'introduction' },
                    { id: '4', title: 'Chapter 1: Getting Started', type: null },
                    { id: '5', title: 'Chapter 2: Core Concepts', type: null },
                    { id: '6', title: 'Chapter 3: Deep Dive', type: null },
                    { id: '7', title: 'Chapter 4: Advanced Topics', type: null },
                    { id: '8', title: 'Summary', type: 'summary' },
                  ]}
                  selectedChapterId="4"
                  onChapterSelect={(id) => console.log('Selected chapter:', id)}
                  onChapterAdd={(afterId) => console.log('Add chapter after:', afterId)}
                  onChapterTitleEdit={(id, title) => console.log('Edit chapter:', id, title)}
                />

                {/* Right Preview Area - Static Canvas */}
                <EbookContentPreview
                  chapters={[
                    {
                      id: '4',
                      title: 'Chapter 1: Getting Started',
                      paragraphs: [
                        { id: 'p1', text: 'Welcome to this comprehensive guide. In this chapter, we will explore the fundamental concepts that form the foundation of our topic. Understanding these basics is crucial for your success.', chapterId: '4' },
                        { id: 'p2', text: 'The journey begins with understanding why this matters. Many professionals overlook the importance of establishing a solid foundation before diving into advanced topics.', chapterId: '4' },
                        { id: 'p3', text: 'By the end of this chapter, you will have a clear understanding of the core principles and be ready to apply them in real-world scenarios.', chapterId: '4' },
                      ]
                    }
                  ]}
                  selectedChapterId="4"
                  onParagraphEdit={(id, text) => console.log('Edit paragraph:', id, text)}
                  onChapterImageChange={(id) => console.log('Change image for:', id)}
                />

                {/* Continue Button */}
                <div className="absolute bottom-6 right-6">
                  <Button 
                    onClick={() => setActiveTab('review')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 shadow-lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* REVIEW TAB */}
            {activeTab === 'review' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Review & Create
                </h1>
                <p className="text-gray-500 text-center mb-8">
                  Finalize your eBook before creation
                </p>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Title</span>
                      <span className="font-medium text-gray-900">{stripTrailingPunctuation(bookData.selectedTitle) || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900">{currentContentType?.label}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Chapters</span>
                      <span className="font-medium text-gray-900">{bookData.chapters}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Estimated Words</span>
                      <span className="font-medium text-gray-900">~{((bookData.chapters * bookData.wordsPerChapter) / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Language</span>
                      <span className="font-medium text-gray-900">{currentLanguage?.flag} {currentLanguage?.name}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">AI Images</span>
                      <span className="font-medium text-gray-900">{bookData.includeImages ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      toast.success('Creating your eBook...');
                      setTimeout(() => navigate('/ebook-creator'), 2000);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create eBook
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Source Modal */}
      <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {sourceModalType === 'upload' && 'Upload Files'}
              {sourceModalType === 'link' && 'Add Link'}
              {sourceModalType === 'record' && 'Record Audio'}
            </DialogTitle>
          </DialogHeader>

          {sourceModalType === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-400 cursor-pointer transition-colors"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="font-medium text-gray-900 text-lg">Drag & Drop Your Files Here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <div className="flex justify-center gap-2 mt-6">
                  {['.pdf', '.docx', '.txt', '.md', '.mp3', '.mp4'].map(ext => (
                    <span key={ext} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">{ext}</span>
                  ))}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.mp3,.mp4,.wav"
              />
            </div>
          )}

          {sourceModalType === 'link' && (
            <div className="space-y-4">
              <div>
                <div className="flex gap-2">
                  <Input 
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="Paste A Supported Public Media Link"
                    className="flex-1"
                  />
                  <Button onClick={handleLinkAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white">Add</Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">Supported Platforms</p>
                <div className="flex items-center gap-3">
                  {PLATFORMS.map((platform) => (
                    <div key={platform.name} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                      <platform.icon className={platform.name === 'Zoom' ? 'w-7 h-7' : 'w-5 h-5'} style={{ color: platform.color }} />
                    </div>
                  ))}
                  <div className="px-3 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">+ More</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sourceModalType === 'record' && (
            <div className="text-center py-8">
              <button 
                onClick={() => {
                  if (isRecording) {
                    handleRecordingComplete();
                  } else {
                    setIsRecording(true);
                  }
                }}
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all ${
                  isRecording 
                    ? 'bg-rose-500 animate-pulse shadow-rose-500/30' 
                    : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30 hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <Pause className="w-14 h-14 text-white" />
                ) : (
                  <Mic className="w-14 h-14 text-white" />
                )}
              </button>
              <p className="font-medium text-gray-900 text-lg mt-6">
                {isRecording ? 'Recording... Click to stop' : 'Click to Start Recording'}
              </p>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Recording in progress</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};

export default NewEbook;
