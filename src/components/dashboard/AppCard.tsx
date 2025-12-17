import { Video, Image, Mic, Palette, FileText, Wrench, User } from 'lucide-react';

interface AppCardProps {
  name: string;
  category: string;
  thumbnail: string;
  timestamp?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Video Tools': <Video size={12} />,
  'Image Tools': <Image size={12} />,
  'Audio Tools': <Mic size={12} />,
  'Design Tools': <Palette size={12} />,
  'Content Tools': <FileText size={12} />,
  'Avatar Creator': <User size={12} />,
  'Ad Maker': <Palette size={12} />,
  'LLM Tool': <Wrench size={12} />,
  'Tools': <Wrench size={12} />,
};

const AppCard = ({ name, category, thumbnail, timestamp, badge, badgeColor = 'bg-amber-500', onClick }: AppCardProps) => {
  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-border group"
      onClick={onClick}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Timestamp Badge */}
        {timestamp && (
          <div className="absolute top-3 left-3 bg-foreground/80 text-background text-[10px] font-medium px-2 py-0.5 rounded">
            {timestamp}
          </div>
        )}
        
        {/* AI/Feature Badge */}
        {badge && (
          <div className={`absolute top-3 right-3 ${badgeColor} text-black text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground mb-1">{name}</h3>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {categoryIcons[category] || <Wrench size={12} />}
          <span className="text-xs">{category}</span>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
