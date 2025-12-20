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
          { icon: AudioLines, label: 'Studio Sound', description: 'Remove Noise And Enhance Voice Clarity' },
          { icon: VolumeX, label: 'Clean Up Speech', description: 'Remove Filler Words And Hesitations' },
          { icon: ArrowLeftRight, label: 'Tighten Pacing', description: 'Reduce Pauses And Dead Air' },
          { icon: Mic, label: 'Voice Isolation', description: 'Separate Voice From Background' },
        ].map(renderToolButton)}
      </div>

      {/* Visual Lab Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Visual Lab</h3>
        
        {[
          { icon: Eye, label: 'Eye Contact', description: 'Correct Gaze To Look At Camera' },
          { icon: Camera, label: 'Face Tracking', description: 'Auto-Frame Speaker In Shot' },
          { icon: Blend, label: 'Background Blur', description: 'Add Depth To Your Video', badge: 'Beta' },
          { icon: Tv, label: 'Virtual Backdrop', description: 'Replace Background With Image' },
          { icon: Smile, label: 'Beauty Mode', description: 'Subtle Skin Smoothing And Enhancement' },
          { icon: Maximize2, label: 'Auto-Crop And Zoom', description: 'Dynamic Framing For Socials' },
          { icon: Grid, label: 'Multicam Sync', description: 'Sync Multiple Camera Angles', badge: 'Beta' },
        ].map(renderToolButton)}
      </div>

      {/* Repurpose Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Repurpose</h3>
        
        {[
          { icon: Film, label: 'Smart Clips', description: 'AI Picks Viral-Worthy Moments' },
          { icon: Star, label: 'Highlight Reel', description: 'Auto-Generate Best Moments' },
          { icon: Languages, label: 'Translate And Dub', description: 'Dub Video To Other Languages', highlighted: true },
          { icon: Layout, label: 'Resize For Socials', description: 'Create Versions For Each Platform' },
        ].map(renderToolButton)}
      </div>

      {/* Publish Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Publish</h3>
        
        {[
          { icon: Type, label: 'Generate Title', description: 'AI-Powered Title Suggestions' },
          { icon: AlignLeft, label: 'Summarize', description: 'Create A Video Summary' },
          { icon: Youtube, label: 'YouTube SEO', description: 'Optimize For Search And Discovery' },
          { icon: Share2, label: 'Social Captions', description: 'Generate Platform-Specific Posts' },
          { icon: Newspaper, label: 'Blog Post', description: 'Turn Video Into Written Content' },
        ].map(renderToolButton)}
      </div>

      {/* Generate Section */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Generate</h3>
        
        {[
          { icon: ImageIcon, label: 'AI Image', description: 'Generate Images From Text' },
          { icon: Video, label: 'AI Video', description: 'Create Video Clips With AI' },
          { icon: Mic, label: 'AI Voiceover', description: 'Generate Natural Voiceovers' },
          { icon: Captions, label: 'AI Captions', description: 'Auto-Generate Subtitles' },
          { icon: Users, label: 'AI Avatar', description: 'Create Digital Spokesperson' },
        ].map(renderToolButton)}
      </div>

      {/* Show Deleted Toggle */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Show Deleted</span>
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