import React, { useState, useCallback } from 'react';
import { Send, Columns2, Columns3, Grid2X2, Settings2, Sparkles, MessageSquare, Zap, Link2, Unlink, Paperclip, RotateCcw, Loader2, Mic, MicOff, Star, Plus, X, SlidersHorizontal } from 'lucide-react';
import { PanelState, Message, LayoutMode, Round, FinalAnswerChunk, Attachment, StyleMode, OutputFormat } from './types';
import { AI_MODELS, getModelById, getProviderById, generateId, simulateAIResponse } from './data';
import ChatPanel from './ChatPanel';
import RoundHistory from './RoundHistory';
import FinalAnswerDrawer from './FinalAnswerDrawer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const Versus: React.FC = () => {
  // Layout and panel state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);
  const [panels, setPanels] = useState<PanelState[]>([
    { id: generateId(), modelId: 'gpt-5', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'claude-opus-4', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'gemini-2-ultra', messages: [], isLoading: false, isExpanded: false, isSynced: true },
    { id: generateId(), modelId: 'grok-3', messages: [], isLoading: false, isExpanded: false, isSynced: true },
  ]);
  
  // Input state
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Rounds and history
  const [rounds, setRounds] = useState<Round[]>([]);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  
  // Final answer builder
  const [finalAnswerChunks, setFinalAnswerChunks] = useState<FinalAnswerChunk[]>([]);
  const [isFinalDrawerOpen, setIsFinalDrawerOpen] = useState(false);
  
  // Settings
  const [systemInstructions, setSystemInstructions] = useState('');
  const [styleMode, setStyleMode] = useState<StyleMode>('balanced');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('auto');
  const [showSettings, setShowSettings] = useState(false);
  
  // Winner tracking
  const [currentWinnerId, setCurrentWinnerId] = useState<string | null>(null);

  // Speech recognition
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => setInputValue(transcript),
    continuous: true,
    interimResults: true,
  });

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
    
    // Update current round winner
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

    // Create new round
    const newRound: Round = {
      id: roundId,
      prompt: inputValue.trim(),
      attachments: [...attachments],
      responses: [],
      timestamp: new Date(),
      isLocked: false,
    };

    // Add user message to synced panels only
    setPanels(prev => prev.map((p, i) => 
      i < layoutMode && p.isSynced
        ? { ...p, messages: [...p.messages, userMessage], isLoading: true }
        : p
    ));

    setInputValue('');
    setAttachments([]);
    setRounds(prev => [...prev, newRound]);

    // Generate responses for each synced panel
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

    // Update round with responses
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
    const mergePrompt = `Please merge and synthesize these responses into one coherent answer:\n\n${chunksText}`;
    
    // This would call the API to merge - for now just simulate
    console.log('Merging with model:', mergeModelId, 'Prompt:', mergePrompt);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(inputValue);
    }
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Versus</h1>
                <p className="text-xs text-muted-foreground">Compare AI models side by side</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Winner Banner */}
              {winnerModel && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm text-amber-500 font-medium">Winner: {winnerModel.displayName}</span>
                </div>
              )}
              
              {/* Final Answer Button */}
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

              {/* Layout Toggles */}
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
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4">
        {/* Round History */}
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

        {/* Chat Panels Grid */}
        <div className={`grid ${getGridClass()} gap-4 mb-4`}>
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

        {/* Input Area */}
        <div className="sticky bottom-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border-2 border-emerald-500/50 rounded-2xl shadow-lg shadow-emerald-500/10 overflow-hidden">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
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

              {/* Input Field */}
              <div className="p-4">
                <div className="flex items-end gap-3">
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
                      rows={1}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                      style={{ minHeight: '48px', maxHeight: '200px' }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    {isSupported && (
                      <button
                        onClick={handleMicToggle}
                        className={`p-3 rounded-xl border transition-colors ${
                          isListening
                            ? 'bg-red-500 border-red-500 text-white animate-pulse'
                            : 'bg-muted hover:bg-muted/80 border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
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
      </main>

      {/* Final Answer Drawer */}
      <FinalAnswerDrawer
        isOpen={isFinalDrawerOpen}
        onClose={() => setIsFinalDrawerOpen(false)}
        chunks={finalAnswerChunks}
        onRemoveChunk={(id) => setFinalAnswerChunks(prev => prev.filter(c => c.id !== id))}
        onReorderChunks={setFinalAnswerChunks}
        onMerge={handleMerge}
      />
    </div>
  );
};

export default Versus;
