import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateContentScore, getScoreBgColor, type ContentScoreResult, type ScoreSuggestion } from '@/utils/contentScore';
import { MessageSquare, Hash, Film, Image, Sparkles, Loader2 } from 'lucide-react';
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
}

const ContentScoreBadge: React.FC<ContentScoreBadgeProps> = ({ 
  item, 
  size = 'sm',
  showBreakdown = false,
  onSuggestionApplied
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
        <div>
          <p className={`font-semibold ${scoreResult.color}`}>{scoreResult.label}</p>
          <p className="text-xs text-muted-foreground">Content Score</p>
        </div>
      </div>
      <ScoreBreakdownFull 
        scoreResult={scoreResult} 
        item={item}
        onSuggestionApplied={onSuggestionApplied}
      />
    </div>
  );
};

const ScoreBreakdownTooltip: React.FC<{ scoreResult: ContentScoreResult }> = ({ scoreResult }) => (
  <div className="p-3 space-y-2 min-w-[180px]">
    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
      <span className="font-semibold text-sm">Content Score</span>
      <span className={`font-bold ${scoreResult.color}`}>{scoreResult.score}/100</span>
    </div>
    <ScoreRow icon={MessageSquare} label="Caption" score={scoreResult.breakdown.caption} />
    <ScoreRow icon={Hash} label="Hashtags" score={scoreResult.breakdown.hashtags} />
    <ScoreRow icon={Film} label="Content Type" score={scoreResult.breakdown.contentType} />
    <ScoreRow icon={Image} label="Media" score={scoreResult.breakdown.media} />
    {scoreResult.suggestions.length > 0 && (
      <div className="pt-2 mt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {scoreResult.suggestions.length} suggestion{scoreResult.suggestions.length > 1 ? 's' : ''} available
        </p>
      </div>
    )}
  </div>
);

interface ScoreBreakdownFullProps {
  scoreResult: ContentScoreResult;
  item: ContentItem;
  onSuggestionApplied?: (category: string, newValue: string) => void;
}

const ScoreBreakdownFull: React.FC<ScoreBreakdownFullProps> = ({ scoreResult, item, onSuggestionApplied }) => {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const handleImprove = async (category: 'caption' | 'hashtags' | 'contentType' | 'media') => {
    if (!onSuggestionApplied) return;
    
    setLoadingCategory(category);
    
    try {
      const currentCaption = item.caption || item.title || '';
      const currentHashtags = item.hashtags || [];
      const platform = item.platform || 'instagram';
      
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
        score={scoreResult.breakdown.caption}
        suggestions={getCategorySuggestions('caption')}
        onImprove={() => handleImprove('caption')}
        isLoading={loadingCategory === 'caption'}
        canImprove={!!onSuggestionApplied}
      />
      <ScoreRowFull 
        icon={Hash} 
        label="Hashtags" 
        score={scoreResult.breakdown.hashtags}
        suggestions={getCategorySuggestions('hashtags')}
        onImprove={() => handleImprove('hashtags')}
        isLoading={loadingCategory === 'hashtags'}
        canImprove={!!onSuggestionApplied}
      />
      <ScoreRowFull 
        icon={Film} 
        label="Content Type" 
        score={scoreResult.breakdown.contentType}
        suggestions={getCategorySuggestions('contentType')}
        onImprove={() => handleImprove('contentType')}
        isLoading={loadingCategory === 'contentType'}
        canImprove={!!onSuggestionApplied}
      />
      <ScoreRowFull 
        icon={Image} 
        label="Media" 
        score={scoreResult.breakdown.media}
        suggestions={getCategorySuggestions('media')}
        onImprove={() => handleImprove('media')}
        isLoading={loadingCategory === 'media'}
        canImprove={!!onSuggestionApplied}
      />
    </div>
  );
};

const ScoreRow: React.FC<{ icon: React.ElementType; label: string; score: number }> = ({ icon: Icon, label, score }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-foreground">{score}</span>
  </div>
);

interface ScoreRowFullProps {
  icon: React.ElementType;
  label: string;
  score: number;
  suggestions: ScoreSuggestion[];
  onImprove: () => void;
  isLoading: boolean;
  canImprove: boolean;
}

const ScoreRowFull: React.FC<ScoreRowFullProps> = ({ 
  icon: Icon, 
  label, 
  score, 
  suggestions,
  onImprove,
  isLoading,
  canImprove
}) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 50) return 'bg-yellow-500';
    if (s >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const showImproveButton = canImprove && score < 80 && suggestions.length > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{score}/100</span>
          {showImproveButton && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[10px] text-primary hover:text-primary"
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
          className={`h-full rounded-full transition-all ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {suggestions.length > 0 && (
        <p className="text-[10px] text-muted-foreground pl-5">
          💡 {suggestions[0].message}
        </p>
      )}
    </div>
  );
};

export default ContentScoreBadge;
