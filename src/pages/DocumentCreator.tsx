import { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { 
  FileText, Plus, Upload, Link, Mic, Search, Settings, Download, Edit, Trash2, 
  Eye, Clock, Layers, X, Check, ChevronDown, Wand2, RefreshCw, Copy, MoreVertical, 
  Sparkles, Filter, Grid, List, Calendar, Share2, Lightbulb, Cpu, PenTool, 
  Volume2, Video, Link2, Rss, Play, Pause, Headphones, BookOpen, Presentation,
  Package, LayoutList, ArrowLeft, Briefcase, FileCheck, ScrollText
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AIVASidePanel from '@/components/dashboard/AIVASidePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

interface DocumentProject {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'draft' | 'generating' | 'completed';
  createdAt: string;
  updatedAt: string;
  progress: number;
  sections?: number;
  words?: number;
}

// Document type configurations
const DOCUMENT_TYPES: Record<string, {
  label: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  description: string;
  sections: string[];
}> = {
  whitepaper: {
    label: 'Whitepaper',
    icon: FileText,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    description: 'Create authoritative whitepapers with research-backed insights',
    sections: ['Executive Summary', 'Introduction', 'Problem Statement', 'Solution Overview', 'Technical Details', 'Case Studies', 'Conclusion', 'References']
  },
  report: {
    label: 'Report',
    icon: LayoutList,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Generate comprehensive reports with data-driven analysis',
    sections: ['Executive Summary', 'Introduction', 'Methodology', 'Findings', 'Analysis', 'Recommendations', 'Appendix']
  },
  'business-plan': {
    label: 'Business Plan',
    icon: Presentation,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    description: 'Build professional business plans with financial projections',
    sections: ['Executive Summary', 'Company Description', 'Market Analysis', 'Organization & Management', 'Service/Product Line', 'Marketing & Sales', 'Financial Projections', 'Funding Request']
  },
  handbook: {
    label: 'Handbook',
    icon: Package,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    description: 'Create comprehensive handbooks and guides',
    sections: ['Introduction', 'Getting Started', 'Core Concepts', 'Procedures', 'Guidelines', 'Best Practices', 'FAQ', 'Glossary']
  },
  proposal: {
    label: 'Proposal',
    icon: FileCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Draft compelling proposals that win clients',
    sections: ['Cover Letter', 'Executive Summary', 'Problem Statement', 'Proposed Solution', 'Deliverables', 'Timeline', 'Pricing', 'Terms & Conditions']
  },
  'case-study': {
    label: 'Case Study',
    icon: Briefcase,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Create persuasive case studies that showcase success',
    sections: ['Overview', 'Client Background', 'Challenge', 'Solution', 'Implementation', 'Results', 'Key Takeaways', 'Testimonial']
  },
  'cover-letter': {
    label: 'Cover Letter',
    icon: ScrollText,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    description: 'Write professional cover letters that stand out',
    sections: ['Header', 'Opening', 'Body', 'Skills & Qualifications', 'Closing', 'Signature']
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-muted text-muted-foreground border-border',
    generating: 'bg-amber-100 text-amber-700 border-amber-200'
  };
  const labels: Record<string, string> = { completed: 'Completed', draft: 'Draft', generating: 'Generating...' };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]} inline-flex items-center`}>
      {status === 'generating' && <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full animate-pulse" />}
      {labels[status] || status}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500 bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }} />
  </div>
);

const DocumentCreator = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const documentType = type || 'whitepaper';
  const config = DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES.whitepaper;
  const IconComponent = config.icon;
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  // Source modal states
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [sourceModalType, setSourceModalType] = useState<'upload' | 'link' | 'record'>('upload');
  const [linkInput, setLinkInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Document generation states
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  
  // Mock projects data - in real app, fetch from database
  const [projects, setProjects] = useState<DocumentProject[]>([
    {
      id: '1',
      title: `Sample ${config.label}`,
      description: `A sample ${config.label.toLowerCase()} to get you started`,
      type: documentType,
      status: 'completed',
      createdAt: '2026-01-15',
      updatedAt: '2026-01-18',
      progress: 100,
      sections: config.sections.length,
      words: 5200
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStartWithAI = () => {
    setShowNewDocumentModal(true);
  };

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setShowNewDocumentModal(false);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      
      const newProject: DocumentProject = {
        id: Date.now().toString(),
        title: newDocTitle,
        description: newDocDescription || `AI-generated ${config.label.toLowerCase()}`,
        type: documentType,
        status: 'completed',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        progress: 100,
        sections: config.sections.length,
        words: Math.floor(Math.random() * 5000) + 2000
      };

      setProjects(prev => [newProject, ...prev]);
      setIsGenerating(false);
      setNewDocTitle('');
      setNewDocDescription('');
      toast.success(`${config.label} created successfully!`);
    }, 4000);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Document deleted');
    setShowDropdown(null);
  };

  const handleDuplicateProject = (project: DocumentProject) => {
    const duplicate: DocumentProject = {
      ...project,
      id: Date.now().toString(),
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [duplicate, ...prev]);
    toast.success('Document duplicated');
    setShowDropdown(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />
      
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/create')}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-muted-foreground" />
              </button>
              <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                <IconComponent size={24} className={config.color} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{config.label} Creator</h1>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.label.toLowerCase()}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="gap-2"
                >
                  <Filter size={16} />
                  Filter
                </Button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10 p-2">
                    {['all', 'draft', 'generating', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition ${
                          filterStatus === status ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="mb-8 p-6 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-green animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Generating your {config.label.toLowerCase()}...</h3>
                  <p className="text-sm text-muted-foreground">AI is creating content for each section</p>
                </div>
                <span className="text-sm font-medium">{Math.round(generationProgress)}%</span>
              </div>
              <ProgressBar progress={generationProgress} />
            </div>
          )}

          {/* Source Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Start With AI */}
            <button
              onClick={handleStartWithAI}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 flex items-center justify-center transition-all">
                <Sparkles className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium text-foreground">Start With AI</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded-full font-medium">Recommended</span>
            </button>

            {/* Upload File */}
            <button
              onClick={() => {
                setSourceModalType('upload');
                setSourceModalOpen(true);
              }}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border bg-card hover:border-amber-400/50 hover:bg-amber-50 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 group-hover:from-amber-200 group-hover:to-amber-300 flex items-center justify-center transition-all">
                <Upload className="w-7 h-7 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium text-foreground">Upload File</span>
              <div className="flex gap-1">
                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium">PDF</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium">DOCX</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium">+</span>
              </div>
            </button>

            {/* Insert Link */}
            <button
              onClick={() => {
                setSourceModalType('link');
                setSourceModalOpen(true);
              }}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border bg-card hover:border-blue-400/50 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 flex items-center justify-center transition-all">
                <Link2 className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium text-foreground">Insert Link</span>
              <div className="flex gap-1">
                <FaYoutube className="w-4 h-4 text-red-500" />
                <FaTiktok className="w-4 h-4 text-foreground" />
                <FaInstagram className="w-4 h-4 text-pink-500" />
                <span className="text-[10px] text-muted-foreground">+45</span>
              </div>
            </button>

            {/* Record Audio */}
            <button
              onClick={() => {
                setSourceModalType('record');
                setSourceModalOpen(true);
              }}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border bg-card hover:border-rose-400/50 hover:bg-rose-50 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 group-hover:from-rose-200 group-hover:to-rose-300 flex items-center justify-center transition-all">
                <Mic className="w-7 h-7 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium text-foreground">Record Audio</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] px-1 py-0.5 bg-rose-500 text-white rounded font-bold uppercase">Live</span>
              </div>
            </button>
          </div>

          {/* Projects Grid/List */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4">Your {config.label}s</h2>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
                <IconComponent size={32} className={config.color} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No {config.label.toLowerCase()}s yet</h3>
              <p className="text-muted-foreground mb-6">Create your first {config.label.toLowerCase()} using AI or by uploading a file</p>
              <Button onClick={handleStartWithAI} className="gap-2 bg-brand-green hover:bg-brand-green/90">
                <Sparkles size={16} />
                Create with AI
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <IconComponent size={20} className={config.color} />
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === project.id ? null : project.id);
                        }}
                        className="p-1.5 hover:bg-muted rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showDropdown === project.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10 py-1">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateProject(project);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                            <Download size={14} /> Export
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{project.sections} sections</span>
                    <span>{project.words?.toLocaleString()} words</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <StatusBadge status={project.status} />
                    <span className="text-xs text-muted-foreground">Updated {project.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer flex items-center gap-4 group"
                >
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={20} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{project.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm text-muted-foreground">{project.sections} sections</span>
                    <span className="text-sm text-muted-foreground">{project.words?.toLocaleString()} words</span>
                    <StatusBadge status={project.status} />
                    <span className="text-sm text-muted-foreground">{project.updatedAt}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === project.id ? null : project.id);
                        }}
                        className="p-1.5 hover:bg-muted rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showDropdown === project.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10 py-1">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateProject(project);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                            <Download size={14} /> Export
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Document Modal */}
      <Dialog open={showNewDocumentModal} onOpenChange={setShowNewDocumentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <IconComponent size={18} className={config.color} />
              </div>
              Create New {config.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder={`Enter ${config.label.toLowerCase()} title...`}
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Textarea
                placeholder={`Describe what this ${config.label.toLowerCase()} is about...`}
                value={newDocDescription}
                onChange={(e) => setNewDocDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Sections to be generated:</h4>
              <div className="flex flex-wrap gap-1.5">
                {config.sections.map((section, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-background rounded-full border border-border">
                    {section}
                  </span>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreateDocument}
              disabled={!newDocTitle.trim()}
              className="w-full bg-brand-green hover:bg-brand-green/90 gap-2"
            >
              <Sparkles size={16} />
              Generate {config.label}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      {sourceModalOpen && sourceModalType === 'upload' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSourceModalOpen(false)}>
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Upload File</h3>
              <button onClick={() => setSourceModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div 
              className="border-2 border-dashed border-amber-300 rounded-xl p-12 text-center cursor-pointer hover:bg-amber-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="font-medium mb-2">Drag & Drop Your File</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <div className="flex justify-center gap-2 mt-4">
                <span className="text-xs px-2 py-1 bg-muted rounded">PDF</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">DOCX</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">TXT</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">+ more</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  setSourceModalOpen(false);
                  toast.success(`${file.name} uploaded`);
                  setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
                  setShowNewDocumentModal(true);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Link Modal */}
      {sourceModalOpen && sourceModalType === 'link' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSourceModalOpen(false)}>
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Insert Link</h3>
              <button onClick={() => setSourceModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50">
                <Link2 className="w-5 h-5 text-blue-500" />
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Paste website, video, or article link..."
                  className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <FaYoutube className="w-6 h-6 text-red-500" />
                <FaTiktok className="w-6 h-6 text-foreground" />
                <FaInstagram className="w-6 h-6 text-pink-500" />
                <FaFacebook className="w-6 h-6 text-blue-600" />
                <Rss className="w-6 h-6 text-orange-500" />
                <span className="text-sm text-muted-foreground">+ 45 more platforms</span>
              </div>
              <Button
                onClick={() => {
                  if (linkInput.trim()) {
                    setSourceModalOpen(false);
                    toast.success('Link added');
                    setNewDocTitle(`Content from ${new URL(linkInput).hostname}`);
                    setShowNewDocumentModal(true);
                    setLinkInput('');
                  }
                }}
                disabled={!linkInput.trim()}
                className="w-full bg-brand-green hover:bg-brand-green/90"
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Modal */}
      {sourceModalOpen && sourceModalType === 'record' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSourceModalOpen(false)}>
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Record Audio</h3>
              <button onClick={() => setSourceModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="text-center space-y-6">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-rose-100 hover:bg-rose-200'}`}
              >
                <Mic className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-rose-500'}`} />
              </button>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-muted'}`} />
                <span className="text-sm font-medium">{isRecording ? 'Recording...' : 'Click to start'}</span>
              </div>
              <p className="text-sm text-muted-foreground">Real-Time Transcription</p>
              {isRecording && (
                <Button
                  onClick={() => {
                    setIsRecording(false);
                    setSourceModalOpen(false);
                    toast.success('Recording saved');
                    setNewDocTitle('Voice Recording ' + new Date().toLocaleDateString());
                    setShowNewDocumentModal(true);
                  }}
                  className="w-full bg-brand-green hover:bg-brand-green/90"
                >
                  Stop & Use Recording
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <AIVASidePanel 
        isOpen={isAIVAPanelOpen}
        onClose={() => setIsAIVAPanelOpen(false)}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  );
};

export default DocumentCreator;
