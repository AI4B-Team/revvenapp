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
      accentBorder: 'border-brand-blue/70',
      accentHover: 'hover:bg-brand-blue/10',
      accentHoverBorder: 'hover:border-brand-blue/50',
    },
    {
      icon: Video,
      label: t('content.video'),
      key: 'Video',
      accentText: 'text-brand-red',
      accentBg: 'bg-brand-red/15',
      accentBorder: 'border-brand-red/70',
      accentHover: 'hover:bg-brand-red/10',
      accentHoverBorder: 'hover:border-brand-red/50',
    },
    {
      icon: Music,
      label: t('content.audio'),
      key: 'Audio',
      accentText: 'text-brand-green',
      accentBg: 'bg-brand-green/15',
      accentBorder: 'border-brand-green/70',
      accentHover: 'hover:bg-brand-green/10',
      accentHoverBorder: 'hover:border-brand-green/50',
    },
    {
      icon: Palette,
      label: t('content.design'),
      key: 'Design',
      accentText: 'text-brand-yellow',
      accentBg: 'bg-brand-yellow/15',
      accentBorder: 'border-brand-yellow/70',
      accentHover: 'hover:bg-brand-yellow/10',
      accentHoverBorder: 'hover:border-brand-yellow/50',
    },
    {
      icon: Calendar,
      label: t('content.content'),
      key: 'Content',
      accentText: 'text-brand-purple',
      accentBg: 'bg-brand-purple/15',
      accentBorder: 'border-brand-purple/70',
      accentHover: 'hover:bg-brand-purple/10',
      accentHoverBorder: 'hover:border-brand-purple/50',
    },
    {
      icon: FileText,
      label: t('content.document'),
      key: 'Document',
      accentText: 'text-brand-blue',
      accentBg: 'bg-brand-blue/15',
      accentBorder: 'border-brand-blue/70',
      accentHover: 'hover:bg-brand-blue/10',
      accentHoverBorder: 'hover:border-brand-blue/50',
    },
    {
      icon: Code,
      label: t('content.apps'),
      key: 'Apps',
      accentText: 'text-brand-red',
      accentBg: 'bg-brand-red/15',
      accentBorder: 'border-brand-red/70',
      accentHover: 'hover:bg-brand-red/10',
      accentHoverBorder: 'hover:border-brand-red/50',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto mb-4 md:mb-8">
      <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {contentTypes.map((type) => {
          const isSelected = selectedType === type.key;

          return (
            <button
              key={type.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTypeChange(type.key)}
              className={cn(
                'px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl transition-colors flex items-center gap-1.5 md:gap-2 border text-xs md:text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background whitespace-nowrap flex-shrink-0',
                isSelected
                  ? cn(type.accentBg, type.accentBorder)
                  : cn('bg-white dark:bg-card border-slate-400 dark:border-border', type.accentHover, type.accentHoverBorder)
              )}
            >
              <type.icon size={16} className={cn(type.accentText, "md:w-[18px] md:h-[18px]")} />
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.key}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentTypeSelector;

