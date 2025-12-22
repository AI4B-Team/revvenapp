import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2
} from "lucide-react";

interface Template {
  name: string;
}

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
  
  const [templates, setTemplates] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pollingId, setPollingId] = useState<string | null>(null);

  // Fetch templates and languages on mount
  useEffect(() => {
    fetchTemplates();
    fetchLanguages();
  }, []);

  // Poll for project status
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
      // Use fallback templates
      setTemplates([
        "Sara", "Daniel", "Dan 2", "Hormozi 4", "Dan", "Devin", "Tayo", "Ella",
        "Tracy", "Luke", "Hormozi 1", "Hormozi 2", "Hormozi 3", "Hormozi 5",
        "Leila", "Jason", "William", "Leon", "Ali", "Beast", "Maya", "Karl",
        "Iman", "Umi", "David", "Noah", "Gstaad", "Malta", "Nema", "seth"
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
      // Use fallback languages
      setLanguages([
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "French", code: "fr" },
        { name: "German", code: "de" },
        { name: "Italian", code: "it" },
        { name: "Portuguese", code: "pt" },
        { name: "Dutch", code: "nl" },
        { name: "Russian", code: "ru" },
        { name: "Chinese (Simplified)", code: "zh" },
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

      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...data } : p
      ));

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

  const handleCreateProject = async () => {
    if (!videoUrl) {
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
        videoUrl,
        templateName: selectedTemplate,
        magicZooms,
        magicBrolls,
        removeSilencePace: removeSilence,
      };

      if (enableHookTitle && hookTitleText) {
        projectData.hookTitle = {
          text: hookTitleText,
          template: "tiktok",
          top: 45,
          size: 32
        };
      } else if (enableHookTitle) {
        projectData.hookTitle = true;
      }

      const { data, error } = await supabase.functions.invoke('viral-shorts', {
        body: projectData
      });

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
        
        // Clear form
        setVideoUrl("");
        setTitle("");
        setHookTitleText("");
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('viral-shorts', {
        body: { action: 'export-project', projectId }
      });

      if (error) throw error;
      toast.success('Export started!');
      setPollingId(projectId);
    } catch (error: any) {
      console.error('Error exporting project:', error);
      toast.error(error.message || 'Failed to export project');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'transcribing':
      case 'exporting':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'transcribing':
        return 'bg-blue-100 text-blue-800';
      case 'exporting':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Viral Shorts</h1>
                <p className="text-gray-600">Create viral short-form videos with AI-powered captions and effects</p>
              </div>
            </div>

            <Tabs defaultValue="create" className="space-y-6">
              <TabsList>
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="projects">My Projects ({projects.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Video Source
                      </CardTitle>
                      <CardDescription>
                        Enter a public video URL (MP4, YouTube, Google Drive)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          placeholder="My Viral Short"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input
                          id="videoUrl"
                          placeholder="https://example.com/video.mp4"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template & Language */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Style & Language
                      </CardTitle>
                      <CardDescription>
                        Choose a caption template and transcription language
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Caption Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template} value={template}>
                                {template}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5" />
                        AI Magic Features
                      </CardTitle>
                      <CardDescription>
                        Enable AI-powered enhancements for your video
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <div>
                            <Label>Magic Zooms</Label>
                            <p className="text-xs text-gray-500">Auto zoom effects on key moments</p>
                          </div>
                        </div>
                        <Switch checked={magicZooms} onCheckedChange={setMagicZooms} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-purple-500" />
                          <div>
                            <Label>Magic B-Rolls</Label>
                            <p className="text-xs text-gray-500">Auto-insert relevant stock footage</p>
                          </div>
                        </div>
                        <Switch checked={magicBrolls} onCheckedChange={setMagicBrolls} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-red-500" />
                          <Label>Remove Silence</Label>
                        </div>
                        <Select value={removeSilence} onValueChange={setRemoveSilence}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="natural">Natural</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="extra-fast">Extra Fast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hook Title */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Type className="w-5 h-5" />
                        Hook Title
                      </CardTitle>
                      <CardDescription>
                        Add an attention-grabbing animated opening caption
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Enable Hook Title</Label>
                        <Switch checked={enableHookTitle} onCheckedChange={setEnableHookTitle} />
                      </div>
                      {enableHookTitle && (
                        <div className="space-y-2">
                          <Label htmlFor="hookText">Custom Hook Text (optional)</Label>
                          <Input
                            id="hookText"
                            placeholder="Stop scrolling — watch this in 30 seconds"
                            value={hookTitleText}
                            onChange={(e) => setHookTitleText(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">Leave empty for AI-generated hook</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Create Button */}
                <div className="mt-6">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    onClick={handleCreateProject}
                    disabled={isCreating || !videoUrl || !title}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Flame className="w-5 h-5 mr-2" />
                        Create Viral Short
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="projects">
                {projects.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Flame className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
                      <p className="text-gray-500 mb-4">Create your first viral short to get started</p>
                      <Button onClick={() => document.querySelector('[value="create"]')?.dispatchEvent(new Event('click'))}>
                        Create New Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(project.status)}
                            <div>
                              <h3 className="font-semibold">{project.title}</h3>
                              <p className="text-sm text-gray-500">
                                Created {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            {project.status === 'completed' && (
                              <div className="flex gap-2">
                                {project.downloadUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={project.downloadUrl} download>
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </a>
                                  </Button>
                                )}
                                {project.previewUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Preview
                                    </a>
                                  </Button>
                                )}
                              </div>
                            )}
                            {(project.status === 'processing' || project.status === 'transcribing') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => checkProjectStatus(project.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
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
