import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Flame, 
  Link2, 
  Wand2, 
  Languages, 
  Palette, 
  Zap, 
  Film, 
  Scissors, 
  Type,
  Download,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Video,
  X,
  Sparkles,
  TrendingUp,
  Crown,
  Play,
  Settings2,
  ChevronRight,
  ArrowRight,
  FileVideo
} from "lucide-react";

interface Language {
  name: string;
  code: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  downloadUrl?: string;
  directUrl?: string;
  previewUrl?: string;
  createdAt: string;
  transcriptionStatus?: string;
  failureReason?: string;
}

const ViralShorts = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Hormozi 2");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [magicZooms, setMagicZooms] = useState(true);
  const [magicBrolls, setMagicBrolls] = useState(true);
  const [removeSilence, setRemoveSilence] = useState<string>("natural");
  const [enableHookTitle, setEnableHookTitle] = useState(false);
  const [hookTitleText, setHookTitleText] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [templateFilter, setTemplateFilter] = useState('All');
  
  const [templates, setTemplates] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pollingId, setPollingId] = useState<string | null>(null);
  
  // Upload states
  const [sourceType, setSourceType] = useState<'url' | 'upload'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLLabelElement>(null);

  // Template metadata
  const templateMeta: Record<string, { isNew?: boolean; isPremium?: boolean; isTrending?: boolean }> = {
    'Laura': { isNew: true },
    'Kelly 2': { isNew: true, isPremium: true },
    'Caleb': { isNew: true },
    'Kendrick': { isNew: true },
    'Sara': { isPremium: true },
    'Lewis': { isPremium: true, isTrending: true },
    'Mark': { isPremium: true },
    'Hormozi 4': { isPremium: true, isTrending: true },
    'Hormozi 5': { isPremium: true },
    'Gstaad': { isPremium: true },
    'Nema': { isPremium: true },
    'Beast': { isTrending: true },
    'Hormozi 1': { isTrending: true },
    'Hormozi 2': { isTrending: true },
  };

  useEffect(() => {
    fetchTemplates();
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (!pollingId) return;
    const interval = setInterval(async () => {
      await checkProjectStatus(pollingId);
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingId]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('viral-shorts', {
        body: { action: 'get-templates' }
      });
      if (error) throw error;
      if (data?.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([
        "Sara", "Daniel", "Dan 2", "Hormozi 4", "Dan", "Devin", "Tayo", "Ella",
        "Tracy", "Luke", "Hormozi 1", "Hormozi 2", "Hormozi 3", "Hormozi 5",
        "Leila", "Jason", "William", "Leon", "Ali", "Beast", "Maya", "Karl",
        "Iman", "Umi", "David", "Noah", "Gstaad", "Malta", "Nema", "seth",
        "Laura", "Kelly 2", "Caleb", "Kendrick", "Lewis", "Doug", "CARLOS", "LUKE", "MARK"
      ]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('viral-shorts', {
        body: { action: 'get-languages' }
      });
      if (error) throw error;
      if (data?.languages) {
        setLanguages(data.languages);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      setLanguages([
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "French", code: "fr" },
        { name: "German", code: "de" },
        { name: "Italian", code: "it" },
        { name: "Portuguese", code: "pt" },
        { name: "Dutch", code: "nl" },
        { name: "Russian", code: "ru" },
        { name: "Chinese", code: "zh" },
        { name: "Japanese", code: "ja" },
        { name: "Korean", code: "ko" },
        { name: "Arabic", code: "ar" },
        { name: "Hindi", code: "hi" }
      ]);
    }
  };

  const checkProjectStatus = async (projectId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('viral-shorts', {
        body: { action: 'get-project', projectId }
      });
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
      if (data.status === 'completed' || data.status === 'failed') {
        setPollingId(null);
        if (data.status === 'completed') {
          toast.success('Video processing completed!');
        } else {
          toast.error(`Processing failed: ${data.failureReason || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error checking project status:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileAccept(file);
    } else {
      toast.error('Please drop a video file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileAccept(file);
  };

  const handleFileAccept = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File size must be less than 500MB');
      return;
    }
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setUploadedFile(file);
    if (!title) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
    setActiveStep(2);
  };

  const uploadVideoToCloudinary = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setUploadProgress(30);
      const base64Data = await base64Promise;
      setUploadProgress(50);
      const { data, error } = await supabase.functions.invoke('upload-video', {
        body: { video: base64Data, filename: file.name, duration: 0 }
      });
      if (error) throw error;
      setUploadProgress(100);
      if (!data?.video?.url) throw new Error('No URL returned from upload');
      return data.video.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProject = async () => {
    let finalVideoUrl = videoUrl;
    if (sourceType === 'upload') {
      if (!uploadedFile) {
        toast.error('Please upload a video file');
        return;
      }
      try {
        toast.info('Uploading video to cloud...');
        finalVideoUrl = await uploadVideoToCloudinary(uploadedFile);
        toast.success('Video uploaded!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload video');
        return;
      }
    } else if (!finalVideoUrl) {
      toast.error('Please enter a video URL');
      return;
    }
    if (!title) {
      toast.error('Please enter a project title');
      return;
    }
    setIsCreating(true);
    try {
      const projectData: Record<string, unknown> = {
        action: 'create-project',
        title,
        language: selectedLanguage,
        videoUrl: finalVideoUrl,
        templateName: selectedTemplate,
        magicZooms,
        magicBrolls,
        removeSilencePace: removeSilence,
      };
      if (enableHookTitle && hookTitleText) {
        projectData.hookTitle = { text: hookTitleText, template: "tiktok", top: 45, size: 32 };
      } else if (enableHookTitle) {
        projectData.hookTitle = true;
      }
      const { data, error } = await supabase.functions.invoke('viral-shorts', { body: projectData });
      if (error) throw error;
      if (data?.id) {
        const newProject: Project = {
          id: data.id,
          title: data.title || title,
          status: data.status || 'processing',
          createdAt: data.createdAt || new Date().toISOString()
        };
        setProjects(prev => [newProject, ...prev]);
        setPollingId(data.id);
        toast.success('Project created! Processing your video...');
        setVideoUrl("");
        setTitle("");
        setHookTitleText("");
        setUploadedFile(null);
        setUploadProgress(0);
        setActiveStep(1);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const getTemplateStyle = (name: string) => {
    const styles: Record<string, { bg: string; text: string; font: string; shadow?: string }> = {
      'Laura': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-yellow-300', font: 'font-black', shadow: 'shadow-lg shadow-yellow-500/20' },
      'Kelly 2': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-semibold' },
      'Caleb': { bg: 'bg-gradient-to-br from-gray-700 to-gray-900', text: 'text-orange-400', font: 'font-bold' },
      'Kendrick': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-green-400', font: 'font-black' },
      'Lewis': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-orange-500', font: 'font-bold italic' },
      'Doug': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-orange-400', font: 'font-bold' },
      'CARLOS': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-bold uppercase tracking-wider' },
      'LUKE': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-yellow-400', font: 'font-bold italic uppercase' },
      'MARK': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-orange-500', font: 'font-black' },
      'Sara': { bg: 'bg-gradient-to-br from-gray-500 to-gray-600', text: 'text-white', font: 'font-semibold' },
      'Daniel': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-yellow-400', font: 'font-bold' },
      'Dan 2': { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', text: 'text-gray-900', font: 'font-bold' },
      'Hormozi 4': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-yellow-400', font: 'font-black italic uppercase', shadow: 'shadow-lg shadow-yellow-500/20' },
      'Dan': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-yellow-400', font: 'font-bold uppercase' },
      'Devin': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-semibold uppercase tracking-widest' },
      'Tayo': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-medium' },
      'Ella': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-yellow-300', font: 'font-bold uppercase' },
      'Tracy': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-white', font: 'font-semibold uppercase tracking-wide' },
      'Hormozi 1': { bg: 'bg-gradient-to-br from-blue-600 to-blue-700', text: 'text-white', font: 'font-black uppercase', shadow: 'shadow-lg shadow-blue-500/30' },
      'Hormozi 2': { bg: 'bg-gradient-to-br from-orange-500 to-red-600', text: 'text-white', font: 'font-black uppercase', shadow: 'shadow-lg shadow-orange-500/30' },
      'Hormozi 3': { bg: 'bg-gradient-to-br from-stone-400 to-stone-500', text: 'text-gray-800', font: 'font-black uppercase' },
      'Hormozi 5': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-semibold' },
      'William': { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-white', font: 'font-bold uppercase', shadow: 'shadow-lg shadow-green-500/30' },
      'Leon': { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', text: 'text-white', font: 'font-bold uppercase', shadow: 'shadow-lg shadow-orange-500/30' },
      'Ali': { bg: 'bg-gradient-to-br from-gray-200 to-gray-300', text: 'text-gray-900', font: 'font-bold' },
      'Beast': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-white', font: 'font-black italic uppercase' },
      'Maya': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-pink-400', font: 'font-semibold' },
      'Karl': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-bold uppercase' },
      'Iman': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-green-400', font: 'font-medium' },
      'David': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-white', font: 'font-bold uppercase' },
      'Noah': { bg: 'bg-gradient-to-br from-gray-700 to-gray-800', text: 'text-yellow-400', font: 'font-black italic uppercase' },
      'Gstaad': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-green-400', font: 'font-semibold' },
      'Nema': { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-orange-400', font: 'font-semibold' },
    };
    return styles[name] || { bg: 'bg-gradient-to-br from-gray-600 to-gray-700', text: 'text-white', font: 'font-medium' };
  };

  const filteredTemplates = templates.filter(template => {
    if (templateFilter === 'All') return true;
    if (templateFilter === 'New') return templateMeta[template]?.isNew;
    if (templateFilter === 'Premium') return templateMeta[template]?.isPremium;
    if (templateFilter === 'Trending') return templateMeta[template]?.isTrending;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'transcribing':
      case 'exporting': return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'failed': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'processing':
      case 'transcribing': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'exporting': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const steps = [
    { num: 1, title: 'Upload', icon: Upload },
    { num: 2, title: 'Style', icon: Palette },
    { num: 3, title: 'Effects', icon: Wand2 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            {/* Hero Header */}
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/10 to-transparent rounded-3xl blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl shadow-orange-500/25">
                      <Flame className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                      Viral Shorts
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      AI-powered captions & effects for viral content
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 px-3 py-1.5">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    30+ Caption Styles
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 px-3 py-1.5">
                    <Languages className="w-3.5 h-3.5 mr-1.5" />
                    13+ Languages
                  </Badge>
                </div>
              </div>
            </div>

            <Tabs defaultValue="create" className="space-y-8">
              <TabsList className="bg-gray-800/50 border border-gray-700/50 p-1 rounded-xl">
                <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg px-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg px-6">
                  <FileVideo className="w-4 h-4 mr-2" />
                  My Projects
                  {projects.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">{projects.length}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="animate-fade-in">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  {steps.map((step, idx) => (
                    <div key={step.num} className="flex items-center">
                      <button
                        onClick={() => setActiveStep(step.num)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
                          activeStep === step.num
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                            : activeStep > step.num
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                        <span className="font-semibold">{step.title}</span>
                      </button>
                      {idx < steps.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-gray-600 mx-2" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column - Upload & Settings */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Upload Section */}
                    <div className={`bg-gray-800/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${activeStep === 1 ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-gray-700/50'}`}>
                      <div className="p-6 border-b border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <Video className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Video Source</h3>
                              <p className="text-sm text-gray-400">Upload your video or paste a URL</p>
                            </div>
                          </div>
                          <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                              onClick={() => setSourceType('upload')}
                              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                sourceType === 'upload' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              onClick={() => setSourceType('url')}
                              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                sourceType === 'url' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              URL
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-4">
                          <Label className="text-gray-300">Project Title</Label>
                          <Input
                            placeholder="Enter a catchy title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-2 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20"
                          />
                        </div>

                        {sourceType === 'upload' ? (
                          uploadedFile ? (
                            <div className="border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 rounded-xl p-6 animate-scale-in">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <Video className="w-8 h-8 text-emerald-400" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white">{uploadedFile.name}</p>
                                    <p className="text-sm text-emerald-400">
                                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-white">
                                  <X className="w-5 h-5" />
                                </Button>
                              </div>
                              {isUploading && (
                                <div className="mt-4">
                                  <Progress value={uploadProgress} className="h-2 bg-gray-700" />
                                  <p className="text-sm text-emerald-400 mt-2">Uploading... {uploadProgress}%</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <label
                              ref={dropRef}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-300 ${
                                isDragging
                                  ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                                  : 'border-gray-600 hover:border-orange-500/50 hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl mb-4">
                                <Upload className="w-10 h-10 text-orange-400" />
                              </div>
                              <p className="text-lg font-semibold text-white mb-1">
                                {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
                              </p>
                              <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                MP4, MOV, AVI • Max 500MB
                              </Badge>
                              <input type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                            </label>
                          )
                        ) : (
                          <div>
                            <Label className="text-gray-300">Video URL</Label>
                            <Input
                              placeholder="https://youtube.com/watch?v=... or direct video link"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              className="mt-2 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Supports YouTube, Vimeo, Google Drive, and direct MP4 links</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Caption Style Section */}
                    <div className="bg-[#f5f5f5] rounded-2xl shadow-2xl overflow-hidden">
                      {/* Header Tabs - Matching Reference */}
                      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-5 py-3">
                        <div className="flex">
                          <button className="px-5 py-2.5 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg border border-gray-200">
                            Choose Style
                          </button>
                          <button className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg ml-2">
                            Edit Captions
                          </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings2 className="w-4 h-4" />
                          Customize {selectedTemplate}
                        </button>
                      </div>
                      
                      <div className="p-5 bg-[#f5f5f5]">
                        {/* Filter Tabs - Matching Reference */}
                        <div className="flex gap-4 mb-5">
                          {['All', 'Trend', 'New', 'Premium', 'Emoji', 'Speakers'].map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setTemplateFilter(filter === 'Trend' ? 'Trending' : filter)}
                              className={`text-sm font-medium transition-all ${
                                (filter === 'Trend' ? 'Trending' : filter) === templateFilter || (filter === 'All' && templateFilter === 'All')
                                  ? 'text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {filter}
                            </button>
                          ))}
                        </div>

                        {/* Template Grid - Premium Style Matching Reference */}
                        <ScrollArea className="h-[350px]">
                          <div className="grid grid-cols-3 gap-3 pr-3">
                            {filteredTemplates.map((template) => {
                              const isSelected = selectedTemplate === template;
                              const meta = templateMeta[template] || {};
                              const style = getTemplateStyle(template);

                              return (
                                <button
                                  key={template}
                                  onClick={() => { setSelectedTemplate(template); setActiveStep(3); }}
                                  className={`relative flex items-center justify-center h-14 rounded-lg transition-all duration-200 ${style.bg} ${
                                    isSelected
                                      ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#f5f5f5]'
                                      : 'hover:opacity-90'
                                  }`}
                                >
                                  {/* New Badge - Red pill like reference */}
                                  {meta.isNew && (
                                    <span className="absolute -top-1.5 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-semibold z-10">
                                      New
                                    </span>
                                  )}
                                  
                                  {/* Premium/Trending Badge - Yellow lightning */}
                                  {(meta.isPremium || meta.isTrending) && (
                                    <span className="absolute top-1/2 -translate-y-1/2 right-2.5 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 rounded p-1 shadow-sm">
                                      <Zap className="w-3 h-3 fill-current" />
                                    </span>
                                  )}
                                  
                                  {/* Template Name - Styled like reference */}
                                  <span className={`${style.text} ${style.font} text-sm tracking-wide`}>
                                    {template}
                                  </span>
                                  
                                  {/* Selection Indicator - Pencil icon like reference */}
                                  {isSelected && (
                                    <span className="absolute top-1.5 left-1.5 bg-white/20 rounded p-0.5">
                                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Settings & Create */}
                  <div className="space-y-6">
                    {/* Language */}
                    <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Languages className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Language</h3>
                      </div>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-gray-700">
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* AI Features */}
                    <div className={`bg-gray-800/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${activeStep === 3 ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-gray-700/50'} p-6`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                          <Wand2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">AI Magic</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Magic Zooms</p>
                              <p className="text-xs text-gray-500">Auto zoom on key moments</p>
                            </div>
                          </div>
                          <Switch checked={magicZooms} onCheckedChange={setMagicZooms} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Magic B-Rolls</p>
                              <p className="text-xs text-gray-500">AI stock footage</p>
                            </div>
                          </div>
                          <Switch checked={magicBrolls} onCheckedChange={setMagicBrolls} />
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <Scissors className="w-5 h-5 text-red-400" />
                            <p className="text-sm font-medium text-white">Silence Removal</p>
                          </div>
                          <Select value={removeSilence} onValueChange={setRemoveSilence}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="natural" className="text-white">Natural</SelectItem>
                              <SelectItem value="fast" className="text-white">Fast</SelectItem>
                              <SelectItem value="extra-fast" className="text-white">Extra Fast</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Hook Title */}
                    <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Type className="w-5 h-5 text-cyan-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">Hook Title</h3>
                        </div>
                        <Switch checked={enableHookTitle} onCheckedChange={setEnableHookTitle} />
                      </div>
                      {enableHookTitle && (
                        <div className="animate-fade-in">
                          <Input
                            placeholder="Stop scrolling — watch this!"
                            value={hookTitleText}
                            onChange={(e) => setHookTitleText(e.target.value)}
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-2">Leave empty for AI-generated hook</p>
                        </div>
                      )}
                    </div>

                    {/* Create Button */}
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/40"
                      onClick={handleCreateProject}
                      disabled={isCreating || isUploading || (!videoUrl && !uploadedFile) || !title}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5 mr-2" />
                          Create Viral Short
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="animate-fade-in">
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                    <div className="p-6 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-3xl mb-6">
                      <Flame className="w-16 h-16 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
                    <p className="text-gray-400 mb-6">Create your first viral short to get started</p>
                    <Button 
                      className="bg-gradient-to-r from-orange-500 to-red-600"
                      onClick={() => document.querySelector<HTMLButtonElement>('[value="create"]')?.click()}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create New Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="flex items-center justify-between p-5 bg-gray-800/40 backdrop-blur-xl rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-900/50 rounded-xl">
                            {getStatusIcon(project.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{project.title}</h3>
                            <p className="text-sm text-gray-400">
                              Created {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(project.status)} border`}>
                            {project.status}
                          </Badge>
                          {project.status === 'completed' && (
                            <div className="flex gap-2">
                              {project.downloadUrl && (
                                <Button size="sm" className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" asChild>
                                  <a href={project.downloadUrl} download>
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </a>
                                </Button>
                              )}
                              {project.previewUrl && (
                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600" asChild>
                                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                                    <Play className="w-4 h-4 mr-1" />
                                    Watch
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                          {(project.status === 'processing' || project.status === 'transcribing') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-gray-700"
                              onClick={() => checkProjectStatus(project.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViralShorts;
