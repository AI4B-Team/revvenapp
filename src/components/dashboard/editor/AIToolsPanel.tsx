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
    { id: '1', icon: Sparkles, title: 'Auto-enhance', description: 'One-click optimization for audio, pacing, and visual quality' },
    { id: '2', icon: AudioLines, title: 'Studio Sound', description: 'Remove background noise & enhance voice clarity' },
    { id: '3', icon: Film, title: 'Create clips', description: 'AI picks your most viral-worthy moments & creates clips' },
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
          { icon: AudioLines, label: 'Studio Sound' },
          { icon: VolumeX, label: 'Clean up speech' },
          { icon: ArrowLeftRight, label: 'Tighten pacing' },
          { icon: Mic, label: 'Voice isolation' },
          { icon: Sliders, label: 'Audio leveling' },
          { icon: ListOrdered, label: 'Auto chapters' },
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
          { icon: Eye, label: 'Eye Contact' },
          { icon: Camera, label: 'Face tracking' },
          { icon: Blend, label: 'Background blur', badge: 'Beta' },
          { icon: Tv, label: 'Virtual backdrop' },
          { icon: Smile, label: 'Beauty mode' },
          { icon: Maximize2, label: 'Auto-crop & zoom' },
          { icon: Grid, label: 'Multicam sync', badge: 'Beta' },
        ].map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            onClick={() => handleToolClick(label)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{label}</span>
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
          { icon: Film, label: 'Smart clips' },
          { icon: Star, label: 'Highlight reel' },
          { icon: Languages, label: 'Translate & dub', highlighted: true },
          { icon: Layout, label: 'Resize for socials' },
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
          { icon: Type, label: 'Generate title' },
          { icon: AlignLeft, label: 'Summarize' },
          { icon: Youtube, label: 'YouTube SEO' },
          { icon: Share2, label: 'Social captions' },
          { icon: Newspaper, label: 'Blog post' },
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

      {/* Generate Section */}
      <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generate</span>
      </div>

      <div className="divide-y divide-gray-50">
        {[
          { icon: ImageIcon, label: 'AI Image' },
          { icon: Video, label: 'AI Video' },
          { icon: Mic, label: 'AI Voiceover' },
          { icon: Captions, label: 'AI Captions' },
          { icon: Users, label: 'AI Avatar' },
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
