import React from 'react';
import {
  Wand2,
  HelpCircle,
  ChevronDown,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { CanvasSettings, DIMENSION_OPTIONS, IMAGE_COUNT_OPTIONS } from '@/types/editor';

interface CanvasModePanelProps {
  settings: CanvasSettings;
  onSettingsChange: (settings: CanvasSettings) => void;
}

const Toggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
      enabled ? 'bg-teal-500' : 'bg-slate-700'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
        enabled ? 'left-7' : 'left-1'
      }`}
    />
  </button>
);

const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  suffix?: string;
}> = ({ value, onChange, min = 0, max = 100, step = 1, showValue = true, suffix = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${percentage}%, #334155 ${percentage}%, #334155 100%)`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-sm text-slate-400 min-w-[40px] text-right tabular-nums">
          {value}{suffix}
        </span>
      )}
    </div>
  );
};

const NumberButton: React.FC<{
  value: number;
  selected: boolean;
  onClick: () => void;
}> = ({ value, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      selected
        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {value}
  </button>
);

const DimensionButton: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
      selected
        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent'
    }`}
  >
    {label}
  </button>
);

const SectionHeader: React.FC<{
  title: string;
  hasHelp?: boolean;
  collapsible?: boolean;
}> = ({ title, hasHelp = false, collapsible = true }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300">{title}</span>
      {hasHelp && <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />}
    </div>
    {collapsible && <ChevronDown className="w-4 h-4 text-slate-500" />}
  </div>
);

const CanvasModePanel: React.FC<CanvasModePanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof CanvasSettings>(
    key: K,
    value: CanvasSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-[280px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="p-4 space-y-6">
        {/* Canvas Mode Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">Canvas Mode</span>
            <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-500/20 rounded-lg">
              <Wand2 className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm text-slate-300">Inpaint / Outpaint</span>
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Change
          </button>
        </div>

        {/* Outpaint Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Outpaint</span>
            <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
          </div>
          <Toggle
            enabled={settings.outpaint}
            onChange={(enabled) => updateSetting('outpaint', enabled)}
          />
        </div>

        {/* Inpaint Strength */}
        <div className="space-y-3">
          <SectionHeader title="Inpaint Strength" hasHelp collapsible={false} />
          <Slider
            value={settings.inpaintStrength}
            onChange={(value) => updateSetting('inpaintStrength', value)}
            min={0}
            max={1}
            step={0.1}
          />
        </div>

        {/* Number of Images */}
        <div className="space-y-3">
          <SectionHeader title="Number of Images" />
          <div className="grid grid-cols-4 gap-2">
            {IMAGE_COUNT_OPTIONS.map((num) => (
              <NumberButton
                key={num}
                value={num}
                selected={settings.numberOfImages === num}
                onClick={() => updateSetting('numberOfImages', num)}
              />
            ))}
          </div>
        </div>

        {/* Image Dimensions */}
        <div className="space-y-3">
          <SectionHeader title="Image Dimensions" hasHelp />
          <div className="grid grid-cols-2 gap-2">
            {DIMENSION_OPTIONS.map((dim) => (
              <DimensionButton
                key={dim}
                label={dim}
                selected={settings.dimensions === dim}
                onClick={() => updateSetting('dimensions', dim)}
              />
            ))}
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-4">
          <SectionHeader title="Advanced Controls" />
          
          {/* Aspect Ratio Lock */}
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <button className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-all">
              <Lock className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm text-slate-300 font-medium">{settings.aspectRatio}</span>
            </div>
          </div>

          {/* Width */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Slider
                value={settings.width}
                onChange={(value) => updateSetting('width', value)}
                min={256}
                max={2048}
                showValue={false}
              />
              <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-2 py-1.5 border border-slate-700/50">
                <span className="text-xs text-slate-500">W</span>
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => updateSetting('width', Number(e.target.value))}
                  className="w-12 bg-transparent text-sm text-slate-300 text-right focus:outline-none tabular-nums"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Slider
                value={settings.height}
                onChange={(value) => updateSetting('height', value)}
                min={256}
                max={2048}
                showValue={false}
              />
              <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-2 py-1.5 border border-slate-700/50">
                <span className="text-xs text-slate-500">H</span>
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => updateSetting('height', Number(e.target.value))}
                  className="w-12 bg-transparent text-sm text-slate-300 text-right focus:outline-none tabular-nums"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Render Density */}
        <div className="space-y-3">
          <SectionHeader title="Render Density" hasHelp collapsible={false} />
          <Slider
            value={settings.renderDensity}
            onChange={(value) => updateSetting('renderDensity', value)}
            min={0}
            max={100}
          />
        </div>

        {/* Guidance Scale */}
        <div className="space-y-3">
          <SectionHeader title="Guidance Scale" hasHelp collapsible={false} />
          <Slider
            value={settings.guidanceScale}
            onChange={(value) => updateSetting('guidanceScale', value)}
            min={1}
            max={20}
          />
        </div>
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-24 right-6 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-teal-500/30 hover:bg-teal-400 hover:shadow-teal-500/50 transition-all hover:scale-105 z-50">
        <MessageSquare className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default CanvasModePanel;
