import { Palette, Search, Map, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type Intent = 'Create' | 'Research' | 'Plan' | 'Automate';
export type CreateTab = 'Apps' | 'Creations' | 'Templates' | 'Community' | 'Collections';

interface IntentConfig {
  label: Intent;
  icon: LucideIcon;
  color: string;
  activeColor: string;
}

const intents: IntentConfig[] = [
  { label: 'Create', icon: Palette, color: 'text-success', activeColor: 'border-success bg-success/10' },
  { label: 'Research', icon: Search, color: 'text-info', activeColor: 'border-info bg-info/10' },
  { label: 'Plan', icon: Map, color: 'text-warning', activeColor: 'border-warning bg-warning/10' },
  { label: 'Automate', icon: Zap, color: 'text-destructive', activeColor: 'border-destructive bg-destructive/10' },
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
        return (
          <button
            key={intent.label}
            onClick={() => onIntentChange(isSelected ? null : intent.label)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 text-base font-medium rounded-lg border transition-all duration-200",
              isSelected
                ? intent.activeColor
                : "bg-background border-border hover:border-muted-foreground/50"
            )}
          >
            <intent.icon size={20} className={intent.color} />
            <span className={isSelected ? intent.color : 'text-foreground'}>
              {intent.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default IntentSelector;
