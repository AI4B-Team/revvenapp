import React from 'react';
import { TrendingUp, TrendingDown, Heart, MessageCircle, Share2, Eye, BarChart3 } from 'lucide-react';

interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagementRate: number;
  trend: 'up' | 'down' | 'stable';
  previousPeriodChange: number;
}

interface EngagementOverlayProps {
  data: EngagementData;
  compact?: boolean;
}

const EngagementOverlay: React.FC<EngagementOverlayProps> = ({ data, compact = false }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-500';
      case 'down': return 'text-red-500';
      case 'stable': return 'text-muted-foreground';
    }
  };

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : BarChart3;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-3 h-3" />
          {formatNumber(data.likes)}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <MessageCircle className="w-3 h-3" />
          {formatNumber(data.comments)}
        </span>
        <span className={`flex items-center gap-1 ${getTrendColor(data.trend)}`}>
          <TrendIcon className="w-3 h-3" />
          {data.previousPeriodChange > 0 ? '+' : ''}{data.previousPeriodChange}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Engagement Overview
        </h3>
        <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trend)}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{data.previousPeriodChange > 0 ? '+' : ''}{data.previousPeriodChange}% vs last period</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          <p className="font-bold text-lg">{formatNumber(data.likes)}</p>
          <p className="text-xs text-slate-400">Likes</p>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <p className="font-bold text-lg">{formatNumber(data.comments)}</p>
          <p className="text-xs text-slate-400">Comments</p>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-bold text-lg">{formatNumber(data.shares)}</p>
          <p className="text-xs text-slate-400">Shares</p>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-bold text-lg">{formatNumber(data.impressions)}</p>
          <p className="text-xs text-slate-400">Impressions</p>
        </div>
      </div>
      
      {/* Engagement Rate Bar */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Engagement Rate</span>
          <span className="font-bold text-emerald-400">{data.engagementRate.toFixed(2)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min(data.engagementRate * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Generate mock engagement data for a post
export const generateMockEngagement = (): EngagementData => ({
  likes: Math.floor(Math.random() * 5000) + 500,
  comments: Math.floor(Math.random() * 200) + 20,
  shares: Math.floor(Math.random() * 100) + 10,
  impressions: Math.floor(Math.random() * 20000) + 2000,
  engagementRate: Math.random() * 8 + 2,
  trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
  previousPeriodChange: Math.floor(Math.random() * 40) - 10,
});

export default EngagementOverlay;
