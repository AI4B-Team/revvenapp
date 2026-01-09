import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles, Article } from '@/contexts/ArticleContext';
import { 
  FileText, Plus, Upload, Link, Mic, Search, Settings, Download, Edit, Trash2, 
  Eye, Clock, Layers, X, Check, ChevronDown, MoreVertical, Sparkles, Filter, Grid, List,
  Lightbulb, Cpu, PenTool, Link2, Rss, Headphones, Copy
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from 'react-icons/fa';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AIVASidePanel from '@/components/dashboard/AIVASidePanel';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500 bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }} />
  </div>
);

// Platform icons
const PLATFORMS = [
  { name: 'Blog', icon: Rss, color: '#F97316' },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
];

const ArticleHub = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'articles' | 'press'>('articles');
  
  // Modal states for source cards
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [sourceModalType, setSourceModalType] = useState<'upload' | 'link' | 'record'>('upload');
  const [linkInput, setLinkInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { articles, deleteArticle: contextDeleteArticle, addArticle } = useArticles();

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteArticle = (id: number) => { 
    contextDeleteArticle(id); 
    setShowDropdown(null); 
    toast.success('Article deleted');
  };
  
  const duplicateArticle = (article: Article) => {
    const newArticle = { 
      ...article, 
      id: Date.now(), 
      title: `${article.title} (Copy)`, 
      status: 'draft' as const, 
      progress: 0, 
      createdAt: new Date().toISOString().split('T')[0], 
      updatedAt: new Date().toISOString().split('T')[0] 
    };
    addArticle(newArticle); 
    setShowDropdown(null);
    toast.success('Article duplicated');
  };

  // Handle opening source modals
  const handleSourceCardClick = (type: 'upload' | 'link' | 'record') => {
    setSourceModalType(type);
    setSourceModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSourceModalOpen(false);
      toast.success(`${file.name} uploaded`);
      navigate('/article/new?source=upload', { state: { uploadedFile: { name: file.name, file } } });
    }
  };

  // Handle link add
  const handleLinkAdd = () => {
    if (linkInput.trim()) {
      setSourceModalOpen(false);
      setLinkInput('');
      toast.success('Link added');
      navigate('/article/new?source=url', { state: { uploadedFile: { url: linkInput } } });
    }
  };

  // Handle recording complete
  const handleRecordingComplete = () => {
    setIsRecording(false);
    setSourceModalOpen(false);
    toast.success('Recording saved');
    navigate('/article/new?source=voice');
  };

  // Source Cards
  const SourceCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-10">
      {/* Start With AI */}
      <button
        onClick={() => navigate('/article/new?source=ai-generate')}
        className="group relative pt-8 px-8 pb-2 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 min-h-[300px] flex flex-col"
      >
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 flex items-center justify-center mb-5 transition-all duration-300">
            <Sparkles className="w-9 h-9 text-emerald-600 group-hover:scale-110 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start With AI</h3>
          <p className="text-sm text-gray-500 mb-4">Create From Scratch With AI</p>
          {/* Workflow: Idea → Generate → Design → Article */}
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
              <PenTool className="w-4 h-4 text-emerald-500" />
              <span>Edit</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex flex-col items-center">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Article</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="px-2.5 py-1 bg-emerald-200 text-emerald-700 text-xs rounded-full font-medium">Recommended</span>
          </div>
        </div>
      </button>

      {/* Upload File */}
      <button
        onClick={() => handleSourceCardClick('upload')}
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
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">PDF</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">DOCX</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">TXT</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-gray-200">
              <span className="text-[10px] font-semibold text-gray-600">+ more</span>
            </div>
          </div>
        </div>
      </button>

      {/* Insert Link */}
      <div
        className="group relative p-8 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 hover:border-blue-400/50 hover:bg-blue-50 transition-all duration-300 cursor-pointer min-h-[300px] flex flex-col"
        onClick={() => handleSourceCardClick('link')}
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
            {PLATFORMS.map((platform, i) => (
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
        onClick={() => handleSourceCardClick('record')}
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
          {/* Audio Wave Graphic */}
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

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Article List Item
  const ArticleListItem = ({ article }: { article: Article }) => {
    const isModified = article.createdAt !== article.updatedAt;
    
    return (
      <div className="group bg-card border border-border rounded-xl p-4 hover:border-muted-foreground hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => navigate('/article/new?tab=editor', { state: { article } })}>
        <div className="flex items-start gap-4">
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} className="w-16 h-20 rounded-lg object-cover flex-shrink-0 shadow-sm" />
          ) : (
            <div className="w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm bg-emerald-100 border-l-4 border-emerald-500">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground truncate group-hover:text-emerald-600 transition-colors">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{article.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/article/new?tab=editor', { state: { article } }); }} 
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={(e) => { e.stopPropagation(); duplicateArticle(article); }} 
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate</TooltipContent>
                  </Tooltip>
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDropdown(showDropdown === article.id ? null : article.id); }} 
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {showDropdown === article.id && (
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }} 
                          className="w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-muted flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <StatusBadge status={article.status} />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {isModified ? 'Modified' : 'Created'}: {formatDate(article.updatedAt)}</span>
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {article.articleType}</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {(article.wordCount / 1000).toFixed(1)}k words</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {article.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground border border-border">{tag}</span>
              ))}
            </div>
            {article.status !== 'published' && article.progress < 100 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{article.progress}%</span>
                </div>
                <ProgressBar progress={article.progress} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Source Cards */}
            <SourceCards />

            {/* Projects Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Projects</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveProjectTab('articles')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeProjectTab === 'articles' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline-block mr-1.5" />
                    Articles
                  </button>
                  <button
                    onClick={() => setActiveProjectTab('press')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeProjectTab === 'press' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                    }`}
                  >
                    <Headphones className="w-4 h-4 inline-block mr-1.5" />
                    Press Releases
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{filteredArticles.length} Articles</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search articles" 
                    className="pl-9 w-64" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    className="bg-transparent text-sm outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="generating">Generating</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <ArticleListItem key={article.id} article={article} />
              ))}
              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No articles found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Source Modals */}
      <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {sourceModalType === 'upload' && 'Upload File'}
              {sourceModalType === 'link' && 'Insert Link'}
              {sourceModalType === 'record' && 'Record Audio'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {sourceModalType === 'upload' && (
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, TXT, or MD files</p>
                </div>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".pdf,.docx,.txt,.md" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </div>
            )}
            {sourceModalType === 'link' && (
              <div className="space-y-4">
                <Input 
                  placeholder="Paste your link here..." 
                  value={linkInput} 
                  onChange={(e) => setLinkInput(e.target.value)} 
                />
                <Button onClick={handleLinkAdd} className="w-full">Add Link</Button>
              </div>
            )}
            {sourceModalType === 'record' && (
              <div className="space-y-4 text-center">
                <div 
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    isRecording ? 'bg-rose-500 animate-pulse' : 'bg-rose-100 hover:bg-rose-200'
                  }`}
                  onClick={() => {
                    if (isRecording) {
                      handleRecordingComplete();
                    } else {
                      setIsRecording(true);
                    }
                  }}
                >
                  <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-rose-500'}`} />
                </div>
                <p className="font-medium">{isRecording ? 'Recording... Click to stop' : 'Click to start recording'}</p>
                <p className="text-sm text-muted-foreground">Your audio will be transcribed automatically</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AIVASidePanel isOpen={isAIVAPanelOpen} onClose={() => setIsAIVAPanelOpen(false)} />
    </div>
  );
};

export default ArticleHub;
