import { Image, Video, Music, FileText, Code, Palette, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ContentTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

type ContentTypeConfig = {
  key: string;
  label: string;
  icon: LucideIcon;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentHover: string;
  accentHoverBorder: string;
};

const ContentTypeSelector = ({ selectedType, onTypeChange }: ContentTypeSelectorProps) => {
  const { t } = useTranslation();

  const contentTypes: ContentTypeConfig[] = [
    {
      icon: Image,
      label: t('content.image'),
      key: 'Image',
      accentText: 'text-brand-blue',
      accentBg: 'bg-brand-blue/15',
      accentBorder: 'border-brand-blue/25',
      accentHover: 'hover:bg-brand-blue/15',
      accentHoverBorder: 'hover:border-brand-blue/25',
    },
    {
      icon: Video,
      label: t('content.video'),
      key: 'Video',
      accentText: 'text-brand-red',
      accentBg: 'bg-brand-red/15',
      accentBorder: 'border-brand-red/25',
      accentHover: 'hover:bg-brand-red/15',
      accentHoverBorder: 'hover:border-brand-red/25',
    },
    {
      icon: Music,
      label: t('content.audio'),
      key: 'Audio',
      accentText: 'text-brand-green',
      accentBg: 'bg-brand-green/15',
      accentBorder: 'border-brand-green/25',
      accentHover: 'hover:bg-brand-green/15',
      accentHoverBorder: 'hover:border-brand-green/25',
    },
    {
      icon: Palette,
      label: t('content.design'),
      key: 'Design',
      accentText: 'text-brand-yellow',
      accentBg: 'bg-brand-yellow/15',
      accentBorder: 'border-brand-yellow/25',
      accentHover: 'hover:bg-brand-yellow/15',
      accentHoverBorder: 'hover:border-brand-yellow/25',
    },
    {
      icon: Calendar,
      label: t('content.content'),
      key: 'Content',
      accentText: 'text-brand-purple',
      accentBg: 'bg-brand-purple/15',
      accentBorder: 'border-brand-purple/25',
      accentHover: 'hover:bg-brand-purple/15',
      accentHoverBorder: 'hover:border-brand-purple/25',
    },
    {
      icon: FileText,
      label: t('content.document'),
      key: 'Document',
      accentText: 'text-brand-blue',
      accentBg: 'bg-brand-blue/15',
      accentBorder: 'border-brand-blue/25',
      accentHover: 'hover:bg-brand-blue/15',
      accentHoverBorder: 'hover:border-brand-blue/25',
    },
    {
      icon: Code,
      label: t('content.apps'),
      key: 'Apps',
      accentText: 'text-brand-red',
      accentBg: 'bg-brand-red/15',
      accentBorder: 'border-brand-red/25',
      accentHover: 'hover:bg-brand-red/15',
      accentHoverBorder: 'hover:border-brand-red/25',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="flex items-center justify-center gap-3">
        {contentTypes.map((type) => {
          const isSelected = selectedType === type.key;

          return (
            <button
              key={type.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTypeChange(type.key)}
              className={cn(
                'px-5 py-3 rounded-xl transition-colors flex items-center gap-2 border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                type.accentText,
                isSelected
                  ? cn(type.accentBg, type.accentBorder)
                  : cn('bg-secondary border-transparent', type.accentHover, type.accentHoverBorder)
              )}
            >
              <type.icon size={18} className={type.accentText} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentTypeSelector;

