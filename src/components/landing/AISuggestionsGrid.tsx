import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, FileText, Sparkles, Music, Mic, Search, BarChart3, Lightbulb, Calendar, Zap, Target, TrendingUp, Users, Mail, Bot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Suggestion {
  id: string;
  icon: LucideIcon;
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
      { id: 'video', icon: Video, title: 'AI Video', description: 'Stunning visuals in seconds.', prompt: 'Create a cinematic 30-second video showcasing a luxury product with dramatic lighting and smooth camera movements' },
      { id: 'social', icon: Sparkles, title: 'Social Content', description: 'Posts that stop the scroll.', prompt: 'Generate a week of engaging Instagram posts for a wellness brand with captions and hashtags' },
      { id: 'image', icon: Image, title: 'AI Images', description: 'Visuals that captivate.', prompt: 'Create a photorealistic product image with professional studio lighting and modern aesthetic' },
      { id: 'music', icon: Music, title: 'Custom Music', description: 'Sounds that move souls.', prompt: 'Compose an uplifting background track for a brand video, 60 seconds, modern and inspiring' },
      { id: 'voice', icon: Mic, title: 'Voice Clone', description: 'Your voice, everywhere.', prompt: 'Clone my voice for creating professional voiceovers for my content' },
      { id: 'blog', icon: FileText, title: 'Blog Article', description: 'Words that convert.', prompt: 'Write a 1500-word SEO-optimized blog post about sustainable living tips' },
    ],
  ],
  Research: [
    [
      { id: 'market', icon: Search, title: 'Market Analysis', description: 'Know your battlefield.', prompt: 'Analyze the current market trends and competitive landscape for the wellness industry' },
      { id: 'trends', icon: TrendingUp, title: 'Trend Finder', description: "Spot what's next.", prompt: 'Identify emerging trends in social media marketing for 2026' },
      { id: 'competitor', icon: Target, title: 'Competitor Intel', description: 'Learn their secrets.', prompt: 'Research top 5 competitors in my niche and analyze their content strategies' },
      { id: 'audience', icon: Users, title: 'Audience Insights', description: 'Understand their desires.', prompt: 'Create detailed buyer personas for a luxury skincare brand' },
      { id: 'report', icon: BarChart3, title: 'Industry Report', description: 'Data that decides.', prompt: 'Generate a comprehensive industry report on the creator economy' },
      { id: 'gaps', icon: Lightbulb, title: 'Content Gaps', description: 'Find the whitespace.', prompt: 'Identify untapped content opportunities in the fitness coaching space' },
    ],
  ],
  Plan: [
    [
      { id: 'calendar', icon: Calendar, title: 'Content Calendar', description: 'Never miss a moment.', prompt: 'Create a 30-day content calendar for Instagram and TikTok for a fashion brand' },
      { id: 'campaign', icon: Target, title: 'Campaign Strategy', description: 'Roadmap to results.', prompt: 'Design a product launch campaign strategy with timeline and milestones' },
      { id: 'growth', icon: TrendingUp, title: 'Growth Blueprint', description: 'Scale with precision.', prompt: 'Build a 90-day growth plan to increase social media following by 50%' },
      { id: 'email', icon: Mail, title: 'Email Sequence', description: 'Nurture to conversion.', prompt: 'Plan a 7-email welcome sequence for new subscribers' },
      { id: 'launch', icon: Zap, title: 'Launch Timeline', description: 'Execute flawlessly.', prompt: 'Create a detailed product launch timeline with daily tasks and checkpoints' },
      { id: 'brand', icon: Sparkles, title: 'Brand Strategy', description: 'Define your empire.', prompt: 'Develop a comprehensive brand positioning strategy and messaging framework' },
    ],
  ],
  Automate: [
    [
      { id: 'autopost', icon: Calendar, title: 'Auto-Post', description: 'Set it and forget it.', prompt: 'Set up automated posting schedule for all my social media accounts' },
      { id: 'airesponse', icon: Bot, title: 'AI Responses', description: 'Engage 24/7.', prompt: 'Create automated response templates for common customer inquiries' },
      { id: 'lead', icon: Target, title: 'Lead Capture', description: 'Grow while you sleep.', prompt: 'Build an automated lead generation funnel with email follow-ups' },
      { id: 'repurpose', icon: Zap, title: 'Content Repurpose', description: 'One piece, endless reach.', prompt: 'Automatically repurpose my long-form content into shorts, posts, and threads' },
      { id: 'analytics', icon: BarChart3, title: 'Analytics Reports', description: 'Insights on autopilot.', prompt: 'Set up weekly automated performance reports for all my channels' },
      { id: 'workflow', icon: Lightbulb, title: 'Workflow Builder', description: 'Streamline everything.', prompt: 'Create a content creation workflow that automates repetitive tasks' },
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
        <h3 className="text-sm font-medium text-muted-foreground">
          Not Sure Where To Start? Try One Of These...
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
              aria-label="Previous suggestions"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
              aria-label="Next suggestions"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
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
              className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-xl hover:bg-muted hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <IconComponent size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-muted-foreground">
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
