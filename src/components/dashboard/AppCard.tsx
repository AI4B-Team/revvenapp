import { useNavigate } from 'react-router-dom';
import { Video, Image, Mic, Palette, FileText, Wrench, User, Star, Play, Download, DollarSign, Flame, Sparkles, CheckCircle } from 'lucide-react';
import { useFavoriteApps } from '@/hooks/useFavoriteApps';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveAppId } from '@/lib/marketplace/catalog';

interface AppCardProps {
  name: string;
  category: string;
  thumbnail: string;
  description?: string;
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
  rating?: number;
  icon?: React.ReactNode;
  viewMode?: 'grid' | 'list';
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Video Tool': <Video size={10} />,
  'Video Tools': <Video size={10} />,
  'Image Tool': <Image size={10} />,
  'Image Tools': <Image size={10} />,
  'Audio Tool': <Mic size={10} />,
  'Audio Tools': <Mic size={10} />,
  'Design Tool': <Palette size={10} />,
  'Design Tools': <Palette size={10} />,
  'Content Tool': <FileText size={10} />,
  'Content Tools': <FileText size={10} />,
  'Avatar Creator': <User size={10} />,
  'Ad Maker': <Palette size={10} />,
  'LLM Tool': <Wrench size={10} />,
  'Tool': <Wrench size={10} />,
  'Tools': <Wrench size={10} />,
  'Content Intelligence': <FileText size={10} />,
  'Communication': <FileText size={10} />,
  'Real Estate': <Wrench size={10} />,
  'Sales Tool': <Wrench size={10} />,
  'Sales Tools': <Wrench size={10} />,
};

// Convert plural category to singular
const toSingularCategory = (category: string): string => {
  if (category.endsWith('Tools')) {
    return category.replace('Tools', 'Tool');
  }
  return category;
};

