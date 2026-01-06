import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateContentScore, getScoreBgColor, type ContentScoreResult } from '@/utils/contentScore';
import { TrendingUp, MessageSquare, Hash, Clock, Film, Image } from 'lucide-react';

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
}

const ContentScoreBadge: React.FC<ContentScoreBadgeProps> = ({ 
  item, 
  size = 'sm',
  showBreakdown = false 
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
      <ScoreBreakdownFull scoreResult={scoreResult} />
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
    <ScoreRow icon={Clock} label="Timing" score={scoreResult.breakdown.timing} />
    <ScoreRow icon={Film} label="Content Type" score={scoreResult.breakdown.contentType} />
    <ScoreRow icon={Image} label="Media" score={scoreResult.breakdown.media} />
  </div>
);

const ScoreBreakdownFull: React.FC<{ scoreResult: ContentScoreResult }> = ({ scoreResult }) => (
  <div className="space-y-2 bg-muted/50 rounded-lg p-3">
    <ScoreRowFull icon={MessageSquare} label="Caption Quality" score={scoreResult.breakdown.caption} />
    <ScoreRowFull icon={Hash} label="Hashtags" score={scoreResult.breakdown.hashtags} />
    <ScoreRowFull icon={Clock} label="Posting Time" score={scoreResult.breakdown.timing} />
    <ScoreRowFull icon={Film} label="Content Type" score={scoreResult.breakdown.contentType} />
    <ScoreRowFull icon={Image} label="Media" score={scoreResult.breakdown.media} />
  </div>
);

const ScoreRow: React.FC<{ icon: React.ElementType; label: string; score: number }> = ({ icon: Icon, label, score }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-foreground">{score}</span>
  </div>
);

const ScoreRowFull: React.FC<{ icon: React.ElementType; label: string; score: number }> = ({ icon: Icon, label, score }) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 50) return 'bg-yellow-500';
    if (s >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{score}/100</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ContentScoreBadge;
