import React from 'react';
import {
  CheckCircle,
  Clock,
  Circle,
  Target,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { CallMode } from '@/pages/MasterCloser';
import type { ConversationTemplate } from './MCConversationTemplates';

export interface CallPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  duration: string;
  tips?: string[];
  progress?: number; // 0-100 for active phase
}

interface MCCallPhaseTrackerProps {
  phases: CallPhase[];
  currentPhaseId: string;
  callMode: CallMode;
  template?: ConversationTemplate | null;
  onPhaseClick?: (phase: CallPhase) => void;
}

const getModeColors = (callMode: CallMode) => {
  switch (callMode) {
    case 'listen':
      return {
        active: 'bg-blue-100 border-blue-200',
        activeText: 'text-blue-600',
        activeDot: 'bg-blue-500',
        completed: 'bg-emerald-100 border-emerald-200',
        completedIcon: 'text-emerald-600'
      };
    case 'voice-agent':
      return {
        active: 'bg-purple-100 border-purple-200',
        activeText: 'text-purple-600',
        activeDot: 'bg-purple-500',
        completed: 'bg-emerald-100 border-emerald-200',
        completedIcon: 'text-emerald-600'
      };
    default:
      return {
        active: 'bg-emerald-100 border-emerald-200',
        activeText: 'text-emerald-600',
        activeDot: 'bg-emerald-500',
        completed: 'bg-emerald-100 border-emerald-200',
        completedIcon: 'text-emerald-600'
      };
  }
};

const MCCallPhaseTracker: React.FC<MCCallPhaseTrackerProps> = ({
  phases,
  currentPhaseId,
  callMode,
  template,
  onPhaseClick
}) => {
  const colors = getModeColors(callMode);
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const totalPhases = phases.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);

  return (
    <div className="p-4 border-b border-border">
      {/* Header with template info */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Target className="w-4 h-4" />
          Call Structure
        </h4>
        {template && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            {template.name}
          </div>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{completedPhases}/{totalPhases} phases</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${colors.activeDot}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Phase list */}
      <div className="space-y-2">
        {phases.map((phase, index) => {
          const isActive = phase.status === 'active';
          const isCompleted = phase.status === 'completed';
          const isPending = phase.status === 'pending';

          return (
            <div
              key={phase.id}
              onClick={() => onPhaseClick?.(phase)}
              className={`
                relative flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer
                ${isActive ? `${colors.active} border` : ''}
                ${isCompleted ? `${colors.completed} border` : ''}
                ${isPending ? 'bg-muted border border-border hover:border-gray-300' : ''}
              `}
            >
              {/* Connection line */}
              {index < phases.length - 1 && (
                <div className={`
                  absolute left-5 top-[calc(100%+2px)] w-0.5 h-2 
                  ${isCompleted ? 'bg-emerald-300' : 'bg-border'}
                `} />
              )}

              <div className="flex items-center gap-3">
                {/* Status icon */}
                {isCompleted ? (
                  <CheckCircle className={`w-5 h-5 ${colors.completedIcon}`} />
                ) : isActive ? (
                  <div className="relative">
                    <Clock className={`w-5 h-5 ${colors.activeText} animate-pulse`} />
                    <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${colors.activeDot} rounded-full animate-ping`} />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}

                <div>
                  <span className={`text-sm font-medium ${
                    isActive ? colors.activeText :
                    isCompleted ? 'text-foreground' :
                    'text-muted-foreground'
                  }`}>
                    {phase.name}
                  </span>
                  
                  {/* Phase progress for active phase */}
                  {isActive && phase.progress !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 bg-white rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${colors.activeDot} transition-all`}
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{phase.progress}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">{phase.duration}</span>
                {isActive && <ChevronRight className={`w-4 h-4 ${colors.activeText}`} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current phase tip */}
      {phases.find(p => p.id === currentPhaseId)?.tips?.[0] && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 flex items-start gap-2">
            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {phases.find(p => p.id === currentPhaseId)?.tips?.[0]}
          </p>
        </div>
      )}
    </div>
  );
};

export default MCCallPhaseTracker;
