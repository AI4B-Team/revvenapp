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
      <div className="bg-primary rounded-lg p-2 flex items-center gap-2">
        {contentTypes.map((type, idx) => (
          <button
            key={idx}
            onClick={() => onTypeChange(type.label)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition ${
              selectedType === type.label
                ? 'bg-sidebar text-sidebar-text'
                : 'text-muted-foreground hover:text-sidebar-text hover:bg-sidebar'
            }`}
          >
            <span className={type.color}>{type.icon}</span>
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
        <button className="ml-auto text-muted-foreground hover:text-sidebar-text p-2">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
