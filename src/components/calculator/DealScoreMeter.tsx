import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskFlag {
  type: 'warning' | 'danger' | 'info';
  message: string;
  field?: string;
}

interface DealScoreMeterProps {
  score: number | null;
  verdict: string | null;
  riskFlags: RiskFlag[];
  isLoading?: boolean;
  compact?: boolean;
}

export const DealScoreMeter: React.FC<DealScoreMeterProps> = ({
  score,
  verdict,
  riskFlags,
  isLoading = false,
  compact = false
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-emerald-500';
    if (s >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return 'Good Deal';
    if (s >= 40) return 'Proceed with Caution';
    return 'Likely Pass';
  };

  const getScoreIcon = (s: number) => {
    if (s >= 70) return <TrendingUp className="w-5 h-5" />;
    if (s >= 40) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card p-4",
        compact ? "p-3" : "p-6"
      )}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Analyzing deal...</span>
        </div>
      </div>
    );
  }

  if (score === null) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card",
      compact ? "p-3" : "p-6"
    )}>
      {/* Score Display */}
      <div className="flex items-center gap-4 mb-4">
        {/* Circular Score Gauge */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/20"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", getScoreColor(score))}>{score}</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="flex-1">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-1",
            score >= 70 ? "bg-emerald-100 text-emerald-700" :
            score >= 40 ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          )}>
            {getScoreIcon(score)}
            {getScoreLabel(score)}
          </div>
          {verdict && (
            <p className="text-lg font-semibold text-foreground mt-1">
              "{verdict}"
            </p>
          )}
        </div>
      </div>

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk Flags</h4>
          <div className="space-y-1.5">
            {riskFlags.map((flag, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg text-sm",
                  flag.type === 'danger' ? "bg-red-50 text-red-800" :
                  flag.type === 'warning' ? "bg-amber-50 text-amber-800" :
                  "bg-blue-50 text-blue-800"
                )}
              >
                {getRiskIcon(flag.type)}
                <span>{flag.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DealScoreMeter;
