import { Search, Plus, Settings, Zap, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const WorkspacePanel = () => {
  const projects = [
    { id: 1, title: 'Revven 2.0', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', updatedAt: '8 hours ago' },
    { id: 2, title: 'Revven 2.0', image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop', updatedAt: '9 hours ago' },
    { id: 3, title: 'Untitled', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop', updatedAt: '2 days ago' },
    { id: 4, title: 'Untitled', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop', updatedAt: '3 days ago' },
  ];

  return (
    <div className="flex-1 p-6 bg-background overflow-auto">
      {/* Trial Banner */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Start Your 14-Day Free Trial Of Our PRO Plan!</p>
            <p className="text-xs text-muted-foreground">Unlock unlimited projects, custom domains, and more.</p>
          </div>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          Start Trial
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Workspace</h1>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Zap size={14} />
            Upgrade
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Settings size={18} />
        </Button>
      </div>

      {/* Search and Create */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 bg-muted/50 border-border"
          />
        </div>
        <Button className="gap-1.5 bg-primary hover:bg-primary/90">
          <Plus size={16} />
          Create project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="relative aspect-video bg-muted">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                <MoreVertical size={14} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
              <p className="text-xs text-muted-foreground">Updated {project.updatedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspacePanel;
