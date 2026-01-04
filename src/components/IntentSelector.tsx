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
  selectedBorder: string;
  selectedTextColor: string;
  selectedIconColor: string;
  hoverBg: string;
  hoverBorder: string;
}

const intents: IntentConfig[] = [
  { 
    label: 'Create', 
    icon: Palette, 
    iconColor: 'text-emerald-500', 
    selectedBg: 'bg-emerald-50', 
    selectedBorder: 'border-emerald-400',
    selectedTextColor: 'text-slate-600',
    selectedIconColor: 'text-emerald-500',
    hoverBg: 'hover:bg-emerald-50',
    hoverBorder: 'hover:border-emerald-300'
  },
  { 
    label: 'Research', 
    icon: Search, 
    iconColor: 'text-blue-500', 
    selectedBg: 'bg-blue-50', 
    selectedBorder: 'border-blue-400',
    selectedTextColor: 'text-slate-600',
    selectedIconColor: 'text-blue-500',
    hoverBg: 'hover:bg-blue-50',
    hoverBorder: 'hover:border-blue-300'
  },
  { 
    label: 'Plan', 
    icon: Map, 
    iconColor: 'text-amber-500', 
    selectedBg: 'bg-amber-50', 
    selectedBorder: 'border-amber-300',
    selectedTextColor: 'text-slate-600',
    selectedIconColor: 'text-amber-500',
    hoverBg: 'hover:bg-amber-50',
    hoverBorder: 'hover:border-amber-300'
  },
  { 
    label: 'Automate', 
    icon: Zap, 
    iconColor: 'text-rose-500', 
    selectedBg: 'bg-rose-50', 
    selectedBorder: 'border-rose-300',
    selectedTextColor: 'text-slate-600',
    selectedIconColor: 'text-rose-500',
    hoverBg: 'hover:bg-rose-50',
    hoverBorder: 'hover:border-rose-300'
  },
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
        const isResearchSelected = isSelected && intent.label === 'Research';
        
        return (
          <button
            key={intent.label}
            onClick={() => onIntentChange(isSelected ? null : intent.label)}
            className={cn(
              "flex items-center gap-2.5 px-7 py-3.5 text-[15px] font-medium rounded-xl border transition-all duration-200",
              isSelected
                ? cn(intent.selectedBg, intent.selectedBorder, intent.selectedTextColor)
                : cn("bg-white border-slate-200 text-slate-500", intent.hoverBg, intent.hoverBorder)
            )}
          >
            <intent.icon 
              size={18} 
              className={isSelected ? intent.selectedIconColor : intent.iconColor} 
            />
            <span>{intent.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default IntentSelector;
