import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, FileText, Sparkles, Music, Mic, Search, BarChart3, Lightbulb, Calendar, Zap, Target, TrendingUp, Users, Mail, Bot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  ],
};

interface AISuggestionsGridProps {
  intent: string | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const AISuggestionsGrid = ({ intent, onSuggestionClick }: AISuggestionsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Don't render if no intent is selected
  if (!intent) {
    return null;
  }

  const intentKey = intent;
  const pages = suggestionsByIntent[intentKey] || suggestionsByIntent.Create;
  const totalPages = pages.length;
  const currentSuggestions = pages[currentPage] || pages[0];

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [intent]);

  return (
    <div className="w-full mx-auto mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700">
          Not Sure Where To Start? Try One Of These...
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Previous suggestions"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Next suggestions"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentSuggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={suggestion.id}
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
