import React, { useState } from 'react';
import { 
  ArrowLeft,
  Volume2,
  MoreHorizontal,
  Eye,
  Link2,
  RotateCcw,
  Plus,
  X,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ClipSettingsPanelProps {
  onBack?: () => void;
  clipName?: string;
}

const ClipSettingsPanel: React.FC<ClipSettingsPanelProps> = ({ 
  onBack,
  clipName = 'Script'
}) => {
  const [speedMultiplier, setSpeedMultiplier] = useState('1x');
  const [clipDuration, setClipDuration] = useState('3:58.6');
  const [audioVolume, setAudioVolume] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [positionX, setPositionX] = useState(960);
  const [positionY, setPositionY] = useState(540);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [rotation, setRotation] = useState(360);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [borderWidth, setBorderWidth] = useState(5);
  const [borderColor, setBorderColor] = useState('#000000');
  const [isLinked, setIsLinked] = useState(true);

  // Collapsible states
  const [audioEffectsOpen, setAudioEffectsOpen] = useState(false);
  const [visualEffectsOpen, setVisualEffectsOpen] = useState(false);
  const [animationOpen, setAnimationOpen] = useState(false);

  const audioEffectOptions = [
    { label: 'Dynamics', hasSubmenu: true },
    { label: 'EQ', hasSubmenu: true },
    { label: 'Creative', hasSubmenu: true },
    { label: 'Reverb', hasSubmenu: false },
  ];

  const visualEffectOptions = [
    { label: 'Shadow', hasSubmenu: false },
    { label: 'Chroma key', hasSubmenu: false },
    { label: 'Color adjustments', hasSubmenu: false },
    { label: 'Blur', hasSubmenu: false },
    { label: 'Film grain', hasSubmenu: false },
    { label: 'Pixelate', hasSubmenu: false },
    { label: 'Zoom blur', hasSubmenu: false },
    { label: 'Eye Contact', hasSubmenu: false },
    { label: 'Blur speaker background', hasSubmenu: false },
    { label: 'Center active speaker', badge: 'Beta', hasSubmenu: false },
    { label: 'Green screen', hasSubmenu: false },
  ];

  const animationOptions = [
    { label: 'Zoom and pan', hasSubmenu: false },
    { label: 'Custom', hasSubmenu: false },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900">{clipName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Volume2 className="w-4 h-4 text-gray-600" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-600 text-lg font-medium">S</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem>Script settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem>Remove from script</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Duration */}
        <div className="bg-gray-50 rounded-xl p-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Duration</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <Input 
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(e.target.value)}
                className="h-8 bg-white border-gray-200 text-sm w-16"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-gray-400 text-sm">⏱</span>
              <Input 
                value={clipDuration}
                onChange={(e) => setClipDuration(e.target.value)}
                className="h-8 bg-white border-gray-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500">Audio</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => toast.success('Opening advanced audio...')}>
                  Advanced audio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 w-12">{audioVolume}%</span>
            <Slider
              value={[audioVolume]}
              onValueChange={(v) => setAudioVolume(v[0])}
              max={200}
              step={1}
              className="flex-1"
            />
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
              <Volume2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Opacity */}
        <div className="bg-gray-50 rounded-xl p-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Opacity</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 w-12">{opacity}%</span>
            <Slider
              value={[opacity]}
              onValueChange={(v) => setOpacity(v[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Size and position */}
        <div className="bg-gray-50 rounded-xl p-3">
          <h4 className="text-xs font-medium text-gray-500 mb-3">Size and position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">X</span>
              <Input 
                type="number"
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">Y</span>
              <Input 
                type="number"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">W</span>
              <Input 
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">H</span>
              <Input 
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
              <button 
                onClick={() => setIsLinked(!isLinked)}
                className={`p-1.5 rounded transition-colors ${isLinked ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">↻</span>
              <Input 
                value={`${rotation}°`}
                onChange={(e) => setRotation(Number(e.target.value.replace('°', '')))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-4">⌐</span>
              <Input 
                type="number"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="h-8 bg-white border-gray-200 text-sm"
              />
              <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Border */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500">Border</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
                <span className="text-xs text-gray-400">≡</span>
                <Input 
                  type="number"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="h-5 w-10 border-0 p-0 text-xs text-center"
                />
              </div>
              <input 
                type="color" 
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer"
              />
              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Audio effects */}
        <Collapsible open={audioEffectsOpen} onOpenChange={setAudioEffectsOpen}>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
              <h4 className="text-xs font-medium text-gray-500">Audio effects</h4>
              <Plus className="w-4 h-4 text-gray-400" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-gray-100">
              <div className="p-2 space-y-0.5">
                {audioEffectOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => toast.success(`${option.label} effect applied`)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {option.hasSubmenu && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Visual effects */}
        <Collapsible open={visualEffectsOpen} onOpenChange={setVisualEffectsOpen}>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
              <h4 className="text-xs font-medium text-gray-500">Visual effects</h4>
              <Plus className="w-4 h-4 text-gray-400" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-gray-100">
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {visualEffectOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => toast.success(`${option.label} effect applied`)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      {option.label}
                      {option.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                          {option.badge}
                        </span>
                      )}
                    </span>
                    {option.hasSubmenu && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Animation */}
        <Collapsible open={animationOpen} onOpenChange={setAnimationOpen}>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
              <h4 className="text-xs font-medium text-gray-500">Animation</h4>
              <Plus className="w-4 h-4 text-gray-400" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-gray-100">
              <div className="p-2 space-y-0.5">
                {animationOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => toast.success(`${option.label} animation applied`)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default ClipSettingsPanel;
