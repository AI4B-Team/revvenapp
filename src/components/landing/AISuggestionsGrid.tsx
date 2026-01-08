import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, FileText, Sparkles, Music, Mic, Search, BarChart3, Lightbulb, Calendar, Zap, Target, TrendingUp, Users, Mail, Bot, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconTooltip } from '@/components/ui/IconTooltip';

export interface Suggestion {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
}

interface IntentSuggestions {
  [key: string]: Suggestion[][];
}

const suggestionsByIntent: IntentSuggestions = {
  Create: [
    [
      { id: 'video', icon: Video, iconColor: 'text-blue-500', title: 'AI Video', description: 'Stunning visuals in seconds.', prompt: 'Create a cinematic 30-second video showcasing a luxury product with dramatic lighting and smooth camera movements' },
      { id: 'social', icon: Sparkles, iconColor: 'text-amber-500', title: 'Social Content', description: 'Posts that stop the scroll.', prompt: 'Generate a week of engaging Instagram posts for a wellness brand with captions and hashtags' },
      { id: 'image', icon: Image, iconColor: 'text-violet-500', title: 'AI Images', description: 'Visuals that captivate.', prompt: 'Create a photorealistic product image with professional studio lighting and modern aesthetic' },
      { id: 'music', icon: Music, iconColor: 'text-pink-500', title: 'Custom Music', description: 'Sounds that move souls.', prompt: 'Compose an uplifting background track for a brand video, 60 seconds, modern and inspiring' },
      { id: 'voice', icon: Mic, iconColor: 'text-emerald-500', title: 'Voice Clone', description: 'Your voice, everywhere.', prompt: 'Clone my voice for creating professional voiceovers for my content' },
      { id: 'blog', icon: FileText, iconColor: 'text-indigo-500', title: 'Blog Article', description: 'Words that convert.', prompt: 'Write a 1500-word SEO-optimized blog post about sustainable living tips' },
    ],
    [
      { id: 'shorts', icon: Zap, iconColor: 'text-orange-500', title: 'Viral Shorts', description: 'Hook them in 3 seconds.', prompt: 'Create a viral TikTok-style short video with trending transitions and effects' },
      { id: 'podcast', icon: Mic, iconColor: 'text-purple-500', title: 'Podcast Episode', description: 'Stories worth sharing.', prompt: 'Write a podcast episode script about building a personal brand' },
      { id: 'thumbnail', icon: Image, iconColor: 'text-red-500', title: 'Thumbnails', description: 'Clicks start here.', prompt: 'Design click-worthy YouTube thumbnails for my video content' },
      { id: 'jingle', icon: Music, iconColor: 'text-teal-500', title: 'Brand Jingle', description: 'Sounds they remember.', prompt: 'Create a catchy 5-second audio logo for my brand' },
      { id: 'newsletter', icon: Mail, iconColor: 'text-blue-600', title: 'Newsletter', description: 'Inbox gold.', prompt: 'Write an engaging weekly newsletter for my audience' },
      { id: 'script', icon: FileText, iconColor: 'text-slate-600', title: 'Video Script', description: 'Words that sell.', prompt: 'Write a compelling video script for a product launch' },
    ],
    [
      { id: 'carousel', icon: Image, iconColor: 'text-cyan-500', title: 'Carousel Posts', description: 'Swipe-worthy stories.', prompt: 'Create a 10-slide Instagram carousel about productivity tips with engaging visuals' },
      { id: 'explainer', icon: Video, iconColor: 'text-rose-500', title: 'Explainer Video', description: 'Complex made simple.', prompt: 'Create a 60-second animated explainer video about how our service works' },
      { id: 'meme', icon: Sparkles, iconColor: 'text-yellow-500', title: 'Meme Content', description: 'Humor that connects.', prompt: 'Generate relatable memes for my niche audience that drive engagement' },
      { id: 'ebook', icon: FileText, iconColor: 'text-emerald-600', title: 'Ebook', description: 'Authority in pages.', prompt: 'Write a comprehensive 20-page ebook about starting an online business' },
      { id: 'testimonial', icon: Users, iconColor: 'text-blue-400', title: 'Testimonial Video', description: 'Trust through stories.', prompt: 'Create a customer testimonial video template with professional styling' },
      { id: 'infographic', icon: BarChart3, iconColor: 'text-violet-600', title: 'Infographics', description: 'Data made beautiful.', prompt: 'Design an infographic showcasing industry statistics and trends' },
    ],
    [
      { id: 'reels', icon: Video, iconColor: 'text-pink-600', title: 'Instagram Reels', description: 'Trending format mastery.', prompt: 'Create 5 Instagram Reel concepts with hooks, scripts, and trending audio suggestions' },
      { id: 'linkedin', icon: FileText, iconColor: 'text-blue-700', title: 'LinkedIn Posts', description: 'Professional presence.', prompt: 'Write 7 thought leadership LinkedIn posts that establish authority in my field' },
      { id: 'quotes', icon: Sparkles, iconColor: 'text-amber-600', title: 'Quote Graphics', description: 'Wisdom visualized.', prompt: 'Create 10 inspirational quote graphics with modern typography and backgrounds' },
      { id: 'webinar', icon: Video, iconColor: 'text-indigo-600', title: 'Webinar Content', description: 'Educate and convert.', prompt: 'Create a complete webinar presentation with slides and speaker notes' },
      { id: 'soundscape', icon: Music, iconColor: 'text-green-500', title: 'Ambient Audio', description: 'Atmosphere on demand.', prompt: 'Create relaxing ambient soundscape for meditation or focus content' },
      { id: 'case-study', icon: FileText, iconColor: 'text-orange-600', title: 'Case Study', description: 'Results that prove.', prompt: 'Write a detailed case study showcasing client success with data and testimonials' },
    ],
  ],
  Research: [
    [
      { id: 'market', icon: Search, iconColor: 'text-blue-500', title: 'Market Analysis', description: 'Know your battlefield.', prompt: 'Analyze the current market trends and competitive landscape for the wellness industry' },
      { id: 'trends', icon: TrendingUp, iconColor: 'text-emerald-500', title: 'Trend Finder', description: "Spot what's next.", prompt: 'Identify emerging trends in social media marketing for 2026' },
      { id: 'competitor', icon: Target, iconColor: 'text-red-500', title: 'Competitor Intel', description: 'Learn their secrets.', prompt: 'Research top 5 competitors in my niche and analyze their content strategies' },
      { id: 'audience', icon: Users, iconColor: 'text-violet-500', title: 'Audience Insights', description: 'Understand their desires.', prompt: 'Create detailed buyer personas for a luxury skincare brand' },
      { id: 'report', icon: BarChart3, iconColor: 'text-amber-500', title: 'Industry Report', description: 'Data that decides.', prompt: 'Generate a comprehensive industry report on the creator economy' },
      { id: 'gaps', icon: Lightbulb, iconColor: 'text-cyan-500', title: 'Content Gaps', description: 'Find the whitespace.', prompt: 'Identify untapped content opportunities in the fitness coaching space' },
    ],
    [
      { id: 'keywords', icon: Search, iconColor: 'text-green-500', title: 'Keyword Research', description: 'Words that rank.', prompt: 'Find high-volume low-competition keywords for my niche' },
      { id: 'sentiment', icon: Users, iconColor: 'text-pink-500', title: 'Sentiment Analysis', description: 'Feel the pulse.', prompt: 'Analyze customer sentiment from reviews and social mentions' },
      { id: 'pricing', icon: BarChart3, iconColor: 'text-indigo-500', title: 'Price Analysis', description: 'Find the sweet spot.', prompt: 'Research competitor pricing strategies and optimal price points' },
      { id: 'influencer', icon: Sparkles, iconColor: 'text-amber-500', title: 'Influencer Scout', description: 'Find your champions.', prompt: 'Identify top influencers in my niche for potential partnerships' },
      { id: 'benchmark', icon: Target, iconColor: 'text-blue-600', title: 'Benchmarking', description: 'Measure to master.', prompt: 'Create industry benchmarks for engagement and conversion rates' },
      { id: 'swot', icon: Lightbulb, iconColor: 'text-orange-500', title: 'SWOT Analysis', description: 'Know thyself.', prompt: 'Conduct a comprehensive SWOT analysis for my business' },
    ],
    [
      { id: 'hashtag', icon: Search, iconColor: 'text-purple-500', title: 'Hashtag Research', description: 'Tags that trend.', prompt: 'Research the best performing hashtags for my niche on Instagram and TikTok' },
      { id: 'demographics', icon: Users, iconColor: 'text-teal-500', title: 'Demographics Study', description: 'Know your people.', prompt: 'Analyze demographic data and behavior patterns for my target market' },
      { id: 'viral', icon: TrendingUp, iconColor: 'text-rose-500', title: 'Viral Content Study', description: 'Decode virality.', prompt: 'Analyze what makes content go viral in my industry and extract patterns' },
      { id: 'tech-trends', icon: Zap, iconColor: 'text-cyan-600', title: 'Tech Trends', description: 'Future-proof your brand.', prompt: 'Research emerging technologies that will impact my industry in the next 2 years' },
      { id: 'pain-points', icon: Target, iconColor: 'text-red-600', title: 'Pain Point Analysis', description: 'Solve real problems.', prompt: 'Identify the top pain points and frustrations of my target audience' },
      { id: 'content-perf', icon: BarChart3, iconColor: 'text-blue-500', title: 'Content Performance', description: 'Learn from data.', prompt: 'Analyze my best performing content and identify success patterns' },
    ],
    [
      { id: 'seasonal', icon: Calendar, iconColor: 'text-orange-500', title: 'Seasonal Trends', description: 'Timing is everything.', prompt: 'Research seasonal trends and peak engagement periods for my industry' },
      { id: 'platform', icon: Search, iconColor: 'text-violet-600', title: 'Platform Analysis', description: 'Where to focus.', prompt: 'Analyze which social platforms perform best for my type of content' },
      { id: 'usp', icon: Lightbulb, iconColor: 'text-yellow-500', title: 'USP Discovery', description: 'What sets you apart.', prompt: 'Research and identify unique selling propositions that differentiate my brand' },
      { id: 'customer-journey', icon: Users, iconColor: 'text-emerald-600', title: 'Journey Mapping', description: 'Walk their path.', prompt: 'Map the complete customer journey from awareness to advocacy' },
      { id: 'brand-perception', icon: Sparkles, iconColor: 'text-pink-600', title: 'Brand Perception', description: 'How they see you.', prompt: 'Research how my brand is perceived compared to competitors' },
      { id: 'roi-analysis', icon: BarChart3, iconColor: 'text-green-600', title: 'ROI Analysis', description: 'Measure what matters.', prompt: 'Analyze ROI metrics across different marketing channels and campaigns' },
    ],
  ],
  Plan: [
    [
      { id: 'calendar', icon: Calendar, iconColor: 'text-blue-500', title: 'Content Calendar', description: 'Never miss a moment.', prompt: 'Create a 30-day content calendar for Instagram and TikTok for a fashion brand' },
      { id: 'campaign', icon: Target, iconColor: 'text-violet-500', title: 'Campaign Strategy', description: 'Roadmap to results.', prompt: 'Design a product launch campaign strategy with timeline and milestones' },
      { id: 'growth', icon: TrendingUp, iconColor: 'text-emerald-500', title: 'Growth Blueprint', description: 'Scale with precision.', prompt: 'Build a 90-day growth plan to increase social media following by 50%' },
      { id: 'email', icon: Mail, iconColor: 'text-pink-500', title: 'Email Sequence', description: 'Nurture to conversion.', prompt: 'Plan a 7-email welcome sequence for new subscribers' },
      { id: 'launch', icon: Zap, iconColor: 'text-amber-500', title: 'Launch Timeline', description: 'Execute flawlessly.', prompt: 'Create a detailed product launch timeline with daily tasks and checkpoints' },
      { id: 'brand', icon: Sparkles, iconColor: 'text-indigo-500', title: 'Brand Strategy', description: 'Define your empire.', prompt: 'Develop a comprehensive brand positioning strategy and messaging framework' },
    ],
    [
      { id: 'funnel', icon: Target, iconColor: 'text-red-500', title: 'Sales Funnel', description: 'Guide to conversion.', prompt: 'Design a complete sales funnel from awareness to purchase' },
      { id: 'collab', icon: Users, iconColor: 'text-teal-500', title: 'Collab Strategy', description: 'Grow together.', prompt: 'Plan a strategic collaboration campaign with complementary brands' },
      { id: 'ads', icon: BarChart3, iconColor: 'text-blue-600', title: 'Ad Campaign', description: 'Spend smart.', prompt: 'Create a paid advertising strategy with budget allocation' },
      { id: 'event', icon: Calendar, iconColor: 'text-purple-500', title: 'Event Plan', description: 'Moments that matter.', prompt: 'Plan a virtual launch event with timeline and promotion strategy' },
      { id: 'rebrand', icon: Sparkles, iconColor: 'text-orange-500', title: 'Rebrand Plan', description: 'Evolve boldly.', prompt: 'Create a complete rebranding strategy and rollout plan' },
      { id: 'retention', icon: Lightbulb, iconColor: 'text-green-500', title: 'Retention Plan', description: 'Keep them coming.', prompt: 'Design a customer retention strategy with loyalty programs' },
    ],
    [
      { id: 'quarterly', icon: Calendar, iconColor: 'text-cyan-500', title: 'Quarterly Goals', description: 'Plan your wins.', prompt: 'Create a quarterly goal-setting framework with OKRs for my business' },
      { id: 'partnership', icon: Users, iconColor: 'text-violet-600', title: 'Partnership Plan', description: 'Strategic alliances.', prompt: 'Develop a partnership outreach strategy with target brands and influencers' },
      { id: 'content-pillars', icon: FileText, iconColor: 'text-blue-500', title: 'Content Pillars', description: 'Foundation for growth.', prompt: 'Define 5 core content pillars with themes and posting frequency' },
      { id: 'monetization', icon: BarChart3, iconColor: 'text-emerald-600', title: 'Monetization Plan', description: 'Revenue streams.', prompt: 'Create a diversified monetization strategy with multiple income streams' },
      { id: 'community', icon: Users, iconColor: 'text-pink-600', title: 'Community Building', description: 'Cultivate connection.', prompt: 'Design a community building strategy with engagement tactics' },
      { id: 'crisis', icon: Zap, iconColor: 'text-red-600', title: 'Crisis Plan', description: 'Prepare for anything.', prompt: 'Create a crisis management plan with response protocols' },
    ],
    [
      { id: 'annual', icon: Calendar, iconColor: 'text-indigo-600', title: 'Annual Strategy', description: 'Year of growth.', prompt: 'Build a comprehensive annual marketing strategy with quarterly milestones' },
      { id: 'influencer-plan', icon: Sparkles, iconColor: 'text-amber-600', title: 'Influencer Campaign', description: 'Leverage influence.', prompt: 'Plan an influencer marketing campaign with selection criteria and deliverables' },
      { id: 'seo', icon: Search, iconColor: 'text-green-600', title: 'SEO Strategy', description: 'Organic growth.', prompt: 'Create a 6-month SEO strategy with content and backlink planning' },
      { id: 'product-roadmap', icon: Target, iconColor: 'text-purple-600', title: 'Product Roadmap', description: 'Build with purpose.', prompt: 'Design a product development roadmap with feature prioritization' },
      { id: 'budget', icon: BarChart3, iconColor: 'text-teal-600', title: 'Budget Planning', description: 'Allocate wisely.', prompt: 'Create a detailed marketing budget with allocation across channels' },
      { id: 'kpi', icon: TrendingUp, iconColor: 'text-orange-600', title: 'KPI Framework', description: 'Track success.', prompt: 'Design a KPI dashboard with metrics aligned to business goals' },
    ],
  ],
  Automate: [
    [
      { id: 'autopost', icon: Calendar, iconColor: 'text-blue-500', title: 'Auto-Post', description: 'Set it and forget it.', prompt: 'Set up automated posting schedule for all my social media accounts' },
      { id: 'airesponse', icon: Bot, iconColor: 'text-violet-500', title: 'AI Responses', description: 'Engage 24/7.', prompt: 'Create automated response templates for common customer inquiries' },
      { id: 'lead', icon: Target, iconColor: 'text-red-500', title: 'Lead Capture', description: 'Grow while you sleep.', prompt: 'Build an automated lead generation funnel with email follow-ups' },
      { id: 'repurpose', icon: Zap, iconColor: 'text-amber-500', title: 'Content Repurpose', description: 'One piece, endless reach.', prompt: 'Automatically repurpose my long-form content into shorts, posts, and threads' },
      { id: 'analytics', icon: BarChart3, iconColor: 'text-emerald-500', title: 'Analytics Reports', description: 'Insights on autopilot.', prompt: 'Set up weekly automated performance reports for all my channels' },
      { id: 'workflow', icon: Lightbulb, iconColor: 'text-cyan-500', title: 'Workflow Builder', description: 'Streamline everything.', prompt: 'Create a content creation workflow that automates repetitive tasks' },
    ],
    [
      { id: 'drip', icon: Mail, iconColor: 'text-pink-500', title: 'Drip Campaigns', description: 'Nurture on repeat.', prompt: 'Set up automated email drip campaigns for different customer segments' },
      { id: 'chatbot', icon: Bot, iconColor: 'text-blue-600', title: 'AI Chatbot', description: 'Support that scales.', prompt: 'Create an AI chatbot to handle customer inquiries automatically' },
      { id: 'invoice', icon: FileText, iconColor: 'text-green-500', title: 'Auto-Invoice', description: 'Get paid faster.', prompt: 'Set up automated invoicing and payment reminders' },
      { id: 'backup', icon: Zap, iconColor: 'text-slate-600', title: 'Content Backup', description: 'Never lose work.', prompt: 'Automate content backup and archiving across platforms' },
      { id: 'review', icon: Sparkles, iconColor: 'text-amber-500', title: 'Review Requests', description: 'Social proof on auto.', prompt: 'Set up automated review request emails after purchase' },
      { id: 'onboard', icon: Users, iconColor: 'text-purple-500', title: 'Auto-Onboarding', description: 'Welcome effortlessly.', prompt: 'Create an automated onboarding sequence for new customers' },
    ],
    [
      { id: 'social-listen', icon: Search, iconColor: 'text-teal-500', title: 'Social Listening', description: 'Never miss a mention.', prompt: 'Set up automated social listening alerts for brand mentions and keywords' },
      { id: 'content-queue', icon: Calendar, iconColor: 'text-violet-600', title: 'Content Queue', description: 'Endless content flow.', prompt: 'Build an automated content queue that never runs dry' },
      { id: 'ab-testing', icon: BarChart3, iconColor: 'text-rose-500', title: 'A/B Testing', description: 'Optimize automatically.', prompt: 'Set up automated A/B testing for email subject lines and content' },
      { id: 'upsell', icon: TrendingUp, iconColor: 'text-emerald-600', title: 'Auto-Upsell', description: 'Maximize value.', prompt: 'Create automated upsell and cross-sell sequences after purchase' },
      { id: 'birthday', icon: Sparkles, iconColor: 'text-pink-600', title: 'Birthday Campaigns', description: 'Personal touch at scale.', prompt: 'Set up automated birthday and anniversary emails for customers' },
      { id: 'win-back', icon: Mail, iconColor: 'text-orange-600', title: 'Win-Back Emails', description: 'Recover lost customers.', prompt: 'Create automated win-back email campaigns for inactive subscribers' },
    ],
    [
      { id: 'lead-scoring', icon: Target, iconColor: 'text-indigo-600', title: 'Lead Scoring', description: 'Prioritize automatically.', prompt: 'Set up automated lead scoring based on engagement and behavior' },
      { id: 'content-recycle', icon: Zap, iconColor: 'text-cyan-600', title: 'Content Recycling', description: 'Evergreen on autopilot.', prompt: 'Automate recycling of top-performing evergreen content' },
      { id: 'feedback', icon: Users, iconColor: 'text-blue-500', title: 'Feedback Collection', description: 'Insights without effort.', prompt: 'Set up automated feedback collection at key customer touchpoints' },
      { id: 'affiliate', icon: BarChart3, iconColor: 'text-green-600', title: 'Affiliate Tracking', description: 'Commissions automated.', prompt: 'Automate affiliate tracking, reporting, and commission payouts' },
      { id: 'event-follow', icon: Calendar, iconColor: 'text-purple-600', title: 'Event Follow-ups', description: 'Post-event engagement.', prompt: 'Create automated follow-up sequences after webinars and events' },
      { id: 'segmentation', icon: Users, iconColor: 'text-amber-600', title: 'Auto-Segmentation', description: 'Smart audience groups.', prompt: 'Set up automated audience segmentation based on behavior and preferences' },
    ],
  ],
};

