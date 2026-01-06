import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateContentScore, getScoreBgColor, type ContentScoreResult, type ScoreSuggestion } from '@/utils/contentScore';
import { MessageSquare, Hash, Film, Image, Sparkles, Loader2, Lightbulb, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentItem {
  caption?: string;
  title?: string;
  hashtags?: string[];
  type?: 'post' | 'story' | 'carousel' | 'reel';
  date: Date;
  platform?: string;
  imageUrl?: string;
  carouselImages?: string[] | null;
  videoScript?: unknown;
}

interface ContentScoreBadgeProps {
  item: ContentItem;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  onSuggestionApplied?: (category: string, newValue: string) => void;
  onMediaAction?: (action: string) => void;
  onConvertToCarousel?: (images: string[]) => void;
}

const ContentScoreBadge: React.FC<ContentScoreBadgeProps> = ({ 
  item, 
  size = 'sm',
  showBreakdown = false,
  onSuggestionApplied,
  onMediaAction,
  onConvertToCarousel
}) => {
  const scoreResult = calculateContentScore(item);
  const bgColor = getScoreBgColor(scoreResult.score);
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 min-w-[32px]',
    md: 'text-xs px-2 py-1 min-w-[40px]',
    lg: 'text-sm px-3 py-1.5 min-w-[48px]',
  };

  const badge = (
    <div 
      className={`inline-flex items-center justify-center font-bold rounded-full border ${bgColor} ${scoreResult.color} ${sizeClasses[size]}`}
    >
      {scoreResult.score}
    </div>
  );

  if (!showBreakdown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" className="p-0">
            <ScoreBreakdownTooltip scoreResult={scoreResult} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div 
          className={`inline-flex items-center justify-center font-bold rounded-full border text-lg px-4 py-2 ${bgColor} ${scoreResult.color}`}
        >
          {scoreResult.score}
        </div>
        <p className={`font-semibold ${scoreResult.color}`}>{scoreResult.label}</p>
      </div>
      
      {/* Insight Line */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
        <Lightbulb className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-foreground">{scoreResult.insight}</p>
      </div>
      
      <ScoreBreakdownFull 
        scoreResult={scoreResult} 
        item={item}
        onSuggestionApplied={onSuggestionApplied}
        onMediaAction={onMediaAction}
        onConvertToCarousel={onConvertToCarousel}
      />
      
      {/* Smart Scheduling Suggestion */}
      <SchedulingSuggestion item={item} />
    </div>
  );
};

const ScoreBreakdownTooltip: React.FC<{ scoreResult: ContentScoreResult }> = ({ scoreResult }) => (
  <div className="p-3 space-y-2 min-w-[200px]">
    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
      <span className="font-semibold text-sm">Content Score</span>
      <span className={`font-bold ${scoreResult.color}`}>{scoreResult.score}/100</span>
    </div>
    <ScoreRow icon={MessageSquare} label="Caption" score={scoreResult.breakdown.caption} />
    <ScoreRow icon={Hash} label="Hashtags" score={scoreResult.breakdown.hashtags} />
    <ScoreRow icon={Film} label="Content Type" score={scoreResult.breakdown.contentType} />
    <ScoreRow icon={Image} label="Media" score={scoreResult.breakdown.media} />
    
    {/* Compact Insight */}
    <div className="pt-2 mt-2 border-t border-border">
      <p className="text-[10px] text-muted-foreground flex items-start gap-1">
        <Lightbulb className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
        <span>{scoreResult.insight}</span>
      </p>
    </div>
  </div>
);

interface ScoreBreakdownFullProps {
  scoreResult: ContentScoreResult;
  item: ContentItem;
  onSuggestionApplied?: (category: string, newValue: string) => void;
  onMediaAction?: (action: string) => void;
  onConvertToCarousel?: (images: string[]) => void;
}

const ScoreBreakdownFull: React.FC<ScoreBreakdownFullProps> = ({ 
  scoreResult, 
  item, 
  onSuggestionApplied,
  onMediaAction,
  onConvertToCarousel
}) => {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [animatedScores, setAnimatedScores] = useState({
    caption: 0,
    hashtags: 0,
    contentType: 0,
    media: 0,
  });

  // Animate bars on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores(scoreResult.breakdown);
    }, 100);
    return () => clearTimeout(timer);
  }, [scoreResult.breakdown]);

  const generateCarouselImages = async (): Promise<string[]> => {
    const currentCaption = item.caption || item.title || '';
    const existingImage = item.imageUrl;
    
    // Generate prompts for 3 carousel slides based on the caption
    const promptResponse = await supabase.functions.invoke('editor-chat', {
      body: {
        messages: [{ 
          role: 'user', 
          content: `Based on this social media post caption, generate 3 short image descriptions for a carousel. Each should be visually distinct but thematically connected.

Caption: "${currentCaption}"

Return ONLY 3 image descriptions, one per line, no numbering. Each should be 1 sentence describing what to show visually.`
        }],
        systemPrompt: 'You are a visual content expert. Be specific and concise.',
      },
    });
    
    if (promptResponse.error) throw promptResponse.error;
    
    const descriptions = (promptResponse.data?.reply || promptResponse.data?.content || '')
      .split('\n')
      .filter((line: string) => line.trim())
      .slice(0, 3);
    
    if (descriptions.length === 0) {
      throw new Error('Could not generate image descriptions');
    }
    
    // Generate images using the AI image generation
    const generatedImages: string[] = [];
    
    // If there's an existing image, include it as the first slide
    if (existingImage) {
      generatedImages.push(existingImage);
    }
    
    // Generate 2-3 additional images
    const imagesToGenerate = existingImage ? 2 : 3;
    
    for (let i = 0; i < Math.min(imagesToGenerate, descriptions.length); i++) {
      const imageResponse = await supabase.functions.invoke('editor-generate-image', {
        body: {
          prompt: descriptions[i],
          aspectRatio: '1:1',
        },
      });
      
      if (imageResponse.data?.imageUrl) {
        generatedImages.push(imageResponse.data.imageUrl);
      }
    }
    
    return generatedImages;
  };

  const handleImprove = async (category: 'caption' | 'hashtags' | 'contentType' | 'media') => {
    setLoadingCategory(category);
    
    try {
      const currentCaption = item.caption || item.title || '';
      const platform = item.platform || 'instagram';
      
      // Special handling for contentType - auto-generate carousel
      if (category === 'contentType' && item.type !== 'carousel' && onConvertToCarousel) {
        toast.info('Generating carousel images...', { duration: 5000 });
        
        const carouselImages = await generateCarouselImages();
        
        if (carouselImages.length >= 2) {
          onConvertToCarousel(carouselImages);
          toast.success('Converted to carousel with AI-generated images!');
        } else {
          toast.error('Could not generate enough images for carousel');
        }
        return;
      }
      
      if (!onSuggestionApplied) return;
      
      let prompt = '';
      
      switch (category) {
        case 'caption':
          prompt = `Improve this social media caption for ${platform}. Make it more engaging with:
- A strong hook at the start
- Relevant emojis
- A clear call-to-action
- Questions to encourage comments
- Optimal length (30-150 words)

Current caption: "${currentCaption}"

Return ONLY the improved caption, nothing else.`;
          break;
          
        case 'hashtags':
          prompt = `Generate 10-12 highly relevant hashtags for this ${platform} post about: "${currentCaption}"

Mix of:
- 3-4 broad/popular hashtags
- 4-5 niche/specific hashtags  
- 2-3 trending hashtags

Return ONLY the hashtags separated by spaces, starting with #. No explanations.`;
          break;
          
        case 'contentType':
          prompt = `This ${platform} post is currently a ${item.type || 'post'}. Suggest how to convert it to a more engaging format.

Current content: "${currentCaption}"

Provide a brief suggestion (1-2 sentences) on how to make this a carousel or reel instead.`;
          break;
          
        case 'media':
          prompt = `Suggest what type of image or video would work best for this ${platform} post.

Post content: "${currentCaption}"

Provide a brief, specific description (1-2 sentences) of the ideal visual content.`;
          break;
      }
      
      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'You are a social media expert. Be concise and direct.',
        },
      });
      
      if (error) throw error;
      
      const result = data?.reply || data?.content || '';
      
      if (result) {
        onSuggestionApplied(category, result.trim());
        toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} improved!`);
      }
    } catch (error) {
      console.error('Error improving content:', error);
      toast.error('Failed to generate suggestion');
    } finally {
      setLoadingCategory(null);
    }
  };

  const getCategorySuggestions = (category: string): ScoreSuggestion[] => {
    return scoreResult.suggestions.filter(s => s.category === category);
  };

  return (
    <div className="space-y-3 bg-muted/50 rounded-lg p-3">
      <ScoreRowFull 
        icon={MessageSquare} 
        label="Caption Quality" 
        score={animatedScores.caption}
        targetScore={scoreResult.breakdown.caption}
        suggestions={getCategorySuggestions('caption')}
        onImprove={() => handleImprove('caption')}
        isLoading={loadingCategory === 'caption'}
        canImprove={!!onSuggestionApplied}
        isHighlighted={scoreResult.biggestOpportunity === 'caption'}
      />
      <ScoreRowFull 
        icon={Hash} 
        label="Hashtags" 
        score={animatedScores.hashtags}
        targetScore={scoreResult.breakdown.hashtags}
        suggestions={getCategorySuggestions('hashtags')}
        onImprove={() => handleImprove('hashtags')}
        isLoading={loadingCategory === 'hashtags'}
        canImprove={!!onSuggestionApplied}
        isHighlighted={scoreResult.biggestOpportunity === 'hashtags'}
      />
      <ScoreRowFull 
        icon={Film} 
        label="Content Type" 
        score={animatedScores.contentType}
        targetScore={scoreResult.breakdown.contentType}
        suggestions={getCategorySuggestions('contentType')}
        onImprove={() => handleImprove('contentType')}
        isLoading={loadingCategory === 'contentType'}
        canImprove={!!onSuggestionApplied}
        isHighlighted={scoreResult.biggestOpportunity === 'contentType'}
      />
      <ScoreRowFull 
        icon={Image} 
        label="Media" 
        score={animatedScores.media}
        targetScore={scoreResult.breakdown.media}
        suggestions={getCategorySuggestions('media')}
        onImprove={() => handleImprove('media')}
        isLoading={loadingCategory === 'media'}
        canImprove={!!onSuggestionApplied}
        isHighlighted={scoreResult.biggestOpportunity === 'media'}
        onMediaAction={onMediaAction}
      />
    </div>
  );
};

const ScoreRow: React.FC<{ icon: React.ElementType; label: string; score: number }> = ({ icon: Icon, label, score }) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{score}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

interface ScoreRowFullProps {
  icon: React.ElementType;
  label: string;
  score: number;
  targetScore: number;
  suggestions: ScoreSuggestion[];
  onImprove: () => void;
  isLoading: boolean;
  canImprove: boolean;
  isHighlighted?: boolean;
  onMediaAction?: (action: string) => void;
}

const ScoreRowFull: React.FC<ScoreRowFullProps> = ({ 
  icon: Icon, 
  label, 
  score, 
  targetScore,
  suggestions,
  onImprove,
  isLoading,
  canImprove,
  isHighlighted,
  onMediaAction
}) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusLabel = (s: number) => {
    if (s >= 70) return { text: 'Good', color: 'text-emerald-500' };
    if (s >= 50) return { text: 'Fixable', color: 'text-amber-500' };
    return { text: 'Needs work', color: 'text-red-500' };
  };

  const showImproveButton = canImprove && targetScore < 80;
  const status = getStatusLabel(targetScore);
  const mediaSuggestion = suggestions.find(s => s.action);

  return (
    <div className={`space-y-1.5 p-2 rounded-lg transition-colors ${isHighlighted ? 'bg-primary/10 border border-primary/30' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}>{label}</span>
          <span className={`text-[10px] ${status.color}`}>({status.text})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{targetScore}/100</span>
          {showImproveButton && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
              onClick={onImprove}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-0.5" />
                  Improve
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(targetScore)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Suggestion with micro-action for media */}
      {suggestions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground pl-5 flex-1">
            💡 {suggestions[0].message}
          </p>
          {mediaSuggestion?.action && onMediaAction && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onMediaAction(mediaSuggestion.action!)}
            >
              {mediaSuggestion.action}
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface SchedulingSuggestionProps {
  item: ContentItem;
}

const SchedulingSuggestion: React.FC<SchedulingSuggestionProps> = ({ item }) => {
  // Get optimal posting times based on platform
  const getOptimalTime = (platform: string, currentHour: number) => {
    const optimalTimes: Record<string, { hour: number; label: string }[]> = {
      instagram: [
        { hour: 7, label: '7:00 AM' },
        { hour: 12, label: '12:00 PM' },
        { hour: 19, label: '7:00 PM' },
      ],
      tiktok: [
        { hour: 9, label: '9:00 AM' },
        { hour: 12, label: '12:00 PM' },
        { hour: 19, label: '7:00 PM' },
      ],
      twitter: [
        { hour: 8, label: '8:00 AM' },
        { hour: 12, label: '12:00 PM' },
        { hour: 17, label: '5:00 PM' },
      ],
      linkedin: [
        { hour: 7, label: '7:30 AM' },
        { hour: 12, label: '12:00 PM' },
        { hour: 17, label: '5:00 PM' },
      ],
      facebook: [
        { hour: 9, label: '9:00 AM' },
        { hour: 13, label: '1:00 PM' },
        { hour: 19, label: '7:00 PM' },
      ],
      youtube: [
        { hour: 14, label: '2:00 PM' },
        { hour: 16, label: '4:00 PM' },
        { hour: 21, label: '9:00 PM' },
      ],
    };

    const times = optimalTimes[platform.toLowerCase()] || optimalTimes.instagram;
    
    // Find the nearest optimal time that's different from current
    const sorted = times
      .map(t => ({ ...t, diff: Math.abs(t.hour - currentHour) }))
      .sort((a, b) => a.diff - b.diff);
    
    // If current time is already optimal, return null
    if (sorted[0].diff <= 1) return null;
    
    return sorted[0];
  };

  const currentHour = item.date.getHours();
  const platform = item.platform || 'instagram';
  const suggestion = getOptimalTime(platform, currentHour);

  if (!suggestion) return null;

  // Check if it's an odd hour (likely manually set)
  const isOddTime = currentHour < 6 || (currentHour >= 1 && currentHour <= 5);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-foreground">
          {isOddTime ? (
            <>
              <span className="text-amber-500 font-medium">Low engagement time.</span>{' '}
              Suggested: <span className="font-medium">{suggestion.label}</span> (higher engagement)
            </>
          ) : (
            <>
              Suggested: <span className="font-medium">{suggestion.label}</span> for peak {platform} engagement
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ContentScoreBadge;