import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { 
  Search, Plus, Settings, Zap, Trash2, MoreVertical, Loader2, Pencil,
  Sparkles, Play, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import aivaAvatar from '@/assets/aiva-avatar.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  updated_at: string;
  thumbnail_url: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showTutorialSection, setShowTutorialSection] = useState(() => {
    // Reset to visible for now
    localStorage.removeItem('dashboard-tutorial-visible');
    return true;
  });

  const dismissTutorialSection = () => {
    setShowTutorialSection(false);
    localStorage.setItem('dashboard-tutorial-visible', 'false');
  };

  const tutorials = [
    {
      id: 'overview',
      title: 'Watch This 3 Minute Overview',
      description: 'Get started by watching this video.',
      thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'aiva',
      title: 'AIVA Tutorial',
      description: 'Get started with your AI assistant and learn how to maximize productivity.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'workspace',
      title: 'Workspace Tutorial',
      description: 'Learn how to organize and manage your workspaces effectively.',
      thumbnail: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'branding',
      title: 'Brand Tutorial',
      description: 'Master the art of customizing your platform branding and visual identity.',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'apps',
      title: 'Apps Tutorial',
      description: 'Learn how to use and install AI-powered apps from the marketplace.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'community',
      title: 'Community Tutorial',
      description: 'Discover how to engage with the community and share your creations.',
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'whitelabel',
      title: 'White-Label Tutorial',
      description: 'Learn how to resell and customize apps with your own branding.',
      thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  ];

  const nextTutorial = () => {
    setCurrentTutorialIndex((prev) => (prev + 1) % (tutorials.length - 1));
  };

  const prevTutorial = () => {
    setCurrentTutorialIndex((prev) => (prev - 1 + tutorials.length - 1) % (tutorials.length - 1));
  };

  // Plain gray color for project cards
  const projectBgColor = 'bg-gray-300';

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  // Get user profile
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }
      }
    };
    getProfile();
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Updated just now';
    if (diffHours < 24) return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `Updated on ${date.toLocaleDateString()}`;
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectToDelete.id);

    if (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    } else {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      toast.success('Project deleted');
    }

    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const openRenameDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToRename(project);
    setRenameValue(project.name);
    setRenameDialogOpen(true);
  };

  const handleRenameProject = async () => {
    if (!projectToRename) return;

    const newName = renameValue.trim() || 'Untitled';
    setIsRenaming(true);

    const { error } = await supabase
      .from('projects')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', projectToRename.id);

    if (error) {
      toast.error('Failed to rename project');
      console.error('Error renaming project:', error);
    } else {
      setProjects(prev => prev.map(p => 
        p.id === projectToRename.id ? { ...p, name: newName, updated_at: new Date().toISOString() } : p
      ));
      toast.success('Project renamed');
    }

    setIsRenaming(false);
    setRenameDialogOpen(false);
    setProjectToRename(null);
  };

  const handleCreateProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to create a project');
      return;
    }

    setIsCreating(true);
    const projectName = newProjectName.trim() || 'Untitled';

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create project');
      console.error('Error creating project:', error);
      setIsCreating(false);
      return;
    }

    // Generate AI thumbnail in the background
    supabase.functions.invoke('generate-project-thumbnail', {
      body: { projectId: data.id, projectName }
    }).then(({ data: thumbData, error: thumbError }) => {
      if (thumbError) {
        console.error('Thumbnail generation error:', thumbError);
      } else if (thumbData?.thumbnailUrl) {
        // Update local state with new thumbnail
        setProjects(prev => prev.map(p => 
          p.id === data.id ? { ...p, thumbnail_url: thumbData.thumbnailUrl } : p
        ));
      }
    });

    toast.success('Project created');
    setCreateDialogOpen(false);
    setNewProjectName('');
    setIsCreating(false);
    navigate('/create', { state: { projectId: data.id, newProject: true } });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {identitySidebarOpen && (
        <AIPersonaSidebar 
          isOpen={identitySidebarOpen}
          onClose={() => setIdentitySidebarOpen(false)}
        />
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 lg:p-8">
            
            {/* Trial Banner */}
            <div className="bg-white rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Start Your 14-Day Free Trial Of Our PRO Plan!</h3>
                  <p className="text-muted-foreground text-sm">Access AI video creation, automated content, lead generation, and 50+ powerful business tools.</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                Start Trial
              </button>
            </div>

            {/* Meet AIVA + Tutorials Carousel */}
            {showTutorialSection && (
              <div className="bg-card rounded-2xl border border-border p-6 relative">
                {/* Close Button */}
                <button
                  onClick={dismissTutorialSection}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors z-10"
                  aria-label="Dismiss section"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>

                <div className="flex items-stretch gap-6">
                  {/* Meet AIVA Card */}
                  <div className="bg-card rounded-2xl shadow-sm p-6 border border-border flex-shrink-0 w-80">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Meet AIVA</h3>
                        <p className="text-muted-foreground text-sm">
                          Got questions? AIVA knows the platform inside and out.
                        </p>
                      </div>
                    </div>

                    {/* Avatar with soft green background */}
                    <div className="relative flex items-center justify-center py-4 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-36 h-36 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-80"></div>
                      </div>
                      <img 
                        src={aivaAvatar}
                        alt="AIVA Assistant"
                        className="relative z-10 w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>

                    <button 
                      onClick={() => navigate('/assistant')}
                      className="w-full bg-card hover:bg-secondary text-brand-green border border-brand-green py-2.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Chat With AIVA
                      <span className="text-lg">→</span>
                    </button>
                  </div>

                  {/* Tutorial Carousel */}
                  <div className="flex-1 flex items-center gap-4">
                    {/* Previous Arrow */}
                    <button 
                      onClick={prevTutorial}
                      className="w-10 h-10 rounded-full border border-border bg-card hover:bg-secondary flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-muted-foreground" />
                    </button>

                    {/* Tutorial Cards */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                      {[0, 1].map((offset) => {
                        const index = (currentTutorialIndex + offset) % tutorials.length;
                        const tutorial = tutorials[index];
                        return (
                          <div key={tutorial.id} className="bg-card rounded-2xl shadow-sm p-6 border border-border">
                            <h3 className="text-lg font-bold text-foreground mb-2">
                              {tutorial.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">
                              {tutorial.description}
                            </p>

                            {/* Video Thumbnail */}
                            <div 
                              onClick={() => setIsVideoModalOpen(true)}
                              className="relative aspect-video rounded-xl overflow-hidden bg-secondary group cursor-pointer"
                            >
                              <img
                                src={tutorial.thumbnail}
                                alt={tutorial.title}
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="w-14 h-14 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center transition-all transform group-hover:scale-110">
                                  <Play size={24} className="text-brand-green ml-1" fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Next Arrow */}
                    <button 
                      onClick={nextTutorial}
                      className="w-10 h-10 rounded-full border border-border bg-card hover:bg-secondary flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="REVVEN Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

      <DigitalCharactersModal
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Awesome Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleCreateProject();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-project">Project Name</Label>
              <Input
                id="rename-project"
                placeholder="Project name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isRenaming) {
                    handleRenameProject();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameProject} disabled={isRenaming}>
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;