// Content Score Calculation Utility
// Factors: caption quality, hashtag count, content type, and media
// Note: Timing is excluded as AI auto-scheduling always picks optimal times

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

interface ScoreBreakdown {
  caption: number;
  hashtags: number;
  contentType: number;
  media: number;
}

interface ContentScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  label: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Excellent';
  color: string;
  suggestions: ScoreSuggestion[];
  insight: string;
  biggestOpportunity: 'caption' | 'hashtags' | 'contentType' | 'media';
}

interface ScoreSuggestion {
  category: 'caption' | 'hashtags' | 'contentType' | 'media';
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

function calculateCaptionScore(caption?: string, title?: string): { score: number; suggestions: ScoreSuggestion[] } {
  const text = caption || title || '';
  const suggestions: ScoreSuggestion[] = [];
  
  if (!text) {
    suggestions.push({ category: 'caption', message: 'Add a caption to improve engagement', priority: 'high' });
    return { score: 0, suggestions };
  }
  
  let score = 0;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Word count scoring (optimal: 30-150 words)
  if (wordCount >= 30 && wordCount <= 150) {
    score += 30;
  } else if (wordCount >= 15 && wordCount <= 200) {
    score += 20;
  } else if (wordCount > 0) {
    score += 10;
    if (wordCount < 15) {
      suggestions.push({ category: 'caption', message: 'Expand your caption to 30-150 words for better engagement', priority: 'medium' });
    }
  }
  
  // Has call-to-action phrases
  const ctaPhrases = ['click', 'link', 'comment', 'share', 'follow', 'subscribe', 'check out', 'learn more', 'tap', 'swipe', 'save', 'tag', 'dm', 'shop', 'get', 'try', 'discover'];
  const hasCtA = ctaPhrases.some(phrase => text.toLowerCase().includes(phrase));
  if (hasCtA) {
    score += 15;
  } else {
    suggestions.push({ category: 'caption', message: 'Add a call-to-action (e.g., "Comment below", "Share with a friend")', priority: 'medium' });
  }
  
  // Has hook (first sentence is engaging)
  const firstSentence = text.split(/[.!?]/)[0] || '';
  if (firstSentence.length > 20 && firstSentence.length < 100) {
    score += 10;
  } else {
    suggestions.push({ category: 'caption', message: 'Start with a stronger hook to grab attention', priority: 'low' });
  }
  
  // Uses emojis (engagement boost)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) {
    score += 10;
  } else {
    suggestions.push({ category: 'caption', message: 'Add relevant emojis to increase visual appeal', priority: 'low' });
  }
  
  // Has question (drives comments)
  if (text.includes('?')) {
    score += 10;
  } else {
    suggestions.push({ category: 'caption', message: 'Include a question to encourage comments', priority: 'low' });
  }
  
  // Line breaks for readability
  if (text.includes('\n')) {
    score += 5;
  }
  
  return { score: Math.min(score, 100), suggestions };
}

function calculateHashtagScore(hashtags?: string[]): { score: number; suggestions: ScoreSuggestion[] } {
  const suggestions: ScoreSuggestion[] = [];
  
  if (!hashtags || hashtags.length === 0) {
    suggestions.push({ category: 'hashtags', message: 'Add 5-15 relevant hashtags to increase discoverability', priority: 'high' });
    return { score: 0, suggestions };
  }
  
  const count = hashtags.length;
  
  // Optimal: 5-15 hashtags
  if (count >= 5 && count <= 15) {
    return { score: 100, suggestions };
  } else if (count >= 3 && count <= 20) {
    if (count < 5) {
      suggestions.push({ category: 'hashtags', message: `Add ${5 - count} more hashtags for optimal reach`, priority: 'low' });
    } else {
      suggestions.push({ category: 'hashtags', message: 'Consider reducing hashtags to 15 or fewer', priority: 'low' });
    }
    return { score: 70, suggestions };
  } else if (count >= 1 && count <= 30) {
    if (count < 3) {
      suggestions.push({ category: 'hashtags', message: 'Add more hashtags (aim for 5-15)', priority: 'medium' });
    } else {
      suggestions.push({ category: 'hashtags', message: 'Too many hashtags can look spammy, reduce to 15', priority: 'medium' });
    }
    return { score: 40, suggestions };
  }
  
  return { score: 20, suggestions };
}

