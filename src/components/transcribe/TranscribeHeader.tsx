import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, ChevronDown, Check, Eye, MessageSquare, Settings,
  Download, MoreVertical, Loader2, Wand2, Video, UserCircle, FileEdit, BookOpen
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

interface TranscribeHeaderProps {
  onDownloadClick?: () => void;
  onCreateClick?: (type: 'video' | 'ugc' | 'post' | 'ebook') => void;
}

const TranscribeHeader = ({ 
  onDownloadClick,
  onCreateClick,
}: TranscribeHeaderProps) => {
  const navigate = useNavigate();
  const [currentViewMode, setCurrentViewMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');
  const [lastAutoSaved, setLastAutoSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastAutoSaved(new Date());
    setIsSaving(false);
    toast.success('Project saved');
  };

  const handleCreate = (type: 'video' | 'ugc' | 'post' | 'ebook') => {
    if (onCreateClick) {
      onCreateClick(type);
    } else {
      navigate('/create');
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between px-4 py-2.5 bg-sidebar border-b border-gray-700 flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">Transcribe</span>
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
          {/* Create button with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-semibold transition-colors">
                <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden md:inline">Create</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 z-50">
              <DropdownMenuItem onClick={() => handleCreate('video')} className="flex items-center gap-2 cursor-pointer">
                <Video className="w-4 h-4" />
                Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('ugc')} className="flex items-center gap-2 cursor-pointer">
                <UserCircle className="w-4 h-4" />
                UGC
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('post')} className="flex items-center gap-2 cursor-pointer">
                <FileEdit className="w-4 h-4" />
                Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('ebook')} className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4" />
                Ebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Download button */}
          <button 
            onClick={onDownloadClick}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white font-semibold transition-colors border border-gray-500"
          >
            <Download className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden md:inline">Download</span>
          </button>
          
          {/* 3-dot menu */}
          <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0">
                <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 z-50">
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

export default TranscribeHeader;
