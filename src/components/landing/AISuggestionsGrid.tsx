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
  ],
};

interface AISuggestionsGridProps {
  intent: string | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const AISuggestionsGrid = ({ intent, onSuggestionClick }: AISuggestionsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const intentKey = intent || 'Create';
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
