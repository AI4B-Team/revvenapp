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
    <div className="max-w-5xl mx-auto mb-6 lg:mb-8">
      <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {contentTypes.map((type, idx) => (
          <button
            key={idx}
            onClick={() => onTypeChange(type.label)}
            className={`px-3 lg:px-5 py-2 lg:py-3 rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
              selectedType === type.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <span className={selectedType === type.label ? '' : type.color}>{type.icon}</span>
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
        <button className="px-3 lg:px-5 py-2 lg:py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition shrink-0">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
