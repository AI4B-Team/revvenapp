import React, { useState } from 'react';
import { X, GripVertical, Trash2, Sparkles, Copy, Check, ChevronDown } from 'lucide-react';
import { FinalAnswerChunk } from './types';
import { getModelById, getProviderById, AI_MODELS } from './data';

interface FinalAnswerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: FinalAnswerChunk[];
  onRemoveChunk: (chunkId: string) => void;
  onReorderChunks: (chunks: FinalAnswerChunk[]) => void;
  onMerge: (mergeModelId: string) => void;
}

const FinalAnswerDrawer: React.FC<FinalAnswerDrawerProps> = ({
  isOpen,
  onClose,
  chunks,
  onRemoveChunk,
  onReorderChunks,
  onMerge
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showMergeOptions, setShowMergeOptions] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCopyAll = async () => {
    const fullText = chunks.map(c => c.content).join('\n\n');
    await navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newChunks = [...chunks];
    const [removed] = newChunks.splice(draggedIndex, 1);
    newChunks.splice(index, 0, removed);
    
    // Update order numbers
    const reordered = newChunks.map((chunk, i) => ({ ...chunk, order: i }));
    onReorderChunks(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-foreground">Final Answer</h3>
          <span className="px-2 py-0.5 text-xs bg-muted-foreground/20 rounded-full">
            {chunks.length} chunks
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">No chunks added</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Click the + button on any response to add it to your final answer
            </p>
          </div>
        ) : (
          chunks.map((chunk, index) => {
            const model = getModelById(chunk.sourceModelId);
            const provider = model ? getProviderById(model.providerId) : null;
            
            return (
              <div
                key={chunk.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-3 bg-muted rounded-xl border transition-all cursor-move ${
                  draggedIndex === index 
                    ? 'border-emerald-500 opacity-50' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="p-1 text-muted-foreground hover:text-foreground cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: provider?.color }} className="text-sm">
                        {provider?.icon}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {model?.displayName}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onRemoveChunk(chunk.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Actions */}
      {chunks.length > 0 && (
        <div className="p-4 border-t border-border space-y-3">
          {/* Merge Options */}
          <div className="relative">
            <button
              onClick={() => setShowMergeOptions(!showMergeOptions)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Merge into One Answer
              <ChevronDown className={`w-4 h-4 transition-transform ${showMergeOptions ? 'rotate-180' : ''}`} />
            </button>
            
            {showMergeOptions && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-card border border-border rounded-xl shadow-xl">
                <p className="text-xs text-muted-foreground px-2 py-1 mb-1">Choose model to merge:</p>
                {AI_MODELS.slice(0, 4).map(model => {
                  const provider = getProviderById(model.providerId);
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onMerge(model.id);
                        setShowMergeOptions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span style={{ color: provider?.color }}>{provider?.icon}</span>
                      <span className="text-sm text-foreground">{model.displayName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Copy All */}
          <button
            onClick={handleCopyAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? 'Copied!' : 'Copy All'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FinalAnswerDrawer;
