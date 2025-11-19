import { Image, Video, Music, FileText, Code, Palette, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ContentTypeSelector = ({ selectedType, onTypeChange }: ContentTypeSelectorProps) => {
  const contentTypes = [
    { icon: Image, label: 'Image' },
    { icon: Video, label: 'Video' },
    { icon: Music, label: 'Audio' },
    { icon: Palette, label: 'Design' },
    { icon: FileText, label: 'Content' },
    { icon: Code, label: 'Apps' },
  ];

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="flex items-center justify-center gap-2">
        {contentTypes.map((type) => (
          <Button
            key={type.label}
            onClick={() => onTypeChange(type.label)}
            variant="ghost"
            className={`px-6 py-3 rounded-xl transition-colors ${
              selectedType === type.label
                ? 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <type.icon className="w-4 h-4 mr-2" />
            {type.label}
          </Button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="px-6 py-3 rounded-xl bg-card text-muted-foreground hover:bg-muted"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-background border-border z-50">
            <DropdownMenuItem className="cursor-pointer">
              <FileText size={16} className="mr-2" />
              <span>Document</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
