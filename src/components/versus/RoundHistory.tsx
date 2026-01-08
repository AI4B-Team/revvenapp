import React from 'react';
import { Lock, Unlock, Trash2, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { Round } from './types';
import { getModelById, getProviderById } from './data';

interface RoundHistoryProps {
  rounds: Round[];
  onLockRound: (roundId: string) => void;
  onClearRound: (roundId: string) => void;
  expandedRoundId: string | null;
  onToggleExpand: (roundId: string) => void;
}

const RoundHistory: React.FC<RoundHistoryProps> = ({
  rounds,
  onLockRound,
  onClearRound,
  expandedRoundId,
  onToggleExpand
}) => {
  if (rounds.length === 0) return null;

  return (
    <div className="space-y-2">
      {rounds.map((round, index) => {
        const winnerResponse = round.winnerId 
          ? round.responses.find(r => r.panelId === round.winnerId)
          : null;
        const winnerModel = winnerResponse ? getModelById(winnerResponse.modelId) : null;
        const winnerProvider = winnerModel ? getProviderById(winnerModel.providerId) : null;
        const isExpanded = expandedRoundId === round.id;

        return (
          <div 
            key={round.id}
            className={`border rounded-xl overflow-hidden transition-colors ${
              round.isLocked 
                ? 'border-amber-500/30 bg-amber-500/5' 
                : 'border-border bg-card'
            }`}
          >
            {/* Round Header */}
            <button
              onClick={() => onToggleExpand(round.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Round {index + 1}</span>
                  {round.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                  "{round.prompt}"
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {winnerModel && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-full">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-xs text-amber-500">{winnerModel.displayName}</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {round.responses.length} responses
                </span>
              </div>
            </button>
            
            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border">
                {/* Responses Summary */}
                <div className="p-4 space-y-3">
                  {round.responses.map((response) => {
                    const model = getModelById(response.modelId);
                    const provider = model ? getProviderById(model.providerId) : null;
                    const isWinner = round.winnerId === response.panelId;
                    
                    return (
                      <div 
                        key={response.panelId}
                        className={`p-3 rounded-lg ${
                          isWinner 
                            ? 'bg-amber-500/10 border border-amber-500/30' 
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: provider?.color }}>{provider?.icon}</span>
                          <span className="text-sm font-medium text-foreground">{model?.displayName}</span>
                          {isWinner && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {response.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Round Actions */}
                <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-border bg-muted/30">
                  <button
                    onClick={() => onLockRound(round.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      round.isLocked
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {round.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {round.isLocked ? 'Locked' : 'Lock Round'}
                  </button>
                  
                  {!round.isLocked && (
                    <button
                      onClick={() => onClearRound(round.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoundHistory;
