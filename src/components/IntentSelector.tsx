import { Palette, Search, Map, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type Intent = 'Create' | 'Research' | 'Plan' | 'Automate';
export type CreateTab = 'Apps' | 'Creations' | 'Templates' | 'Community' | 'Collections';

interface IntentConfig {
  label: Intent;
  icon: LucideIcon;
  iconColor: string;
  selectedBg: string;
}

const intents: IntentConfig[] = [
  { label: 'Create', icon: Palette, iconColor: 'text-emerald-500', selectedBg: 'bg-slate-800' },
  { label: 'Research', icon: Search, iconColor: 'text-blue-500', selectedBg: 'bg-slate-800' },
  { label: 'Plan', icon: Map, iconColor: 'text-amber-500', selectedBg: 'bg-amber-100' },
  { label: 'Automate', icon: Zap, iconColor: 'text-rose-500', selectedBg: 'bg-rose-100' },
];

interface IntentSelectorProps {
  selectedIntent: Intent | null;
  onIntentChange: (intent: Intent | null) => void;
}

const IntentSelector = ({ selectedIntent, onIntentChange }: IntentSelectorProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {intents.map((intent) => {
        const isSelected = selectedIntent === intent.label;
        const usesDarkBg = intent.label === 'Create' || intent.label === 'Research';
        
        return (
          <button
            key={intent.label}
            onClick={() => onIntentChange(isSelected ? null : intent.label)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 text-[15px] font-medium rounded-full border transition-all duration-200",
              isSelected
                ? cn(intent.selectedBg, "border-transparent", usesDarkBg ? "text-white" : "text-slate-800")
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
            )}
          >
            <intent.icon 
              size={18} 
              className={isSelected && usesDarkBg ? "text-white" : intent.iconColor} 
            />
            <span>{intent.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default IntentSelector;
