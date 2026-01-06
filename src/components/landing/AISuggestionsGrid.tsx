import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, Headphones, FileText, Camera, Sparkles, Music, Mic, BookOpen, BarChart, Users, RefreshCw, PenTool, Layers, Search, Kanban, Zap, Mail, Clock, Target, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Suggestion {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
  imageUrl?: string;
}

interface IntentSuggestions {
  [key: string]: Suggestion[][];
}

// Suggestions organized by intent, with multiple pages (each page is 6 items)
const suggestionsByIntent: IntentSuggestions = {
  Create: [
    [
      { id: 'video-story', icon: Video, iconColor: 'text-blue-500', title: 'Video Story', description: 'Engaging video narratives', prompt: 'Create a 60-second video story about a day in the life of a coffee shop owner', imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=100&h=100&fit=crop' },
      { id: 'ai-image', icon: Image, iconColor: 'text-violet-500', title: 'AI Image', description: 'Stunning AI visuals', prompt: 'Generate a futuristic cityscape at sunset with flying cars and neon lights', imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop' },
      { id: 'music-track', icon: Music, iconColor: 'text-pink-500', title: 'Music Track', description: 'Custom music', prompt: 'Compose an upbeat electronic track perfect for a tech product launch video', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop' },
      { id: 'voiceover', icon: Mic, iconColor: 'text-emerald-500', title: 'Voiceover', description: 'Natural AI voice', prompt: 'Create a warm, professional voiceover for a wellness brand commercial', imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&h=100&fit=crop' },
      { id: 'photoshoot', icon: Camera, iconColor: 'text-amber-500', title: 'AI Photoshoot', description: 'Pro photoshoots', prompt: 'Generate a professional headshot photoshoot for a tech startup CEO', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=100&h=100&fit=crop' },
      { id: 'ebook', icon: BookOpen, iconColor: 'text-indigo-500', title: 'Ebook', description: 'Complete ebooks', prompt: 'Write an ebook about 10 productivity habits for remote workers', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop' },
    ],
    [
      { id: 'avatar-video', icon: Users, iconColor: 'text-cyan-500', title: 'Avatar Video', description: 'AI avatar videos', prompt: 'Create an avatar video explaining our new product features', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
      { id: 'podcast', icon: Headphones, iconColor: 'text-orange-500', title: 'Podcast', description: 'AI podcasts', prompt: 'Generate a 5-minute podcast episode about AI trends in 2025', imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&h=100&fit=crop' },
      { id: 'presentation', icon: BarChart, iconColor: 'text-blue-500', title: 'Presentation', description: 'Slide decks', prompt: 'Build a 10-slide investor pitch deck for a SaaS startup', imageUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&h=100&fit=crop' },
      { id: 'batch-images', icon: Layers, iconColor: 'text-green-500', title: 'Batch Images', description: 'Multiple images', prompt: 'Generate 6 product mockup images for an eco-friendly water bottle', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
      { id: 'lip-sync', icon: PenTool, iconColor: 'text-red-500', title: 'Lip-Sync', description: 'Sync lips to audio', prompt: 'Create a lip-sync video of my avatar speaking this script', imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop' },
      { id: 'revoice', icon: RefreshCw, iconColor: 'text-teal-500', title: 'Revoice', description: 'Change voice', prompt: 'Revoice this audio with a British female voice', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop' },
    ],
  ],
  Research: [
    [
      { id: 'market-research', icon: TrendingUp, iconColor: 'text-blue-500', title: 'Market Research', description: 'Market analysis', prompt: 'Research the current market size and trends for sustainable fashion', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop' },
      { id: 'audience-insights', icon: Users, iconColor: 'text-violet-500', title: 'Audience Insights', description: 'Target audience', prompt: 'Analyze the demographics and behaviors of Gen Z consumers', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop' },
      { id: 'trend-analysis', icon: BarChart, iconColor: 'text-emerald-500', title: 'Trend Analysis', description: 'Emerging trends', prompt: 'Identify the top 5 emerging trends in AI technology for 2025', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
      { id: 'competitor-intel', icon: Target, iconColor: 'text-amber-500', title: 'Competitor Intel', description: 'Competition research', prompt: 'Research and compare the top 3 competitors in the meal kit industry', imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop' },
      { id: 'keyword-research', icon: Search, iconColor: 'text-pink-500', title: 'Keyword Research', description: 'SEO keywords', prompt: 'Find the best keywords for ranking a fitness coaching website', imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=100&h=100&fit=crop' },
      { id: 'industry-report', icon: FileText, iconColor: 'text-indigo-500', title: 'Industry Report', description: 'Full reports', prompt: 'Generate a comprehensive report on the electric vehicle industry', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop' },
    ],
  ],
  Plan: [
    [
      { id: 'content-calendar', icon: Clock, iconColor: 'text-blue-500', title: 'Content Calendar', description: 'Content schedule', prompt: 'Create a 30-day content calendar for Instagram for a fitness brand', imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=100&h=100&fit=crop' },
      { id: 'campaign-strategy', icon: Target, iconColor: 'text-violet-500', title: 'Campaign Strategy', description: 'Marketing campaigns', prompt: 'Plan a product launch campaign for a new skincare line', imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=100&h=100&fit=crop' },
      { id: 'project-roadmap', icon: Kanban, iconColor: 'text-emerald-500', title: 'Project Roadmap', description: 'Project milestones', prompt: 'Create a 6-month roadmap for launching a mobile app', imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=100&h=100&fit=crop' },
      { id: 'social-strategy', icon: Users, iconColor: 'text-pink-500', title: 'Social Strategy', description: 'Social media plan', prompt: 'Develop a social media strategy to grow from 1K to 10K followers', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
      { id: 'launch-plan', icon: Sparkles, iconColor: 'text-amber-500', title: 'Launch Plan', description: 'Product launches', prompt: 'Plan a step-by-step product launch for an online course', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop' },
      { id: 'growth-strategy', icon: TrendingUp, iconColor: 'text-indigo-500', title: 'Growth Strategy', description: 'Growth tactics', prompt: 'Create a growth strategy to double our user base in 6 months', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop' },
    ],
  ],
  Automate: [
    [
      { id: 'email-sequences', icon: Mail, iconColor: 'text-blue-500', title: 'Email Sequences', description: 'Email automation', prompt: 'Set up a 5-email welcome sequence for new subscribers', imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=100&h=100&fit=crop' },
      { id: 'content-pipeline', icon: RefreshCw, iconColor: 'text-violet-500', title: 'Content Pipeline', description: 'Auto content', prompt: 'Automate weekly blog post creation and social media distribution', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
      { id: 'social-posting', icon: Clock, iconColor: 'text-emerald-500', title: 'Social Posting', description: 'Scheduled posts', prompt: 'Schedule 2 weeks of social media posts across all platforms', imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop' },
      { id: 'lead-nurturing', icon: Users, iconColor: 'text-pink-500', title: 'Lead Nurturing', description: 'Lead follow-ups', prompt: 'Create an automated lead nurturing workflow for sales prospects', imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=100&h=100&fit=crop' },
      { id: 'workflow-builder', icon: Zap, iconColor: 'text-amber-500', title: 'Workflow Builder', description: 'Custom workflows', prompt: 'Build a workflow to auto-respond to customer inquiries', imageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=100&h=100&fit=crop' },
      { id: 'report-generation', icon: FileText, iconColor: 'text-indigo-500', title: 'Auto Reports', description: 'Generate reports', prompt: 'Automate weekly analytics reports sent to my inbox every Monday', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
    ],
  ],
};

interface AISuggestionsGridProps {
  intent: string | null;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const AISuggestionsGrid = ({ intent, onSuggestionClick }: AISuggestionsGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Get suggestions for current intent, default to Create
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

  // Reset page when intent changes
  const handleIntentChange = () => {
    setCurrentPage(0);
  };

  return (
    <div className="w-full mx-auto mt-6">
      {/* Header with arrows */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700">
          Not Sure Where To Start? Try One Of These
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

      {/* Grid of suggestions - 2 rows x 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentSuggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all text-left group"
          >
            {/* Thumbnail image */}
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
              {suggestion.imageUrl ? (
                <img
                  src={suggestion.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${suggestion.iconColor}`}>
                  <suggestion.icon size={18} />
                </div>
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 text-sm mb-0.5 group-hover:text-emerald-600 transition-colors">
                {suggestion.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1">
                {suggestion.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISuggestionsGrid;
