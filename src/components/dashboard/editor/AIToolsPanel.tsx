import React, { useState } from 'react';
import { 
  Mic, 
  VolumeX, 
  Eye, 
  Maximize2, 
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
  X,
  Film,
  Star,
  Type,
  AlignLeft,
  Youtube,
  Share2,
  Newspaper,
  Camera,
  Grid,
  Blend,
  Layout
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface AIToolsPanelProps {
  onToolAction?: (action: string, settings?: any) => void;
}

interface ToolItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  badge?: string;
  highlighted?: boolean;
}

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({ onToolAction }) => {
  const [showDeleted, setShowDeleted] = useState(false);

  const handleToolClick = (tool: string) => {
    toast.success(`Opening ${tool}...`);
    onToolAction?.(tool.toLowerCase().replace(/\s+/g, '-'), {});
  };

  const renderToolButton = (item: ToolItem) => {
    const Icon = item.icon;
    return (
      <button
        key={item.label}
        onClick={() => handleToolClick(item.label)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
          item.highlighted 
            ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' 
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        <Icon className={`w-4 h-4 ${item.highlighted ? 'text-amber-600' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${item.highlighted ? 'text-amber-800' : 'text-gray-900'}`}>
            {item.label}
          </p>
          {item.description && (
            <p className="text-xs text-gray-500">{item.description}</p>
          )}
        </div>
        {item.badge && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-violet-100 text-violet-600 font-normal">
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
      </div>

      {/* Audio Suite Section */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Audio Suite</h3>
        
        {[
          { icon: AudioLines, label: 'Studio Sound', description: 'Remove noise & enhance voice clarity' },
          { icon: VolumeX, label: 'Clean up speech', description: 'Remove filler words and hesitations' },
          { icon: ArrowLeftRight, label: 'Tighten pacing', description: 'Reduce pauses and dead air' },
          { icon: Mic, label: 'Voice isolation', description: 'Separate voice from background' },
        ].map(renderToolButton)}
      </div>

      {/* Visual Lab Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Visual Lab</h3>
        
        {[
          { icon: Eye, label: 'Eye Contact', description: 'Correct gaze to look at camera' },
          { icon: Camera, label: 'Face tracking', description: 'Auto-frame speaker in shot' },
          { icon: Blend, label: 'Background blur', description: 'Add depth to your video', badge: 'Beta' },
          { icon: Tv, label: 'Virtual backdrop', description: 'Replace background with image' },
          { icon: Smile, label: 'Beauty mode', description: 'Subtle skin smoothing & enhancement' },
          { icon: Maximize2, label: 'Auto-crop & zoom', description: 'Dynamic framing for socials' },
          { icon: Grid, label: 'Multicam sync', description: 'Sync multiple camera angles', badge: 'Beta' },
        ].map(renderToolButton)}
      </div>

      {/* Repurpose Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Repurpose</h3>
        
        {[
          { icon: Film, label: 'Smart clips', description: 'AI picks viral-worthy moments' },
          { icon: Star, label: 'Highlight reel', description: 'Auto-generate best moments' },
          { icon: Languages, label: 'Translate & dub', description: 'Dub video to other languages', highlighted: true },
          { icon: Layout, label: 'Resize for socials', description: 'Create versions for each platform' },
        ].map(renderToolButton)}
      </div>

      {/* Publish Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Publish</h3>
        
        {[
          { icon: Type, label: 'Generate title', description: 'AI-powered title suggestions' },
          { icon: AlignLeft, label: 'Summarize', description: 'Create a video summary' },
          { icon: Youtube, label: 'YouTube SEO', description: 'Optimize for search & discovery' },
          { icon: Share2, label: 'Social captions', description: 'Generate platform-specific posts' },
          { icon: Newspaper, label: 'Blog post', description: 'Turn video into written content' },
        ].map(renderToolButton)}
      </div>

      {/* Generate Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Generate</h3>
        
        {[
          { icon: ImageIcon, label: 'AI Image', description: 'Generate images from text' },
          { icon: Video, label: 'AI Video', description: 'Create video clips with AI' },
          { icon: Mic, label: 'AI Voiceover', description: 'Generate natural voiceovers' },
          { icon: Captions, label: 'AI Captions', description: 'Auto-generate subtitles' },
          { icon: Users, label: 'AI Avatar', description: 'Create digital spokesperson' },
        ].map(renderToolButton)}
      </div>

      {/* Show Deleted Toggle */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Show deleted</span>
          <Switch 
            checked={showDeleted} 
            onCheckedChange={(v) => {
              setShowDeleted(v);
              onToolAction?.('show-deleted', { enabled: v });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIToolsPanel;