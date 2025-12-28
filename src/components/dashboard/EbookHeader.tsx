import { useState } from 'react';
import { 
  Pencil, ChevronDown, Check, Eye, MessageSquare, Settings,
  UserPlus, Download, MoreVertical, Loader2, Wand2, Video, UserCircle, FileEdit, BookOpen,
  Image, Film, Volume2, Book
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from 'sonner';

interface EbookHeaderProps {
  onExportClick?: () => void;
  onPublishClick?: () => void;
}

const EbookHeader = ({ 
  onExportClick,
  onPublishClick,
}: EbookHeaderProps) => {
  const [currentViewMode, setCurrentViewMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  // Collaborator avatars (demo)
  const collaborators = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
  ];

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastAutoSaved(new Date());
    setIsSaving(false);
    toast.success('Project saved');
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between px-4 py-2.5 bg-sidebar border-b border-gray-700 flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Ebook Studio Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Book className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-white">EBOOK</span>
              <span className="text-emerald-400">STUDIO</span>
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
                  <span className="text-xs text-gray-500">View Only Access</span>
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
                  <span className="text-xs text-gray-500">View And Comment</span>
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
                  <span className="text-xs text-gray-500">Full Control And Settings</span>
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

        {/* Spacer */}
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
          
          {/* Publish button */}
          <button 
            onClick={onPublishClick || (() => toast.success('Publish coming soon'))}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            <span className="hidden md:inline">Publish</span>
          </button>

          {/* Export button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-transparent hover:bg-slate-700/50 rounded-lg text-sm text-white font-semibold transition-colors border border-slate-400">
                <Download className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden md:inline">Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 z-50">
              <DropdownMenuItem onClick={onExportClick} className="flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportClick} className="flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" />
                EPUB
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportClick} className="flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" />
                DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 3-dot menu */}
          <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0">
                <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookHeader;