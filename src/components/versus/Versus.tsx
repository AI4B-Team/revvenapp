import React, { useState, useCallback } from 'react';
import { Send, Columns2, Columns3, Grid2X2, Settings2, Sparkles, Link2, Paperclip, RotateCcw, Loader2, Mic, Star, Plus, X, Check } from 'lucide-react';
import { PanelState, Message, LayoutMode, Round, FinalAnswerChunk, Attachment, StyleMode, OutputFormat } from './types';
import { getModelById, generateId, simulateAIResponse } from './data';
import ChatPanel from './ChatPanel';
import RoundHistory from './RoundHistory';
import FinalAnswerDrawer from './FinalAnswerDrawer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Versus: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);
  const [panels, setPanels] = useState<PanelState[]>([
    { id: generateId(), modelId: 'gpt-5', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'claude-opus-4', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'gemini-2-ultra', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'grok-3', messages: [], isLoading: false, isExpanded: false, isSynced: true },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const [finalAnswerChunks, setFinalAnswerChunks] = useState<FinalAnswerChunk[]>([]);
  const [isFinalDrawerOpen, setIsFinalDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentWinnerId, setCurrentWinnerId] = useState<string | null>(null);

  // Speech recognition with live transcription
  const handleSpeechResult = useCallback((transcript: string) => {
    setInputValue(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening, cancelListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    continuous: true,
    interimResults: true,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(inputValue);
    }
  };

  const handleCancelRecording = () => {
    cancelListening();
    setInputValue('');
  };

  const visiblePanels = panels.slice(0, layoutMode);
  const syncedCount = visiblePanels.filter(p => p.isSynced).length;
  const customCount = visiblePanels.filter(p => !p.isSynced).length;

  const handleModelChange = (panelId: string, modelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, modelId } : p
    ));
  };

  const handleToggleSync = (panelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, isSynced: !p.isSynced } : p
    ));
  };

  const handleExpand = (panelId: string) => {
    setPanels(prev => prev.map(p => ({
      ...p,
      isExpanded: p.id === panelId ? !p.isExpanded : false
    })));
  };

  const handleSelectWinner = useCallback((messageId: string, panelId: string) => {
    setPanels(prev => prev.map(p => ({
      ...p,
      messages: p.messages.map(m => ({
        ...m,
        isWinner: m.id === messageId
      }))
    })));
    setCurrentWinnerId(panelId);
    
    if (rounds.length > 0) {
      setRounds(prev => prev.map((r, i) => 
        i === prev.length - 1 ? { ...r, winnerId: panelId } : r
      ));
    }
  }, [rounds.length]);

  const handleAddToFinal = useCallback((content: string, modelId: string, roundId: string) => {
    const newChunk: FinalAnswerChunk = {
      id: generateId(),
      content,
      sourceModelId: modelId,
      sourceRoundId: roundId,
      order: finalAnswerChunks.length,
    };
    setFinalAnswerChunks(prev => [...prev, newChunk]);
    setIsFinalDrawerOpen(true);
  }, [finalAnswerChunks.length]);

  const handleFollowUp = useCallback(async (panelId: string, prompt: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setPanels(prev => prev.map(p => 
      p.id === panelId 
        ? { ...p, messages: [...p.messages, userMessage], isLoading: true }
        : p
    ));

    await simulateAIResponse(panel.modelId, prompt, (chunk) => {
      setPanels(prev => prev.map(p => {
        if (p.id !== panelId) return p;
        const existingMessages = p.messages.filter(m => m.id !== `temp-${panelId}`);
        return {
          ...p,
          messages: [...existingMessages, {
            id: `temp-${panelId}`,
            role: 'assistant' as const,
            content: chunk,
            timestamp: new Date(),
            modelId: panel.modelId
          }]
        };
      }));
    });

    setPanels(prev => prev.map(p => {
      if (p.id !== panelId) return p;
      const finalMessages = p.messages.map(m => 
        m.id === `temp-${panelId}` ? { ...m, id: generateId() } : m
      );
      return { ...p, messages: finalMessages, isLoading: false };
    }));
  }, [panels]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const roundId = generateId();
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      roundId,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const newRound: Round = {
      id: roundId,
      prompt: inputValue.trim(),
      attachments: [...attachments],
      responses: [],
      timestamp: new Date(),
      isLocked: false,
    };

    setPanels(prev => prev.map((p, i) => 
      i < layoutMode && p.isSynced
        ? { ...p, messages: [...p.messages, userMessage], isLoading: true }
        : p
    ));

    setInputValue('');
    setAttachments([]);
    setRounds(prev => [...prev, newRound]);

    const responses: Round['responses'] = [];
    
    for (let i = 0; i < layoutMode; i++) {
      const panel = panels[i];
      if (!panel.isSynced) continue;
      
      let responseContent = '';
      
      await simulateAIResponse(panel.modelId, userMessage.content, (chunk) => {
        responseContent = chunk;
        setPanels(prev => prev.map((p, idx) => {
          if (idx !== i) return p;
          const existingMessages = p.messages.filter(m => m.id !== `temp-${panel.id}`);
          return {
            ...p,
            messages: [...existingMessages, {
              id: `temp-${panel.id}`,
              role: 'assistant' as const,
              content: chunk,
              timestamp: new Date(),
              modelId: panel.modelId,
              roundId,
            }]
          };
        }));
      });

      responses.push({
        panelId: panel.id,
        modelId: panel.modelId,
        content: responseContent,
        isComplete: true,
      });

      setPanels(prev => prev.map((p, idx) => {
        if (idx !== i) return p;
        const finalMessages = p.messages.map(m => 
          m.id === `temp-${panel.id}` ? { ...m, id: generateId() } : m
        );
        return { ...p, messages: finalMessages, isLoading: false };
      }));
    }

    setRounds(prev => prev.map(r => 
      r.id === roundId ? { ...r, responses } : r
    ));
  };

  const handleClearAll = () => {
    setPanels(prev => prev.map(p => ({ ...p, messages: [], isLoading: false })));
    setRounds([]);
    setCurrentWinnerId(null);
  };

  const handleClearRound = (roundId: string) => {
    setRounds(prev => prev.filter(r => r.id !== roundId));
  };

  const handleLockRound = (roundId: string) => {
    setRounds(prev => prev.map(r => 
      r.id === roundId ? { ...r, isLocked: !r.isLocked } : r
    ));
  };

  const handleMerge = async (mergeModelId: string) => {
    const chunksText = finalAnswerChunks.map(c => c.content).join('\n\n---\n\n');
    console.log('Merging with model:', mergeModelId, 'Prompt:', chunksText);
  };

  const getGridClass = () => {
    switch (layoutMode) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 lg:grid-cols-2';
      case 3: return 'grid-cols-1 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  const winnerModel = currentWinnerId ? getModelById(panels.find(p => p.id === currentWinnerId)?.modelId || '') : null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1 max-w-[1800px] mx-auto p-4 w-full">
          {/* Top Controls - inline with panels */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {winnerModel && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm text-amber-500 font-medium">Winner: {winnerModel.displayName}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFinalDrawerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Final Answer</span>
                {finalAnswerChunks.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-emerald-500 text-white rounded-full">
                    {finalAnswerChunks.length}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                {[1, 2, 3, 4].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLayoutMode(mode as LayoutMode)}
                    className={`p-2 rounded-lg transition-colors ${layoutMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {mode === 1 && <div className="w-5 h-5 border-2 border-current rounded-sm" />}
                    {mode === 2 && <Columns2 className="w-5 h-5" />}
                    {mode === 3 && <Columns3 className="w-5 h-5" />}
                    {mode === 4 && <Grid2X2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {rounds.length > 0 && (
            <div className="mb-4">
              <RoundHistory
                rounds={rounds}
                onLockRound={handleLockRound}
                onClearRound={handleClearRound}
                expandedRoundId={expandedRoundId}
                onToggleExpand={setExpandedRoundId}
              />
            </div>
          )}

          <div className={`grid ${getGridClass()} gap-4 mb-6`}>
            {visiblePanels.map(panel => (
              <ChatPanel
                key={panel.id}
                panel={panel}
                onModelChange={(modelId) => handleModelChange(panel.id, modelId)}
                onExpand={() => handleExpand(panel.id)}
                onToggleSync={() => handleToggleSync(panel.id)}
                onSelectWinner={(messageId) => handleSelectWinner(messageId, panel.id)}
                onAddToFinal={handleAddToFinal}
                onFollowUp={(prompt) => handleFollowUp(panel.id, prompt)}
                layoutMode={layoutMode}
                attachments={attachments}
              />
            ))}
          </div>
        </main>

        {/* Input Area - positioned at bottom */}
        <div className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-card border-2 border-emerald-500/50 rounded-2xl shadow-lg shadow-emerald-500/10">
              {/* Header row with sync badge and clear */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Synced</span>
                  </div>
                  
                  {customCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Sending to: {syncedCount} synced, {customCount} custom
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              {/* Input row */}
              <div className="px-4 pb-4 flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Send a message to compare models..."
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none resize-none transition-all"
                    style={{ minHeight: '120px', maxHeight: '300px' }}
                  />
                </div>
                
                <div className="flex items-center justify-between pb-1">
                  <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                  {/* Mic Button with Audio Waves like Create app */}
                  {isSupported && (
                    isListening ? (
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleCancelRecording}
                              className="p-2 rounded-xl transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                            >
                              <X size={18} className="text-red-500" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                        
                        {/* Audio Wave Animation */}
                        <div className="flex items-center gap-[2px] px-2">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="w-[2px] bg-red-400 rounded-full origin-center"
                              style={{
                                height: '16px',
                                animation: 'audioWave 0.6s ease-in-out infinite',
                                animationDelay: `${i * 0.05}s`,
                              }}
                            />
                          ))}
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleMicClick}
                              className="p-2 rounded-xl transition-colors bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                            >
                              <Check size={18} className="text-green-600" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Done</TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={handleMicClick}
                            className="p-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Speak</TooltipContent>
                      </Tooltip>
                    )
                  )}
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FinalAnswerDrawer
          isOpen={isFinalDrawerOpen}
          onClose={() => setIsFinalDrawerOpen(false)}
          chunks={finalAnswerChunks}
          onRemoveChunk={(id) => setFinalAnswerChunks(prev => prev.filter(c => c.id !== id))}
          onReorderChunks={setFinalAnswerChunks}
          onMerge={handleMerge}
        />
        
        {/* Audio Wave Animation Keyframes */}
        <style>{`
          @keyframes audioWave {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
};

export default Versus;
