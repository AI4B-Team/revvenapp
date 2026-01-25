import { useNavigate } from 'react-router-dom';
import { Video, Image, Mic, Palette, FileText, Wrench, User, Star, Play, Download, Share2, Flame, Sparkles, CheckCircle } from 'lucide-react';
import { useFavoriteApps } from '@/hooks/useFavoriteApps';
import { Button } from '@/components/ui/button';
import { resolveAppId } from '@/lib/marketplace/catalog';

interface AppCardProps {
  name: string;
  category: string;
  thumbnail: string;
  timestamp?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
  appId?: string;
  isInstalled?: boolean;
  onInstall?: () => void;
  onOpen?: () => void;
  onActivate?: () => void;
  onResell?: () => void;
  createdAt?: Date;
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
  'Content Intelligence': <FileText size={12} />,
  'Communication': <FileText size={12} />,
  'Real Estate': <Wrench size={12} />,
  'Sales Tools': <Wrench size={12} />,
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

const AppCard = ({ 
  name, 
  category, 
  thumbnail, 
  timestamp, 
  badge, 
  badgeColor, 
  onClick, 
  appId,
  isInstalled = false,
  onInstall,
  onOpen,
  onActivate,
  onResell,
  createdAt
}: AppCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteApps();
  
  // Get the app ID from either the prop or the name mapping
  const resolvedAppId = appId || nameToIdMap[name] || resolveAppId(name);
  const favorited = isFavorite(resolvedAppId);

  // Check if app is new (within 30 days)
  const isNewApp = createdAt ? (Date.now() - createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000 : false;

  // Determine which badge to show (only HOT, NEW are allowed on right side)
  const normalizedBadge = badge?.toUpperCase();
  const showHotBadge = normalizedBadge === 'HOT';
  const showNewBadge = normalizedBadge === 'NEW' || isNewApp;

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(resolvedAppId);
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen?.();
  };

  const handleActivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivate?.();
  };

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstall?.();
  };

  const handleResellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResell) {
      onResell();
    } else {
      // Navigate to app license page for white-labeling
      navigate(`/app-license/${resolvedAppId}`);
    }
  };

  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-border group"
      onClick={!isInstalled && !onInstall ? onClick : undefined}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        

        {/* Installed Badge - Left Side (green) */}
        {isInstalled && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={10} />
            INSTALLED
          </div>
        )}
        
        {/* Hot Badge - Right Side (red) */}
        {showHotBadge && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame size={10} />
            HOT
          </div>
        )}

        {/* New Badge - Right Side (yellow) - only if not hot */}
        {showNewBadge && !showHotBadge && (
          <div className="absolute top-3 right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} />
            NEW
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
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          {categoryIcons[category] || <Wrench size={12} />}
          <span className="text-xs">{category}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={isInstalled ? handleOpenClick : (onInstall ? handleInstallClick : (onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined))}
          >
            {isInstalled ? (
              <>
                <Play size={12} className="mr-1" />
                Open
              </>
            ) : (
              <>
                <Download size={12} className="mr-1" />
                Install
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleResellClick}
          >
            <Share2 size={12} className="mr-1" />
            Resell
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
