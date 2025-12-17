import React, { useState, useRef, useEffect } from 'react';
import { Send, Columns2, Columns3, Grid2X2, Maximize2, Settings2, Sparkles, MessageSquare, Zap, ChevronDown, X, Link2, Unlink, Paperclip, RotateCcw, Copy, Check, Loader2 } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AIProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface AIModel {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  capabilities: string[];
  description?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelId?: string;
}

interface PanelState {
  id: string;
  modelId: string;
  messages: Message[];
  isLoading: boolean;
  isExpanded: boolean;
}

type LayoutMode = 1 | 2 | 3 | 4;

// ============================================================================
// MOCK DATA - Replace with your actual API integration
// ============================================================================

const AI_PROVIDERS: AIProvider[] = [
  { id: 'openai', name: 'OpenAI', icon: '◎', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', icon: '◈', color: '#d4a574' },
  { id: 'google', name: 'Google', icon: '✦', color: '#4285f4' },
  { id: 'xai', name: 'xAI', icon: '✕', color: '#1a1a1a' },
  { id: 'meta', name: 'Meta', icon: '∞', color: '#0668E1' },
  { id: 'mistral', name: 'Mistral', icon: '▣', color: '#ff7000' },
  { id: 'perplexity', name: 'Perplexity', icon: '◉', color: '#20b8cd' },
];

const AI_MODELS: AIModel[] = [
  // OpenAI
  { id: 'gpt-5', providerId: 'openai', name: 'GPT-5', displayName: 'GPT-5', capabilities: ['thinking', 'vision', 'code'] },
  { id: 'gpt-5-turbo', providerId: 'openai', name: 'GPT-5 Turbo', displayName: 'GPT-5 Turbo', capabilities: ['fast', 'vision'] },
  { id: 'gpt-4o', providerId: 'openai', name: 'GPT-4o', displayName: 'GPT-4o', capabilities: ['vision', 'audio'] },
  { id: 'o1-pro', providerId: 'openai', name: 'o1 Pro', displayName: 'o1 Pro', capabilities: ['thinking', 'reasoning'] },
  
  // Anthropic
  { id: 'claude-opus-4', providerId: 'anthropic', name: 'Claude Opus 4', displayName: 'Claude Opus 4', capabilities: ['thinking', 'vision', 'code'] },
  { id: 'claude-sonnet-4', providerId: 'anthropic', name: 'Claude Sonnet 4', displayName: 'Claude Sonnet 4', capabilities: ['fast', 'vision', 'code'] },
  { id: 'claude-haiku-4', providerId: 'anthropic', name: 'Claude Haiku 4', displayName: 'Claude Haiku 4', capabilities: ['fast', 'efficient'] },
  
  // Google
  { id: 'gemini-2-ultra', providerId: 'google', name: 'Gemini 2 Ultra', displayName: 'Gemini 2 Ultra', capabilities: ['thinking', 'vision', 'code'] },
  { id: 'gemini-2-flash', providerId: 'google', name: 'Gemini 2.5 Flash', displayName: 'Gemini 2.5 Flash', capabilities: ['fast', 'vision'] },
  
  // xAI
  { id: 'grok-3', providerId: 'xai', name: 'Grok-3', displayName: 'Grok-3', capabilities: ['thinking', 'realtime'] },
  
  // Meta
  { id: 'llama-4-405b', providerId: 'meta', name: 'Llama 4 405B', displayName: 'Llama 4 405B', capabilities: ['open-source', 'code'] },
  
  // Mistral
  { id: 'mistral-large', providerId: 'mistral', name: 'Mistral Large', displayName: 'Mistral Large', capabilities: ['multilingual', 'code'] },
  
  // Perplexity
  { id: 'sonar-pro', providerId: 'perplexity', name: 'Sonar Pro', displayName: 'Sonar Pro', capabilities: ['search', 'citations'] },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const getModelById = (modelId: string) => AI_MODELS.find(m => m.id === modelId);
const getProviderById = (providerId: string) => AI_PROVIDERS.find(p => p.id === providerId);

// Simulated AI response - Replace with actual API calls
const simulateAIResponse = async (
  modelId: string, 
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const model = getModelById(modelId);
  const responses = [
    `As ${model?.displayName}, I'd approach this by analyzing the key factors at play. `,
    `Let me break this down systematically. First, we need to consider the underlying assumptions. `,
    `This is an interesting challenge. From my perspective, the optimal solution involves several steps. `,
    `Based on my training and capabilities, here's my analysis of your request. `,
  ];
  
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  const fullResponse = baseResponse + `The question "${prompt.substring(0, 50)}..." touches on important concepts. I believe the best approach would be to consider multiple perspectives and synthesize them into a coherent framework. This allows us to address both the immediate concerns and the broader implications. Let me elaborate on the key points that stand out to me...`;
  
  // Simulate streaming
  for (let i = 0; i < fullResponse.length; i += 3) {
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    onChunk(fullResponse.substring(0, i + 3));
  }
  
  return fullResponse;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ModelSelectorProps {
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelect,
  isOpen,
  onToggle,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedModel = getModelById(selectedModelId);
  const selectedModelProvider = selectedModel ? getProviderById(selectedModel.providerId) : null;
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  const filteredModels = AI_MODELS.filter(model => {
    const matchesSearch = model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = !selectedProvider || model.providerId === selectedProvider;
    return matchesSearch && matchesProvider;
  });
  
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.providerId]) acc[model.providerId] = [];
    acc[model.providerId].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-all duration-200 group"
      >
        <span 
          className="text-lg"
          style={{ color: selectedModelProvider?.color }}
        >
          {selectedModelProvider?.icon}
        </span>
        <span className="text-sm font-medium text-foreground">
          {selectedModelProvider?.name}: {selectedModel?.displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>
          
          {/* Provider Filter */}
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Providers</p>
            <div className="flex flex-wrap gap-1.5">
              {AI_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    selectedProvider === provider.id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                  }`}
                >
                  <span style={{ color: provider.color }}>{provider.icon}</span>
                  {provider.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Model List */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedModels).map(([providerId, models]) => {
              const provider = getProviderById(providerId);
              return (
                <div key={providerId}>
                  <div className="px-3 py-2 bg-muted border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <span style={{ color: provider?.color }}>{provider?.icon}</span>
                      {provider?.name}
                    </p>
                  </div>
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model.id);
                        onClose();
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors ${
                        model.id === selectedModelId ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-left">
                        <p className={`text-sm font-medium ${model.id === selectedModelId ? 'text-primary' : 'text-foreground'}`}>
                          {model.displayName}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {model.capabilities.slice(0, 2).map(cap => (
                          <span key={cap} className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatPanelProps {
  panel: PanelState;
  onModelChange: (modelId: string) => void;
  onExpand: () => void;
  isLinked: boolean;
  layoutMode: LayoutMode;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  panel,
  onModelChange,
  onExpand,
  isLinked,
  layoutMode
}) => {
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const model = getModelById(panel.modelId);
  const provider = model ? getProviderById(model.providerId) : null;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [panel.messages]);
  
  const handleCopy = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 ${
      panel.isExpanded ? 'col-span-full row-span-full' : ''
    }`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
        <ModelSelector
          selectedModelId={panel.modelId}
          onSelect={onModelChange}
          isOpen={isModelSelectorOpen}
          onToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
          onClose={() => setIsModelSelectorOpen(false)}
        />
        
        <div className="flex items-center gap-2">
          {isLinked && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
              <Link2 className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary">Synced</span>
            </div>
          )}
          <button
            onClick={onExpand}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {panel.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: `${provider?.color}15`, color: provider?.color }}
            >
              {provider?.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{model?.displayName}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Send a message to start chatting with this model
            </p>
          </div>
        ) : (
          panel.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ color: provider?.color }}>{provider?.icon}</span>
                    <span className="text-xs font-medium text-muted-foreground">{model?.displayName}</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-1.5 ml-1">
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {panel.isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Generating response...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Versus: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);
  const [panels, setPanels] = useState<PanelState[]>([
    { id: generateId(), modelId: 'gpt-5', messages: [], isLoading: false, isExpanded: false },
    { id: generateId(), modelId: 'claude-opus-4', messages: [], isLoading: false, isExpanded: false },
    { id: generateId(), modelId: 'gemini-2-ultra', messages: [], isLoading: false, isExpanded: false },
    { id: generateId(), modelId: 'grok-3', messages: [], isLoading: false, isExpanded: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLinked, setIsLinked] = useState(true);
  const [isInterModelMode, setIsInterModelMode] = useState(false);
  const [interModelRounds, setInterModelRounds] = useState(2);
  
  const visiblePanels = panels.slice(0, layoutMode);
  
  const handleModelChange = (panelId: string, modelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, modelId } : p
    ));
  };
  
  const handleExpand = (panelId: string) => {
    setPanels(prev => prev.map(p => ({
      ...p,
      isExpanded: p.id === panelId ? !p.isExpanded : false
    })));
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    // Add user message to all visible panels
    setPanels(prev => prev.map((p, i) => 
      i < layoutMode 
        ? { ...p, messages: [...p.messages, userMessage], isLoading: true }
        : p
    ));
    
    setInputValue('');
    
    // Generate responses for each panel
    for (let i = 0; i < layoutMode; i++) {
      const panel = panels[i];
      let responseContent = '';
      
      await simulateAIResponse(panel.modelId, userMessage.content, (chunk) => {
        responseContent = chunk;
        setPanels(prev => prev.map((p, idx) => {
          if (idx !== i) return p;
          const existingMessages = p.messages.filter(m => m.id !== `temp-${panel.id}`);
          return {
            ...p,
            messages: [
              ...existingMessages,
              {
                id: `temp-${panel.id}`,
                role: 'assistant' as const,
                content: chunk,
                timestamp: new Date(),
                modelId: panel.modelId
              }
            ]
          };
        }));
      });
      
      // Finalize response
      setPanels(prev => prev.map((p, idx) => {
        if (idx !== i) return p;
        const finalMessages = p.messages.map(m => 
          m.id === `temp-${panel.id}` 
            ? { ...m, id: generateId() }
            : m
        );
        return { ...p, messages: finalMessages, isLoading: false };
      }));
    }
    
    // Inter-model communication
    if (isInterModelMode && layoutMode >= 2) {
      for (let round = 0; round < interModelRounds; round++) {
        for (let i = 0; i < layoutMode; i++) {
          const currentPanel = panels[i];
          const otherPanelIndex = (i + 1) % layoutMode;
          const otherPanel = panels[otherPanelIndex];
          
          // Get last response from other panel
          const lastOtherResponse = panels[otherPanelIndex].messages
            .filter(m => m.role === 'assistant')
            .pop();
          
          if (!lastOtherResponse) continue;
          
          const otherModel = getModelById(otherPanel.modelId);
          const interPrompt = `[Responding to ${otherModel?.displayName}]: ${lastOtherResponse.content}`;
          
          setPanels(prev => prev.map((p, idx) => 
            idx === i ? { ...p, isLoading: true } : p
          ));
          
          await simulateAIResponse(currentPanel.modelId, interPrompt, (chunk) => {
            setPanels(prev => prev.map((p, idx) => {
              if (idx !== i) return p;
              const existingMessages = p.messages.filter(m => m.id !== `inter-${currentPanel.id}`);
              return {
                ...p,
                messages: [
                  ...existingMessages,
                  {
                    id: `inter-${currentPanel.id}`,
                    role: 'assistant' as const,
                    content: chunk,
                    timestamp: new Date(),
                    modelId: currentPanel.modelId
                  }
                ]
              };
            }));
          });
          
          setPanels(prev => prev.map((p, idx) => {
            if (idx !== i) return p;
            const finalMessages = p.messages.map(m => 
              m.id === `inter-${currentPanel.id}` 
                ? { ...m, id: generateId() }
                : m
            );
            return { ...p, messages: finalMessages, isLoading: false };
          }));
        }
      }
    }
  };
  
  const handleClearAll = () => {
    setPanels(prev => prev.map(p => ({ ...p, messages: [], isLoading: false })));
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">Versus</h1>
                  <p className="text-xs text-muted-foreground">Compare AI models side by side</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Layout Toggles */}
              <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                <button
                  onClick={() => setLayoutMode(1)}
                  className={`p-2 rounded-lg transition-colors ${layoutMode === 1 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Single view"
                >
                  <div className="w-5 h-5 border-2 border-current rounded-sm" />
                </button>
                <button
                  onClick={() => setLayoutMode(2)}
                  className={`p-2 rounded-lg transition-colors ${layoutMode === 2 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Two columns"
                >
                  <Columns2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLayoutMode(3)}
                  className={`p-2 rounded-lg transition-colors ${layoutMode === 3 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Three columns"
                >
                  <Columns3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLayoutMode(4)}
                  className={`p-2 rounded-lg transition-colors ${layoutMode === 4 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Four columns"
                >
                  <Grid2X2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Settings */}
              <button className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4">
        {/* Chat Panels Grid */}
        <div className={`grid ${getGridClass()} gap-4 mb-4`}>
          {visiblePanels.map(panel => (
            <ChatPanel
              key={panel.id}
              panel={panel}
              onModelChange={(modelId) => handleModelChange(panel.id, modelId)}
              onExpand={() => handleExpand(panel.id)}
              isLinked={isLinked}
              layoutMode={layoutMode}
            />
          ))}
        </div>
        
        {/* Input Area */}
        <div className="sticky bottom-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Inter-model Communication Toggle */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLinked(!isLinked)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isLinked 
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {isLinked ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                    {isLinked ? 'Synced' : 'Independent'}
                  </button>
                  
                  <button
                    onClick={() => setIsInterModelMode(!isInterModelMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isInterModelMode 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inter-Model Chat
                    {isInterModelMode && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-500/30 rounded">
                        {interModelRounds} rounds
                      </span>
                    )}
                  </button>
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
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                      style={{ minHeight: '48px', maxHeight: '200px' }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="p-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Toolbar */}
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Zap className="w-4 h-4 text-amber-500" />
                    3 Toolkits
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-3">
              Response quality and speed may vary by model.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Versus;
