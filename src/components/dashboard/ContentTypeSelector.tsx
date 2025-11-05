import { Sparkles, Image, Video, Music, FileText, Code, MoreHorizontal } from 'lucide-react';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ContentTypeSelector = ({ selectedType, onTypeChange }: ContentTypeSelectorProps) => {
  const contentTypes = [
    { icon: <Sparkles size={16} />, label: 'Content', color: 'text-brand-yellow' },
    { icon: <Image size={16} />, label: 'Image', color: 'text-brand-green' },
    { icon: <Video size={16} />, label: 'Video', color: 'text-brand-red' },
    { icon: <Music size={16} />, label: 'Sound', color: 'text-brand-blue' },
    { icon: <FileText size={16} />, label: 'Document', color: 'text-brand-green' },
    { icon: <Code size={16} />, label: 'Code', color: 'text-brand-purple' },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-center gap-3">
        {contentTypes.map((type, idx) => (
          <button
            key={idx}
            onClick={() => onTypeChange(type.label)}
            className={`p-3 rounded-xl transition ${
              selectedType === type.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <span className={selectedType === type.label ? '' : type.color}>{type.icon}</span>
          </button>
        ))}
        <button className="p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
