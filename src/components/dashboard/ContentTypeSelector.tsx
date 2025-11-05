import { Sparkles, Image, Video, Music, FileText, Code, MoreHorizontal } from 'lucide-react';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ContentTypeSelector = ({ selectedType, onTypeChange }: ContentTypeSelectorProps) => {
  const contentTypes = [
    { icon: <Sparkles size={18} />, label: 'Content', color: 'text-brand-yellow' },
    { icon: <Image size={18} />, label: 'Image', color: 'text-brand-green' },
    { icon: <Video size={18} />, label: 'Video', color: 'text-brand-red' },
    { icon: <Music size={18} />, label: 'Audio', color: 'text-brand-blue' },
    { icon: <FileText size={18} />, label: 'Document', color: 'text-brand-green' },
    { icon: <Code size={18} />, label: 'Code', color: 'text-brand-purple' },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-6 lg:mb-8">
      <div className="flex items-center justify-center gap-2 lg:gap-3 flex-wrap lg:flex-nowrap overflow-x-auto pb-2 scrollbar-hide">
        {contentTypes.map((type, idx) => (
          <button
            key={idx}
            onClick={() => onTypeChange(type.label)}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full transition whitespace-nowrap shrink-0 border ${
              selectedType === type.label
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-muted-foreground'
            }`}
          >
            <span className={selectedType === type.label ? 'text-background' : type.color}>
              {type.icon}
            </span>
            <span className="text-xs lg:text-sm font-medium">{type.label}</span>
          </button>
        ))}
        <button className="p-2 lg:p-2.5 text-muted-foreground hover:text-foreground shrink-0">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
