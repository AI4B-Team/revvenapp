import React from 'react';
import { AlertTriangle, Info, X, ExternalLink } from 'lucide-react';
import { getPlatformIcon } from '../SocialIcons';

interface Warning {
  id: string;
  platform: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PlatformWarningsProps {
  warnings: Warning[];
  onDismiss: (warningId: string) => void;
}

const PlatformWarnings: React.FC<PlatformWarningsProps> = ({ warnings, onDismiss }) => {
  if (warnings.length === 0) return null;

  const getWarningStyles = (type: Warning['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
    }
  };

  const getIcon = (type: Warning['type']) => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {warnings.map(warning => (
        <div 
          key={warning.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${getWarningStyles(warning.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(warning.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded bg-white/50 flex items-center justify-center">
                {getPlatformIcon(warning.platform, 'w-3 h-3')}
              </div>
              <span className="font-semibold text-sm">{warning.title}</span>
            </div>
            <p className="text-sm opacity-80">{warning.description}</p>
            
            {warning.action && (
              <button 
                onClick={warning.action.onClick}
                className="flex items-center gap-1 text-sm font-medium mt-2 hover:underline"
              >
                {warning.action.label}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => onDismiss(warning.id)}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to check content and generate warnings
export const generateWarnings = (posts: { id: string; platform: string; caption?: string; hashtags?: string[]; imageUrl?: string }[]): Warning[] => {
  const warnings: Warning[] = [];

  posts.forEach(post => {
    // Instagram specific checks
    if (post.platform === 'instagram') {
      if (post.hashtags && post.hashtags.length > 30) {
        warnings.push({
          id: `ig-hashtags-${post.id}`,
          platform: 'instagram',
          type: 'error',
          title: 'Too many hashtags',
          description: `Post has ${post.hashtags.length} hashtags. Instagram allows max 30.`,
        });
      }
      if (post.caption && post.caption.length > 2200) {
        warnings.push({
          id: `ig-caption-${post.id}`,
          platform: 'instagram',
          type: 'warning',
          title: 'Caption too long',
          description: 'Caption exceeds 2,200 characters and will be truncated.',
        });
      }
    }

    // Twitter specific checks
    if (post.platform === 'twitter') {
      if (post.caption && post.caption.length > 280) {
        warnings.push({
          id: `tw-caption-${post.id}`,
          platform: 'twitter',
          type: 'error',
          title: 'Tweet too long',
          description: `Tweet is ${post.caption.length} characters. Maximum is 280.`,
        });
      }
    }

    // LinkedIn specific checks
    if (post.platform === 'linkedin') {
      if (post.caption && post.caption.length > 3000) {
        warnings.push({
          id: `li-caption-${post.id}`,
          platform: 'linkedin',
          type: 'warning',
          title: 'Post too long',
          description: 'LinkedIn posts over 3,000 characters may be truncated.',
        });
      }
    }

    // TikTok specific checks
    if (post.platform === 'tiktok') {
      if (!post.imageUrl) {
        warnings.push({
          id: `tt-video-${post.id}`,
          platform: 'tiktok',
          type: 'warning',
          title: 'No video attached',
          description: 'TikTok posts require video content.',
        });
      }
    }
  });

  return warnings;
};

export default PlatformWarnings;
