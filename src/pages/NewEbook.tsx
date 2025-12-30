import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Upload, Mic, Sparkles, ArrowLeft, BookOpen, Headphones, Presentation,
  Lightbulb, Settings, Palette, Send, Info, CheckCircle2, Globe, MessageSquare,
  Bot, Link2, FileText, Play, Pause, X, Plus, Users, Layers, Image as ImageIcon
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Rss } from 'lucide-react';
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
];

const CONTENT_TYPES = [
  { id: 'ebook', label: 'eBook', icon: BookOpen },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones },
  { id: 'presentation', label: 'Presentation', icon: Presentation },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

const TONES = [
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'conversational', name: 'Conversational', icon: '💬' },
  { id: 'academic', name: 'Academic', icon: '🎓' },
  { id: 'friendly', name: 'Friendly', icon: '😊' },
  { id: 'authoritative', name: 'Authoritative', icon: '👔' },
  { id: 'inspirational', name: 'Inspirational', icon: '✨' },
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

type TabId = 'idea' | 'info' | 'customize' | 'design' | 'review';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'info', label: 'Info', icon: Info },
  { id: 'customize', label: 'Customize', icon: Settings },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

const NewEbook = () => {
  const navigate = useNavigate();
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
    contentType: 'ebook',
    language: 'en',
    tone: 'professional',
    creative: 'default',
    audience: '',
    chapters: 8,
    wordsPerChapter: 2000,
    includeImages: true,
    selectedTitle: '',
  });

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

  const handleGenerate = async () => {
    if (!bookData.prompt.trim()) {
      toast.error('Please describe your topic or niche');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate title generation
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // Generate title suggestions
          setTitleSuggestions([
            `The Complete Guide to ${bookData.prompt}`,
            `Mastering ${bookData.prompt}: A Comprehensive Approach`,
            `${bookData.prompt} Unleashed: Strategies for Success`,
            `The ${bookData.prompt} Blueprint`,
            `Essential ${bookData.prompt} for Modern Professionals`,
          ]);
          setActiveTab('info');
          toast.success('Title suggestions ready!');
          return 100;
        }
        return Math.min(prev + Math.random() * 20, 100);
      });
    }, 400);
  };

  const handleTitleSelect = (title: string) => {
    setBookData(prev => ({ ...prev, selectedTitle: title }));
    toast.success('Title selected! Moving to customize...');
    setTimeout(() => setActiveTab('customize'), 500);
  };

  const getFileIcon = (file: UploadedFile) => {
    switch (file.type) {
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'link': return <Link2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const currentLanguage = LANGUAGES.find(l => l.code === bookData.language);
  const currentTone = TONES.find(t => t.id === bookData.tone);
  const currentContentType = CONTENT_TYPES.find(t => t.id === bookData.contentType);
  const currentSource = SOURCE_OPTIONS.find(s => s.id === bookData.sourceType);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onCollapseChange={(collapsed) => setSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button + Tab Navigation on same row */}
            <div className="flex items-center justify-between mb-10">
              <button 
                onClick={() => navigate('/ebook-creator')} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back To Projects</span>
              </button>

              <div className="flex gap-2">
                {TABS.map((tab, index) => {
                  const isActive = activeTab === tab.id;
                  const isPast = TABS.findIndex(t => t.id === activeTab) > index;
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2.5 px-5 text-sm font-medium rounded-xl border-2 transition-all ${
                        isActive 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                          : isPast
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-500'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Generating title ideas...</h3>
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
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm p-6">
                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {uploadedFiles.map(file => (
                        <div 
                          key={file.id}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm"
                        >
                          {getFileIcon(file)}
                          <span className="text-emerald-700 max-w-32 truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="text-emerald-500 hover:text-emerald-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Textarea */}
                  <textarea
                    value={bookData.prompt}
                    onChange={(e) => setBookData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="What is your topic or niche? (e.g., Digital Marketing for Small Businesses, Personal Finance, Healthy Living...)"
                    className="w-full min-h-[120px] resize-none border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-lg"
                  />

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-2">
                      {/* Source Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors">
                            {currentSource && <currentSource.icon className="w-4 h-4" />}
                            <span>Source: {currentSource?.label}</span>
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
                            {currentContentType && <currentContentType.icon className="w-4 h-4" />}
                            <span>Type: {currentContentType?.label}</span>
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {CONTENT_TYPES.map(type => (
                            <DropdownMenuItem
                              key={type.id}
                              onClick={() => setBookData(prev => ({ ...prev, contentType: type.id as any }))}
                              className="flex items-center gap-2"
                            >
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            <span>{currentLanguage?.flag}</span>
                            <span>{currentLanguage?.name}</span>
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
                          {LANGUAGES.map(lang => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => setBookData(prev => ({ ...prev, language: lang.code }))}
                              className="flex items-center gap-2"
                            >
                              <span>{lang.flag}</span>
                              {lang.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Tone Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            <span>{currentTone?.icon}</span>
                            <span>{currentTone?.name}</span>
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
                              <span>{tone.icon}</span>
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
                {bookData.contentType === 'ebook' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
                    
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Chapters</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Words per Chapter</label>
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

                    {/* Generate AI Images */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="includeImages"
                        checked={bookData.includeImages}
                        onChange={(e) => setBookData(prev => ({ ...prev, includeImages: e.target.checked }))}
                        className="w-5 h-5 text-emerald-600 rounded accent-emerald-500"
                      />
                      <label htmlFor="includeImages" className="text-sm text-gray-900">
                        <span className="font-medium">Generate AI images</span>
                        <span className="block text-gray-500 text-xs">Include illustrations for each chapter</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INFO TAB - Title Selection */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Choose Your Title
                </h1>
                <p className="text-gray-500 text-center mb-8">
                  Select the title that best represents your content
                </p>

                {titleSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {titleSuggestions.map((title, index) => (
                      <button
                        key={index}
                        onClick={() => handleTitleSelect(title)}
                        className={`w-full p-5 text-left rounded-xl border-2 transition-all hover:border-emerald-400 hover:bg-emerald-50 ${
                          bookData.selectedTitle === title
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-gray-900">{title}</span>
                          {bookData.selectedTitle === title && (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Complete the Idea step first to generate title suggestions</p>
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

            {/* CUSTOMIZE TAB - Outline & Content */}
            {activeTab === 'customize' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Customize Your Content
                </h1>
                <p className="text-gray-500 text-center mb-8">
                  Edit the outline and chapter content
                </p>

                {bookData.selectedTitle ? (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{bookData.selectedTitle}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.from({ length: bookData.chapters }).map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Chapter {i + 1}</h3>
                          <Input 
                            placeholder={`Enter chapter ${i + 1} title...`}
                            className="mb-2"
                          />
                          <textarea
                            placeholder="Chapter description and key points..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={() => setActiveTab('design')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Continue to Design
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a title first to customize your content</p>
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('info')}
                      className="mt-4"
                    >
                      Go to Info
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Design Your eBook
                </h1>
                <p className="text-gray-500 text-center mb-8">
                  Add charts, images, elements, and choose your cover theme
                </p>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button className="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center">
                      <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Add Charts</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Add Images</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Add Elements</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Theme</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {['Modern', 'Classic', 'Minimal', 'Bold'].map(theme => (
                        <button
                          key={theme}
                          className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-colors flex items-center justify-center"
                        >
                          <span className="text-sm font-medium text-gray-600">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={() => setActiveTab('review')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Continue to Review
                    </Button>
                  </div>
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
                      <span className="font-medium text-gray-900">{bookData.selectedTitle || 'Not selected'}</span>
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
        <DialogContent className="max-w-xl">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter URL</label>
                <div className="flex gap-2">
                  <Input 
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://example.com or YouTube/Vimeo URL"
                    className="flex-1"
                  />
                  <Button onClick={handleLinkAdd}>Add</Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">Supported platforms:</p>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.slice(0, 6).map((platform) => (
                    <div key={platform.name} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                      <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                    </div>
                  ))}
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
  );
};

export default NewEbook;
