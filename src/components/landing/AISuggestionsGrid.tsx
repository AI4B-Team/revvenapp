import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Image, Headphones, FileText, Camera, Sparkles, Music, Mic, BookOpen, BarChart, Users, RefreshCw, PenTool, Layers, Search, Kanban, Zap, Mail, Clock, Target, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Suggestion {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface IntentSuggestions {
  [key: string]: Suggestion[][];
}

// Suggestions organized by intent, with multiple pages (each page is 6 items)
const suggestionsByIntent: IntentSuggestions = {
  Create: [
    [
      { id: 'video-story', icon: Video, iconColor: 'text-blue-500', title: 'Create a Video Story', description: 'Turn your ideas into engaging video narratives', imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=100&h=100&fit=crop' },
      { id: 'ai-image', icon: Image, iconColor: 'text-violet-500', title: 'Generate AI Images', description: 'Create stunning visuals with AI', imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop' },
      { id: 'music-track', icon: Music, iconColor: 'text-pink-500', title: 'Compose Music', description: 'Generate custom music tracks', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop' },
      { id: 'voiceover', icon: Mic, iconColor: 'text-emerald-500', title: 'Create Voiceovers', description: 'Generate natural AI voiceovers', imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&h=100&fit=crop' },
      { id: 'photoshoot', icon: Camera, iconColor: 'text-amber-500', title: 'AI Photoshoot', description: 'Create professional photoshoots', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=100&h=100&fit=crop' },
      { id: 'ebook', icon: BookOpen, iconColor: 'text-indigo-500', title: 'Write an Ebook', description: 'Create complete ebooks with AI', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop' },
    ],
    [
      { id: 'avatar-video', icon: Users, iconColor: 'text-cyan-500', title: 'Avatar Video', description: 'Create videos with AI avatars', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
      { id: 'podcast', icon: Headphones, iconColor: 'text-orange-500', title: 'Generate Podcast', description: 'Create AI-powered podcasts', imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&h=100&fit=crop' },
      { id: 'presentation', icon: BarChart, iconColor: 'text-blue-500', title: 'Build Presentation', description: 'Create stunning slide decks', imageUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&h=100&fit=crop' },
      { id: 'batch-images', icon: Layers, iconColor: 'text-green-500', title: 'Batch Generate', description: 'Create multiple images at once', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
      { id: 'lip-sync', icon: PenTool, iconColor: 'text-red-500', title: 'Lip-Sync Video', description: 'Sync lips to any audio', imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop' },
      { id: 'revoice', icon: RefreshCw, iconColor: 'text-teal-500', title: 'Revoice Audio', description: 'Change voice in any audio', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop' },
    ],
  ],
  Research: [
    [
      { id: 'market-research', icon: TrendingUp, iconColor: 'text-blue-500', title: 'Market Research', description: 'Analyze market trends and competitors', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop' },
      { id: 'audience-insights', icon: Users, iconColor: 'text-violet-500', title: 'Audience Insights', description: 'Understand your target audience', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop' },
      { id: 'trend-analysis', icon: BarChart, iconColor: 'text-emerald-500', title: 'Trend Analysis', description: 'Discover emerging trends', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
      { id: 'competitor-intel', icon: Target, iconColor: 'text-amber-500', title: 'Competitor Intel', description: 'Research competitor strategies', imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop' },
      { id: 'keyword-research', icon: Search, iconColor: 'text-pink-500', title: 'Keyword Research', description: 'Find high-impact keywords', imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=100&h=100&fit=crop' },
      { id: 'industry-report', icon: FileText, iconColor: 'text-indigo-500', title: 'Industry Report', description: 'Generate comprehensive reports', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop' },
    ],
  ],
  Plan: [
    [
      { id: 'content-calendar', icon: Clock, iconColor: 'text-blue-500', title: 'Content Calendar', description: 'Plan your content schedule', imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=100&h=100&fit=crop' },
      { id: 'campaign-strategy', icon: Target, iconColor: 'text-violet-500', title: 'Campaign Strategy', description: 'Plan marketing campaigns', imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=100&h=100&fit=crop' },
      { id: 'project-roadmap', icon: Kanban, iconColor: 'text-emerald-500', title: 'Project Roadmap', description: 'Map out project milestones', imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=100&h=100&fit=crop' },
      { id: 'social-strategy', icon: Users, iconColor: 'text-pink-500', title: 'Social Strategy', description: 'Plan social media presence', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
      { id: 'launch-plan', icon: Sparkles, iconColor: 'text-amber-500', title: 'Launch Plan', description: 'Plan product launches', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop' },
      { id: 'growth-strategy', icon: TrendingUp, iconColor: 'text-indigo-500', title: 'Growth Strategy', description: 'Map out growth tactics', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop' },
    ],
  ],
  Automate: [
    [
      { id: 'email-sequences', icon: Mail, iconColor: 'text-blue-500', title: 'Email Sequences', description: 'Automate email campaigns', imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=100&h=100&fit=crop' },
      { id: 'content-pipeline', icon: RefreshCw, iconColor: 'text-violet-500', title: 'Content Pipeline', description: 'Automate content creation', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
      { id: 'social-posting', icon: Clock, iconColor: 'text-emerald-500', title: 'Social Posting', description: 'Schedule social media posts', imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop' },
      { id: 'lead-nurturing', icon: Users, iconColor: 'text-pink-500', title: 'Lead Nurturing', description: 'Automate lead follow-ups', imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=100&h=100&fit=crop' },
      { id: 'workflow-builder', icon: Zap, iconColor: 'text-amber-500', title: 'Workflow Builder', description: 'Create custom automations', imageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=100&h=100&fit=crop' },
      { id: 'report-generation', icon: FileText, iconColor: 'text-indigo-500', title: 'Report Generation', description: 'Auto-generate reports', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
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
    <div className="w-full mx-auto mt-8">
      {/* Header with arrows */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-700">
          Not Sure Where To Start? Try One Of These
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Previous suggestions"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Next suggestions"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* Grid of suggestions - 2 rows x 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentSuggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left group"
          >
            {/* Thumbnail image */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
              {suggestion.imageUrl ? (
                <img
                  src={suggestion.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${suggestion.iconColor}`}>
                  <suggestion.icon size={20} />
                </div>
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 text-sm mb-0.5 truncate group-hover:text-emerald-600 transition-colors">
                {suggestion.title}
              </h4>
              <p className="text-xs text-slate-500 truncate">
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