interface AISuggestionsGridProps {
  intent: string | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const AISuggestionsGrid = ({ intent, onSuggestionClick }: AISuggestionsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [shuffledSuggestions, setShuffledSuggestions] = useState<Suggestion[] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Reset page and shuffled suggestions when intent changes
  useEffect(() => {
    setCurrentPage(0);
    setShuffledSuggestions(null);
    setShuffleKey(0);
  }, [intent]);

  // Don't render if no intent is selected
  if (!intent) {
    return null;
  }

  const intentKey = intent;
  const pages = suggestionsByIntent[intentKey] || suggestionsByIntent.Create;
  const allSuggestions = pages.flat();
  const totalPages = pages.length;
  
  // Use shuffled suggestions if available, otherwise use paged suggestions
  const currentSuggestions = shuffledSuggestions || pages[currentPage] || pages[0];

  const handlePrev = () => {
    setShuffledSuggestions(null); // Clear shuffled state when using arrows
    setShuffleKey(0);
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setShuffledSuggestions(null); // Clear shuffled state when using arrows
    setShuffleKey(0);
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleNewIdea = () => {
    // Start spin animation
    setIsSpinning(true);
    
    // Shuffle all suggestions for this intent and take first 6
    const shuffled = shuffleArray(allSuggestions).slice(0, 6);
    setShuffledSuggestions(shuffled);
    setShuffleKey(prev => prev + 1); // Force re-render with new key
    
    // Stop spin animation after 500ms
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div className="w-full mx-auto mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700">
          Not Sure Where To Start? Try One Of These...
        </h3>
        <div className="flex items-center gap-2">
          <IconTooltip label="More Ideas" side="top">
            <button
              onClick={handleNewIdea}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="New idea"
            >
              <RefreshCw 
                size={16} 
                className={`text-slate-600 transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`} 
              />
            </button>
          </IconTooltip>
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Previous suggestions"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Next suggestions"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentSuggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={`${suggestion.id}-${shuffleKey}`}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <IconComponent size={18} className={suggestion.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 text-sm">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {suggestion.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AISuggestionsGrid;
