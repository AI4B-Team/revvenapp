import React, { useState } from 'react';
import { 
  Monitor, 
  Square, 
  Smartphone, 
  Image as ImageIcon, 
  Clock, 
  MessageSquare, 
  AudioLines, 
  Ghost, 
  History,
  Languages,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SettingsPanelProps {
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  onSettingChange?: (setting: string, value: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  aspectRatio,
  onAspectRatioChange,
  onSettingChange
}) => {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#FF4F4A');
  const [durationType, setDurationType] = useState<'automatic' | 'fixed'>('automatic');
  const [fixedDuration, setFixedDuration] = useState('00:05.0');
  const [showComments, setShowComments] = useState(false);
  const [showSoundwaves, setShowSoundwaves] = useState(true);
  const [showGhostPlayhead, setShowGhostPlayhead] = useState(true);
  const [framesPerSecond, setFramesPerSecond] = useState('30');

  const handleSettingChange = (setting: string, value: any) => {
    onSettingChange?.(setting, value);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      </div>

      {/* Size Section */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Size</h3>
        
        <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
          <SelectTrigger className="w-full bg-white border-gray-200">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-400" />
              <SelectValue placeholder="Select size" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="Landscape">Landscape (16:9)</SelectItem>
            <SelectItem value="Portrait">Portrait (9:16)</SelectItem>
            <SelectItem value="Square">Square (1:1)</SelectItem>
            <SelectItem value="4:5">Vertical (4:5)</SelectItem>
            <SelectItem value="21:9">Ultrawide (21:9)</SelectItem>
          </SelectContent>
        </Select>

        <button 
          onClick={() => toast.success('Opening social media resize...')}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <Smartphone className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Resize for social media</p>
            <p className="text-xs text-gray-500">Create new version for social media</p>
          </div>
        </button>
      </div>

      {/* Background Section */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Background</h3>
        
        <RadioGroup value={backgroundType} onValueChange={(v: 'color' | 'image') => setBackgroundType(v)}>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="color" id="bg-color" />
              <Label htmlFor="bg-color" className="text-sm text-gray-700 cursor-pointer">Color</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">{backgroundColor.toUpperCase()}</span>
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleSettingChange('backgroundColor', e.target.value);
                }}
                className="w-6 h-6 rounded-full border-0 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="image" id="bg-image" />
              <Label htmlFor="bg-image" className="text-sm text-gray-700 cursor-pointer">Image</Label>
            </div>
            <button className="text-xs text-gray-400 hover:text-gray-600">
              Upload
            </button>
          </div>
        </RadioGroup>
      </div>

      {/* Duration Section */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Duration</h3>
        
        <RadioGroup value={durationType} onValueChange={(v: 'automatic' | 'fixed') => setDurationType(v)}>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200">
            <RadioGroupItem value="automatic" id="dur-auto" />
            <Label htmlFor="dur-auto" className="text-sm text-gray-700 cursor-pointer">Automatic</Label>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="fixed" id="dur-fixed" />
              <Label htmlFor="dur-fixed" className="text-sm text-gray-700 cursor-pointer">Fixed</Label>
            </div>
            <Input 
              value={fixedDuration}
              onChange={(e) => setFixedDuration(e.target.value)}
              className="w-20 h-7 text-xs text-right"
              disabled={durationType !== 'fixed'}
            />
          </div>
        </RadioGroup>
      </div>

      {/* Timeline Settings Section */}
      <div className="p-4 space-y-1 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline Settings</h3>
        
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Show Comments</span>
          </div>
          <Switch 
            checked={showComments} 
            onCheckedChange={(v) => {
              setShowComments(v);
              handleSettingChange('showComments', v);
            }}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <AudioLines className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Show Soundwaves</span>
          </div>
          <Switch 
            checked={showSoundwaves} 
            onCheckedChange={(v) => {
              setShowSoundwaves(v);
              handleSettingChange('showSoundwaves', v);
            }}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Ghost className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Show Ghost Playhead</span>
          </div>
          <Switch 
            checked={showGhostPlayhead} 
            onCheckedChange={(v) => {
              setShowGhostPlayhead(v);
              handleSettingChange('showGhostPlayhead', v);
            }}
          />
        </div>
      </div>

      {/* Frames Per Second */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Frames Per Second</h3>
        
        <Select value={framesPerSecond} onValueChange={setFramesPerSecond}>
          <SelectTrigger className="w-full bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="60">60</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Version History */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Version History</h3>
        
        <button 
          onClick={() => toast.success('Opening version history...')}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <History className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Restore to a previous version</p>
            <p className="text-xs text-gray-500">Creates a new project</p>
          </div>
        </button>
      </div>

      {/* Audio Section */}
      <div className="p-4 space-y-3 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Audio</h3>
        
        <button 
          onClick={() => toast.success('Opening AI Dubbing...')}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors text-left"
        >
          <Languages className="w-4 h-4 text-violet-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">AI Dubbing</p>
            <p className="text-xs text-gray-500">Translate dialogue to different languages</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-violet-400" />
        </button>

        <button 
          onClick={() => toast.success('Opening Clean Audio...')}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors text-left"
        >
          <Sparkles className="w-4 h-4 text-violet-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Clean Audio</p>
            <p className="text-xs text-gray-500">Remove background noise</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;