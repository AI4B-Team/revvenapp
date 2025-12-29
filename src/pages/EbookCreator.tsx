import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, Plus, Upload, Link, Mic, Search, Settings, Download, Edit, Trash2, 
  Eye, Clock, FileText, Layers, X, Check, ChevronDown, Image, Palette, 
  Wand2, RefreshCw, Copy, MoreVertical, Sparkles, Filter, Grid, List, Calendar,
  Share2, Lightbulb, Cpu, PenTool, Volume2, Video, Link2, Rss
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import EbookHeader from '@/components/dashboard/EbookHeader';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-muted text-muted-foreground border-border',
    generating: 'bg-amber-100 text-amber-700 border-amber-200'
  };
  const labels: Record<string, string> = { published: 'Published', draft: 'Draft', generating: 'Generating...' };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]} inline-flex items-center`}>
      {status === 'generating' && <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full animate-pulse" />}
      {labels[status]}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ progress, color = '#10B981' }: { progress: number; color?: string }) => (
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }} />
  </div>
);

interface Ebook {
  id: number;
  title: string;
  description: string;
  chapters: number;
  words: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  coverColor: string;
  tags: string[];
  progress: number;
}

interface NewBookData {
  title: string;
  topic: string;
  audience: string;
  tone: string;
  chapters: number;
  wordsPerChapter: number;
  includeImages: boolean;
  sourceType: string;
  sourceContent: string;
}

const EbookCreator = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [showChapterEditor, setShowChapterEditor] = useState(false);
  const [showCoverDesigner, setShowCoverDesigner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'ebooks' | 'audiobooks'>('ebooks');

  const [ebooks, setEbooks] = useState<Ebook[]>([
    { id: 1, title: 'The Ultimate Guide to AI Marketing', description: 'A comprehensive guide to leveraging AI in your marketing strategy', chapters: 12, words: 45000, status: 'published', createdAt: '2025-12-15', updatedAt: '2025-12-17', coverColor: '#10B981', tags: ['Marketing', 'AI', 'Business'], progress: 100 },
    { id: 2, title: 'Passive Income Mastery', description: 'Build multiple streams of passive income with proven strategies', chapters: 8, words: 32000, status: 'draft', createdAt: '2025-12-10', updatedAt: '2025-12-18', coverColor: '#6366F1', tags: ['Finance', 'Business'], progress: 75 },
    { id: 3, title: 'Digital Product Blueprint', description: 'Create and sell digital products that generate revenue 24/7', chapters: 10, words: 28000, status: 'generating', createdAt: '2025-12-18', updatedAt: '2025-12-19', coverColor: '#F59E0B', tags: ['Ecommerce', 'Digital Products'], progress: 45 },
    { id: 4, title: 'Social Media Automation Secrets', description: 'Automate your social media presence and grow your audience', chapters: 6, words: 18000, status: 'draft', createdAt: '2025-12-05', updatedAt: '2025-12-16', coverColor: '#EC4899', tags: ['Social Media', 'Automation'], progress: 60 },
    { id: 5, title: 'Content Creation Playbook', description: 'Master content creation across all platforms', chapters: 15, words: 52000, status: 'published', createdAt: '2025-11-20', updatedAt: '2025-12-01', coverColor: '#8B5CF6', tags: ['Content', 'Marketing'], progress: 100 }
  ]);

  const [newBookData, setNewBookData] = useState<NewBookData>({
    title: '', topic: '', audience: '', tone: 'professional', chapters: 8, wordsPerChapter: 2000, includeImages: true, sourceType: 'ai-generate', sourceContent: ''
  });

  const filteredEbooks = ebooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.description.toLowerCase().includes(searchQuery.toLowerCase()) || book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const simulateGeneration = async () => {
    if (!newBookData.title && !newBookData.topic) {
      toast.error('Please enter a title or topic');
      return;
    }
    
    setShowNewBookModal(false);
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          const newBook: Ebook = {
            id: Date.now(), 
            title: newBookData.title || 'New AI-Generated eBook', 
            description: newBookData.topic || 'An AI-generated comprehensive guide',
            chapters: newBookData.chapters, 
            words: newBookData.chapters * newBookData.wordsPerChapter, 
            status: 'draft',
            createdAt: new Date().toISOString().split('T')[0], 
            updatedAt: new Date().toISOString().split('T')[0],
            coverColor: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 5)], 
            tags: ['AI Generated'], 
            progress: 100
          };
          setEbooks(prev => [newBook, ...prev]);
          toast.success('eBook generated successfully!');
          return 100;
        }
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 500);
  };

  const deleteEbook = (id: number) => { 
    setEbooks(prev => prev.filter(book => book.id !== id)); 
    setShowDropdown(null); 
    toast.success('eBook deleted');
  };
  
  const duplicateEbook = (book: Ebook) => {
    const newBook = { ...book, id: Date.now(), title: `${book.title} (Copy)`, status: 'draft', progress: 0, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
    setEbooks(prev => [newBook, ...prev]); 
    setShowDropdown(null);
    toast.success('eBook duplicated');
  };

  // Platform icons data matching TranscribeApp
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

  // Source Cards - TranscribeApp style
  const SourceCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-10">
      {/* Start With AI */}
      <button
        onClick={() => { setNewBookData(prev => ({ ...prev, sourceType: 'ai-generate' })); setShowNewBookModal(true); }}
        className="group relative pt-8 px-8 pb-2 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 min-h-[300px] flex flex-col"
      >
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 flex items-center justify-center mb-5 transition-all duration-300">
            <Sparkles className="w-9 h-9 text-emerald-600 group-hover:scale-110 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start With AI</h3>
          <p className="text-sm text-gray-500 mb-4">Create From Scratch With AI</p>
          {/* Workflow: Idea → Generate → Design → Book */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex flex-col items-center">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
              <span>Idea</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex flex-col items-center">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>Generate</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex flex-col items-center">
              <Palette className="w-4 h-4 text-emerald-500" />
              <span>Design</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex flex-col items-center">
              <Book className="w-4 h-4 text-emerald-500" />
              <span>eBook</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="px-2.5 py-1 bg-emerald-200 text-emerald-700 text-xs rounded-full font-medium">Recommended</span>
          </div>
        </div>
      </button>

      {/* Upload File */}
      <button
        onClick={() => { setNewBookData(prev => ({ ...prev, sourceType: 'upload' })); setShowNewBookModal(true); }}
        className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-amber-400/50 hover:bg-amber-50 transition-all duration-300 min-h-[300px] flex flex-col"
      >
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 group-hover:from-amber-200 group-hover:to-amber-300 flex items-center justify-center mb-5 transition-all duration-300">
            <Upload className="w-9 h-9 text-amber-600 group-hover:scale-110 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload File</h3>
          <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 bg-white flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-500 whitespace-nowrap flex-1 text-center">Drag & Drop Your File</span>
          </div>
          <div className="flex justify-center gap-1.5 items-center flex-wrap">
            {/* PDF Badge */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">PDF</span>
            </div>
            {/* DOCX Badge */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">DOCX</span>
            </div>
            {/* TXT Badge */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">TXT</span>
            </div>
            {/* + more */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <span className="text-[10px] font-semibold text-gray-600">+ more</span>
            </div>
          </div>
        </div>
      </button>

      {/* Insert Link */}
      <div
        className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-blue-400/50 hover:bg-blue-50 transition-all duration-300 cursor-pointer min-h-[300px] flex flex-col"
        onClick={() => { setNewBookData(prev => ({ ...prev, sourceType: 'url' })); setShowNewBookModal(true); }}
      >
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 group-hover:from-blue-500/20 group-hover:to-blue-600/20 flex items-center justify-center mb-5 transition-all duration-300">
            <Link2 className="w-9 h-9 text-blue-500 group-hover:scale-110 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Insert Link</h3>
          <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 bg-white flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-500 whitespace-nowrap flex-1 text-center">Paste Website Link</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.filter((p) =>
              ['Blog', 'YouTube', 'TikTok', 'Instagram', 'Facebook'].includes(p.name)
            ).map((platform, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
              </div>
            ))}
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +45
            </div>
          </div>
        </div>
      </div>

      {/* Record Audio */}
      <button
        onClick={() => { setNewBookData(prev => ({ ...prev, sourceType: 'voice' })); setShowNewBookModal(true); }}
        className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-rose-400/50 hover:bg-rose-50 transition-all duration-300 min-h-[300px] flex flex-col"
      >
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/10 group-hover:from-rose-500/20 group-hover:to-rose-600/20 flex items-center justify-center mb-5 transition-all duration-300">
            <Mic className="w-9 h-9 text-rose-500 group-hover:scale-110 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Record Audio</h3>
          <p className="text-sm text-gray-500">Click To Start Recording</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wide">Live</span>
            Real-Time Transcription
          </div>
          {/* Audio Wave Graphic - Animated on hover */}
          <div className="mt-3 flex items-center justify-center gap-[2px] h-5">
            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className="w-[2px] bg-rose-400/60 rounded-full group-hover:bg-rose-500 transition-colors duration-300 group-hover:animate-[audioWave_1s_ease-in-out_infinite]"
                style={{
                  height: `${Math.sin((i / 28) * Math.PI * 3) * 6 + 8}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      </button>
    </div>
  );

  // Helper function to format date as MM/DD/YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // eBook List Item
  const EbookListItem = ({ book }: { book: Ebook }) => {
    const isModified = book.createdAt !== book.updatedAt;
    
    return (
      <div className="group bg-card border border-border rounded-xl p-4 hover:border-muted-foreground hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => { setSelectedBook(book); setShowChapterEditor(true); }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: book.coverColor + '20', borderLeft: `4px solid ${book.coverColor}` }}>
            <Book className="w-8 h-8" style={{ color: book.coverColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground truncate group-hover:text-emerald-600 transition-colors">{book.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{book.description}</p>
              </div>
              <StatusBadge status={book.status} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              {isModified ? (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Modified: {formatDate(book.updatedAt)}</span>
              ) : (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Created: {formatDate(book.createdAt)}</span>
              )}
              <span className="flex items-center gap-1"><Layers className="w-4 h-4" />{book.chapters} chapters</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{(book.words / 1000).toFixed(1)}k words</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {book.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full font-medium">{tag}</span>)}
            </div>
            {book.status !== 'published' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Progress</span><span>{Math.round(book.progress)}%</span></div>
                <ProgressBar progress={book.progress} color={book.coverColor} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
            <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowChapterEditor(true); }} className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors" title="Edit"><Edit className="w-5 h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowCoverDesigner(true); }} className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors" title="Design Cover"><Palette className="w-5 h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowExportModal(true); }} className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors" title="Export"><Download className="w-5 h-5" /></button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowDropdown(showDropdown === book.id ? null : book.id); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><MoreVertical className="w-5 h-5" /></button>
              {showDropdown === book.id && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 z-10">
                  <button onClick={(e) => { e.stopPropagation(); duplicateEbook(book); }} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"><Copy className="w-4 h-4" />Duplicate</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteEbook(book.id); }} className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Grid Item
  const EbookGridItem = ({ book }: { book: Ebook }) => {
    const isModified = book.createdAt !== book.updatedAt;
    
    return (
      <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-muted-foreground hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={() => { setSelectedBook(book); setShowChapterEditor(true); }}>
        <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: book.coverColor + '15' }}>
          <div className="w-24 h-32 rounded-lg shadow-xl flex items-center justify-center" style={{ backgroundColor: book.coverColor }}>
            <Book className="w-12 h-12 text-white/80" />
          </div>
          <div className="absolute top-3 right-3"><StatusBadge status={book.status} /></div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowChapterEditor(true); }} className="p-2 bg-background rounded-lg text-foreground hover:bg-emerald-500 hover:text-white transition-colors"><Edit className="w-5 h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowExportModal(true); }} className="p-2 bg-background rounded-lg text-foreground hover:bg-blue-500 hover:text-white transition-colors"><Download className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate group-hover:text-emerald-600 transition-colors">{book.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{book.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {isModified ? (
              <span>Modified: {formatDate(book.updatedAt)}</span>
            ) : (
              <span>Created: {formatDate(book.createdAt)}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground"><span>{book.chapters} ch</span><span>•</span><span>{(book.words / 1000).toFixed(1)}k words</span></div>
          {book.status !== 'published' && <div className="mt-3"><ProgressBar progress={book.progress} color={book.coverColor} /></div>}
        </div>
      </div>
    );
  };

  // New Book Modal
  const NewBookModal = () => {
    const sourceLabels: Record<string, string> = { 'ai-generate': 'AI Generate', 'upload': 'Upload', 'url': 'URL', 'voice': 'Voice' };
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div><h2 className="text-xl font-bold text-foreground">Create New eBook</h2><p className="text-sm text-muted-foreground mt-0.5">{sourceLabels[newBookData.sourceType]} Mode</p></div>
            <button onClick={() => setShowNewBookModal(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
              {Object.entries(sourceLabels).map(([key, label]) => (
                <button key={key} onClick={() => setNewBookData(prev => ({ ...prev, sourceType: key }))} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${newBookData.sourceType === key ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>
              ))}
            </div>
            {newBookData.sourceType === 'ai-generate' && (
              <div className="space-y-5">
                <div><label className="block text-sm font-medium text-foreground mb-2">eBook Title</label><Input type="text" value={newBookData.title} onChange={(e) => setNewBookData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., The Ultimate Guide to Digital Marketing" className="w-full" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-2">Topic / Description</label><Textarea value={newBookData.topic} onChange={(e) => setNewBookData(prev => ({ ...prev, topic: e.target.value }))} placeholder="Describe what your eBook should be about..." rows={4} className="w-full resize-none" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-2">Target Audience</label><Input type="text" value={newBookData.audience} onChange={(e) => setNewBookData(prev => ({ ...prev, audience: e.target.value }))} placeholder="e.g., Small business owners, beginners..." className="w-full" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-foreground mb-2">Writing Tone</label><select value={newBookData.tone} onChange={(e) => setNewBookData(prev => ({ ...prev, tone: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground"><option value="professional">Professional</option><option value="conversational">Conversational</option><option value="academic">Academic</option><option value="friendly">Friendly</option></select></div>
                  <div><label className="block text-sm font-medium text-foreground mb-2">Chapters</label><select value={newBookData.chapters} onChange={(e) => setNewBookData(prev => ({ ...prev, chapters: parseInt(e.target.value) }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground">{[5, 6, 7, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} chapters</option>)}</select></div>
                </div>
                <div><label className="block text-sm font-medium text-foreground mb-2">Words per Chapter</label><div className="flex gap-2">{[1000, 1500, 2000, 2500, 3000].map(n => <button key={n} onClick={() => setNewBookData(prev => ({ ...prev, wordsPerChapter: n }))} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border ${newBookData.wordsPerChapter === n ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-border text-muted-foreground'}`}>{(n / 1000).toFixed(1)}k</button>)}</div><p className="text-xs text-muted-foreground mt-2">Estimated: ~{((newBookData.chapters * newBookData.wordsPerChapter) / 1000).toFixed(0)}k words</p></div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-xl"><input type="checkbox" id="includeImages" checked={newBookData.includeImages} onChange={(e) => setNewBookData(prev => ({ ...prev, includeImages: e.target.checked }))} className="w-5 h-5 text-emerald-600 rounded accent-emerald-500" /><label htmlFor="includeImages" className="text-sm text-foreground"><span className="font-medium">Generate AI images</span><span className="block text-muted-foreground text-xs">Include illustrations for each chapter</span></label></div>
              </div>
            )}
            {newBookData.sourceType === 'upload' && (
              <div className="space-y-5">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-emerald-400 cursor-pointer transition-colors">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium text-foreground">Drag & Drop Your File Here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  <div className="flex justify-center gap-2 mt-4">{['.pdf', '.docx', '.txt', '.md'].map(ext => <span key={ext} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">{ext}</span>)}</div>
                </div>
              </div>
            )}
            {newBookData.sourceType === 'url' && (
              <div className="space-y-5">
                <div><label className="block text-sm font-medium text-foreground mb-2">Website URL</label><div className="flex gap-2"><Input type="url" value={newBookData.sourceContent} onChange={(e) => setNewBookData(prev => ({ ...prev, sourceContent: e.target.value }))} placeholder="https://example.com/blog-post" className="flex-1" /><Button variant="secondary">Fetch</Button></div></div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-100 dark:border-emerald-900"><h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">Supported Sources</h4><div className="grid grid-cols-2 gap-2 text-sm text-emerald-700 dark:text-emerald-300"><span>• Blog posts</span><span>• Articles</span><span>• Documentation</span><span>• Medium articles</span></div></div>
              </div>
            )}
            {newBookData.sourceType === 'voice' && (
              <div className="space-y-5 text-center p-8">
                <button className="w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform"><Mic className="w-10 h-10 text-white" /></button>
                <p className="font-medium text-foreground">Click to Start Recording</p>
                <p className="text-sm text-muted-foreground">Speak your ideas and we'll transcribe them</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/50">
            <Button variant="ghost" onClick={() => setShowNewBookModal(false)}>Cancel</Button>
            <Button onClick={simulateGeneration} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-5 h-5 mr-2" />Generate eBook
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Chapter Editor Modal
  const ChapterEditorModal = () => {
    const [activeChapter, setActiveChapter] = useState(0);
    const [chapters, setChapters] = useState([
      { id: 1, title: 'Introduction', content: 'Welcome to your comprehensive guide. This eBook is designed to provide you with all the knowledge and tools you need to succeed.', wordCount: 1250 },
      { id: 2, title: 'Getting Started', content: 'In this chapter, we will explore the essential first steps you need to take on your journey.', wordCount: 2100 },
      { id: 3, title: 'Core Concepts', content: 'Understanding the fundamentals is crucial for long-term success.', wordCount: 1850 },
      { id: 4, title: 'Advanced Strategies', content: 'Once you have mastered the basics, it is time to elevate your skills.', wordCount: 2400 },
      { id: 5, title: 'Conclusion', content: 'In conclusion, we have covered all the essential knowledge you need.', wordCount: 800 },
    ]);
    
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    
    const handleAiImprove = async () => {
      setIsAiGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('editor-chat', {
          body: {
            messages: [{
              role: 'user',
              content: `Improve and expand this chapter content to make it more engaging and detailed:\n\nTitle: ${chapters[activeChapter].title}\n\nContent: ${chapters[activeChapter].content}`
            }]
          }
        });
        
        if (error) throw error;
        
        const newChapters = [...chapters];
        newChapters[activeChapter].content = data.response || data.content || chapters[activeChapter].content;
        newChapters[activeChapter].wordCount = newChapters[activeChapter].content.split(/\s+/).filter(Boolean).length;
        setChapters(newChapters);
        toast.success('Chapter improved with AI!');
      } catch (error) {
        console.error('Error improving chapter:', error);
        toast.error('Failed to improve chapter');
      } finally {
        setIsAiGenerating(false);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-card w-full h-full max-w-7xl max-h-[95vh] m-4 rounded-2xl overflow-hidden shadow-2xl flex border border-border">
          <div className="w-72 bg-muted/50 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Chapters</h3><p className="text-xs text-muted-foreground mt-1">{chapters.length} chapters • {chapters.reduce((acc, ch) => acc + ch.wordCount, 0).toLocaleString()} words</p></div>
            <div className="flex-1 overflow-y-auto p-2">
              {chapters.map((chapter, index) => (
                <button key={chapter.id} onClick={() => setActiveChapter(index)} className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${activeChapter === index ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'hover:bg-muted text-foreground'}`}>
                  <div className="flex items-center gap-2"><span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${activeChapter === index ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>{index + 1}</span><span className="font-medium truncate">{chapter.title}</span></div>
                  <p className="text-xs text-muted-foreground mt-1 ml-8">{chapter.wordCount.toLocaleString()} words</p>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border"><button className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-emerald-400 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors"><Plus className="w-5 h-5" />Add Chapter</button></div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowChapterEditor(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
                <div><h2 className="font-semibold text-foreground">{selectedBook?.title || 'eBook Editor'}</h2><p className="text-sm text-muted-foreground">Editing: {chapters[activeChapter]?.title}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleAiImprove} disabled={isAiGenerating}><Wand2 className="w-5 h-5 mr-2" />{isAiGenerating ? 'Improving...' : 'AI Improve'}</Button>
                <Button variant="ghost"><RefreshCw className="w-5 h-5 mr-2" />Regenerate</Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Save Changes</Button>
              </div>
            </div>
            <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/50">
              {['B', 'I', 'U', '|', 'H1', 'H2', '|', '•', '1.', '|', '📷'].map((tool, i) => tool === '|' ? <div key={i} className="w-px h-6 bg-border mx-1" /> : <button key={i} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded text-sm font-medium transition-colors">{tool}</button>)}
            </div>
            <div className="px-8 pt-8"><input type="text" value={chapters[activeChapter]?.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[activeChapter].title = e.target.value; setChapters(newChapters); }} className="w-full text-3xl font-bold text-foreground focus:outline-none border-b-2 border-transparent focus:border-emerald-500 pb-2 bg-transparent" placeholder="Chapter Title" /></div>
            <div className="flex-1 px-8 py-4 overflow-y-auto"><textarea value={chapters[activeChapter]?.content} onChange={(e) => { const newChapters = [...chapters]; newChapters[activeChapter].content = e.target.value; newChapters[activeChapter].wordCount = e.target.value.split(/\s+/).filter(Boolean).length; setChapters(newChapters); }} className="w-full h-full min-h-[400px] text-lg text-foreground leading-relaxed focus:outline-none resize-none bg-transparent" placeholder="Start writing..." /></div>
            <div className="p-4 border-t border-border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-white" /></div>
                <Input type="text" placeholder="Ask AI to help... (e.g., 'Make this more engaging')" className="flex-1 bg-background" />
                <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">Generate</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cover Designer Modal
  const CoverDesignerModal = () => {
    const [coverStyle, setCoverStyle] = useState('modern');
    const [selectedColor, setSelectedColor] = useState(selectedBook?.coverColor || '#10B981');
    const [coverTitle, setCoverTitle] = useState(selectedBook?.title || '');
    const [coverSubtitle, setCoverSubtitle] = useState('A Comprehensive Guide');
    const [authorName, setAuthorName] = useState('Your Name');
    const colors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];
    const styles = [{ id: 'modern', name: 'Modern', desc: 'Clean & minimal' }, { id: 'bold', name: 'Bold', desc: 'High contrast' }, { id: 'elegant', name: 'Elegant', desc: 'Sophisticated' }, { id: 'creative', name: 'Creative', desc: 'Artistic' }];
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-card rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex border border-border">
          <div className="w-1/2 bg-muted p-8 flex items-center justify-center">
            <div className="w-64 h-96 rounded-lg shadow-2xl flex flex-col justify-between p-6 relative overflow-hidden" style={{ backgroundColor: selectedColor }}>
              {coverStyle === 'modern' && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full" />}
              {coverStyle === 'bold' && <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />}
              {coverStyle === 'elegant' && <><div className="absolute top-4 left-4 right-4 h-px bg-white/40" /><div className="absolute bottom-4 left-4 right-4 h-px bg-white/40" /></>}
              <div className="relative z-10"><p className="text-white/70 text-xs font-medium uppercase tracking-wider">{coverSubtitle}</p></div>
              <div className="relative z-10"><h3 className="text-white text-2xl font-bold leading-tight">{coverTitle || 'Your eBook Title'}</h3></div>
              <div className="relative z-10"><p className="text-white/80 text-sm">{authorName}</p></div>
            </div>
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border"><h2 className="text-xl font-bold text-foreground">Cover Designer</h2><button onClick={() => setShowCoverDesigner(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div><label className="block text-sm font-medium text-foreground mb-3">Cover Style</label><div className="grid grid-cols-2 gap-3">{styles.map(style => <button key={style.id} onClick={() => setCoverStyle(style.id)} className={`p-3 rounded-xl border-2 text-left transition-all ${coverStyle === style.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-border hover:border-muted-foreground'}`}><p className="font-medium text-foreground">{style.name}</p><p className="text-xs text-muted-foreground">{style.desc}</p></button>)}</div></div>
              <div><label className="block text-sm font-medium text-foreground mb-3">Cover Color</label><div className="flex gap-2 flex-wrap">{colors.map(color => <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-xl transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-muted-foreground scale-110' : ''}`} style={{ backgroundColor: color }} />)}<button className="w-10 h-10 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground"><Plus className="w-5 h-5" /></button></div></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Title</label><Input type="text" value={coverTitle} onChange={(e) => setCoverTitle(e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Subtitle</label><Input type="text" value={coverSubtitle} onChange={(e) => setCoverSubtitle(e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Author Name</label><Input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} /></div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border border-purple-100 dark:border-purple-900"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-medium text-foreground">AI Cover Generator</span></div><Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">Generate AI Cover</Button></div>
            </div>
            <div className="p-6 border-t border-border flex gap-3"><Button variant="outline" onClick={() => setShowCoverDesigner(false)} className="flex-1">Cancel</Button><Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">Save Cover</Button></div>
          </div>
        </div>
      </div>
    );
  };

  // Export Modal
  const ExportModal = () => {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [exportOptions, setExportOptions] = useState({ includeCover: true, includeTableOfContents: true, includePageNumbers: true, fontSize: 'medium' });
    const formats = [{ id: 'pdf', name: 'PDF', icon: '📄', desc: 'Best for printing' }, { id: 'epub', name: 'EPUB', icon: '📱', desc: 'For e-readers' }, { id: 'mobi', name: 'MOBI', icon: '📚', desc: 'For Kindle' }, { id: 'docx', name: 'DOCX', icon: '📝', desc: 'Editable' }, { id: 'html', name: 'HTML', icon: '🌐', desc: 'Web-ready' }];
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border"><div><h2 className="text-xl font-bold text-foreground">Export eBook</h2><p className="text-sm text-muted-foreground mt-0.5">{selectedBook?.title}</p></div><button onClick={() => setShowExportModal(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button></div>
          <div className="p-6 space-y-6">
            <div><label className="block text-sm font-medium text-foreground mb-3">Export Format</label><div className="grid grid-cols-2 gap-3">{formats.map(format => <button key={format.id} onClick={() => setSelectedFormat(format.id)} className={`p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${selectedFormat === format.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-border hover:border-muted-foreground'}`}><span className="text-2xl">{format.icon}</span><div><p className="font-medium text-foreground">{format.name}</p><p className="text-xs text-muted-foreground">{format.desc}</p></div></button>)}</div></div>
            <div><label className="block text-sm font-medium text-foreground mb-3">Options</label><div className="space-y-3">{[{ key: 'includeCover', label: 'Include cover page' }, { key: 'includeTableOfContents', label: 'Include table of contents' }, { key: 'includePageNumbers', label: 'Include page numbers' }].map(option => <label key={option.key} className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={exportOptions[option.key as keyof typeof exportOptions] as boolean} onChange={(e) => setExportOptions(prev => ({ ...prev, [option.key]: e.target.checked }))} className="w-5 h-5 text-emerald-600 rounded accent-emerald-500" /><span className="text-sm text-foreground">{option.label}</span></label>)}</div></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Font Size</label><div className="flex gap-2">{['small', 'medium', 'large'].map(size => <button key={size} onClick={() => setExportOptions(prev => ({ ...prev, fontSize: size }))} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border capitalize transition-all ${exportOptions.fontSize === size ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-border text-muted-foreground'}`}>{size}</button>)}</div></div>
          </div>
          <div className="p-6 border-t border-border bg-muted/50 flex gap-3"><Button variant="outline" onClick={() => setShowExportModal(false)} className="flex-1">Cancel</Button><Button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"><Download className="w-5 h-5 mr-2" />Export {selectedFormat.toUpperCase()}</Button></div>
        </div>
      </div>
    );
  };

  // Generation Overlay
  const GenerationOverlay = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md text-center border border-border">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"><Sparkles className="w-10 h-10 text-white animate-spin" /></div>
        <h3 className="text-xl font-bold text-foreground mb-2">Generating Your eBook</h3>
        <p className="text-muted-foreground mb-6">Our AI is crafting your content...</p>
        <div className="mb-4"><div className="flex justify-between text-sm text-muted-foreground mb-2"><span>Progress</span><span>{Math.round(generationProgress)}%</span></div><div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${generationProgress}%` }} /></div></div>
        <div className="text-sm text-muted-foreground">{generationProgress < 20 && '📝 Creating outline...'}{generationProgress >= 20 && generationProgress < 50 && '✍️ Writing chapters...'}{generationProgress >= 50 && generationProgress < 80 && '🎨 Generating images...'}{generationProgress >= 80 && '✨ Finalizing...'}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar onCollapseChange={setSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <Header />
        {/* Ebook Studio Header - matching Transcribe style */}
        <EbookHeader onExportClick={() => setShowExportModal(true)} />

        <main className="flex-1 overflow-auto">
          {/* Full-width content area with white background */}
          <div className="min-h-full bg-white text-gray-900">

            <div className="px-6 py-8 max-w-[1400px] mx-auto">

              {/* Source Cards */}
              <SourceCards />
              
              {/* Content below */}

              {/* Projects List */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Book className="w-5 h-5 text-emerald-500" />
                      Projects
                    </h2>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveProjectTab('ebooks')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeProjectTab === 'ebooks' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        eBooks
                      </button>
                      <button
                        onClick={() => setActiveProjectTab('audiobooks')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeProjectTab === 'audiobooks' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        AudioBooks
                      </button>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                      {ebooks.length} Books
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search eBooks"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === -1 ? null : -1)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        Filter
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showDropdown === -1 && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                          {[
                            { value: 'all', label: 'All' },
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Draft' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setFilterStatus(option.value); setShowDropdown(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                            >
                              {option.label}
                              {filterStatus === option.value && <Check className="w-4 h-4 text-emerald-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-5 h-5" /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}><Grid className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  {viewMode === 'list' ? (
                    <div className="space-y-3">{filteredEbooks.map(book => <EbookListItem key={book.id} book={book} />)}</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{filteredEbooks.map(book => <EbookGridItem key={book.id} book={book} />)}</div>
                  )}
                  {filteredEbooks.length === 0 && (
                    <div className="text-center py-12">
                      <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No eBooks Found</h3>
                      <p className="text-gray-500 mb-4">Create your first eBook to get started</p>
                      <Button onClick={() => setShowNewBookModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Plus className="w-5 h-5 mr-2" />Create eBook
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showNewBookModal && <NewBookModal />}
      {showChapterEditor && <ChapterEditorModal />}
      {showCoverDesigner && <CoverDesignerModal />}
      {showExportModal && <ExportModal />}
      {isGenerating && <GenerationOverlay />}
    </div>
  );
};

export default EbookCreator;
