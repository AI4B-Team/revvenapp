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
  Sliders
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface AIToolsPanelProps {
  onToolAction?: (action: string, settings?: any) => void;
}

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({ onToolAction }) => {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteSilencesOpen, setDeleteSilencesOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState<'short' | 'long' | 'custom'>('short');
  const [customSilenceThreshold, setCustomSilenceThreshold] = useState(0.7);
  
  // Toggle states
  const [cleanAudio, setCleanAudio] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [eyeContact, setEyeContact] = useState(false);
  const [aiBackgroundExpand, setAiBackgroundExpand] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [faceFilter, setFaceFilter] = useState(false);
  const [greenScreen, setGreenScreen] = useState(false);

  const handleDeleteSilences = () => {
    const threshold = silenceMode === 'custom' ? customSilenceThreshold : silenceMode === 'short' ? 0.3 : 1.0;
    toast.success(`Deleting silences longer than ${threshold}s`);
    onToolAction?.('delete-silences', { threshold, mode: silenceMode });
  };

  const handleDeleteFillerWords = () => {
    toast.success('Removing filler words...');
    onToolAction?.('delete-filler-words', {});
  };

  const handleToggle = (tool: string, enabled: boolean, setter: (v: boolean) => void) => {
    setter(enabled);
    if (enabled) {
      toast.success(`${tool} enabled`);
    }
    onToolAction?.(tool.toLowerCase().replace(/\s+/g, '-'), { enabled });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Show Deleted Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Show deleted</span>
        <Switch 
          checked={showDeleted} 
          onCheckedChange={setShowDeleted}
        />
      </div>

      {/* Delete Silences - Collapsible */}
      <Collapsible open={deleteSilencesOpen} onOpenChange={setDeleteSilencesOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm font-medium text-gray-900">Delete Silences</span>
          {deleteSilencesOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 space-y-4 bg-gray-50">
          {/* Mode Selector */}
          <div className="flex gap-2 mt-3">
            {(['short', 'long', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSilenceMode(mode)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  silenceMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                {mode !== 'custom' && (
                  <Play className="w-3 h-3 inline ml-1 opacity-60" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Slider */}
          {silenceMode === 'custom' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">More than</span>
                <span className="text-sm font-medium text-gray-900">{customSilenceThreshold}s</span>
              </div>
              <Slider
                value={[customSilenceThreshold]}
                onValueChange={([val]) => setCustomSilenceThreshold(val)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          <Button 
            onClick={handleDeleteSilences}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Delete
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Filler Words */}
      <button
        onClick={handleDeleteFillerWords}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
      >
        <span className="text-sm font-medium text-gray-900">Delete Filler Words</span>
      </button>

      {/* Sound Good Section */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sound Good</span>
      </div>

      <div className="divide-y divide-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Mic className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Clean audio</span>
          </div>
          <Switch 
            checked={cleanAudio} 
            onCheckedChange={(v) => handleToggle('Clean audio', v, setCleanAudio)}
          />
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Remove filler words</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-500 font-medium">⚡</span>
            <Switch 
              checked={removeFillerWords} 
              onCheckedChange={(v) => handleToggle('Remove filler words', v, setRemoveFillerWords)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Remove silences</span>
          </div>
          <Switch 
            checked={removeSilences} 
            onCheckedChange={(v) => handleToggle('Remove silences', v, setRemoveSilences)}
          />
        </div>
      </div>

      {/* Look Good Section */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Look Good</span>
      </div>

      <div className="divide-y divide-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Eye contact</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-500 font-medium">⚡</span>
            <Switch 
              checked={eyeContact} 
              onCheckedChange={(v) => handleToggle('Eye contact', v, setEyeContact)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Maximize2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">AI Background expand</span>
          </div>
          <Switch 
            checked={aiBackgroundExpand} 
            onCheckedChange={(v) => handleToggle('AI Background expand', v, setAiBackgroundExpand)}
          />
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Eraser className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Remove background</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-500 font-medium">⚡</span>
            <Switch 
              checked={removeBackground} 
              onCheckedChange={(v) => handleToggle('Remove background', v, setRemoveBackground)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Smile className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Face filter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-500 font-medium">⚡</span>
            <Switch 
              checked={faceFilter} 
              onCheckedChange={(v) => handleToggle('Face filter', v, setFaceFilter)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Tv className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Green screen</span>
          </div>
          <Switch 
            checked={greenScreen} 
            onCheckedChange={(v) => handleToggle('Green screen', v, setGreenScreen)}
          />
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Captions className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Subtitles</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Generate
          </Button>
          <span className="text-xs text-gray-400">✦ 0 credits left</span>
        </div>
      </div>

      {/* Generate Section */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Generate</span>
          </div>
          <span className="text-xs text-gray-400">✦ 0 credits left</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {[
          { icon: ArrowLeftRight, label: 'AI Transitions' },
          { icon: ImageIcon, label: 'B-roll AI images' },
          { icon: Users, label: 'Characters' },
          { icon: AudioLines, label: 'AI Voice' },
          { icon: Video, label: 'AI Video' },
          { icon: ImageIcon, label: 'AI Image' },
          { icon: Languages, label: 'AI Dubbing' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => {
              toast.success(`Opening ${label}...`);
              onToolAction?.(label.toLowerCase().replace(/\s+/g, '-'), {});
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIToolsPanel;
