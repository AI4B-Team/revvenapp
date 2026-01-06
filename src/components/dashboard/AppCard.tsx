import { Video, Image, Mic, Palette, FileText, Wrench, User, Star } from 'lucide-react';
import { useFavoriteApps } from '@/hooks/useFavoriteApps';

interface AppCardProps {
  name: string;
  category: string;
  thumbnail: string;
  timestamp?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
  appId?: string;
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

// Map app names to IDs for favorites
const nameToIdMap: { [key: string]: string } = {
  'Sessions': 'sessions',
  'Video Downloader': 'video-downloader',
  'Transcribe': 'transcribe',
  'AI Voice Cloner': 'voice-cloner',
  'AI Voice Changer': 'voice-changer',
  'AI Voiceovers': 'voiceovers',
  'AI Audio Dubber': 'audio-dubber',
  'AI Noise Remover': 'noise-remover',
  'Background Remover': 'background-remover',
  'Image Enhancer': 'image-enhancer',
  'Image Upscaler': 'image-upscaler',
  'Blog Writer': 'blog-writer',
  'Social Posts': 'social-posts',
  'Email Generator': 'email-generator',
  'Ad Copy Writer': 'ad-copy-writer',
  'Script Writer': 'script-writer',
  'SEO Optimizer': 'seo-optimizer',
  'Job Newsletter': 'newsletter',
  'Versus': 'versus',
  'REAL Creator': 'create',
  'Explainer Video': 'explainer-video',
};

const AppCard = ({ name, category, thumbnail, timestamp, badge, badgeColor = 'bg-amber-500', onClick, appId }: AppCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoriteApps();
  
  // Get the app ID from either the prop or the name mapping
  const resolvedAppId = appId || nameToIdMap[name] || name.toLowerCase().replace(/\s+/g, '-');
  const favorited = isFavorite(resolvedAppId);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(resolvedAppId);
  };

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

        {/* Star Favorite Overlay */}
        <button
          onClick={handleStarClick}
          className={`absolute bottom-3 right-3 p-1.5 rounded-full transition-all ${
            favorited 
              ? 'bg-amber-500 text-white' 
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
          } hover:scale-110`}
        >
          <Star size={14} className={favorited ? 'fill-current' : ''} />
        </button>
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
