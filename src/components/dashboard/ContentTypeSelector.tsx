import { Image, Video, Music, FileText, Code, Palette, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ContentTypeSelector = ({ selectedType, onTypeChange }: ContentTypeSelectorProps) => {
  const contentTypes = [
    { icon: <Image size={18} />, label: 'Image', color: 'text-brand-blue' },
    { icon: <Video size={18} />, label: 'Video', color: 'text-brand-yellow' },
    { icon: <Music size={18} />, label: 'Audio', color: 'text-brand-green' },
    { icon: <Palette size={18} />, label: 'Design', color: 'text-brand-red' },
    { icon: <FileText size={18} />, label: 'Content', color: 'text-brand-green' },
    { icon: <Code size={18} />, label: 'Apps', color: 'text-brand-blue' },
  ];

  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="flex items-center justify-center gap-3">
        {contentTypes.map((type, idx) => (
          <button
            key={idx}
            onClick={() => onTypeChange(type.label)}
            className={`px-5 py-3 rounded-xl transition flex items-center gap-2 ${
              selectedType === type.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <span className={selectedType === type.label ? '' : type.color}>{type.icon}</span>
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button className="px-5 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition flex items-center gap-2">
              <FileText size={18} />
              <span className="text-sm font-medium">Document</span>
              <ChevronDown size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-background border-border z-50">
            <div className="space-y-1">
              <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                Upload Document
              </button>
              <button className="w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition">
                Recent Documents
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