function calculateContentTypeScore(
  type?: string, 
  hasMedia?: boolean, 
  carouselCount?: number, 
  hasVideo?: boolean
): { score: number; suggestions: ScoreSuggestion[] } {
  const suggestions: ScoreSuggestion[] = [];
  let score = 40; // Base score for any content
  
  // Content type bonus
  switch (type) {
    case 'carousel':
      score += 30; // Carousels get high engagement
      if (carouselCount && carouselCount >= 3) {
        score += 15;
      } else {
        suggestions.push({ category: 'contentType', message: 'Add more slides to your carousel (3+ is optimal)', priority: 'low' });
      }
      break;
    case 'reel':
      score += 35; // Reels/videos are prioritized
      break;
    case 'story':
      score += 15;
      suggestions.push({ category: 'contentType', message: 'Consider converting to a Reel for better reach', priority: 'low' });
      break;
    case 'post':
    default:
      score += 10;
      suggestions.push({ category: 'contentType', message: 'Reels and carousels typically get 2-3x more engagement', priority: 'low' });
  }
  
  // Media bonus
  if (hasMedia) score += 15;
  if (hasVideo) score += 10;
  
  return { score: Math.min(score, 100), suggestions };
}

function calculateMediaScore(item: ContentItem): { score: number; suggestions: ScoreSuggestion[] } {
  const suggestions: ScoreSuggestion[] = [];
  let score = 0;
  
  if (item.imageUrl) {
    score += 50;
  } else {
    suggestions.push({ category: 'media', message: 'Add an image or video to your post', priority: 'high', action: 'Add media' });
  }
  
  if (item.carouselImages && item.carouselImages.length > 0) {
    score += 20 + Math.min(item.carouselImages.length * 5, 20);
  } else if (item.imageUrl && !item.videoScript) {
    suggestions.push({ category: 'media', message: 'Try a carousel for 2-3x more engagement', priority: 'medium', action: 'Convert to carousel' });
  }
  
  if (item.videoScript) {
    score += 30;
  } else if (item.imageUrl) {
    suggestions.push({ category: 'media', message: 'Short videos get 48% more views', priority: 'low', action: 'Try short video' });
  }
  
  if (item.type === 'reel') {
    score += 10;
  }
  
  if (score > 0 && score < 70) {
    suggestions.push({ category: 'media', message: 'Add text overlay to boost saves', priority: 'low', action: 'Add text overlay' });
  }
  
  if (score === 0) {
    return { score: 0, suggestions };
  }
  
  return { score: Math.min(score, 100), suggestions };
}

function getScoreLabel(score: number): ContentScoreResult['label'] {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-green-500';
  if (score >= 55) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 70) return 'bg-green-500/10 border-green-500/30';
  if (score >= 55) return 'bg-yellow-500/10 border-yellow-500/30';
  if (score >= 40) return 'bg-orange-500/10 border-orange-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

export function calculateContentScore(item: ContentItem): ContentScoreResult {
  const captionResult = calculateCaptionScore(item.caption, item.title);
  const hashtagResult = calculateHashtagScore(item.hashtags);
  const contentTypeResult = calculateContentTypeScore(
    item.type,
    !!item.imageUrl,
    item.carouselImages?.length,
    !!item.videoScript
  );
  const mediaResult = calculateMediaScore(item);
  
  // Collect all suggestions, sorted by priority
  const allSuggestions = [
    ...captionResult.suggestions,
    ...hashtagResult.suggestions,
    ...contentTypeResult.suggestions,
    ...mediaResult.suggestions,
  ].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Weighted average (removed timing)
  const weights = {
    caption: 0.40,
    hashtags: 0.20,
    contentType: 0.20,
    media: 0.20,
  };
  
  const totalScore = Math.round(
    captionResult.score * weights.caption +
    hashtagResult.score * weights.hashtags +
    contentTypeResult.score * weights.contentType +
    mediaResult.score * weights.media
  );
  
  // Find biggest opportunity (lowest scoring category)
  const scores = {
    caption: captionResult.score,
    hashtags: hashtagResult.score,
    contentType: contentTypeResult.score,
    media: mediaResult.score,
  };
  
  const biggestOpportunity = (Object.entries(scores) as [keyof typeof scores, number][])
    .sort((a, b) => a[1] - b[1])[0][0];
  
  // Generate insight based on biggest opportunity
  const insightMap: Record<string, string> = {
    caption: 'Your biggest opportunity: Strengthen your caption with a hook + CTA',
    hashtags: 'Your biggest opportunity: Add relevant hashtags for discoverability',
    contentType: 'Your biggest opportunity: Switch to Reels or Carousels for more reach',
    media: 'Your biggest opportunity: Upgrade your visual content',
  };
  
  return {
    score: totalScore,
    breakdown: {
      caption: captionResult.score,
      hashtags: hashtagResult.score,
      contentType: contentTypeResult.score,
      media: mediaResult.score,
    },
    label: getScoreLabel(totalScore),
    color: getScoreColor(totalScore),
    suggestions: allSuggestions,
    insight: totalScore >= 85 ? '🔥 This post is optimized for maximum reach!' : insightMap[biggestOpportunity],
    biggestOpportunity,
  };
}

export { getScoreColor, getScoreBgColor, getScoreLabel };
export type { ContentScoreResult, ScoreBreakdown, ScoreSuggestion };
