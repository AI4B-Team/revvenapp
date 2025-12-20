import React, { useState } from 'react';
import { 
  Mic, 
  VolumeX, 
  Eye, 
  Maximize2, 
  Eraser, 
  Smile, 
  Tv, 
  Captions, 
  Sparkles, 
  ArrowLeftRight, 
  ImageIcon, 
  Users, 
  AudioLines, 
  Video, 
  Languages,
  ChevronDown,
  ChevronUp,
  Play,
  Sliders,
  X,
  Scissors,
  FileText,
  PenTool,
  MessageSquare,
  Lightbulb,
  Layout,
  Film,
  Search,
  Star,
  Type,
  AlignLeft,
  RotateCw,
  BookOpen,
  Youtube,
  Share2,
  Newspaper,
  ListOrdered,
  Camera,
  Grid,
  Blend,
  Wand2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface AIToolsPanelProps {
  onToolAction?: (action: string, settings?: any) => void;
}

interface RecommendedItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  dismissed?: boolean;
}

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({ onToolAction }) => {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteSilencesOpen, setDeleteSilencesOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState<'short' | 'long' | 'custom'>('short');
  const [customSilenceThreshold, setCustomSilenceThreshold] = useState(0.7);
  
  // Recommended items state
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>([
    { id: '1', icon: Scissors, title: 'Edit for clarity', description: 'Remove filler words, digressions, blather — all the obvious cuts' },
    { id: '2', icon: VolumeX, title: 'Remove filler words', description: 'Remove uhms, uhs, repeated words, and other verbal clutter' },
    { id: '3', icon: ArrowLeftRight, title: 'Shorten word gaps', description: 'Shrink or cut silences & lapses in conversation' },
    { id: '4', icon: AudioLines, title: 'Studio Sound', description: 'Remove background noise & enhance voices' },
    { id: '5', icon: Film, title: 'Create clips', description: 'AI Tools picks your most viral-worthy moments & creates clips that pop' },
  ]);

  const dismissRecommended = (id: string) => {
    setRecommendedItems(prev => prev.filter(item => item.id !== id));
    toast.success('Recommendation dismissed');
  };

  const handleToolClick = (tool: string) => {
    toast.success(`Opening ${tool}...`);
    onToolAction?.(tool.toLowerCase().replace(/\s+/g, '-'), {});
  };

  const visibleRecommendations = recommendedItems.filter(item => !item.dismissed);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Recommended Section */}
      {visibleRecommendations.length > 0 && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Recommended</span>
            <button 
              onClick={() => setRecommendedItems([])}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {visibleRecommendations.map((item) => (
              <button
                key={item.id}
                onClick={() => handleToolClick(item.title)}
                className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left group"
              >
                <item.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismissRecommended(item.id); }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Sound Good Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sound good</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: Scissors, label: 'Edit for clarity' },
          { icon: AudioLines, label: 'Studio Sound' },
          { icon: VolumeX, label: 'Remove filler words' },
          { icon: RotateCw, label: 'Remove retakes' },
          { icon: ArrowLeftRight, label: 'Shorten word gaps' },
          { icon: ListOrdered, label: 'Add chapters' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleToolClick(label)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {/* Look Good Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Look good</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: Wand2, label: 'Quick design', disabled: true },
          { icon: Eye, label: 'Eye Contact' },
          { icon: Users, label: 'Center active speaker', badge: 'Beta' },
          { icon: Tv, label: 'Green screen' },
          { icon: Grid, label: 'Automatic multicam', disabled: true },
          { icon: ImageIcon, label: 'Generate an image' },
          { icon: Video, label: 'Generate a video' },
          { icon: Blend, label: 'Blur speaker background', badge: 'Beta' },
        ].map(({ icon: Icon, label, badge, disabled }) => (
          <button
            key={label}
            onClick={() => !disabled && handleToolClick(label)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
            {badge && (
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-500 font-normal">
                {badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Repurpose Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repurpose</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: Film, label: 'Create clips' },
          { icon: Star, label: 'Create highlight reel' },
          { icon: Search, label: 'Find highlights' },
          { icon: Languages, label: 'Translate', highlighted: true },
        ].map(({ icon: Icon, label, highlighted }) => (
          <button
            key={label}
            onClick={() => handleToolClick(label)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
              highlighted ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${highlighted ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${highlighted ? 'text-amber-800 font-medium' : 'text-gray-700'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Publish Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publish</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: Type, label: 'Draft a title' },
          { icon: AlignLeft, label: 'Summarize' },
          { icon: FileText, label: 'Draft show notes' },
          { icon: Youtube, label: 'Draft YouTube description' },
          { icon: Share2, label: 'Draft a social post' },
          { icon: Newspaper, label: 'Draft a blog post' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleToolClick(label)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {/* Write Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Write</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: Lightbulb, label: 'Brainstorm' },
          { icon: PenTool, label: 'Write a script' },
          { icon: BookOpen, label: 'Write an outline' },
          { icon: RotateCw, label: 'Rewrite' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleToolClick(label)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {/* Show Deleted Toggle - at bottom */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-auto bg-gray-50">
        <span className="text-sm font-medium text-gray-600">Show deleted</span>
        <Switch 
          checked={showDeleted} 
          onCheckedChange={(v) => {
            setShowDeleted(v);
            onToolAction?.('show-deleted', { enabled: v });
          }}
        />
      </div>
    </div>
  );
};

export default AIToolsPanel;
