import React, { useState } from 'react';
import { 
  ArrowLeft,
  Ban,
  Sparkles,
  X,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageEditPanelProps {
  onBack?: () => void;
  mode: 'animations' | 'adjust' | 'transitions';
  onModeChange: (mode: 'animations' | 'adjust' | 'transitions') => void;
}

const animationPresets = [
  { id: 'none', name: 'None', icon: Ban },
  { id: 'fade', name: 'Fade' },
  { id: 'float', name: 'Float' },
  { id: 'zoom-in', name: 'Zoom In' },
  { id: 'ken-burns', name: 'Ken Burns In' },
  { id: 'drop', name: 'Drop' },
  { id: 'slide', name: 'Slide' },
  { id: 'wipe', name: 'Wipe' },
  { id: 'pop', name: 'Pop' },
  { id: 'bounce', name: 'Bounce' },
  { id: 'spin', name: 'Spin' },
  { id: 'slide-bounce', name: 'Slide bounce' },
  { id: 'gentle-float', name: 'Gentle float' },
];

const transitionPresets = [
  { id: 'none', name: 'None', isNone: true },
  { id: 'zoom-in-out', name: 'Zoom In & Out', premium: true },
  { id: 'rotate-pull', name: 'Rotate and Pull Out', premium: true },
  { id: 'paper', name: 'Paper', premium: true },
  { id: 're-arrange', name: 'Re-arrange', premium: true },
  { id: 'fly', name: 'Fly', premium: true },
  { id: 'build', name: 'Build', premium: true },
  { id: 'orbit', name: 'Orbit', premium: true },
];

const ImageEditPanel: React.FC<ImageEditPanelProps> = ({ 
  onBack,
  mode,
  onModeChange 
}) => {
  const [animationTab, setAnimationTab] = useState<'in' | 'out' | 'loop' | 'zoom'>('in');
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  const [selectedTransition, setSelectedTransition] = useState('none');

  // Adjust sliders state
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [noise, setNoise] = useState(0);
  const [blur, setBlur] = useState(0);
  const [vignette, setVignette] = useState(0);

  const handleResetAll = () => {
    setBrightness(0);
    setContrast(0);
    setExposure(0);
    setHue(0);
    setSaturation(0);
    setSharpen(0);
    setNoise(0);
    setBlur(0);
    setVignette(0);
    toast.success('Settings reset');
  };

  if (mode === 'animations') {
    return (
      <div className="flex flex-col h-full bg-white overflow-y-auto">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900">Animations</span>
        </div>

        {/* Animation Type Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-100">
          {['in', 'out', 'loop', 'zoom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setAnimationTab(tab as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                animationTab === tab
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'zoom' && (
                <span className="ml-1 text-[10px] px-1 py-0.5 bg-violet-100 text-violet-600 rounded">NEW</span>
              )}
            </button>
          ))}
        </div>

        {/* Animation Presets Grid */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {animationPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedAnimation(preset.id);
                  toast.success(`${preset.name} animation applied`);
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedAnimation === preset.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {preset.icon ? (
                    <preset.icon className={`w-5 h-5 ${selectedAnimation === preset.id ? 'text-primary' : 'text-gray-400'}`} />
                  ) : (
                    <div className={`w-6 h-6 bg-gray-300 rounded ${selectedAnimation === preset.id ? 'bg-primary/30' : ''}`} />
                  )}
                </div>
                <span className={`text-xs ${selectedAnimation === preset.id ? 'text-primary font-medium' : 'text-gray-600'}`}>
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'transitions') {
    return (
      <div className="flex flex-col h-full bg-white overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <span className="font-medium text-gray-900">Transitions</span>
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Create AI Transition Button */}
        <div className="p-3">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2">
            <Sparkles className="w-4 h-4" />
            Create new AI Transition
          </Button>
        </div>

        {/* Transition Presets Grid */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-3">
            {transitionPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedTransition(preset.id);
                  toast.success(`${preset.name} transition applied`);
                }}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl overflow-hidden ${
                  selectedTransition === preset.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {preset.isNone ? (
                    <Ban className="w-8 h-8 text-gray-400" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                  )}
                  {preset.premium && (
                    <div className="absolute top-1.5 right-1.5">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 pb-2">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Adjust mode
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-medium text-gray-900">Adjust Image</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Color Correction Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Color Correction</h3>
          
          {[
            { label: 'Brightness', value: brightness, setValue: setBrightness },
            { label: 'Contrast', value: contrast, setValue: setContrast },
            { label: 'Exposure', value: exposure, setValue: setExposure },
            { label: 'Hue', value: hue, setValue: setHue },
            { label: 'Saturation', value: saturation, setValue: setSaturation },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-20">{item.label}</span>
              <Slider
                value={[item.value]}
                onValueChange={(v) => item.setValue(v[0])}
                min={-100}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Effects Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Effects</h3>
          
          {[
            { label: 'Sharpen', value: sharpen, setValue: setSharpen },
            { label: 'Noise', value: noise, setValue: setNoise },
            { label: 'Blur', value: blur, setValue: setBlur },
            { label: 'Vignette', value: vignette, setValue: setVignette },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-20">{item.label}</span>
              <Slider
                value={[item.value]}
                onValueChange={(v) => item.setValue(v[0])}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={handleResetAll}
          className="w-full"
        >
          Reset All
        </Button>
      </div>
    </div>
  );
};

export default ImageEditPanel;
