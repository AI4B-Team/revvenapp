// Content Score Calculation Utility
// Factors: caption quality, hashtag count, timing, and content type

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
  timing: number;
  contentType: number;
  media: number;
}

interface ContentScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  label: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Excellent';
  color: string;
}

// Optimal posting hours by platform (hour in 24h format)
const OPTIMAL_HOURS: Record<string, number[]> = {
  instagram: [9, 11, 12, 17, 18, 19],
  facebook: [9, 10, 11, 13, 16],
  twitter: [8, 9, 12, 17, 18],
  x: [8, 9, 12, 17, 18],
  linkedin: [7, 8, 9, 10, 12, 17],
  tiktok: [12, 15, 19, 20, 21],
  youtube: [12, 15, 16, 17, 18],
  threads: [9, 12, 17, 18, 19],
  pinterest: [14, 15, 20, 21],
  default: [9, 12, 17, 18],
};

// Optimal days (0 = Sunday, 6 = Saturday)
const OPTIMAL_DAYS: Record<string, number[]> = {
  instagram: [1, 2, 3, 4, 5], // Weekdays
  facebook: [1, 2, 3, 4, 5],
  twitter: [1, 2, 3, 4],
  x: [1, 2, 3, 4],
  linkedin: [1, 2, 3, 4], // Mon-Thu
  tiktok: [2, 3, 4, 5, 6], // Tue-Sat
  youtube: [4, 5, 6, 0], // Thu-Sun
  threads: [1, 2, 3, 4, 5],
  pinterest: [5, 6, 0], // Fri-Sun
  default: [1, 2, 3, 4, 5],
};

function calculateCaptionScore(caption?: string, title?: string): number {
  const text = caption || title || '';
  
  if (!text) return 0;
  
  let score = 0;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Word count scoring (optimal: 30-150 words)
  if (wordCount >= 30 && wordCount <= 150) {
    score += 30;
  } else if (wordCount >= 15 && wordCount <= 200) {
    score += 20;
  } else if (wordCount > 0) {
    score += 10;
  }
  
  // Has call-to-action phrases
  const ctaPhrases = ['click', 'link', 'comment', 'share', 'follow', 'subscribe', 'check out', 'learn more', 'tap', 'swipe', 'save', 'tag', 'dm', 'shop', 'get', 'try', 'discover'];
  const hasCtA = ctaPhrases.some(phrase => text.toLowerCase().includes(phrase));
  if (hasCtA) score += 15;
  
  // Has hook (first sentence is engaging)
  const firstSentence = text.split(/[.!?]/)[0] || '';
  if (firstSentence.length > 20 && firstSentence.length < 100) {
    score += 10;
  }
  
  // Uses emojis (engagement boost)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) score += 10;
  
  // Has question (drives comments)
  if (text.includes('?')) score += 10;
  
  // Line breaks for readability
  if (text.includes('\n')) score += 5;
  
  return Math.min(score, 100);
}

function calculateHashtagScore(hashtags?: string[]): number {
  if (!hashtags || hashtags.length === 0) return 0;
  
  const count = hashtags.length;
  
  // Optimal: 5-15 hashtags
  if (count >= 5 && count <= 15) {
    return 100;
  } else if (count >= 3 && count <= 20) {
    return 70;
  } else if (count >= 1 && count <= 30) {
    return 40;
  }
  
  return 20;
}

function calculateTimingScore(date: Date, platform?: string): number {
  const hour = date.getHours();
  const day = date.getDay();
  const platformKey = platform?.toLowerCase() || 'default';
  
  const optimalHours = OPTIMAL_HOURS[platformKey] || OPTIMAL_HOURS.default;
  const optimalDays = OPTIMAL_DAYS[platformKey] || OPTIMAL_DAYS.default;
  
  let score = 0;
  
  // Hour scoring
  if (optimalHours.includes(hour)) {
    score += 60;
  } else if (optimalHours.some(h => Math.abs(h - hour) <= 1)) {
    score += 40;
  } else if (optimalHours.some(h => Math.abs(h - hour) <= 2)) {
    score += 20;
  }
  
  // Day scoring
  if (optimalDays.includes(day)) {
    score += 40;
  } else {
    score += 15;
  }
  
  return Math.min(score, 100);
}

function calculateContentTypeScore(type?: string, hasMedia?: boolean, carouselCount?: number, hasVideo?: boolean): number {
  let score = 40; // Base score for any content
  
  // Content type bonus
  switch (type) {
    case 'carousel':
      score += 30; // Carousels get high engagement
      if (carouselCount && carouselCount >= 3) score += 15;
      break;
    case 'reel':
      score += 35; // Reels/videos are prioritized
      break;
    case 'story':
      score += 15;
      break;
    case 'post':
    default:
      score += 10;
  }
  
  // Media bonus
  if (hasMedia) score += 15;
  if (hasVideo) score += 10;
  
  return Math.min(score, 100);
}

function calculateMediaScore(item: ContentItem): number {
  let score = 0;
  
  if (item.imageUrl) score += 40;
  if (item.carouselImages && item.carouselImages.length > 0) {
    score += 20 + Math.min(item.carouselImages.length * 5, 30);
  }
  if (item.videoScript) score += 30;
  if (item.type === 'reel') score += 10;
  
  return Math.min(score, 100);
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
  const captionScore = calculateCaptionScore(item.caption, item.title);
  const hashtagScore = calculateHashtagScore(item.hashtags);
  const timingScore = calculateTimingScore(item.date, item.platform);
  const contentTypeScore = calculateContentTypeScore(
    item.type,
    !!item.imageUrl,
    item.carouselImages?.length,
    !!item.videoScript
  );
  const mediaScore = calculateMediaScore(item);
  
  // Weighted average
  const weights = {
    caption: 0.30,
    hashtags: 0.15,
    timing: 0.20,
    contentType: 0.20,
    media: 0.15,
  };
  
  const totalScore = Math.round(
    captionScore * weights.caption +
    hashtagScore * weights.hashtags +
    timingScore * weights.timing +
    contentTypeScore * weights.contentType +
    mediaScore * weights.media
  );
  
  return {
    score: totalScore,
    breakdown: {
      caption: captionScore,
      hashtags: hashtagScore,
      timing: timingScore,
      contentType: contentTypeScore,
      media: mediaScore,
    },
    label: getScoreLabel(totalScore),
    color: getScoreColor(totalScore),
  };
}

export { getScoreColor, getScoreBgColor, getScoreLabel };
export type { ContentScoreResult, ScoreBreakdown };