// Map app names to descriptions
const appDescriptions: { [key: string]: string } = {
  'Sessions': 'Record and manage video sessions effortlessly',
  'Video Downloader': 'Download videos from any platform instantly',
  'Video Resizer': 'Resize videos for any social platform',
  'Motion-Sync': 'Sync motion across video clips seamlessly',
  'Explainer Video': 'Create engaging explainer videos with AI',
  'Digital Influencer': 'Generate AI-powered influencer content',
  'AI Influencer': 'Generate AI-powered influencer content',
  'Viral Shorts': 'Create viral short-form video content',
  'AI Voice Cloner': 'Clone any voice with advanced AI technology',
  'Transcribe': 'Convert speech to text with high accuracy',
  'AI Voice Changer': 'Transform your voice in real-time',
  'AI Voiceovers': 'Generate professional voiceovers instantly',
  'AI Audio Dubber': 'Dub audio in multiple languages',
  'AI Noise Remover': 'Remove background noise from audio',
  'Art Blocks': 'Generate unique AI art blocks',
  'Edit': 'Professional photo editing tools',
  'Background Remover': 'Remove backgrounds from images instantly',
  'Image Eraser': 'Erase unwanted objects from photos',
  'Image Upscaler': 'Upscale images to 4K resolution',
  'Image Enhancer': 'Enhance image quality with AI',
  'Image Colorizer': 'Add color to black and white photos',
  'Logo Designer': 'Design professional logos with AI',
  'Banner Creator': 'Create stunning banners for any platform',
  'Flyer Maker': 'Design eye-catching flyers quickly',
  'Poster Designer': 'Create professional posters easily',
  'Infographic Builder': 'Build informative infographics',
  'Presentation Maker': 'Create stunning presentations',
  'Article': 'Generate SEO-optimized articles',
  'Job Newsletter': 'Create professional job newsletters',
  'Blog Writer': 'Write engaging blog posts with AI',
  'Social Posts': 'Generate social media content',
  'Email Generator': 'Create compelling email campaigns',
  'Ad Copy Writer': 'Write high-converting ad copy',
  'Script Writer': 'Generate scripts for any medium',
  'SEO Optimizer': 'Optimize content for search engines',
  'Ebook Creator': 'Create professional ebooks easily',
  'Digital Spy': 'Competitor social intelligence and content insights',
  'Inbox': 'Manage all your messages in one place',
  'Investor Calculator': 'Calculate real estate investment returns',
  'AI Responder': 'Automate responses with AI',
  'Master Closer': 'AI-powered sales closing assistant',
  'Editor': 'Professional image, video, and audio editor',
  'Versus': 'Compare AI models side by side',
  'Forms': 'Build beautiful forms effortlessly',
  'Signature': 'Create professional email signatures',
  'Prompt Lab': 'Experiment with AI prompts',
  'Model Benchmark': 'Benchmark AI model performance',
  'AI Story': 'Generate engaging stories with AI',
  'Lead Generation': 'Generate quality leads automatically',
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
  description,
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
  createdAt,
  rating = 0,
  icon,
  viewMode = 'grid'
}: AppCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteApps();
  
  // Get the app ID from either the prop or the name mapping
  const resolvedAppId = appId || nameToIdMap[name] || resolveAppId(name);
  const favorited = isFavorite(resolvedAppId);

  // Get description from prop or lookup
  const appDescription = description || appDescriptions[name] || 'Powerful AI-powered tool';

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

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstall?.();
  };

  const handleResellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResell) {
      onResell();
    } else {
      navigate(`/app-license/${resolvedAppId}`);
    }
  };

  const singularCategory = toSingularCategory(category);

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div 
        className="bg-card rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border border-border group flex items-center gap-4 p-3"
        onClick={!isInstalled && !onInstall ? onClick : undefined}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Installed Badge */}
          {isInstalled && (
            <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <CheckCircle size={8} />
            </div>
          )}
          {/* Hot Badge */}
          {showHotBadge && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Flame size={8} />
            </div>
          )}
          {/* New Badge */}
          {showNewBadge && !showHotBadge && (
            <div className="absolute top-1 right-1 bg-amber-400 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Sparkles size={8} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {icon && <span className="text-base">{icon}</span>}
            <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
            {/* Category Badge */}
            <div className="bg-muted text-muted-foreground text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
              {categoryIcons[singularCategory] || categoryIcons[category] || <Wrench size={8} />}
              <span>{singularCategory}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{appDescription}</p>
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={10} 
                  className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} 
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-0.5">({rating.toFixed(1)})</span>
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleStarClick}
          className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
            favorited 
              ? 'bg-amber-500 text-white' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          } hover:scale-110`}
        >
          <Star size={14} className={favorited ? 'fill-current' : ''} />
        </button>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4"
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-border bg-background hover:bg-accent px-4"
                  onClick={handleResellClick}
                >
                  <DollarSign size={12} className="mr-1" />
                  Resell
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                White-Label This App & Sell It Under Your Brand
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Grid View Layout (default)
  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-border group flex flex-col h-full"
      onClick={!isInstalled && !onInstall ? onClick : undefined}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden flex-shrink-0">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Badge - Bottom Left Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[9px] font-medium px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          {categoryIcons[singularCategory] || categoryIcons[category] || <Wrench size={10} />}
          <span>{singularCategory}</span>
        </div>

        {/* Installed Badge - Top Left (green) */}
        {isInstalled && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={10} />
            INSTALLED
          </div>
        )}
        
        {/* Hot Badge - Top Right (red) */}
        {showHotBadge && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame size={10} />
            HOT
          </div>
        )}

        {/* New Badge - Top Right (yellow) - only if not hot */}
        {showNewBadge && !showHotBadge && (
          <div className="absolute top-3 right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} />
            NEW
          </div>
        )}

        {/* Star Favorite Overlay - Bottom Right */}
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
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-grow">{appDescription}</p>
        
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs border-border bg-background hover:bg-accent"
                  onClick={handleResellClick}
                >
                  <DollarSign size={12} className="mr-1" />
                  Resell
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                White-Label This App & Sell It Under Your Brand
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
