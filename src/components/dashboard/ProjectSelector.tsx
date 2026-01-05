import { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  FolderKanban,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Project {
  id: string;
  name: string;
  color: string;
  isFavorite: boolean;
  lastEdited: string;
}

interface ProjectSelectorProps {
  isCollapsed?: boolean;
}

const ProjectSelector = ({ isCollapsed = false }: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProjects = filteredProjects.filter(p => p.isFavorite);
  const otherProjects = filteredProjects.filter(p => !p.isFavorite);

  const toggleFavorite = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center p-2 hover:bg-sidebar-hover rounded-lg transition"
        title={selectedProject.name}
      >
        <FolderKanban size={20} className="text-sidebar-muted" />
      </button>
    );
  }

  return (
    <div className="px-4 mb-4 relative flex-shrink-0" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-sidebar-hover/50 border border-border rounded-lg hover:bg-sidebar-hover transition group"
      >
        {selectedProject ? (
          <>
            <div className={`w-8 h-8 ${selectedProject.color} rounded-lg flex items-center justify-center`}>
              <FolderKanban size={16} className="text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs text-sidebar-muted">Project</p>
              <p className="text-sm font-medium text-sidebar-text truncate">{selectedProject.name}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 bg-sidebar-muted/30 rounded-lg flex items-center justify-center">
              <FolderKanban size={16} className="text-sidebar-muted" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-sidebar-text">Projects</span>
          </>
        )}
        <ChevronDown 
          size={16} 
          className={`text-sidebar-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
    
      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Search Header */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search Projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          
          <div className="max-h-[280px] overflow-y-auto">
            {/* Favorites Section */}
            {favoriteProjects.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Favorites
                </p>
                {favoriteProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onSelect={selectProject}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* All Projects Section */}
            {otherProjects.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {favoriteProjects.length > 0 ? 'Other Projects' : 'All Projects'}
                </p>
                {otherProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onSelect={selectProject}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="p-6 text-center">
                <FolderKanban size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No projects found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Create New Project */}
          <div className="p-2 border-t border-border bg-muted/30">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition text-foreground group">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: (project: Project) => void;
  onToggleFavorite: (projectId: string, e: React.MouseEvent) => void;
}

const ProjectItem = ({ project, isSelected, onSelect, onToggleFavorite }: ProjectItemProps) => {
  return (
    <div
      onClick={() => onSelect(project)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition cursor-pointer group ${
        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      <div className={`w-8 h-8 ${project.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <FolderKanban size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground">{project.lastEdited}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onToggleFavorite(project.id, e)}
          className="p-1.5 rounded-md hover:bg-muted transition"
          title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {project.isFavorite ? (
            <Star size={14} className="text-brand-yellow fill-brand-yellow" />
          ) : (
            <StarOff size={14} className="text-muted-foreground" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-muted transition"
            >
              <MoreVertical size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuItem>
              <Edit size={14} className="mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderKanban size={14} className="mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isSelected && (
        <Check size={16} className="text-brand-green flex-shrink-0" />
      )}
    </div>
  );
};

export default ProjectSelector;
