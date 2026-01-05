import { HelpCircle, BookOpen, MessageCircle, Video, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HelpDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <HelpCircle size={18} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 border-b border-border">
          <h4 className="font-medium text-sm">Help & Support</h4>
        </div>
        <DropdownMenuItem className="cursor-pointer">
          <BookOpen size={16} className="mr-2" />
          Documentation
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Video size={16} className="mr-2" />
          Video Tutorials
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <FileText size={16} className="mr-2" />
          FAQ
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <MessageCircle size={16} className="mr-2" />
          Contact Support
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HelpDropdown;
