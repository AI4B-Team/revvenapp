import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Link2, Unlink, Copy, Check, Loader2, Star, Plus, MessageSquare, ImageOff, FileX, AlertCircle, Eye, Wrench, Globe } from 'lucide-react';
import { PanelState, Message, LayoutMode, Attachment } from './types';
import { getModelById, getProviderById } from './data';
import ModelSelector from './ModelSelector';

// Provider logo/icon component
const ProviderIcon: React.FC<{ provider: ReturnType<typeof getProviderById>; size?: 'sm' | 'md' | 'lg' }> = ({ provider, size = 'md' }) => {
  if (!provider) return null;
  
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';
  const fontSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  
  // Use logo image if available (like for xAI/Grok)
  if (provider.logo) {
    return (
      <img 
        src={provider.logo} 
        alt={provider.name}
        className={`${sizeClass} object-contain`}
      />
    );
  }
  
  // Otherwise use the icon character with provider color
  return (
    <span 
      className={`${fontSize} font-bold`}
      style={{ color: provider.color }}
    >
      {provider.icon}
    </span>
  );
};

interface ChatPanelProps {
  panel: PanelState;
  onModelChange: (modelId: string) => void;
  onExpand: () => void;
  onToggleSync: () => void;
  onSelectWinner: (messageId: string) => void;
  onAddToFinal: (content: string, modelId: string, roundId: string) => void;
  onFollowUp: (prompt: string) => void;
  layoutMode: LayoutMode;
  currentRoundId?: string;
  attachments?: Attachment[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  panel,
  onModelChange,
  onExpand,
  onToggleSync,
  onSelectWinner,
  onAddToFinal,
  onFollowUp,
  layoutMode,
  currentRoundId,
  attachments = []
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

  // Check for unsupported attachments
  const unsupportedAttachments = attachments.filter(att => {
    if (att.type === 'image' && !model?.supportsVision) return true;
    if (att.type === 'file' && !model?.supportsFiles) return true;
    return false;
  });

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'fast': return { label: 'Fast', color: 'text-amber-500 bg-amber-500/10' };
      case 'balanced': return { label: 'Balanced', color: 'text-blue-500 bg-blue-500/10' };
      case 'deep': return { label: 'Deep', color: 'text-purple-500 bg-purple-500/10' };
      default: return null;
    }
  };

  const tierInfo = getTierLabel(model?.tier);

  return (
    <div className={`flex flex-col bg-card border border-border rounded-2xl transition-all duration-300 ${
      panel.isExpanded ? 'col-span-full row-span-full' : ''
    }`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted rounded-t-2xl relative z-50">
        <div className="flex items-center gap-2">
          <ModelSelector
            selectedModelId={panel.modelId}
            onSelect={onModelChange}
            isOpen={isModelSelectorOpen}
            onToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            onClose={() => setIsModelSelectorOpen(false)}
            compact={layoutMode >= 3}
          />
          
          {tierInfo && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tierInfo.color}`}>
              {tierInfo.label}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sync Badge */}
          <button
            onClick={onToggleSync}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              panel.isSynced 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                : 'bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20'
            }`}
          >
            {panel.isSynced ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
            <span className="text-xs">{panel.isSynced ? 'Synced' : 'Custom'}</span>
          </button>
          
          {/* Capability badges */}
          {model?.supportsVision && (
            <span className="p-1.5 bg-muted/80 rounded-lg" title="Supports vision">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          {model?.capabilities.includes('tools') && (
            <span className="p-1.5 bg-muted/80 rounded-lg" title="Tool use">
              <Wrench className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          
          <button
            onClick={onExpand}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Unsupported Attachments Warning */}
      {unsupportedAttachments.length > 0 && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-500 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {unsupportedAttachments.map(att => (
                <span key={att.id} className="inline-flex items-center gap-1 mr-2">
                  {att.type === 'image' ? <ImageOff className="w-3 h-3" /> : <FileX className="w-3 h-3" />}
                  {att.type === 'image' ? 'Image' : 'File'} not supported
                </span>
              ))}
            </span>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {panel.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${provider?.color}15` }}
            >
              <ProviderIcon provider={provider} size="lg" />
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
                    <ProviderIcon provider={provider} size="sm" />
                    <span className="text-xs font-medium text-muted-foreground">{model?.displayName}</span>
                    {message.isWinner && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-500 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        Winner
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  } ${message.isWinner ? 'ring-2 ring-amber-500/50' : ''}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Message Actions */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1.5 ml-1">
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Copy"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onSelectWinner(message.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        message.isWinner 
                          ? 'text-amber-500 bg-amber-500/10' 
                          : 'text-muted-foreground hover:text-amber-500 hover:bg-muted'
                      }`}
                      title="Pick as winner"
                    >
                      <Star className={`w-3.5 h-3.5 ${message.isWinner ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => onAddToFinal(message.content, panel.modelId, message.roundId || '')}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-500 hover:bg-muted transition-colors"
                      title="Add to final answer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const followUp = prompt('Enter follow-up for this model:');
                        if (followUp) onFollowUp(followUp);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Ask follow-up (this model only)"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
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

export default ChatPanel;
