import React from 'react';
import {
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Eye,
  Zap,
  Play,
  Copy,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CallMode } from '@/pages/MasterCloser';

export type SuggestionType = 'response' | 'objection' | 'question' | 'warning' | 'coach' | 'insight';

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  text: string;
  confidence: number;
  reasoning?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface MCSuggestionPanelProps {
  suggestions: AISuggestion[];
  callMode: CallMode;
  onUseSuggestion: (suggestion: AISuggestion) => void;
  onCopySuggestion: (suggestion: AISuggestion) => void;
  onFeedback: (suggestion: AISuggestion, positive: boolean) => void;
  isLoading?: boolean;
}

const getSuggestionStyles = (type: SuggestionType) => {
  switch (type) {
    case 'response':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        icon: MessageSquare
      };
    case 'objection':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-700',
        icon: AlertTriangle
      };
    case 'question':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700',
        icon: HelpCircle
      };
    case 'warning':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        icon: AlertCircle
      };
    case 'coach':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700',
        icon: Eye
      };
    case 'insight':
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-700',
        icon: Lightbulb
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        icon: MessageSquare
      };
  }
};

const getTypeLabel = (type: SuggestionType) => {
  switch (type) {
    case 'response': return 'Response';
    case 'objection': return 'Objection Detected';
    case 'question': return 'Question Prompt';
    case 'warning': return 'Warning';
    case 'coach': return 'Coach Tip';
    case 'insight': return 'Insight';
    default: return 'Suggestion';
  }
};

const MCSuggestionPanel: React.FC<MCSuggestionPanelProps> = ({
  suggestions,
  callMode,
  onUseSuggestion,
  onCopySuggestion,
  onFeedback,
  isLoading = false
}) => {
  // Sort suggestions by priority and confidence
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.confidence - a.confidence;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Analyzing conversation...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Suggestions will appear here as the conversation progresses
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-3">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground sticky top-0 bg-card pb-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          {callMode === 'listen' ? 'Coaching Tips' : 'Smart Suggestions'}
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {suggestions.length} active
          </span>
        </h4>

        {sortedSuggestions.map((suggestion) => {
          const styles = getSuggestionStyles(suggestion.type);
          const Icon = styles.icon;

          return (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${styles.bg} ${styles.border} ${
                suggestion.priority === 'high' ? 'ring-2 ring-offset-1 ring-yellow-300' : ''
              } transition-all hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${styles.iconColor}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badgeBg} ${styles.badgeText}`}>
                    {getTypeLabel(suggestion.type)}
                  </span>
                  {suggestion.priority === 'high' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        suggestion.confidence >= 80 ? 'bg-emerald-500' :
                        suggestion.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${suggestion.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">{suggestion.confidence}%</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm mb-3 leading-relaxed text-foreground">{suggestion.text}</p>

              {/* Reasoning */}
              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground mb-3 italic flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {suggestion.reasoning}
                </p>
              )}

              {/* Actions */}
              {callMode !== 'listen' && suggestion.type === 'response' && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => onUseSuggestion(suggestion)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-all text-white"
                  >
                    <Play className="w-3 h-3" />
                    Use This
                  </button>
                  <button 
                    onClick={() => onCopySuggestion(suggestion)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => onFeedback(suggestion, true)}
                    className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Good suggestion"
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button 
                    onClick={() => onFeedback(suggestion, false)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}

              {/* Question prompts get a different action set */}
              {suggestion.type === 'question' && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => onUseSuggestion(suggestion)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-all text-white"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Ask This
                  </button>
                  <button 
                    onClick={() => onCopySuggestion(suggestion)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MCSuggestionPanel;
