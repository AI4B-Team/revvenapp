import React from 'react';
import { ArrowRightLeft, Home, Repeat, TrendingUp, Building2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconTooltip } from '@/components/ui/IconTooltip';

interface Strategy {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const strategies: Strategy[] = [
  { id: 'wholesale', name: 'Wholesale', icon: ArrowRightLeft, description: 'Assign contract for quick profit' },
  { id: 'flip', name: 'Flip', icon: Home, description: 'Rehab and resell for profit' },
  { id: 'brrrr', name: 'BRRRR', icon: Repeat, description: 'Buy, rehab, rent, refinance, repeat' },
  { id: 'rental', name: 'Hold', icon: Building2, description: 'Long-term rental investment' },
  { id: 'creative', name: 'Creative', icon: TrendingUp, description: 'Seller financing or subject-to' },
];

interface ScenarioSwitcherProps {
  activeStrategy: string;
  onStrategyChange: (strategyId: string) => void;
  disabled?: boolean;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  activeStrategy,
  onStrategyChange,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {strategies.map((strategy) => {
        const Icon = strategy.icon;
        const isActive = activeStrategy === strategy.id;
        
        return (
          <IconTooltip key={strategy.id} label={strategy.description} side="bottom">
            <button
              onClick={() => onStrategyChange(strategy.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                "text-sm font-medium",
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-border bg-card hover:border-muted-foreground text-muted-foreground hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
              {strategy.name}
            </button>
          </IconTooltip>
        );
      })}
    </div>
  );
};

export default ScenarioSwitcher;
